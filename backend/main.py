import uvicorn
import uuid
import time
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from datetime import datetime

# Import Core Configurations & Logging
from backend.core.config import settings
from backend.core.database import engine, Base
from backend.core.logging_config import logger

# Import API Routers (v1)
from backend.routes import auth as auth_router
from backend.routes.v1 import (
    health,
    dashboard,
    analytics,
    websocket,
    hospitals,
    doctors,
    medicines,
    inventory,
    beds,
    diagnostics,
    ambulances,
    patients,
    alerts,
    ai,
    optimization,
    xai,
    copilot,
    citizen,
    sync,
    notifications,
    broadcast,
    security,
    health,
    jobs
)

# Initialize database tables on startup
Base.metadata.create_all(bind=engine)

# Auto-seed database if empty (for fresh deployments)
def auto_seed():
    from backend.core.database import SessionLocal
    from backend.models.models import Hospital
    db = SessionLocal()
    try:
        count = db.query(Hospital).count()
        if count == 0:
            logger.info("Database is empty — running auto-seed...")
            from backend.seeds.seed import seed_database
            seed_database(db)
            logger.info("Auto-seed completed successfully.")
        else:
            logger.info(f"Database already has {count} hospitals — skipping seed.")
    except Exception as e:
        logger.error(f"Auto-seed failed: {e}")
    finally:
        db.close()

auto_seed()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="SmartHealth Nexus - AI-Powered District Health Command Center API",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware to attach a request-id and trace response timings
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    response.headers["X-Process-Time"] = str(process_time)
    response.headers["X-Request-ID"] = request_id
    return response


# ==========================================
# Centralized Exception Handlers (API Standardization)
# ==========================================

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    logger.warning(f"HTTP exception occurred on path {request.url.path}: {exc.detail}")
    request_id = getattr(request.state, "request_id", None)
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.detail,
            "data": None,
            "errors": [exc.detail],
            "timestamp": datetime.utcnow().isoformat(),
            "request_id": request_id
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(f"Validation error on path {request.url.path}: {exc.errors()}")
    request_id = getattr(request.state, "request_id", None)
    
    # Extract error messages
    error_messages = [f"{'.'.join(str(p) for p in err['loc'])}: {err['msg']}" for err in exc.errors()]
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "message": "Validation failed for request parameters or request body.",
            "data": None,
            "errors": error_messages,
            "timestamp": datetime.utcnow().isoformat(),
            "request_id": request_id
        }
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled system exception on {request.url.path}: {str(exc)}", exc_info=True)
    request_id = getattr(request.state, "request_id", None)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "An unexpected internal server error occurred.",
            "data": None,
            "errors": [str(exc)],
            "timestamp": datetime.utcnow().isoformat(),
            "request_id": request_id
        }
    )


# ==========================================
# Route Registrations
# ==========================================

# Maintain Module 1 auth router directly at root to guarantee backward compatibility
app.include_router(auth_router.router)

# Mount all versioned API routes under /api/v1 prefix
app.include_router(auth_router.router, prefix=settings.API_V1_STR)
app.include_router(health.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(websocket.router, prefix=settings.API_V1_STR)
app.include_router(hospitals.router, prefix=settings.API_V1_STR)
app.include_router(doctors.router, prefix=settings.API_V1_STR)
app.include_router(medicines.router, prefix=settings.API_V1_STR)
app.include_router(inventory.router, prefix=settings.API_V1_STR)
app.include_router(beds.router, prefix=settings.API_V1_STR)
app.include_router(diagnostics.router, prefix=settings.API_V1_STR)
app.include_router(ambulances.router, prefix=settings.API_V1_STR)
app.include_router(patients.router, prefix=settings.API_V1_STR)
app.include_router(alerts.router, prefix=settings.API_V1_STR)
app.include_router(ai.router, prefix=settings.API_V1_STR)
app.include_router(optimization.router, prefix=settings.API_V1_STR)
app.include_router(xai.router, prefix=settings.API_V1_STR)
app.include_router(copilot.router, prefix=settings.API_V1_STR)
app.include_router(citizen.router, prefix=settings.API_V1_STR)
app.include_router(sync.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(broadcast.router, prefix=settings.API_V1_STR)
app.include_router(security.router, prefix=settings.API_V1_STR)
app.include_router(health.router, prefix=settings.API_V1_STR)
app.include_router(jobs.router, prefix=settings.API_V1_STR)


@app.get("/")
def read_root():
    return {
        "status": "online",
        "system": "SmartHealth Nexus District Command Center API",
        "version": settings.PROJECT_VERSION,
        "database": "connected"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
