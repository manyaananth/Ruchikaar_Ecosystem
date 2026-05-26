def calculate_nutrition(nutrition):
    protein = nutrition.get("protein_g", 0)
    carbs = nutrition.get("carbs_g", 0)
    fat = nutrition.get("fat_g", 0)
    total = protein + carbs + fat
    if total == 0:
        return 50
    protein_ratio = protein / total
    fat_ratio = fat / total
    score = 100
    if protein_ratio < 0.15: score -= 20
    if fat_ratio > 0.40: score -= 25
    if carbs > 80: score -= 15
    return max(0, min(100, score))