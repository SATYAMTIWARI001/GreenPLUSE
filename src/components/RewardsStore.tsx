import { useState } from "react";
import { Award, Trees, ShieldCheck, Zap, Coins, Sparkles, Check, ArrowLeft, Download, AlertTriangle } from "lucide-react";
import { User } from "../types";

interface RewardsStoreProps {
  user: User | null;
  onPointsRedeemed: (deductedUser: User) => void;
  onBack: () => void;
  showToast?: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

interface RewardItem {
  id: string;
  title: string;
  description: string;
  cost: number;
  icon: string;
  location: string;
  badgeId: string;
  badgeName: string;
}

export default function RewardsStore({ user, onPointsRedeemed, onBack, showToast }: RewardsStoreProps) {
  const [activeTab, setActiveTab] = useState<'store' | 'certificates'>('store');
  const [redeemedCertificates, setRedeemedCertificates] = useState<any[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const availableRewards: RewardItem[] = [
    {
      id: "rew-1",
      title: "Varanasi Reforestation Sapling",
      description: "Plants and matures a high-absorption native peepal sapling along the Varanasi Green Corridor.",
      cost: 500,
      icon: "🌳",
      location: "Varanasi Reforestation Sector 4A (25.321°N, 83.012°E)",
      badgeId: "badge-reforest-1",
      badgeName: "Varanasi Reforestation Guardian"
    },
    {
      id: "rew-2",
      title: "Bihar Solar Water Filtration Block",
      description: "Directs clean drinking water to high-fluoride regions utilizing clean solar power energy grids.",
      cost: 800,
      icon: "☀️",
      location: "Bihar Rural Filter Cluster B2 (25.096°N, 85.313°E)",
      badgeId: "badge-solar-water",
      badgeName: "Solar Hydro Specialist"
    },
    {
      id: "rew-3",
      title: "Varanasi Clay-Pot Handmade Collective Unit",
      description: "Supplies reusable traditional clay-pots to local vegetable markets to combat single-use plastics.",
      cost: 400,
      icon: "🏺",
      location: "Clay Guild Varanasi (25.267°N, 82.987°E)",
      badgeId: "badge-clay",
      badgeName: "Traditional Artisan Ally"
    },
    {
      id: "rew-4",
      title: "Coppice Agroforestry Corridor Unit",
      description: "Supports local farmers to integrate companion trees alongside grain crops, preventing soil erosion.",
      cost: 1200,
      icon: "🌾",
      location: "Uttar Pradesh Agro-Union Z12 (26.846°N, 80.946°E)",
      badgeId: "badge-agro",
      badgeName: "Agroforestry Champion"
    }
  ];

  const handleRedeemReward = (reward: RewardItem) => {
    if (!user) {
      if (showToast) {
        showToast("No active session identity found. Please register or sign in.", "error");
      } else {
        alert("No active session identity found. Reinitialize your guest identity.");
      }
      return;
    }

    if (user.points < reward.cost) {
      // User does not have enough points. Give a friendly warning.
      if (showToast) {
        showToast(`Need ${reward.cost} pts. You currently hold ${user.points} pts.`, "error");
      } else {
        alert(`Earn more GreenPoints first. You have ${user.points} pts, but this goal costs ${reward.cost} pts.`);
      }
      return;
    }

    // Deduct points and enrich user details
    const currentBadges = user.badgeIds || [];
    const updatedUser: User = {
      ...user,
      points: user.points - reward.cost,
      // Accumulate new badge if not already owned
      badgeIds: currentBadges.includes(reward.badgeId) ? currentBadges : [...currentBadges, reward.badgeId]
    };

    // Callback to update parent state (and write to localStorage)
    onPointsRedeemed(updatedUser);

    // Create a new certificate receipt
    const cert = {
      id: "cert-" + Math.floor(Math.random() * 89999 + 10000),
      title: reward.title,
      description: reward.description,
      redeemedAt: new Date().toLocaleDateString(),
      cost: reward.cost,
      location: reward.location,
      badgeName: reward.badgeName,
      serial: "GP-CERT-" + Math.random().toString(36).substring(2, 7).toUpperCase()
    };

    setRedeemedCertificates(prev => [cert, ...prev]);
    
    if (showToast) {
      showToast(`Asset redeemed! "${reward.title}" registered to your profile.`, "success");
    }
    
    setSuccessMsg(`Redeemed successfully! "${reward.title}" certificate is active.`);
    
    setTimeout(() => {
      setSuccessMsg(null);
    }, 4000);
  };

  return (
    <div className="glass-card rounded-2xl p-5 shadow-xl bg-slate-900/40 border border-slate-700/35 flex flex-col gap-5 text-white anime-fade-in" id="rewards-store-panel">
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

      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-3 gap-3">
        <div>
          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/45 px-3 py-0.5 border border-emerald-800/35 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
            <Sparkles className="h-2.5 w-2.5" />
            Verification Market
          </span>
          <h2 className="text-lg font-display font-semibold text-slate-100 mt-1 flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            Eco Rewards Store
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Convert accrued GreenPoints directly to transparent environmental initiatives.
          </p>
        </div>

        {/* User live points display */}
        <div className="flex items-center gap-2.5 bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl shrink-0">
          <Coins className="h-4.5 w-4.5 text-amber-400 animate-pulse" />
          <div className="text-left">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono block">YOUR ACCRUED COINS</span>
            <span className="text-sm font-mono font-bold text-emerald-400">
              {user?.points || 0} GreenPoints
            </span>
          </div>
        </div>
      </div>

      {/* Internal Nav filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('store')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
            activeTab === 'store'
              ? "bg-slate-950 border border-slate-850 text-emerald-400"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Available Investments
        </button>
        <button
          onClick={() => setActiveTab('certificates')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 ${
            activeTab === 'certificates'
              ? "bg-slate-950 border border-slate-850 text-emerald-400"
              : "text-slate-400 hover:text-white"
          }`}
        >
          My Certificates
          {redeemedCertificates.length > 0 && (
            <span className="bg-emerald-600 text-white font-mono text-[9px] px-1.5 py-0.2 rounded-full font-bold">
              {redeemedCertificates.length}
            </span>
          )}
        </button>
      </div>

      {/* Success Banner Alert */}
      {successMsg && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-bounce">
          <ShieldCheck className="h-4.5 w-4.5 text-emerald-400 animate-pulse" />
          <span>{successMsg} Your certificate is active inside <b>My Certificates</b>.</span>
        </div>
      )}

      {/* Body Views Switcher / routing */}
      {activeTab === 'store' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableRewards.map((reward) => {
            const isAffordable = user ? user.points >= reward.cost : false;
            return (
              <div
                key={reward.id}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between hover:border-slate-700/60 transition group relative overflow-hidden"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-2xl">{reward.icon}</span>
                    <span className="text-xs font-mono font-bold text-amber-500 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/10">
                      {reward.cost} pts
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-100 tracking-wide mt-1 group-hover:text-emerald-400 transition-colors">
                    {reward.title}
                  </h3>
                  <p className="text-xs text-slate-450 font-sans leading-normal">
                    {reward.description}
                  </p>
                </div>

                {/* Geo location footprint description */}
                <span className="text-[9px] text-slate-500 bg-slate-900/60 p-1.5 rounded font-mono border border-slate-850/45 block mt-4 select-all text-center leading-normal">
                  📌 Location coordinate: {reward.location}
                </span>

                <button
                  onClick={() => handleRedeemReward(reward)}
                  className={`w-full mt-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition ${
                    isAffordable
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                      : "bg-slate-900 text-slate-500 border border-slate-850/70 cursor-not-allowed"
                  }`}
                >
                  {isAffordable ? "Redeem Investment Certificate" : `Insufficient Points (Need ${reward.cost} pts)`}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        /* Certificates tab viewport */
        <div className="flex flex-col gap-4">
          {redeemedCertificates.length === 0 ? (
            <div className="text-center py-12 bg-slate-950/30 rounded-xl border border-slate-800">
              <AlertTriangle className="h-8 w-8 text-slate-600 mx-auto mb-2 animate-bounce" />
              <p className="text-xs text-slate-450 font-sans">No ecological investments redeemed yet.</p>
              <p className="text-[10px] text-slate-500 font-mono mt-1">Acquire points by checking off Daily Tasks and execute transactions.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {redeemedCertificates.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-slate-950 p-4 rounded-xl border-t-4 border-t-emerald-500 border-x border-b border-slate-800 flex flex-col justify-between font-sans leading-relaxed relative overflow-hidden"
                >
                  {/* Decorative background certification crest */}
                  <div className="absolute -right-6 -bottom-6 text-emerald-500/5 text-8xl pointer-events-none select-none">
                    📜
                  </div>

                  <div className="flex flex-col gap-2 relative z-10">
                    <div className="flex justify-between items-center bg-slate-900 p-1 rounded">
                      <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">Serial: {cert.serial}</span>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                        <Check className="h-3 w-3" /> VERIFIED
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-100 mt-1">{cert.title}</h3>
                    <p className="text-[10px] text-slate-450 leading-relaxed font-sans mt-0.5">
                      We hereby certify that **{user?.name || "Eco Warrior"}** successfully financed and offset emissions equivalent to {cert.cost} points on {cert.redeemedAt} through digital tree planting assets.
                    </p>

                    <div className="bg-slate-900/60 p-2 rounded text-[9px] font-mono text-slate-400 border border-slate-850 tracking-wide mt-2">
                      <span className="block text-[8px] text-slate-500 uppercase">Geographical allocation sector:</span>
                      {cert.location}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4 border-t border-slate-900 pt-2.5">
                    <span className="text-[10px] font-mono text-cyan-400 font-semibold uppercase">Badge Unlocked: {cert.badgeName}</span>
                    <button
                      onClick={() => {
                        if (showToast) {
                          showToast("Digital copy saved locally!", "success");
                        } else {
                          alert("Digital copy saved locally!");
                        }
                      }}
                      className="text-[9px] text-slate-400 hover:text-white flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Download className="h-3 w-3 text-cyan-400" />
                      Save Receipt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
