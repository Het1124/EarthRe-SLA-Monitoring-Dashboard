
from datetime import date, datetime, time, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import MonitoringCheck, Service


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


@router.get("/logs")
def get_monitoring_logs(
    date_from: date | None = None,
    date_to: date | None = None,
    service_id: str | None = None,
    status_code: int | None = None,
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db)
):

    # Validate the requested date range
    if date_from and date_to and date_from > date_to:
        raise HTTPException(
            status_code=400,
            detail="date_from cannot be later than date_to."
        )

    # Start with all monitoring records
    query = (
        db.query(MonitoringCheck, Service.service_name)
        .join(
            Service,
            MonitoringCheck.service_id == Service.service_id
        )
    )

    # Filter by starting date
    if date_from:
        start_datetime = datetime.combine(
            date_from,
            time.min,
            tzinfo=timezone.utc
        )

        query = query.filter(
            MonitoringCheck.timestamp >= start_datetime
        )

    # Filter by ending date (inclusive)
    if date_to:
        end_datetime = datetime.combine(
            date_to + timedelta(days=1),
            time.min,
            tzinfo=timezone.utc
        )

        query = query.filter(
            MonitoringCheck.timestamp < end_datetime
        )

    # Filter by service
    if service_id:
        query = query.filter(
            MonitoringCheck.service_id == service_id
        )

    # Filter by HTTP status code
    if status_code is not None:
        query = query.filter(
            MonitoringCheck.status_code == status_code
        )

    # Count matching records before pagination
    total_records = query.count()

    # Sort newest records first and apply pagination
    results = (
        query
        .order_by(MonitoringCheck.timestamp.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    # Format the database records
    logs = []

    for record, service_name in results:
        logs.append({
            "id": record.id,
            "service_id": record.service_id,
            "service_name": service_name,
            "timestamp": record.timestamp.isoformat(),
            "status_code": record.status_code,
            "latency_ms": record.latency_ms,
            "agent": record.agent,
            "region": record.region,
            "quality_flags": record.quality_flags,
            "upload_batch_id": record.upload_batch_id
        })

    return {
        "total_records": total_records,
        "limit": limit,
        "offset": offset,
        "logs": logs
    }
