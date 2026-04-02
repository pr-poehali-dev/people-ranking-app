"""
Голосование за/против политика.
Каждый пользователь может проголосовать только один раз (защита по IP).
Возвращает актуальный рейтинг политика после голосования.
"""
import json
import os
import psycopg2


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def handler(event: dict, context) -> dict:
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": headers, "body": ""}

    schema = "t_p15533629_people_ranking_app"

    # GET — получить рейтинги всех политиков
    if event.get("httpMethod") == "GET":
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"""
            SELECT politician_id,
                   COUNT(*) FILTER (WHERE vote_type = 'up') AS up_count,
                   COUNT(*) FILTER (WHERE vote_type = 'down') AS down_count
            FROM {schema}.politician_votes
            GROUP BY politician_id
        """)
        rows = cur.fetchall()
        cur.close()
        conn.close()

        result = {}
        for row in rows:
            pid, up, down = row
            total = up + down
            result[str(pid)] = {
                "up": up,
                "down": down,
                "total": total,
                "rating": round((up / total) * 100) if total > 0 else 50,
            }

        return {"statusCode": 200, "headers": headers, "body": json.dumps(result)}

    # POST — проголосовать
    if event.get("httpMethod") == "POST":
        body = json.loads(event.get("body") or "{}")
        politician_id = body.get("politician_id")
        vote_type = body.get("vote_type")

        if politician_id is None or vote_type not in ("up", "down"):
            return {"statusCode": 400, "headers": headers, "body": json.dumps({"error": "Неверные данные"})}

        voter_ip = (
            event.get("requestContext", {}).get("identity", {}).get("sourceIp")
            or event.get("headers", {}).get("X-Forwarded-For", "unknown").split(",")[0].strip()
        )

        conn = get_conn()
        cur = conn.cursor()

        # Проверяем — голосовал ли уже
        cur.execute(
            f"SELECT vote_type FROM {schema}.politician_votes WHERE politician_id = %s AND voter_ip = %s",
            (politician_id, voter_ip),
        )
        existing = cur.fetchone()

        if existing:
            if existing[0] == vote_type:
                # Отмена голоса
                cur.execute(
                    f"DELETE FROM {schema}.politician_votes WHERE politician_id = %s AND voter_ip = %s",
                    (politician_id, voter_ip),
                )
                action = "removed"
            else:
                # Смена голоса
                cur.execute(
                    f"UPDATE {schema}.politician_votes SET vote_type = %s WHERE politician_id = %s AND voter_ip = %s",
                    (vote_type, politician_id, voter_ip),
                )
                action = "changed"
        else:
            cur.execute(
                f"INSERT INTO {schema}.politician_votes (politician_id, voter_ip, vote_type) VALUES (%s, %s, %s)",
                (politician_id, voter_ip, vote_type),
            )
            action = "added"

        conn.commit()

        # Актуальный счёт
        cur.execute(
            f"""
            SELECT
                COUNT(*) FILTER (WHERE vote_type = 'up') AS up_count,
                COUNT(*) FILTER (WHERE vote_type = 'down') AS down_count
            FROM {schema}.politician_votes
            WHERE politician_id = %s
            """,
            (politician_id,),
        )
        row = cur.fetchone()
        cur.close()
        conn.close()

        up, down = row
        total = up + down
        rating = round((up / total) * 100) if total > 0 else 50

        return {
            "statusCode": 200,
            "headers": headers,
            "body": json.dumps({
                "action": action,
                "politician_id": politician_id,
                "up": up,
                "down": down,
                "total": total,
                "rating": rating,
                "my_vote": None if action == "removed" else vote_type,
            }),
        }

    return {"statusCode": 405, "headers": headers, "body": json.dumps({"error": "Method not allowed"})}
