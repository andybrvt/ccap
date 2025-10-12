import secrets
import string

def generate_temporary_password(length: int = 12) -> str:
    """
    Generate a secure random password with mixed characters.
    
    Args:
        length: Length of password (default 12)
        
    Returns:
        A random password containing uppercase, lowercase, digits, and special characters
    """
    # Define character sets
    lowercase = string.ascii_lowercase
    uppercase = string.ascii_uppercase
    digits = string.digits
    special = "!@#$%^&*"
    
    # Combine all character sets
    all_characters = lowercase + uppercase + digits + special
    
    # Generate password
    while True:
        password = ''.join(secrets.choice(all_characters) for _ in range(length))
        
        # Ensure password has at least one of each character type
        if (any(c.islower() for c in password) and
            any(c.isupper() for c in password) and
            any(c.isdigit() for c in password) and
            any(c in special for c in password)):
            return password

