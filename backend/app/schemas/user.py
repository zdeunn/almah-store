from pydantic import BaseModel, EmailStr, ConfigDict, field_validator
from datetime import date, datetime
import phonenumbers
import re

MIN_PASSWORD_LENGTH = 8 
MAX_PASSWORD_LENGTH = 64

EMOJI_PATTERN = re.compile(
    "["
    "\U0001F300-\U0001FAFF"  # symbols & pictographs, emoticons, transport, supplemental
    "\U00002600-\U000027BF"  # misc symbols & dingbats
    "\U0001F1E6-\U0001F1FF"  # flags
    "]+",
    flags=re.UNICODE,
)

ALLOWED_NAME_CHARS = re.compile(r"^[\w\s'\-]+$", flags=re.UNICODE)

def validate_password_length(value: str) -> str: 
    
    if len(value) < MIN_PASSWORD_LENGTH:
        raise ValueError(f"password must be at least {MIN_PASSWORD_LENGTH} characters")
    if len(value) > MAX_PASSWORD_LENGTH:
        raise ValueError(f"password must be at most {MAX_PASSWORD_LENGTH} characters")
    
    return value

class UserBase(BaseModel):
    name: str
    phone_number: str
    delivery_address: str

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        cleaned = value.strip()

        if not cleaned:
            raise ValueError("name cannot be empty")
        
        if EMOJI_PATTERN.search(cleaned):
            raise ValueError("name cannot contain emojis")
        
        if any(char.isdigit() for char in cleaned):
            raise ValueError("name cannot contain numbers")
        
        if not ALLOWED_NAME_CHARS.match(cleaned):
            raise ValueError("name can only cantain letters, spaces, hyphens and apostrophes.")

        return cleaned

    @field_validator('phone_number', mode='before')
    @classmethod
    def format_and_validate_algerian_phone(cls, value: str) -> str:
        if not value:
            raise ValueError("يرجى إدخال رقم الهاتف")

        # 1. تحويل القيمة لنص وتنظيف أي مسافات أو رموز
        raw_val = str(value).strip()
        cleaned = re.sub(r'[\s\-\(\)\.]', '', raw_val)

        # 2. تحويل الصيغ الدولية المسبوقة بـ +213 أو 00213 إلى الصيغة المحلية (0x)
        if cleaned.startswith("+213"):
            cleaned = "0" + cleaned[4:]
        elif cleaned.startswith("00213"):
            cleaned = "0" + cleaned[5:]

        # 3. التحقق من الرقم المحلي (05, 06, 07 للمحمول أو 02x, 03x, 04x للثابت)
        pattern = r'^0(5|6|7|[2-4][0-9])[0-9]{7,8}$'
        
        if not re.match(pattern, cleaned):
            raise ValueError("رقم الهاتف غير صحيح، يرجى إدخال رقم هاتف جزائري مقبول")

        # 4. الترجيع بالصيغة الدولية الموحدة +213XXXXXXXXX
        return "+213" + cleaned[1:]

class GuestCreate(UserBase):
    pass

class UserRegister(UserBase):
    email: EmailStr
    date_of_birth: date | None = None
    password: str
    password_confirm: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        return validate_password_length(value)

class GuestUpgrade(BaseModel):
    email: EmailStr
    password: str
    date_of_birth: date | None = None

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        return validate_password_length(value)

class UserUpdate(BaseModel):
    name: str | None = None
    phone_number: str | None = None
    delivery_address: str | None = None
    email: EmailStr | None = None
    password: str | None = None


class UserResponse(BaseModel):
    id: int
    name: str
    phone_number: str
    delivery_address: str
    email: EmailStr

    model_config = ConfigDict(from_attributes=True)

class UserAdminResponse(UserResponse):
    date_of_birth: date
    created_at: datetime
    updated_at: datetime
    is_guest: bool 
