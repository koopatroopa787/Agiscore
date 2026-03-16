import sys
import os

log_file = "env_check.log"

with open(log_file, "w") as f:
    f.write(f"Python version: {sys.version}\n")
    try:
        import aws_sdk_bedrock_runtime
        f.write("aws_sdk_bedrock_runtime: INSTALLED\n")
        from aws_sdk_bedrock_runtime.client import BedrockRuntimeClient
        f.write("BedrockRuntimeClient: IMPORT SUCCESS\n")
    except ImportError as e:
        f.write(f"aws_sdk_bedrock_runtime: MISSING ({e})\n")
    except Exception as e:
        f.write(f"Import error: {type(e).__name__}: {e}\n")

print(f"Check complete. Result in {log_file}")
