from aws_sdk_bedrock_runtime.config import Config
import inspect

print("Config.__init__ signature:")
sig = inspect.signature(Config.__init__)
for name, param in sig.parameters.items():
    print(f"  {name}: {param.kind}")
