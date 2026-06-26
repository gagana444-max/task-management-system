from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from services import user_service
from services.auth_service import (
    create_access_token,
    authenticate_user,
    create_password_reset_token,
    decode_password_reset_token,
    decode_access_token,
    get_password_hash
)
from services.email_service import send_password_reset_email, validate_password_policy
from config.database import get_db
from models.user_model import UserCreate
from models.db_models import DBUser

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post('/register', status_code=201)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # create_user will hash the password internally
    created = user_service.create_user(db, user)
    return created


@router.post('/login')
def login(form_data: dict, db: Session = Depends(get_db)):
    # Expect JSON with `email` and `password`
    email = form_data.get('email', '').strip()
    password = form_data.get('password')
    if not email or not password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email and password required")

    user = authenticate_user(db, email, password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token({"sub": str(user['id']), "role": user['role']})
    return {"access_token": token, "token_type": "bearer"}


@router.post('/forgot-password')
def forgot_password(form_data: dict, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    email = form_data.get('email', '').strip()
    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email required")
        
    user = db.query(DBUser).filter(DBUser.email == email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Generate token and send email in background
    reset_token = create_password_reset_token(user.email, user.user_id, user.user_password)
    background_tasks.add_task(
        send_password_reset_email,
        email=user.email,
        name=user.user_name,
        reset_token=reset_token
    )
    
    return {"message": "A password reset link has been sent to your email."}


@router.post('/reset-password')
def reset_password(form_data: dict, db: Session = Depends(get_db)):
    token = form_data.get('token')
    new_password = form_data.get('new_password')
    confirm_password = form_data.get('confirm_password')
    
    if not token or not new_password or not confirm_password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="All fields are required")
        
    if new_password != confirm_password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Passwords do not match")
        
    payload = decode_password_reset_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset link")
        
    user = db.query(DBUser).filter(DBUser.user_id == int(payload.get("sub"))).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
    # Verify the token is still valid for this specific password hash
    if payload.get("pwd_hash_snippet") != user.user_password[-10:]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This reset link has already been used")
        
    # Validate policy
    errors = validate_password_policy(new_password)
    if errors:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=" | ".join(errors))
        
    # Update password
    user.user_password = get_password_hash(new_password)
    # Also set is_first_login to False just in case they used forgot password before their first login
    user.is_first_login = False 
    user.temp_password = None
    db.commit()
    
    return {"message": "Password has been successfully reset"}


@router.post('/refresh')
def refresh_token(form_data: dict, db: Session = Depends(get_db)):
    """Refresh an expiring JWT. Client sends current valid token, gets a new one."""
    token = form_data.get('token')
    if not token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token required")

    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    user_id = payload.get('sub')
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    user = db.query(DBUser).filter(DBUser.user_id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")

    new_token = create_access_token({"sub": str(user.user_id), "role": user.user_role})
    return {"access_token": new_token, "token_type": "bearer"}
