import requests, json, sys
sys.stdout.reconfigure(encoding='utf-8')

print("=== FINAL ENDPOINT VERIFICATION ===")

# 1. Recipe generate with tomato+potato+onion (should NOT be paneer masala)
res = requests.post("http://localhost:5000/api/recipe/generate", json={
    "ingredients": ["tomato", "potato", "onion"],
    "time_minutes": 20, "servings": 2
}, timeout=200)
d = res.json()
n = d.get("nutrition_per_serving", {})
title = d.get("title", "?")
cal = n.get("calories", 0)
print(f"[generate] {res.status_code} - Title: {title}")
print(f"  Nutrition: Cal={cal} P={n.get('protein_g')}g C={n.get('carbs_g')}g F={n.get('fat_g')}g")
print(f"  Ingredients: {d.get('ingredients_used', [])[:3]}")
print(f"  Warnings: {d.get('warnings', [])[:1]}")
print(f"  Positives: {d.get('positives', [])[:1]}")
if "paneer" in title.lower() and "tomato" not in str(d.get("ingredients_used", [])).lower():
    print("  ISSUE: Recipe not using the input ingredients!")
else:
    print("  PASS: Recipe uses actual ingredients!")

# 2. Health summary
res3 = requests.get("http://localhost:5000/api/health/summary/1", timeout=5)
print(f"\n[health summary] {res3.status_code} - {res3.json()}")

# 3. Saved recipes
res4 = requests.get("http://localhost:5000/api/recipe/saved/1", timeout=5)
print(f"[saved recipes] {res4.status_code} - {len(res4.json())} recipes saved")
