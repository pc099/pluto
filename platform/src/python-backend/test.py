# test_services.py
import asyncio
from services.lambda_service import lambda_service
from services.database_service import db_service

async def test_services():
    print("🧪 Testing Python Backend Services...")
    
    # Test 1: Database connection
    print("\n1. Testing database connection...")
    try:
        agents = db_service.get_agents()
        print(f"✅ Database connected! Found {len(agents)} existing agents.")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return
    
    # Test 2: AWS Lambda service
    print("\n2. Testing AWS Lambda service...")
    try:
        account_id = lambda_service.account_id
        print(f"✅ AWS connected! Account ID: {account_id}")
    except Exception as e:
        print(f"❌ AWS connection failed: {e}")
        return
    
    # Test 3: Deploy a simple test agent
    print("\n3. Testing agent deployment...")
    
    test_agent_code = '''
def handler(event, context):
    return {
        "statusCode": 200,
        "body": "Hello from Python test agent!"
    }
'''
    
    try:
        result = lambda_service.deploy_agent("test-python-agent", test_agent_code)
        
        if result['success']:
            function_name = result['function_name']
            print(f"✅ Agent deployed successfully! Function: {function_name}")
            
            # Test 4: Save to database
            db_result = db_service.create_agent("test-python-agent", function_name)
            if db_result['success']:
                print("✅ Agent saved to database!")
                
                # Test 5: Invoke the agent
                print("\n4. Testing agent invocation...")
                invoke_result = lambda_service.invoke_agent(function_name, {"test": "data"})
                print(f"✅ Agent response: {invoke_result}")
                
                # Clean up - delete the test agent
                print("\n5. Cleaning up...")
                lambda_service.delete_agent(function_name)
                db_service.delete_agent(db_result['agent']['id'])
                print("✅ Test agent cleaned up!")
                
            else:
                print(f"❌ Failed to save agent to database: {db_result['error']}")
        else:
            print(f"❌ Agent deployment failed: {result['error']}")
            
    except Exception as e:
        print(f"❌ Test failed: {e}")
    
    print("\n🎉 All tests completed!")

if __name__ == "__main__":
    asyncio.run(test_services())