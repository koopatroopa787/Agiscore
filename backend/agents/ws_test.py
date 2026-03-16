import asyncio
import websockets

async def hello(websocket):
    print("Test connection received!", flush=True)
    await websocket.send("Hello from Test Server")

async def main():
    print("Starting TP test server on port 8765...", flush=True)
    async with websockets.serve(hello, "localhost", 8765):
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())
