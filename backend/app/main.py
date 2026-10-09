import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from .config import settings
from .database import engine, Base, SessionLocal
from .models import User
from .services.seed_data import seed_database

# Routers
from .routers import (
    auth, admin, faculty, student,
    analytics, interventions, data_import,
    reports, assistant
)

# Frontend build directory path
DIST_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Auto-seed initial demo dataset if empty
    db: Session = SessionLocal()
    try:
        user_count = db.query(User).count()
        if user_count == 0:
            print("Database is empty. Automatically generating initial seed dataset...")
            seed_database(db)
            print("Auto-seed complete!")
    finally:
        db.close()
        
    yield

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Smart Campus Analytics: Predict, Optimize & Improve Student Success",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(faculty.router)
app.include_router(student.router)
app.include_router(analytics.router)
app.include_router(interventions.router)
app.include_router(data_import.router)
app.include_router(reports.router)
app.include_router(assistant.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION
    }

@app.post("/api/admin/reseed")
def reseed_endpoint():
    """Manual reseed endpoint for testing."""
    db: Session = SessionLocal()
    try:
        res = seed_database(db, force=True)
        return res
    finally:
        db.close()

# Mount Frontend Static Assets
assets_dir = os.path.join(DIST_DIR, "assets")
if os.path.exists(assets_dir):
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

photos_dir = os.path.join(DIST_DIR, "photos")
if os.path.exists(photos_dir):
    app.mount("/photos", StaticFiles(directory=photos_dir), name="photos")

# Catch-all Route for Frontend Single Page Application (SPA)
@app.api_route("/{full_path:path}", methods=["GET", "HEAD"])
async def serve_spa(full_path: str):
    # 1. Ignore /api, /docs, /openapi.json which are handled by FastAPI
    if full_path.startswith("api/") or full_path in ("docs", "openapi.json", "redoc"):
        return {"error": "Not Found"}

    # 2. Check if a static file directly in DIST_DIR matches (e.g. arjun_round.png, favicon.svg)
    file_path = os.path.join(DIST_DIR, full_path)
    if full_path and os.path.isfile(file_path):
        return FileResponse(file_path)

    # 3. Serve SPA index.html for client-side routing (/, /login, /student/*, /faculty/*, /admin/*)
    index_file = os.path.join(DIST_DIR, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)

    return {"message": "Frontend build not found. Please build the frontend first."}
