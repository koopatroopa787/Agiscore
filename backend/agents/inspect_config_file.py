from aws_sdk_bedrock_runtime.config import Config
import inspect

with open("config_params.txt", "w") as f:
    f.write("Config.__init__ signature:\n")
    sig = inspect.signature(Config.__init__)
    for name, param in sig.parameters.items():
        f.write(f"  {name}: {param.kind}\n")

try:
    from smithy_aws_core.identity import EnvironmentCredentialsResolver
    with open("config_params.txt", "a") as f:
        f.write("\nFound EnvironmentCredentialsResolver in smithy_aws_core.identity\n")
except ImportError:
    pass

try:
    from smithy_core.identity import StaticIdentityResolver
    with open("config_params.txt", "a") as f:
        f.write("Found StaticIdentityResolver in smithy_core.identity\n")
except ImportError:
    pass
