
import csv
from pathlib import Path

from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Service


# Locate the project's data folder
DATA_DIR = Path(__file__).resolve().parents[2] / "data"


def seed_services():
    services = {}

    # Read all cleaned CSV files
    csv_files = list(DATA_DIR.glob("*_cleaned.csv"))

    if not csv_files:
        print("No cleaned CSV files found in the data folder.")
        return

    for file_path in csv_files:
        with open(file_path, "r", encoding="utf-8-sig", newline="") as file:
            reader = csv.DictReader(file)

            for row in reader:
                service_id = row["service_id"].strip()
                service_name = row["service_name"].strip()

                if service_id and service_name:
                    if service_id in services:
                        if services[service_id] != service_name:
                            raise ValueError(
                                f"Conflicting names for {service_id}"
                            )
                    else:
                        services[service_id] = service_name

    # Insert services into PostgreSQL
    db: Session = SessionLocal()

    try:
        for service_id, service_name in services.items():
            existing_service = db.get(Service, service_id)

            if existing_service:
                existing_service.service_name = service_name
            else:
                db.add(
                    Service(
                        service_id=service_id,
                        service_name=service_name
                    )
                )

        db.commit()
        print(f"Successfully inserted/updated {len(services)} services.")

        for service_id, service_name in services.items():
            print(f"{service_id}: {service_name}")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_services()
