import requests

prompt = """You are a world-class Indian nutritionist and chef.
You MUST use these exact ingredients in the recipe: spinach, chickpeas, lemon, garlic.
Create a COMPLETE, restaurant-quality Indian recipe.
Context: clear weather, 25°C. Health goal: balanced diet. Prep time: 25 mins. Servings: 2.

CRITICAL RULES — follow exactly:
1. Write EXACTLY 7 detailed cooking steps. Each step must be 1-2 full sentences with specific quantities, temperatures and timings.
2. Do NOT number steps or add any "Step N:" prefix — just plain prose sentences.
3. Nutrition values MUST be real-world estimates based on the actual ingredients used, NOT placeholder zeros.
4. Include honest health warnings (e.g. high sodium, high fat) and genuine positives.
5. Respond ONLY with valid JSON — no markdown, no extra text, no explanation before or after.

JSON structure to respond with — REPLACE the example numbers in nutrition with REAL estimates for the actual ingredients:
{
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
  "servings": 2,
  "prep_time": "25 mins",
  "nutrition_per_serving": {
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
  },
  "warnings": ["Specific health concern for THIS dish based on its actual ingredients"],
  "positives": ["Specific health benefit of THIS dish based on its actual ingredients"],
  "ai_tip": "One practical tip to make this specific recipe healthier or tastier"
}"""

print("Sending request to Ollama...")
res = requests.post("http://localhost:11434/api/generate", json={
    "model": "phi3",
    "prompt": prompt,
    "stream": False,
    "options": {"temperature": 0.7, "num_predict": 1500}
}, timeout=180)

raw = res.json().get("response", "")
print("=== RAW RESPONSE ===")
print(raw)
