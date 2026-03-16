import boto3
import json
import sys
import os
import time

# Ensure project root is in path for mcp_examples
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from mcp_examples.nova_act_mcp_server import NovaActMCPServer

class SupervisorAgent:
    def __init__(self, model_id="us.amazon.nova-2-lite-v1:0"):
        # New credentials from hackathon-dev account
        self.bedrock_runtime = boto3.client(
            service_name='bedrock-runtime',
            region_name='us-east-1',
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
        )
        self.model_id = model_id
        self.mcp_server = NovaActMCPServer()
        print(f"[Supervisor] Engine Ready (Model: {self.model_id})", flush=True)

    def get_tools(self):
        return [
            {
                "toolSpec": {
                    "name": "cross_reference_inventory",
                    "description": "Validates items against the internal legacy SQL database.",
                    "inputSchema": {
                        "json": {
                            "type": "object",
                            "properties": {
                                "extracted_data": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "name": {"type": "string"},
                                            "quantity": {"type": "integer"}
                                        },
                                        "required": ["name", "quantity"]
                                    }
                                }
                            },
                            "required": ["extracted_data"]
                        }
                    }
                }
            },
            {
                "toolSpec": {
                    "name": "get_system_status",
                    "description": "Checks the operational status of the AegisCore background services.",
                    "inputSchema": {
                        "json": {"type": "object", "properties": {}}
                    }
                }
            },
            {
                "toolSpec": {
                    "name": "get_sensor_telemetry",
                    "description": "Fetch real-time data from industrial hardware sensors like temperature and vibration.",
                    "inputSchema": {
                        "json": {
                            "type": "object",
                            "properties": {
                                "sensor_name": {
                                    "type": "string",
                                    "description": "The name of the sensor to check, e.g., 'Industrial Sensor A'"
                                }
                            },
                            "required": ["sensor_name"]
                        }
                    }
                }
            }
        ]

    def _extract_json(self, text):
        """
        Robustly extracts and parses JSON from a potentially messy text response.
        """
        try:
            # Clean markdown and whitespace
            cleaned = text.strip()
            if "```json" in cleaned:
                cleaned = cleaned.split("```json")[1].split("```")[0].strip()
            elif "```" in cleaned:
                cleaned = cleaned.split("```")[1].split("```")[0].strip()
            
            # Find the first { and last }
            if "{" in cleaned and "}" in cleaned:
                start = cleaned.find("{")
                end = cleaned.rfind("}") + 1
                cleaned = cleaned[start:end]
            
            # Parse to verify
            parsed = json.loads(cleaned)
            return json.dumps(parsed)
        except Exception as e:
            print(f"[Supervisor] Extraction failed: {e}. Raw text: {text[:100]}...", flush=True)
            # Fallback wrapper
            return json.dumps({
                "assigned_agent": "AegisCore",
                "steps": ["Processed model intent"],
                "findings": text
            })

    def route_tasks(self, user_input):
        time.sleep(1) # Safety delay
        print(f"[Supervisor] Processing: {user_input}", flush=True)
        
        system_prompt = (
            "You are the AegisCore Supervisor. Use the provided tools to gather information.\n"
            "Always respond in a JSON format: {\"assigned_agent\": \"AGENT\", \"steps\": [\"step1\"], \"findings\": \"summary\"}"
        )

        messages = [{"role": "user", "content": [{"text": user_input}]}]

        try:
            print(f"[Supervisor] Using Model: {self.model_id}", flush=True)
            print(f"[Supervisor] Calling Bedrock API...", flush=True)
            
            response = self.bedrock_runtime.converse(
                modelId=self.model_id,
                messages=messages,
                system=[{"text": system_prompt}],
                toolConfig={
                    "tools": self.get_tools(),
                    "toolChoice": {"auto": {}}
                }
            )

            output_message = response['output']['message']
            stop_reason = response.get('stopReason')
            
            if stop_reason == 'tool_use':
                tool_requests = output_message['content']
                follow_up_messages = list(messages)
                follow_up_messages.append(output_message)
                
                tool_results_content = []
                for part in tool_requests:
                    if 'toolUse' in part:
                        tool = part['toolUse']
                        tool_name = tool['name']
                        tool_input = tool['input']
                        print(f"[Supervisor] Executing tool: {tool_name}", flush=True)
                        
                        result = self.mcp_server.handle_request(tool_name, tool_input)
                        
                        tool_results_content.append({
                            "toolResult": {
                                "toolUseId": tool['toolUseId'],
                                "content": [{"json": result}]
                            }
                        })
                
                if tool_results_content:
                    follow_up_messages.append({"role": "user", "content": tool_results_content})
                    final_response = self.bedrock_runtime.converse(
                        modelId=self.model_id,
                        messages=follow_up_messages,
                        system=[{"text": system_prompt}],
                        toolConfig={
                            "tools": self.get_tools(),
                            "toolChoice": {"auto": {}}
                        }
                    )
                    return self._extract_json(final_response['output']['message']['content'][0]['text'])

            return self._extract_json(output_message['content'][0]['text'])

        except Exception as e:
            error_str = str(e)
            print(f"[Supervisor] Bedrock Error: {error_str}", flush=True)
            
            if "AccessDeniedException" in error_str:
                return json.dumps({
                    "assigned_agent": "ERROR_HANDLER",
                    "steps": ["AWS Permission Denied"],
                    "findings": "ERROR: IAM user 'hackathon-dev' needs 'bedrock:InvokeModel' permission for Nova 2 Lite."
                })

            return json.dumps({
                "assigned_agent": "ERROR_HANDLER",
                "steps": ["Bedrock connection failed"],
                "findings": f"Could not reach {self.model_id}. Error: {error_str}"
            })

if __name__ == "__main__":
    agent = SupervisorAgent()
    print(agent.route_tasks("Check system status and inventory for Industrial Sensor A."))
