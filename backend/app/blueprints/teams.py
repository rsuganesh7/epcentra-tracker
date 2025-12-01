from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from ..extensions import db
from ..models import Team

teams_bp = Blueprint("teams", __name__)


def _team_to_dict(team: Team):
    return {
        "id": team.id,
        "organizationId": team.organization_id,
        "name": team.name,
        "category": team.category,
        "description": team.description,
        "memberCount": team.member_count,
        "createdAt": team.created_at.isoformat(),
        "updatedAt": team.updated_at.isoformat(),
    }


@teams_bp.get("/")
@jwt_required()
def list_teams():
    org_id = request.args.get("organizationId")
    query = Team.query
    if org_id:
        query = query.filter_by(organization_id=org_id)
    teams = query.order_by(Team.created_at.asc()).all()
    return jsonify({"teams": [_team_to_dict(t) for t in teams]}), 200


@teams_bp.post("/")
@jwt_required()
def create_team():
    payload = request.get_json(force=True) or {}
    name = payload.get("name")
    if not name:
        return jsonify({"message": "name is required"}), 400

    team = Team(
        organization_id=payload.get("organizationId"),
        name=name,
        category=payload.get("category"),
        description=payload.get("description"),
        member_count=payload.get("memberCount") or 0,
    )
    db.session.add(team)
    db.session.commit()
    return jsonify({"team": _team_to_dict(team)}), 201


@teams_bp.put("/<team_id>")
@jwt_required()
def update_team(team_id: str):
    team = Team.query.get_or_404(team_id)
    payload = request.get_json(force=True) or {}
    for field in ["name", "category", "description", "organization_id"]:
        if field in payload:
            setattr(team, field, payload[field])
    if "memberCount" in payload:
        team.member_count = payload.get("memberCount") or 0
    db.session.commit()
    return jsonify({"team": _team_to_dict(team)}), 200


@teams_bp.delete("/<team_id>")
@jwt_required()
def delete_team(team_id: str):
    team = Team.query.get_or_404(team_id)
    db.session.delete(team)
    db.session.commit()
    return jsonify({"message": "Deleted"}), 204
