# models/request_log.py
from datetime import datetime
from typing import Dict, Any, Optional
import uuid

class RequestLog:
    """Model for logging AI API requests"""
    
    def __init__(self):
        self.id = str(uuid.uuid4())
        self.timestamp = datetime.utcnow().isoformat()
    
    @staticmethod
    def create_log_entry(
        provider: str,
        endpoint: str,
        user_id: str = None,
        team_id: str = None,
        model: str = None,
        input_tokens: int = 0,
        output_tokens: int = 0,
        total_cost: float = 0.0,
        duration: float = 0.0,
        status_code: int = 200,
        error_message: str = None
    ) -> Dict[str, Any]:
        """Create a log entry for database storage"""
        
        return {
            'id': str(uuid.uuid4()),
            'timestamp': datetime.utcnow().isoformat(),
            'provider': provider,
            'endpoint': endpoint,
            'user_id': user_id,
            'team_id': team_id,
            'model': model,
            'input_tokens': input_tokens,
            'output_tokens': output_tokens,
            'total_tokens': input_tokens + output_tokens,
            'total_cost': round(total_cost, 6),
            'duration_seconds': round(duration, 3),
            'status_code': status_code,
            'error_message': error_message,
            'success': status_code < 400
        }

# SQL schema for Supabase
REQUEST_LOGS_SCHEMA = """
CREATE TABLE IF NOT EXISTS ai_request_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    provider TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    user_id TEXT,
    team_id TEXT,
    model TEXT,
    input_tokens INTEGER DEFAULT 0,
    output_tokens INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    total_cost DECIMAL(10,6) DEFAULT 0,
    duration_seconds DECIMAL(8,3) DEFAULT 0,
    status_code INTEGER DEFAULT 200,
    error_message TEXT,
    success BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_request_logs_timestamp ON ai_request_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_ai_request_logs_user_id ON ai_request_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_request_logs_team_id ON ai_request_logs(team_id);
CREATE INDEX IF NOT EXISTS idx_ai_request_logs_provider ON ai_request_logs(provider);
CREATE INDEX IF NOT EXISTS idx_ai_request_logs_model ON ai_request_logs(model);

-- Create view for cost aggregations
CREATE OR REPLACE VIEW ai_cost_summary AS
SELECT 
    DATE(timestamp) as date,
    provider,
    model,
    user_id,
    team_id,
    COUNT(*) as request_count,
    SUM(input_tokens) as total_input_tokens,
    SUM(output_tokens) as total_output_tokens,
    SUM(total_tokens) as total_tokens,
    SUM(total_cost) as total_cost,
    AVG(duration_seconds) as avg_duration,
    COUNT(CASE WHEN success = false THEN 1 END) as error_count
FROM ai_request_logs
GROUP BY DATE(timestamp), provider, model, user_id, team_id;
"""