from flask import Blueprint, jsonify

health_bp = Blueprint("health", __name__)


@health_bp.get("/")
def health_check():
    return jsonify({"status": "ok", "message": "Backend is running"}), 200


@health_bp.get("/cors-test")
def cors_test():
    return jsonify({"message": "CORS is working"}), 200
