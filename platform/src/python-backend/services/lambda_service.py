# services/lambda_service.py
import boto3
import zipfile
import io
import json
import time
import re
from datetime import datetime
from typing import Optional, Dict, Any
from botocore.exceptions import ClientError

class LambdaDeploymentService:
    def __init__(self):
        try:
            self.lambda_client = boto3.client('lambda', region_name='us-east-1')
            self.iam_client = boto3.client('iam', region_name='us-east-1')
            self.account_id = self._get_account_id()
            self.aws_available = True
        except Exception as e:
            print(f"AWS not available: {e}")
            self.lambda_client = None
            self.iam_client = None
            self.account_id = "demo-account"
            self.aws_available = False
        
    def _get_account_id(self) -> str:
        """Get AWS account ID"""
        try:
            sts = boto3.client('sts')
            return sts.get_caller_identity()['Account']
        except Exception:
            return "demo-account"
    
    def deploy_agent(self, name: str, code: str, handler: str = "lambda_function.lambda_handler") -> Dict[str, Any]:
        """Deploy a Python agent to AWS Lambda"""
        if not self.aws_available:
            return {
                "success": True,
                "agent": {
                    "id": f"demo-{name}-{int(time.time())}",
                    "name": name,
                    "status": "running",
                    "endpoint": f"https://demo-lambda.execute-api.us-east-1.amazonaws.com/prod/{name}",
                    "created_at": datetime.utcnow().isoformat()
                },
                "message": "Demo agent deployed (AWS not available)"
            }
        
        try:
            function_name = self._generate_function_name(name)
            zip_buffer = self._create_zip_buffer(code)
            role_arn = self._ensure_lambda_execution_role()
            
            # Create Lambda function
            response = self.lambda_client.create_function(
                FunctionName=function_name,
                Runtime='python3.9',
                Role=role_arn,
                Handler=handler,
                Code={'ZipFile': zip_buffer},
                Environment={
                    'Variables': {
                        'ENVIRONMENT': 'production'
                    }
                },
                Timeout=300,  # 5 minutes
                MemorySize=512,
                Description=f'AI Agent: {name}',
            )
            
            return {
                'success': True,
                'function_name': response['FunctionName'],
                'function_arn': response['FunctionArn']
            }
            
        except Exception as e:
            print(f"Lambda deployment error: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def delete_agent(self, function_name: str) -> bool:
        """Delete a Lambda function"""
        try:
            self.lambda_client.delete_function(FunctionName=function_name)
            return True
        except Exception as e:
            print(f"Lambda deletion error: {str(e)}")
            return False
    
    def invoke_agent(self, function_name: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Invoke a Lambda function"""
        try:
            response = self.lambda_client.invoke(
                FunctionName=function_name,
                Payload=json.dumps(payload)
            )
            
            result = json.loads(response['Payload'].read())
            return result
        except Exception as e:
            print(f"Lambda invocation error: {str(e)}")
            raise e
    
    def get_agent_status(self, function_name: str) -> str:
        """Get the status of a Lambda function"""
        try:
            response = self.lambda_client.get_function(FunctionName=function_name)
            
            state = response['Configuration'].get('State', 'Unknown')
            if state == 'Active':
                return 'running'
            elif state == 'Pending':
                return 'deploying'
            else:
                return 'stopped'
        except ClientError as e:
            if e.response['Error']['Code'] == 'ResourceNotFoundException':
                return 'error'
            return 'error'
    
    def list_agents(self) -> list:
        """List all Lambda functions that are agents"""
        try:
            response = self.lambda_client.list_functions()
            
            agents = []
            for func in response['Functions']:
                if func['FunctionName'].startswith('agent-'):
                    agents.append({
                        'function_name': func['FunctionName'],
                        'status': 'running' if func['State'] == 'Active' else 'stopped',
                        'last_modified': func['LastModified'],
                        'runtime': func['Runtime'],
                        'memory_size': func['MemorySize']
                    })
            
            return agents
        except Exception as e:
            print(f"Error listing agents: {str(e)}")
            return []
    
    def _generate_function_name(self, agent_name: str) -> str:
        """Generate AWS-compatible function name"""
        # Sanitize name for AWS Lambda
        sanitized = re.sub(r'[^a-zA-Z0-9-_]', '-', agent_name)
        sanitized = sanitized.lower().strip('-')
        
        # Ensure it starts with a letter
        if not sanitized[0].isalpha():
            sanitized = 'agent-' + sanitized
        
        # Add timestamp to make unique
        timestamp = int(time.time())
        return f"agent-{sanitized}-{timestamp}"[:64]  # AWS limit is 64 chars
    
    def _create_zip_buffer(self, code: str) -> bytes:
        """Create ZIP buffer containing the Lambda function code"""
        zip_buffer = io.BytesIO()
        
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            # Create the main Lambda function file
            lambda_function_code = f"""
import json
import logging

# Set up logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# User's agent code
{code}

# Default Lambda handler if not provided
def lambda_handler(event, context):
    try:
        logger.info(f"Agent invoked with event: {{json.dumps(event)}}")
        
        # Try to find user's handler function
        if 'handler' in globals():
            return handler(event, context)
        elif 'main' in globals():
            return main(event, context)
        elif 'process' in globals():
            return process(event, context)
        else:
            # Default behavior - echo the event
            return {{
                'statusCode': 200,
                'body': json.dumps({{
                    'message': 'Agent executed successfully',
                    'event': event,
                    'timestamp': context.aws_request_id if context else 'local'
                }})
            }}
    except Exception as e:
        logger.error(f"Agent execution error: {{str(e)}}")
        return {{
            'statusCode': 500,
            'body': json.dumps({{
                'error': str(e),
                'type': type(e).__name__
            }})
        }}
"""
            
            zip_file.writestr('lambda_function.py', lambda_function_code)
            
            # Add requirements.txt if needed (for future package support)
            zip_file.writestr('requirements.txt', '')
        
        return zip_buffer.getvalue()
    
    def _ensure_lambda_execution_role(self) -> str:
        """Ensure Lambda execution role exists, create if not"""
        role_name = 'agent-platform-lambda-execution-role'
        
        try:
            # Try to get existing role
            response = self.iam_client.get_role(RoleName=role_name)
            return response['Role']['Arn']
        except ClientError as e:
            if e.response['Error']['Code'] == 'NoSuchEntity':
                # Role doesn't exist, create it
                return self._create_lambda_execution_role(role_name)
            else:
                raise e
    
    def _create_lambda_execution_role(self, role_name: str) -> str:
        """Create Lambda execution role with necessary permissions"""
        
        # Trust policy for Lambda
        trust_policy = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Principal": {
                        "Service": "lambda.amazonaws.com"
                    },
                    "Action": "sts:AssumeRole"
                }
            ]
        }
        
        # Create the role
        role_response = self.iam_client.create_role(
            RoleName=role_name,
            AssumeRolePolicyDocument=json.dumps(trust_policy),
            Description='Execution role for AI agents deployed via Agent Deploy Platform'
        )
        
        # Attach basic Lambda execution policy
        self.iam_client.attach_role_policy(
            RoleName=role_name,
            PolicyArn='arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole'
        )
        
        # Wait for IAM consistency
        time.sleep(3)
        
        return role_response['Role']['Arn']

# Create singleton instance
lambda_service = LambdaDeploymentService()