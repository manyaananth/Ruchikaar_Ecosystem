import requests

# The URL of our new Flask route
url = "http://127.0.0.1:5000/audit-label"

# Change this to the exact name of your Maggi photo!
# Make sure the photo is dragged into your backend folder.
image_path = "maggie1.webp" 

print(f"Sending {image_path} to the AI... Please wait, this requires heavy processing.")

# Open the image and POST it to Flask
with open(image_path, "rb") as img:
    files = {"image": img}
    response = requests.post(url, files=files)

print("\n--- AI VERDICT ---")
print(response.json())