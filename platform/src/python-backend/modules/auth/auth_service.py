# Authentication service
import os
import secrets
import hashlib
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import jwt
from passlib.context import CryptContext
from supabase import create_client, Client
from .models import UserCreate, UserLogin, UserResponse, OrganizationCreate, OrganizationResponse, TokenResponse, UserRole, OrganizationPlan

class AuthenticationService:
    def __init__(self):
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        self.secret_key = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
        self.algorithm = "HS256"
        self.access_token_expire_minutes = 30
        
        # Initialize Supabase client
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
        
        if supabase_url and supabase_key:
            self.supabase: Client = create_client(supabase_url, supabase_key)
        else:
            self.supabase = None
            print("Warning: Supabase not configured, using mock data")
    
    def hash_password(self, password: str) -> str:
        """Hash a password using bcrypt"""
        # Truncate password to 72 bytes to avoid bcrypt limitation
        password_bytes = password.encode('utf-8')
        if len(password_bytes) > 72:
            password = password_bytes[:72].decode('utf-8', errors='ignore')
        return self.pwd_context.hash(password)
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        # Truncate password to 72 bytes to avoid bcrypt limitation
        password_bytes = plain_password.encode('utf-8')
        if len(password_bytes) > 72:
            plain_password = password_bytes[:72].decode('utf-8', errors='ignore')
        return self.pwd_context.verify(plain_password, hashed_password)
    
    def generate_api_key(self) -> str:
        """Generate a secure API key"""
        return secrets.token_urlsafe(32)
    
    def create_access_token(self, data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """Create a JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt
    
    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify and decode a JWT token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except jwt.PyJWTError:
            return None
    
    async def create_organization(self, org_data: OrganizationCreate) -> Optional[OrganizationResponse]:
        """Create a new organization"""
        if not self.supabase:
            # Mock response for development
            return OrganizationResponse(
                id="mock-org-id",
                name=org_data.name,
                plan=org_data.plan,
                monthly_quota=10000 if org_data.plan == OrganizationPlan.STARTER else 50000,
                monthly_used=0,
                created_at=datetime.utcnow()
            )
        
        try:
            # Set quota based on plan
            quota_map = {
                OrganizationPlan.STARTER: 10000,
                OrganizationPlan.PROFESSIONAL: 50000,
                OrganizationPlan.ENTERPRISE: 200000,
                OrganizationPlan.CUSTOM: 1000000
            }
            
            org_data_dict = {
                "name": org_data.name,
                "plan": org_data.plan.value,
                "monthly_quota": quota_map[org_data.plan],
                "monthly_used": 0
            }
            
            response = self.supabase.table('organizations').insert(org_data_dict).execute()
            
            if response.data:
                org = response.data[0]
                return OrganizationResponse(
                    id=org['id'],
                    name=org['name'],
                    plan=OrganizationPlan(org['plan']),
                    monthly_quota=org['monthly_quota'],
                    monthly_used=org['monthly_used'],
                    created_at=datetime.fromisoformat(org['created_at'].replace('Z', '+00:00'))
                )
        except Exception as e:
            print(f"Error creating organization: {e}")
        
        return None
    
    async def create_user(self, user_data: UserCreate) -> Optional[UserResponse]:
        """Create a new user"""
        if not self.supabase:
            # Mock response for development
            return UserResponse(
                id="mock-user-id",
                email=user_data.email,
                first_name=user_data.first_name,
                last_name=user_data.last_name,
                role=UserRole.USER,
                organization_id="mock-org-id",
                api_key=self.generate_api_key(),
                quota_limit=1000,
                quota_used=0,
                is_active=True,
                created_at=datetime.utcnow()
            )
        
        try:
            # Create organization if provided
            organization_id = None
            if user_data.organization_name:
                org_data = OrganizationCreate(name=user_data.organization_name)
                org = await self.create_organization(org_data)
                if org:
                    organization_id = org.id
            
            # Hash password
            hashed_password = self.hash_password(user_data.password)
            
            # Generate API key
            api_key = self.generate_api_key()
            
            user_data_dict = {
                "email": user_data.email,
                "password_hash": hashed_password,
                "first_name": user_data.first_name,
                "last_name": user_data.last_name,
                "role": UserRole.USER.value,
                "organization_id": organization_id,
                "api_key": api_key,
                "quota_limit": 1000,
                "quota_used": 0,
                "is_active": True
            }
            
            response = self.supabase.table('users').insert(user_data_dict).execute()
            
            if response.data:
                user = response.data[0]
                return UserResponse(
                    id=user['id'],
                    email=user['email'],
                    first_name=user['first_name'],
                    last_name=user['last_name'],
                    role=UserRole(user['role']),
                    organization_id=user['organization_id'],
                    api_key=user['api_key'],
                    quota_limit=user['quota_limit'],
                    quota_used=user['quota_used'],
                    is_active=user['is_active'],
                    created_at=datetime.fromisoformat(user['created_at'].replace('Z', '+00:00'))
                )
        except Exception as e:
            print(f"Error creating user: {e}")
        
        return None
    
    async def authenticate_user(self, login_data: UserLogin) -> Optional[UserResponse]:
        """Authenticate a user with email and password"""
        if not self.supabase:
            # Mock authentication for development
            if login_data.email == "admin@pluto.ai" and login_data.password == "admin123":
                return UserResponse(
                    id="mock-admin-id",
                    email=login_data.email,
                    first_name="Admin",
                    last_name="User",
                    role=UserRole.ADMIN,
                    organization_id="mock-org-id",
                    api_key="mock-api-key",
                    quota_limit=10000,
                    quota_used=0,
                    is_active=True,
                    created_at=datetime.utcnow()
                )
            return None
        
        try:
            response = self.supabase.table('users').select('*').eq('email', login_data.email).eq('is_active', True).execute()
            
            if response.data:
                user = response.data[0]
                if self.verify_password(login_data.password, user['password_hash']):
                    return UserResponse(
                        id=user['id'],
                        email=user['email'],
                        first_name=user['first_name'],
                        last_name=user['last_name'],
                        role=UserRole(user['role']),
                        organization_id=user['organization_id'],
                        api_key=user['api_key'],
                        quota_limit=user['quota_limit'],
                        quota_used=user['quota_used'],
                        is_active=user['is_active'],
                        created_at=datetime.fromisoformat(user['created_at'].replace('Z', '+00:00'))
                    )
        except Exception as e:
            print(f"Error authenticating user: {e}")
        
        return None
    
    async def get_user_by_id(self, user_id: str) -> Optional[UserResponse]:
        """Get user by ID"""
        if not self.supabase:
            return None
        
        try:
            response = self.supabase.table('users').select('*').eq('id', user_id).eq('is_active', True).execute()
            
            if response.data:
                user = response.data[0]
                return UserResponse(
                    id=user['id'],
                    email=user['email'],
                    first_name=user['first_name'],
                    last_name=user['last_name'],
                    role=UserRole(user['role']),
                    organization_id=user['organization_id'],
                    api_key=user['api_key'],
                    quota_limit=user['quota_limit'],
                    quota_used=user['quota_used'],
                    is_active=user['is_active'],
                    created_at=datetime.fromisoformat(user['created_at'].replace('Z', '+00:00'))
                )
        except Exception as e:
            print(f"Error getting user: {e}")
        
        return None
    
    async def get_user_by_api_key(self, api_key: str) -> Optional[UserResponse]:
        """Get user by API key"""
        if not self.supabase:
            return None
        
        try:
            response = self.supabase.table('users').select('*').eq('api_key', api_key).eq('is_active', True).execute()
            
            if response.data:
                user = response.data[0]
                return UserResponse(
                    id=user['id'],
                    email=user['email'],
                    first_name=user['first_name'],
                    last_name=user['last_name'],
                    role=UserRole(user['role']),
                    organization_id=user['organization_id'],
                    api_key=user['api_key'],
                    quota_limit=user['quota_limit'],
                    quota_used=user['quota_used'],
                    is_active=user['is_active'],
                    created_at=datetime.fromisoformat(user['created_at'].replace('Z', '+00:00'))
                )
        except Exception as e:
            print(f"Error getting user by API key: {e}")
        
        return None
    
    async def update_user_quota(self, user_id: str, tokens_used: int) -> bool:
        """Update user's quota usage"""
        if not self.supabase:
            return True
        
        try:
            response = self.supabase.table('users').update({
                'quota_used': tokens_used
            }).eq('id', user_id).execute()
            
            return bool(response.data)
        except Exception as e:
            print(f"Error updating user quota: {e}")
            return False

# Create singleton instance
auth_service = AuthenticationService()
