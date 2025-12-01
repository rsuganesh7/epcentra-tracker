import uuid
from datetime import datetime

from ..extensions import db


def _uuid() -> str:
    return str(uuid.uuid4())


class Project(db.Model):
    __tablename__ = "projects"

    id = db.Column(db.String(36), primary_key=True, default=_uuid)
    organization_id = db.Column(db.String(36), db.ForeignKey("organizations.id"), nullable=False, index=True)
    name = db.Column(db.String(255), nullable=False)
    key = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=True)
    visibility = db.Column(db.String(50), nullable=False, default="organization")
    status = db.Column(db.String(50), nullable=False, default="active")
    created_by = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
