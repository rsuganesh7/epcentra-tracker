#!/usr/bin/env python3
"""Test CORS configuration and endpoints"""

import sys
import json
from app import create_app

def test_config():
    """Test that the configuration is loaded correctly"""
    print("=" * 70)
    print("TESTING BACKEND CONFIGURATION")
    print("=" * 70)
    
    app = create_app()
    
    print(f"✓ Flask app created successfully")
    print(f"✓ Debug mode: {app.config.get('DEBUG', False)}")
    print(f"✓ CORS Origins: {app.config.get('CORS_ORIGINS', [])}")
    print(f"✓ Database: {app.config.get('SQLALCHEMY_DATABASE_URI', 'Not set')}")
    
    # List all registered routes
    print("\n" + "=" * 70)
    print("REGISTERED ROUTES")
    print("=" * 70)
    
    routes = []
    for rule in app.url_map.iter_rules():
        routes.append({
            'endpoint': rule.endpoint,
            'methods': ', '.join(sorted(rule.methods - {'HEAD', 'OPTIONS'})),
            'path': str(rule)
        })
    
    # Group by prefix
    api_routes = [r for r in routes if r['path'].startswith('/api/')]
    health_routes = [r for r in routes if r['path'].startswith('/health')]
    
    if api_routes:
        print("\nAPI Routes:")
        for route in sorted(api_routes, key=lambda x: x['path']):
            print(f"  {route['methods']:20} {route['path']}")
    
    if health_routes:
        print("\nHealth Routes:")
        for route in sorted(health_routes, key=lambda x: x['path']):
            print(f"  {route['methods']:20} {route['path']}")
    
    # Test CORS configuration
    print("\n" + "=" * 70)
    print("CORS CONFIGURATION")
    print("=" * 70)
    
    with app.test_client() as client:
        # Test OPTIONS request (preflight)
        response = client.options(
            '/api/auth/login',
            headers={
                'Origin': 'http://localhost:3000',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type, Authorization'
            }
        )
        
        print(f"\nOPTIONS /api/auth/login from http://localhost:3000:")
        print(f"  Status Code: {response.status_code}")
        print(f"  CORS Headers:")
        
        cors_headers = {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin', 'MISSING'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods', 'MISSING'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers', 'MISSING'),
            'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials', 'MISSING'),
        }
        
        for header, value in cors_headers.items():
            status = "✓" if value != "MISSING" else "✗"
            print(f"    {status} {header}: {value}")
        
        # Check if all required headers are present
        if all(v != "MISSING" for v in cors_headers.values()):
            print("\n✓ CORS is configured correctly!")
        else:
            print("\n✗ CORS configuration is incomplete!")
            return False
    
    print("\n" + "=" * 70)
    print("READY TO START SERVER")
    print("=" * 70)
    print("\nRun: python manage.py")
    print("Frontend should connect to: http://localhost:5000")
    print("=" * 70)
    
    return True

if __name__ == '__main__':
    try:
        success = test_config()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n✗ Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)
