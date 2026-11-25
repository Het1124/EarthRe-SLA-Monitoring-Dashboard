
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, case

from app.database import SessionLocal
from app.models import MonitoringCheck, Service


router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.get("/analytics")
def get_service_analytics(db: Session = Depends(get_db)):

    results = (
        db.query(
            Service.service_id,
            Service.service_name,

            func.count(MonitoringCheck.id).label("total_checks"),

            func.sum(
                case(
                    (
                        MonitoringCheck.status_code.between(200, 299),
                        1
                    ),
                    else_=0
                )
            ).label("successful_checks"),

            func.avg(
                MonitoringCheck.latency_ms
            ).label("average_latency_ms")

        )
        .outerjoin(
            MonitoringCheck,
            Service.service_id == MonitoringCheck.service_id
        )
        .group_by(
            Service.service_id,
            Service.service_name
        )
        .order_by(Service.service_id)
        .all()
    )

    services = []

    for row in results:

        total = row.total_checks or 0
        successful = row.successful_checks or 0

        availability = (
            (successful / total) * 100
            if total > 0
            else 0
        )

        services.append({
            "service_id": row.service_id,
            "service_name": row.service_name,
            "total_checks": total,
            "successful_checks": int(successful),
            "availability_percentage": round(availability, 2),
            "average_latency_ms": (
                round(float(row.average_latency_ms), 2)
                if row.average_latency_ms is not None
                else None
            )
        })

    return {
        "services": services
    }
