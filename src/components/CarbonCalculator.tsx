import { useState } from "react";
import { 
  Car, Bike, Bus, Compass, TreePine, Zap, RefreshCw, 
  ArrowRight, ArrowLeft, Utensils, Trash2, Trophy, Eye, Check 
} from "lucide-react";
import { CarbonInputs, CarbonResult, User } from "../types";

interface CarbonCalculatorProps {
  user: User | null;
  onCalculationCompleted: (result: CarbonResult, finalScore: number) => void;
  onBack: () => void;
  showToast?: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function CarbonCalculator({ user, onCalculationCompleted, onBack, showToast }: CarbonCalculatorProps) {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  // States for Calculator Inputs
  const [vehicle, setVehicle] = useState<CarbonInputs['vehicleType']>('walking');
  const [distance, setDistance] = useState<number>(5);
  const [fuel, setFuel] = useState<CarbonInputs['fuelType']>('none');

  const [acHours, setAcHours] = useState<number>(0);
  const [fanHours, setFanHours] = useState<number>(4);
  const [tvHours, setTvHours] = useState<number>(2);
  const [computerHours, setComputerHours] = useState<number>(3);
  const [chargingSessions, setChargingSessions] = useState<number>(1);

  const [diet, setDiet] = useState<CarbonInputs['dietType']>('mixed_diet');

  const [plasticScale, setPlasticScale] = useState<number>(2);
  const [recycling, setRecycling] = useState<CarbonInputs['recyclingHabit']>('partial');
  const [foodWaste, setFoodWaste] = useState<number>(2);

  const handleNextStep = () => {
    // If vehicle isn't car, force fuel to none
    if (step === 1 && vehicle !== 'car') {
      setFuel('none');
    }
    setStep(prev => Math.min(prev + 1, 5));
  };

  const handlePrevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const executeCalculation = async () => {
    setLoading(true);
    const payload: CarbonInputs = {
      vehicleType: vehicle,
      distancePerDay: distance,
      fuelType: fuel,
      acHours,
      fanHours,
      tvHours,
      computerHours,
      mobileChargingSessions: chargingSessions,
      dietType: diet,
      plasticUseScale: plasticScale,
      recyclingHabit: recycling,
      foodWasteScale: foodWaste
    };

    try {
      const response = await fetch("/api/carbon/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id || null,
          inputs: payload
        })
      });

      if (response.ok) {
        const result: CarbonResult = await response.json();
        if (showToast) {
          showToast("Carbon calculations updated successfully!", "success");
        }
        // Trigger parent callback
        onCalculationCompleted(result, result.score);
      } else {
        if (showToast) {
          showToast("Encountered error while running carbon calculations.", "error");
        } else {
          alert("Encountered error while running carbon calculations.");
        }
      }
    } catch (e) {
      console.error("Calculator API communication error", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card text-white p-6 rounded-2xl shadow-xl bg-slate-900/40 relative overflow-hidden border border-slate-700/35">
      {/* Consistent Back Button UI across nested pages */}
      <div className="mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-950/40 hover:bg-slate-900 text-slate-300 hover:text-white cursor-pointer transition active:scale-95"
        >
          <ArrowLeft className="h-4 w-4 text-emerald-500" />
          Back to Home Landing
        </button>
      </div>

      {/* Background radial highlight */}
      <div className="absolute -left-20 -bottom-20 w-44 h-44 bg-emerald-500/5 rounded-full blur-3xl" />

      {/* Title & Progress Tracker */}
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-mono text-emerald-400 font-bold tracking-wider uppercase">
            Micro Carbon Strategy Tool
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Step {step} of 5
          </span>
        </div>

        <h2 className="text-lg font-display font-medium text-slate-100">
          Analyze Your Micro Footprint
        </h2>
        <p className="text-xs text-slate-400 font-sans">
          Simple ecological indicators representing commute, diet, and electricity factors.
        </p>

        {/* Bullet Progress Indicator bar */}
        <div className="flex gap-1.5 mt-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                s <= step ? "bg-emerald-500" : "bg-slate-800"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Dynamic wizard steps container */}
      <div className="min-h-[220px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-4">
            <div className="relative h-16 w-16 bg-slate-950 rounded-full border border-slate-800 flex items-center justify-center animate-spin">
              <RefreshCw className="h-8 w-8 text-emerald-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-display text-slate-200 font-medium">Calculating Carbon Footprint...</p>
              <p className="text-[10px] text-slate-400 font-mono mt-1">Laying parameters and running dynamic Gemini recommendation matrix...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Step 1: Transportation */}
            {step === 1 && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-slate-300 font-display text-sm font-medium border-b border-slate-800/60 pb-2">
                  <Car className="h-4.5 w-4.5 text-cyan-400" />
                  Commute & Transportation Habits
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-sans">Primary vehicle mode used daily</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'car', label: 'Car', icon: Car },
                      { id: 'bike', label: 'Bike', icon: Bike },
                      { id: 'bus', label: 'Bus', icon: Bus },
                      { id: 'metro', label: 'Metro', icon: Compass },
                      { id: 'train', label: 'Train', icon: Compass },
                      { id: 'walking', label: 'Walk', icon: Compass },
                      { id: 'cycling', label: 'Cycle', icon: Bike }
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setVehicle(mode.id as any)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer text-center transition ${
                          vehicle === mode.id
                            ? "bg-emerald-600/10 border-emerald-500 text-slate-100"
                            : "bg-slate-950 border-slate-800 hover:border-slate-700/80 text-slate-400"
                        }`}
                      >
                        <mode.icon className="h-4 w-4" />
                        <span className="text-[10px] font-mono leading-none">{mode.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {/* Distance Input */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs text-slate-450">
                      <label htmlFor="distance-slider" className="text-slate-400 font-sans cursor-pointer">Commute Distance</label>
                      <span className="font-mono text-emerald-400 font-semibold">{distance} km / day</span>
                    </div>
                    <input
                      id="distance-slider"
                      type="range"
                      min="0"
                      max="150"
                      value={distance}
                      onChange={(e) => setDistance(parseInt(e.target.value, 10))}
                      className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-950 rounded"
                    />
                  </div>

                  {/* Fuel type - shows conditionally for car owners */}
                  {vehicle === 'car' && (
                    <div className="flex flex-col gap-1.5 animate-pulse">
                      <label htmlFor="fuel-type" className="text-xs text-slate-400 font-sans cursor-pointer">Select fuel type used</label>
                      <select
                        id="fuel-type"
                        value={fuel}
                        onChange={(e) => setFuel(e.target.value as any)}
                        className="bg-slate-950 text-xs border border-slate-800 rounded-xl p-2 focus:border-emerald-500/50 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="petrol">Petrol (Standard)</option>
                        <option value="diesel">Diesel (Standard Heavy)</option>
                        <option value="hybrid">Hybrid (Medium offsets)</option>
                        <option value="electric">Electric (Low offsets)</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Home Electricity */}
            {step === 2 && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-slate-300 font-display text-sm font-medium border-b border-slate-800/60 pb-2">
                  <Zap className="h-4.5 w-4.5 text-yellow-400 animate-pulse" />
                  Electricity & Household Power Usage
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* AC and Fan sliders */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-sans text-slate-400">
                      <label htmlFor="ac-hours" className="text-xs font-sans text-slate-400 cursor-pointer">Air Conditioner (AC) hours</label>
                      <span className="font-mono text-emerald-400">{acHours} hrs</span>
                    </div>
                    <input
                      id="ac-hours"
                      type="range"
                      min="0"
                      max="24"
                      value={acHours}
                      onChange={(e) => setAcHours(parseInt(e.target.value, 10))}
                      className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-950 rounded"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-sans text-slate-400">
                      <label htmlFor="fan-hours" className="text-xs font-sans text-slate-400 cursor-pointer">Fans hours</label>
                      <span className="font-mono text-emerald-400">{fanHours} hrs</span>
                    </div>
                    <input
                      id="fan-hours"
                      type="range"
                      min="0"
                      max="24"
                      value={fanHours}
                      onChange={(e) => setFanHours(parseInt(e.target.value, 10))}
                      className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-950 rounded"
                    />
                  </div>

                  {/* TV and Computer sliders */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-sans text-slate-400">
                      <label htmlFor="computer-hours" className="text-xs font-sans text-slate-400 cursor-pointer">Active Computer / Console usage</label>
                      <span className="font-mono text-emerald-400">{computerHours} hrs</span>
                    </div>
                    <input
                      id="computer-hours"
                      type="range"
                      min="0"
                      max="24"
                      value={computerHours}
                      onChange={(e) => setComputerHours(parseInt(e.target.value, 10))}
                      className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-950 rounded"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-sans text-slate-400">
                      <label htmlFor="tv-hours" className="text-xs font-sans text-slate-400 cursor-pointer">TV screen viewing</label>
                      <span className="font-mono text-emerald-400">{tvHours} hrs</span>
                    </div>
                    <input
                      id="tv-hours"
                      type="range"
                      min="0"
                      max="24"
                      value={tvHours}
                      onChange={(e) => setTvHours(parseInt(e.target.value, 10))}
                      className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-950 rounded"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/45">
                  <span className="text-slate-400 font-sans">Mobile Phones - total charging sessions daily</span>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((v) => (
                      <button
                        key={v}
                        onClick={() => setChargingSessions(v)}
                        className={`h-7 w-7 text-xs font-mono rounded-lg flex items-center justify-center cursor-pointer ${
                          chargingSessions === v
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Food Habits */}
            {step === 3 && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-slate-300 font-display text-sm font-medium border-b border-slate-800/60 pb-2">
                  <Utensils className="h-4.5 w-4.5 text-rose-450" />
                  Food Diet & Nutrition
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-xs text-slate-450 font-sans">Select diet style that reflects your plate</label>
                  <div className="flex flex-col gap-2">
                    {[
                      { id: 'vegan', label: '🌱 Strictly Vegan', desc: '100% plant portfolio. Minimizes localized methane, irrigation, and clearance loads entirely.' },
                      { id: 'vegetarian', label: '🥗 Vegetarian', desc: 'Plant base including milk and honey. Reduced dairy carbon, highly localized logistics.' },
                      { id: 'mixed_diet', label: '🍗 Mixed Diet (Meat & Poultry)', desc: 'Standard animal ingredients. Features elevated footprint values representing poultry logistics.' }
                    ].map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setDiet(d.id as any)}
                        className={`p-3.5 rounded-xl border flex flex-col text-left gap-1 cursor-pointer transition ${
                          diet === d.id
                            ? "bg-emerald-600/10 border-emerald-500 text-slate-100"
                            : "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400"
                        }`}
                      >
                        <span className="text-xs font-display font-medium text-slate-100">{d.label}</span>
                        <span className="text-[10px] font-sans leading-normal mt-1 block">{d.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Plastics & Recycling */}
            {step === 4 && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-slate-300 font-display text-sm font-medium border-b border-slate-800/60 pb-2">
                  <Trash2 className="h-4.5 w-4.5 text-emerald-400" />
                  Plastics usage & waste sorting
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-sans text-slate-400">
                    <label htmlFor="plastic-scale" className="text-xs font-sans text-slate-400 cursor-pointer">Plastics & Single-use wrappers usage</label>
                    <span className="font-mono text-emerald-300">Level {plasticScale} / 5</span>
                  </div>
                  <input
                    id="plastic-scale"
                    type="range"
                    min="1"
                    max="5"
                    value={plasticScale}
                    onChange={(e) => setPlasticScale(parseInt(e.target.value, 10))}
                    className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-950 rounded"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>Zero Plastics</span>
                    <span>High polymers</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 mt-2">
                  <span className="text-xs text-slate-400 font-sans">Describe household recycling efforts</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'none', label: 'Landfill base' },
                      { id: 'partial', label: 'Partial separation' },
                      { id: 'full', label: 'Sorted circular setup' }
                    ].map((idx) => (
                      <button
                        key={idx.id}
                        type="button"
                        onClick={() => setRecycling(idx.id as any)}
                        className={`p-2 rounded-xl border cursor-pointer text-center text-xs transition ${
                          recycling === idx.id
                            ? "bg-emerald-600/10 border-emerald-500 text-slate-100 font-semibold"
                            : "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400"
                        }`}
                      >
                        {idx.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 mt-1">
                  <div className="flex justify-between text-xs font-sans text-slate-400">
                    <label htmlFor="food-waste-scale" className="text-xs font-sans text-slate-400 cursor-pointer">Estimate food peel and edible parts waste</label>
                    <span className="font-mono text-amber-500">Scale {foodWaste} / 5</span>
                  </div>
                  <input
                    id="food-waste-scale"
                    type="range"
                    min="1"
                    max="5"
                    value={foodWaste}
                    onChange={(e) => setFoodWaste(parseInt(e.target.value, 10))}
                    className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-950 rounded"
                  />
                </div>
              </div>
            )}

            {/* Step 5: Review Requirements */}
            {step === 5 && (
              <div className="flex flex-col justify-between h-full gap-4">
                <div className="flex items-center gap-2 text-slate-350 font-display text-sm font-medium border-b border-slate-800/60 pb-2">
                  <Trophy className="h-4.5 w-4.5 text-amber-400 animate-bounce" />
                  Strategy confirmation & Audit
                </div>

                <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col gap-3">
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    Ready to summarize indicators! We will verify metrics across transportation, domestic cooling feeds, nutritional habits, and sorting circularities directly.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-sans text-slate-400">
                    <div className="flex items-center gap-1.5 bg-slate-900/50 p-2 rounded">
                      <Check className="h-3 w-3 text-emerald-450" />
                      Commute: {vehicle} ({distance}km)
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-900/50 p-2 rounded">
                      <Check className="h-3 w-3 text-emerald-450" />
                      AC Cooling: {acHours} hrs
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-900/50 p-2 rounded">
                      <Check className="h-3 w-3 text-emerald-450" />
                      Peel Waste: scale {foodWaste}/5
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-900/50 p-2 rounded">
                      <Check className="h-3 w-3 text-emerald-450" />
                      Diet: {diet.replace("_", " ")}
                    </div>
                  </div>
                </div>

                <button
                  onClick={executeCalculation}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-display font-medium text-xs py-3 px-4 rounded-xl border border-emerald-400/25 active:scale-95 transition-all shadow-lg cursor-pointer text-center"
                >
                  🚀 Sum up & Activate Carbon Engine
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Buttons Navigation bar */}
      {!loading && (
        <div className="flex justify-between items-center mt-6 border-t border-slate-800/80 pt-4">
          <button
            onClick={handlePrevStep}
            disabled={step === 1}
            className={`flex items-center gap-1 text-xs font-mono font-bold px-3 py-1.5 rounded-lg border transition ${
              step === 1
                ? "border-transparent text-slate-650 pointer-events-none"
                : "border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 cursor-pointer"
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            BACK
          </button>

          {step < 5 && (
            <button
              onClick={handleNextStep}
              className="flex items-center gap-1 text-xs font-mono font-bold bg-emerald-950/60 border border-emerald-500/20 hover:border-emerald-500/50 text-emerald-400 hover:text-emerald-300 px-3 py-1.5 rounded-lg cursor-pointer transition active:scale-95"
            >
              NEXT
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
