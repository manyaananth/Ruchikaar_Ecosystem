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
    LLaVA identifies ALL visible ingredients + hidden nasties, then gives a health rating.
    """
    import requests as req, base64, json, re, os
    OLLAMA_BASE = os.getenv("OLLAMA_URL", "http://localhost:11434")

    file = request.files.get("image")
    if not file:
        return jsonify({"error": "No image"}), 400

    image_data = base64.b64encode(file.read()).decode("utf-8")

    prompt = (
        "You are a food scientist and nutritionist. Look at this image and identify ALL food items visible.\n\n"
        "For packaged food: read the ingredients list on the label carefully.\n"
        "For raw ingredients/cooked food: identify what you can see.\n\n"
        "IMPORTANT - Specifically look for and flag these hidden harmful ingredients:\n"
        "Palm Oil, Hydrogenated Vegetable Oil, Trans Fat, Partially Hydrogenated Oil,\n"
        "Tartrazine (E102), Sunset Yellow (E110), Carmoisine (E122), Allura Red (E129),\n"
        "MSG / Monosodium Glutamate (E621), Sodium Benzoate (E211),\n"
        "Sulphur Dioxide (E220), Potassium Bromate, TBHQ (E319), BHA (E320), BHT (E321),\n"
        "High Fructose Corn Syrup, Maida (Refined Flour), Artificial Colours, Artificial Flavours.\n\n"
        "Estimate the nutrition per 100g or per one serving shown.\n\n"
        "RESPOND ONLY with this exact JSON format (no markdown fences, no extra text):\n"
        "{\"product_name\": \"descriptive name\", "
        "\"serving_size\": \"100g or 1 piece etc\", "
        "\"calories\": 0, \"protein_g\": 0, \"carbs_g\": 0, \"fat_g\": 0, "
        "\"sugar_g\": 0, \"sodium_mg\": 0, \"fiber_g\": 0, "
        "\"ingredients_identified\": [\"list\", \"each\", \"ingredient\"], "
        "\"hidden_nasties\": [\"Palm Oil\", \"Tartrazine E102\"], "
        "\"health_attributes\": [\"e.g. High in protein\", \"e.g. Low sugar\"], "
        "\"health_concerns\": [\"e.g. Contains artificial colour\", \"e.g. High sodium\"], "
        "\"ingredient_health_score\": 70, "
        "\"not_food_image\": false}"
    )

    try:
        response = req.post(f"{OLLAMA_BASE}/api/generate", json={
            "model": "llava",
            "prompt": prompt,
            "images": [image_data],
            "stream": False
        }, timeout=120)

        raw = response.json().get("response", "")

        # Strip markdown fences if present
        if "```json" in raw:
            parts = raw.split("```json")
            if len(parts) > 1:
                raw = parts[1].split("```")[0]
        elif "```" in raw:
            parts = raw.split("```")
            if len(parts) > 1:
                raw = parts[1]

        # Robust JSON extraction - handles nested arrays/objects with DOTALL
        json_match = re.search(r'\{[\s\S]*\}', raw)

        if not json_match:
            return jsonify({
                "error": "unclear_image",
                "message": "Could not read a response from the AI. Please try again with a clearer photo showing ingredients or food items."
            }), 422

        # Try to parse JSON, with fallback for partial/truncated JSON
        try:
            nutrition = json.loads(json_match.group())
        except json.JSONDecodeError:
            # Try to find the balanced JSON substring
            try:
                text = json_match.group()
                depth = 0
                end = 0
                for i, ch in enumerate(text):
                    if ch == '{':
                        depth += 1
                    elif ch == '}':
                        depth -= 1
                        if depth == 0:
                            end = i + 1
                            break
                nutrition = json.loads(text[:end])
            except Exception:
                return jsonify({
                    "error": "unclear_image",
                    "message": "The AI could not analyse this image clearly. Try a brighter, closer photo of the food or its label."
                }), 422

        # Only reject if explicitly flagged NOT food AND zero real ingredients found
        ingredients_list = nutrition.get("ingredients_identified", [])
        real_ingredients = [i for i in ingredients_list if i and len(str(i).strip()) > 2]

        if nutrition.get("not_food_image") and len(real_ingredients) == 0:
            return jsonify({
                "error": "unclear_image",
                "message": "No food or ingredients detected. Please upload a clear photo showing food items, raw ingredients, or a packaged food label."
            }), 422

    except req.exceptions.Timeout:
        return jsonify({
            "error": "scan_failed",
            "message": "The AI is taking too long. Make sure Ollama is running with the llava model and try again."
        }), 500
    except Exception as e:
        return jsonify({
            "error": "scan_failed",
            "message": f"Scan failed: {str(e)}. Make sure Ollama is running with the llava model loaded."
        }), 500

    # ── Build warnings, red alerts, and positives ──────────────────────────

    warnings = []
    red_alerts = []

    # Hidden nasties from the dedicated field
    for nasty in nutrition.get("hidden_nasties", []):
        if nasty and len(str(nasty).strip()) > 2:
            red_alerts.append(f"🚨 {nasty} detected!")

    # Check LLaVA's detected health concerns
    red_flag_keywords = [
        'tartrazine', 'sunset yellow', 'carmoisine', 'allura', 'e102', 'e110', 'e122', 'e129',
        'color', 'colour', 'msg', 'monosodium', 'artificial flavor', 'artificial flavour',
        'preservative', 'trans fat', 'hydrogenated', 'palm oil', 'sulphur', 'sulfur',
        'sodium benzoate', 'tbhq', 'bha', 'bht', 'potassium bromate', 'maida', 'banned'
    ]
    for concern in nutrition.get("health_concerns", []):
        if concern and len(str(concern).strip()) > 5:
            concern_lower = str(concern).lower()
            is_placeholder = any(p in concern_lower for p in ["e.g.", "e.g ", "example"])
            if not is_placeholder:
                if any(flag in concern_lower for flag in red_flag_keywords):
                    alert_text = f"🚨 {concern}"
                    if alert_text not in red_alerts:
                        red_alerts.append(alert_text)
                else:
                    warnings.append(f"⚠️ {concern}")

    # Numerical thresholds
    if nutrition.get("sugar_g", 0) > 25:
        red_alerts.append(f"🚨 High sugar content ({nutrition['sugar_g']}g) — exceeds 25g limit")
    elif nutrition.get("sugar_g", 0) > 15:
        warnings.append(f"⚠️ Moderate sugar ({nutrition['sugar_g']}g) — limit intake")

    if nutrition.get("sodium_mg", 0) > 600:
        red_alerts.append(f"🚨 Very high sodium ({nutrition['sodium_mg']}mg) — risky for blood pressure")
    elif nutrition.get("sodium_mg", 0) > 300:
        warnings.append(f"⚠️ Elevated sodium ({nutrition['sodium_mg']}mg) — consume in moderation")

    if nutrition.get("fat_g", 0) > 20:
        red_alerts.append(f"🚨 High fat content ({nutrition['fat_g']}g per serving)")

    if nutrition.get("calories", 0) > 500:
        warnings.append(f"⚠️ High calorie count ({nutrition['calories']} kcal) — be mindful of portions")

    # ── Positives ──────────────────────────────────────────────────────────
    positives = []
    for attr in nutrition.get("health_attributes", []):
        if attr and len(str(attr).strip()) > 5:
            is_placeholder = any(p in str(attr).lower() for p in ["e.g.", "e.g ", "example"])
            if not is_placeholder:
                positives.append(f"✓ {attr}")

    if nutrition.get("protein_g", 0) >= 10:
        positives.append(f"✓ Good source of protein ({nutrition['protein_g']}g per serving)")
    if nutrition.get("sugar_g", 0) <= 5:
        positives.append("✓ Low sugar — suitable for diabetics")
    if nutrition.get("sodium_mg", 0) <= 150:
        positives.append("✓ Low sodium — heart-friendly")
    if nutrition.get("fat_g", 0) <= 3:
        positives.append("✓ Low fat — good for weight management")
    if nutrition.get("fiber_g", 0) >= 5:
        positives.append(f"✓ High dietary fibre ({nutrition['fiber_g']}g) — great for digestion")

    # ── AI Tip ─────────────────────────────────────────────────────────────
    shown_ingredients = real_ingredients if real_ingredients else ingredients_list[:4]
    if shown_ingredients:
        ingr_str = ', '.join(str(i) for i in shown_ingredients[:4])
        ai_tip = (
            f"Identified: {ingr_str}. "
            "For maximum nutrition, steam or lightly sauté rather than deep-fry. "
            "Pair with whole grains for a complete meal."
        )
    else:
        ai_tip = "Eat a variety of colourful vegetables and whole grains for a balanced, nutritious diet."

    # ── Score ───────────────────────────────────────────────────────────────
    llava_score = nutrition.get("ingredient_health_score")
    if llava_score and isinstance(llava_score, (int, float)) and 0 <= llava_score <= 100:
        calc_score = calculate_nutrition(nutrition)
        score = round(0.70 * float(llava_score) + 0.30 * calc_score)
    else:
        score = calculate_nutrition(nutrition)

    nutrition["health_score"] = score
    nutrition["warnings"] = list(dict.fromkeys(warnings))
    nutrition["red_alerts"] = list(dict.fromkeys(red_alerts))
    nutrition["positives"] = list(dict.fromkeys(positives))
    nutrition["ai_tip"] = ai_tip
    nutrition["ingredients_identified"] = real_ingredients if real_ingredients else ingredients_list
    nutrition["verdict"] = (
        "✅ Healthy choice" if score >= 70
        else ("⚠️ Moderate — consume in moderation" if score >= 45
              else "❌ Avoid regularly — high in unhealthy nutrients")
    )

    return jsonify(nutrition)