import importlib
import pkgutil
import smithy_aws_core

def find_module_with_class(package, class_name):
    for loader, module_name, is_pkg in pkgutil.walk_packages(package.__path__, package.__name__ + '.'):
        try:
            module = importlib.import_module(module_name)
            if hasattr(module, class_name):
                return module_name
        except:
            continue
    return None

import smithy_core
print(f"Searching for EnvironmentCredentialsResolver...")
module = find_module_with_class(smithy_aws_core, "EnvironmentCredentialsResolver")
if module:
    print(f"FOUND in smithy_aws_core: {module}")
else:
    module = find_module_with_class(smithy_core, "EnvironmentCredentialsResolver")
    if module:
        print(f"FOUND in smithy_core: {module}")
    else:
        print("NOT FOUND anywhere.")
