"""
Управление каталогом одежды для Примерочной (только для администратора).
CRUD: добавить, удалить, обновить, получить список.
"""
import json
import os
import base64
import uuid
import boto3
import psycopg2


CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-User-Id, X-Auth-Token, X-Session-Id, X-Admin-Key",
}


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    item_id = params.get("id")

    if method == "GET":
        return list_clothes()
    elif method == "POST":
        return add_clothes(event)
    elif method == "PUT" and item_id:
        return update_clothes(event, item_id)
    elif method == "DELETE" and item_id:
        return delete_clothes(item_id)

    return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "Method not allowed"})}


def list_clothes() -> dict:
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()
    cur.execute(
        "SELECT id, name, description, image_url, product_url, category, is_active, created_at FROM fitting_clothes ORDER BY id DESC"
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()

    items = [
        {
            "id": r[0], "name": r[1], "description": r[2],
            "imageUrl": r[3], "productUrl": r[4], "category": r[5],
            "isActive": r[6], "createdAt": r[7].isoformat() if r[7] else None
        }
        for r in rows
    ]
    return {"statusCode": 200, "headers": CORS, "body": json.dumps({"clothes": items})}


def add_clothes(event: dict) -> dict:
    body = json.loads(event.get("body") or "{}")
    name = body.get("name", "").strip()
    description = body.get("description", "")
    product_url = body.get("productUrl", "")
    category = body.get("category", "")
    image_b64 = body.get("imageBase64", "")
    image_url = body.get("imageUrl", "")

    if not name:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Название обязательно"})}

    if image_b64:
        if "," in image_b64:
            image_b64 = image_b64.split(",", 1)[1]
        s3 = boto3.client(
            "s3",
            endpoint_url="https://bucket.poehali.dev",
            aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
            aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
        )
        key = f"clothes/{uuid.uuid4()}.jpg"
        s3.put_object(Bucket="files", Key=key, Body=base64.b64decode(image_b64), ContentType="image/jpeg")
        image_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"

    if not image_url:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Нужно фото одежды"})}

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()
    cur.execute(
        """INSERT INTO fitting_clothes (name, description, image_url, product_url, category)
           VALUES (%s, %s, %s, %s, %s) RETURNING id""",
        (name, description, image_url, product_url, category)
    )
    new_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    return {"statusCode": 200, "headers": CORS, "body": json.dumps({"id": new_id, "success": True})}


def update_clothes(event: dict, item_id: str) -> dict:
    body = json.loads(event.get("body") or "{}")
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()
    cur.execute(
        """UPDATE fitting_clothes SET
           name = COALESCE(%s, name),
           description = COALESCE(%s, description),
           product_url = COALESCE(%s, product_url),
           category = COALESCE(%s, category),
           is_active = COALESCE(%s, is_active)
           WHERE id = %s""",
        (body.get("name"), body.get("description"), body.get("productUrl"),
         body.get("category"), body.get("isActive"), item_id)
    )
    conn.commit()
    cur.close()
    conn.close()
    return {"statusCode": 200, "headers": CORS, "body": json.dumps({"success": True})}


def delete_clothes(item_id: str) -> dict:
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()
    cur.execute("UPDATE fitting_clothes SET is_active = FALSE WHERE id = %s", (item_id,))
    conn.commit()
    cur.close()
    conn.close()
    return {"statusCode": 200, "headers": CORS, "body": json.dumps({"success": True})}
