import { useState, useEffect } from "react";
import { 
  Leaf, Sun, Moon, ShieldCheck, Trophy, Sparkles, Navigation, 
  HelpCircle, User as UserIcon, LogOut, Trees, AlertTriangle, 
  Bell, ChevronDown, CheckCircle, ArrowRight, ArrowLeft, Utensils, Trash2, Car, Zap, Heart 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import AnimatedEarth from "./components/AnimatedEarth";
import WeatherWidget from "./components/WeatherWidget";
import PulseAssistant from "./components/PulseAssistant";
import Leaderboard from "./components/Leaderboard";
import ChallengesList from "./components/ChallengesList";
import CarbonCalculator from "./components/CarbonCalculator";
import Dashboard from "./components/Dashboard";
import AdminPanel from "./components/AdminPanel";
import CarbonTwin from "./components/CarbonTwin";
import RewardsStore from "./components/RewardsStore";
import BadgesGallery from "./components/BadgesGallery";
import ActionPlanner from "./components/ActionPlanner";
import GreenPulseLogo from "./components/GreenPulseLogo";
import { User, CarbonResult } from "./types";

export default function App() {
  const theme = 'dark';
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };
  
  // Navigation states
  const [activeTab, setActiveTab] = useState<'landing' | 'calculate' | 'dashboard' | 'leaderboard' | 'challenges' | 'twin' | 'rewards' | 'admin' | 'badges' | 'planner'>('landing');
  const [editingName, setEditingName] = useState<boolean>(false);
  const [newNameVal, setNewNameVal] = useState<string>("");
  
  // Scoring parameters
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [activeResult, setActiveResult] = useState<CarbonResult | null>(null);

  // Footer Likes parameters
  const [likes, setLikes] = useState<number>(0);
  const [hasLiked, setHasLiked] = useState<boolean>(false);

  // Community dynamic statistics
  const [plantationCounter, setPlantationCounter] = useState({
    treesPlantedTotal: 1845,
    co2ReducedTotal: 24320,
    usersActiveCount: 312
  });

  const generateSilentGuest = async () => {
    const names = [
      "Solar Spark", "Emerald Pioneer", "Vibrant Meadow", "Eco Ranger", 
      "Carbon Zero", "Luna Flora", "Forest Guardian", "Terra Ranger",
      "Green Spark", "Eco Maverick", "Clean Wave", "Atmosphere Hero"
    ];
    const chosenName = names[Math.floor(Math.random() * names.length)] + " #" + Math.floor(100 + Math.random() * 900);
    const mockEmail = `guest-${Math.random().toString(36).substring(2, 9)}@pulse.eco`;
    
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: chosenName,
          email: mockEmail,
          password: "password123",
          gender: "Not Specified"
        })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        localStorage.setItem("pulse-eco-session", JSON.stringify(data.user));
      }
    } catch (e) {
      console.error("Silent signup failed, falling back to local simulation", e);
      // Fallback
      const localGuest: User = {
        id: "guest-fallback",
        email: mockEmail,
        name: chosenName,
        createdAt: new Date().toISOString(),
        carbonScore: 0,
        ecoRank: "Beginner Eco Hero",
        badgeIds: ["badge-1"],
        points: 100,
        completedChallenges: [],
        role: "user"
      };
      setCurrentUser(localGuest);
      localStorage.setItem("pulse-eco-session", JSON.stringify(localGuest));
    }
  };

  // Load user session from local storage & fetch environmental telemetry on mount
  useEffect(() => {
    const cached = localStorage.getItem("pulse-eco-session");
    if (cached) {
      try {
        const u = JSON.parse(cached);
        setCurrentUser(u);
        if (u.carbonScore > 0) {
          setCurrentScore(u.carbonScore);
          // Set up baseline result for user if they already calculated previously
          triggerDefaultCalculations(u.carbonScore, false);
        }
      } catch (e) {
        console.error("Session verification failed", e);
        generateSilentGuest();
      }
    } else {
      generateSilentGuest();
    }

    // Refresh telemetry
    fetchEnvironmentStats();

    // Fetch footer likes
    fetch("/api/footer/likes")
      .then(res => res.json())
      .then(data => {
        if (typeof data.likes === "number") {
          setLikes(data.likes);
        }
      })
      .catch(err => console.error("Could not fetch footer likes", err));

    const liked = localStorage.getItem("satyam-footer-liked") === "true";
    setHasLiked(liked);
  }, []);

  const fetchEnvironmentStats = async () => {
    try {
      const res = await fetch("/api/environment/stats");
      if (res.ok) {
        const data = await res.json();
        setPlantationCounter(data);
      }
    } catch (e) {
      // Keep static preseed values
    }
  };

  const handleLikeSatyam = async () => {
    if (hasLiked) {
      showToast("You've already appreciated Satyam's precision crafting!", "info");
      return;
    }
    try {
      const res = await fetch("/api/footer/like", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setLikes(data.likes);
        setHasLiked(true);
        localStorage.setItem("satyam-footer-liked", "true");
        showToast("Thank you for liking! Satyam appreciates your support! ❤️", "success");
      }
    } catch (err) {
      console.error("Could not record footer like", err);
      // Fallback
      setLikes(prev => prev + 1);
      setHasLiked(true);
      localStorage.setItem("satyam-footer-liked", "true");
      showToast("Thank you for liking! Satyam appreciates your support! ❤️", "success");
    }
  };

  const triggerDefaultCalculations = (score: number, redirectToDashboard = true) => {
    // Generate a quick baseline result for display purposes on startup
    const equivalentsArray = {
      treesPlanted: Math.max(1, Math.round((14.5 - score) * 0.5)),
      carsRemovedDays: Math.max(1, Math.round((14.5 - score) / 0.42)),
      electricitySavedKwh: Math.max(1, Math.round((14.5 - score) / 0.5))
    };
    
    let grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' = 'C';
    if (score <= 3.0) grade = 'A+';
    else if (score <= 6.0) grade = 'A';
    else if (score <= 10.0) grade = 'B';
    else if (score <= 15.0) grade = 'C';
    else if (score <= 22.0) grade = 'D';
    else grade = 'F';

    setActiveResult({
      score,
      yearlyScore: parseFloat(((score * 365) / 1000).toFixed(2)),
      grade,
      comparisonPercent: Math.round(((score - 14.5) / 14.5) * 100),
      breakdown: {
        transport: parseFloat((score * 0.35).toFixed(2)),
        electricity: parseFloat((score * 0.25).toFixed(2)),
        food: parseFloat((score * 0.25).toFixed(2)),
        waste: parseFloat((score * 0.15).toFixed(2))
      },
      equivalents: equivalentsArray,
      suggestions: {
        transport: ["Transition commute towards lightweight green buses or circular metro setups.", "Unplug and bundle errands to cut transport runs by 25%."],
        energy: ["Configure domestic thermostats to 24°C to save up to 15% grid load.", "De-energize inactive monitors, PCs, and laptops to resolve phantom loads."],
        food: ["Integrate organic crops, cereals, and dairy substitutes twice weekly.", "Buy locally from community cultivators to avoid long distribution emissions."],
        waste: ["Adopt steel fluid containers and bypass one-use plastic entirely.", "Sort cellulose overlays, paper bags, and polymers out from standard waste streams."]
      }
    });
    if (redirectToDashboard) {
      setActiveTab('dashboard');
    }
  };

  const saveUpdatedName = async () => {
    if (!currentUser || !newNameVal.trim()) {
      setEditingName(false);
      return;
    }
    try {
      const res = await fetch("/api/user/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentUser.id,
          name: newNameVal.trim()
        })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        localStorage.setItem("pulse-eco-session", JSON.stringify(data.user));
      }
    } catch (e) {
      console.error("Failed to update profile name on server", e);
      const updated = { ...currentUser, name: newNameVal.trim() };
      setCurrentUser(updated);
      localStorage.setItem("pulse-eco-session", JSON.stringify(updated));
    }
    setEditingName(false);
  };

  const handleResetIdentity = () => {
    localStorage.removeItem("pulse-eco-session");
    setCurrentScore(0);
    setActiveResult(null);
    setCurrentUser(null);
    setActiveTab('landing');
    generateSilentGuest();
  };

  const handleUserUpdate = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem("pulse-eco-session", JSON.stringify(updatedUser));
  };

  const handleCalculationFinished = (res: CarbonResult, finalScore: number) => {
    setCurrentScore(finalScore);
    setActiveResult(res);
    
    // Optimistically update locally cached session too
    if (currentUser) {
      const updated = { ...currentUser, carbonScore: finalScore };
      setCurrentUser(updated);
      localStorage.setItem("pulse-eco-session", JSON.stringify(updated));
    }

    setActiveTab('dashboard');
    fetchEnvironmentStats();
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans ${theme === 'dark' ? "bg-[#090b14] text-white" : "bg-slate-50 text-slate-950"}`}>
      
      {/* Visual background textures: Floating particles and subtle grids */}
      <div className="absolute inset-0 bg-grid-white dark:bg-grid-white opacity-[0.4] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
      
      {/* Floating Leaves animation background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Leaf className="absolute text-emerald-500/10 h-7 w-7 animate-float-leaf left-10 top-20 opacity-40" />
        <Leaf className="absolute text-emerald-500/15 h-5 w-5 animate-float-leaf right-24 top-60 opacity-60" style={{ animationDelay: "2s" }} />
        <Leaf className="absolute text-emerald-500/8 h-6 w-6 animate-float-leaf left-1/4 bottom-32 opacity-30" style={{ animationDelay: "4s" }} />
      </div>

      {/* Broadcast Announcement Bar */}
      <div className="bg-emerald-900/35 border-b border-emerald-500/15 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center text-xs text-slate-800 dark:text-slate-100">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
            <Bell className="h-3.5 w-3.5 animate-bounce" />
            <span><b>Eco-Broadcast:</b> Complete today's Thermal Discipline challenge to boost your XP!</span>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
              CO₂ Conserved globally: <b className="text-emerald-500 font-bold">{(plantationCounter.co2ReducedTotal / 1000).toFixed(1)} Metric Tons</b>
            </span>
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Main Glassmorphic Header */}
      <header className="max-w-7xl mx-auto px-4 py-4">
        <div className="glass-card dark:bg-slate-900/40 p-4 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-4 border border-slate-500/15">
          
          {/* Logo Identity */}
          <div className="flex items-center gap-1 cursor-pointer" onClick={() => setActiveTab('landing')}>
            <GreenPulseLogo size="sm" />
          </div>

          {/* Quick Counter Analytics Panel */}
          <div className="hidden lg:flex gap-6 text-center border-l border-slate-500/20 pl-6">
            <div>
              <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {plantationCounter.treesPlantedTotal.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-500">Trees Planted</span>
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">
                {plantationCounter.usersActiveCount.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-500">Active Warriors</span>
            </div>
          </div>

          {/* Right Header: Dynamic Guest Identity Profile Controls */}
          <div className="flex items-center gap-3.5">
            {currentUser ? (
              <div className="flex items-center gap-3 bg-slate-950/10 dark:bg-slate-950/40 border border-slate-550/10 p-1.5 rounded-2xl">
                <img
                  src={currentUser.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=EcoChampion"}
                  alt={currentUser.name}
                  className="h-8 w-8 rounded-full border border-slate-500/25 bg-slate-800"
                />
                <div className="text-left pr-2">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                    {editingName ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={newNameVal}
                          aria-label="Edit Eco-name"
                          onChange={(e) => setNewNameVal(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') saveUpdatedName(); }}
                          className="bg-slate-900 text-white text-[11px] rounded px-1.5 py-0.5 border border-slate-700 w-24 focus:outline-none"
                          autoFocus
                        />
                        <button type="button" onClick={saveUpdatedName} className="text-[10px] text-emerald-400">Ok</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="truncate max-w-[100px]">{currentUser.name}</span>
                        <button
                          onClick={() => { setEditingName(true); setNewNameVal(currentUser.name); }}
                          className="text-[9px] text-slate-400 hover:text-emerald-400 cursor-pointer"
                          title="Edit Eco-name"
                        >
                          ✏️
                        </button>
                      </div>
                    )}
                    {currentUser.role === 'admin' && (
                      <span className="text-[9px] bg-rose-950/85 text-rose-400 px-1.5 py-0.2 rounded border border-rose-500/10 font-bold">Admin</span>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-500 block leading-none mt-0.5">
                    {currentUser.ecoRank} • <b>{currentUser.points} PTS</b>
                  </span>
                </div>
                
                <button
                  onClick={handleResetIdentity}
                  className="p-1 px-2 text-[10px] font-mono text-slate-500 hover:text-rose-450 hover:bg-rose-950/10 rounded border border-transparent hover:border-rose-500/20 cursor-pointer transition"
                  title="Generate a fresh anonymous identity"
                >
                  Reset ID
                </button>
              </div>
            ) : (
              <div className="h-8 w-16 bg-slate-800/40 rounded animate-pulse" />
            )}
          </div>
        </div>
      </header>

      {/* Main Container Workspaces */}
      <main className="max-w-7xl mx-auto px-4 py-4 pb-20">
        <AnimatePresence mode="wait">
          {activeTab === 'landing' ? (
            /* ================= LANDING tab Viewport ================= */
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="flex flex-col gap-12 mt-4 text-slate-900 dark:text-white"
            >
              {/* Hero Landing layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-950/5 dark:bg-slate-900/20 rounded-3xl border border-slate-500/15 p-8 lg:p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

                {/* Hero Left */}
                <div className="lg:col-span-7 flex flex-col gap-6 text-left relative z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 dark:bg-emerald-950/50 border border-emerald-500/30 rounded-full w-fit uppercase tracking-widest">
                    <Sparkles className="h-3 w-3" />
                    Premium Environmental Strategic Tracker
                  </span>
                  
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                    Track your impact. <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 dark:from-emerald-400 dark:to-cyan-400">
                      Improve the planet.
                    </span>
                  </h1>
                  
                  <p className="text-sm md:text-base text-slate-600 dark:text-slate-350 leading-relaxed max-w-xl font-sans font-light">
                    GreenPulse AI is designed with top-tier Apple, Google, and Tesla-level user experience simplicity. Uncover hidden carbon footprints of commutes, home power grids, and diets in under 30 seconds.
                  </p>

                  {/* Dynamic Personalization Banner */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/40 dark:bg-slate-955/55 p-3.5 rounded-2xl border border-slate-500/15 max-w-lg">
                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                      <span className="text-xl">🧑‍🚀</span>
                      <div className="text-left">
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono block">Warriors Alias</span>
                        <div className="text-xs text-slate-800 dark:text-slate-100 font-display font-medium">
                          Welcome back, <b className="text-emerald-600 dark:text-emerald-400">{currentUser?.name || "Eco Explorer"}</b>
                        </div>
                      </div>
                    </div>
                    <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
                    <div className="text-left w-full sm:w-auto">
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono block">League Standing</span>
                      <span className="text-xs text-slate-700 dark:text-slate-300 font-mono font-medium">{currentUser?.ecoRank || "Beginner Eco Hero"}</span>
                    </div>
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center mt-2">
                    <button
                      onClick={() => setActiveTab('calculate')}
                      className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 px-8 py-4 rounded-2xl text-sm font-display font-semibold text-white shadow-xl shadow-emerald-500/15 active:scale-95 transition-all text-center cursor-pointer flex items-center justify-center gap-2 group"
                    >
                      Calculate My Impact
                      <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('challenges')}
                      className="border border-slate-300 dark:border-slate-700/80 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-800/20 px-6 py-4 rounded-2xl text-sm font-display text-slate-750 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all text-center cursor-pointer font-medium"
                    >
                      Daily eco challenges
                    </button>
                  </div>
                </div>

                {/* Hero Right side: Stunning centered Earth */}
                <div className="lg:col-span-5 flex flex-col justify-center items-center relative">
                  <div className="absolute inset-0 bg-gradient-radial from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
                  <AnimatedEarth score={currentScore} />
                </div>
              </div>

              {/* Bento Grid micro summaries */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: "Commutes & Transport", desc: "Evaluate daily distances, vehicle types, public transit, walking, or electric battery offset ratios.", icon: Car, value: "Active Mobility Index", color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20" },
                  { title: "Household Electricity", desc: "Input cooling AC hours, screen layouts, computing setups, and regular mobile charging densities.", icon: Zap, value: "Volt Heat regulation", color: "text-yellow-600 bg-yellow-500/10 border-yellow-500/20" },
                  { title: "Nutritional Habits", desc: "Map emissions of mixed proteins, vegetarian choices, or zero-methane strictly vegan plates.", icon: Utensils, value: "Crop circularities", color: "text-rose-500 bg-rose-500/10 border-rose-500/20" },
                  { title: "Polymers & Packaging", desc: "Monitor plastics wrap frequencies, organic material separation, recycling bins, and circular sorting.", icon: Trash2, value: "Recovery efficiency", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/25" },
                ].map((card, idx) => (
                  <div key={idx} className="glass-card dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700/30 p-6 rounded-2xl flex flex-col justify-between hover:border-slate-400 dark:hover:border-slate-500/40 hover:-translate-y-1 transition-all duration-300">
                    <div className="flex flex-col gap-3">
                      <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${card.color} border border-transparent`}>
                        <card.icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-display font-medium text-slate-800 dark:text-slate-100">{card.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal font-sans font-light">{card.desc}</p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-4 block">{card.value}</span>
                  </div>
                ))}
              </div>

              {/* Global telemetry dashboard numbers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-slate-100/60 dark:bg-slate-950/55 rounded-3xl border border-slate-200 dark:border-slate-700/30 p-6 text-center shadow-md">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-500 block tracking-widest">ECO TREES GROWN</span>
                  <span className="text-2xl md:text-3xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight mt-1 inline-block">
                    {plantationCounter.treesPlantedTotal.toLocaleString()} 🌱
                  </span>
                </div>
                <div className="border-y sm:border-y-0 sm:border-x border-slate-350 dark:border-slate-800 py-4 sm:py-0">
                  <span className="text-[10px] uppercase font-mono text-slate-500 block tracking-widest">CO₂ ATMOSPHERE SAVED</span>
                  <span className="text-2xl md:text-3xl font-mono font-extrabold text-cyan-600 dark:text-cyan-400 tracking-tight mt-1 inline-block animate-pulse">
                    {plantationCounter.co2ReducedTotal.toLocaleString()} kg
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-500 block tracking-widest">GLOBAL GREEN HEROES</span>
                  <span className="text-2xl md:text-3xl font-mono font-extrabold text-slate-800 dark:text-white tracking-tight mt-1 inline-block">
                    {plantationCounter.usersActiveCount.toLocaleString()} 🧑‍🚀
                  </span>
                </div>
              </div>
            </motion.div>
          ) : (
            /* ================= SPLIT Interactive active workspace view ================= */
            <motion.div
              key="split"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
            >
              {/* Left Column: Earth Globe & Weather widget */}
              <section className="lg:col-span-4 flex flex-col gap-6 sticky top-20">
                <div className="glass-card dark:bg-slate-900/40 p-5 rounded-3xl border border-slate-200 dark:border-slate-500/15 shadow-xl flex flex-col justify-between">
                  <div>
                    <h2 className="text-sm font-display font-bold text-slate-800 dark:text-slate-100">
                      Live Planetary Indicator
                    </h2>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Visual feedback based on current daily micro carbon output in kilograms.
                    </p>
                  </div>

                  <AnimatedEarth score={currentScore} />
                </div>

                <WeatherWidget />

                <button
                  onClick={() => setActiveTab('landing')}
                  className="py-3 px-4 border border-slate-300 dark:border-slate-850 bg-white/50 dark:bg-slate-900/40 rounded-2xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800/40 flex items-center justify-center gap-1.5 transition text-slate-500 cursor-pointer shadow-sm active:scale-95"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Return to Landing Page
                </button>
              </section>

              {/* Right Workspaces active panel */}
              <section className="lg:col-span-8 flex flex-col gap-4">
                
                {/* Workspace Navigation tab list */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-100/40 dark:bg-slate-950/20 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-inner">
                  <nav className="flex flex-wrap gap-1.5 bg-slate-950/5 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-500/10 w-fit">
                    <button
                      onClick={() => setActiveTab('calculate')}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl cursor-pointer transition ${
                        activeTab === 'calculate' ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/10" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                      }`}
                    >
                      Calculator
                    </button>
                    <button
                      onClick={() => {
                        if (activeResult) {
                          setActiveTab('dashboard');
                        } else {
                          showToast("Configure the carbon footprint checklist first to unlock advanced dashboards!", "info");
                        }
                      }}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl cursor-pointer transition ${
                        activeTab === 'dashboard' ? "bg-emerald-600 text-white shadow-md" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                      } ${!activeResult ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      My Analytics
                    </button>
                    <button
                      onClick={() => setActiveTab('twin')}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl cursor-pointer transition ${
                        activeTab === 'twin' ? "bg-emerald-600 text-white shadow-md" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                      }`}
                    >
                      Carbon Twin
                    </button>
                    <button
                      onClick={() => setActiveTab('rewards')}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl cursor-pointer transition ${
                        activeTab === 'rewards' ? "bg-emerald-600 text-white shadow-md" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                      }`}
                    >
                      Eco Store
                    </button>
                    <button
                      onClick={() => setActiveTab('challenges')}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl cursor-pointer transition ${
                        activeTab === 'challenges' ? "bg-emerald-600 text-white shadow-md" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                      }`}
                    >
                      Daily Challenges
                    </button>
                    <button
                      onClick={() => setActiveTab('leaderboard')}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl cursor-pointer transition ${
                        activeTab === 'leaderboard' ? "bg-emerald-600 text-white shadow-md" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                      }`}
                    >
                      Leaderboard
                    </button>
                    <button
                      onClick={() => setActiveTab('planner')}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl cursor-pointer transition ${
                        activeTab === 'planner' ? "bg-emerald-600 text-white shadow-md" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                      }`}
                    >
                      Action Planner
                    </button>
                    <button
                      onClick={() => setActiveTab('badges')}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl cursor-pointer transition ${
                        activeTab === 'badges' ? "bg-emerald-600 text-white shadow-md" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                      }`}
                    >
                      Achievements
                    </button>
                    {currentUser?.role === 'admin' && (
                      <button
                        onClick={() => setActiveTab('admin')}
                        className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl cursor-pointer transition ${
                          activeTab === 'admin' ? "bg-rose-650 text-white shadow-md" : "text-rose-500 hover:text-rose-450"
                        }`}
                      >
                        Admin Panel
                      </button>
                    )}
                  </nav>

                  <button
                    onClick={() => setActiveTab('landing')}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer transition shadow-sm active:scale-95 shrink-0"
                    title="Move back to the home landing scene"
                  >
                    <ArrowLeft className="h-3 w-3 text-emerald-500" />
                    Back to Home
                  </button>
                </div>

                {/* Routing workspace window */}
                <div className="flex-1 min-h-[460px] relative">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                      {activeTab === 'calculate' && (
                        <CarbonCalculator 
                          user={currentUser} 
                          onCalculationCompleted={handleCalculationFinished} 
                          onBack={() => setActiveTab('landing')}
                          showToast={showToast}
                        />
                      )}
                      
                      {activeTab === 'dashboard' && activeResult && (
                        <Dashboard 
                          user={currentUser} 
                          result={activeResult} 
                          onReset={() => setActiveTab('calculate')} 
                          onUserUpdate={handleUserUpdate}
                          onBack={() => setActiveTab('landing')}
                          showToast={showToast}
                        />
                      )}

                      {activeTab === 'twin' && (
                        <CarbonTwin 
                          user={currentUser} 
                          baseScore={currentScore} 
                          onBack={() => setActiveTab('landing')}
                        />
                      )}

                      {activeTab === 'rewards' && (
                        <RewardsStore 
                          user={currentUser} 
                          onPointsRedeemed={handleUserUpdate} 
                          onBack={() => setActiveTab('landing')}
                          showToast={showToast}
                        />
                      )}

                      {activeTab === 'challenges' && (
                        <ChallengesList 
                          user={currentUser} 
                          onUserUpdate={handleUserUpdate} 
                          onBack={() => setActiveTab('landing')}
                          showToast={showToast}
                        />
                      )}

                      {activeTab === 'leaderboard' && (
                        <Leaderboard onBack={() => setActiveTab('landing')} />
                      )}

                      {activeTab === 'admin' && currentUser?.role === 'admin' && (
                        <AdminPanel onBack={() => setActiveTab('landing')} showToast={showToast} />
                      )}

                      {activeTab === 'badges' && (
                        <BadgesGallery 
                          user={currentUser} 
                          onBack={() => setActiveTab('landing')} 
                        />
                      )}

                      {activeTab === 'planner' && (
                        <ActionPlanner 
                          user={currentUser} 
                          onUserUpdate={handleUserUpdate} 
                          onBack={() => setActiveTab('landing')} 
                          showToast={showToast} 
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Chatbot Companion assistant (shown always under split workspaces) */}
                <div className="mt-4">
                  <PulseAssistant />
                </div>
              </section>

            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer copyright */}
      <footer className="border-t border-slate-200 dark:border-slate-800/60 py-10 text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <GreenPulseLogo size="sm" className="opacity-95" />
            <div className="text-left font-sans text-xs">
              <span className="font-bold text-slate-850 dark:text-slate-300 block font-display">GreenPulse AI</span>
              <div className="flex flex-wrap items-center gap-2.5 mt-1">
                <p className="text-slate-500">
                  Designed and crafted with precision by <b className="text-emerald-400">SATYAM</b>
                </p>
                <button
                  onClick={handleLikeSatyam}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold font-mono border transition-all duration-305 transform active:scale-95 cursor-pointer shadow-sm ${
                    hasLiked
                      ? "bg-rose-950/40 border-rose-500/30 text-rose-400"
                      : "bg-slate-950/40 border-slate-850 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 hover:bg-rose-950/10"
                  }`}
                  aria-label={`Like Satyam's design, current likes: ${likes}`}
                >
                  <Heart className={`h-3 w-3 transition-transform ${hasLiked ? "fill-rose-500 text-rose-500 scale-110 animate-pulse" : "text-slate-400"}`} />
                  <span>{likes}</span>
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center md:items-end gap-1 text-center md:text-right text-[11px] font-mono">
            <span>© {new Date().getFullYear()} GreenPulse AI • All Rights Reserved.</span>
            <span className="text-slate-600">Track • Reduce • Transform • Premium Level Design System</span>
          </div>
        </div>
      </footer>

      {/* Premium Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] max-w-sm w-full px-4"
          >
            <div className={`p-4 rounded-2xl border backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.5)] flex items-center justify-between gap-3 ${
              toast.type === 'success' 
                ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-200"
                : toast.type === 'error' 
                ? "bg-rose-950/90 border-rose-500/40 text-rose-200"
                : "bg-slate-900/95 border-slate-700/40 text-slate-200"
            }`}>
              <div className="flex items-center gap-2.5">
                <span className={`w-2 h-2 rounded-full ${
                  toast.type === 'success' ? "bg-emerald-400" : toast.type === 'error' ? "bg-red-400" : "bg-cyan-400"
                }`} />
                <span className="text-xs font-semibold leading-relaxed font-sans">{toast.message}</span>
              </div>
              <button 
                onClick={() => setToast(null)} 
                className="text-[9px] uppercase font-mono opacity-60 hover:opacity-100 hover:bg-white/10 px-2 py-0.5 rounded transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
