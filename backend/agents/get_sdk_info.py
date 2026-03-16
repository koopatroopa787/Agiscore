import smithy_core
import pkgutil
import aws_sdk_bedrock_runtime.config as config

with open("sdk_info.txt", "w") as f:
    f.write(f"smithy_core path: {smithy_core.__path__}\n")
    f.write("smithy_core modules:\n")
    for loader, module_name, is_pkg in pkgutil.walk_packages(smithy_core.__path__, smithy_core.__name__ + '.'):
        f.write(f"  {module_name}\n")
    
    f.write("\nConfig class info:\n")
    import inspect
    sig = inspect.signature(config.Config.__init__)
    f.write(str(sig))
