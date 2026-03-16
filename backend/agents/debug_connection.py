import asyncio
import json
import os
from aws_sdk_bedrock_runtime.client import BedrockRuntimeClient
from aws_sdk_bedrock_runtime.config import Config, HTTPAuthSchemeResolver, SigV4AuthScheme, AuthSchemeResolver
from smithy_aws_core.identity import DefaultIdentityResolver

async def test_connection():
    region = 'us-east-1'
    print(f"Checking region: {region}")
    
    try:
        # Try to find the identity resolver again
        try:
            from smithy_aws_core.identity import EnvironmentCredentialsResolver
            print("Found EnvironmentCredentialsResolver in identity")
        except ImportError:
            try:
                from smithy_aws_core.credentials_resolvers.environment import EnvironmentCredentialsResolver
                print("Found EnvironmentCredentialsResolver in credentials_resolvers")
            except ImportError:
                print("EnvironmentCredentialsResolver NOT FOUND, will try DefaultIdentityResolver")
                EnvironmentCredentialsResolver = DefaultIdentityResolver

        config = Config(
            endpoint_uri=f"https://bedrock-runtime.{region}.amazonaws.com",
            region=region,
            auth_scheme_resolver=AuthSchemeResolver(),
            auth_schemes={"aws.auth#sigv4": SigV4AuthScheme(service="bedrock")},
            # identity_resolver=EnvironmentCredentialsResolver() # Some smithy versions use this
        )
        
        # Check if the Config class has an identity_resolver or similar
        import inspect
        sig = inspect.signature(Config.__init__)
        params = list(sig.parameters.keys())
        print(f"Config params: {params}")
        
        # Some versions use 'aws_credentials_identity_resolver'
        # Let's try to match it
        id_param = next((p for p in params if 'identity' in p or 'credentials' in p), None)
        print(f"Potential identity param: {id_param}")
        
        kwargs = {
            "endpoint_uri": f"https://bedrock-runtime.{region}.amazonaws.com",
            "region": region,
            "auth_scheme_resolver": AuthSchemeResolver(),
            "auth_schemes": {"aws.auth#sigv4": SigV4AuthScheme(service="bedrock")}
        }
        if id_param:
            kwargs[id_param] = EnvironmentCredentialsResolver()

        config = Config(**kwargs)
        client = BedrockRuntimeClient(config=config)
        print("Client initialized. Attempting stream call...")
        
        # This is where it hangs
        # We'll use a timeout
        try:
            from aws_sdk_bedrock_runtime.client import InvokeModelWithBidirectionalStreamOperationInput
            await asyncio.wait_for(
                client.invoke_model_with_bidirectional_stream(
                    InvokeModelWithBidirectionalStreamOperationInput(model_id="amazon.nova-2-sonic-v1:0")
                ),
                timeout=10
            )
            print("Success: Stream opened!")
        except asyncio.TimeoutError:
            print("FAILED: Stream call timed out after 10s")
        except Exception as e:
            print(f"FAILED: Stream call error: {e}")
            
    except Exception as e:
        print(f"Initialization error: {e}")

if __name__ == "__main__":
    asyncio.run(test_connection())
