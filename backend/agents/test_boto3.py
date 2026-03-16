import boto3
import sys

print("Checking Bedrock connectivity...")
try:
    client = boto3.client('bedrock-runtime', region_name='us-east-1')
    response = client.invoke_model(
        modelId='amazon.titan-text-express-v1',
        body='{"inputText": "hello"}'
    )
    print("SUCCESS: Connected to Bedrock Runtime.")
    print(f"Response: {response['ResponseMetadata']['HTTPStatusCode']}")
except Exception as e:
    print(f"FAILED: {e}")
    sys.exit(1)
