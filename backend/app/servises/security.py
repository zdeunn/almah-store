import bcrypt

def get_password_hash(password: str) -> str:
    if not password:
        return ""
    # تحويل النص لـ bytes مع قص الطول أوتوماتيكياً عند 72 بايت لحماية السيرفر
    pwd_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not plain_password or not hashed_password:
        return False
    
    # حماية ضد الحسابات غير المشفرة بـ bcrypt
    if not hashed_password.startswith("$2"):
        return False

    pwd_bytes = plain_password.encode('utf-8')[:72]
    hashed_bytes = hashed_password.encode('utf-8')
    
    try:
        return bcrypt.checkpw(pwd_bytes, hashed_bytes)
    except Exception:
        return False