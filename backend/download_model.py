import os
from huggingface_hub import snapshot_download
os.environ["HF_HUB_READ_TIMEOUT"] = "300" 

model_id = "sentence-transformers/all-MiniLM-L6-v2"
print(f"Downloading {model_id}...")

try:
    path = snapshot_download(repo_id=model_id, local_files_only=False)
    print(f"Successfully downloaded to: {path}")
    print("You can now run the backend without download timeouts.")
except Exception as e:
    print(f"Download failed: {e}")
    print("\nSUGGESTION: Your network (Sophos/Firewall) might be blocking Hugging Face.")
    print("Please try connecting to a mobile hotspot or use a VPN and run this script again.")