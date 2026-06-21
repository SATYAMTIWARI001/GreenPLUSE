import { useState, useEffect, useRef } from "react";
import { 
  Zap, TreePine, Car, HelpCircle, RefreshCw, ArrowLeft, Award, Smile, 
  Sparkles, CheckCircle2, ShoppingBag, Wind, AlertCircle 
} from "lucide-react";
import { CarbonResult, User } from "../types";
import ReceiptScanner from "./ReceiptScanner";

interface DashboardProps {
  user: User | null;
  result: CarbonResult;
  onReset: () => void;
  onUserUpdate: (updatedUser: User) => void;
  onBack: () => void;
  showToast?: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export default function Dashboard({ user, result, onReset, onUserUpdate, onBack, showToast }: DashboardProps) {
  const [activeCategory, setActiveCategory] = useState<'transport' | 'energy' | 'food' | 'waste'>('transport');
  const [celebrating, setCelebrating] = useState<boolean>(true);
  const [codeTab, setCodeTab] = useState<'python' | 'c' | 'arch'>('arch');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Trigger celebration explosion particle effect on startup!
  useEffect(() => {
    if (!celebrating) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.parentElement?.clientWidth || 500;
    canvas.height = 300;

    let particles: { x: number; y: number; vx: number; vy: number; color: string; size: number; alpha: number }[] = [];
    const colors = ["#10b981", "#34d399", "#60a5fa", "#38bdf8", "#facc15", "#f43f5e"];

    // Initialize fireworks
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8 - 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 3.5 + 1.5,
        alpha: 1
      });
    }

    let animId: number;
    const renderCelebrate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08; // gravity
        p.alpha -= 0.015;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      particles = particles.filter(p => p.alpha > 0);

      if (particles.length > 0) {
        animId = requestAnimationFrame(renderCelebrate);
      } else {
        setCelebrating(false);
      }
    };

    renderCelebrate();

    return () => {
      cancelAnimationFrame(animId);
      ctx.globalAlpha = 1.0;
    };
  }, [celebrating]);

  // Speedometer degrees based on score
  const getSpeedometerRotate = () => {
    // 0-40 kg CO2. Average is around 14.5kg
    const ratio = Math.min(result.score / 35, 1.0);
    return -90 + ratio * 180; // range from -90deg to +90deg
  };

  const getGradeColor = (g: string) => {
    if (g.startsWith('A')) return "text-emerald-400 bg-emerald-950/40 border-emerald-500/20";
    if (g.startsWith('B')) return "text-teal-400 bg-teal-950/40 border-teal-500/20";
    if (g.startsWith('C')) return "text-yellow-450 bg-yellow-950/40 border-yellow-500/20";
    if (g.startsWith('D')) return "text-orange-400 bg-orange-950/40 border-orange-500/20";
    return "text-rose-450 bg-rose-950/40 border-rose-500/20";
  };

  return (
    <div className="flex flex-col gap-6 relative">
      {/* Consistent Back Button UI across nested pages */}
      <div className="flex justify-between items-center bg-slate-900/20 p-3 rounded-2xl border border-slate-800">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-950/40 hover:bg-slate-900 text-slate-300 hover:text-white cursor-pointer transition active:scale-95"
        >
          <ArrowLeft className="h-4 w-4 text-emerald-500" />
          Back to Home Landing
        </button>
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest px-2 py-0.5 border border-slate-800 rounded-full">
          My Analytics
        </span>
      </div>

      {/* Celebration overlay canvas */}
      {celebrating && (
        <div className="absolute inset-0 pointer-events-none z-50">
          <canvas ref={canvasRef} className="w-full h-[300px] block" />
        </div>
      )}

      {/* Hero Carbon Diagnostics card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card bg-slate-900/40 border border-slate-700/30 p-5 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <span className="text-[10px] font-mono text-emerald-300 font-bold tracking-wider uppercase mb-2">
            FOOTPRINT GRADE
          </span>

          <div className="relative h-32 w-32 rounded-full border-4 border-slate-800 flex flex-col items-center justify-center overflow-hidden shadow-inner bg-slate-950">
            <span className="text-4xl font-display font-extrabold tracking-tight text-white mb-0.5">
              {result.grade}
            </span>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest leading-none">
              sustainability
            </span>
          </div>

          <div className="mt-4 text-center flex flex-col items-center justify-center">
            <span className={`text-[10px] uppercase font-mono font-bold tracking-wider px-3 py-1 rounded-full border ${getGradeColor(result.grade)}`}>
              {result.score} kg CO₂ / DAY
            </span>
            <p className="text-xs text-slate-400 font-sans mt-3 leading-relaxed">
              Based on factors, you emit <b className="text-slate-100">{result.yearlyScore} metric tons</b> of CO₂ annually.
            </p>
            {result.engine && (
              <div className="mt-3 text-[10px] font-mono text-emerald-300 bg-emerald-950/50 border border-emerald-500/30 px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-sm animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Computation Engine: <b className="text-white">{result.engine}</b>
              </div>
            )}
          </div>
        </div>

        {/* Speedometer Gauge display */}
        <div className="glass-card bg-slate-900/40 border border-slate-700/30 p-5 rounded-2xl flex flex-col items-center justify-center min-h-[220px]">
          <span className="text-[10px] font-mono text-cyan-400 font-bold tracking-wider uppercase mb-2">
            CARBON SPEEDOMETER
          </span>

          <div className="relative h-28 w-44 overflow-hidden flex flex-col items-center justify-end">
            {/* Speedometer semi-circle arc */}
            <svg className="w-40 h-20 overflow-hidden" viewBox="0 0 100 50">
              <path
                d="M 5 50 A 45 45 0 0 1 95 50"
                fill="none"
                stroke="url(#speed-grad)"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="speed-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="50%" stopColor="#facc15" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
            </svg>

            {/* Gauge Needles pointer */}
            <div
              className="absolute bottom-0 h-16 w-1 bg-red-400 rounded-full origin-bottom transition-transform duration-1000 ease-out"
              style={{
                transform: `rotate(${getSpeedometerRotate()}deg)`,
                transformOrigin: "bottom center"
              }}
            />
            
            <div className="absolute bottom-0 h-3 w-3 bg-white rounded-full border border-red-500" />
            
            <div className="flex justify-between w-full text-[9px] font-mono text-slate-500 mt-2">
              <span>0 kg (low)</span>
              <span>15 kg (avg)</span>
              <span>35 kg (high)</span>
            </div>
          </div>

          <div className="mt-4 text-center">
            {result.comparisonPercent <= 0 ? (
              <span className="text-emerald-400 text-xs font-sans tracking-wide flex items-center gap-1.5 justify-center">
                <Smile className="h-4 w-4" />
                Your footprint is <b>{Math.abs(result.comparisonPercent)}% lower</b> than average household!
              </span>
            ) : (
              <span className="text-yellow-400 text-xs font-sans tracking-wide flex items-center gap-1.5 justify-center">
                <AlertCircle className="h-4 w-4 shrink-0" />
                Your footprint is <b>{result.comparisonPercent}% higher</b> than average standards.
              </span>
            )}
          </div>
        </div>

        {/* Impact Equivalents Counter widget */}
        <div className="glass-card bg-slate-900/40 border border-slate-700/30 p-5 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] font-mono text-rose-450 font-bold tracking-wider uppercase mb-1">
            ENVIRONMENT EQUIVALENTS
          </span>

          <div className="flex flex-col gap-3 my-2">
            <div className="flex items-center gap-3 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/40">
              <div className="h-8 w-8 rounded-lg bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
                <TreePine className="h-4 w-4" />
              </div>
              <div className="text-xs font-sans text-slate-350">
                Requires <b className="text-slate-100 font-mono text-sm">{result.equivalents.treesPlanted} trees</b> planted to absorb emissions.
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/40">
              <div className="h-8 w-8 rounded-lg bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-inner">
                <Car className="h-4 w-4" />
              </div>
              <div className="text-xs font-sans text-slate-350">
                Saves equivalent CO₂ of taking <b className="text-slate-100 font-mono text-sm">{result.equivalents.carsRemovedDays} cars</b> off road for 24h.
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/40">
              <div className="h-8 w-8 rounded-lg bg-yellow-950/40 border border-yellow-500/20 flex items-center justify-center text-yellow-400 shadow-inner">
                <Zap className="h-4 w-4" />
              </div>
              <div className="text-xs font-sans text-slate-350">
                Equivalent to conserving <b className="text-slate-100 font-mono text-sm">{result.equivalents.electricitySavedKwh} kWh</b> grid electricity.
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setCelebrating(true)}
            className="text-[10px] font-mono text-slate-400 hover:text-white flex items-center gap-1 justify-center py-1 bg-slate-950 rounded-lg cursor-pointer hover:bg-slate-900 border border-slate-800 hover:border-slate-700 font-bold transition"
          >
            <Sparkles className="h-3 w-3 text-amber-400" />
            RE-EXPLODE CONFETTI
          </button>
        </div>
      </div>

      {/* Historic charts and circular bars section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card bg-slate-900/40 border border-slate-700/30 p-5 rounded-2xl">
          <h3 className="text-sm font-display font-medium text-slate-100 border-b border-slate-800 pb-2 mb-3 flex justify-between items-center">
            <span>Period Emission Index (Trend)</span>
            <span className="text-[10px] font-mono text-slate-400">Values in kg CO₂</span>
          </h3>

          {/* Fully portable vector charts (Durable and highly optimized) */}
          <div className="relative h-44 flex flex-col justify-between pt-4 bg-slate-950/20 rounded-xl p-3 border border-slate-850/40">
            {/* Background grids */}
            <div className="absolute inset-x-0 top-6 border-t border-slate-800/50" />
            <div className="absolute inset-x-0 top-18 border-t border-slate-800/50" />
            <div className="absolute inset-x-0 top-32 border-t border-slate-800/50" />

            {/* Simulated Trend SVG wave */}
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 150" preserveAspectRatio="none">
              <path
                d={`M 20 120 Q 110 ${120 - result.score * 2.5} 200 ${100 - result.score * 1.8} T 380 40`}
                fill="none"
                stroke="#10b981"
                strokeWidth="3.5"
                strokeLinecap="round"
                className="animate-pulse"
              />
              <path
                d={`M 20 120 Q 110 ${120 - result.score * 2.5} 200 ${100 - result.score * 1.8} T 380 40 L 380 150 L 20 150 Z`}
                fill="url(#trend-area)"
                opacity="0.1"
              />
              <defs>
                <linearGradient id="trend-area" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>
              
              {/* Nodes circles */}
              <circle cx="20" cy="120" r="5" fill="#facc15" />
              <circle cx="110" cy={`${120 - result.score * 2.5}`} r="4" fill="#38bdf8" />
              <circle cx="200" cy={`${100 - result.score * 1.8}`} r="5" fill="#10b981" />
            </svg>

            {/* Wave markers descriptions */}
            <div className="flex justify-between w-full text-[9px] font-mono text-slate-550 pt-24 z-10 select-none pointer-events-none">
              <span>Daily (Today: {result.score})</span>
              <span>Weekly avg</span>
              <span>Monthly projection</span>
              <span>Yearly Target</span>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-2 text-center mt-4">
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-500 font-sans">DAILY</div>
              <div className="text-xs font-mono font-bold text-slate-200 mt-1">{result.score}kg</div>
            </div>
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-500 font-sans">WEEKLY</div>
              <div className="text-xs font-mono font-bold text-emerald-400 mt-1">{Math.round(result.score * 7)}kg</div>
            </div>
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-500 font-sans">MONTHLY</div>
              <div className="text-xs font-mono font-bold text-slate-200 mt-1">{Math.round(result.score * 30.5)}kg</div>
            </div>
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-500 font-sans">YEARLY</div>
              <div className="text-xs font-mono font-bold text-slate-200 mt-1">{result.yearlyScore}T</div>
            </div>
          </div>
        </div>

        {/* Circular progress categories breakdown */}
        <div className="glass-card bg-slate-900/40 border border-slate-700/30 p-5 rounded-2xl">
          <h3 className="text-sm font-display font-medium text-slate-100 border-b border-slate-800 pb-2 mb-3">
            Carbon Source Circularities
          </h3>

          <div className="flex flex-col gap-3.5 mt-2">
            {[
              { label: "Transportation commutes", value: result.breakdown.transport, color: "bg-cyan-400", ratio: Math.round((result.breakdown.transport / result.score) * 100) || 0 },
              { label: "Home active electricity", value: result.breakdown.electricity, color: "bg-yellow-400", ratio: Math.round((result.breakdown.electricity / result.score) * 100) || 0 },
              { label: "Nutritional diets", value: result.breakdown.food, color: "bg-rose-450", ratio: Math.round((result.breakdown.food / result.score) * 100) || 0 },
              { label: "Plastics & waste materials", value: result.breakdown.waste, color: "bg-emerald-400", ratio: Math.round((result.breakdown.waste / result.score) * 100) || 0 }
            ].map((cat) => (
              <div key={cat.label} className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-sans">{cat.label}</span>
                  <span className="font-mono text-slate-100 font-bold">
                    {cat.value} kg ({cat.ratio}%)
                  </span>
                </div>
                
                {/* Horizontal bar progression */}
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                  <div
                    className={`h-full ${cat.color} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${Math.max(3, cat.ratio)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Gemini AI Recommendations organized in categories tabs */}
      <div className="glass-card bg-slate-900/40 border border-slate-700/30 p-5 rounded-2xl">
        <div className="flex justify-between items-center border-b border-slate-850 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            <h3 className="text-sm font-display font-semibold text-slate-100">
              Personalized Gemini AI Suggestions
            </h3>
          </div>
          <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-500/20 rounded font-mono px-2 py-0.5 uppercase tracking-wide">
            REAL AI GENERATED
          </span>
        </div>

        {/* Categories Tab selectors */}
        <div className="grid grid-cols-4 gap-2 mb-4 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          {[
            { id: 'transport', label: 'Commutes', color: 'border-cyan-500/30 text-cyan-400' },
            { id: 'energy', label: 'Electricity', color: 'border-yellow-500/30 text-yellow-400' },
            { id: 'food', label: 'Diets', color: 'border-rose-500/30 text-rose-450' },
            { id: 'waste', label: 'Waste', color: 'border-emerald-500/30 text-emerald-400' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveCategory(item.id as 'transport' | 'energy' | 'food' | 'waste')}
              className={`py-2 px-1 text-center text-xs rounded-lg font-medium cursor-pointer transition ${
                activeCategory === item.id
                  ? "bg-slate-900 border border-slate-700/60 text-emerald-3D shadow-sm"
                  : "text-slate-450 hover:text-slate-200"
              }`}
            >
              <span className={activeCategory === item.id ? "text-emerald-400 font-bold" : "text-slate-400"}>
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* Content list for active category */}
        <div className="flex flex-col gap-2.5">
          {result.suggestions[activeCategory]?.map((sug, i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl bg-slate-950/65 border border-slate-800/80 hover:border-slate-700/60 leading-relaxed flex items-start gap-3 transition-colors duration-300"
            >
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-slate-200 text-xs font-sans tracking-wide leading-relaxed">
                {sug}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Digital Receipt Scanner */}
      <ReceiptScanner user={user} onRewardAwarded={onUserUpdate} />

      {/* Dynamic Green Engine Architecture Panel (Python, C, HTML, CSS, React, JS) */}
      <div className="glass-card bg-slate-900/40 border border-slate-700/30 p-5 rounded-2xl flex flex-col gap-4 mt-2">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-slate-800 pb-3 gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2 rounded bg-amber-950 text-amber-400 font-mono text-[9px] font-bold uppercase tracking-wider">
              GreenPulse Code Explorer
            </span>
            <h3 className="text-sm font-display font-semibold text-slate-100 flex items-center gap-2">
              Multi-Language Calculation Cores
            </h3>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 font-semibold uppercase tracking-wider">
            TS Bridged (Minimal Type Layer)
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed font-sans -mt-1">
          To minimize overhead and comply with standard high-performance carbon auditing, our architecture bridges modern <b className="text-slate-250">React + HTML5 Canvas + CSS/Tailwind</b> with real-time server-spawned <b className="text-slate-250">Python 3 and C</b> algorithms. Select a core below to inspect the actual low-level models:
        </p>

        {/* Tab switchers */}
        <div className="flex gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 max-w-sm self-start">
          {[
            { id: 'arch', label: 'System Design' },
            { id: 'python', label: 'Python (Active Core)' },
            { id: 'c', label: 'IoT C Lang Code' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCodeTab(tab.id as 'python' | 'c' | 'arch')}
              className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg cursor-pointer transition ${
                codeTab === tab.id
                  ? "bg-slate-900 border border-slate-800 text-emerald-400 shadow-sm font-bold"
                  : "text-slate-500 hover:text-slate-350"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {codeTab === 'arch' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 my-1">
            <div className="p-3 bg-slate-950/70 border border-slate-850 rounded-xl">
              <span className="text-[10px] font-mono text-cyan-400 font-extrabold uppercase">1. Python 3 Engine</span>
              <p className="text-[11px] text-slate-400 mt-1 font-sans leading-relaxed">
                Executes the high-precision formulas. Runs server-side in a sandboxed daemon with JSON pipeline streaming.
              </p>
            </div>
            <div className="p-3 bg-slate-950/70 border border-slate-850 rounded-xl">
              <span className="text-[10px] font-mono text-amber-400 font-extrabold uppercase">2. C IoT Sensor Core</span>
              <p className="text-[11px] text-slate-400 mt-1 font-sans leading-relaxed">
                Calculates memory-safe footprint analytics on microcontroller units, designed to run directly in smart electric meters.
              </p>
            </div>
            <div className="p-3 bg-slate-950/70 border border-slate-850 rounded-xl">
              <span className="text-[10px] font-mono text-purple-400 font-extrabold uppercase">3. Web HTML/CSS/JS</span>
              <p className="text-[11px] text-slate-400 mt-1 font-sans leading-relaxed">
                Presents dynamic real-time updates and interactive canvas globes styled elegantly with utility class design.
              </p>
            </div>
          </div>
        )}

        {codeTab === 'python' && (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 max-h-56 overflow-y-auto font-mono text-[11px] text-slate-300 leading-relaxed scrollbar-thin">
            <div className="flex justify-between text-[10px] text-slate-500 uppercase pb-2 mb-2 border-b border-slate-900">
              <span>/calculator.py (runs on server)</span>
              <span>Python 3.10+</span>
            </div>
            <pre className="whitespace-pre">
{`import sys
import json

def calculate_carbon_baseline(inputs):
    # 1. Transportation index (daily values in kg CO2)
    vehicle_factors = {"car": 0.42, "bike": 0.15, "bus": 0.08, "train": 0.05, "metro": 0.04}
    factor = vehicle_factors.get(inputs.get("vehicleType"), 0.0)
    transport_score = float(inputs.get("distancePerDay", 0)) * factor
    
    if inputs.get("vehicleType") == "car":
        fuel = inputs.get("fuelType")
        if fuel == "diesel": transport_score *= 1.25
        elif fuel == "electric": transport_score *= 0.15
        elif fuel == "hybrid": transport_score *= 0.6
        
    # 2. Electricity formulas (AC, Fan, TV, PC, Charger)
    electricity_score = (
        float(inputs.get("acHours", 0)) * 0.6 +
        float(inputs.get("fanHours", 0)) * 0.0375 +
        float(inputs.get("tvHours", 0)) * 0.05 +
        float(inputs.get("computerHours", 0)) * 0.1
    )
    
    # 3. Food Diet indices
    diet = inputs.get("dietType")
    food_score = 1.1 if diet == "vegan" else 1.9 if diet == "vegetarian" else 3.6
    
    # 4. Waste formulas
    waste_score = float(inputs.get("plasticUseScale", 1)) * 0.25 + float(inputs.get("foodWasteScale", 1)) * 0.35
    if inputs.get("recyclingHabit") == "full": waste_score -= 0.6
    
    daily_total = round(transport_score + electricity_score + food_score + max(0.1, waste_score), 2)
    return {"score": daily_total, "yearlyScore": round(daily_total * 0.365, 2)}`}
            </pre>
          </div>
        )}

        {codeTab === 'c' && (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 max-h-56 overflow-y-auto font-mono text-[11px] text-slate-300 leading-relaxed scrollbar-thin">
            <div className="flex justify-between text-[10px] text-slate-500 uppercase pb-2 mb-2 border-b border-slate-900">
              <span>/calculator.c (embedded micro-formulas)</span>
              <span>C99 Spec / Microcontrollers</span>
            </div>
            <pre className="whitespace-pre">
{`#include <stdio.h>
#include <string.h>

typedef struct {
    double transport;
    double electricity;
    double food;
    double waste;
    double dailyTotal;
} CarbonMetric;

void calculate_carbon(char* vehicle, double distance, char* fuel, double ac, double fan, char* diet, CarbonMetric* out) {
    double factor = 0.0;
    if (strcmp(vehicle, "car") == 0) factor = 0.42;
    else if (strcmp(vehicle, "bike") == 0) factor = 0.15;
    
    out->transport = distance * factor;
    out->electricity = (ac * 1.2 + fan * 0.075) * 0.5;
    out->food = (strcmp(diet, "vegan") == 0) ? 1.1 : 3.6;
    out->dailyTotal = out->transport + out->electricity + out->food;
}`}
            </pre>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mt-2">
        <button
          onClick={onReset}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-display font-medium text-xs px-5 py-2.5 rounded-xl border border-emerald-400/20 active:scale-95 transition-all shadow-md cursor-pointer flex items-center gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Re-Calculate Footprint
        </button>
      </div>
    </div>
  );
}
