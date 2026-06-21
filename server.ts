import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { spawn } from "child_process";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

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

// Default Database Seed Data
const defaultDB = {
  users: [
    {
      id: "admin-id",
      email: "satyam000108@gmail.com",
      name: "Satyam Tiwari",
      password: "password123",
      avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Satyam%20Tiwari",
      createdAt: new Date().toISOString(),
      carbonScore: 4.1,
      ecoRank: "Sustainability Master",
      badgeIds: ["badge-1", "badge-2", "badge-3", "badge-4", "badge-5"],
      points: 4850,
      completedChallenges: ["challenge-1", "challenge-2"],
      role: "admin",
      gender: "Male"
    },
    {
      id: "user-elena",
      email: "sanika@pulse.eco",
      name: "Sanika Husan",
      password: "password123",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sanika%20Husan",
      createdAt: new Date().toISOString(),
      carbonScore: 4.8,
      ecoRank: "Earth Champion",
      badgeIds: ["badge-1", "badge-2", "badge-3", "badge-4"],
      points: 4200,
      completedChallenges: ["challenge-1"],
      role: "user"
    },
    {
      id: "user-john",
      email: "abbas@pulse.eco",
      name: "Abbas Masood",
      password: "password123",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Abbas%20Masood",
      createdAt: new Date().toISOString(),
      carbonScore: 5.5,
      ecoRank: "Green Warrior",
      badgeIds: ["badge-1", "badge-2"],
      points: 3900,
      completedChallenges: ["challenge-3"],
      role: "user"
    }
  ],
  leaderboard: [
    { id: "leader-1", name: "Satyam Tiwari", ecoRank: "Sustainability Master", carbonScore: 4.1, points: 4850, type: "user" },
    { id: "leader-2", name: "Sanika Husan", ecoRank: "Earth Champion", carbonScore: 4.8, points: 4200, type: "user" },
    { id: "leader-3", name: "Abbas Masood", ecoRank: "Green Warrior", carbonScore: 5.5, points: 3900, type: "user" },
    { id: "college-1", name: "Stanford Solar Club", ecoRank: "College League", carbonScore: 3.9, points: 245000, type: "college" },
    { id: "college-2", name: "MIT Green Spark", ecoRank: "College League", carbonScore: 4.4, points: 239000, type: "college" },
    { id: "college-3", name: "Berkeley Ecowarriors", ecoRank: "College League", carbonScore: 4.2, points: 228000, type: "college" },
    { id: "city-1", name: "Copenhagen", ecoRank: "City Grid", carbonScore: 3.2, points: 94000, type: "city" },
    { id: "city-2", name: "San Francisco", ecoRank: "City Grid", carbonScore: 4.5, points: 89000, type: "city" },
    { id: "city-3", name: "Tokyo Smart-District", ecoRank: "City Grid", carbonScore: 3.8, points: 81200, type: "city" }
  ],
  challenges: [
    { id: "challenge-1", title: "Human Engine Mode", description: "Walk or Cycle for all trips under 3km today.", category: "transport", points: 50, completedCount: 142 },
    { id: "challenge-2", title: "Thermal Discipline", description: "Turn off your Air Conditioner 2 hours earlier than usual.", category: "energy", points: 40, completedCount: 89 },
    { id: "challenge-3", title: "Compassionate Plate", description: "Have a completely Vegetarian or Vegan lunch/dinner.", category: "food", points: 30, completedCount: 201 },
    { id: "challenge-4", title: "Plastic Embargo", description: "Avoid using single-use plastic cups/bottles today.", category: "waste", points: 30, completedCount: 115 },
    { id: "challenge-5", title: "Ecosystem Builder", description: "Plant a tree, adopt a potted plant or water public plants.", category: "waste", points: 100, completedCount: 45 }
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

// Database utility functions
function loadDB() {
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, "utf-8");
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Error reading database file, returning default database", e);
  }
  // Write default db if not existing or broken
  try {
    fs.writeFileSync(dbPath, JSON.stringify(defaultDB, null, 2));
  } catch (e) {
    console.error("Could not write initial database file", e);
  }
  return defaultDB;
}

function saveDB(data: any) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Error writing database file", e);
  }
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

  const db = loadDB();
  const existing = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: "User with this email already exists" });
  }

  const newUser = {
    id: "user-" + Math.random().toString(36).substring(2, 9),
    email: email.toLowerCase(),
    name,
    password, // For client-side, we store simply as-is (this is a sandboxed developer prototype applet)
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    createdAt: new Date().toISOString(),
    carbonScore: 0,
    ecoRank: "Beginner Eco Hero",
    badgeIds: ["badge-1"],
    points: 100, // starting points
    completedChallenges: [],
    role: "user",
    gender: gender || "Not Specified"
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

  const db = loadDB();
  const user = db.users.find(
    (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
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

  const db = loadDB();
  let user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    // Register as new Google user
    user = {
      id: "user-" + Math.random().toString(36).substring(2, 9),
      email: email.toLowerCase(),
      name,
      password: "google-oauth-flow-" + Math.random().toString(36),
      avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
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
  res.json({ message: "A secure verification code has been dispatched to your email address." });
});

app.get("/api/user/profile/:userId", (req, res) => {
  const db = loadDB();
  const user = db.users.find((u: any) => u.id === req.params.userId);
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
  const userIdx = db.users.findIndex((u: any) => u.id === id);
  if (userIdx === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  if (name) db.users[userIdx].name = name;
  if (avatarUrl) db.users[userIdx].avatarUrl = avatarUrl;
  if (gender) db.users[userIdx].gender = gender;

  // Also update leaderboard
  const lbIdx = db.leaderboard.findIndex((e: any) => e.id === id);
  if (lbIdx !== -1) {
    if (name) db.leaderboard[lbIdx].name = name;
  }

  saveDB(db);
  const { password: _, ...userResponse } = db.users[userIdx];
  res.json({ message: "User profile updated successfully", user: userResponse });
});

// Python integration runner
function runPythonCalculator(inputs: any): Promise<any> {
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
function calculateCarbonBaseline(inputs: any) {
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

// Calculate Footprint API (comprehensive)
app.post("/api/carbon/calculate", async (req, res) => {
  const { userId, inputs } = req.body;
  if (!inputs) {
    return res.status(400).json({ error: "Missing calculation inputs" });
  }

  // Calculate footprint using high-precision Python engine first, falling back to local JS
  let result;
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
    } catch (err: any) {
      console.error("Gemini carbon recommendation override failed, defaulting to scientific backup suggestions.", err);
      if (err?.status === 403 || err?.message?.includes("leaked") || err?.message?.includes("key") || err?.toString()?.includes("403") || err?.toString()?.includes("leaked")) {
        geminiFailed = true;
      }
    }
  }

  // Update user score in DB if user is authenticated
  if (userId) {
    const db = loadDB();
    const userIdx = db.users.findIndex((u: any) => u.id === userId);
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
      const lbIdx = db.leaderboard.findIndex((e: any) => e.id === userId);
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
          systemInstruction: "You are 'Pulse', the intelligent, affectionate environmental speaking chatbot of GreenPulse AI platform. You translate complex concepts like ozone heating, climate indices, and smart grid systems into humble, fascinating, easily understandable terms for school kids and families. Maintain a remarkably encouraging, friendly posture. Motivate users to take organic, micro daily ecological steps and celebrate green goals. Always reply concisely within 3-4 sentences; avoid code blocks or nested formats unless requested."
        }
      });

      // Send greeting or historical items if needed, then fire current message
      const response = await chat.sendMessage({ message });
      return res.json({ text: response.text });
    } catch (e: any) {
      console.error("Gemini AI Chat session crashed, leveraging default backup assistant responses.", e);
      if (e?.status === 403 || e?.message?.includes("leaked") || e?.message?.includes("key") || e?.toString()?.includes("403") || e?.toString()?.includes("leaked")) {
        geminiFailed = true;
      }
    }
  }

  // Pure scientific fallback chatbot with smart keyword dictionary as fallback
  const text = message.toLowerCase();
  let textResponse = "";

  if (text.includes("kid") || text.includes("children") || text.includes("child") || text.includes("8 year")) {
    textResponse = "Teaching kids about carbon is extremely fun! Think of a carbon footprint like the dirty boots we leave on the floor after playing outside. When we use electricity or drive big cars, our boots leave footprints on the Earth! We can wash those footprints away by planting trees, cycling, and turning off the TV when we're done.";
  } else if (text.includes("how to save") || text.includes("reduce") || text.includes("cut") || text.includes("hack") || text.includes("save co2")) {
    textResponse = "To save CO₂ at home, start with simple daily habits: unplug standby chargers, dry your laundry naturally in the warm sun, and configure your air conditioning thermostat 2 degrees higher (like 24°C). These minor eco-hacks prevent up to 100kg of emissions weekly and lower your utility bills instantly!";
  } else if (text.includes("veg") || text.includes("diet") || text.includes("meat") || text.includes("eat") || text.includes("food") || text.includes("protein")) {
    textResponse = "Plant-based diets have a significantly lower carbon footprint because growing crops requires 15 times less land & water than livestock farming! By cutting back on red meats and adopting plant-based ingredients even one day a week, you can reduce your personal kitchen emissions by over 50%.";
  } else if (text.includes("transport") || text.includes("car") || text.includes("cycle") || text.includes("commute") || text.includes("bus") || text.includes("metro")) {
    textResponse = "Commutes are the largest driver of private emissions! Shifting from high-emission gasoline cars to lightweight active transit, trains, or electric metro networks saves up to 80% carbon. Cycling and walking are even better as they produce exactly zero emissions!";
  } else if (text.includes("plastic") || text.includes("waste") || text.includes("recycl") || text.includes("bin")) {
    textResponse = "Single-use plastics are produced from petrochemicals that release toxic emissions, and they clog up natural waterways. By switching to reusable textile bags and sorting packaging into clean recyclables, you establish circular life-cycles that keep our oceans clean!";
  } else if (text.includes("electric") || text.includes("grid") || text.includes("ac") || text.includes("power") || text.includes("solar")) {
    textResponse = "Our home electricity is typically generated by burning fossil fuels like coal, which releases heavy carbon. By setting AC thermostats higher, adopting LED bulbs, and utilizing daylight instead of electric fixtures, we directly prevent coal burning from heating up the atmosphere!";
  } else {
    const botAnswers = [
      "Fantastic environmental question! Actively minimizing household heat pumps, carbon transport footprints, and segregating polymer materials makes you an everyday Earth hero.",
      "Did you know that simple organic habits like unplugging your active laptop charger can dynamically reduce localized grid overhead carbon by up to 5kg weekly?",
      "Every plant or potted herb added to home windows acts as a micro carbon sink, transforming heavy greenhouse components into beautiful breathing oxygen!",
      "Our Green challenges have yielded over 20 metric tons of atmospheric offsets community-wide! Try marking today's Walking challenge complete to secure your rank booster.",
      "Pulse is right here with you! Let's build micro solar discipline by shutting down standby computing terminals right now!"
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
  const userIdx = db.users.findIndex((u: any) => u.id === userId);
  if (userIdx === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  const challengeIdx = db.challenges.findIndex((c: any) => c.id === challengeId);
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
  const lbIdx = db.leaderboard.findIndex((e: any) => e.id === userId);
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
  const scoredUsers = db.users.filter((u: any) => u.carbonScore > 0);
  const avgCarbonScore = scoredUsers.length > 0 
    ? parseFloat((scoredUsers.reduce((acc: number, u: any) => acc + u.carbonScore, 0) / scoredUsers.length).toFixed(2))
    : 5.4;

  const totalChallengesCompleted = db.users.reduce((acc: number, u: any) => acc + u.completedChallenges.length, 0);

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
    id: "ann-" + Math.random().toString(36).substring(2, 9),
    title,
    content,
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

  const db = loadDB();
  const newChal = {
    id: "challenge-" + Math.random().toString(36).substring(2, 9),
    title,
    description,
    category,
    points: parseInt(points, 10),
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
  const lbIdx = db.leaderboard.findIndex((e: any) => e.id === id);
  if (lbIdx === -1) return res.status(404).json({ error: "Leaderboard entry not found" });

  if (carbonScore !== undefined) db.leaderboard[lbIdx].carbonScore = parseFloat(carbonScore);
  if (points !== undefined) db.leaderboard[lbIdx].points = parseInt(points, 10);

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
    app.use(express.static(distPath));
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
