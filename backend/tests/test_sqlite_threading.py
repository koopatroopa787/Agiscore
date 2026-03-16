import threading
import sys
import os

# Add parent directory to path to import mcp_examples
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from mcp_examples.nova_act_mcp_server import NovaActMCPServer

def test_threading():
    server = NovaActMCPServer()
    print("Server initialized in main thread.")

    results = []
    def call_server():
        try:
            print(f"Calling server from thread: {threading.current_thread().name}")
            res = server.handle_request("cross_reference_inventory", {
                "extracted_data": [{"name": "Control Valve B", "quantity": 45}]
            })
            results.append(res)
            print(f"Result in {threading.current_thread().name}: {res['summary']}")
        except Exception as e:
            results.append(e)
            print(f"Error in {threading.current_thread().name}: {e}")

    # Launch a separate thread to call the server
    t = threading.Thread(target=call_server, name="WorkerThread")
    t.start()
    t.join()

    if isinstance(results[0], Exception):
        print(f"\nFAILED: Threading issue persists: {results[0]}")
        sys.exit(1)
    else:
        print("\nSUCCESS: Multi-threaded SQLite access verified.")
        sys.exit(0)

if __name__ == "__main__":
    test_threading()
