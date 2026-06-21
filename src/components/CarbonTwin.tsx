import { useState } from "react";
import { Sliders, HelpCircle, Calendar, LineChart, Trees, Sparkles, ChevronRight, ArrowLeft, Check } from "lucide-react";
import { User } from "../types";

interface CarbonTwinProps {
  user: User | null;
  baseScore: number;
  onBack: () => void;
}

export default function CarbonTwin({ user, baseScore, onBack }: CarbonTwinProps) {
  // Simulator parameters
  const [solarShare, setSolarShare] = useState<number>(0); // 0% to 100%
  const [dietOffset, setDietOffset] = useState<number>(0); // 0 (standard mixed) to 10 (perfect organic vegan)
  const [evCommute, setEvCommute] = useState<number>(0); // 0% to 100% of trips replaced with EV/active
  const [plasticSorting, setPlasticSorting] = useState<number>(1); // 1 to 5 scale

  // Compute simulated outcomes based on baseScore (or a default average of 14.5 if base is 0)
  const sourceScore = baseScore > 0 ? baseScore : 14.5;

  // Calculate reductions
  const solarReduction = (solarShare / 100) * (sourceScore * 0.25); // Solar cuts up to 25% of emission load
  const dietReduction = (dietOffset / 10) * (sourceScore * 0.22); // Diet cuts up to 22% of emission load
  const evReduction = (evCommute / 100) * (sourceScore * 0.35); // Transport cuts up to 35% of emission load
  const plasticReduction = ((plasticSorting - 1) / 4) * (sourceScore * 0.08); // Recycling cuts up to 8% of emission load

  const maxReductionFactor = solarReduction + dietReduction + evReduction + plasticReduction;
  const simulatedScore = Math.max(0.5, parseFloat((sourceScore - maxReductionFactor).toFixed(2)));
  const reductionPercent = Math.round((maxReductionFactor / sourceScore) * 100) || 0;

  // Simulated future projections of CO2 cumulative tons saved over years
  const cumulativeSaved = (maxReductionFactor * 365) / 1000; // Tons of CO2 saved per year
  const projections = [
    { year: 1, saved: Math.round(cumulativeSaved), trees: Math.round(cumulativeSaved * 50) },
    { year: 5, saved: Math.round(cumulativeSaved * 5), trees: Math.round(cumulativeSaved * 50 * 5) },
    { year: 15, saved: Math.round(cumulativeSaved * 15), trees: Math.round(cumulativeSaved * 50 * 15) },
    { year: 30, saved: Math.round(cumulativeSaved * 30), trees: Math.round(cumulativeSaved * 50 * 30) }
  ];

  return (
    <div className="glass-card rounded-2xl p-6 shadow-xl bg-slate-900/40 border border-slate-700/30 flex flex-col gap-6 text-slate-100 anime-fade-in" id="carbon-twin-panel">
      {/* Consistent Back Button UI across nested pages */}
      <div className="mb-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-950/40 hover:bg-slate-900 text-slate-300 hover:text-white cursor-pointer transition active:scale-95"
        >
          <ArrowLeft className="h-4 w-4 text-emerald-500" />
          Back to Home Landing
        </button>
      </div>

      {/* Upper header title block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-4 gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[9px] font-mono font-bold text-cyan-400 bg-cyan-950/50 border border-cyan-800/40 rounded-full uppercase tracking-wider">
            <Sparkles className="h-2.5 w-2.5 animate-pulse" />
            Ecosystem Digital Sandbox
          </span>
          <h2 className="text-lg font-display font-semibold text-slate-100 mt-1 flex items-center gap-2">
            <Sliders className="h-5 w-5 text-cyan-500" />
            Carbon Twin & Lifestyle Sandbox
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Slide and configure lifestyle multipliers to preview future planetary curves instantly.
          </p>
        </div>

        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center gap-3">
          <div>
            <span className="text-[9px] text-slate-500 uppercase tracking-widest block font-mono">Current Base Target</span>
            <span className="text-sm font-mono font-bold text-slate-350">{sourceScore} kg CO₂ / day</span>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-650" />
          <div>
            <span className="text-[9px] text-cyan-400 uppercase tracking-widest block font-mono">Simulated Twin Target</span>
            <span className="text-sm font-mono font-bold text-cyan-400">{simulatedScore} kg CO₂ / day</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders columns left */}
        <div className="lg:col-span-6 flex flex-col gap-5 bg-slate-950/30 p-5 rounded-2xl border border-slate-850">
          <h3 className="text-xs font-display font-medium text-slate-300 uppercase tracking-wide border-b border-slate-900 pb-2 flex items-center gap-1.5">
            💼 Simulation Knobs
          </h3>

          {/* Slider 1: Solar power share */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs">
              <label htmlFor="solar-share-slider" className="text-slate-300 font-medium cursor-pointer">Home Solar Generation Share</label>
              <span className="font-mono text-cyan-400 font-bold">{solarShare}%</span>
            </div>
            <input
              id="solar-share-slider"
              type="range"
              min="0"
              max="100"
              value={solarShare}
              onChange={(e) => setSolarShare(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-950 rounded cursor-pointer"
            />
            <span className="text-[9px] text-slate-500 leading-normal font-sans">
              Replaces fossil coal grids with zero-emission local silicon solar arrays.
            </span>
          </div>

          {/* Slider 2: EV Transport commute replaced */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs">
              <label htmlFor="ev-commute-slider" className="text-slate-300 font-medium cursor-pointer">Active Mobility & EV Transition</label>
              <span className="font-mono text-cyan-400 font-bold">{evCommute}%</span>
            </div>
            <input
              id="ev-commute-slider"
              type="range"
              min="0"
              max="100"
              value={evCommute}
              onChange={(e) => setEvCommute(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-950 rounded cursor-pointer"
            />
            <span className="text-[9px] text-slate-500 leading-normal font-sans">
              Proportion of car/bike travel replaced with electric vehicles, metro lines, or cycling.
            </span>
          </div>

          {/* Slider 3: Nutrition habit offsets */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs">
              <label htmlFor="diet-offset-slider" className="text-slate-300 font-medium cursor-pointer">Eco Nutritional Density</label>
              <span className="font-mono text-cyan-400 font-bold">Level {dietOffset} / 10</span>
            </div>
            <input
              id="diet-offset-slider"
              type="range"
              min="0"
              max="10"
              value={dietOffset}
              onChange={(e) => setDietOffset(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-950 rounded cursor-pointer"
            />
            <span className="text-[9px] text-slate-500 leading-normal font-sans">
              Shifts dietary proteins from poultry/dairy to local organic, pulse, and vegan crops.
            </span>
          </div>

          {/* Slider 4: Waste and Plastics setup */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs">
              <label htmlFor="plastic-sorting-slider" className="text-slate-300 font-medium cursor-pointer">Circular Material Sorting</label>
              <span className="font-mono text-cyan-400 font-bold">Scale {plasticSorting} / 5</span>
            </div>
            <input
              id="plastic-sorting-slider"
              type="range"
              min="1"
              max="5"
              value={plasticSorting}
              onChange={(e) => setPlasticSorting(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-950 rounded cursor-pointer"
            />
            <span className="text-[9px] text-slate-500 leading-normal font-sans">
              Eliminating single-use wrappers and separating 100% of paper, cardboard, and organics.
            </span>
          </div>

          {/* Reset button inside knobs */}
          <button
            onClick={() => {
              setSolarShare(0);
              setDietOffset(0);
              setEvCommute(0);
              setPlasticSorting(1);
            }}
            className="text-[10px] font-mono text-slate-500 hover:text-slate-300 bg-slate-950 py-1.5 rounded border border-slate-900 transition mt-2 cursor-pointer text-center font-bold"
          >
            RESET SIMULATOR KNOBS
          </button>
        </div>

        {/* Future prediction timeline chart right */}
        <div className="lg:col-span-6 flex flex-col gap-5">
          {/* Dynamic Gauge meter */}
          <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800 flex justify-between items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/[0.03] rounded-full blur-2xl pointer-events-none" />
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">Simulation Score Shift</span>
              <div className="text-2xl font-mono font-extrabold text-cyan-350 tracking-tight mt-1">
                -{reductionPercent}% overall reduction
              </div>
              <p className="text-xs text-slate-400 font-sans mt-1.5 leading-relaxed">
                Tweak knobs to model sustainable lifestyles. Reaching a 40% reduction preserves substantial global biodiversity.
              </p>
            </div>

            <div className="text-right">
              <div className="text-3xl font-mono font-bold text-white leading-none">
                {simulatedScore}
              </div>
              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono mt-1 block">kg CO₂ / day</span>
            </div>
          </div>

          {/* Timeline Projections */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-display font-medium text-slate-350 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-cyan-400" />
              Projected Atmosphere Recovery Timeline (Tons of CO₂ saved)
            </h4>

            <div className="flex flex-col gap-2.5">
              {projections.map((proj) => (
                <div key={proj.year} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center hover:border-slate-700/60 transition">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-12 rounded-lg bg-teal-950/30 border border-teal-800/30 flex flex-col items-center justify-center text-teal-400 font-mono text-xs font-bold shadow-inner">
                      {proj.year} <span className="text-[8px] uppercase tracking-widest text-slate-500 font-sans">Yr</span>
                    </div>
                    <div>
                      <div className="text-xs text-slate-300 font-sans">
                        Retires <b className="text-white font-mono text-sm">{proj.saved.toLocaleString()} metric tons</b> of CO₂
                      </div>
                      <span className="text-[10px] text-slate-500 font-sans">Net weight prevented from entering atmospheric envelope.</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-xs font-mono text-emerald-400 font-bold block">
                      +{proj.trees.toLocaleString()} 🌱
                    </span>
                    <span className="text-[8px] uppercase text-slate-500 font-mono">Forest Equivalent</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Environmental advice snippet */}
          <div className="bg-cyan-950/15 border border-cyan-800/20 rounded-xl p-3 text-xs leading-relaxed flex items-start gap-2.5">
            <HelpCircle className="h-4.5 w-4.5 text-cyan-400 shrink-0 mt-0.5" />
            <p className="text-slate-300 font-sans">
              <b>Earth-Twin Theorem:</b> Transitioning to 100% home solar and walking short distances preserves approximately 120 blocks of high-emission coal grids from ever firing up annually.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
