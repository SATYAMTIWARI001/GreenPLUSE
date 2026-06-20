import { useState, FormEvent } from "react";
import { Mail, Lock, User as UserIcon, RefreshCw, X, ShieldCheck, HelpCircle, Sparkles } from "lucide-react";
import { User } from "../types";

interface AuthModalProps {
  onAuthSuccess: (user: User) => void;
  onClose: () => void;
}

export default function AuthModal({ onAuthSuccess, onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [forgotMode, setForgotMode] = useState<boolean>(false);
  
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [gender, setGender] = useState<string>("Not Specified");

  const [loading, setLoading] = useState<boolean>(false);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorInfo(null);
    setSuccessInfo(null);
    setLoading(true);

    if (forgotMode) {
      try {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (res.ok) {
          setSuccessInfo(data.message);
        } else {
          setErrorInfo(data.error);
        }
      } catch (err) {
        setErrorInfo("Network recovery sequence failed. Try again.");
      } finally {
        setLoading(false);
      }
      return;
    }

    const endpoint = isSignUp ? "/api/auth/signup" : "/api/auth/login";
    const payload = isSignUp ? { email, password, name, gender } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        onAuthSuccess(data.user);
        onClose();
      } else {
        setErrorInfo(data.error || "Authentication procedure denied by server.");
      }
    } catch (err) {
      setErrorInfo("Failed to coordinate server authentication handshake.");
    } finally {
      setLoading(false);
    }
  };

  // Simulated live Google OAuth sign-in API
  const handleGoogleSignIn = async () => {
    setErrorInfo(null);
    setLoading(true);
    
    // Choose simulation email based on typical Google developer
    const googleProfile = {
      email: email || "satyam000108@gmail.com",
      name: name || "Satyam Google Admin",
      avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=googleSatyam"
    };

    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(googleProfile)
      });
      const data = await res.json();

      if (res.ok) {
        onAuthSuccess(data.user);
        onClose();
      } else {
        setErrorInfo(data.error);
      }
    } catch (err) {
      setErrorInfo("Google identity pipeline timed out.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[1000] animate-fade-in">
      <div className="glass-card-light dark:glass-card relative max-w-sm w-full p-6 h-auto rounded-3xl shadow-2xl flex flex-col gap-4 border border-slate-700/35 overflow-hidden">
        {/* Absolute glow design particles */}
        <div className="absolute right-0 top-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl" />
        
        {/* Header content and Close control */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-800/20 dark:border-slate-800">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <h3 className="text-sm font-display font-semibold text-slate-900 dark:text-slate-100">
              {forgotMode ? "Account Recovery" : isSignUp ? "Claim Eco Profile" : "Secure Gate Control"}
            </h3>
          </div>
          
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-850/10 dark:hover:bg-slate-800/55 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Dynamic status notifications */}
        {errorInfo && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs text-center font-sans">
            {errorInfo}
          </div>
        )}

        {successInfo && (
          <div className="p-3 rounded-xl bg-emerald-550/10 border border-emerald-500/30 text-emerald-400 text-xs text-center font-semibold font-sans">
            {successInfo}
          </div>
        )}

        {/* Input forms flow */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {isSignUp && !forgotMode && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-mono text-slate-500 dark:text-slate-400">FullName</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="e.g. Satyam Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950/5 dark:bg-slate-950 border border-slate-800/15 dark:border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-mono text-slate-400">Gender Selection</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-slate-950/5 dark:bg-slate-950 border border-slate-800/15 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="Not Specified">Not Specified / Secret</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-mono text-slate-500 dark:text-slate-400">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="email"
                placeholder="eco@greenpulse.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950/5 dark:bg-slate-950 border border-slate-800/15 dark:border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {!forgotMode && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-mono text-slate-500 dark:text-slate-400">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/5 dark:bg-slate-950 border border-slate-800/15 dark:border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-display font-medium text-xs py-2.5 rounded-xl transition duration-200 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : forgotMode ? (
              "Send Account Recovery instructions"
            ) : isSignUp ? (
              "Sign Up & Earn Points"
            ) : (
              "Sign In to Platform"
            )}
          </button>
        </form>

        {/* OAuth integration sector */}
        {!forgotMode && (
          <div className="flex flex-col gap-2 mt-2 border-t border-slate-800/20 dark:border-slate-800 pt-3">
            <span className="text-[9px] text-center font-mono text-slate-500">OR JOIN SECURELY VIA GOOGLE</span>
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800/30 flex items-center justify-center gap-2 py-2 px-4 rounded-xl cursor-pointer text-xs text-white hover:text-emerald-420 font-medium transition"
            >
              <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse" />
              Sign In with Google Simulator
            </button>
          </div>
        )}

        {/* Toggles triggers */}
        <div className="flex flex-col gap-1 text-center justify-center mt-2 text-[10px] text-slate-500">
          {!forgotMode ? (
            <>
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-emerald-500 hover:underline cursor-pointer"
              >
                {isSignUp ? "Already registered? Sign In instead" : "Temporary explorer? Claim your profile!"}
              </button>
              
              {!isSignUp && (
                <button
                  onClick={() => setForgotMode(true)}
                  className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-350 cursor-pointer mt-1"
                >
                  Forgot password? Recover account
                </button>
              )}
            </>
          ) : (
            <button
              onClick={() => setForgotMode(false)}
              className="text-emerald-500 hover:underline cursor-pointer"
            >
              Back to entry screen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
