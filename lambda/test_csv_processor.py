
from csv_processor import process_csv


# Sample CSV containing different types of records
sample_csv = """service_id,service_name,timestamp,status_code,latency_ms,agent,region,quality_flags
svc-auth,auth-api,2026-11-20T10:00:00Z,200,120,agent-1,us-east,
svc-payments,payments-api,2026-11-20T10:01:00Z,500,250,agent-2,us-west,
svc-notify,notify-worker,2026-11-20T10:02:00Z,200,,agent-1,eu-west,
svc-search,search-api,2026-11-20T10:03:00Z,999,100,agent-3,us-east,
svc-auth,auth-api,2026-11-20T10:00:00Z,200,120,agent-1,us-east,
unknown-service,unknown,2026-11-20T10:04:00Z,200,100,agent-1,us-east,
svc-reports,reports-api,2026-11-20T10:05:00Z,200,-50,agent-2,eu-west,
"""


accepted, rejected, summary = process_csv(sample_csv)


print("\nACCEPTED RECORDS:")
for record in accepted:
    print(record)


print("\nREJECTED RECORDS:")
for record in rejected:
    print(record)


print("\nSUMMARY:")
print(summary)
