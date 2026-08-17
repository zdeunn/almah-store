from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    if not password:
        return ""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not hashed_password or not hashed_password.startswith("$2"): 
        return False
    return pwd_context.verify(plain_password, hashed_password)
