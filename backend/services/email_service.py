import os
import random
import string
import ssl
import smtplib
import traceback
from urllib.parse import quote
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

def _get_email_config():
    """Returns a dict of email config from environment. MAIL_FROM always matches MAIL_USERNAME to satisfy Gmail."""
    username = os.getenv("EMAIL_USER") or os.getenv("MAIL_USERNAME") or ""
    password = os.getenv("EMAIL_PASS") or os.getenv("MAIL_PASSWORD") or ""
    server   = os.getenv("EMAIL_HOST") or os.getenv("MAIL_SERVER") or "smtp.gmail.com"
    port     = int(os.getenv("EMAIL_PORT") or os.getenv("MAIL_PORT") or "465")
    # IMPORTANT: MAIL_FROM MUST match the authenticated account for Gmail to accept the send.
    # If a custom MAIL_FROM is set and differs from username, Gmail will reject the email.
    mail_from = os.getenv("MAIL_FROM") or username
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    return {
        "username": username,
        "password": password,
        "server": server,
        "port": port,
        "mail_from": mail_from,
        "frontend_url": frontend_url,
    }

def _send_email(cfg: dict, to_email: str, subject: str, text_body: str, html_body: str):
    """Core send helper. Raises on failure so callers can handle/log it."""
    if not cfg["username"] or not cfg["password"]:
        raise RuntimeError("Email credentials (EMAIL_USER / EMAIL_PASS) are not configured in .env")

    msg = MIMEMultipart('alternative')
    msg['From']    = cfg["mail_from"]
    msg['To']      = to_email
    msg['Subject'] = subject
    msg.add_header('Reply-To', cfg["mail_from"])
    msg.attach(MIMEText(text_body, 'plain'))
    msg.attach(MIMEText(html_body, 'html'))

    context = ssl.create_default_context()
    if cfg["port"] == 465:
        with smtplib.SMTP_SSL(cfg["server"], cfg["port"], context=context) as server:
            server.login(cfg["username"], cfg["password"])
            server.sendmail(cfg["mail_from"], to_email, msg.as_string())
    else:
        with smtplib.SMTP(cfg["server"], cfg["port"]) as server:
            server.starttls(context=context)
            server.login(cfg["username"], cfg["password"])
            server.sendmail(cfg["mail_from"], to_email, msg.as_string())

def generate_temp_password(length=10):
    characters = string.ascii_letters + string.digits + "!@#$%"
    password = (
        random.choice(string.ascii_uppercase) +
        random.choice(string.ascii_lowercase) +
        random.choice(string.digits) +
        random.choice("!@#$%") +
        ''.join(random.choices(characters, k=length - 4))
    )
    return ''.join(random.sample(password, len(password)))

def validate_password_policy(password: str):
    errors = []
    if len(password) < 8:
        errors.append("Password must be at least 8 characters long")
    if not any(c.isupper() for c in password):
        errors.append("Password must contain at least one uppercase letter")
    if not any(c.islower() for c in password):
        errors.append("Password must contain at least one lowercase letter")
    if not any(c.isdigit() for c in password):
        errors.append("Password must contain at least one number")
    if not any(c in "!@#$%^&*" for c in password):
        errors.append("Password must contain at least one special character (!@#$%^&*)")
    return errors

def send_onboarding_email(email: str, name: str, temp_password: str):
    cfg = _get_email_config()
    FRONTEND_URL = cfg["frontend_url"]

    html_body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4F46E5; margin: 0;">Welcome to Taskify!</h1>
            <p style="color: #6B7280; font-size: 16px;">Your ultimate task management solution.</p>
        </div>
        
        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <p style="margin-top: 0; font-size: 16px;">Hello <strong>{name}</strong>,</p>
            <p>We are thrilled to have you on board! Your account has been successfully created by your administrator.</p>
            
            <div style="background-color: #ffffff; padding: 15px; border-left: 4px solid #4F46E5; margin: 20px 0;">
                <p style="margin: 0 0 10px 0;"><strong>Your Login Credentials:</strong></p>
                <p style="margin: 0;">Email: <strong>{email}</strong></p>
                <p style="margin: 5px 0 0 0;">Temporary Password: <strong style="color: #DC2626;">{temp_password}</strong></p>
            </div>
            
            <p style="color: #DC2626; font-weight: bold; font-size: 14px;">⚠️ IMPORTANT: You must change your password on your first login.</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{FRONTEND_URL}/first-login-reset?temp={quote(temp_password, safe='')}" style="background-color: #4F46E5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Set Your Password Now</a>
        </div>
        
        <div style="font-size: 13px; color: #6B7280; border-top: 1px solid #E5E7EB; padding-top: 20px;">
            <p style="margin: 0 0 5px 0;"><strong>Password Requirements:</strong></p>
            <ul style="margin: 0; padding-left: 20px;">
                <li>Minimum 8 characters</li>
                <li>At least one uppercase and one lowercase letter</li>
                <li>At least one number</li>
                <li>At least one special character (!@#$%^&*)</li>
            </ul>
        </div>
        
        <p style="font-size: 14px; margin-top: 30px;">Best regards,<br><strong>The Taskify Team</strong></p>
    </body>
    </html>
    """

    text_body = f"""
    Welcome to Taskify!
    
    Hello {name},
    We are thrilled to have you on board! Your account has been successfully created by your administrator.
    
    Your Login Credentials:
    Email: {email}
    Temporary Password: {temp_password}
    
    IMPORTANT: You must change your password on your first login.
    
    Set Your Password Now: {FRONTEND_URL}/first-login-reset?temp={quote(temp_password, safe='')}
    
    Password Requirements:
    - Minimum 8 characters
    - At least one uppercase and one lowercase letter
    - At least one number
    - At least one special character (!@#$%^&*)
    
    Best regards,
    The Taskify Team
    """

    try:
        _send_email(cfg, email, "Welcome to Taskify - Your Login Credentials", text_body, html_body)
        print(f"[EMAIL] Onboarding email sent successfully to {email}")
    except Exception as e:
        print(f"[EMAIL ERROR] Onboarding email to {email} failed: {e}")
        traceback.print_exc()

def send_password_reset_email(email: str, name: str, reset_token: str):
    cfg = _get_email_config()
    FRONTEND_URL = cfg["frontend_url"]
    reset_url = f"{FRONTEND_URL}/reset-password?token={reset_token}"

    html_body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4F46E5; margin: 0;">Taskify</h1>
        </div>
        
        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <p style="margin-top: 0; font-size: 16px;">Hello <strong>{name}</strong>,</p>
            <p>We received a request to reset your password for your Taskify account. If you didn't make this request, you can safely ignore this email.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{reset_url}" style="background-color: #4F46E5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
            </div>
            
            <p style="color: #6B7280; font-size: 13px; text-align: center;">This password reset link is only valid for the next 15 minutes.</p>
        </div>
        
        <p style="font-size: 14px; margin-top: 30px;">Best regards,<br><strong>The Taskify Team</strong></p>
    </body>
    </html>
    """

    text_body = f"""
    Taskify
    
    Hello {name},
    We received a request to reset your password for your Taskify account. If you didn't make this request, you can safely ignore this email.
    
    To reset your password, please click the link below (or copy and paste it into your browser):
    {reset_url}
    
    This password reset link is only valid for the next 15 minutes.
    
    Best regards,
    The Taskify Team
    """

    try:
        _send_email(cfg, email, "Reset Your Taskify Password", text_body, html_body)
        print(f"[EMAIL] Password reset email sent successfully to {email}")
    except Exception as e:
        print(f"[EMAIL ERROR] Password reset email to {email} failed: {e}")
        traceback.print_exc()

def send_due_soon_email(email: str, name: str, task_title: str, due_date: str):
    cfg = _get_email_config()
    FRONTEND_URL = cfg["frontend_url"]

    email_body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4F46E5; margin: 0;">Taskify</h1>
        </div>
        
        <div style="background-color: #FFFBEB; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #F59E0B;">
            <p style="margin-top: 0; font-size: 16px;">Hello <strong>{name}</strong>,</p>
            <p>This is a quick reminder that you have a task due very soon!</p>
            
            <div style="background-color: #ffffff; padding: 15px; border-radius: 4px; margin: 20px 0;">
                <p style="margin: 0 0 5px 0;">Task: <strong>{task_title}</strong></p>
                <p style="margin: 0;">Due Date: <strong style="color: #DC2626;">{due_date}</strong></p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{FRONTEND_URL}" style="background-color: #4F46E5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">View Dashboard</a>
            </div>
        </div>
        
        <p style="font-size: 14px; margin-top: 30px;">Best regards,<br><strong>The Taskify Team</strong></p>
    </body>
    </html>
    """

    text_body = f"""
    Taskify
    
    Hello {name},
    This is a quick reminder that you have a task due very soon!
    
    Task: {task_title}
    Due Date: {due_date}
    
    View your dashboard here: {FRONTEND_URL}
    
    Best regards,
    The Taskify Team
    """

    try:
        _send_email(cfg, email, f"Reminder: Task '{task_title}' is due soon!", text_body, email_body)
        print(f"[EMAIL] Due soon email sent successfully to {email}")
    except Exception as e:
        print(f"[EMAIL ERROR] Due soon email to {email} failed: {e}")
        traceback.print_exc()