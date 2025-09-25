import asyncio
import websockets
import json

async def test_live_monitor():
    uri = "ws://localhost:8000/ws/live-monitor?user_id=test-user&team_id=engineering"
    
    async with websockets.connect(uri) as websocket:
        print("Connected to live monitor!")
        
        # Send ping
        await websocket.send(json.dumps({"type": "ping"}))
        
        # Listen for messages
        async for message in websocket:
            data = json.loads(message)
            print(f"Received: {data}")
            
            if data.get("type") == "live_request":
                print(f"🚀 NEW REQUEST: {data['model']} by {data['user_id']}")
            elif data.get("type") == "live_response": 
                print(f"✅ RESPONSE: ${data['actual_cost']:.6f} in {data['duration']:.2f}s")
            elif data.get("type") == "policy_violation":
                print(f"🚨 POLICY VIOLATION: {data['message']}")

if __name__ == "__main__":
    asyncio.run(test_live_monitor())