import sys

def try_import(name):
    try:
        module = __import__(name, fromlist=['StaticIdentityResolver'])
        if hasattr(module, 'StaticIdentityResolver'):
            return f"FOUND in {name}"
        return f"Module {name} loaded, but no StaticIdentityResolver"
    except ImportError as e:
        return f"ImportError for {name}: {e}"

results = [
    try_import("smithy_core.identity"),
    try_import("smithy_aws_core.identity"),
    try_import("smithy_core.interfaces.identity"),
    try_import("smithy_aws_core.interfaces.identity"),
    try_import("aws_sdk_bedrock_runtime.identity")
]

with open("import_results.txt", "w") as f:
    for r in results:
        f.write(r + "\n")
