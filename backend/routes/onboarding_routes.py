from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from config.database import get_db
from controllers import onboarding_controller
from models.comment_model import PasswordResetRequest
from middleware.auth import role_required

router = APIRouter(prefix="/api/onboarding", tags=["User Onboarding"])


# Send onboarding email with temp password — Admin only
@router.post("/send-credentials/{user_id}", status_code=200)
async def send_onboarding_email(
    user_id: int,
    background_tasks: BackgroundTasks,
    admin: dict = Depends(role_required("Admin")),
    db: Session = Depends(get_db)
):
    return await onboarding_controller.onboard_user(
        user_id=user_id,
        background_tasks=background_tasks,
        db=db
    )

# Check if user needs to reset password on first login
@router.get("/check-first-login/{user_id}", status_code=200)
async def check_first_login(
    user_id: int,
    db: Session = Depends(get_db)
):
    return onboarding_controller.check_first_login(
        user_id=user_id,
        db=db
    )

# Reset password on first login
@router.post("/reset-password/{user_id}", status_code=200)
async def reset_password(
    user_id: int,
    request: PasswordResetRequest,
    db: Session = Depends(get_db)
):
    if not request.validate_passwords_match():
        raise HTTPException(status_code=400, detail={
            "error_code": "PASSWORD_MISMATCH",
            "message": "Passwords do not match",
            "description": "New password and confirm password must be the same"
        })

    return onboarding_controller.reset_password(
        user_id=user_id,
        temp_password=request.temp_password,
        new_password=request.new_password,
        confirm_password=request.confirm_password,
        db=db
    )
