from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from ..extensions import db
from ..models import RoadmapMilestone, RoadmapPhase

roadmap_bp = Blueprint("roadmap", __name__)


def _phase_to_dict(phase: RoadmapPhase):
    return {
        "id": phase.id,
        "organizationId": phase.organization_id,
        "name": phase.name,
        "description": phase.description,
        "startWeek": phase.start_week,
        "endWeek": phase.end_week,
        "orderIndex": phase.order_index,
        "createdAt": phase.created_at.isoformat(),
        "updatedAt": phase.updated_at.isoformat(),
    }


def _milestone_to_dict(milestone: RoadmapMilestone):
    return {
        "id": milestone.id,
        "organizationId": milestone.organization_id,
        "phaseId": milestone.phase_id,
        "title": milestone.title,
        "description": milestone.description,
        "week": milestone.week,
        "createdAt": milestone.created_at.isoformat(),
        "updatedAt": milestone.updated_at.isoformat(),
    }


@roadmap_bp.get("/phases")
@jwt_required()
def list_phases():
    org_id = request.args.get("organizationId")
    query = RoadmapPhase.query
    if org_id:
        query = query.filter_by(organization_id=org_id)
    phases = query.order_by(RoadmapPhase.order_index.asc(), RoadmapPhase.created_at.asc()).all()
    return jsonify({"phases": [_phase_to_dict(p) for p in phases]}), 200


@roadmap_bp.post("/phases")
@jwt_required()
def create_phase():
    payload = request.get_json(force=True) or {}
    name = payload.get("name")
    if not name:
        return jsonify({"message": "name is required"}), 400

    phase = RoadmapPhase(
        organization_id=payload.get("organizationId"),
        name=name,
        description=payload.get("description"),
        start_week=payload.get("startWeek"),
        end_week=payload.get("endWeek"),
        order_index=payload.get("orderIndex") or 0,
    )
    db.session.add(phase)
    db.session.commit()
    return jsonify({"phase": _phase_to_dict(phase)}), 201


@roadmap_bp.put("/phases/<phase_id>")
@jwt_required()
def update_phase(phase_id: str):
    phase = RoadmapPhase.query.get_or_404(phase_id)
    payload = request.get_json(force=True) or {}
    for field in ["name", "description", "start_week", "end_week", "order_index", "organization_id"]:
        if field in payload:
            setattr(phase, field, payload[field])
    db.session.commit()
    return jsonify({"phase": _phase_to_dict(phase)}), 200


@roadmap_bp.delete("/phases/<phase_id>")
@jwt_required()
def delete_phase(phase_id: str):
    phase = RoadmapPhase.query.get_or_404(phase_id)
    db.session.delete(phase)
    db.session.commit()
    return jsonify({"message": "Deleted"}), 204


@roadmap_bp.get("/milestones")
@jwt_required()
def list_milestones():
    org_id = request.args.get("organizationId")
    query = RoadmapMilestone.query
    if org_id:
        query = query.filter_by(organization_id=org_id)
    milestones = query.order_by(RoadmapMilestone.week.asc().nulls_last()).all()
    return jsonify({"milestones": [_milestone_to_dict(m) for m in milestones]}), 200


@roadmap_bp.post("/milestones")
@jwt_required()
def create_milestone():
    payload = request.get_json(force=True) or {}
    title = payload.get("title")
    if not title:
        return jsonify({"message": "title is required"}), 400

    milestone = RoadmapMilestone(
        organization_id=payload.get("organizationId"),
        phase_id=payload.get("phaseId"),
        title=title,
        description=payload.get("description"),
        week=payload.get("week"),
    )
    db.session.add(milestone)
    db.session.commit()
    return jsonify({"milestone": _milestone_to_dict(milestone)}), 201


@roadmap_bp.put("/milestones/<milestone_id>")
@jwt_required()
def update_milestone(milestone_id: str):
    milestone = RoadmapMilestone.query.get_or_404(milestone_id)
    payload = request.get_json(force=True) or {}
    for field in ["title", "description", "week", "phase_id", "organization_id"]:
        if field in payload:
            setattr(milestone, field, payload[field])
    db.session.commit()
    return jsonify({"milestone": _milestone_to_dict(milestone)}), 200


@roadmap_bp.delete("/milestones/<milestone_id>")
@jwt_required()
def delete_milestone(milestone_id: str):
    milestone = RoadmapMilestone.query.get_or_404(milestone_id)
    db.session.delete(milestone)
    db.session.commit()
    return jsonify({"message": "Deleted"}), 204
