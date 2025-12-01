import re
from datetime import datetime

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from ..extensions import db
from ..models import Organization, OrganizationMember, User
from ..rbac import SYSTEM_ROLES

organizations_bp = Blueprint("organizations", __name__)


def _slugify(name: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", name).strip("-").lower()
    return slug or "org"


def _default_settings():
    return {
        "timezone": "UTC",
        "dateFormat": "YYYY-MM-DD",
        "timeFormat": "24h",
        "weekStart": "monday",
        "currency": "USD",
        "language": "en",
        "allowPublicProjects": False,
        "requireApprovalForTasks": False,
        "defaultTaskPriority": "medium",
    }


@organizations_bp.get("/")
@jwt_required()
def list_organizations():
    user_id = get_jwt_identity()
    memberships = (
        OrganizationMember.query.filter_by(user_id=user_id, status="active")
        .join(Organization)
        .all()
    )
    data = []
    for membership in memberships:
        org = membership.organization
        data.append(
            {
                "id": org.id,
                "name": org.name,
                "slug": org.slug,
                "description": org.description,
                "settings": org.settings,
                "role": membership.role,
                "teams": membership.teams or [],
            }
        )
    return jsonify({"organizations": data}), 200


@organizations_bp.post("/")
@jwt_required()
def create_organization():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    payload = request.get_json(force=True) or {}
    name = (payload.get("name") or "").strip()
    description = payload.get("description")
    slug = (payload.get("slug") or "").strip().lower() or _slugify(name)

    if not name:
        return jsonify({"message": "Organization name is required"}), 400

    existing_slug = Organization.query.filter_by(slug=slug).first()
    if existing_slug:
        return jsonify({"message": "Slug already in use"}), 409

    organization = Organization(
        name=name,
        slug=slug,
        description=description,
        settings=payload.get("settings") or _default_settings(),
        created_by=user.id,
    )
    db.session.add(organization)
    db.session.flush()

    membership = OrganizationMember(
        organization_id=organization.id,
        user_id=user.id,
        role="owner",
        teams=[],
        status="active",
        invited_by=user.id,
        joined_at=datetime.utcnow(),
    )
    db.session.add(membership)
    db.session.commit()

    return (
        jsonify(
            {
                "organization": {
                    "id": organization.id,
                    "name": organization.name,
                    "slug": organization.slug,
                    "description": organization.description,
                    "settings": organization.settings,
                    "role": membership.role,
                },
            }
        ),
        201,
    )
