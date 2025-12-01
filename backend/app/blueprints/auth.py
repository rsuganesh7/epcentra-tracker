from datetime import datetime

from flask import Blueprint, jsonify, request
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    get_jwt_identity,
    jwt_required,
)

from ..extensions import db
from ..models import OrganizationMember, User

auth_bp = Blueprint("auth", __name__)


def _user_response(user: User):
    return {
        "id": user.id,
        "email": user.email,
        "displayName": user.display_name,
        "createdAt": user.created_at.isoformat(),
        "updatedAt": user.updated_at.isoformat(),
    }


@auth_bp.post("/register")
def register():
    payload = request.get_json(force=True) or {}
    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password")
    display_name = payload.get("displayName") or payload.get("display_name")

    if not email or not password or not display_name:
        return jsonify({"message": "email, password, and displayName are required"}), 400

    existing = User.query.filter_by(email=email).first()
    if existing:
        return jsonify({"message": "User already exists"}), 409

    user = User(email=email, display_name=display_name)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    access = create_access_token(identity=user.id, additional_claims={"email": user.email})
    refresh = create_refresh_token(identity=user.id)
    return jsonify({"user": _user_response(user), "accessToken": access, "refreshToken": refresh}), 201


@auth_bp.post("/login")
def login():
    payload = request.get_json(force=True) or {}
    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password")
    if not email or not password:
        return jsonify({"message": "email and password are required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"message": "Invalid credentials"}), 401

    access = create_access_token(identity=user.id, additional_claims={"email": user.email})
    refresh = create_refresh_token(identity=user.id)
    return jsonify({"user": _user_response(user), "accessToken": access, "refreshToken": refresh}), 200


@auth_bp.post("/refresh")
@jwt_required(refresh=True)
def refresh_token():
    user_id = get_jwt_identity()
    access = create_access_token(identity=user_id)
    return jsonify({"accessToken": access}), 200


@auth_bp.get("/me")
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    memberships = OrganizationMember.query.filter_by(user_id=user.id, status="active").all()
    orgs = [
        {
            "id": m.organization.id,
            "name": m.organization.name,
            "slug": m.organization.slug,
            "role": m.role,
            "teams": m.teams or [],
        }
        for m in memberships
    ]

    return jsonify({"user": _user_response(user), "memberships": orgs}), 200
