
import json
import base64

from csv_processor import process_csv
from db_writer import save_upload


def response(status_code, body):
    """Create a standard HTTP response."""

    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "OPTIONS,POST"
        },
        "body": json.dumps(body)
    }


def lambda_handler(event, context):
    """
    Main AWS Lambda entry point.

    Receives a CSV upload, processes it,
    and saves the results to PostgreSQL.
    """

    print("SLA Monitoring Lambda started.")

    try:
        # Handle browser CORS preflight request
        method = event.get("httpMethod") or event.get(
            "requestContext", {}
        ).get("http", {}).get("method")

        if method == "OPTIONS":
            return response(200, {"message": "CORS preflight successful"})

        # 1. Extract request body
        body = event.get("body")

        if not body:
            return response(400, {
                "error": "Request body is missing."
            })

        # 2. Decode body if API Gateway sends Base64
        if event.get("isBase64Encoded", False):
            body = base64.b64decode(body).decode("utf-8")

        # 3. Parse JSON request
        request_data = json.loads(body)

        filename = request_data.get("filename")
        csv_content = request_data.get("csv_content")

        if not filename or not csv_content:
            return response(400, {
                "error": "Both filename and csv_content are required."
            })

        # Basic filename validation
        if not filename.lower().endswith(".csv"):
            return response(400, {
                "error": "Only CSV files are supported."
            })

        # 4. Validate and clean CSV
        accepted, rejected, summary = process_csv(csv_content)

        # 5. Save results to PostgreSQL
        result = save_upload(
            filename,
            accepted,
            rejected,
            summary
        )

        print("Upload completed successfully.")

        return response(200, {
            "message": "CSV processed successfully.",
            **result
        })

    except json.JSONDecodeError:
        return response(400, {
            "error": "Invalid JSON request."
        })

    except ValueError as error:
        return response(400, {
            "error": str(error)
        })

    except Exception:
        print("Unexpected error while processing upload.")

        return response(500, {
            "error": "Internal server error while processing CSV."
        })
