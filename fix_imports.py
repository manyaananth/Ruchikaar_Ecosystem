import os

components_dir = r"d:\Ruchikaar_Ecosystem\frontend\src\components"

for fname in os.listdir(components_dir):
    if not fname.endswith(".jsx"):
        continue
    fpath = os.path.join(components_dir, fname)
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()
    if 'import axios from "axios"' in content:
        new_content = content.replace('import axios from "axios"', 'import axios from "../axios"')
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Updated: {fname}")

print("Done!")
