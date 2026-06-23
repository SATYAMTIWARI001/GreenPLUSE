import { useState, useEffect } from "react";
import { Calendar, Trash2, Plus, Sparkles, CheckSquare, Square, ArrowLeft } from "lucide-react";
import { User } from "../types";

interface ActionItem {
  id: string;
  title: string;
  category: "transport" | "energy" | "food" | "waste";
  co2Saving: number; // kg saved per day
  pointsReward: number;
  description: string;
}

const ACTION_CATALOG: ActionItem[] = [
  {
    id: "act-transit",
    title: "Commute via Bus/Metro",
    category: "transport",
    co2Saving: 4.8,
    pointsReward: 15,
    description: "Replace private car driving with public bus or train lines."
  },
  {
    id: "act-cycling",
    title: "Commute via Walking/Cycling",
    category: "transport",
    co2Saving: 6.5,
    pointsReward: 25,
    description: "Cycle or walk for short distance trips."
  },
  {
    id: "act-ac-temp",
    title: "Set AC to 24°C or higher",
    category: "energy",
    co2Saving: 2.4,
    pointsReward: 10,
    description: "Raise AC temperatures or switch to fans."
  },
  {
    id: "act-unplug",
    title: "Resolve phantom loads",
    category: "energy",
    co2Saving: 0.8,
    pointsReward: 5,
    description: "Switch off appliances at wall plugs instead of standby."
  },
  {
    id: "act-vegan",
    title: "Strict Vegan Diet Day",
    category: "food",
    co2Saving: 2.5,
    pointsReward: 20,
    description: "Enjoy vegan meals (plants, pulses, grains) for a full day."
  },
  {
    id: "act-veggie",
    title: "Vegetarian Diet Day",
    category: "food",
    co2Saving: 1.7,
    pointsReward: 10,
    description: "Avoid meat/poultry for a full day."
  },
  {
    id: "act-sorting",
    title: "Full waste separation",
    category: "waste",
    co2Saving: 0.6,
    pointsReward: 10,
    description: "Segregate organics, paper, metals, and plastics cleanly."
  },
  {
    id: "act-bottle",
    title: "Zero Single-Use Plastic",
    category: "waste",
    co2Saving: 0.4,
    pointsReward: 10,
    description: "Use personal cups, metal straws, and fabric bags all day."
  }
];

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface ActionPlannerProps {
  user: User | null;
  onUserUpdate?: (updatedUser: User) => void;
  onBack: () => void;
  showToast?: (msg: string, type?: "success" | "info" | "error") => void;
}

interface ScheduledPledge {
  scheduleId: string;
  day: string;
  actionId: string;
  completed: boolean;
}

export default function ActionPlanner({ user, onUserUpdate, onBack, showToast }: ActionPlannerProps) {
  const [pledges, setPledges] = useState<ScheduledPledge[]>([]);
  const [activeDay, setActiveDay] = useState<string>("Monday");
  const [selectedCatalogId, setSelectedCatalogId] = useState<string>(ACTION_CATALOG[0].id);

  // Load pledges from localStorage on mount
  useEffect(() => {
    const cached = localStorage.getItem("greenpulse-weekly-pledges");
    if (cached) {
      try {
        setPledges(JSON.parse(cached));
      } catch (err) {
        console.error("Error loading cached pledges", err);
      }
    } else {
      // Pre-seed some default pledges
      const seed: ScheduledPledge[] = [
        { scheduleId: "seed-1", day: "Monday", actionId: "act-transit", completed: false },
        { scheduleId: "seed-2", day: "Wednesday", actionId: "act-ac-temp", completed: false },
        { scheduleId: "seed-3", day: "Friday", actionId: "act-vegan", completed: false }
      ];
      setPledges(seed);
      localStorage.setItem("greenpulse-weekly-pledges", JSON.stringify(seed));
    }
  }, []);

  // Save pledges helper
  const savePledges = (updated: ScheduledPledge[]) => {
    setPledges(updated);
    localStorage.setItem("greenpulse-weekly-pledges", JSON.stringify(updated));
  };

  const handleAddPledge = () => {
    // Prevent duplicate action on the same day
    const exists = pledges.some(p => p.day === activeDay && p.actionId === selectedCatalogId);
    if (exists) {
      if (showToast) showToast("This action is already scheduled for " + activeDay, "info");
      return;
    }

    const newPledge: ScheduledPledge = {
      scheduleId: "pledge-" + Date.now() + "-" + Math.random().toString(36).substring(2, 5),
      day: activeDay,
      actionId: selectedCatalogId,
      completed: false
    };

    const updated = [...pledges, newPledge];
    savePledges(updated);
    if (showToast) showToast("Added pledge to your " + activeDay + " schedule!", "success");
  };

  const handleRemovePledge = (scheduleId: string) => {
    const updated = pledges.filter(p => p.scheduleId !== scheduleId);
    savePledges(updated);
  };

  const handleToggleComplete = async (pledge: ScheduledPledge) => {
    if (pledge.completed) {
      // Toggle back to incomplete
      const updated = pledges.map(p => 
        p.scheduleId === pledge.scheduleId ? { ...p, completed: false } : p
      );
      savePledges(updated);
      return;
    }

    // Mark complete and award points
    const actionItem = ACTION_CATALOG.find(a => a.id === pledge.actionId);
    if (!actionItem) return;

    const updated = pledges.map(p => 
      p.scheduleId === pledge.scheduleId ? { ...p, completed: true } : p
    );
    savePledges(updated);

    if (user && onUserUpdate) {
      try {
        const rewardPoints = actionItem.pointsReward;
        const res = await fetch("/api/user/update-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: user.id,
            points: user.points + rewardPoints
          })
        });
        if (res.ok) {
          const data = await res.json();
          onUserUpdate(data.user);
          if (showToast) showToast(`Pledge completed! Allocated +${rewardPoints} GreenPoints.`, "success");
        }
      } catch (err) {
        // Fallback local update
        const updatedUser = { ...user, points: user.points + actionItem.pointsReward };
        onUserUpdate(updatedUser);
        if (showToast) showToast(`Pledge completed! Allocated +${actionItem.pointsReward} GreenPoints (local).`, "success");
      }
    }
  };

  // Calculate totals
  const totalWeeklySavings = pledges.reduce((acc, p) => {
    const action = ACTION_CATALOG.find(a => a.id === p.actionId);
    return acc + (action ? action.co2Saving : 0);
  }, 0);

  const completedSavings = pledges.reduce((acc, p) => {
    if (!p.completed) return acc;
    const action = ACTION_CATALOG.find(a => a.id === p.actionId);
    return acc + (action ? action.co2Saving : 0);
  }, 0);

  const activePledges = pledges.filter(p => p.day === activeDay);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "transport": return "bg-cyan-950/40 text-cyan-400 border-cyan-500/20";
      case "energy": return "bg-yellow-950/40 text-yellow-400 border-yellow-500/20";
      case "food": return "bg-rose-950/40 text-rose-400 border-rose-500/20";
      default: return "bg-emerald-950/40 text-emerald-400 border-emerald-500/20";
    }
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden p-5 shadow-xl bg-slate-900/40 border border-slate-700/30 flex flex-col gap-5 text-left font-sans">
      {/* Navigation Header */}
      <div className="flex justify-between items-center bg-slate-950/20 p-2 rounded-xl border border-slate-850">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-950/40 hover:bg-slate-900 text-slate-300 hover:text-white cursor-pointer transition active:scale-95"
        >
          <ArrowLeft className="h-4 w-4 text-emerald-500" />
          Back to Home Landing
        </button>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 border border-emerald-800/40 rounded-full font-bold uppercase tracking-wider">
          Climate Action Planner
        </span>
      </div>

      {/* Main Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-display font-medium text-slate-100 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-400 animate-pulse" />
            Weekly Climate Action Planner
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Pledge custom eco-actions for specific weekdays, verify completion, and build cumulative carbon savings.
          </p>
        </div>

        {/* Telemetry Summary */}
        <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-850 text-[11px] font-mono">
          <div className="border-r border-slate-800 pr-3">
            <span className="text-slate-500 block uppercase text-[9px] tracking-wider">Plan Savings</span>
            <span className="text-sm font-bold text-cyan-400">{totalWeeklySavings.toFixed(1)} kg CO₂e</span>
          </div>
          <div className="pl-1">
            <span className="text-slate-500 block uppercase text-[9px] tracking-wider">Completed</span>
            <span className="text-sm font-bold text-emerald-400">{completedSavings.toFixed(1)} kg CO₂e</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Days Calendar select and active Pledges List */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          {/* Day selection tabs */}
          <div className="flex overflow-x-auto gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-850/60 scrollbar-none whitespace-nowrap">
            {DAYS_OF_WEEK.map((d) => {
              const dayCount = pledges.filter(p => p.day === d).length;
              return (
                <button
                  key={d}
                  onClick={() => setActiveDay(d)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition ${
                    activeDay === d
                      ? "bg-emerald-600 text-white shadow-md"
                      : "text-slate-450 hover:text-slate-200"
                  }`}
                >
                  {d.slice(0, 3)}
                  {dayCount > 0 && (
                    <span className="ml-1 bg-slate-900/60 text-emerald-400 text-[8px] font-bold px-1.5 py-0.2 rounded-full border border-emerald-500/20">
                      {dayCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active day's Pledges */}
          <div className="flex flex-col gap-3 min-h-[220px] bg-slate-950/20 border border-slate-850 rounded-2xl p-4">
            <h3 className="text-xs font-mono font-bold text-slate-350 uppercase tracking-widest flex items-center gap-1">
              <span>Pledges for {activeDay}</span>
            </h3>

            {activePledges.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-10 text-slate-500">
                <span className="text-[11px] font-sans">No pledges scheduled for this day yet. Select an action on the right to start building your planner!</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {activePledges.map((pledge) => {
                  const action = ACTION_CATALOG.find(a => a.id === pledge.actionId);
                  if (!action) return null;

                  return (
                    <div
                      key={pledge.scheduleId}
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                        pledge.completed
                          ? "bg-emerald-950/20 border-emerald-500/25 text-slate-300"
                          : "bg-slate-950/50 border-slate-850 hover:border-slate-800 text-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleComplete(pledge)}
                          className="text-slate-400 hover:text-emerald-400 transition transform active:scale-90 cursor-pointer"
                          title={pledge.completed ? "Mark pledge incomplete" : "Verify completion"}
                        >
                          {pledge.completed ? (
                            <CheckSquare className="h-5 w-5 text-emerald-400 fill-emerald-950/20" />
                          ) : (
                            <Square className="h-5 w-5 text-slate-650" />
                          )}
                        </button>

                        <div>
                          <h4 className={`text-xs font-semibold leading-tight ${pledge.completed ? "line-through text-slate-500" : ""}`}>
                            {action.title}
                          </h4>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded border font-mono mt-1 inline-block uppercase ${getCategoryColor(action.category)}`}>
                            {action.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right text-[10px] font-mono leading-none">
                          <div className="font-bold text-cyan-400">-{action.co2Saving} kg CO₂</div>
                          <div className="text-emerald-400 mt-0.5">+{action.pointsReward} GP</div>
                        </div>

                        <button
                          onClick={() => handleRemovePledge(pledge.scheduleId)}
                          className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-550 hover:text-rose-450 border border-transparent hover:border-slate-800 transition active:scale-95 cursor-pointer"
                          title="Remove pledge from day"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: catalog of Pledges to add */}
        <div className="lg:col-span-5 flex flex-col gap-4 bg-slate-950/40 border border-slate-850 p-4 rounded-2xl">
          <div>
            <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1">
              <Plus className="h-3.5 w-3.5 text-emerald-400" /> Add New Action
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Choose an eco-action from our carbon reduction matrix to add to your plan.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <label htmlFor="catalog-action-select" className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
                Select Eco Pledge
              </label>
              <select
                id="catalog-action-select"
                value={selectedCatalogId}
                onChange={(e) => setSelectedCatalogId(e.target.value)}
                className="w-full bg-slate-950 text-xs border border-slate-800 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500/50 text-white"
              >
                {ACTION_CATALOG.map((act) => (
                  <option key={act.id} value={act.id}>
                    {act.title} (-{act.co2Saving} kg/day)
                  </option>
                ))}
              </select>
            </div>

            {/* Catalog details display card */}
            {(() => {
              const act = ACTION_CATALOG.find(a => a.id === selectedCatalogId);
              if (!act) return null;
              return (
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-850 flex flex-col gap-2 text-xs leading-relaxed text-slate-300 font-sans">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className={`px-2 py-0.5 rounded border uppercase ${getCategoryColor(act.category)}`}>
                      {act.category}
                    </span>
                    <span className="text-emerald-400">Award: +{act.pointsReward} GP</span>
                  </div>
                  <p className="font-light mt-0.5 text-slate-400">{act.description}</p>
                  <div className="text-[10px] font-mono text-cyan-400 border-t border-slate-900 pt-2 flex items-center gap-1 font-bold">
                    <Sparkles className="h-3 w-3 text-cyan-400" />
                    Impact: Reduces footprint by {act.co2Saving} kg CO₂ / day.
                  </div>
                </div>
              );
            })()}

            <button
              onClick={handleAddPledge}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-display font-semibold text-xs py-3 rounded-xl cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Plus className="h-4 w-4" /> Pledge for {activeDay}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
