
import csv
from pathlib import Path
from datetime import datetime

from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import UploadBatch, MonitoringCheck


# Locate the project's data folder
DATA_DIR = Path(__file__).resolve().parents[2] / "data"


def parse_timestamp(value):
    """Convert ISO timestamp into a timezone-aware datetime."""
    return datetime.fromisoformat(
        value.strip().replace("Z", "+00:00")
    )


def import_file(file_path, db: Session):
    print(f"\nImporting: {file_path.name}")

    # Read all rows from the cleaned CSV
    with open(file_path, "r", encoding="utf-8-sig", newline="") as file:
        reader = csv.DictReader(file)
        rows = list(reader)

    # Create an upload batch for this file
    batch = UploadBatch(
        filename=file_path.name,
        total_rows=len(rows),
        accepted_rows=len(rows),
        rejected_rows=0,
        status="completed"
    )

    db.add(batch)
    db.flush()

    # Prepare monitoring records
    records = []

    for row in rows:
        record = MonitoringCheck(
            service_id=row["service_id"].strip(),
            upload_batch_id=batch.id,
            timestamp=parse_timestamp(row["timestamp"]),
            status_code=int(row["status_code"]),
            latency_ms=(
                float(row["latency_ms"])
                if row["latency_ms"].strip()
                else None
            ),
            agent=row["agent"].strip() or None,
            region=row["region"].strip() or None,
            quality_flags=row.get("quality_flags", "").strip() or None
        )

        records.append(record)

    # Insert records in batches of 1,000
    for start in range(0, len(records), 1000):
        db.add_all(records[start:start + 1000])
        db.flush()

    db.commit()

    print(f"Upload batch ID: {batch.id}")
    print(f"Records imported: {len(records)}")


def import_all_files():
    csv_files = sorted(DATA_DIR.glob("*_cleaned.csv"))

    if not csv_files:
        print("No cleaned CSV files found.")
        return

    db = SessionLocal()

    try:
        for file_path in csv_files:
            import_file(file_path, db)

        print("\nAll files imported successfully!")

    except Exception as error:
        db.rollback()
        print("\nImport failed!")
        print("Error:", error)
        raise

    finally:
        db.close()


if __name__ == "__main__":
    import_all_files()




