import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, MessageSquare, AlertCircle, RefreshCw, HelpCircle, Trees } from "lucide-react";
import { ChatMessage } from "../types";

export default function PulseAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "wel-1",
      sender: "assistant",
      text: "Hi there! I'm Pulse, your eco-companion. Let's figure out how we can keep the planet clean and healthy together. Ask me any environmental or custom calculator questions!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputVal, setInputVal] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [talking, setTalking] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll down
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async () => {
    if (!inputVal.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: "msg-" + Math.random().toString(36).substring(2, 9),
      sender: "user",
      text: inputVal.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal("");
    setLoading(true);
    setTalking(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.text,
          history: messages.map(m => ({
            role: m.sender === "user" ? "user" : "model",
            parts: [{ text: m.text }]
          }))
        })
      });

      if (!response.ok) throw new Error("Server communication issue");
      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: "msg-" + Math.random().toString(36).substring(2, 9),
        sender: "assistant",
        text: data.text || "I apologize, but my environmental signal is slightly clouded right now! Try again shortly.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: "err-1",
          sender: "assistant",
          text: "My green cloud is slightly offline. Unplugging high-grid appliances and clearing local queues usually helps!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
      // Wait a few seconds before stopping talking visualization to mimic natural voice output
      setTimeout(() => {
        setTalking(false);
      }, 1500);
    }
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-[520px] shadow-xl bg-slate-900/40 relative border border-slate-700/35">
      {/* Assistant Header */}
      <div className="p-4 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Animated SVG Talking Face */}
          <div className="relative h-11 w-11 bg-emerald-950/50 rounded-full border border-emerald-500/30 flex items-center justify-center overflow-hidden">
            <svg
              viewBox="0 0 100 100"
              className={`h-9 w-9 transition-transform duration-300 ${talking ? "scale-105" : ""}`}
            >
              {/* Outer core circle glow */}
              {talking && (
                <circle cx="50" cy="50" r="46" fill="none" stroke="#10b981" strokeWidth="2" className="animate-ping" style={{ transformOrigin: "center" }} />
              )}
              
              {/* Avatar face base */}
              <circle cx="50" cy="50" r="40" fill="#022c22" stroke="#10b981" strokeWidth="2.5" />
              
              {/* Intelligent eyes */}
              <circle cx="34" cy="42" r="4" fill="#34d399" />
              <circle cx="66" cy="42" r="4" fill="#34d399" />
              <line x1="30" y1="36" x2="38" y2="36" stroke="#059669" strokeWidth="2" />
              <line x1="62" y1="36" x2="70" y2="36" stroke="#059669" strokeWidth="2" />

              {/* Dynamic talking mouth shape */}
              {talking ? (
                // Elliptical Talking dynamic waveform path
                <ellipse cx="50" cy="62" rx="14" ry="7" fill="none" stroke="#34d399" strokeWidth="3" className="animate-pulse" />
              ) : (
                // Beautiful happy smile
                <path d="M 38 58 Q 50 68 62 58" fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round" />
              )}

              {/* Dynamic communication signals */}
              <circle cx="50" cy="18" r="2" fill="#10b981" className="animate-bounce" />
            </svg>
            
            {/* Simple talking status helper dot */}
            <span className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-slate-900 ${talking ? "bg-emerald-400 animate-pulse" : "bg-teal-600"}`} />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-display font-medium text-sm text-slate-100">Pulse Eco Agent</h3>
              <Sparkles className="h-3 w-3 text-emerald-400 animate-pulse" />
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">
              {talking ? "speaking..." : loading ? "formulating reply..." : "ready to guide"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <span className="bg-emerald-950/55 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] px-2.5 py-0.5 rounded-full">
            GEMINI ENGINE
          </span>
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/20 bg-grid-white scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} items-end gap-2.5`}
          >
            {msg.sender === "assistant" && (
              <div className="h-6 w-6 rounded-full bg-slate-900 border border-slate-700 text-[10px] flex items-center justify-center text-teal-400 shrink-0 font-display">
                P
              </div>
            )}
            
            <div className="flex flex-col gap-1 max-w-[80%]">
              <div
                className={`p-3.5 rounded-2xl text-xs font-sans leading-relaxed tracking-wider border shadow-md transition-all ${
                  msg.sender === "user"
                    ? "bg-emerald-600 text-white border-emerald-500 rounded-br-none"
                    : "bg-slate-900/90 text-slate-200 border-slate-800 rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
              <span className={`text-[9px] text-slate-500 font-mono ${msg.sender === "user" ? "self-end" : "self-start"}`}>
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start items-center gap-2.5">
            <div className="h-6 w-6 rounded-full bg-slate-900 border border-slate-700 text-[10px] flex items-center justify-center text-teal-400 shrink-0 select-none animate-spin">
              P
            </div>
            <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-2xl rounded-bl-none flex items-center gap-1 text-slate-400">
              <span className="h-2 w-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="h-2 w-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="h-2 w-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Suggested prompts line */}
      <div className="px-4 py-2 bg-slate-950/40 border-t border-slate-800/50 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
        <button
          onClick={() => setInputVal("Explain carbon footprint to an 8 year old")}
          className="text-[10px] bg-slate-900/80 hover:bg-slate-850 text-emerald-300 border border-emerald-500/10 hover:border-emerald-500/30 px-3 py-1.5 rounded-full transition"
        >
          🎓 Teach kid footprint
        </button>
        <button
          onClick={() => setInputVal("How to save 100kg CO2 at home?")}
          className="text-[10px] bg-slate-900/80 hover:bg-slate-850 text-emerald-300 border border-emerald-500/10 hover:border-emerald-500/30 px-3 py-1.5 rounded-full transition"
        >
          💡 Eco hacks
        </button>
        <button
          onClick={() => setInputVal("Why does vegetarian diet have lower carbon?")}
          className="text-[10px] bg-slate-900/80 hover:bg-slate-850 text-emerald-300 border border-emerald-500/10 hover:border-emerald-500/30 px-3 py-1.5 rounded-full transition"
        >
          🥗 Veggie impacts
        </button>
      </div>

      {/* Form Input Footer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3.5 bg-slate-950/80 border-t border-slate-800 flex gap-2"
      >
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Ask Pulse (e.g. smart thermostats, offset offsets...)"
          className="flex-1 bg-slate-900 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none transition font-sans"
        />
        <button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-500 text-white p-2.5 rounded-xl border border-emerald-400/20 active:scale-95 transition-all flex items-center justify-center shrink-0 cursor-pointer"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
