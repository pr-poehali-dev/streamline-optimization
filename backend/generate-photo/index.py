"""
Генерация нейрофотосессии через Polza.ai API.
Принимает base64-фото пользователя, стиль и параметры — возвращает задачу генерации.
"""
import json
import os
import base64
import uuid
import boto3
import psycopg2
import urllib.request
import urllib.error


CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-User-Id, X-Auth-Token, X-Session-Id",
}


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")

    if method == "POST":
        return create_order(event)
    elif method == "GET":
        return get_order_status(event)

    return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "Method not allowed"})}


def create_order(event: dict) -> dict:
    body = json.loads(event.get("body") or "{}")
    user_id = event.get("headers", {}).get("X-User-Id", "anonymous")

    style = body.get("style", "")
    custom_style = body.get("customStyle", "")
    background = body.get("background", "Студия")
    mood = body.get("mood", "Серьёзный")
    photo_count = int(body.get("photoCount", 1))
    photos_b64 = body.get("photos", [])

    if not photos_b64:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Нужно загрузить хотя бы одно фото"})}

    if not style and not custom_style:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Выберите или опишите стиль"})}

    s3 = boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )

    uploaded_urls = []
    for i, b64_str in enumerate(photos_b64[:20]):
        if "," in b64_str:
            b64_str = b64_str.split(",", 1)[1]
        image_data = base64.b64decode(b64_str)
        key = f"uploads/{user_id}/{uuid.uuid4()}.jpg"
        s3.put_object(Bucket="files", Key=key, Body=image_data, ContentType="image/jpeg")
        cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
        uploaded_urls.append(cdn_url)

    style_text = custom_style if custom_style else style
    prompt = _build_prompt(style_text, background, mood)

    api_key = os.environ.get("POLZA_API_KEY", "")
    polza_task_id = None

    if api_key:
        polza_task_id = _call_polza(api_key, uploaded_urls[0], prompt, photo_count)

    credits_spent = photo_count * 2

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()
    cur.execute(
        """INSERT INTO orders (user_id, style, custom_style, background, mood, photo_count, credits_spent, status)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id""",
        (user_id, style, custom_style, background, mood, photo_count, credits_spent,
         "processing" if polza_task_id else "pending")
    )
    order_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    return {
        "statusCode": 200,
        "headers": CORS,
        "body": json.dumps({
            "orderId": order_id,
            "polzaTaskId": polza_task_id,
            "status": "processing" if polza_task_id else "pending",
            "creditsSpent": credits_spent,
            "uploadedCount": len(uploaded_urls),
        }),
    }


def get_order_status(event: dict) -> dict:
    params = event.get("queryStringParameters") or {}
    order_id = params.get("orderId")

    if not order_id:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "orderId required"})}

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()
    cur.execute(
        "SELECT id, status, result_urls, credits_spent, created_at FROM orders WHERE id = %s",
        (order_id,)
    )
    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row:
        return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Заказ не найден"})}

    return {
        "statusCode": 200,
        "headers": CORS,
        "body": json.dumps({
            "orderId": row[0],
            "status": row[1],
            "resultUrls": row[2] or [],
            "creditsSpent": row[3],
            "createdAt": row[4].isoformat() if row[4] else None,
        }),
    }


def _build_prompt(style: str, background: str, mood: str) -> str:
    bg_map = {
        "Офис": "modern office interior background",
        "Студия": "clean studio background with soft lighting",
        "Город": "urban city street background",
        "Природа": "beautiful nature outdoor background",
        "Абстракция": "abstract artistic background",
        "Космос": "space nebula cosmic background",
    }
    mood_map = {
        "Серьёзный": "serious confident expression",
        "Улыбающийся": "warm friendly smile",
        "Задумчивый": "thoughtful contemplative look",
        "Энергичный": "energetic dynamic pose",
    }
    bg_text = bg_map.get(background, background)
    mood_text = mood_map.get(mood, mood)
    return f"Professional portrait photo, {style} style, {bg_text}, {mood_text}, photorealistic, high quality, 4K"


def _call_polza(api_key: str, image_url: str, prompt: str, count: int) -> str | None:
    payload = json.dumps({
        "prompt": prompt,
        "image_url": image_url,
        "num_images": min(count, 4),
        "style": "photorealistic",
    }).encode()

    req = urllib.request.Request(
        "https://api.polza.ai/v1/generate",
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
