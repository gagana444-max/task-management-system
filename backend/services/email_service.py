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

async def send_onboarding_email(email: str, name: str, temp_password: str):
    MAIL_USERNAME = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
    MAIL_FROM = os.getenv("MAIL_FROM", "noreply@tms.com")
    MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT = int(os.getenv("MAIL_PORT", "465"))

    email_body = f"""
    Dear {name},

    Welcome to the Task Management System!

    Your account has been created. Please use the following credentials to log in:

    Email: {email}
    Temporary Password: {temp_password}

    IMPORTANT: You must change your password on first login.

    Password requirements:
    - Minimum 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one number
    - At least one special character (!@#$%^&*)

    Please login at: http://localhost:3000

    Best regards,
    TMS Team
    """

    try:
        msg = MIMEMultipart()
        msg['From'] = MAIL_FROM
        msg['To'] = email
        msg['Subject'] = "Welcome to Task Management System - Your Login Credentials"
        msg.attach(MIMEText(email_body, 'plain'))

        if MAIL_USERNAME and MAIL_PASSWORD:
            context = ssl.create_default_context()
            with smtplib.SMTP_SSL(MAIL_SERVER, MAIL_PORT, context=context) as server:
                server.login(MAIL_USERNAME, MAIL_PASSWORD)
                server.sendmail(MAIL_FROM, email, msg.as_string())
            print(f"Email sent successfully to {email}")
        else:
            print(f"[DEV MODE] Email to {email}:")
            print(email_body)

    except Exception as e:
        print(f"Email sending failed: {e}")