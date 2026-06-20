import React, { useState, useRef } from "react";
import { FileText, Sparkles, Check, AlertCircle, RefreshCw, Upload, Coins, ClipboardList } from "lucide-react";
import { User } from "../types";

interface ReceiptScannerProps {
  user: User | null;
  onRewardAwarded: (updatedUser: User) => void;
}

export default function ReceiptScanner({ user, onRewardAwarded }: ReceiptScannerProps) {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [scanning, setScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file) return;
    
    // Accept standard images/PDFs only
    if (!file.type.match("image.*") && file.type !== "application/pdf") {
      setErrorMsg("Unsupported file type! Please provide a standard PNG, JPEG, or PDF receipt.");
      return;
    }

    setErrorMsg(null);
    setScanning(true);
    setScanResult(null);

    // Simulate OCR scanning using client-safe FileReader
    const reader = new FileReader();
    reader.onload = () => {
      setTimeout(() => {
        // Highly contextual random receipt extraction
        const categories = ["Energy Utility Utility Bill", "Varanasi organic grocery", "Handmade Clay tableware", "Metro Commute Pass"];
        const selectedCat = categories[Math.floor(Math.random() * categories.length)];
        
        let rawScore = 4.2;
        let pEarned = 150;
        let detailNote = "Organic zero-emission localization.";

        if (selectedCat.includes("Utility")) {
          rawScore = 18.5;
          pEarned = 50; 
          detailNote = "Heavy carbon footprint detected due to coal-dependent grid lines.";
        } else if (selectedCat.includes("grocery")) {
          rawScore = 1.8;
          pEarned = 120;
          detailNote = "Low-emission plant agricultural ingredients.";
        } else if (selectedCat.includes("Clay")) {
          rawScore = 0.4;
          pEarned = 200;
          detailNote = "Artisanal carbon-negative clay collective artifact integration.";
        } else {
          rawScore = 0.8;
          pEarned = 180;
          detailNote = "Public electric mobility pass.";
        }

        const outcomes = {
          fileName: file.name,
          category: selectedCat,
          co2Offset: rawScore,
          pointsAwarded: pEarned,
          note: detailNote,
          merchant: "Sustainable Indian Cooperative Ltd.",
          serial: "SCAN-" + Math.floor(Math.random() * 8999 + 1000)
        };

        setScanResult(outcomes);
        setScanning(false);

        // Deduct/Award points to the user profile
        if (user) {
          const updated: User = {
            ...user,
            points: user.points + pEarned,
          };
          onRewardAwarded(updated);
        }
      }, 2200);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 shadow-xl bg-slate-900/40 border border-slate-700/35 flex flex-col gap-4 text-white mt-6" id="digital-receipt-scanner">
      <div>
        <span className="text-[10px] uppercase font-mono font-bold text-teal-400 bg-teal-950/40 border border-teal-850/45 px-3 py-0.5 rounded-full inline-flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 animate-spin" />
          Receipt Audit Engine
        </span>
        <h2 className="text-lg font-display font-semibold text-slate-100 mt-1 flex items-center gap-2">
          <FileText className="h-5 w-5 text-teal-400" />
          Digital Receipt Scanner
        </h2>
        <p className="text-xs text-slate-450 font-sans mt-0.5">
          Scan utility bills, transport passes, or retail recipes to evaluate baseline carbon scores and reap points.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start mt-1">
        {/* Drop zone left column */}
        <div className="md:col-span-6 flex flex-col gap-3">
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer min-h-[160px] transition-all duration-300 relative ${
              dragActive
                ? "border-teal-450 bg-teal-950/20"
                : "border-slate-800 bg-slate-950/30 hover:border-slate-700 hover:bg-slate-950/50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept="image/*,application/pdf"
              className="hidden"
            />

            {scanning ? (
              <div className="flex flex-col items-center justify-center gap-3">
                <RefreshCw className="h-8 w-8 text-teal-400 animate-spin" />
                <div className="text-center">
                  <p className="text-xs text-slate-200 font-mono font-semibold">scanning parameters...</p>
                  <p className="text-[9px] text-slate-500 font-mono mt-1">Reading FileReader buffers & categorizing ledger items...</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2">
                <Upload className="h-7 w-7 text-teal-500 animate-pulse" />
                <p className="text-xs font-medium text-slate-350">
                  Drag and drop local PNG/PDF, or click to upload
                </p>
                <span className="text-[9px] text-slate-550 font-mono">
                  Standard invoices, grocery receipts, or electric bills
                </span>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-950/40 border border-rose-500/10 rounded-xl text-xs text-rose-350 flex items-center gap-2">
              <AlertCircle className="h-4.5 w-4.5" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Scan outcomes results column right */}
        <div className="md:col-span-6">
          {scanResult ? (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-3 leading-relaxed anime-fade-in">
              <div className="flex justify-between items-center text-xs border-b border-slate-900 pb-2">
                <span className="font-mono text-teal-400 font-bold">{scanResult.serial}</span>
                <span className="text-[10px] text-slate-500 font-mono">{scanResult.fileName}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[9px] text-slate-550 font-mono block">AUDITED CATEGORY</span>
                  <span className="text-slate-200 font-medium font-sans">{scanResult.category}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-555 font-mono block">RETAIL MERCHANT</span>
                  <span className="text-slate-200 font-medium font-sans">{scanResult.merchant}</span>
                </div>
              </div>

              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-850 text-xs">
                <p className="text-slate-350 font-sans">
                  <b>AI Impact Verdict:</b> {scanResult.note}
                </p>
              </div>

              <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-900">
                <div className="flex items-center gap-1.5">
                  <Coins className="h-4 w-4 text-amber-500 animate-bounce" />
                  <span className="text-emerald-400 font-mono font-bold text-xs">
                    +{scanResult.pointsAwarded} GreenPoints
                  </span>
                </div>
                
                <span className="text-[10px] font-mono text-slate-400">
                  CO₂ load: {scanResult.co2Offset} kg
                </span>
              </div>

              <div className="p-2 bg-emerald-950/30 border border-emerald-500/10 rounded-lg flex items-center gap-2 text-[10px] text-emerald-300">
                <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                Coins deposited automatically! Explore the Verification Store.
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-950/20 border border-slate-850/60 rounded-xl leading-relaxed text-center min-h-[160px]">
              <ClipboardList className="h-8 w-8 text-slate-650 mx-auto mb-1 animate-pulse" />
              <p className="text-xs text-slate-500 font-sans">No file active. Upload a receipt left to audit emissions.</p>
              <p className="text-[9px] text-slate-600 font-mono mt-1">Parses total carbon footprint load and credits points directly.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
