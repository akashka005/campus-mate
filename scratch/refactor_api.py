import os
import re

target_dir = r"c:\Users\Akash\OneDrive\Desktop\CampusMate\frontend\src"
search_text = "http://localhost:8000"
replace_text = "${API_BASE_URL}"
import_line = "import { API_BASE_URL } from '../api/config';\n"

for root, dirs, files in os.walk(target_dir):
    for file in files:
        if file.endswith((".tsx", ".ts")):
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            
            if search_text in content:
                print(f"Refactoring {path}...")
                # Replace URL
                new_content = content.replace(search_text, replace_text)
                
                # Add import if not present
                if "API_BASE_URL" not in content:
                    # Insert after other imports or at top
                    new_content = import_line + new_content
                
                with open(path, "w", encoding="utf-8") as f:
                    f.write(new_content)
