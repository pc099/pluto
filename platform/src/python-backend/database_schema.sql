-- Pluto AI Platform Database Schema
-- This file contains the complete database schema for the platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    plan VARCHAR(50) DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'enterprise', 'custom')),
    monthly_quota INTEGER DEFAULT 10000,
    monthly_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'viewer')),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    api_key VARCHAR(255) UNIQUE,
    quota_limit INTEGER DEFAULT 1000,
    quota_used INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI requests table
CREATE TABLE IF NOT EXISTS ai_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    request_content TEXT NOT NULL,
    response_content TEXT,
    provider VARCHAR(50),
    model VARCHAR(100),
    input_tokens INTEGER,
    output_tokens INTEGER,
    total_tokens INTEGER,
    cost DECIMAL(10,6),
    duration FLOAT,
    success BOOLEAN,
    status_code INTEGER,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hallucination detections table
CREATE TABLE IF NOT EXISTS hallucination_detections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES ai_requests(id) ON DELETE CASCADE,
    hallucination_type VARCHAR(50) CHECK (hallucination_type IN ('factual', 'numerical', 'citation', 'consistency')),
    severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high')),
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    detected_issues JSONB,
    verification_status VARCHAR(20) CHECK (verification_status IN ('verified', 'unverified', 'pending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quality analyses table
CREATE TABLE IF NOT EXISTS quality_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES ai_requests(id) ON DELETE CASCADE,
    quality_score DECIMAL(3,2) CHECK (quality_score >= 0 AND quality_score <= 1),
    bias_score DECIMAL(3,2) CHECK (bias_score >= 0 AND bias_score <= 1),
    relevance_score DECIMAL(3,2) CHECK (relevance_score >= 0 AND relevance_score <= 1),
    completeness_score DECIMAL(3,2) CHECK (completeness_score >= 0 AND completeness_score <= 1),
    analysis_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Compliance checks table
CREATE TABLE IF NOT EXISTS compliance_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES ai_requests(id) ON DELETE CASCADE,
    compliance_framework VARCHAR(50) CHECK (compliance_framework IN ('gdpr', 'ai_act', 'ccpa', 'sox')),
    compliance_status VARCHAR(20) CHECK (compliance_status IN ('compliant', 'non_compliant', 'requires_review')),
    risk_level VARCHAR(20) CHECK (risk_level IN ('low', 'medium', 'high')),
    compliance_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions table (for JWT token management)
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API usage logs table
CREATE TABLE IF NOT EXISTS api_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER,
    response_time FLOAT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_api_key ON users(api_key);
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_requests_user_id ON ai_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_requests_organization_id ON ai_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_requests_created_at ON ai_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_hallucination_detections_request_id ON hallucination_detections(request_id);
CREATE INDEX IF NOT EXISTS idx_quality_analyses_request_id ON quality_analyses(request_id);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_request_id ON compliance_checks(request_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_user_id ON api_usage_logs(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123)
INSERT INTO organizations (id, name, plan, monthly_quota) 
VALUES ('00000000-0000-0000-0000-000000000001', 'Pluto AI', 'enterprise', 1000000)
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, email, password_hash, first_name, last_name, role, organization_id, api_key, quota_limit)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin@pluto.ai',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2a', -- admin123
    'Admin',
    'User',
    'admin',
    '00000000-0000-0000-0000-000000000001',
    'pluto-admin-key-2024',
    10000
) ON CONFLICT (email) DO NOTHING;
