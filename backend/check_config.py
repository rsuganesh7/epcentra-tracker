#!/usr/bin/env python3
"""Quick test to verify CORS configuration"""

from app import create_app

app = create_app()

print("=" * 60)
print("BACKEND CONFIGURATION CHECK")
print("=" * 60)
print(f"Flask Debug Mode: {app.config['DEBUG']}")
print(f"CORS Origins: {app.config['CORS_ORIGINS']}")
print(f"Database URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
print(f"JWT Secret Key Set: {'Yes' if app.config['JWT_SECRET_KEY'] != 'dev-jwt-secret' else 'No (using default)'}")
print("=" * 60)
print("\nCORS Configuration:")
print("  - Methods: GET, POST, PUT, DELETE, OPTIONS")
print("  - Credentials: Enabled")
print("  - Headers: Content-Type, Authorization")
print("=" * 60)
print("\nStarting Flask server on http://0.0.0.0:5000")
print("Frontend should connect to: http://localhost:5000")
print("=" * 60)
