import uuid
from datetime import datetime

from ..extensions import db


def _uuid() -> str:
    return str(uuid.uuid4())


class RoadmapPhase(db.Model):
    __tablename__ = "roadmap_phases"

    id = db.Column(db.String(36), primary_key=True, default=_uuid)
    organization_id = db.Column(db.String(36), db.ForeignKey("organizations.id"), nullable=True, index=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    start_week = db.Column(db.Integer, nullable=True)
    end_week = db.Column(db.Integer, nullable=True)
    order_index = db.Column(db.Integer, nullable=True, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class RoadmapMilestone(db.Model):
    __tablename__ = "roadmap_milestones"

    id = db.Column(db.String(36), primary_key=True, default=_uuid)
    organization_id = db.Column(db.String(36), db.ForeignKey("organizations.id"), nullable=True, index=True)
    phase_id = db.Column(db.String(36), db.ForeignKey("roadmap_phases.id"), nullable=True, index=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    week = db.Column(db.Integer, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
