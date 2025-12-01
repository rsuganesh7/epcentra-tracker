#!/usr/bin/env python3
"""Start Flask server with debugging"""

from app import create_app
import sys

print("=" * 70)
print("STARTING FLASK SERVER")
print("=" * 70)

try:
    app = create_app()
    print("✓ Flask app created successfully")
    print(f"✓ Debug mode: {app.debug}")
    print(f"✓ CORS Origins: {app.config.get('CORS_ORIGINS', [])}")
    
    print("\n" + "=" * 70)
    print("Registered Routes:")
    print("=" * 70)
    for rule in sorted(app.url_map.iter_rules(), key=lambda r: str(r)):
        methods = ', '.join(sorted(rule.methods - {'HEAD'}))
        print(f"  {methods:30} {rule}")
    
    print("\n" + "=" * 70)
    print("Server starting on http://0.0.0.0:5001")
    print("Frontend should use: http://localhost:5001")
    print("=" * 70)
    print("\nWatching for requests...\n")
    
    app.run(host="0.0.0.0", port=5001, debug=True, use_reloader=True)
    
except Exception as e:
    print(f"\n✗ ERROR: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
