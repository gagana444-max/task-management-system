import os
import random
import string
import ssl
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

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
    MAIL_USERNAME = os.getenv("EMAIL_USER") or os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD = os.getenv("EMAIL_PASS") or os.getenv("MAIL_PASSWORD")
    MAIL_FROM = os.getenv("MAIL_FROM", "taskify.tms@gmail.com")
    MAIL_SERVER = os.getenv("EMAIL_HOST") or os.getenv("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT = int(os.getenv("EMAIL_PORT") or os.getenv("MAIL_PORT", "465"))
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

    email_body = f"""
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
            <a href="{FRONTEND_URL}/login" style="background-color: #4F46E5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Login to Taskify Now</a>
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

    try:
        msg = MIMEMultipart('alternative')
        msg['From'] = MAIL_FROM
        msg['To'] = email
        msg['Subject'] = "Welcome to Taskify - Your Login Credentials"
        msg.attach(MIMEText(email_body, 'html'))

        print(f"[DEV MODE] Email to {email}:")
        print(email_body)

        if MAIL_USERNAME and MAIL_PASSWORD:
            context = ssl.create_default_context()
            if MAIL_PORT == 465:
                with smtplib.SMTP_SSL(MAIL_SERVER, MAIL_PORT, context=context) as server:
                    server.login(MAIL_USERNAME, MAIL_PASSWORD)
                    server.sendmail(MAIL_FROM, email, msg.as_string())
            else:
                with smtplib.SMTP(MAIL_SERVER, MAIL_PORT) as server:
                    server.starttls(context=context)
                    server.login(MAIL_USERNAME, MAIL_PASSWORD)
                    server.sendmail(MAIL_FROM, email, msg.as_string())
            print(f"Email sent successfully to {email}")

    except Exception as e:
        print(f"Email sending failed: {e}")