import unittest
from calculator import calculate_carbon_baseline

class TestCarbonCalculator(unittest.TestCase):
    def test_vegan_low_impact(self):
        inputs = {
            "vehicleType": "walking",
            "distancePerDay": 0,
            "acHours": 0,
            "fanHours": 0,
            "tvHours": 0,
            "computerHours": 0,
            "mobileChargingSessions": 0,
            "dietType": "vegan",
            "plasticUseScale": 1,
            "foodWasteScale": 1,
            "recyclingHabit": "full"
        }
        res = calculate_carbon_baseline(inputs)
        # transport = 0, electricity = 0, food = 1.1, waste = 0.25*1 + 0.35*1 - 0.60 = 0.0
        # Lower bound for waste score is 0.1
        # daily total = 0 + 0 + 1.1 + 0.1 = 1.2
        self.assertEqual(res["score"], 1.2)
        self.assertEqual(res["grade"], "A+")

    def test_mixed_diet_car_heavy_impact(self):
        inputs = {
            "vehicleType": "car",
            "fuelType": "diesel",
            "distancePerDay": 50, # 50 * 0.42 * 1.25 = 26.25
            "acHours": 8, # 8 * 1.2 * 0.5 = 4.8
            "fanHours": 10, # 10 * 0.075 * 0.5 = 0.375
            "tvHours": 4, # 4 * 0.1 * 0.5 = 0.2
            "computerHours": 6, # 6 * 0.2 * 0.5 = 0.6
            "mobileChargingSessions": 2, # 2 * 0.015 * 0.5 = 0.015
            "dietType": "mixed",
            "plasticUseScale": 5, # 5 * 0.25 = 1.25
            "foodWasteScale": 4, # 4 * 0.35 = 1.40
            "recyclingHabit": "none" # waste score = 1.25 + 1.40 = 2.65
        }
        res = calculate_carbon_baseline(inputs)
        # Daily total calculation check:
        # transport = 26.25
        # electricity = 4.8 + 0.375 + 0.2 + 0.6 + 0.015 = 5.99
        # food = 3.6
        # waste = 2.65
        # total = 26.25 + 5.99 + 3.6 + 2.65 = 38.49
        self.assertEqual(res["score"], 38.49)
        self.assertEqual(res["grade"], "F")

    def test_vegetarian_hybrid_medium_impact(self):
        inputs = {
            "vehicleType": "car",
            "fuelType": "hybrid",
            "distancePerDay": 20, # 20 * 0.42 * 0.6 = 5.04
            "acHours": 2, # 2 * 1.2 * 0.5 = 1.2
            "fanHours": 4, # 4 * 0.075 * 0.5 = 0.15
            "tvHours": 2, # 0.1
            "computerHours": 2, # 0.2
            "mobileChargingSessions": 1, # 0.0075
            "dietType": "vegetarian", # 1.9
            "plasticUseScale": 2, # 0.5
            "foodWasteScale": 2, # 0.7
            "recyclingHabit": "partial" # -0.25 -> 0.95
        }
        res = calculate_carbon_baseline(inputs)
        # Daily total = 5.04 + 1.6575 + 1.9 + 0.95 = 9.5475 -> ~9.55 (depends on precision of floats)
        self.assertAlmostEqual(res["score"], 9.55, places=1)

if __name__ == "__main__":
    unittest.main()
