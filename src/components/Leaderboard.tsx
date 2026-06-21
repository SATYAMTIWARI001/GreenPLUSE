import { useState, useEffect } from "react";
import { Trophy, Award, Search, Users, ShieldAlert, Zap, School, MapPin, ArrowLeft } from "lucide-react";
import { LeaderboardEntry } from "../types";

interface LeaderboardProps {
  onBack: () => void;
}

export default function Leaderboard({ onBack }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'user' | 'college' | 'city'>('user');
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [fetching, setFetching] = useState<boolean>(true);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch("/api/community/leaderboard");
      if (res.ok) {
        const data = await res.ok ? await res.json() : [];
        setEntries(data);
      }
    } catch (e) {
      console.error("Could not coordinate leaderboard fetch, defaulting to preseeded entries", e);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const getRankBadgeAndColor = (idx: number) => {
    if (idx === 0) return { emoji: "🥇", color: "text-amber-400 bg-amber-955/30 border-amber-500/25" };
    if (idx === 1) return { emoji: "🥈", color: "text-slate-300 bg-slate-800/30 border-slate-500/20" };
    if (idx === 2) return { emoji: "🥉", color: "text-amber-600 bg-amber-950/30 border-amber-800/20" };
    return { emoji: "⭐", color: "text-slate-500 bg-slate-900 border-transparent" };
  };

  const filteredEntries = entries
    .filter(e => e.type === activeTab)
    .filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => b.points - a.points);

  return (
    <div className="glass-card rounded-2xl overflow-hidden p-5 shadow-xl bg-slate-900/40 border border-slate-700/30 flex flex-col gap-4">
      {/* Consistent Back Button UI across nested pages */}
      <div className="mb-1">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-950/40 hover:bg-slate-900 text-slate-300 hover:text-white cursor-pointer transition active:scale-95"
        >
          <ArrowLeft className="h-4 w-4 text-emerald-500" />
          Back to Home Landing
        </button>
      </div>

      {/* Header telemetry */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-display font-medium text-slate-100 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            Global Sustainability League
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">Participate with communities, colleges, and cities around the globe.</p>
        </div>

        {/* Tab Filters */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('user')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer transition ${
              activeTab === 'user' ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            Eco Heroes
          </button>
          <button
            onClick={() => setActiveTab('college')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer transition ${
              activeTab === 'college' ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <School className="h-3.5 w-3.5" />
            Colleges
          </button>
          <button
            onClick={() => setActiveTab('city')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer transition ${
              activeTab === 'city' ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <MapPin className="h-3.5 w-3.5" />
            Cities
          </button>
        </div>
      </div>

      {/* Search Filter Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
        <label htmlFor="leaderboard-search-input" className="sr-only">
          Search {activeTab === 'user' ? "eco heroes" : activeTab === 'college' ? "institutes" : "municipal centers"}
        </label>
        <input
          id="leaderboard-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search ${activeTab === 'user' ? "eco heroes" : activeTab === 'college' ? "institutes" : "municipal centers"}...`}
          className="w-full bg-slate-950 border border-slate-800/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/55 transition font-sans"
        />
      </div>

      {/* Leaderboard Table Entries */}
      <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {fetching ? (
          <div className="text-center py-10 font-mono text-xs text-slate-400 animate-pulse">
            Connecting and arranging live league parameters...
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-10">
            <span className="text-xs text-slate-500 font-sans">No matching entries found. Invite more people to claim slots!</span>
          </div>
        ) : (
          filteredEntries.map((entry, index) => {
            const badgeMeta = getRankBadgeAndColor(index);
            return (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 hover:bg-slate-950/80 border border-slate-800/50 hover:border-slate-700/60 hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  {/* Rank Symbol */}
                  <span className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold border ${badgeMeta.color}`}>
                    {index <= 2 ? badgeMeta.emoji : `${index + 1}`}
                  </span>

                  {/* Avatar or Icon representation */}
                  {entry.type === 'user' ? (
                    <img
                      src={entry.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.name}`}
                      alt={entry.name}
                      className="h-9 w-9 rounded-full bg-slate-900 border border-slate-700/50 object-cover"
                    />
                  ) : entry.type === 'college' ? (
                    <div className="h-9 w-9 rounded-full bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <School className="h-4 w-4" />
                    </div>
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-teal-950/40 border border-teal-500/20 flex items-center justify-center text-teal-400">
                      <MapPin className="h-4 w-4" />
                    </div>
                  )}

                  {/* Identification */}
                  <div>
                    <h4 className="text-xs font-display font-medium text-slate-200">{entry.name}</h4>
                    <span className="text-[10px] text-slate-400 font-sans block mt-0.5">
                      {entry.type === 'user' ? entry.ecoRank : `${entry.carbonScore} kg carbon offset`}
                    </span>
                  </div>
                </div>

                {/* Score indicators */}
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-slate-100">{entry.points.toLocaleString()} PTS</div>
                  <span className="text-[9px] font-mono text-emerald-400 tracking-wide uppercase">
                    🌳 {entry.type === 'user' ? `${entry.carbonScore} kg/day` : "Active Eco Core"}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Gamified summary note */}
      <div className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl flex items-start gap-2 text-[10px] leading-relaxed text-slate-400">
        <Award className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
        <p className="font-sans">
          Eco points are allocated instantly when you calculate your daily footprint, earn custom score grades like <b>A+ or B</b>, or complete green challenge objectives.
        </p>
      </div>
    </div>
  );
}
