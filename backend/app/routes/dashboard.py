
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, case

from app.database import SessionLocal
from app.models import (
    Service,
    UploadBatch,
    MonitoringCheck,
    RejectedRecord
)


router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"]
)


# Database session dependency
def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# Dashboard summary API
@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):

    # 1. Total monitoring checks
    total_checks = (
        db.query(func.count(MonitoringCheck.id)).scalar() or 0
    )

    # 2. Total monitored services
    total_services = (
        db.query(func.count(Service.service_id)).scalar() or 0
    )

    # 3. Count successful HTTP responses (200–299)
    successful_checks = (
        db.query(
            func.sum(
                case(
                    (
                        MonitoringCheck.status_code.between(200, 299),
                        1
                    ),
                    else_=0
                )
            )
        ).scalar() or 0
    )

    # 4. Calculate observed availability percentage
    availability = (
        (successful_checks / total_checks) * 100
        if total_checks > 0
        else 0
    )

    # 5. Average latency (NULL values are automatically ignored)
    average_latency = (
        db.query(func.avg(MonitoringCheck.latency_ms)).scalar()
    )

    # 6. Total CSV uploads
    total_uploads = (
        db.query(func.count(UploadBatch.id)).scalar() or 0
    )

    # 7. Total rejected records
    total_rejected = (
        db.query(func.count(RejectedRecord.id)).scalar() or 0
    )

    return {
        "total_checks": total_checks,
        "total_services": total_services,
        "successful_checks": int(successful_checks),
        "availability_percentage": round(availability, 2),
        "average_latency_ms": (
            round(float(average_latency), 2)
            if average_latency is not None
            else 0
        ),
        "total_uploads": total_uploads,
        "total_rejected": total_rejected
    }
