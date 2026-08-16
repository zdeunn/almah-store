import uuid
from fastapi import APIRouter, status, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..schemas.user import UserResponse, UserRegister, GuestCreate, GuestUpgrade
from ..database import get_db
from ..models.user import User
from ..dependencies import create_access_token, get_current_user
from ..servises.security import get_password_hash, verify_password

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register(
    user_data: UserRegister,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(User).where(User.email == user_data.email)
    )
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="email already registred",
        )
    
    result = await db.execute(
        select(User).where(User.phone_number == user_data.phone_number)
    )
    existing_phone = result.scalar_one_or_none()

    if existing_phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="phone number already registred",
        )

    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        name=user_data.name,
        phone_number=user_data.phone_number,
        delivery_address=user_data.delivery_address,
        date_of_birth=user_data.date_of_birth,
        email=user_data.email,
        hashed_password=hashed_password,
        is_guest=False,
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return new_user

@router.post(
    "/login",
    status_code=status.HTTP_200_OK,
)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(User).where(User.email == form_data.username)
    )
    user = result.scalar_one_or_none()

    if user is None or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="incorrect email or password",
        )
    
    token = create_access_token(user.id)

    return {
        "access_token": token,
        "token_type": "bearer"
    }

@router.post(
    "/guest",
    status_code=status.HTTP_200_OK,
)
async def guest_checkout(
    guest_data:GuestCreate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(User).where(User.phone_number == guest_data.phone_number)
    )
    existing_user = result.scalar_one_or_none()

    if existing_user and existing_user.is_guest:
        token = create_access_token(existing_user.id)
        return {
            "access_token": token,
            "token_type": "bearer",
            "message":"welcome back!! complete your regestration to unlock more features."
        }

    if existing_user and not existing_user.is_guest:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="phone number already registered, please login"
        )

    new_guest = User(
            name=guest_data.name,
            phone_number=guest_data.phone_number,
            delivery_address=guest_data.delivery_address,
            email=f"guest_{uuid.uuid4()}@guest.com",
            hashed_password="",
            is_guest=True,
        )
    
    db.add(new_guest)
    await db.commit()
    await db.refresh(new_guest)

    token = create_access_token(new_guest.id)

    return {
        "access_token": token,
        "token_type": "bearer",
        "message": "you can browse and shop! register for a full account to get exclusive benifits."
    }

@router.post(
    "/upgrade",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
)
async def upgrade_guest(
    upgrade_data: GuestUpgrade,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not current_user.is_guest:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="account is already registred"
        )
    
    result = await db.execute(
        select(User).where(User.email == upgrade_data.email)
    )
    existing_email = result.scalar_one_or_none()

    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="email already registred",
        )
    
    current_user.email = upgrade_data.email
    current_user.hashed_password = get_password_hash(upgrade_data.password)
    current_user.date_of_birth = upgrade_data.date_of_birth
    current_user.is_guest = False

    await db.commit()
    await db.refresh(current_user)

    return current_userme
    