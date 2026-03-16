import boto3
client = boto3.client('bedrock', region_name='us-east-1')
models = client.list_foundation_models(byProvider='amazon')
sonic = [m for m in models['modelSummaries'] if 'sonic' in m['modelId'].lower()]
for m in sonic:
    print(m['modelId'], '-', m.get('modelLifecycle', {}).get('status', 'unknown'))