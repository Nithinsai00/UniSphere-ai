import os
import sys
import subprocess
import uvicorn

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

DIST_INDEX = os.path.join(BASE_DIR, "frontend", "dist", "index.html")

def ensure_frontend_built():
    """Ensure frontend production build exists."""
    if not os.path.exists(DIST_INDEX):
        print("Frontend production bundle not found. Building now...")
        npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
        subprocess.run([npm_cmd, "run", "build"], cwd=os.path.join(BASE_DIR, "frontend"), check=True)
        print("Frontend build complete!")

if __name__ == "__main__":
    ensure_frontend_built()
    
    print("\n" + "=" * 65)
    print("   UniSphere AI — Student Success Intelligence Platform")
    print("   HacXLerate 2026 | KPMG in India Challenge")
    print("=" * 65)
    print("   Unified Single Project Server: ONLINE")
    print("   Localhost Link: http://localhost:8000")
    print("   Interactive API Docs: http://localhost:8000/docs")
    print("=" * 65 + "\n")
    host = os.getenv("HOST", "0.0.0.0" if os.getenv("PORT") else "127.0.0.1")
    port = int(os.getenv("PORT", 8000))
    print(f"   Listening on: http://{host}:{port}")
    uvicorn.run("backend.app.main:app", host=host, port=port, reload=False)
