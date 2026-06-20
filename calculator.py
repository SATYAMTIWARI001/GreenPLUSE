import sys
import json

def calculate_carbon_baseline(inputs):
    transport_score = 0.0
    electricity_score = 0.0
    food_score = 0.0
    waste_score = 0.0

    # 1. Transportation Index
    vehicle_factors = {
        "car": 0.42,      # kg CO2 per km
        "bike": 0.15,
        "bus": 0.08,
        "train": 0.05,
        "metro": 0.04,
        "walking": 0.0,
        "cycling": 0.0,
        "none": 0.0
    }
    
    vehicle_type = inputs.get("vehicleType", "none")
    distance_per_day = float(inputs.get("distancePerDay", 0.0))
    
    factor = vehicle_factors.get(vehicle_type, 0.0)
    transport_score = distance_per_day * factor

    if vehicle_type == "car":
        fuel_type = inputs.get("fuelType")
        if fuel_type == "diesel":
            transport_score *= 1.25
        elif fuel_type == "electric":
            transport_score *= 0.15
        elif fuel_type == "hybrid":
            transport_score *= 0.60

    # 2. Electricity Usage Index
    ac_hours = float(inputs.get("acHours", 0.0))
    fan_hours = float(inputs.get("fanHours", 0.0))
    tv_hours = float(inputs.get("tvHours", 0.0))
    computer_hours = float(inputs.get("computerHours", 0.0))
    mobile_sessions = float(inputs.get("mobileChargingSessions", 0.0))

    electricity_score += ac_hours * 1.2 * 0.5
    electricity_score += fan_hours * 0.075 * 0.5
    electricity_score += tv_hours * 0.1 * 0.5
    electricity_score += computer_hours * 0.2 * 0.5
    electricity_score += mobile_sessions * 0.015 * 0.5

    # 3. Diet Index
    diet_type = inputs.get("dietType", "mixed")
    if diet_type == "vegan":
        food_score = 1.1
    elif diet_type == "vegetarian":
        food_score = 1.9
    else:
        food_score = 3.6  # Mixed rich diet

    # 4. Waste Index
    plastic_scale = float(inputs.get("plasticUseScale", 1.0))
    food_waste_scale = float(inputs.get("foodWasteScale", 1.0))
    recycling_habit = inputs.get("recyclingHabit", "none")

    waste_score += plastic_scale * 0.25
    waste_score += food_waste_scale * 0.35

    if recycling_habit == "full":
        waste_score -= 0.60
    elif recycling_habit == "partial":
        waste_score -= 0.25

    if waste_score < 0.1:
        waste_score = 0.1

    daily_total = round(transport_score + electricity_score + food_score + waste_score, 2)
    yearly_score = round((daily_total * 365) / 1000, 2) # Metric tons

    # Sustainable Grading band (Average around 12-16 kg daily)
    if daily_total <= 3.0:
        grade = "A+"
    elif daily_total <= 6.0:
        grade = "A"
    elif daily_total <= 10.0:
        grade = "B"
    elif daily_total <= 15.0:
        grade = "C"
    elif daily_total <= 22.0:
        grade = "D"
    else:
        grade = "F"

    avg_default = 14.5
    comparison_percent = int(round(((daily_total - avg_default) / avg_default) * 100))

    saved_compared_to_avg = max(0.0, avg_default - daily_total)
    trees_planted = max(1, int(round(saved_compared_to_avg * 0.5)))
    cars_removed_days = max(1, int(round(saved_compared_to_avg / 0.42)))
    electricity_saved_kwh = max(1, int(round(saved_compared_to_avg / 0.5)))

    # Backups for custom recommendations
    suggestions = {
        "transport": [
            "Transition your travel route towards public buses or metro setups and reduce private emissions by 80%." if vehicle_type == "car" else "Masterfully elegant! Your choice of lightweight or active transport options minimizes global atmospheric heating.",
            "Bundle your short commutes together or complete errands within walking distances to actively preserve the ozone envelope."
        ],
        "energy": [
            "Configure your air conditioning thermostat 2 degrees higher (to 24°C) to dynamically capture up to 15% electric overhead savings." if ac_hours > 2 else "Fantastic work! Your sparse usage of air cooling mechanisms keeps grid demand perfectly low.",
            "Power down computers, external displays, and charging blocks directly from wall toggle switches to resolve phantom draw loads."
        ],
        "food": [
            "Schedule one or two Meatless Mondays weekly. Reducing red meat and dairy feeds 2x better resource conservation." if diet_type != "vegan" else "Incredible choice! Plant-bound components scale down nitrous oxide agricultural footprints heavily.",
            "Purchase organic community-farmed items locally to circumvent high aviation-based supply chain distribution emissions."
        ],
        "waste": [
            "Carry custom silicone or metallic flasks and textile satchels to completely avoid single-use polyethelene." if plastic_scale > 2 else "Stunning containment! Your plastics footprint is remarkably low.",
            "Initiate complete separation sorting at home: segregate bioplastics, food peels, tin, and circular recovery waste." if recycling_habit != "full" else "Splendid! Sorting metals, plastics, and cellulose feeds high circular recovery."
        ]
    }

    return {
        "engine": "Python 3 Engine Core",
        "score": daily_total,
        "yearlyScore": yearly_score,
        "grade": grade,
        "comparisonPercent": comparison_percent,
        "breakdown": {
            "transport": round(transport_score, 2),
            "electricity": round(electricity_score, 2),
            "food": round(food_score, 2),
            "waste": round(waste_score, 2)
        },
        "equivalents": {
            "treesPlanted": trees_planted,
            "carsRemovedDays": cars_removed_days,
            "electricitySavedKwh": electricity_saved_kwh
        },
        "suggestions": suggestions
    }

if __name__ == "__main__":
    try:
        # Read JSON string inputs from stdin
        input_data = json.load(sys.stdin)
        result = calculate_carbon_baseline(input_data)
        print(json.dumps(result))
    except Exception as e:
        # Fallback to general base inputs
        fallback_res = {
            "error": str(e),
            "engine": "Python 3 Fallback Mode"
        }
        print(json.dumps(fallback_res))
