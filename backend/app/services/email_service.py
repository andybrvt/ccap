import os
from typing import List
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content
import logging
from datetime import datetime
import ssl
import urllib3

logger = logging.getLogger(__name__)

# Disable SSL warnings for development
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


class EmailService:
    def __init__(self):
        self.api_key = os.getenv("SENDGRID_API_KEY")
        self.from_email = os.getenv("MAIL_FROM", "andybrvt@gmail.com")
        self.from_name = os.getenv("MAIL_FROM_NAME", "C-CAP Apprentice Program")
        
        if not self.api_key:
            logger.warning("SENDGRID_API_KEY not found in environment variables")
            self.sg = None
        else:
            # Disable SSL verification globally for development
            ssl._create_default_https_context = ssl._create_unverified_context
            self.sg = SendGridAPIClient(api_key=self.api_key)

    async def send_email(
        self,
        to: List[str],
        subject: str,
        body: str,
        db_session=None
    ) -> bool:
        """
        Send an email using SendGrid and log the attempt
        
        Args:
            to: List of recipient email addresses
            subject: Email subject
            body: Email body (HTML or plain text)
            db_session: Database session for logging (optional)
        
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        if not self.sg:
            logger.error("SendGrid not configured - SENDGRID_API_KEY missing")
            if db_session:
                await self._log_email_attempt(db_session, to, subject, body, False, "SendGrid not configured")
            return False
            
        try:
            # Create the email
            from_email = Email(self.from_email, self.from_name)
            to_emails = [To(email) for email in to]
            
            # Determine content type
            content_type = "text/html" if "<html>" in body.lower() else "text/plain"
            content = Content(content_type, body)
            
            # Create the mail object
            mail = Mail(from_email, to_emails, subject, content)
            
            # Send the email
            response = self.sg.send(mail)
            
            if response.status_code in [200, 201, 202]:
                logger.info(f"Email sent successfully to {', '.join(to)}")
                if db_session:
                    await self._log_email_attempt(db_session, to, subject, body, True, None)
                return True
            else:
                error_msg = f"SendGrid error: {response.status_code} - {response.body}"
                logger.error(error_msg)
                if db_session:
                    await self._log_email_attempt(db_session, to, subject, body, False, error_msg)
                return False
                
        except Exception as e:
            error_msg = f"Failed to send email to {', '.join(to)}: {str(e)}"
            logger.error(error_msg)
            if db_session:
                await self._log_email_attempt(db_session, to, subject, body, False, error_msg)
            return False

    async def _log_email_attempt(self, db_session, to: List[str], subject: str, body: str, success: bool, error_message: str = None):
        """Log email attempt to database"""
        try:
            from app.models.email_log import EmailLog
            
            # Create log entry for each recipient
            for email in to:
                email_log = EmailLog(
                    to_email=email,
                    subject=subject,
                    body=body,
                    sent_at=datetime.now(),
                    status="success" if success else "failed",
                    error_message=error_message
                )
                db_session.add(email_log)
            
            db_session.commit()
        except Exception as e:
            logger.error(f"Failed to log email attempt: {str(e)}")
            db_session.rollback()

    async def send_student_welcome_email(
        self,
        student_email: str,
        student_name: str,
        db_session=None
    ) -> bool:
        """Send welcome email to student after onboarding completion"""
        subject = "Welcome to C-CAP Apprentice Program!"
        
        body = f"""
        <h2>Welcome to C-CAP, {student_name}!</h2>
        <p>Congratulations on completing your enrollment in the C-CAP Apprentice Program!</p>
        <p>You're now officially part of our community and can start exploring opportunities in the culinary world.</p>
        <p>We're excited to have you on board!</p>
        <br>
        <p>Best regards,<br>
        The C-CAP Team</p>
        """
        
        return await self.send_email(
            to=[student_email],
            subject=subject,
            body=body,
            db_session=db_session
        )

    async def send_admin_notification_email(
        self,
        admin_emails: List[str],
        student_name: str,
        student_email: str,
        student_school: str,
        db_session=None
    ) -> bool:
        """Send notification email to admins when student completes onboarding"""
        subject = f"New Student Enrollment: {student_name}"
        
        body = f"""
        <h2>New Student Enrollment Notification</h2>
        <p>A new student has completed their enrollment in the C-CAP Apprentice Program:</p>
        <ul>
            <li><strong>Name:</strong> {student_name}</li>
            <li><strong>Email:</strong> {student_email}</li>
            <li><strong>School:</strong> {student_school}</li>
        </ul>
        <p>Please review their profile and assign them to the appropriate program stage.</p>
        <br>
        <p>C-CAP System</p>
        """
        
        return await self.send_email(
            to=admin_emails,
            subject=subject,
            body=body,
            db_session=db_session
        )


# Global email service instance
email_service = EmailService()
