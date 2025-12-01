from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from ..extensions import db
from ..models import Project

projects_bp = Blueprint("projects", __name__)


def _project_to_dict(project: Project):
    return {
        "id": project.id,
        "organizationId": project.organization_id,
        "name": project.name,
        "key": project.key,
        "description": project.description,
        "visibility": project.visibility,
        "status": project.status,
        "createdBy": project.created_by,
        "createdAt": project.created_at.isoformat(),
        "updatedAt": project.updated_at.isoformat(),
    }


@projects_bp.get("/")
@jwt_required()
def list_projects():
    org_id = request.args.get("organizationId")
    query = Project.query
    if org_id:
        query = query.filter_by(organization_id=org_id)
    projects = query.order_by(Project.created_at.desc()).all()
    return jsonify({"projects": [_project_to_dict(p) for p in projects]}), 200


@projects_bp.post("/")
@jwt_required()
def create_project():
    user_id = get_jwt_identity()
    payload = request.get_json(force=True) or {}
    name = payload.get("name")
    key = payload.get("key")
    org_id = payload.get("organizationId")
    if not name or not key or not org_id:
        return jsonify({"message": "name, key, and organizationId are required"}), 400

    project = Project(
        organization_id=org_id,
        name=name,
        key=key,
        description=payload.get("description"),
        visibility=payload.get("visibility") or "organization",
        status=payload.get("status") or "active",
        created_by=user_id,
    )
    db.session.add(project)
    db.session.commit()
    return jsonify({"project": _project_to_dict(project)}), 201


@projects_bp.put("/<project_id>")
@jwt_required()
def update_project(project_id: str):
    project = Project.query.get_or_404(project_id)
    payload = request.get_json(force=True) or {}
    for field in ["name", "key", "description", "visibility", "status", "organization_id"]:
        if field in payload:
            setattr(project, field, payload[field])
    db.session.commit()
    return jsonify({"project": _project_to_dict(project)}), 200


@projects_bp.delete("/<project_id>")
@jwt_required()
def delete_project(project_id: str):
    project = Project.query.get_or_404(project_id)
    project.status = "archived"
    db.session.commit()
    return jsonify({"message": "Archived"}), 204
