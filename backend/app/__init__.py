import os
from flask import Flask, jsonify, make_response, request
from dotenv import load_dotenv

from .config import Config
from .extensions import db, jwt, migrate
from .blueprints.auth import auth_bp
from .blueprints.organizations import organizations_bp
from .blueprints.tasks import tasks_bp
from .blueprints.health import health_bp


def create_app(config_class: type[Config] = Config) -> Flask:
    """Application factory for the Flask backend."""
    load_dotenv()

    app = Flask(__name__)
    app.config.from_object(config_class)

    _register_extensions(app)
    _setup_cors(app)
    _register_blueprints(app)
    _register_error_handlers(app)

    return app


def _setup_cors(app: Flask) -> None:
    """Setup CORS handling"""
    
    @app.after_request
    def after_request(response):
        """Add CORS headers to every response"""
        origin = request.headers.get('Origin')
        if origin:
            response.headers['Access-Control-Allow-Origin'] = origin
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
            response.headers['Access-Control-Allow-Credentials'] = 'true'
        return response
    
    @app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
    @app.route('/<path:path>', methods=['OPTIONS'])
    def handle_options(path):
        """Handle all OPTIONS requests"""
        response = make_response('', 200)
        origin = request.headers.get('Origin')
        if origin:
            response.headers['Access-Control-Allow-Origin'] = origin
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
            response.headers['Access-Control-Allow-Credentials'] = 'true'
            response.headers['Access-Control-Max-Age'] = '3600'
        return response


def _register_extensions(app: Flask) -> None:
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)


def _register_blueprints(app: Flask) -> None:
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(organizations_bp, url_prefix="/api/organizations")
    app.register_blueprint(tasks_bp, url_prefix="/api/tasks")
    app.register_blueprint(health_bp, url_prefix="/health")


def _register_error_handlers(app: Flask) -> None:
    @app.errorhandler(404)
    def not_found(error):  # type: ignore[override]
        return jsonify({"message": "Not found"}), 404

    @app.errorhandler(500)
    def server_error(error):  # type: ignore[override]
        if app.debug:
            # Let Flask show the traceback in debug
            raise error
        return jsonify({"message": "Internal server error"}), 500
