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
        # transport = 0, electricity = 0, food = 1.1, waste = 0.25*1 + 0.35*1 - 0.60 = 0.0 -> floor to 0.1
        # daily total = 1.2
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
        self.assertAlmostEqual(res["score"], 9.55, places=1)

    def test_cycling_zero_transport_emissions(self):
        inputs = {
            "vehicleType": "cycling",
            "distancePerDay": 30, # active transport factor is 0
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
        self.assertEqual(res["breakdown"]["transport"], 0.0)
        self.assertEqual(res["score"], 1.2)

    def test_metro_efficient_transport(self):
        inputs = {
            "vehicleType": "metro", # 0.04 factor
            "distancePerDay": 25, # 25 * 0.04 = 1.0 kg CO2
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
        self.assertEqual(res["breakdown"]["transport"], 1.0)
        self.assertEqual(res["score"], 2.2)

    def test_extreme_high_power_usage(self):
        inputs = {
            "vehicleType": "none",
            "distancePerDay": 0,
            "acHours": 24, # 24 * 1.2 * 0.5 = 14.4
            "fanHours": 24, # 24 * 0.075 * 0.5 = 0.9
            "tvHours": 24, # 24 * 0.1 * 0.5 = 1.2
            "computerHours": 24, # 24 * 0.2 * 0.5 = 2.4
            "mobileChargingSessions": 10, # 10 * 0.015 * 0.5 = 0.075
            "dietType": "mixed", # 3.6
            "plasticUseScale": 5, # 1.25
            "foodWasteScale": 5, # 1.75
            "recyclingHabit": "none" # 3.0
        }
        res = calculate_carbon_baseline(inputs)
        # electricity total = 14.4 + 0.9 + 1.2 + 2.4 + 0.075 = 18.975
        # food = 3.6
        # waste = 3.0
        # total = 25.575 -> 25.58
        self.assertAlmostEqual(res["breakdown"]["electricity"], 18.98, places=1)
        self.assertAlmostEqual(res["score"], 25.58, places=1)

if __name__ == "__main__":
    unittest.main()
