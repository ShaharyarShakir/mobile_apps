import hashlib
import os


def get_password_hash(password: str) -> str:
    """Generate a secure PBKDF2 hash for a password."""
    salt = os.urandom(16)
    # 100,000 iterations is recommended for pbkdf2_hmac with sha256
    pwdhash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000)
    return f"{salt.hex()}:{pwdhash.hex()}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against the stored PBKDF2 hash."""
    try:
        salt_hex, hash_hex = hashed_password.split(":")
        salt = bytes.fromhex(salt_hex)
        pwdhash = hashlib.pbkdf2_hmac(
            "sha256", plain_password.encode("utf-8"), salt, 100000
        )
        return pwdhash.hex() == hash_hex
    except Exception:
        return False
