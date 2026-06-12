from fastapi import HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from models.db_models import DBUser
from services.email_service import generate_temp_password, validate_password_policy, send_onboarding_email

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str):
    return pwd_context.verify(plain, hashed)

async def onboard_user(user_id: int, db: Session):
    user = db.query(DBUser).filter(DBUser.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail={
            "error_code": "NOT_FOUND",
            "message": "User not found",
            "description": f"No user found with id {user_id}"
        })

    # Generate temporary password
    temp_password = generate_temp_password()

    # Hash and store temp password
    user.user_password = hash_password(temp_password)
    user.temp_password = temp_password
    user.is_first_login = True
    db.commit()

    # Send onboarding email
    await send_onboarding_email(
        email=user.email,
        name=user.user_name,
        temp_password=temp_password
    )

    return {
        "message": f"Onboarding email sent to {user.email}",
        "user_id": user_id
    }

def reset_password(user_id: int, temp_password: str, new_password: str, confirm_password: str, db: Session):
    user = db.query(DBUser).filter(DBUser.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail={
            "error_code": "NOT_FOUND",
            "message": "User not found",
            "description": f"No user found with id {user_id}"
        })

    # Check if first login
    if not user.is_first_login:
        raise HTTPException(status_code=400, detail={
            "error_code": "ALREADY_RESET",
            "message": "Password already reset",
            "description": "This account has already completed the first login password reset"
        })

    # Verify temp password
    if not verify_password(temp_password, user.user_password):
        raise HTTPException(status_code=401, detail={
            "error_code": "INVALID_TEMP_PASSWORD",
            "message": "Invalid temporary password",
            "description": "The temporary password you entered is incorrect"
        })

    # Check passwords match
    if new_password != confirm_password:
        raise HTTPException(status_code=400, detail={
            "error_code": "PASSWORD_MISMATCH",
            "message": "Passwords do not match",
            "description": "New password and confirm password must be the same"
        })

    # Validate password policy
    policy_errors = validate_password_policy(new_password)
    if policy_errors:
        raise HTTPException(status_code=400, detail={
            "error_code": "PASSWORD_POLICY_ERROR",
            "message": "Password does not meet requirements",
            "description": " | ".join(policy_errors)
        })

    # Update password
    user.user_password = hash_password(new_password)
    user.is_first_login = False
    user.temp_password = None
    db.commit()

    return {
        "message": "Password reset successfully. You can now log in with your new password.",
        "user_id": user_id
    }

def check_first_login(user_id: int, db: Session):
    user = db.query(DBUser).filter(DBUser.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail={
            "error_code": "NOT_FOUND",
            "message": "User not found",
            "description": f"No user found with id {user_id}"
        })
    return {
        "user_id": user_id,
        "is_first_login": user.is_first_login,
        "email": user.email,
        "name": user.user_name
    }