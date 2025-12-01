import uuid
from datetime import datetime, date

from ..extensions import db


def _uuid() -> str:
    return str(uuid.uuid4())


class Task(db.Model):
    __tablename__ = "tasks"

    id = db.Column(db.String(36), primary_key=True, default=_uuid)
    organization_id = db.Column(db.String(36), db.ForeignKey("organizations.id"), nullable=True, index=True)
    project_id = db.Column(db.String(36), nullable=True, index=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(50), nullable=False, default="pending")
    priority = db.Column(db.String(50), nullable=False, default="medium")
    phase = db.Column(db.String(255), nullable=True)
    week = db.Column(db.Integer, nullable=True)
    start_date = db.Column(db.Date, nullable=True)
    end_date = db.Column(db.Date, nullable=True)
    estimated_hours = db.Column(db.Float, nullable=True)
    actual_hours = db.Column(db.Float, nullable=True)
    assigned_to = db.Column(db.JSON, nullable=False, default=list)
    dependencies = db.Column(db.JSON, nullable=False, default=list)
    tags = db.Column(db.JSON, nullable=False, default=list)
    progress = db.Column(db.Integer, nullable=False, default=0)
    subtasks = db.Column(db.JSON, nullable=False, default=list)
    blocked_reason = db.Column(db.Text, nullable=True)
    created_by = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=True)
    completed_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
