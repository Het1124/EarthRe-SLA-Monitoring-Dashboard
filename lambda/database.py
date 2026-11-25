
import os

import psycopg
from dotenv import load_dotenv


# Load .env during local development.
# In AWS Lambda, environment variables will be configured in AWS.
load_dotenv()


def get_connection():
    """
    Establish a connection to Neon PostgreSQL.
    """

    database_url = os.getenv("DATABASE_URL")

    if not database_url:
        raise ValueError("DATABASE_URL environment variable is missing.")

    connection = psycopg.connect(
        database_url,
        connect_timeout=10
    )

    return connection
