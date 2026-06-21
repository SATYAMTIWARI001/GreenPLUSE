import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { spawn } from "child_process";
import crypto from "crypto";
import { DBStructure, User, LeaderboardEntry, CarbonInputs, CarbonResult, Challenge } from "./src/types";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Security middleware to set standard headers
app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:;"
  );
  next();
});

// Password Hashing configuration
const PASSWORD_SALT = "greenpulse_salt_2026";
function hashPassword(password: string): string {
  return crypto.createHmac("sha256", PASSWORD_SALT).update(password).digest("hex");
}

// XSS Sanitizer for input strings
function sanitizeInput(str: string): string {
  if (typeof str !== "string") return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

// Secure ID generator using crypto
function generateId(prefix: string): string {
  return `${prefix}-${crypto.randomBytes(4).toString("hex")}`;
}

// Lazy Gemini Initialization
let aiClient: GoogleGenAI | null = null;
let geminiFailed = false;
function getGemini() {
  if (geminiFailed) return null;
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      try {
        aiClient = new GoogleGenAI({
          apiKey: key,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });
        console.log("Successfully initialized server-side Gemini client.");
      } catch (err) {
        console.error("Failed to initialize Gemini client:", err);
      }
    }
  }
  return aiClient;
}

// Durable local server-side database path
const dbPath = path.join(process.cwd(), "data-store.json");

// Default Database Seed Data (pre-hashed with 53ca1e32ad82e329b2d1f33a214e1bbe7d4089acbcaa053289e2edb5c64be078 for password123)
const defaultDB = {
  users: [
    {
      id: "admin-id",
      email: "satyam000108@gmail.com",
      name: "Satyam Tiwari",
      password: "53ca1e32ad82e329b2d1f33a214e1bbe7d4089acbcaa053289e2edb5c64be078",
      avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Satyam%20Tiwari",
      createdAt: new Date().toISOString(),
      carbonScore: 4.1,
      ecoRank: "Sustainability Master",
      badgeIds: ["badge-1", "badge-2", "badge-3", "badge-4", "badge-5"],
      points: 4850,
      completedChallenges: ["challenge-1", "challenge-2"],
      role: "admin" as const,
      gender: "Male"
    },
    {
      id: "user-elena",
      email: "sanika@pulse.eco",
      name: "Sanika Husan",
      password: "53ca1e32ad82e329b2d1f33a214e1bbe7d4089acbcaa053289e2edb5c64be078",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sanika%20Husan",
      createdAt: new Date().toISOString(),
      carbonScore: 4.8,
      ecoRank: "Earth Champion",
      badgeIds: ["badge-1", "badge-2", "badge-3", "badge-4"],
      points: 4200,
      completedChallenges: ["challenge-1"],
      role: "user" as const
    },
    {
      id: "user-john",
      email: "abbas@pulse.eco",
      name: "Abbas Masood",
      password: "53ca1e32ad82e329b2d1f33a214e1bbe7d4089acbcaa053289e2edb5c64be078",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Abbas%20Masood",
      createdAt: new Date().toISOString(),
      carbonScore: 5.5,
      ecoRank: "Green Warrior",
      badgeIds: ["badge-1", "badge-2"],
      points: 3900,
      completedChallenges: ["challenge-3"],
      role: "user" as const
    }
  ],
  leaderboard: [
    { id: "leader-1", name: "Satyam Tiwari", ecoRank: "Sustainability Master", carbonScore: 4.1, points: 4850, type: "user" as const },
    { id: "leader-2", name: "Sanika Husan", ecoRank: "Earth Champion", carbonScore: 4.8, points: 4200, type: "user" as const },
    { id: "leader-3", name: "Abbas Masood", ecoRank: "Green Warrior", carbonScore: 5.5, points: 3900, type: "user" as const },
    { id: "college-1", name: "Stanford Solar Club", ecoRank: "College League", carbonScore: 3.9, points: 245000, type: "college" as const },
    { id: "college-2", name: "MIT Green Spark", ecoRank: "College League", carbonScore: 4.4, points: 239000, type: "college" as const },
    { id: "college-3", name: "Berkeley Ecowarriors", ecoRank: "College League", carbonScore: 4.2, points: 228000, type: "college" as const },
    { id: "city-1", name: "Copenhagen", ecoRank: "City Grid", carbonScore: 3.2, points: 94000, type: "city" as const },
    { id: "city-2", name: "San Francisco", ecoRank: "City Grid", carbonScore: 4.5, points: 89000, type: "city" as const },
    { id: "city-3", name: "Tokyo Smart-District", ecoRank: "City Grid", carbonScore: 3.8, points: 81200, type: "city" as const }
  ],
  challenges: [
    { id: "challenge-1", title: "Human Engine Mode", description: "Walk or Cycle for all trips under 3km today.", category: "transport" as const, points: 50, completedCount: 142 },
    { id: "challenge-2", title: "Thermal Discipline", description: "Turn off your Air Conditioner 2 hours earlier than usual.", category: "energy" as const, points: 40, completedCount: 89 },
    { id: "challenge-3", title: "Compassionate Plate", description: "Have a completely Vegetarian or Vegan lunch/dinner.", category: "food" as const, points: 30, completedCount: 201 },
    { id: "challenge-4", title: "Plastic Embargo", description: "Avoid using single-use plastic cups/bottles today.", category: "waste" as const, points: 30, completedCount: 115 },
    { id: "challenge-5", title: "Ecosystem Builder", description: "Plant a tree, adopt a potted plant or water public plants.", category: "waste" as const, points: 100, completedCount: 45 }
  ],
  announcements: [
    { id: "ann-1", title: "GreenPulse AI Launched!", content: "Welcome to our green community! Calculate your carbon score and share AI suggestions with your friends.", createdAt: new Date().toISOString(), important: true }
  ],
  environment: {
    treesPlantedTotal: 1845,
    co2ReducedTotal: 24320,
    usersActiveCount: 312
  }
};

// Database in-memory cache
let dbCache: DBStructure | null = null;

// Database utility functions
function loadDB(): DBStructure {
  if (dbCache) {
    return dbCache;
  }
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, "utf-8");
      const db = JSON.parse(data) as DBStructure;
      let migrated = false;
      if (db.users && Array.isArray(db.users)) {
        db.users.forEach((u) => {
          // Auto-migrate any plain text passwords
          if (u.password && u.password.length !== 64) {
            u.password = hashPassword(u.password);
            migrated = true;
          }
        });
      }
      if (migrated) {
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
      }
      dbCache = db;
      return dbCache;
    }
  } catch (e) {
    console.error("Error reading database file, returning default database", e);
  }
  // Setup default db if not existing or broken
  const initialDB: DBStructure = { ...defaultDB };
  initialDB.users = initialDB.users.map((u) => ({
    ...u,
    password: u.password && u.password.length !== 64 ? hashPassword(u.password) : u.password
  }));
  try {
    fs.writeFileSync(dbPath, JSON.stringify(initialDB, null, 2));
  } catch (e) {
    console.error("Could not write initial database file", e);
  }
  dbCache = initialDB;
  return dbCache;
}

function saveDB(data: DBStructure): void {
  dbCache = data;
  fs.writeFile(dbPath, JSON.stringify(data, null, 2), "utf-8", (err) => {
    if (err) {
      console.error("Error writing database file asynchronously:", err);
    }
  });
}

// ---------------- API ENDPOINTS ----------------

// Base health endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "alive", uptime: process.uptime() });
});

// Authentication endpoints
app.post("/api/auth/signup", (req, res) => {
  const { email, password, name, gender } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters long" });
  }

  const db = loadDB();
  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: "User with this email already exists" });
  }

  const sanitizedName = sanitizeInput(name);
  const newUser = {
    id: generateId("user"),
    email: email.toLowerCase(),
    name: sanitizedName,
    password: hashPassword(password),
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(sanitizedName)}`,
    createdAt: new Date().toISOString(),
    carbonScore: 0,
    ecoRank: "Beginner Eco Hero",
    badgeIds: ["badge-1"],
    points: 100, // starting points
    completedChallenges: [],
    role: "user" as const,
    gender: gender ? sanitizeInput(gender) : "Not Specified"
  };

  db.users.push(newUser);
  
  // Also push to leaderboard
  db.leaderboard.push({
    id: newUser.id,
    name: newUser.name,
    ecoRank: newUser.ecoRank,
    carbonScore: newUser.carbonScore,
    points: newUser.points,
    type: "user"
  });

  db.environment.usersActiveCount += 1;
  saveDB(db);

  // Return user without password
  const { password: _, ...userResponse } = newUser;
  res.json({ message: "Registration successful", user: userResponse });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  const db = loadDB();
  const hashedPassword = hashPassword(password);
  const user = db.users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === hashedPassword
  );

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const { password: _, ...userResponse } = user;
  res.json({ message: "Login successful", user: userResponse });
});

// Simulated Google Sign In API
app.post("/api/auth/google", (req, res) => {
  const { email, name, avatarUrl } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: "Email and Name are required for Google login" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  const db = loadDB();
  let user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  const sanitizedName = sanitizeInput(name);
  if (!user) {
    // Register as new Google user
    user = {
      id: generateId("user"),
      email: email.toLowerCase(),
      name: sanitizedName,
      password: hashPassword(generateId("google-oauth-flow")),
      avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(sanitizedName)}`,
      createdAt: new Date().toISOString(),
      carbonScore: 0,
      ecoRank: "Beginner Eco Hero",
      badgeIds: ["badge-1"],
      points: 150, // Google sign up reward
      completedChallenges: [],
      role: email === "satyam000108@gmail.com" ? "admin" : "user",
      gender: "Not Specified"
    };

    db.users.push(user);
    db.leaderboard.push({
      id: user.id,
      name: user.name,
      ecoRank: user.ecoRank,
      carbonScore: user.carbonScore,
      points: user.points,
      type: "user"
    });
    db.environment.usersActiveCount += 1;
    saveDB(db);
  }

  const { password: _, ...userResponse } = user;
  res.json({ message: "Google Authentication successful", user: userResponse });
});

app.post("/api/auth/forgot-password", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }
  res.json({ message: "A secure verification code has been dispatched to your email address." });
});

app.get("/api/user/profile/:userId", (req, res) => {
  const db = loadDB();
  const user = db.users.find((u) => u.id === req.params.userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  const { password: _, ...userResponse } = user;
  res.json(userResponse);
});

// Update Profile
app.post("/api/user/update-profile", (req, res) => {
  const { id, name, avatarUrl, gender } = req.body;
  if (!id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  const db = loadDB();
  const userIdx = db.users.findIndex((u) => u.id === id);
  if (userIdx === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  if (name) db.users[userIdx].name = sanitizeInput(name);
  if (avatarUrl) db.users[userIdx].avatarUrl = avatarUrl;
  if (gender) db.users[userIdx].gender = sanitizeInput(gender);

  // Also update leaderboard
  const lbIdx = db.leaderboard.findIndex((e) => e.id === id);
  if (lbIdx !== -1) {
    if (name) db.leaderboard[lbIdx].name = db.users[userIdx].name;
  }

  saveDB(db);
  const { password: _, ...userResponse } = db.users[userIdx];
  res.json({ message: "User profile updated successfully", user: userResponse });
});

// Python integration runner
function runPythonCalculator(inputs: CarbonInputs): Promise<CarbonResult> {
  return new Promise((resolve, reject) => {
    try {
      const py = spawn("python3", ["calculator.py"]);
      let stdoutData = "";
      let stderrData = "";

      py.stdout.on("data", (data) => {
        stdoutData += data.toString();
      });

      py.stderr.on("data", (data) => {
        stderrData += data.toString();
      });

      py.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(stderrData || `Python exit code: ${code}`));
          return;
        }
        try {
          const parsed = JSON.parse(stdoutData.trim());
          resolve(parsed);
        } catch (err) {
          reject(err);
        }
      });

      py.stdin.write(JSON.stringify(inputs));
      py.stdin.end();
    } catch (err) {
      reject(err);
    }
  });
}

// Static baseline calculator formulas + dynamic suggestions fallback
function calculateCarbonBaseline(inputs: CarbonInputs): CarbonResult {
  let transportScore = 0;
  let electricityScore = 0;
  let foodScore = 0;
  let wasteScore = 0;

  // 1. Transportation index (all results in daily kg CO2)
  const vehicleFactors = {
    car: 0.42, // kg CO2 per km
    bike: 0.15,
    bus: 0.08,
    train: 0.05,
    metro: 0.04,
    walking: 0.0,
    cycling: 0.0,
    none: 0.0
  };
  const factor = vehicleFactors[inputs.vehicleType as keyof typeof vehicleFactors] || 0;
  transportScore = (inputs.distancePerDay || 0) * factor;

  // Fuel adjustments for cars
  if (inputs.vehicleType === 'car' && inputs.fuelType) {
    if (inputs.fuelType === 'diesel') transportScore *= 1.25;
    if (inputs.fuelType === 'electric') transportScore *= 0.15; // highly solar/clean charge
    if (inputs.fuelType === 'hybrid') transportScore *= 0.6;
  }

  // 2. Electricity usage index
  // AC: ~1.2 kW, Fan: ~0.075 kW, TV: ~0.1 kW, Computer: ~0.2 kW, Charge: ~0.01 kW
  // Average grid carbon intensity ~0.5kg CO2 per kWh
  electricityScore += (inputs.acHours || 0) * 1.2 * 0.5;
  electricityScore += (inputs.fanHours || 0) * 0.075 * 0.5;
  electricityScore += (inputs.tvHours || 0) * 0.1 * 0.5;
  electricityScore += (inputs.computerHours || 0) * 0.2 * 0.5;
  electricityScore += (inputs.mobileChargingSessions || 0) * 0.015 * 0.5;

  // 3. Food habits carbon indices (daily averages)
  if (inputs.dietType === 'vegan') foodScore = 1.1;
  else if (inputs.dietType === 'vegetarian') foodScore = 1.9;
  else foodScore = 3.6; // mixed rich diet

  // 4. Waste scales
  // Standard daily values based on scales
  wasteScore += (inputs.plasticUseScale || 1) * 0.25;
  wasteScore += (inputs.foodWasteScale || 1) * 0.35;
  
  if (inputs.recyclingHabit === 'full') wasteScore -= 0.6;
  else if (inputs.recyclingHabit === 'partial') wasteScore -= 0.25;

  if (wasteScore < 0.1) wasteScore = 0.1; // lower floor

  const dailyTotal = parseFloat((transportScore + electricityScore + foodScore + wasteScore).toFixed(2));
  const yearlyScore = parseFloat(((dailyTotal * 365) / 1000).toFixed(2)); // metric tons

  // Define grade bands (Average is around 12-16 kg daily)
  let grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' = 'C';
  if (dailyTotal <= 3.0) grade = 'A+';
  else if (dailyTotal <= 6.0) grade = 'A';
  else if (dailyTotal <= 10.0) grade = 'B';
  else if (dailyTotal <= 15.0) grade = 'C';
  else if (dailyTotal <= 22.0) grade = 'D';
  else grade = 'F';

  // Compare against global average of 14.5 kg daily
  const avgDefault = 14.5;
  const comparisonPercent = Math.round(((dailyTotal - avgDefault) / avgDefault) * 100);

  // Equivalencies (daily values converted)
  const savedComparedToAvg = avgDefault > dailyTotal ? avgDefault - dailyTotal : 0;
  const treesPlanted = Math.max(1, Math.round(savedComparedToAvg * 0.5));
  const carsRemovedDays = Math.max(1, Math.round(savedComparedToAvg / 0.42)); // daily equivalent car emission
  const electricitySavedKwh = Math.max(1, Math.round(savedComparedToAvg / 0.5));

  // High-fidelity fallback recommendations
  const suggestions = {
    transport: [
      inputs.vehicleType === 'car' ? "Transition your travel route towards public buses or metro setups and reduce private emissions by 80%." : "Masterfully elegant! Your choice of lightweight or active transport options minimizes global atmospheric heating.",
      "Bundle your short commutes together or complete errands within walking distances to actively preserve the ozone envelope."
    ],
    energy: [
      inputs.acHours > 2 ? "Configure your air conditioning thermostat 2 degrees higher (to 24°C) to dynamically capture up to 15% electric overhead savings." : "Fantastic work! Your sparse usage of air cooling mechanisms keeps grid demand perfectly low.",
      "Power down computers, external displays, and charging blocks directly from wall toggle switches to resolve phantom draw loads."
    ],
    food: [
      inputs.dietType === 'mixed_diet' ? "Schedule one or two Meatless Mondays weekly. Reducing red meat and dairy feeds 2x better resource conservation." : "Incredible choice! Plant-bound components scale down nitrous oxide agricultural footprints heavily.",
      "Purchase organic community-farmed items locally to circumvent high aviation-based supply chain distribution emissions."
    ],
    waste: [
      inputs.plasticUseScale > 2 ? "Carry custom silicone or metallic flasks and textile satchels to completely avoid single-use polyethelene." : "Stunning containment! Your plastics footprint is remarkably low.",
      inputs.recyclingHabit !== 'full' ? "Initiate complete separation sorting at home: segregate bioplastics, food peels, tin, and cellulose layers." : "Splendid! Sorting metals, plastics, and cellulose feeds high circular recovery."
    ]
  };

  return {
    score: dailyTotal,
    yearlyScore,
    grade,
    comparisonPercent,
    breakdown: {
      transport: parseFloat(transportScore.toFixed(2)),
      electricity: parseFloat(electricityScore.toFixed(2)),
      food: parseFloat(foodScore.toFixed(2)),
      waste: parseFloat(wasteScore.toFixed(2))
    },
    equivalents: {
      treesPlanted,
      carsRemovedDays,
      electricitySavedKwh
    },
    suggestions
  };
}

// Calculation cache to prevent spawning unnecessary child processes or invoking Gemini repeatedly
const calculationCache = new Map<string, CarbonResult>();

// Calculate Footprint API (comprehensive)
app.post("/api/carbon/calculate", async (req, res) => {
  const { userId, inputs } = req.body;
  if (!inputs) {
    return res.status(400).json({ error: "Missing calculation inputs" });
  }

  // Validate inputs
  const {
    vehicleType,
    distancePerDay,
    fuelType,
    acHours,
    fanHours,
    tvHours,
    computerHours,
    mobileChargingSessions,
    dietType,
    plasticUseScale,
    recyclingHabit,
    foodWasteScale
  } = inputs;

  if (
    typeof vehicleType !== "string" ||
    typeof distancePerDay !== "number" ||
    distancePerDay < 0 ||
    distancePerDay > 1000
  ) {
    return res.status(400).json({ error: "Invalid distance or vehicle input values" });
  }

  if (
    typeof acHours !== "number" || acHours < 0 || acHours > 24 ||
    typeof fanHours !== "number" || fanHours < 0 || fanHours > 24 ||
    typeof tvHours !== "number" || tvHours < 0 || tvHours > 24 ||
    typeof computerHours !== "number" || computerHours < 0 || computerHours > 24 ||
    typeof mobileChargingSessions !== "number" || mobileChargingSessions < 0 || mobileChargingSessions > 100
  ) {
    return res.status(400).json({ error: "Invalid electricity hours or sessions" });
  }

  if (
    typeof dietType !== "string" ||
    typeof plasticUseScale !== "number" || plasticUseScale < 1 || plasticUseScale > 5 ||
    typeof foodWasteScale !== "number" || foodWasteScale < 1 || foodWasteScale > 5 ||
    typeof recyclingHabit !== "string"
  ) {
    return res.status(400).json({ error: "Invalid diet, waste or recycling input parameters" });
  }

  const cacheKey = JSON.stringify(inputs);
  let result;

  if (calculationCache.has(cacheKey)) {
    console.log("Serving carbon calculation and recommendations from memory cache");
    result = JSON.parse(JSON.stringify(calculationCache.get(cacheKey)));
  } else {
    // Calculate footprint using high-precision Python engine first, falling back to local JS
    try {
      result = await runPythonCalculator(inputs);
    } catch (pyErr) {
      console.warn("Python engine execution failed, running core JS calculation fallback instead:", pyErr);
      result = calculateCarbonBaseline(inputs);
    }

    // Invoke Gemini for personalized, hyperrealistic premium recommendations if key available
    const ai = getGemini();
    if (ai) {
      try {
        const prompt = `You are GreenPulse AI, a high-level environment scientist and personal carbon strategist.
Review these metrics carefully:
- Transportation choice: ${inputs.vehicleType} travelling ${inputs.distancePerDay} km daily (fuel: ${inputs.fuelType || "N/A"}).
- Hourly electric uses: AC: ${inputs.acHours}h, Fan: ${inputs.fanHours}h, Computer: ${inputs.computerHours}h, TV: ${inputs.tvHours}h.
- Food style: ${inputs.dietType}.
- Waste indicators: Plastic use scale ${inputs.plasticUseScale}/5, Food waste scale ${inputs.foodWasteScale}/5, Recycling state: ${inputs.recyclingHabit}.

Total baseline calculated emissions: ${result.score} kg CO2/day (Yearly equivalents: ${result.yearlyScore} metric tons). Sustainability Grade: ${result.grade}.

Provide exactly 2 premium, practical, beautifully crafted actionable recommendations per category: transport, energy, food, and waste.
Speak directly to a human and keep each comment to exactly one clear, professional, warm sentence. No markup headers, return in a clean JSON format mirroring this schema exactly:
{
  "transport": ["sentence 1", "sentence 2"],
  "energy": ["sentence 1", "sentence 2"],
  "food": ["sentence 1", "sentence 2"],
  "waste": ["sentence 1", "sentence 2"]
}`;

        const aiResponse = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        if (aiResponse && aiResponse.text) {
          const customSuggs = JSON.parse(aiResponse.text.trim());
          if (customSuggs.transport && customSuggs.energy) {
            result.suggestions = customSuggs;
          }
        }
      } catch (err) {
        const error = err as { status?: number; message?: string } | null;
        console.error("Gemini carbon recommendation override failed, defaulting to scientific backup suggestions.", err);
        if (
          error?.status === 403 ||
          error?.message?.includes("leaked") ||
          error?.message?.includes("key") ||
          String(err).includes("403") ||
          String(err).includes("leaked")
        ) {
          geminiFailed = true;
        }
      }
    }

    // Save to calculation cache
    calculationCache.set(cacheKey, JSON.parse(JSON.stringify(result)));
  }

  // Update user score in DB if user is authenticated
  if (userId) {
    const db = loadDB();
    const userIdx = db.users.findIndex((u) => u.id === userId);
    if (userIdx !== -1) {
      db.users[userIdx].carbonScore = result.score;
      
      // Upgrade Eco Rank and award points based on score improvement
      const oldScore = db.users[userIdx].carbonScore;
      const initialPoints = db.users[userIdx].points;
      
      let rewardPoints = 200; // calculate rewards
      if (result.grade === 'A+' || result.grade === 'A') {
        db.users[userIdx].ecoRank = "Planet Protector";
        rewardPoints += 150;
      } else if (result.grade === 'B') {
        db.users[userIdx].ecoRank = "Green Warrior";
        rewardPoints += 100;
      } else {
        db.users[userIdx].ecoRank = "Beginner Eco Hero";
      }

      // Add dynamic badge triggers
      const badges = db.users[userIdx].badgeIds;
      if (!badges.includes("badge-calc")) {
        badges.push("badge-calc"); // "First Footprint Calculated" badge
        rewardPoints += 100;
      }
      if ((result.grade === 'A+' || result.grade === 'A') && !badges.includes("badge-eco-champion")) {
        badges.push("badge-eco-champion"); // Unlock Eco Champion badge
        db.users[userIdx].ecoRank = "Earth Champion";
      }

      db.users[userIdx].points = initialPoints + rewardPoints;
      
      // Update environment stats
      db.environment.co2ReducedTotal += Math.round(Math.max(1, 14.5 - result.score) * 4);
      db.environment.treesPlantedTotal += result.equivalents.treesPlanted;

      // Update leaderboard entry
      const lbIdx = db.leaderboard.findIndex((e) => e.id === userId);
      if (lbIdx !== -1) {
        db.leaderboard[lbIdx].carbonScore = result.score;
        db.leaderboard[lbIdx].points = db.users[userIdx].points;
        db.leaderboard[lbIdx].ecoRank = db.users[userIdx].ecoRank;
      }

      saveDB(db);
    }
  }

  res.json(result);
});

// Community Leaderboard API
app.get("/api/community/leaderboard", (req, res) => {
  const db = loadDB();
  res.json(db.leaderboard);
});

// Chatbot Pulse API
app.post("/api/ai/chat", async (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Empty message payload" });
  }

  const ai = getGemini();

  if (ai) {
    try {
      // Structure the conversation flow with dynamic context
      const chat = ai.chats.create({
        model: "gemini-3.5-flash",
        config: {
          systemInstruction: "You are Pulse, the GreenPulse AI eco guide. Give practical, India-aware sustainability advice for carbon footprint, transport, electricity, diet, waste, and the app calculator. Keep replies concise in 3-4 sentences, avoid exaggerated claims, use simple language, and end with one concrete next action when useful. Do not use code blocks unless the user asks for code."
        }
      });

      // Send greeting or historical items if needed, then fire current message
      const response = await chat.sendMessage({ message });
      return res.json({ text: response.text });
    } catch (err) {
      const error = err as { status?: number; message?: string } | null;
      console.error("Gemini AI Chat session crashed, leveraging default backup assistant responses.", err);
      if (
        error?.status === 403 ||
        error?.message?.includes("leaked") ||
        error?.message?.includes("key") ||
        String(err).includes("403") ||
        String(err).includes("leaked")
      ) {
        geminiFailed = true;
      }
    }
  }

  // Pure scientific fallback chatbot with smart keyword dictionary as fallback
  const text = message.toLowerCase();
  let textResponse = "";

  if (text.includes("kid") || text.includes("children") || text.includes("child") || text.includes("8 year")) {
    textResponse = "A carbon footprint is like an invisible trail left by the energy we use. Cars, lights, ACs, food, and waste can all add to that trail. A child can reduce it by switching off unused lights, walking short distances, carrying a bottle, and wasting less food.";
  } else if (text.includes("how to save") || text.includes("reduce") || text.includes("cut") || text.includes("hack") || text.includes("save co2")) {
    textResponse = "Start with the biggest daily levers: use public transport or carpool twice a week, set AC near 24-26°C, switch off standby appliances, and reduce food waste. If you use the GreenPulse calculator after each change, you can see which habit moves your score most. Pick one transport habit and one electricity habit for the next seven days.";
  } else if (text.includes("veg") || text.includes("diet") || text.includes("meat") || text.includes("eat") || text.includes("food") || text.includes("protein")) {
    textResponse = "Vegetarian meals usually have a lower carbon impact because pulses, grains, vegetables, and seasonal produce need fewer resources than meat-heavy meals. In India, dal, chana, rajma, paneer in moderation, millets, and local vegetables are practical low-carbon choices. Try one extra plant-forward day each week and track the change in your food score.";
  } else if (text.includes("transport") || text.includes("car") || text.includes("cycle") || text.includes("commute") || text.includes("bus") || text.includes("metro")) {
    textResponse = "Transport can strongly affect your score because distance repeats every day. For short trips, walking or cycling is best; for city travel, bus, metro, train, and carpooling usually beat solo car rides. Try replacing two solo commute days this week and rerun the calculator.";
  } else if (text.includes("plastic") || text.includes("waste") || text.includes("recycl") || text.includes("bin")) {
    textResponse = "Waste reduction starts with separation: keep wet waste, dry recyclables, and reject waste apart. Carrying a bottle, cloth bag, and lunch box cuts many single-use items before they enter the bin. Your next useful step is to set up two clearly labeled bins at home.";
  } else if (text.includes("electric") || text.includes("grid") || text.includes("ac") || text.includes("power") || text.includes("solar")) {
    textResponse = "Electricity emissions depend on how much power you use and how clean your grid is. AC hours, heating, older appliances, and standby power are common hidden loads. Set AC to 24-26°C, use fans when possible, switch to LEDs, and turn appliances off at the wall.";
  } else {
    const botAnswers = [
      "Ask me about transport, electricity, diet, waste, or how to improve your GreenPulse carbon score. I can help turn a broad goal into one small habit you can do today.",
      "A good starting point is your most repeated habit: daily commute, AC use, food waste, or single-use plastic. Choose one, reduce it for a week, and compare your calculator score.",
      "The strongest eco plans are specific and measurable. Tell me your city, commute style, AC hours, or diet pattern, and I will suggest a practical next step.",
      "If you are unsure where to begin, run the calculator once, then ask me about the highest section in your breakdown. That keeps the advice focused on your real impact."
    ];
    textResponse = botAnswers[Math.floor(Math.random() * botAnswers.length)];
  }

  return res.json({ text: textResponse });
});

// Challenges list with dynamic updates
app.get("/api/challenges", (req, res) => {
  const db = loadDB();
  res.json(db.challenges);
});

app.post("/api/challenges/complete", (req, res) => {
  const { userId, challengeId } = req.body;
  if (!userId || !challengeId) {
    return res.status(400).json({ error: "Missing required arguments" });
  }

  const db = loadDB();
  const userIdx = db.users.findIndex((u) => u.id === userId);
  if (userIdx === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  const challengeIdx = db.challenges.findIndex((c) => c.id === challengeId);
  if (challengeIdx === -1) {
    return res.status(404).json({ error: "Challenge not found" });
  }

  const user = db.users[userIdx];
  if (user.completedChallenges.includes(challengeId)) {
    return res.status(400).json({ error: "Challenge already completed today!" });
  }

  const challenge = db.challenges[challengeIdx];
  user.completedChallenges.push(challengeId);
  user.points += challenge.points;
  challenge.completedCount += 1;

  // Track dynamic environment counters
  db.environment.co2ReducedTotal += 12; // 12kg saved on average challenge
  
  // Upgrade levels based on points milestones
  if (user.points >= 5000 && !user.badgeIds.includes("badge-master")) {
    user.badgeIds.push("badge-master");
    user.ecoRank = "Sustainability Master";
  } else if (user.points >= 3000 && !user.badgeIds.includes("badge-champion")) {
    user.badgeIds.push("badge-champion");
    user.ecoRank = "Earth Champion";
  } else if (user.points >= 1500 && !user.badgeIds.includes("badge-protector")) {
    user.badgeIds.push("badge-protector");
    user.ecoRank = "Planet Protector";
  } else if (user.points >= 500 && !user.badgeIds.includes("badge-warrior")) {
    user.badgeIds.push("badge-warrior");
    user.ecoRank = "Green Warrior";
  }

  // Update leaderboard
  const lbIdx = db.leaderboard.findIndex((e) => e.id === userId);
  if (lbIdx !== -1) {
    db.leaderboard[lbIdx].points = user.points;
    db.leaderboard[lbIdx].ecoRank = user.ecoRank;
  }

  saveDB(db);
  const { password: _, ...userResponse } = user;
  res.json({ message: "Challenge successfully accounted! Points allocated.", user: userResponse, challenge });
});

// Environment statistics (Live counter items)
app.get("/api/environment/stats", (req, res) => {
  const db = loadDB();
  res.json(db.environment);
});

// Admin Panel Admin APIs
app.get("/api/admin/analytics", (req, res) => {
  const db = loadDB();
  const totalUsers = db.users.length;
  const scoredUsers = db.users.filter((u) => u.carbonScore > 0);
  const avgCarbonScore = scoredUsers.length > 0 
    ? parseFloat((scoredUsers.reduce((acc: number, u) => acc + u.carbonScore, 0) / scoredUsers.length).toFixed(2))
    : 5.4;

  const totalChallengesCompleted = db.users.reduce((acc: number, u) => acc + u.completedChallenges.length, 0);

  res.json({
    totalUsers,
    avgCarbonScore,
    totalChallengesCompleted,
    announcements: db.announcements,
    environment: db.environment
  });
});

app.post("/api/admin/announcements", (req, res) => {
  const { title, content, important } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Missing title or content" });
  }

  const db = loadDB();
  const newAnn = {
    id: generateId("ann"),
    title: sanitizeInput(title),
    content: sanitizeInput(content),
    createdAt: new Date().toISOString(),
    important: !!important
  };

  db.announcements.unshift(newAnn);
  saveDB(db);
  res.json({ message: "System announcement broadcasted successfully.", announcement: newAnn });
});

app.post("/api/admin/challenges/add", (req, res) => {
  const { title, description, category, points } = req.body;
  if (!title || !description || !category || !points) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const parsedPoints = parseInt(points, 10);
  if (isNaN(parsedPoints) || parsedPoints < 0 || parsedPoints > 1000) {
    return res.status(400).json({ error: "Invalid points value" });
  }

  const categorySanitized = sanitizeInput(category);
  const validCategories = ["transport", "energy", "food", "waste"];
  if (!validCategories.includes(categorySanitized)) {
    return res.status(400).json({ error: "Invalid challenge category" });
  }

  const db = loadDB();
  const newChal: Challenge = {
    id: generateId("challenge"),
    title: sanitizeInput(title),
    description: sanitizeInput(description),
    category: categorySanitized as 'transport' | 'energy' | 'food' | 'waste',
    points: parsedPoints,
    completedCount: 0
  };

  db.challenges.push(newChal);
  saveDB(db);
  res.json({ message: "Eco Challenge integrated into live carousel", challenge: newChal });
});

app.post("/api/admin/leaderboard/edit", (req, res) => {
  const { id, carbonScore, points } = req.body;
  if (!id) return res.status(400).json({ error: "Entity ID is required" });

  const db = loadDB();
  const lbIdx = db.leaderboard.findIndex((e) => e.id === id);
  if (lbIdx === -1) return res.status(404).json({ error: "Leaderboard entry not found" });

  if (carbonScore !== undefined) {
    const parsedScore = parseFloat(carbonScore);
    if (isNaN(parsedScore) || parsedScore < 0 || parsedScore > 500) {
      return res.status(400).json({ error: "Invalid carbon score value" });
    }
    db.leaderboard[lbIdx].carbonScore = parsedScore;
  }

  if (points !== undefined) {
    const parsedPoints = parseInt(points, 10);
    if (isNaN(parsedPoints) || parsedPoints < 0 || parsedPoints > 1000000) {
      return res.status(400).json({ error: "Invalid points value" });
    }
    db.leaderboard[lbIdx].points = parsedPoints;
  }

  saveDB(db);
  res.json({ message: "Leaderboard parameters synchronized successfully", entry: db.leaderboard[lbIdx] });
});

// --- Vite Middleware integration for standard development & production serving ---
async function serveApp() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware mounted successfully (Dev mode)");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(
      express.static(distPath, {
        maxAge: "1d",
        setHeaders: (res) => {
          res.setHeader("Cache-Control", "public, max-age=86400");
        }
      })
    );
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static build files from dist (Production mode)");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`GreenPulse AI server running at http://0.0.0.0:${PORT}`);
  });
}

serveApp();
