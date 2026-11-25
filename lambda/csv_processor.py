
import csv
import io
from datetime import datetime, timezone


# Only these five services are allowed
VALID_SERVICES = {
    "svc-auth",
    "svc-notify",
    "svc-payments",
    "svc-reports",
    "svc-search"
}

REQUIRED_COLUMNS = {
    "service_id",
    "timestamp",
    "status_code",
    "latency_ms",
    "agent",
    "region"
}


def parse_timestamp(value):
    """
    Supports ISO timestamps and Unix epoch seconds.
    Returns a timezone-aware UTC datetime.
    """

    value = value.strip()

    # Handle Unix epoch seconds
    if value.isdigit():
        timestamp = datetime.fromtimestamp(
            int(value),
            tz=timezone.utc
        )
        return timestamp

    # Handle ISO timestamps
    timestamp = datetime.fromisoformat(
        value.replace("Z", "+00:00")
    )

    # If timezone is missing, assume UTC
    if timestamp.tzinfo is None:
        timestamp = timestamp.replace(
            tzinfo=timezone.utc
        )

    return timestamp.astimezone(timezone.utc)


def process_csv(csv_content):
    """
    Validate and clean CSV content.

    Returns:
        accepted_records
        rejected_records
        summary
    """

    accepted_records = []
    rejected_records = []
    seen_records = set()

    reader = csv.DictReader(
        io.StringIO(csv_content)
    )

    if not reader.fieldnames:
        raise ValueError("CSV file is empty or has no header.")

    reader.fieldnames = [
        name.strip() for name in reader.fieldnames
    ]

    missing_columns = REQUIRED_COLUMNS - set(reader.fieldnames)

    if missing_columns:
        raise ValueError(
            f"Missing required columns: {sorted(missing_columns)}"
        )

    for row_number, row in enumerate(reader, start=2):

        try:
            service_id = row["service_id"].strip()

            # Validate service
            if service_id not in VALID_SERVICES:
                raise ValueError("Unknown service_id")

            # Validate timestamp
            timestamp = parse_timestamp(
                row["timestamp"]
            )

            # Validate HTTP status
            status_code = int(row["status_code"])

            if not 100 <= status_code <= 599:
                raise ValueError("Invalid HTTP status code")

            # Validate latency
            latency_value = row["latency_ms"].strip()

            quality_flags = []

            if latency_value:
                latency = float(latency_value)

                if latency < 0:
                    latency = None
                    quality_flags.append("negative_latency")

            else:
                latency = None
                quality_flags.append("missing_latency")

            # Identify duplicate observations
            duplicate_key = (
                service_id,
                timestamp.isoformat(),
                (row.get("agent") or "").strip(),
                (row.get("region") or "").strip()
            )

            if duplicate_key in seen_records:
                raise ValueError("Duplicate observation")

            seen_records.add(duplicate_key)

            # Build cleaned record
            record = {
                "service_id": service_id,
                "timestamp": timestamp.isoformat(),
                "status_code": status_code,
                "latency_ms": latency,
                "agent": (row.get("agent") or "").strip() or None,
                "region": (row.get("region") or "").strip() or None,
                "quality_flags": ",".join(quality_flags) or None
            }

            accepted_records.append(record)

        except (ValueError, TypeError, KeyError, OverflowError) as error:

            rejected_records.append({
                "row_number": row_number,
                "reason": str(error),
                "original_data": row
            })

    summary = {
        "total_rows": len(accepted_records) + len(rejected_records),
        "accepted_rows": len(accepted_records),
        "rejected_rows": len(rejected_records)
    }

    return accepted_records, rejected_records, summary
