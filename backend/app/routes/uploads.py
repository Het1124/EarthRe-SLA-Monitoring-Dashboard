
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import UploadBatch


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


@router.get("/uploads")
def get_upload_history(
    limit: int = Query(default=10, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db)
):

    # Count all uploaded CSV batches
    total_uploads = (
        db.query(UploadBatch).count()
    )

    # Retrieve the latest uploads first
    batches = (
        db.query(UploadBatch)
        .order_by(UploadBatch.uploaded_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    uploads = []

    for batch in batches:

        uploads.append({
            "id": batch.id,
            "filename": batch.filename,
            "uploaded_at": (
                batch.uploaded_at.isoformat()
                if batch.uploaded_at
                else None
            ),
            "total_rows": batch.total_rows,
            "accepted_rows": batch.accepted_rows,
            "rejected_rows": batch.rejected_rows,
            "status": batch.status
        })

    return {
        "total_uploads": total_uploads,
        "limit": limit,
        "offset": offset,
        "uploads": uploads
    }
