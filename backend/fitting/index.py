"""
Примерочная: ИИ-примерка одежды. Загружает фото пользователя и одежды,
отправляет в Polza.ai для виртуальной примерки.
"""
import json
import os
import base64
import uuid
import boto3
import psycopg2
import urllib.request


CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-User-Id, X-Auth-Token, X-Session-Id",
}


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    path = event.get("path", "/")

    if method == "GET" and "clothes" in path:
        return get_clothes(event)
    elif method == "POST":
        return create_fitting(event)
    elif method == "GET":
        return get_fitting_status(event)

    return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "Method not allowed"})}


def get_clothes(event: dict) -> dict:
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()
    cur.execute(
        "SELECT id, name, description, image_url, product_url, category FROM fitting_clothes WHERE is_active = TRUE ORDER BY id DESC"
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()

    items = [
        {"id": r[0], "name": r[1], "description": r[2], "imageUrl": r[3], "productUrl": r[4], "category": r[5]}
        for r in rows
    ]
    return {"statusCode": 200, "headers": CORS, "body": json.dumps({"clothes": items})}


def create_fitting(event: dict) -> dict:
    body = json.loads(event.get("body") or "{}")
    user_id = event.get("headers", {}).get("X-User-Id", "anonymous")

    user_photo_b64 = body.get("userPhoto", "")
    clothes_id = body.get("clothesId")
    custom_clothes_b64 = body.get("customClothesPhoto", "")

    if not user_photo_b64:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Загрузите своё фото"})}

    if not clothes_id and not custom_clothes_b64:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Выберите или загрузите фото одежды"})}

    s3 = boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )

    if "," in user_photo_b64:
        user_photo_b64 = user_photo_b64.split(",", 1)[1]
    user_img_key = f"fitting/{user_id}/user_{uuid.uuid4()}.jpg"
    s3.put_object(Bucket="files", Key=user_img_key, Body=base64.b64decode(user_photo_b64), ContentType="image/jpeg")
    user_photo_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{user_img_key}"

    clothes_img_url = None
    if clothes_id:
        conn = psycopg2.connect(os.environ["DATABASE_URL"])
        cur = conn.cursor()
        cur.execute("SELECT image_url FROM fitting_clothes WHERE id = %s", (clothes_id,))
        row = cur.fetchone()
        cur.close()
        conn.close()
        if row:
            clothes_img_url = row[0]
    elif custom_clothes_b64:
        if "," in custom_clothes_b64:
            custom_clothes_b64 = custom_clothes_b64.split(",", 1)[1]
        clothes_key = f"fitting/{user_id}/clothes_{uuid.uuid4()}.jpg"
        s3.put_object(Bucket="files", Key=clothes_key, Body=base64.b64decode(custom_clothes_b64), ContentType="image/jpeg")
        clothes_img_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{clothes_key}"

    api_key = os.environ.get("POLZA_API_KEY", "")
    polza_task_id = None

    if api_key and clothes_img_url:
        polza_task_id = _call_polza_fitting(api_key, user_photo_url, clothes_img_url)

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()
    cur.execute(
        """INSERT INTO fitting_orders (user_id, user_photo_url, clothes_id, custom_clothes_url, status, credits_spent)
           VALUES (%s, %s, %s, %s, %s, %s) RETURNING id""",
        (user_id, user_photo_url, clothes_id, clothes_img_url if not clothes_id else None,
         "processing" if polza_task_id else "pending", 5)
    )
    fitting_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    return {
        "statusCode": 200,
        "headers": CORS,
        "body": json.dumps({
            "fittingId": fitting_id,
            "polzaTaskId": polza_task_id,
            "status": "processing" if polza_task_id else "pending",
            "creditsSpent": 5,
        }),
    }


def get_fitting_status(event: dict) -> dict:
    params = event.get("queryStringParameters") or {}
    fitting_id = params.get("fittingId")

    if not fitting_id:
        return get_clothes(event)

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()
    cur.execute(
        "SELECT id, status, result_url, credits_spent, created_at FROM fitting_orders WHERE id = %s",
        (fitting_id,)
    )
    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row:
        return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Заявка не найдена"})}

    return {
        "statusCode": 200,
        "headers": CORS,
        "body": json.dumps({
            "fittingId": row[0],
            "status": row[1],
            "resultUrl": row[2],
            "creditsSpent": row[3],
            "createdAt": row[4].isoformat() if row[4] else None,
        }),
    }


def _call_polza_fitting(api_key: str, person_url: str, clothes_url: str) -> str | None:
    payload = json.dumps({
        "person_image_url": person_url,
        "clothes_image_url": clothes_url,
        "mode": "virtual_tryon",
    }).encode()

    req = urllib.request.Request(
        "https://api.polza.ai/v1/tryon",
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read())
            return data.get("task_id") or data.get("id")
    except Exception:
        return None
