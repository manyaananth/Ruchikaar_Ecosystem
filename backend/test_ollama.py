import requests, json

# Test 1: Direct phi3 test with simple prompt
print("=== TEST 1: Direct phi3 simple prompt ===")
res = requests.post("http://localhost:11434/api/generate", json={
    "model": "phi3",
    "prompt": 'You are a chef. Create a spinach chickpea recipe. Return ONLY valid JSON with keys: title, steps (array of 3 strings), nutrition_per_serving (with calories:200, protein_g:10, carbs_g:20, fat_g:5).',
    "stream": False,
    "options": {"temperature": 0.5, "num_predict": 500}
}, timeout=120)

print("Ollama status:", res.status_code)
raw = res.json().get("response", "")
print("Raw output (first 600 chars):", raw[:600])
print()

# Test 2: Test recipe generate API
print("=== TEST 2: Flask /api/recipe/generate ===")
res2 = requests.post("http://localhost:5000/api/recipe/generate", json={
    "ingredients": ["spinach", "chickpeas", "lemon"],
    "time_minutes": 20,
    "servings": 2,
    "vegOnly": True
}, timeout=120)

print("Flask status:", res2.status_code)
if res2.status_code == 200:
    data = res2.json()
    print("Title:", data.get("title"))
    print("Ingredients used:", data.get("ingredients_used"))
    print("Nutrition:", json.dumps(data.get("nutrition_per_serving", {}), indent=2))
else:
    print("Error:", res2.text[:300])
