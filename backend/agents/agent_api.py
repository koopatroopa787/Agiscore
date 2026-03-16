import asyncio
import json
import websockets
import uuid
from supervisor import SupervisorAgent

class AgentAPI:
    def __init__(self):
        self.supervisor = SupervisorAgent()
        print("[API] Supervisor Engine Ready (Text-Only Mode).", flush=True)

    async def handle_client(self, websocket):
        self.conn_count = getattr(self, 'conn_count', 0) + 1
        client_id = str(uuid.uuid4())[:8]
        print(f"[API] Connection Open: {client_id} (Total Active: {self.conn_count})", flush=True)
        try:
            async for message in websocket:
                data = json.loads(message)
                msg_type = data.get("type")
                
                if msg_type == "text":
                    text = data.get("text", "")
                    print(f"[API] Processing Command: {text}", flush=True)
                    
                    # Echo the transcript for UI consistency
                    await websocket.send(json.dumps({
                        "type": "transcript",
                        "text": text,
                        "final": False
                    }))
                    
                    try:
                        # Use executor for the blocking Boto3 call
                        loop = asyncio.get_event_loop()
                        reasoning_json = await loop.run_in_executor(
                            None, 
                            self.supervisor.route_tasks, 
                            text
                        )
                        reasoning_data = json.loads(reasoning_json)
                        
                        await websocket.send(json.dumps({
                            "type": "transcript",
                            "text": text,
                            "final": True,
                            "reasoning": reasoning_data
                        }))
                    except Exception as e:
                        print(f"[API] Supervisor Error: {e}", flush=True)
                        await websocket.send(json.dumps({
                            "type": "error",
                            "message": f"Supervisor failed: {str(e)}"
                        }))
                
                elif msg_type == "start":
                    # Backward compatibility for voice-hub start button if not removed yet
                    await websocket.send(json.dumps({
                        "type": "status",
                        "message": "Nexus Ready. Please type your command."
                    }))

        except websockets.exceptions.ConnectionClosed:
            pass
        finally:
            self.conn_count -= 1
            print(f"[API] Connection Closed: {client_id} (Total Active: {self.conn_count})", flush=True)

async def main():
    api = AgentAPI()
    async with websockets.serve(api.handle_client, "localhost", 8765):
        print("[API] Nexus Agent Bridge listening on ws://localhost:8765", flush=True)
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    asyncio.run(main())
