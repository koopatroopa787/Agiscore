import os
import time

print("--- ENV VARS ---")
for k, v in os.environ.items():
    if "AWS" in k:
        print(f"{k}: {v[:4]}...{v[-4:] if len(v)>8 else ''}")

print("--- TICK ---")
start = time.time()
for i in range(1000000):
    pass
print(f"Loop time: {time.time() - start:.4f}s")
