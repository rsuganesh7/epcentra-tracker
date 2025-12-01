from datetime import datetime

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from pydantic import ValidationError

from ..extensions import db
from ..models import Task
from ..schemas.task import TaskCreateSchema, TaskUpdateSchema

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
    org_id = request.args.get("organizationId")
    query = Task.query
    if org_id:
        query = query.filter_by(organization_id=org_id)
    tasks = query.order_by(Task.created_at.desc()).all()
    return jsonify({"tasks": [_task_to_dict(t) for t in tasks]}), 200


@tasks_bp.post("/")
@jwt_required()
def create_task():
    user_id = get_jwt_identity()
    payload = request.get_json(force=True) or {}
    try:
        data = TaskCreateSchema.model_validate(payload)
    } except ValidationError as err:
        return jsonify({"message": "Invalid payload", "errors": err.errors()}), 400

    task = Task(
        organization_id=data.organizationId,
        project_id=data.projectId,
        title=data.title,
        description=data.description,
        status=data.status or "pending",
        priority=data.priority or "medium",
        phase=data.phase,
        week=data.week,
        start_date=_parse_date(data.startDate),
        end_date=_parse_date(data.endDate),
        estimated_hours=data.estimatedHours,
        actual_hours=data.actualHours,
        assigned_to=data.assignedTo or [],
        dependencies=data.dependencies or [],
        tags=data.tags or [],
        progress=data.progress or 0,
        subtasks=[s.model_dump() for s in data.subtasks] if data.subtasks else [],
        blocked_reason=data.blockedReason,
        created_by=user_id,
        completed_at=_parse_datetime(data.completedAt),
    )
    db.session.add(task)
    db.session.commit()
    return jsonify({"task": _task_to_dict(task)}), 201


@tasks_bp.put("/<task_id>")
@jwt_required()
def update_task(task_id: str):
    task = Task.query.get_or_404(task_id)
    payload = request.get_json(force=True) or {}
    try:
        data = TaskUpdateSchema.model_validate(payload)
    except ValidationError as err:
        return jsonify({"message": "Invalid payload", "errors": err.errors()}), 400

    if data.title is not None:
        task.title = data.title
    if data.description is not None:
        task.description = data.description
    if data.status is not None:
        task.status = data.status
    if data.priority is not None:
        task.priority = data.priority
    if data.phase is not None:
        task.phase = data.phase
    if data.week is not None:
        task.week = data.week
    if data.estimatedHours is not None:
        task.estimated_hours = data.estimatedHours
    if data.actualHours is not None:
        task.actual_hours = data.actualHours
    if data.blockedReason is not None:
        task.blocked_reason = data.blockedReason
    if data.startDate is not None:
        task.start_date = _parse_date(data.startDate)
    if data.endDate is not None:
        task.end_date = _parse_date(data.endDate)
    if data.assignedTo is not None:
        task.assigned_to = data.assignedTo or []
    if data.dependencies is not None:
        task.dependencies = data.dependencies or []
    if data.tags is not None:
        task.tags = data.tags or []
    if data.progress is not None:
        task.progress = data.progress
    if data.subtasks is not None:
        task.subtasks = [s.model_dump() for s in data.subtasks] if data.subtasks else []
    if data.completedAt is not None:
        task.completed_at = _parse_datetime(data.completedAt)

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
