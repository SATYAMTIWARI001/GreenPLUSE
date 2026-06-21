# 🌍 GreenPulse AI – Carbon Footprint Tracking & Strategy

## 📌 Chosen Vertical
**Sustainability, Climate Technology & Active Carbon Offsets**

GreenPulse AI is an advanced, high-fidelity platform designed to track, simulate, and actively offset individual carbon footprints. Our target is converting climate anxiety into direct, auditable actions by bridging intelligent telemetry (IoT C language inputs), regional calculations (Python 3 micro-engines), and custom Gemini AI recommendations into a gamified reward economy.

---

## 💡 Approach & Logic (Multi-Language Architecture)

To guarantee maximum reliability and low-latency performance in resource-constrained environments (like microcontrollers and web servers), GreenPulse AI adopts a **three-tier multi-engine computation model**:

```
           ┌─────────────────────────────┐
           │     React + Canvas UI       │
           └──────────────┬──────────────┘
                          │
                          ▼
           ┌─────────────────────────────┐
           │   Express API Routing Node  │
           └──────┬───────────────┬──────┘
                  │               │
                  │ (Primary)     │ (Fallback)
                  ▼               ▼
     ┌────────────────────────┐ ┌────────────────────────┐
     │  Python 3 Math Core    │ │   TypeScript Core      │
     │     (calculator.py)    │ │      (server.ts)       │
     └────────────┬───────────┘ └────────────────────────┘
                  │
                  ▼
     ┌────────────────────────┐
     │   IoT Embedded C Core  │
     │     (calculator.c)     │
     └────────────────────────┘
```

1. **Embedded IoT C Engine (`calculator.c`)**: A zero-dependency C99 compliant core optimized for low-power microcontroller deployment (e.g. smart home electric meters). It parses inputs and outputs pure JSON payloads.
2. **Python 3 Math Core (`calculator.py`)**: The primary calculation backend. Spawns as a sub-process inside Node to run complex floating-point matrices.
3. **TypeScript / JavaScript Fallback (`server.ts`)**: Serves calculations instantly if sub-processes are unavailable, backed by an in-memory duplicate check cache to minimize execution overhead.
4. **Google Gemini AI Integration (`gemini-3.5-flash`)**: Dynamically layers custom, India-aware recommendations on top of mathematical scores based on individual commute ranges, TV habits, and local diet indices.

---

## ⚙️ Core Mathematical Equations & Coefficients

All calculations estimate daily Greenhouse Gas emissions in kilograms of Carbon Dioxide equivalents ($\text{kg CO}_2\text{e}$). 

### 1. Transportation Formula
$$\text{Commute Footprint} = \text{Distance (km)} \times \text{Vehicle Factor} \times \text{Fuel Multiplier}$$

* **Vehicle Factors ($\text{kg CO}_2\text{e/km}$)**:
  * Private Car: `0.42`
  * Motorbike: `0.15`
  * Public Bus: `0.08`
  * Train: `0.05`
  * Metro Rail: `0.04`
  * Walking / Cycling: `0.00`
* **Fuel Adjustment Factors (Car)**:
  * Diesel: `1.25`
  * Petrol: `1.00`
  * Hybrid: `0.60`
  * Electric (EV charged via clean grids): `0.15`

### 2. Domestic Electricity Formula
$$\text{Electricity Footprint} = \sum (\text{Device Hours} \times \text{Power Rating (kW)}) \times \text{Grid Intensity}$$

* **Grid Intensity Standard**: `0.5 kg CO₂e per kWh` (typical coal-heavy marginal grid mix).
* **Power Ratings**:
  * Air Conditioner (AC): `1.2 kW`
  * Ceiling Fan: `0.075 kW`
  * TV Screen: `0.1 kW`
  * Computer / Console: `0.2 kW`
  * Mobile Charger: `0.015 kW`

### 3. Diet & Nutrition Formula
* **Diet Daily Constants**:
  * Strictly Vegan: `1.1 kg CO₂e`
  * Vegetarian: `1.9 kg CO₂e`
  * Mixed Diet (Poultry/Meat): `3.6 kg CO₂e`

### 4. Waste & Circularity Index
$$\text{Waste Footprint} = (\text{Plastic Scale [1-5]} \times 0.25) + (\text{Food Waste Scale [1-5]} \times 0.35) - \text{Recycling Offset}$$

* **Recycling Offsets**:
  * Full circular sorting: `-0.60`
  * Partial separation: `-0.25`
  * Landfill base: `0.00`
  * *Floor Limit: Waste score is constrained to a minimum of $0.1$ to represent background infrastructure footprint.*

---

## ✨ Premium Features

- **Live Air Quality Index & Geolocation weather**: Requests geolocation coordinates to calculate real-time temperature, condition, and PM 2.5 counts.
- **Interactive Twin Simulator Sandbox**: Allows users to dynamically slide solar generation shares, mobility replacements, and sorting to run predictive 30-year forestation curves.
- **OCR Digital Receipt Scanner**: Simulates camera audit parses of physical bills or transport tickets to credit coins directly to user profiles.
- **Verification Rewards Store**: Allows users to invest accrued GreenPoints into real Varanasi reforestation initiatives or Bihar solar clean-water blocks, unlocking certified printable PDF ecological stamps.
- **Gamified Leagues**: Competes users across Global Leaderboard tabs categorizing Cities, Colleges, and Individuals.

---

## 🧠 Assumptions Made

1. **Global Default Baseline**: The baseline standard daily footprint is assumed to be `14.5 kg CO₂e` (equivalent to global averages) to measure relative reduction percentages.
2. **Representative Day**: User responses are assumed to reflect average daily choices over a 365-day year.
3. **Linear Sandbox Modeling**: The Sandbox simulation assumes linear relationships between local adjustments (e.g. EV transition) and individual carbon reductions.
4. **Educational Scope**: Calculations are high-accuracy estimates meant to drive lifestyle strategy rather than replace formal carbon auditing standards.

---

## 🚀 Running & Verification

```bash
# Install node dependencies
npm install

# Run the test suites (Vitest, Python unittest, C compiled binaries)
npm run test

# Check TypeScript compiler checks
npm run lint

# Start the dev environment
npm run dev
```
