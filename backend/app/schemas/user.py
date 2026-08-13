from pydantic import BaseModel, EmailStr
from typing import Optional


class ResetPasswordRequest(BaseModel):
    new_password: str


# REGISTER SCHEMA
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


# LOGIN SCHEMA
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# UPDATE SCHEMA
class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None


# RESPONSE SCHEMA
from typing import List


class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    roles: List[str]

    class Config:
        from_attributes = True
        orm_mode = True


from typing import Literal


class AssignRoleRequest(BaseModel):
    role: Literal["Admin", "Employee", "Viewer"]
