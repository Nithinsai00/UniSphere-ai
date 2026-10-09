import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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

# Mount Routers
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
