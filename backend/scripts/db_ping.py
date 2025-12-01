"""
Quick Postgres connectivity check using psycopg2.

Usage:
    export DATABASE_URL="postgres://user:password@host:port/dbname?sslmode=require"
    python backend/scripts/db_ping.py
"""

import os
import psycopg2


def main() -> None:
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        raise SystemExit("DATABASE_URL is not set")

    with psycopg2.connect(database_url) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT VERSION()")
            version = cur.fetchone()[0]
            print(f"Connected. Postgres version: {version}")


if __name__ == "__main__":
    main()
