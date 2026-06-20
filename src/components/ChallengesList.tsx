import { useState, useEffect } from "react";
import { CheckCircle2, Trees, Circle, Zap, ArrowLeft, RefreshCw, Star, Info } from "lucide-react";
import { Challenge, User } from "../types";

interface ChallengesListProps {
  user: User | null;
  onUserUpdate: (updatedUser: User) => void;
  onBack: () => void;
  showToast?: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function ChallengesList({ user, onUserUpdate, onBack, showToast }: ChallengesListProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshes, setRefreshes] = useState<number>(0);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const fetchChallenges = async () => {
    try {
      const res = await fetch("/api/challenges");
      if (res.ok) {
        const data = await res.json();
        setChallenges(data);
      }
    } catch (e) {
      console.error("Failed to fetch daily challenges", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, [refreshes]);

  const handleCompleteChallenge = async (challengeId: string) => {
    if (!user) return; // User must sign in to save challenge progression
    setCompletingId(challengeId);

    try {
      const res = await fetch("/api/challenges/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, challengeId })
      });

      if (res.ok) {
        const data = await res.json();
        onUserUpdate(data.user);
        
        if (showToast) {
          showToast("Challenge completed successfully! points added.", "success");
        }
        
        // Optimistically update challenge completions in the carousel
        setChallenges(prev => prev.map(c => {
          if (c.id === challengeId) {
            return { ...c, completedCount: c.completedCount + 1 };
          }
          return c;
        }));
      } else {
        const err = await res.json();
        if (showToast) {
          showToast(err.error || "Unable to register challenge completion.", "error");
        } else {
          alert(err.error || "Unable to register challenge completion.");
        }
      }
    } catch (e) {
      console.error("Error communicating with challenge completed API", e);
    } finally {
      setCompletingId(null);
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'transport': return "text-cyan-400 bg-cyan-950/40 border-cyan-500/20";
      case 'energy': return "text-yellow-400 bg-yellow-950/40 border-yellow-500/20";
      case 'food': return "text-rose-400 bg-rose-950/40 border-rose-500/20";
      default: return "text-emerald-400 bg-emerald-950/40 border-emerald-500/30";
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 shadow-xl bg-slate-900/40 border border-slate-700/30 flex flex-col gap-4">
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

      {/* Header section with telemetry */}
      <div className="flex justify-between items-center pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-display font-medium text-slate-100 flex items-center gap-2">
            <Trees className="h-5 w-5 text-emerald-400" />
            Daily ecological tasks
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">Earn Eco XP and upgrade your global rank status instantly.</p>
        </div>

        <button
          onClick={() => setRefreshes(r => r + 1)}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 active:scale-95 transition cursor-pointer"
          title="Refresh task list"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {!user && (
        <div className="p-4 bg-yellow-950/20 border border-yellow-500/10 rounded-xl flex items-start gap-3">
          <Info className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            <b>Guest Profile:</b> You are exploring challenges as a temporary visitor. Please sign up or log in to secure points, upgrade rankings, and complete live verification steps!
          </p>
        </div>
      )}

      {/* Challenge Listing */}
      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="text-center py-8 font-mono text-xs text-slate-500 animate-pulse">
            Arranging scientific micro tasks...
          </div>
        ) : (
          challenges.map((challenge) => {
            const isCompleted = user?.completedChallenges.includes(challenge.id);
            const isOngoing = completingId === challenge.id;

            return (
              <div
                key={challenge.id}
                className={`p-4 rounded-xl border transition-all duration-300 flex items-start justify-between gap-3 ${
                  isCompleted
                    ? "bg-emerald-950/15 border-emerald-500/25 shadow-[inset_0_0_12px_rgba(16,185,129,0.05)] opacity-85"
                    : "bg-slate-950/40 border-slate-800/80 hover:border-slate-700/60"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Tap Checkbox button */}
                  <button
                    disabled={isCompleted || isOngoing || !user}
                    onClick={() => handleCompleteChallenge(challenge.id)}
                    className={`shrink-0 mt-1 cursor-pointer transition ${
                      isCompleted 
                        ? "text-emerald-400" 
                        : !user 
                        ? "text-slate-600 pointer-events-none" 
                        : "text-slate-400 hover:text-emerald-400"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 fill-emerald-900/20" />
                    ) : isOngoing ? (
                      <RefreshCw className="h-5 w-5 animate-spin text-emerald-400" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </button>

                  <div>
                    {/* Category pill */}
                    <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold tracking-wider uppercase border ${getCategoryColor(challenge.category)}`}>
                      {challenge.category}
                    </span>

                    <h4 className={`text-sm font-display font-medium mt-2 ${isCompleted ? "text-slate-400 line-through" : "text-slate-100"}`}>
                      {challenge.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 font-sans leading-relaxed">{challenge.description}</p>
                    
                    {/* Community completions ticker */}
                    <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                      <Star className="h-3 w-3 text-amber-500" />
                      {challenge.completedCount} users accomplished this today
                    </div>
                  </div>
                </div>

                {/* Score badge value */}
                <span className={`shrink-0 text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
                  isCompleted 
                    ? "text-emerald-400 bg-emerald-950/40 border-emerald-900/30" 
                    : "text-amber-400 bg-amber-950/40 border-amber-900/30"
                }`}>
                  +{challenge.points} XP
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
