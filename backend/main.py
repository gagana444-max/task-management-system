from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy.exc import IntegrityError
from routes import user_routes

app = FastAPI(title="Task Management System - User API")

# --- Structured Error Handlers ---
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error_code": "HTTP_ERROR",
            "message": exc.detail,
            "description": "An HTTP error occurred during the request."
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "error_code": "VALIDATION_ERROR",
            "message": "Invalid request parameters",
            "description": str(exc.errors())
        }
    )

@app.exception_handler(IntegrityError)
async def integrity_exception_handler(request: Request, exc: IntegrityError):
    return JSONResponse(
        status_code=409,
        content={
            "error_code": "DATABASE_ERROR",
            "message": "Database constraint violation",
            "description": "A record with these unique details already exists or violates a database constraint."
        }
    )

# --- Routes ---
app.include_router(user_routes.router)