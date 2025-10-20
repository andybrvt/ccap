import os
from typing import List, Optional, Dict
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content, Attachment
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
        db_session=None,
        attachments: Optional[List[Dict]] = None
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
        
        # Check if there are any recipients
        if not to or len(to) == 0:
            logger.warning("No recipients provided for email")
            if db_session:
                await self._log_email_attempt(db_session, to, subject, body, False, "No recipients provided")
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
            
            # Add attachments if provided
            if attachments:
                for attachment_data in attachments:
                    attachment = Attachment(
                        file_content=attachment_data["content"],
                        file_type=attachment_data["type"],
                        file_name=attachment_data["filename"],
                        disposition=attachment_data.get("disposition", "attachment"),
                        content_id=attachment_data.get("content_id")
                    )
                    mail.add_attachment(attachment)
            
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
        db_session=None,
        attachments: Optional[List[Dict]] = None
    ) -> bool:
        """Send welcome email to student after onboarding completion"""
        subject = "Welcome to the C•CAP Pre-Apprenticeship Program!"
        
        body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <p>Hello,</p>
            <p>Welcome to the C•CAP Pre-Apprenticeship Program! You are receiving this email because you have submitted your information by using the Pre-Apprentice Registration platform provided to you via your culinary teacher or a C•CAP representative. Please read to the bottom of this email for next steps.</p>
            
            <p>All participants are required to take part in our Cook the Book program. This year, we will be reading <strong>The Apprentice: My Life in the Kitchen by Jacques Pépin</strong>.</p>
            
            <p><strong>Cook the Book requirements include:</strong></p>
            <ul>
                <li>Reading at least two chapters of the book each month</li>
                <li>Preparing the recipe found at the end of each chapter (some chapters include multiple recipes—you may choose which one to cook, see attachment with Chapter Guidelines)</li>
                <li>Using the attached Recipe Schedule and Substitutions (some recipes call for alcohol, you are required to use a substitution)</li>
                <li>Taking pictures of each chapter's final, plated recipe and uploading photos to your C•CAP /newly created profile</li>
            </ul>
            
            <p><strong>Other program requirements include:</strong></p>
            <ul>
                <li>Enrolling in the Rouxbe Online Culinary Program - ask your Culinary Teacher for your login</li>
                <li>Attending live, virtual cooking demonstrations (see attached schedule, attendance is optional but highly recommended)</li>
                <li>Informing C•CAP when you are eligible and ready to work</li>
                <li>Attending video calls with C•CAP when you are eligible and ready to work</li>
            </ul>
            
            <p><strong>Next steps:</strong></p>
            <ol>
                <li>Obtain a copy of the book The Apprentice: My Life in the Kitchen by Jacques Pépin. If you do not have a copy of the book, send me an email at jsmith@culinarycareers.org and include your home address (Street, City, State, Zip Code) - a book will be mailed to you at the address you provide so please review for accuracy</li>
                <li>Enroll in the Rouxbe Online Culinary Program - ask your Culinary Teacher for access.</li>
                <li>Read and cook Chapter 1 recipe, Eggs Jeannette and Chapter 2 Maman's Cheese Souffle recipe within the first month of enrolling in C•CAP Pre-Apprentice Program. (see Chapter Guidelines document attached for Rouxbe lessons, videos, and recipe cost and ingredient information.)</li>
            </ol>
            
            <p>C•CAP will be tracking your progress throughout the program, so it's important that you meet all deadlines. This helps us assess your readiness for job opportunities.</p>
            
            <p>We are excited to guide you on your culinary journey.</p>
            
            <p>Best regards,<br>
            Lori Wright<br>
            Apprenticeship Coordinator</p>
            
            <!-- Signature image placeholder -->
            <img src="cid:lori_wright_signature" alt="Lori Wright Signature" style="max-width: 200px; height: auto; margin-top: 20px;">
        </body>
        </html>
        """
        
        return await self.send_email(
            to=[student_email],
            subject=subject,
            body=body,
            db_session=db_session,
            attachments=attachments
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
        from datetime import datetime
        
        subject = f"New Student Enrollment: {student_name}"
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2>New Student Completed Onboarding</h2>
            <p><strong>Name:</strong> {student_name}</p>
            <p><strong>Email:</strong> {student_email}</p>
            <p><strong>School:</strong> {student_school}</p>
            <p><strong>Completed:</strong> {current_time}</p>
        </body>
        </html>
        """
        
        return await self.send_email(
            to=admin_emails,
            subject=subject,
            body=body,
            db_session=db_session
        )


# Global email service instance
email_service = EmailService()
