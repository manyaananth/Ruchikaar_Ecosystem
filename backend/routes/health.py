from flask import Blueprint, request, jsonify
from extensions import db
from models import HealthLog
from utils.nutrition import calculate_nutrition

health_bp = Blueprint("health", __name__)

@health_bp.route("/log", methods=["POST"])
def log_health():
    data = request.json
    nutrition = data.get("nutrition", {})
    score = calculate_nutrition(nutrition)

    log = HealthLog(
        user_id=data.get("user_id", 1),
        recipe_id=data.get("recipe_id"),
        protein=nutrition.get("protein_g", 0),
        carbs=nutrition.get("carbs_g", 0),
        fats=nutrition.get("fat_g", 0),
        score=score
    )
    db.session.add(log)
    db.session.commit()
    return jsonify({"message": "Logged", "score": score})


@health_bp.route("/history/<int:user_id>", methods=["GET"])
def get_history(user_id):
    logs = HealthLog.query.filter_by(user_id=user_id).order_by(HealthLog.logged_at.desc()).limit(10).all()
    result = []
    for log in logs:
        result.append({
            "id": log.id,
            "protein": log.protein,
            "carbs": log.carbs,
            "fats": log.fats,
            "score": log.score,
            "logged_at": log.logged_at.strftime("%Y-%m-%d %H:%M")
        })
    return jsonify(result)


@health_bp.route("/summary/<int:user_id>", methods=["GET"])
def get_summary(user_id):
    logs = HealthLog.query.filter_by(user_id=user_id).all()
    if not logs:
        return jsonify({"avg_score": 0, "total_recipes": 0})
    avg = round(sum(l.score for l in logs) / len(logs))
    return jsonify({
        "avg_score": avg,
        "total_recipes": len(logs),
        "avg_protein": round(sum(l.protein for l in logs) / len(logs), 1),
        "avg_carbs": round(sum(l.carbs for l in logs) / len(logs), 1),
        "avg_fats": round(sum(l.fats for l in logs) / len(logs), 1),
    })


@health_bp.route("/label-scan", methods=["POST"])
def label_scan():
    """
    Ingredient & food health analyser.
    Upload any image — raw ingredients, cooked food, or a packaged label.
    LLaVA identifies ALL visible ingredients, then gives a health rating based on them.
    """
    import requests, base64, json, re
    file = request.files.get("image")
    if not file:
        return jsonify({"error": "No image"}), 400

    image_data = base64.b64encode(file.read()).decode("utf-8")

    prompt = (
        "You are a professional nutritionist and food scientist. Analyse this food image carefully. You must decode complex packaged food labels and nutritional information.\n\n"
        "STEP 1 — IDENTIFY: List ALL visible food items, ingredients, or food products in the image. "
        "Look for: raw vegetables, fruits, grains, legumes, dairy products, meat/fish/poultry, spices, oils, "
        "packaged food labels, cooked dishes, or any other food items. Explicitly look for Artificial Food Colors (e.g., Tartrazine, Sunset Yellow, Carmoisine), Preservatives, Additives (MSG, artificial flavors), Saturated Fat, and Trans Fat.\n\n"
        "STEP 2 — ANALYSE: Based ONLY on the specific ingredients you identified in Step 1, "
        "calculate the nutritional values for a single typical serving of what is shown (or per 100g if it's raw ingredients), decoding numerical values from packets if visible. "
        "Your nutrition estimates MUST reflect the actual ingredients seen — do not output all zeros.\n\n"
        "STEP 3 — HEALTH RATING: Score the overall healthiness of these identified ingredients:\n"
        "- Fresh vegetables, fruits, legumes, whole grains = high health score (70-100)\n"
        "- Mixed dishes with some vegetables and protein = moderate score (45-69)\n"
        "- Processed foods, high sugar, high sodium, deep-fried items = low score (0-44)\n\n"
        "If the image is unclear, not food-related, or you cannot identify any food items, "
        "set 'not_food_image' to true.\n\n"
        "Respond ONLY with this exact JSON — no markdown, no extra text:\n"
        "{\"product_name\": \"descriptive name of identified food/dish\", "
        "\"serving_size\": \"typical serving size\", "
        "\"calories\": 0, \"protein_g\": 0, \"carbs_g\": 0, \"fat_g\": 0, "
        "\"sugar_g\": 0, \"sodium_mg\": 0, \"fiber_g\": 0, "
        "\"ingredients_identified\": [\"specific ingredient 1\", \"specific ingredient 2\", \"specific ingredient 3\"], "
        "\"health_attributes\": [\"e.g. rich in vitamins\", \"e.g. high in fibre\"], "
        "\"health_concerns\": [\"e.g. high in saturated fat\", \"e.g. Contains Tartrazine\", \"e.g. artificial flavors\"], "
        "\"ingredient_health_score\": 75, "
        "\"not_food_image\": false}"
    )

    try:
        response = requests.post("http://localhost:11434/api/generate", json={
            "model": "llava",
            "prompt": prompt,
            "images": [image_data],
            "stream": False
        }, timeout=90)

        raw = response.json().get("response", "{}")
        # Strip markdown block if present
        if "```json" in raw:
            raw = raw.split("```json")[1].split("```")[0]
        elif "```" in raw:
            raw = raw.split("```")[1].split("```")[0]
            
        json_match = re.search(r'\{.*\}', raw, re.DOTALL)

        if not json_match:
            return jsonify({
                "error": "unclear_image",
                "message": "Could not identify food in this image. Please upload a clear photo showing ingredients or food items."
            }), 422

        nutrition = json.loads(json_match.group())

        # If LLaVA says it's not a food image and hasn't identified anything
        ingredients_list = nutrition.get("ingredients_identified", [])
        is_empty_ingredients = len(ingredients_list) == 0 or (len(ingredients_list) == 1 and "specific ingredient" in ingredients_list[0])
        
        if nutrition.get("not_food_image") and is_empty_ingredients:
            return jsonify({
                "error": "unclear_image",
                "message": "No food or ingredients detected. Please upload a clear photo showing visible ingredients (e.g. vegetables, fruits, grains, spices, or a packaged label)."
            }), 422

    except Exception as e:
        return jsonify({
            "error": "scan_failed",
            "message": f"Scan failed: {str(e)}. Make sure Ollama is running with the llava model."
        }), 500

    # Build health warnings and Red Alerts based on values + LLaVA's health_concerns
    warnings = []
    red_alerts = []
    
    # Check LLaVA's detected health concerns for Red Alerts
    red_flag_keywords = ['tartrazine', 'sunset yellow', 'carmoisine', 'color', 'colour', 'msg', 'artificial flavor', 'artificial flavour', 'preservative', 'trans fat', 'saturated fat', 'banned']
    for concern in nutrition.get("health_concerns", []):
        if concern and concern not in ["e.g. high in saturated fat", "e.g. processed carbohydrates", "e.g. Contains Tartrazine", "e.g. artificial flavors"]:
            concern_lower = concern.lower()
            if any(flag in concern_lower for flag in red_flag_keywords):
                red_alerts.append(f"🚨 {concern}")
            else:
                warnings.append(f"⚠️ {concern}")
                
    # Numerical thresholds as additional guardrails (Red Alerts for Indian food standards)
    if nutrition.get("sugar_g", 0) > 25:
        red_alerts.append(f"🚨 High sugar content ({nutrition['sugar_g']}g) — exceeds 25g limit")
    elif nutrition.get("sugar_g", 0) > 15:
        warnings.append(f"⚠️ Moderate sugar ({nutrition['sugar_g']}g) — limit intake")
        
    if nutrition.get("sodium_mg", 0) > 200:
        red_alerts.append(f"🚨 High sodium ({nutrition['sodium_mg']}mg) — exceeds 200mg limit")
        
    if nutrition.get("fat_g", 0) > 20:
        red_alerts.append(f"🚨 High fat content ({nutrition['fat_g']}g per serving)")
        
    if nutrition.get("calories", 0) > 500:
        warnings.append(f"⚠️ High calorie count ({nutrition['calories']} kcal) — be mindful of portions")

    # Build positives from LLaVA's health_attributes + numerical checks
    positives = []
    for attr in nutrition.get("health_attributes", []):
        if attr and attr not in ["e.g. rich in vitamins", "e.g. high in fibre"]:
            positives.append(f"✓ {attr}")
    if nutrition.get("protein_g", 0) >= 10:
        positives.append(f"✓ Good source of protein ({nutrition['protein_g']}g per serving)")
    if nutrition.get("sugar_g", 0) <= 5:
        positives.append("✓ Low sugar content — suitable for diabetics")
    if nutrition.get("sodium_mg", 0) <= 300:
        positives.append("✓ Low sodium — heart-friendly")
    if nutrition.get("fat_g", 0) <= 5:
        positives.append("✓ Low fat — good for weight management")
    if nutrition.get("fiber_g", 0) >= 5:
        positives.append(f"✓ High dietary fibre ({nutrition['fiber_g']}g) — great for digestion")

    # AI tip based on specifically identified ingredients
    ingredients = nutrition.get("ingredients_identified", [])
    real_ingredients = [i for i in ingredients if i and not i.startswith("specific ingredient")]
    if real_ingredients:
        ingr_str = ', '.join(real_ingredients[:4])
        ai_tip = (
            f"The identified ingredients ({ingr_str}) are most nutritious when fresh and minimally processed. "
            "Consider steaming or lightly sautéing rather than deep-frying to retain maximum nutrients."
        )
    else:
        ai_tip = "Eat a variety of colourful vegetables and whole grains for a balanced, nutritious diet."

    # Use LLaVA's ingredient-based health score if provided; fall back to calculated score
    llava_score = nutrition.get("ingredient_health_score")
    if llava_score and isinstance(llava_score, (int, float)) and 0 <= llava_score <= 100:
        # Blend LLaVA's ingredient-aware score (70%) with nutrition-calculated score (30%)
        calc_score = calculate_nutrition(nutrition)
        score = round(0.70 * float(llava_score) + 0.30 * calc_score)
    else:
        score = calculate_nutrition(nutrition)

    nutrition["health_score"] = score
    nutrition["warnings"] = list(dict.fromkeys(warnings))   # deduplicate
    nutrition["red_alerts"] = list(dict.fromkeys(red_alerts)) # deduplicate
    nutrition["positives"] = list(dict.fromkeys(positives))  # deduplicate
    nutrition["ai_tip"] = ai_tip
    nutrition["ingredients_identified"] = real_ingredients if real_ingredients else ingredients
    nutrition["verdict"] = (
        "✅ Healthy choice" if score >= 70
        else ("⚠️ Moderate — consume in moderation" if score >= 45
              else "❌ Avoid regularly — high in unhealthy nutrients")
    )

    return jsonify(nutrition)