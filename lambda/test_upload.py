
import json

from lambda_function import lambda_handler


sample_csv = """service_id,service_name,timestamp,status_code,latency_ms,agent,region,quality_flags
svc-auth,auth-api,2026-11-22T10:00:00Z,200,120,agent-1,us-east,
svc-payments,payments-api,2026-11-22T10:01:00Z,500,250,agent-2,us-west,
svc-notify,notify-worker,2026-11-22T10:02:00Z,200,,agent-1,eu-west,
svc-search,search-api,2026-11-22T10:03:00Z,999,100,agent-3,us-east,
svc-reports,reports-api,2026-11-22T10:04:00Z,200,180,agent-2,eu-west,
"""


event = {
    "httpMethod": "POST",
    "body": json.dumps({
        "filename": "lambda_test_upload.csv",
        "csv_content": sample_csv
    }),
    "isBase64Encoded": False
}


response = lambda_handler(event, None)

print("\nHTTP STATUS:", response["statusCode"])
print("\nRESPONSE BODY:")
print(json.dumps(json.loads(response["body"]), indent=4))
