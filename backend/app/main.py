
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.dashboard import router as dashboard_router
from app.routes.logs import router as logs_router
from app.routes.analytics import router as analytics_router
from app.routes.uploads import router as uploads_router


app = FastAPI(
    title="SLA Monitoring API",
    description="Backend API for the SLA Monitoring Dashboard",
    version="1.0.0"
)


# Allow React frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "https://earthre-sla-monitoring-dashboard-fr.vercel.app"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "SLA Monitoring API is running!",
        "status": "success"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


# Register API routes
app.include_router(dashboard_router)
app.include_router(logs_router)
app.include_router(analytics_router)
app.include_router(uploads_router)
