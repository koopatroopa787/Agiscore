import json
import sqlite3
from typing import Any, Dict, List

# Simple Mock SQL Database setup for grounding
def setup_mock_db():
    conn = sqlite3.connect(':memory:', check_same_thread=False)
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE legacy_inventory (id INTEGER, item TEXT, quantity INTEGER)''')
    cursor.executemany('INSERT INTO legacy_inventory VALUES (?,?,?)', [
        (1, 'Industrial Sensor A', 150),
        (2, 'Control Valve B', 45),
        (3, 'High-Pressure Pump C', 12)
    ])
    
    # Adding 300x more data for volume testing
    extra_items = []
    for i in range(4, 304):
        item_types = ["Turbine", "Sensor", "Valve", "Pump", "Compressor", "Actuator"]
        item_name = f"{item_types[i % len(item_types)]} {chr(65 + (i % 26))}{i}"
        extra_items.append((i, item_name, (i * 7) % 200))
    
    cursor.executemany('INSERT INTO legacy_inventory VALUES (?,?,?)', extra_items)
    conn.commit()
    return conn

class NovaActMCPServer:
    def __init__(self):
        self.db = setup_mock_db()

    def handle_request(self, method: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main entry point for MCP requests.
        Supported methods: 'cross_reference_inventory', 'get_system_status'
        """
        if method == "cross_reference_inventory":
            return self.cross_reference_inventory(params.get("extracted_data", []))
        elif method == "get_system_status":
            return {"status": "AegisCore Operational", "db_connected": True}
        elif method == "get_sensor_telemetry":
            return self.get_sensor_telemetry(params.get("sensor_name", "Unknown"))
        else:
            return {"error": "Method not found"}

    def get_sensor_telemetry(self, sensor_name: str) -> Dict[str, Any]:
        """
        Simulates a hardware interface response for a specific sensor.
        """
        import random
        return {
            "sensor": sensor_name,
            "status": "Operational",
            "temperature": f"{random.randint(38, 45)}°C",
            "vibration_level": random.choice(["Normal", "Low", "Slightly Elevated"]),
            "last_calibration": "2026-03-01",
            "firmware_version": "v1.2.8-stable"
        }

    def cross_reference_inventory(self, extracted_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Validates browser-extracted data against the internal SQL database.
        """
        cursor = self.db.cursor()
        discrepancies = []
        
        for item in extracted_data:
            name = item.get("name")
            qty = item.get("quantity")
            cursor.execute("SELECT quantity FROM legacy_inventory WHERE item = ?", (name,))
            result = cursor.fetchone()
            
            if result:
                if result[0] != qty:
                    discrepancies.append({
                        "item": name,
                        "browser_qty": qty,
                        "db_qty": result[0],
                        "status": "MISMATCH"
                    })
            else:
                discrepancies.append({"item": name, "status": "NOT_IN_DB"})
        
        return {
            "summary": "Cross-referencing complete",
            "discrepancies": discrepancies,
            "match_count": len(extracted_data) - len(discrepancies)
        }

if __name__ == "__main__":
    server = NovaActMCPServer()
    # Example usage:
    print(server.handle_request("cross_reference_inventory", {
        "extracted_data": [{"name": "Industrial Sensor A", "quantity": 140}]
    }))
