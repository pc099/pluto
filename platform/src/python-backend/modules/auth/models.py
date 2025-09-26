# Authentication models
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"
    VIEWER = "viewer"

class OrganizationPlan(str, Enum):
    STARTER = "starter"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"
    CUSTOM = "custom"

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    organization_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    role: UserRole
    organization_id: Optional[str]
    api_key: Optional[str]
    quota_limit: int
    quota_used: int
    is_active: bool
    created_at: datetime

class OrganizationCreate(BaseModel):
    name: str
    plan: OrganizationPlan = OrganizationPlan.STARTER

class OrganizationResponse(BaseModel):
    id: str
    name: str
    plan: OrganizationPlan
    monthly_quota: int
    monthly_used: int
    created_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    user: UserResponse

class PasswordReset(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str
