from datetime import datetime
import re
from pydantic import BaseModel, Field, field_validator

EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: str = Field(max_length=255)
    password: str = Field(min_length=8, max_length=72)

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str) -> str:
        normalized = value.strip()

        if len(normalized) < 3:
            raise ValueError("Username must be at least 3 characters.")

        return normalized

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        normalized = value.strip().lower()

        if not EMAIL_PATTERN.match(normalized):
            raise ValueError("Enter a valid email address.")

        return normalized


class UserLogin(BaseModel):
    username: str
    password: str

    @field_validator("username")
    @classmethod
    def normalize_username(cls, value: str) -> str:
        return value.strip()


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime | None = None

    class Config:
        from_attributes=True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

#input schema

class BlogCreate(BaseModel):
    title:str
    content:str

#output schema 

class BlogResponse(BaseModel):
    id:int
    title:str
    content:str
    user_id:int | None = None
    
    class Config:
        from_attributes=True
