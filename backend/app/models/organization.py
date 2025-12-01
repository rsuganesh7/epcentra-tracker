import uuid
from datetime import datetime

from ..extensions import db


def _uuid() -> str:
    return str(uuid.uuid4())


class Organization(db.Model):
    __tablename__ = "organizations"

    id = db.Column(db.String(36), primary_key=True, default=_uuid)
    name = db.Column(db.String(255), nullable=False)
    slug = db.Column(db.String(255), nullable=False, unique=True, index=True)
    description = db.Column(db.Text, nullable=True)
    settings = db.Column(db.JSON, nullable=False, default=dict)
    created_by = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    members = db.relationship("OrganizationMember", back_populates="organization", cascade="all, delete-orphan")


class OrganizationMember(db.Model):
    __tablename__ = "organization_members"
    __table_args__ = (db.UniqueConstraint("user_id", "organization_id", name="uq_member_org"),)

    id = db.Column(db.String(36), primary_key=True, default=_uuid)
    organization_id = db.Column(db.String(36), db.ForeignKey("organizations.id"), nullable=False, index=True)
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False, index=True)
    role = db.Column(db.String(50), nullable=False)
    teams = db.Column(db.JSON, nullable=False, default=list)
    status = db.Column(db.String(50), nullable=False, default="active")
    invited_by = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=True)
    joined_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    organization = db.relationship("Organization", back_populates="members")
    user = db.relationship(
        "User",
        back_populates="memberships",
        foreign_keys=[user_id],
    )
    invited_by_user = db.relationship(
        "User",
        foreign_keys=[invited_by],
        uselist=False,
    )
