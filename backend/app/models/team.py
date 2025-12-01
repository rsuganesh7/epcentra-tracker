import uuid
from datetime import datetime

from ..extensions import db


def _uuid() -> str:
    return str(uuid.uuid4())


class Team(db.Model):
    __tablename__ = "teams"

    id = db.Column(db.String(36), primary_key=True, default=_uuid)
    organization_id = db.Column(db.String(36), db.ForeignKey("organizations.id"), nullable=True, index=True)
    name = db.Column(db.String(255), nullable=False)
    category = db.Column(db.String(100), nullable=True)
    description = db.Column(db.Text, nullable=True)
    member_count = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
