from flask import Blueprint, request, jsonify
import requests, json, re, os
from extensions import db
from models import Recipe, User
from utils.weather import get_weather
from utils.nutrition import calculate_nutrition

recipe_bp = Blueprint("recipe", __name__)

OLLAMA_BASE = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_URL  = f"{OLLAMA_BASE}/api/generate"
MODEL       = os.getenv("OLLAMA_MODEL", "phi3")

def extract_json(raw: str) -> dict:
    """Robustly extract a JSON object from LLM raw text."""
    if not raw:
        return {}

    # Strip <think>...</think> blocks emitted by reasoning models (phi3, qwen3.5, etc.)
    raw = re.sub(r'<think>.*?</think>', '', raw, flags=re.DOTALL | re.IGNORECASE)

    # Strip markdown code fences e.g. ```json ... ```
    raw = re.sub(r'```(?:json)?\s*', '', raw)
    raw = raw.replace('```', '')

    # Try direct parse first
    try:
        return json.loads(raw.strip())
    except Exception:
        pass

    # Find the outermost { ... } block
    start = raw.find('{')
    if start == -1:
        return {}

    # Walk to find matching closing brace
    depth = 0
    end = -1
    for i, ch in enumerate(raw[start:], start):
        if ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                end = i + 1
                break

    if end == -1:
        # Truncated JSON — try to close it
        candidate = raw[start:] + '}'
    else:
        candidate = raw[start:end]

    # Fix common LLM JSON issues
    # 1. Trailing commas before } or ]
    candidate = re.sub(r',\s*([}\]])', r'\1', candidate)
    # 2. Single-quoted strings → double-quoted
    candidate = re.sub(r"(?<![\\])'", '"', candidate)
    # 3. Python-style True/False/None
    candidate = candidate.replace('True', 'true').replace('False', 'false').replace('None', 'null')
    # 4. Remove control characters
    candidate = re.sub(r'[\x00-\x1f\x7f]', ' ', candidate)

    try:
        return json.loads(candidate)
    except Exception:
        pass

    # Last resort: try json5-style (ignore errors)
    try:
        import json5
        return json5.loads(candidate)
    except Exception:
        pass

    return {}


def call_ollama(prompt: str) -> dict:
    """Send a prompt to Ollama and return the parsed JSON recipe dict."""
    try:
        response = requests.post(OLLAMA_URL, json={
            "model": MODEL,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": 0.7, "num_predict": 1500}
        }, timeout=180)
        raw = response.json().get("response", "")
        print(f"[Ollama raw] First 300 chars: {raw[:300]}")
    except Exception as e:
        print(f"[Ollama error] {e}")
        return {"error": str(e)}

    recipe = extract_json(raw)
    print(f"[Ollama parsed] title={recipe.get('title','<EMPTY>')}")

    if not recipe:
        return {}

    # Clean up steps — strip any "Step N:" or "N." prefixes the LLM sneaks in
    steps = recipe.get("steps", [])
    clean_steps = []
    for s in steps:
        s = re.sub(r'^(Step\s*\d+[:\.\)]\s*|\d+[:\.\)]\s*)', '', str(s).strip(), flags=re.IGNORECASE)
        if s:
            clean_steps.append(s)
    recipe["steps"] = clean_steps

    # Sanitize nutrition — handle angle-bracket placeholders the LLM may echo back
    n = recipe.get("nutrition_per_serving", {})
    numeric_fields = ["calories", "protein_g", "carbs_g", "fat_g", "fiber_g",
                      "sugar_g", "sodium_mg", "vitamin_c_mg", "calcium_mg", "iron_mg"]
    for field in numeric_fields:
        val = n.get(field)
        if val is None:
            n[field] = 0
        elif isinstance(val, str):
            # LLM echoed a placeholder like "<REAL estimate...>" — extract any number or zero it
            nums = re.findall(r'\d+\.?\d*', val)
            n[field] = float(nums[0]) if nums else 0
        else:
            try:
                n[field] = float(val)
            except (TypeError, ValueError):
                n[field] = 0

    # Compute calories from macros if LLM left them zero
    if not n.get("calories"):
        n["calories"] = round(
            (n.get("protein_g", 0) * 4) +
            (n.get("carbs_g", 0) * 4) +
            (n.get("fat_g", 0) * 9)
        )

    # Strip template placeholder text from text fields
    def clean_list(lst):
        return [item for item in (lst or [])
                if item and not str(item).startswith("<")
                and "e.g." not in str(item).lower()]

    recipe["warnings"] = clean_list(recipe.get("warnings", []))
    recipe["positives"] = clean_list(recipe.get("positives", []))
    ai_tip = recipe.get("ai_tip", "")
    if ai_tip and (str(ai_tip).startswith("<") or "e.g." in str(ai_tip).lower()):
        ai_tip = ""
    recipe["ai_tip"] = ai_tip

    recipe["nutrition_per_serving"] = n
    recipe["health_score"] = calculate_nutrition(n)

    return recipe



# ── /generate — ingredient-based ──────────────────────────────────────────
@recipe_bp.route("/generate", methods=["POST"])
def generate_recipe():
    data        = request.json or {}
    ingredients = data.get("ingredients", [])
    lat         = data.get("lat", 12.9716)
    lon         = data.get("lon", 77.5946)
    health_goal = data.get("health_goal", "balanced diet")
    cuisine     = data.get("cuisine", "")
    time_min    = data.get("time_minutes", 30)
    servings    = data.get("servings", 2)
    veg_only    = data.get("vegOnly", False)

    weather      = get_weather(lat, lon)
    weather_desc = f"{weather['condition']} weather, {weather['temp']}°C"

    ingr_list = ingredients if ingredients else []
    ingr_str  = ', '.join(ingr_list) if ingr_list else "common Indian pantry staples"

    cuisine_hint = f" The cuisine style is {cuisine}." if cuisine else ""
    veg_hint     = " This recipe MUST be 100% vegetarian (no meat, poultry, or seafood)." if veg_only else ""
    ingr_hint    = f"You MUST use these exact ingredients in the recipe: {ingr_str}." if ingr_list else ""

    prompt = f"""You are a world-class Indian nutritionist and chef.{cuisine_hint}{veg_hint}
{ingr_hint}
Create a COMPLETE, restaurant-quality Indian recipe.
Context: {weather_desc}. Health goal: {health_goal}. Prep time: {time_min} mins. Servings: {servings}.

CRITICAL RULES — follow exactly:
1. Write EXACTLY 7 detailed cooking steps. Each step must be 1-2 full sentences with specific quantities, temperatures and timings.
2. Do NOT number steps or add any "Step N:" prefix — just plain prose sentences.
3. Nutrition values MUST be real-world estimates based on the actual ingredients used, NOT placeholder zeros.
4. Include honest health warnings (e.g. high sodium, high fat) and genuine positives.
5. Respond ONLY with valid JSON — no markdown, no extra text, no explanation before or after.

JSON structure to respond with — REPLACE the example numbers in nutrition with REAL estimates for the actual ingredients:
{{
  "title": "Recipe name",
  "description": "One vivid sentence explaining why this recipe suits the weather and health goal",
  "ingredients_used": ["ingredient with quantity", "item2", "item3"],
  "steps": [
    "Detailed step one with exact quantities and technique.",
    "Detailed step two with timing and visual cue.",
    "Detailed step three with heat settings.",
    "Detailed step four building on previous.",
    "Detailed step five with seasoning guidance.",
    "Detailed step six — finishing touches.",
    "Detailed step seven — plating and serving suggestion."
  ],
  "servings": {servings},
  "prep_time": "{time_min} mins",
  "nutrition_per_serving": {{
    "calories": 320,
    "protein_g": 14,
    "carbs_g": 42,
    "fat_g": 9,
    "fiber_g": 5,
    "sugar_g": 8,
    "sodium_mg": 380,
    "vitamin_c_mg": 12,
    "calcium_mg": 85,
    "iron_mg": 2
  }},
  "warnings": ["Specific health concern for THIS dish based on its actual ingredients"],
  "positives": ["Specific health benefit of THIS dish based on its actual ingredients"],
  "ai_tip": "One practical tip to make this specific recipe healthier or tastier"
}}"""

    recipe = call_ollama(prompt)
    if not recipe or not recipe.get("title"):
        return jsonify({"error": "AI failed to generate a valid recipe. Please try again."}), 500
    return jsonify(recipe)


# ── /generate-regional — authentic named-dish generation ─────────────────
@recipe_bp.route("/generate-regional", methods=["POST"])
def generate_regional():
    data      = request.json or {}
    dish_name = data.get("dish_name", "")
    region    = data.get("region", "Indian")
    servings  = data.get("servings", 2)
    time_min  = data.get("time_minutes", 40)
    veg_only  = data.get("vegOnly", False)

    if not dish_name:
        return jsonify({"error": "dish_name is required"}), 400

    veg_hint  = " Ensure this version is 100% vegetarian." if veg_only else ""

    prompt = f"""You are a master chef specialising in authentic {region} cuisine with 30 years of experience.
Your task is to write the AUTHENTIC, TRADITIONAL recipe for: {dish_name}{veg_hint}

Use only genuine, traditional ingredients and techniques — no shortcuts, no fusion.
Prep time: approximately {time_min} mins. Servings: {servings}.

CRITICAL RULES — follow exactly:
1. Write EXACTLY 7 detailed authentic cooking steps. Each step must be 1-2 full sentences with specific quantities, temperatures and timings.
2. Do NOT number steps or add any "Step N:" prefix — just plain prose sentences.
3. Nutrition values MUST be real-world estimates for this authentic dish, NOT zeros.
4. Include honest health notes (e.g. high ghee content) and genuine positives (e.g. probiotic benefits).
5. Respond ONLY with valid JSON — no markdown, no extra text whatsoever.

JSON structure to respond with — REPLACE the example nutrition numbers with REAL estimates for {dish_name}:
{{
  "title": "{dish_name}",
  "description": "One vivid sentence about why {dish_name} is a beloved {region} classic and what makes it special",
  "ingredients_used": ["ingredient with quantity", "item2 with quantity", "item3 with quantity"],
  "steps": [
    "Step 1 details...",
    "Step 2 details...",
    "Step 3 details...",
    "Step 4 details...",
    "Step 5 details...",
    "Step 6 details...",
    "Step 7 details..."
  ],
  "servings": {servings},
  "prep_time": "{time_min} mins",
  "nutrition_per_serving": {{
    "calories": 350,
    "protein_g": 12,
    "carbs_g": 45,
    "fat_g": 14,
    "fiber_g": 4,
    "sugar_g": 6,
    "sodium_mg": 400,
    "vitamin_c_mg": 8,
    "calcium_mg": 90,
    "iron_mg": 2
  }},
  "warnings": ["Specific dietary concern about the authentic ingredients in {dish_name}"],
  "positives": ["Specific nutritional or cultural benefit of authentic {dish_name}"],
  "ai_tip": "One expert tip to make this {dish_name} even more authentic"
}}"""

    recipe = call_ollama(prompt)
    if not recipe or not recipe.get("title"):
        return jsonify({"error": "AI failed to generate a valid recipe. Please try again."}), 500
    return jsonify(recipe)


# ── /save — save a recipe for a user ─────────────────────────────────────
@recipe_bp.route("/save", methods=["POST"])
def save_recipe():
    data = request.json or {}
    user_id = data.get("user_id")
    recipe_data = data.get("recipe", {})

    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    if not recipe_data.get("title"):
        return jsonify({"error": "Recipe title is required"}), 400

    # Check user exists
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    n = recipe_data.get("nutrition_per_serving", {})
    saved = Recipe(
        user_id=user_id,
        title=recipe_data.get("title", "Untitled Recipe"),
        ingredients=json.dumps(recipe_data.get("ingredients_used", [])),
        instructions=json.dumps(recipe_data.get("steps", [])),
        health_score=recipe_data.get("health_score", calculate_nutrition(n)),
        weather_context=recipe_data.get("description", "")[:100] if recipe_data.get("description") else ""
    )
    db.session.add(saved)
    db.session.commit()

    return jsonify({"message": "Recipe saved!", "id": saved.id}), 201


# ── /saved/<user_id> — get all saved recipes for a user ──────────────────
@recipe_bp.route("/saved/<int:user_id>", methods=["GET"])
def get_saved_recipes(user_id):
    recipes = Recipe.query.filter_by(user_id=user_id).order_by(Recipe.created_at.desc()).all()
    result = []
    for r in recipes:
        try:
            ingredients = json.loads(r.ingredients) if r.ingredients else []
        except Exception:
            ingredients = []
        try:
            steps = json.loads(r.instructions) if r.instructions else []
        except Exception:
            steps = []

        result.append({
            "id": r.id,
            "title": r.title,
            "ingredients_used": ingredients,
            "steps": steps,
            "health_score": r.health_score,
            "description": r.weather_context,
            "created_at": r.created_at.strftime("%d %b %Y, %I:%M %p")
        })
    return jsonify(result)


# ── /saved/<recipe_id> — delete a saved recipe ───────────────────────────
@recipe_bp.route("/saved/<int:recipe_id>", methods=["DELETE"])
def delete_saved_recipe(recipe_id):
    recipe = Recipe.query.get_or_404(recipe_id)
    db.session.delete(recipe)
    db.session.commit()
    return jsonify({"message": "Recipe removed from saved"})