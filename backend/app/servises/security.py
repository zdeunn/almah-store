import hashlib
import re
import bcrypt

# تعبير نمطي للتحقق من صيغة تشفير bcrypt الصحيحة ($2a$, $2b$, أو $2y$)
BCRYPT_PREFIX_REGEX = re.compile(r"^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$")


def _prepare_password(password: str) -> bytes:
    """تشفير مسبق عبر SHA-256 لتجاوز حد 72 بايت في bcrypt بشكل آمن وبدون مشاكل ترميز."""
    digest = hashlib.sha256(password.encode("utf-8")).digest()
    return digest


def get_password_hash(password: str) -> str:
    if not password:
        return ""

    prepared_pwd = _prepare_password(password)
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(prepared_pwd, salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not plain_password or not hashed_password:
        return False

    # التحقق الصارم من صيغة الهيدر لـ bcrypt
    if not BCRYPT_PREFIX_REGEX.match(hashed_password):
        return False

    try:
        prepared_pwd = _prepare_password(plain_password)
        hashed_bytes = hashed_password.encode("utf-8")
        return bcrypt.checkpw(prepared_pwd, hashed_bytes)
    except (ValueError, TypeError):
        return False