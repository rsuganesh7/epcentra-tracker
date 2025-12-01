from datetime import datetime

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from ..extensions import db
from ..models import Task

tasks_bp = Blueprint("tasks", __name__)


def _task_to_dict(task: Task):
    return {
        "id": task.id,
        "organizationId": task.organization_id,
        "projectId": task.project_id,
        "title": task.title,
        "description": task.description,
        "status": task.status,
        "priority": task.priority,
        "phase": task.phase,
        "week": task.week,
        "startDate": task.start_date.isoformat() if task.start_date else None,
        "endDate": task.end_date.isoformat() if task.end_date else None,
        "estimatedHours": task.estimated_hours,
        "actualHours": task.actual_hours,
        "assignedTo": task.assigned_to or [],
        "dependencies": task.dependencies or [],
        "tags": task.tags or [],
        "progress": task.progress,
        "subtasks": task.subtasks or [],
        "blockedReason": task.blocked_reason,
        "createdBy": task.created_by,
        "completedAt": task.completed_at.isoformat() if task.completed_at else None,
        "createdAt": task.created_at.isoformat(),
        "updatedAt": task.updated_at.isoformat(),
    }


@tasks_bp.get("/")
@jwt_required()
def list_tasks():
    tasks = Task.query.order_by(Task.created_at.desc()).all()
    return jsonify({"tasks": [_task_to_dict(t) for t in tasks]}), 200


@tasks_bp.post("/")
@jwt_required()
def create_task():
    user_id = get_jwt_identity()
    payload = request.get_json(force=True) or {}
    task = Task(
        organization_id=payload.get("organizationId"),
        project_id=payload.get("projectId"),
        title=payload.get("title", ""),
        description=payload.get("description"),
        status=payload.get("status", "pending"),
        priority=payload.get("priority", "medium"),
        phase=payload.get("phase"),
        week=payload.get("week"),
        start_date=_parse_date(payload.get("startDate")),
        end_date=_parse_date(payload.get("endDate")),
        estimated_hours=payload.get("estimatedHours"),
        actual_hours=payload.get("actualHours"),
        assigned_to=payload.get("assignedTo") or [],
        dependencies=payload.get("dependencies") or [],
        tags=payload.get("tags") or [],
        progress=payload.get("progress") or 0,
        subtasks=payload.get("subtasks") or [],
        blocked_reason=payload.get("blockedReason"),
        created_by=user_id,
        completed_at=_parse_datetime(payload.get("completedAt")),
    )
    db.session.add(task)
    db.session.commit()
    return jsonify({"task": _task_to_dict(task)}), 201


@tasks_bp.put("/<task_id>")
@jwt_required()
def update_task(task_id: str):
    task = Task.query.get_or_404(task_id)
    payload = request.get_json(force=True) or {}

    for field in [
        "title",
        "description",
        "status",
        "priority",
        "phase",
        "week",
        "estimated_hours",
        "actual_hours",
        "blocked_reason",
    ]:
        if field in payload:
            setattr(task, field, payload[field])

    if "startDate" in payload:
        task.start_date = _parse_date(payload.get("startDate"))
    if "endDate" in payload:
        task.end_date = _parse_date(payload.get("endDate"))
    if "assignedTo" in payload:
        task.assigned_to = payload.get("assignedTo") or []
    if "dependencies" in payload:
        task.dependencies = payload.get("dependencies") or []
    if "tags" in payload:
        task.tags = payload.get("tags") or []
    if "progress" in payload:
        task.progress = payload.get("progress") or 0
    if "subtasks" in payload:
        task.subtasks = payload.get("subtasks") or []
    if "completedAt" in payload:
        task.completed_at = _parse_datetime(payload.get("completedAt"))

    db.session.commit()
    return jsonify({"task": _task_to_dict(task)}), 200


@tasks_bp.delete("/<task_id>")
@jwt_required()
def delete_task(task_id: str):
    task = Task.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    return jsonify({"message": "Task deleted"}), 204


def _parse_date(value):
    if not value:
        return None
    if isinstance(value, str):
        return datetime.fromisoformat(value).date()
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, (int, float)):
        return datetime.fromtimestamp(value).date()
    return None


def _parse_datetime(value):
    if not value:
        return None
    if isinstance(value, str):
        return datetime.fromisoformat(value)
    if isinstance(value, datetime):
        return value
    if isinstance(value, (int, float)):
        return datetime.fromtimestamp(value)
    return None
