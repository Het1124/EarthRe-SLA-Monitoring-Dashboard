
from database import get_connection


def test_database_connection():

    connection = None

    try:
        connection = get_connection()

        with connection.cursor() as cursor:
            cursor.execute("SELECT 1;")
            result = cursor.fetchone()

        print("Lambda database connection successful!")
        print("Test query result:", result[0])

    except Exception as error:
        print("Database connection failed!")
        print("Error:", error)

    finally:
        if connection:
            connection.close()


if __name__ == "__main__":
    test_database_connection()
