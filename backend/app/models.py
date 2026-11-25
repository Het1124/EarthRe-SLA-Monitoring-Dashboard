
from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Float,
    ForeignKey,
    Text,
    func
)
from sqlalchemy.orm import relationship

from app.database import Base


# 1. Services table
class Service(Base):
    __tablename__ = "services"

    service_id = Column(String(50), primary_key=True)
    service_name = Column(String(100), nullable=False)

    monitoring_checks = relationship(
        "MonitoringCheck",
        back_populates="service"
    )


# 2. Upload batches table
class UploadBatch(Base):
    __tablename__ = "upload_batches"

    id = Column(Integer, primary_key=True, index=True)

    filename = Column(String(255), nullable=False)

    uploaded_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    total_rows = Column(Integer, default=0)
    accepted_rows = Column(Integer, default=0)
    rejected_rows = Column(Integer, default=0)

    status = Column(String(30), default="pending")

    monitoring_checks = relationship(
        "MonitoringCheck",
        back_populates="upload_batch"
    )


# 3. Monitoring checks table
class MonitoringCheck(Base):
    __tablename__ = "monitoring_checks"

    id = Column(Integer, primary_key=True, index=True)

    service_id = Column(
        String(50),
        ForeignKey("services.service_id"),
        nullable=False,
        index=True
    )

    upload_batch_id = Column(
        Integer,
        ForeignKey("upload_batches.id"),
        nullable=False,
        index=True
    )

    timestamp = Column(
        DateTime(timezone=True),
        nullable=False,
        index=True
    )

    status_code = Column(Integer, nullable=False)

    latency_ms = Column(Float, nullable=True)

    agent = Column(String(100), nullable=True)

    region = Column(String(100), nullable=True)

    quality_flags = Column(Text, nullable=True)

    service = relationship(
        "Service",
        back_populates="monitoring_checks"
    )

    upload_batch = relationship(
        "UploadBatch",
        back_populates="monitoring_checks"
    )


# 4. Rejected records table
class RejectedRecord(Base):
    __tablename__ = "rejected_records"

    id = Column(Integer, primary_key=True, index=True)

    upload_batch_id = Column(
        Integer,
        ForeignKey("upload_batches.id"),
        nullable=False,
        index=True
    )

    row_number = Column(Integer, nullable=False)

    reason = Column(Text, nullable=False)

    original_data = Column(Text, nullable=False)
