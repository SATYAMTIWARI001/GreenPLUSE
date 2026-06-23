import { useState } from "react";
import { Award, Lock, Sparkles, CheckCircle2, ArrowLeft } from "lucide-react";
import { User } from "../types";

interface BadgeDetail {
  id: string;
  name: string;
  description: string;
  lore: string;
  pointsValue: number;
  category: "starter" | "scoring" | "milestone" | "donation";
  iconColor: string;
  glowColor: string;
}

const BADGES_DATABASE: BadgeDetail[] = [
  {
    id: "badge-1",
    name: "First Breath",
    description: "Initialize your GreenPulse profile setup.",
    lore: "Welcome to the planetary defence guild! Taking the initial step is often the hardest part of the climate journey.",
    pointsValue: 100,
    category: "starter",
    iconColor: "text-indigo-400 bg-indigo-950/40 border-indigo-500/20",
    glowColor: "shadow-[0_0_20px_rgba(129,140,248,0.15)]"
  },
  {
    id: "badge-calc",
    name: "Footprint Pioneer",
    description: "Calculate your first daily carbon footprint score.",
    lore: "You've successfully mapped your carbon telemetry, establishing a scientific baseline for ecological savings.",
    pointsValue: 100,
    category: "scoring",
    iconColor: "text-cyan-400 bg-cyan-950/40 border-cyan-500/20",
    glowColor: "shadow-[0_0_20px_rgba(34,211,238,0.15)]"
  },
  {
    id: "badge-eco-champion",
    name: "Eco Champion",
    description: "Achieve a carbon grade of A+ or A in your checklist.",
    lore: "Outstanding thermal regulation! Your choices keep your footprint well below the global average boundary.",
    pointsValue: 150,
    category: "scoring",
    iconColor: "text-emerald-400 bg-emerald-950/40 border-emerald-500/20",
    glowColor: "shadow-[0_0_20px_rgba(16,185,129,0.2)]"
  },
  {
    id: "badge-warrior",
    name: "Green Warrior",
    description: "Amass a total of 500 GreenPoints.",
    lore: "A veteran of environmental discipline! You consistently complete tasks and reduce resource load.",
    pointsValue: 200,
    category: "milestone",
    iconColor: "text-yellow-400 bg-yellow-950/40 border-yellow-500/20",
    glowColor: "shadow-[0_0_20px_rgba(234,179,8,0.15)]"
  },
  {
    id: "badge-champion",
    name: "Earth Champion",
    description: "Amass a total of 3000 GreenPoints.",
    lore: "A beacon of ecological wisdom! Your steady dedication makes you a champion of global biosphere restoration.",
    pointsValue: 500,
    category: "milestone",
    iconColor: "text-teal-400 bg-teal-950/40 border-teal-500/20",
    glowColor: "shadow-[0_0_20px_rgba(20,184,166,0.15)]"
  },
  {
    id: "badge-master",
    name: "Sustainability Master",
    description: "Amass a total of 5000 GreenPoints.",
    lore: "An elite guardian of our climate future! Your footprint savings exceed tons of equivalent carbon offsets.",
    pointsValue: 1000,
    category: "milestone",
    iconColor: "text-rose-400 bg-rose-950/40 border-rose-500/20",
    glowColor: "shadow-[0_0_20px_rgba(244,63,94,0.2)]"
  },
  {
    id: "badge-reforest-1",
    name: "Reforestation Guardian",
    description: "Invest GreenPoints in Varanasi Reforestation Sapling.",
    lore: "Your Varanasi sapling will grow to absorb over 22 kilograms of carbon dioxide annually, cooling city blocks.",
    pointsValue: 250,
    category: "donation",
    iconColor: "text-green-400 bg-green-950/40 border-green-500/20",
    glowColor: "shadow-[0_0_20px_rgba(74,222,128,0.15)]"
  },
  {
    id: "badge-solar-water",
    name: "Solar Hydro Specialist",
    description: "Invest GreenPoints in Bihar Clean-Water Project.",
    lore: "You funded clean grid electricity for sub-district water filtration, averting wood-fire boiling emissions.",
    pointsValue: 250,
    category: "donation",
    iconColor: "text-amber-400 bg-amber-950/40 border-amber-500/20",
    glowColor: "shadow-[0_0_20px_rgba(251,191,36,0.15)]"
  },
  {
    id: "badge-clay",
    name: "Traditional Artisan Ally",
    description: "Invest GreenPoints in clay-guild earthen pots.",
    lore: "Earthen pots act as natural refrigerants, avoiding energy intensive appliance dependencies.",
    pointsValue: 200,
    category: "donation",
    iconColor: "text-orange-400 bg-orange-950/40 border-orange-500/20",
    glowColor: "shadow-[0_0_20px_rgba(251,146,60,0.15)]"
  },
  {
    id: "badge-agro",
    name: "Agroforestry Champion",
    description: "Invest GreenPoints in Bihar organic agroforestry blocks.",
    lore: "By mixing crops with diverse trees, you support local soil health and create permanent natural carbon sinks.",
    pointsValue: 300,
    category: "donation",
    iconColor: "text-emerald-300 bg-emerald-950/30 border-emerald-500/10",
    glowColor: "shadow-[0_0_20px_rgba(52,211,153,0.15)]"
  }
];

interface BadgesGalleryProps {
  user: User | null;
  onBack: () => void;
}

export default function BadgesGallery({ user, onBack }: BadgesGalleryProps) {
  const [selectedBadge, setSelectedBadge] = useState<BadgeDetail | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "starter" | "scoring" | "milestone" | "donation">("all");

  const unlockedBadges = user?.badgeIds || [];

  const filteredBadges = BADGES_DATABASE.filter(
    (b) => activeFilter === "all" || b.category === activeFilter
  );

  return (
    <div className="glass-card rounded-2xl overflow-hidden p-5 shadow-xl bg-slate-900/40 border border-slate-700/30 flex flex-col gap-5 text-left">
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
          Achievements Room
        </span>
      </div>

      {/* Main Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-display font-medium text-slate-100 flex items-center gap-2">
            <Award className="h-5 w-5 text-emerald-400 animate-pulse" />
            Achievements & Badges Showcase
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-sans">
            Unlocked milestones reflect your tangible atmospheric savings and investments.
          </p>
        </div>

        {/* Progress Tracker */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 flex items-center gap-4">
          <div className="text-left">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Unlocked</span>
            <span className="text-lg font-mono font-bold text-emerald-400">
              {unlockedBadges.length} / {BADGES_DATABASE.length}
            </span>
          </div>
          <div className="w-20 bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${(unlockedBadges.length / BADGES_DATABASE.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-850/60 w-fit">
        {[
          { id: "all", label: "All Badges" },
          { id: "starter", label: "Starter" },
          { id: "scoring", label: "Scoring" },
          { id: "milestone", label: "Milestones" },
          { id: "donation", label: "Offsets" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as any)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition ${
              activeFilter === tab.id
                ? "bg-emerald-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid of Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredBadges.map((badge) => {
          const isUnlocked = unlockedBadges.includes(badge.id);
          return (
            <div
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 flex flex-col justify-between gap-4 relative overflow-hidden group select-none ${
                isUnlocked
                  ? `bg-slate-950/60 border-slate-700/80 hover:border-emerald-500/50 hover:-translate-y-1 ${badge.glowColor}`
                  : "bg-slate-950/20 border-slate-850 opacity-60 hover:opacity-85 hover:border-slate-800"
              }`}
            >
              {/* Radial overlay for unlocked glow */}
              {isUnlocked && (
                <div className="absolute -right-8 -top-8 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-all" />
              )}

              <div className="flex items-start justify-between gap-3">
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center border transition-transform duration-500 group-hover:scale-105 ${
                  isUnlocked ? badge.iconColor : "text-slate-600 bg-slate-900 border-slate-800"
                }`}>
                  {isUnlocked ? (
                    <Award className="h-5 w-5" />
                  ) : (
                    <Lock className="h-4.5 w-4.5" />
                  )}
                </div>

                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                  isUnlocked
                    ? "bg-emerald-950/50 text-emerald-400 border-emerald-500/20"
                    : "bg-slate-900 text-slate-500 border-slate-800"
                }`}>
                  {isUnlocked ? "Unlocked" : "Locked"}
                </span>
              </div>

              <div>
                <h4 className={`text-sm font-display font-medium leading-snug ${
                  isUnlocked ? "text-slate-100" : "text-slate-500"
                }`}>
                  {badge.name}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 font-sans leading-relaxed">
                  {badge.description}
                </p>
              </div>

              <div className="border-t border-slate-850/60 pt-2.5 flex justify-between items-center text-[10px] font-mono text-slate-500">
                <span>Value: {badge.pointsValue} GP</span>
                {isUnlocked && (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Badge Details Dialog Overlay */}
      {selectedBadge && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[1000] animate-fade-in"
          onClick={() => setSelectedBadge(null)}
        >
          <div 
            className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full shadow-2xl relative flex flex-col gap-4 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start gap-4">
              <div className={`h-14 w-14 rounded-2xl flex items-center justify-center border ${
                unlockedBadges.includes(selectedBadge.id) ? selectedBadge.iconColor : "text-slate-650 bg-slate-950 border-slate-850"
              }`}>
                {unlockedBadges.includes(selectedBadge.id) ? (
                  <Award className="h-7 w-7 animate-bounce" style={{ animationDuration: "3s" }} />
                ) : (
                  <Lock className="h-6 w-6" />
                )}
              </div>
              
              <button 
                onClick={() => setSelectedBadge(null)}
                className="text-slate-400 hover:text-white text-[11px] font-mono px-2 py-0.5 rounded border border-slate-850 hover:border-slate-700 cursor-pointer transition"
              >
                Close
              </button>
            </div>

            <div>
              <span className="text-[9px] font-mono text-slate-550 uppercase tracking-widest block">
                {selectedBadge.category} Achievement
              </span>
              <h3 className="text-base font-display font-medium text-slate-100 mt-1">
                {selectedBadge.name}
              </h3>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 text-xs font-sans text-slate-300 leading-relaxed">
              <span className="text-[10px] font-mono text-slate-500 block mb-1 uppercase">Objective</span>
              {selectedBadge.description}
            </div>

            <div className="text-xs font-sans leading-relaxed text-slate-400 italic bg-emerald-950/5 p-3 rounded-xl border border-emerald-950/20">
              <span className="text-[10px] font-mono text-emerald-400 not-italic block mb-1 uppercase font-bold tracking-wider">
                🌌 Badge Lore
              </span>
              "{selectedBadge.lore}"
            </div>

            <div className="flex justify-between items-center text-xs font-mono pt-2 border-t border-slate-800">
              <span className="text-slate-500">Reward: {selectedBadge.pointsValue} GreenPoints</span>
              <span className={`px-2 py-0.5 rounded border font-semibold ${
                unlockedBadges.includes(selectedBadge.id)
                  ? "bg-emerald-950/60 border-emerald-500/20 text-emerald-300"
                  : "bg-slate-950 border-slate-850 text-slate-500"
              }`}>
                {unlockedBadges.includes(selectedBadge.id) ? "Earned" : "Locked"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
