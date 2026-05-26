from flask import Blueprint, request, jsonify
import requests, base64

vision_bp = Blueprint("vision", __name__)

@vision_bp.route("/scan", methods=["POST"])
def scan_ingredients():
    file = request.files.get("image")
    if not file:
        return jsonify({"error": "No image uploaded"}), 400

    image_data = base64.b64encode(file.read()).decode("utf-8")

    try:
        response = requests.post("http://localhost:11434/api/generate", json={
            "model": "llava",
            "prompt": "Identify the raw food ingredients in this image (e.g. tomato, broccoli, onion, garlic). Return ONLY a comma-separated list of the names in lowercase. Do not include any other text, sentences, or punctuation other than commas.",
            "images": [image_data],
            "stream": False
        }, timeout=60)
        
        if response.status_code == 200:
            result = response.json().get("response", "")
            print(f"Llava vision raw response: {result}")
            # Clean up the response in case the model ignored instructions
            result = result.replace(".", "").replace("\n", "")
            ingredients = [i.strip() for i in result.split(",") if i.strip()]
            return jsonify({"ingredients": ingredients})
        else:
            print(f"Ollama error: {response.text}")
            return jsonify({"error": "Failed to generate from Ollama"}), 500
    except requests.exceptions.RequestException as e:
        print(f"Vision API request failed: {e}")
        return jsonify({"error": str(e)}), 500