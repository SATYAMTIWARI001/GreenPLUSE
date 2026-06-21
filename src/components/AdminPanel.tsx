import { useState, useEffect, FormEvent } from "react";
import { 
  BarChart3, Plus, Bell, RefreshCw, Star, Trash2, ArrowLeft,
  Settings, UserCheck, ShieldAlert, CheckCircle2 
} from "lucide-react";
import { SystemAnalytics, Announcement, LeaderboardEntry } from "../types";

interface AdminPanelProps {
  onBack: () => void;
  showToast?: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function AdminPanel({ onBack, showToast }: AdminPanelProps) {
  const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Announcement Form
  const [annTitle, setAnnTitle] = useState<string>("");
  const [annContent, setAnnContent] = useState<string>("");
  const [annImportant, setAnnImportant] = useState<boolean>(false);

  // Challenge Form
  const [chalTitle, setChalTitle] = useState<string>("");
  const [chalDesc, setChalDesc] = useState<string>("");
  const [chalCategory, setChalCategory] = useState<string>("transport");
  const [chalPoints, setChalPoints] = useState<number>(30);

  // Leaderboard parameters edit
  const [lbEntries, setLbEntries] = useState<LeaderboardEntry[]>([]);
  const [editingEntryId, setEditingEntryId] = useState<string>("");
  const [newScore, setNewScore] = useState<string>("");
  const [newPoints, setNewPoints] = useState<string>("");

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/analytics");
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }

      const lbRes = await fetch("/api/community/leaderboard");
      if (lbRes.ok) {
        const lbData = await lbRes.json();
        setLbEntries(lbData);
      }
    } catch (e) {
      console.error("Could not load administrative analytics", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleAddAnnouncement = async (e: FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent) return;

    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: annTitle,
          content: annContent,
          important: annImportant
        })
      });

      if (res.ok) {
        if (showToast) {
          showToast("Broadcast announcement launched successfully!", "success");
        } else {
          alert("Broadcast announcement launched successfully!");
        }
        setAnnTitle("");
        setAnnContent("");
        setAnnImportant(false);
        fetchAdminData();
      }
    } catch (err) {
      console.error("Failed to post system announcement", err);
    }
  };

  const handleAddChallenge = async (e: FormEvent) => {
    e.preventDefault();
    if (!chalTitle || !chalDesc) return;

    try {
      const res = await fetch("/api/admin/challenges/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: chalTitle,
          description: chalDesc,
          category: chalCategory,
          points: chalPoints
        })
      });

      if (res.ok) {
        if (showToast) {
          showToast("New Eco challenge incorporated into daily feed!", "success");
        } else {
          alert("New Eco challenge incorporated into daily feed!");
        }
        setChalTitle("");
        setChalDesc("");
        setChalPoints(30);
        fetchAdminData();
      }
    } catch (err) {
      console.error("Critical challenge placement issue", err);
    }
  };

  const handleEditLeaderboard = async (id: string) => {
    if (!newScore && !newPoints) return;

    try {
      const res = await fetch("/api/admin/leaderboard/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          carbonScore: newScore ? parseFloat(newScore) : undefined,
          points: newPoints ? parseInt(newPoints, 10) : undefined
        })
      });

      if (res.ok) {
        if (showToast) {
          showToast("Leaderboard parameters synchronized successfully.", "success");
        } else {
          alert("Leaderboard parameters synchronized successfully.");
        }
        setEditingEntryId("");
        setNewScore("");
        setNewPoints("");
        fetchAdminData();
      }
    } catch (err) {
      console.error("Leaderboard adjustments failed", err);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Consistent Back Button UI across nested pages */}
      <div className="flex justify-between items-center bg-slate-900/20 p-3 rounded-2xl border border-slate-850">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-950/40 hover:bg-slate-900 text-slate-300 hover:text-white cursor-pointer transition active:scale-95"
        >
          <ArrowLeft className="h-4 w-4 text-emerald-500" />
          Back to Home Landing
        </button>
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest px-2 py-0.5 border border-slate-800 rounded-full">
          Admin Portal
        </span>
      </div>

      <div className="pb-4 border-b border-slate-800 flex justify-between items-center">
        <div>
          <span className="text-[10px] font-mono text-rose-500 font-bold tracking-widest uppercase">
            STRICT SECURITY CONTROLS
          </span>
          <h2 className="text-xl font-display font-medium text-slate-100 flex items-center gap-2 mt-0.5">
            <Settings className="h-5.5 w-5.5 text-rose-400" />
            GreenPulse System Admin Panel
          </h2>
        </div>
        
        <button
          onClick={fetchAdminData}
          className="p-2 bg-slate-950/60 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg border border-slate-800/80 active:scale-95 transition cursor-pointer"
        >
          <RefreshCw className="h-4 w-4 animate-spin-hover" />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 font-mono text-xs text-slate-500 animate-pulse">
          Accessing core systems and pulling system analytics...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main system statistics column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-850 flex flex-col gap-1">
                <span className="text-[9px] text-slate-500 font-mono tracking-wider uppercase">Active Climators</span>
                <span className="text-2xl font-display font-bold text-white">{analytics?.totalUsers} Users</span>
              </div>
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-850 flex flex-col gap-1">
                <span className="text-[9px] text-slate-500 font-mono tracking-wider uppercase">Average Carbon</span>
                <span className="text-2xl font-display font-bold text-emerald-400">{analytics?.avgCarbonScore} kg</span>
              </div>
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-850 flex flex-col gap-1">
                <span className="text-[9px] text-slate-500 font-mono tracking-wider uppercase">Tasks completed</span>
                <span className="text-2xl font-display font-bold text-cyan-400">{analytics?.totalChallengesCompleted} times</span>
              </div>
            </div>

            {/* Manage Leaderboard widget */}
            <div className="glass-card p-5 rounded-2xl bg-slate-900/40 border border-slate-700/30">
              <h3 className="text-sm font-display font-medium text-slate-100 flex items-center gap-2 mb-3 pb-2 border-b border-slate-850">
                <BarChart3 className="h-4.5 w-4.5 text-cyan-400" />
                Durable Leaderboard Synchronizer
              </h3>

              <div className="flex flex-col gap-2 max-h-[290px] overflow-y-auto">
                {lbEntries.map((entry) => (
                  <div key={entry.id} className="p-3 bg-slate-950/50 rounded-xl border border-slate-850/50 flex flex-col gap-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-200">{entry.name} ({entry.type})</span>
                      <button
                        onClick={() => setEditingEntryId(editingEntryId === entry.id ? "" : entry.id)}
                        className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
                      >
                        {editingEntryId === entry.id ? "Cancel" : "Edit values"}
                      </button>
                    </div>

                    <div className="flex items-center gap-4 text-[10px] text-slate-405 font-mono">
                      <span>Points: {entry.points.toLocaleString()} PTS</span>
                      <span>Carbon: {entry.carbonScore} kg/day</span>
                    </div>

                    {editingEntryId === entry.id && (
                      <div className="p-2 bg-slate-900 rounded-lg flex gap-2 items-center mt-1 animate-pulse">
                        <input
                          type="number"
                          placeholder="Score kg"
                          aria-label="New carbon score"
                          value={newScore}
                          onChange={(e) => setNewScore(e.target.value)}
                          className="bg-slate-950 text-[10px] p-1.5 rounded border border-slate-800 text-white w-20"
                        />
                        <input
                          type="number"
                          placeholder="Points"
                          aria-label="New eco points"
                          value={newPoints}
                          onChange={(e) => setNewPoints(e.target.value)}
                          className="bg-slate-950 text-[10px] p-1.5 rounded border border-slate-800 text-white w-20"
                        />
                        <button
                          type="button"
                          onClick={() => handleEditLeaderboard(entry.id)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[10px] px-2.5 py-1.5 rounded cursor-pointer"
                        >
                          Sync
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form Actions Column (Announcements & Challenges creation) */}
          <div className="flex flex-col gap-6">
            {/* Create Announcement */}
            <div className="glass-card p-4 rounded-2xl bg-slate-900/40 border border-slate-700/30">
              <h3 className="text-sm font-display font-medium text-slate-100 flex items-center gap-1.5 mb-3 border-b border-slate-850 pb-2">
                <Bell className="h-4.5 w-4.5 text-yellow-450 animate-bounce" style={{ animationDuration: "3s" }} />
                Broadcast Announcement
              </h3>
              
              <form onSubmit={handleAddAnnouncement} className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="System Headline title"
                  aria-label="System Headline title"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="bg-slate-950 border border-slate-850/80 rounded-lg p-2 text-xs focus:outline-none focus:border-emerald-500 w-full text-white"
                  required
                />
                <textarea
                  placeholder="Body explanation context..."
                  aria-label="Body explanation context"
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  className="bg-slate-950 border border-slate-850/80 rounded-lg p-2 text-xs focus:outline-none focus:border-emerald-500 w-full text-white h-16 resize-none"
                  required
                />
                
                <label className="flex items-center gap-2 text-[10px] font-mono text-slate-400 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={annImportant}
                    onChange={(e) => setAnnImportant(e.target.checked)}
                    className="accent-rose-500"
                  />
                  Mark as High-Priority important broadcast
                </label>

                <button
                  type="submit"
                  className="w-full bg-rose-650 hover:bg-rose-600 text-white font-display font-medium text-xs py-2 rounded-lg cursor-pointer text-center"
                >
                  📣 Broadcast Announcement
                </button>
              </form>
            </div>

            {/* Create challenge */}
            <div className="glass-card p-4 rounded-2xl bg-slate-900/40 border border-slate-700/30">
              <h3 className="text-sm font-display font-medium text-slate-100 flex items-center gap-1.5 mb-3 border-b border-slate-850 pb-2">
                <Plus className="h-4.5 w-4.5 text-cyan-400" />
                Incorporate Daily Eco-Task
              </h3>

              <form onSubmit={handleAddChallenge} className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Eco challenge title"
                  aria-label="Eco challenge title"
                  value={chalTitle}
                  onChange={(e) => setChalTitle(e.target.value)}
                  className="bg-slate-950 border border-slate-850/80 rounded-lg p-2 text-xs focus:outline-none focus:border-emerald-500 w-full text-white"
                  required
                />
                <input
                  type="text"
                  placeholder="Short brief description"
                  aria-label="Short brief description"
                  value={chalDesc}
                  onChange={(e) => setChalDesc(e.target.value)}
                  className="bg-slate-950 border border-slate-850/80 rounded-lg p-2 text-xs focus:outline-none focus:border-emerald-500 w-full text-white"
                  required
                />

                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={chalCategory}
                    aria-label="Eco challenge category"
                    onChange={(e) => setChalCategory(e.target.value)}
                    className="bg-slate-950 text-xs border border-slate-850 rounded-lg p-2 focus:outline-none text-white"
                  >
                    <option value="transport">Transports</option>
                    <option value="energy">Electricity</option>
                    <option value="food">Diet Plates</option>
                    <option value="waste">Sorting Waste</option>
                  </select>

                  <input
                    type="number"
                    placeholder="Points (e.g. 50)"
                    aria-label="Points count"
                    value={chalPoints}
                    onChange={(e) => setChalPoints(parseInt(e.target.value, 10))}
                    className="bg-slate-950 border border-slate-850/80 rounded-lg p-2 text-xs focus:outline-none focus:border-emerald-500 text-white"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-cyan-650 hover:bg-cyan-600 border border-cyan-550/20 text-white font-display font-medium text-xs py-2 rounded-lg cursor-pointer text-center"
                >
                  🚀 Inject New Bio-Challenge
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
