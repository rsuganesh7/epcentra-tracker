#!/usr/bin/env python3
"""Quick diagnostic for CORS issues"""

from app import create_app
from werkzeug.serving import make_server
import threading
import time
import requests

def test_cors():
    app = create_app()
    
    # Start server in background thread
    server = make_server('127.0.0.1', 5001, app, threaded=True)
    server_thread = threading.Thread(target=server.serve_forever)
    server_thread.daemon = True
    server_thread.start()
    
    print("Starting test server on http://127.0.0.1:5001...")
    time.sleep(1)
    
    try:
        # Test OPTIONS request
        print("\n" + "="*60)
        print("Testing OPTIONS request (preflight)...")
        print("="*60)
        
        response = requests.options(
            'http://127.0.0.1:5001/api/auth/login',
            headers={
                'Origin': 'http://localhost:3000',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type, Authorization'
            }
        )
        
        print(f"Status Code: {response.status_code}")
        print("\nCORS Headers:")
        cors_headers = {k: v for k, v in response.headers.items() if 'access-control' in k.lower()}
        
        if cors_headers:
            for header, value in cors_headers.items():
                print(f"  ✓ {header}: {value}")
            print("\n✓ CORS headers are present!")
        else:
            print("  ✗ NO CORS headers found!")
            print("\nAll response headers:")
            for header, value in response.headers.items():
                print(f"  {header}: {value}")
        
        # Test GET request
        print("\n" + "="*60)
        print("Testing GET request to /health...")
        print("="*60)
        
        response = requests.get(
            'http://127.0.0.1:5001/health',
            headers={'Origin': 'http://localhost:3000'}
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        cors_headers = {k: v for k, v in response.headers.items() if 'access-control' in k.lower()}
        if cors_headers:
            print("✓ CORS headers present on GET request")
        else:
            print("✗ NO CORS headers on GET request")
            
    except Exception as e:
        print(f"\n✗ Error during test: {e}")
        import traceback
        traceback.print_exc()
    finally:
        server.shutdown()
        print("\n" + "="*60)
        print("Test complete. Check results above.")
        print("="*60)

if __name__ == '__main__':
    test_cors()
