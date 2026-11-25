
import json
from datetime import datetime

from database import get_connection


def save_upload(filename, accepted_records, rejected_records, summary):
    """
    Save one processed CSV upload to PostgreSQL.

    All database changes happen in a single transaction.
    """

    connection = get_connection()

    try:
        with connection:
            with connection.cursor() as cursor:

                # 1. Create an upload batch
                cursor.execute(
                    """
                    INSERT INTO upload_batches (
                        filename,
                        total_rows,
                        accepted_rows,
                        rejected_rows,
                        status
                    )
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING id;
                    """,
                    (
                        filename,
                        summary["total_rows"],
                        summary["accepted_rows"],
                        summary["rejected_rows"],
                        "completed"
                    )
                )

                batch_id = cursor.fetchone()[0]

                # 2. Insert accepted monitoring records
                monitoring_rows = []

                for record in accepted_records:
                    timestamp = datetime.fromisoformat(
                        record["timestamp"]
                    )

                    monitoring_rows.append((
                        record["service_id"],
                        batch_id,
                        timestamp,
                        record["status_code"],
                        record["latency_ms"],
                        record["agent"],
                        record["region"],
                        record["quality_flags"]
                    ))

                if monitoring_rows:
                    cursor.executemany(
                        """
                        INSERT INTO monitoring_checks (
                            service_id,
                            upload_batch_id,
                            timestamp,
                            status_code,
                            latency_ms,
                            agent,
                            region,
                            quality_flags
                        )
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s);
                        """,
                        monitoring_rows
                    )

                # 3. Insert rejected records
                rejected_rows = []

                for record in rejected_records:
                    rejected_rows.append((
                        batch_id,
                        record["row_number"],
                        record["reason"],
                        json.dumps(
                            record["original_data"],
                            ensure_ascii=False
                        )
                    ))

                if rejected_rows:
                    cursor.executemany(
                        """
                        INSERT INTO rejected_records (
                            upload_batch_id,
                            row_number,
                            reason,
                            original_data
                        )
                        VALUES (%s, %s, %s, %s);
                        """,
                        rejected_rows
                    )

        # Transaction has committed successfully
        return {
            "upload_batch_id": batch_id,
            "total_rows": summary["total_rows"],
            "accepted_rows": summary["accepted_rows"],
            "rejected_rows": summary["rejected_rows"],
            "status": "completed"
        }

    finally:
        connection.close()
