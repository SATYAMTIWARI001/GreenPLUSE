import { useEffect, useRef, useState } from "react";
import { Zap, Move, Play, Pause, RotateCcw, Sliders } from "lucide-react";

interface AnimatedEarthProps {
  score: number; // Current daily carbon score in kg CO2
}

export default function AnimatedEarth({ score }: AnimatedEarthProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [earthState, setEarthState] = useState<"HEALTHY" | "MODERATE" | "POLLUTED">("HEALTHY");
  const [isHovered, setIsHovered] = useState(false);
  const [isRotatingAutomatically, setIsRotatingAutomatically] = useState(true);

  // Globe Controls override systems
  const [overrideState, setOverrideState] = useState<"auto" | "HEALTHY" | "MODERATE" | "POLLUTED">("auto");
  const [rotationSpeed, setRotationSpeed] = useState<number>(1); // 0.5x, 1x, 2x, 4x speed modifiers
  const [userWantsAutoRotate, setUserWantsAutoRotate] = useState<boolean>(true);

  // Interaction refs to maintain performance inside rAF loop without high state overhead
  const isDraggingRef = useRef(false);
  const rotationAngleRef = useRef(0);
  const cloudRotationAngleRef = useRef(0);
  const verticalTiltRef = useRef(0.2); // slight atmospheric angle default
  const lastXRef = useRef(0);
  const lastYRef = useRef(0);

  // Sync to refs so canvas render loop can access them smoothly without recreating
  const rotationSpeedRef = useRef(1);
  const isRotatingRef = useRef(true);

  // Refs to prevent randomized position jumping on state transitions
  const starsRef = useRef<{ x: number; y: number; size: number; alpha: number; speed: number }[]>([]);
  const debrisRef = useRef<{ x: number; y: number; rx: number; ry: number; speed: number; size: number; color: string; angle: number }[]>([]);
  const cloudsRef = useRef<{ cx: number; cy: number; radius: number; speed: number; offset: number }[]>([]);
  const earthStateRef = useRef(earthState);
  const currentStateValRef = useRef(
    earthState === "HEALTHY" ? 0 : earthState === "MODERATE" ? 1 : 2
  );

  useEffect(() => {
    earthStateRef.current = earthState;
  }, [earthState]);

  useEffect(() => {
    rotationSpeedRef.current = rotationSpeed;
  }, [rotationSpeed]);

  useEffect(() => {
    isRotatingRef.current = isRotatingAutomatically && userWantsAutoRotate;
  }, [isRotatingAutomatically, userWantsAutoRotate]);

  // Determine categorical state
  useEffect(() => {
    if (overrideState !== "auto") {
      setEarthState(overrideState);
      return;
    }
    if (score === 0) setEarthState("HEALTHY");
    else if (score <= 5) setEarthState("HEALTHY");
    else if (score <= 12) setEarthState("MODERATE");
    else setEarthState("POLLUTED");
  }, [score, overrideState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    
    // Setup persistent starfield background
    if (starsRef.current.length === 0) {
      for (let i = 0; i < 75; i++) {
        starsRef.current.push({
          x: Math.random() * 540,
          y: Math.random() * 540,
          size: Math.random() * 1.5 + 0.5,
          alpha: Math.random(),
          speed: Math.random() * 0.015 + 0.003
        });
      }
    }
    const stars = starsRef.current;

    // Persistent floating micro-objects: birds or smoky particles
    if (debrisRef.current.length === 0) {
      for (let i = 0; i < 8; i++) {
        debrisRef.current.push({
          x: 0,
          y: 0,
          rx: 225 + Math.random() * 85, // orbit radius X
          ry: 64 + Math.random() * 45,  // orbit radius Y
          speed: (Math.random() * 0.012 + 0.004) * (Math.random() > 0.5 ? 1 : -1),
          size: Math.random() * 5 + 2.5,
          color: "rgba(255, 255, 255, 0.8)",
          angle: Math.random() * Math.PI * 2
        });
      }
    }
    const debris = debrisRef.current;

    // Persistent micro-clouds
    if (cloudsRef.current.length === 0) {
      for (let i = 0; i < 15; i++) {
        cloudsRef.current.push({
          cx: Math.random() * 270 - 135,
          cy: Math.random() * 240 - 120,
          radius: Math.random() * 26 + 10,
          speed: Math.random() * 0.004 + 0.001,
          offset: Math.random() * Math.PI * 2
        });
      }
    }
    const cloudsArray = cloudsRef.current;

    // Procedural continents definition
    const scaleFactor = 1.80; // Scaled up to perfectly match the enlarged sphere
    const continents = [
      { cx: -45 * scaleFactor, cy: -15 * scaleFactor, r: 42 * scaleFactor },
      { cx: 35 * scaleFactor, cy: 15 * scaleFactor, r: 38 * scaleFactor },
      { cx: -15 * scaleFactor, cy: 30 * scaleFactor, r: 35 * scaleFactor },
      { cx: 15 * scaleFactor, cy: -35 * scaleFactor, r: 28 * scaleFactor },
      { cx: -70 * scaleFactor, cy: 5 * scaleFactor, r: 24 * scaleFactor },
      { cx: 75 * scaleFactor, cy: -20 * scaleFactor, r: 26 * scaleFactor },
      { cx: 10 * scaleFactor, cy: 55 * scaleFactor, r: 18 * scaleFactor }
    ];

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const lerpColor = (c1: number[], c2: number[], t: number) => {
      const r = Math.round(lerp(c1[0], c2[0], t));
      const g = Math.round(lerp(c1[1], c2[1], t));
      const b = Math.round(lerp(c1[2], c2[2], t));
      return `rgb(${r}, ${g}, ${b})`;
    };

    const lerpColorAlpha = (c1: number[], c2: number[], a1: number, a2: number, t: number) => {
      const r = Math.round(lerp(c1[0], c2[0], t));
      const g = Math.round(lerp(c1[1], c2[1], t));
      const b = Math.round(lerp(c1[2], c2[2], t));
      const a = lerp(a1, a2, t);
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    };

    const resizeAndRender = () => {
      let width = 540;  // Enlarge viewport
      let height = 540; // Enlarge viewport
      canvas.width = width;
      canvas.height = height;
 
      const render = () => {
        ctx.clearRect(0, 0, width, height);

        // Smooth state transitions: LERP currentStateValRef towards targetStateVal (HEALTHY=0, MODERATE=1, POLLUTED=2)
        const targetStateVal = earthStateRef.current === "HEALTHY" ? 0 : earthStateRef.current === "MODERATE" ? 1 : 2;
        currentStateValRef.current += (targetStateVal - currentStateValRef.current) * 0.05;

        // Dynamic state interpolation helpers
        const getVal = (vHealthy: number, vModerate: number, vPolluted: number) => {
          const t = currentStateValRef.current;
          if (t <= 1) {
            return lerp(vHealthy, vModerate, t);
          } else {
            return lerp(vModerate, vPolluted, t - 1);
          }
        };

        const getColor = (cHealthy: number[], cModerate: number[], cPolluted: number[]) => {
          const t = currentStateValRef.current;
          if (t <= 1) {
            return lerpColor(cHealthy, cModerate, t);
          } else {
            return lerpColor(cModerate, cPolluted, t - 1);
          }
        };

        const getColorAlpha = (cHealthy: number[], cModerate: number[], cPolluted: number[], aHealthy: number, aModerate: number, aPolluted: number) => {
          const t = currentStateValRef.current;
          if (t <= 1) {
            return lerpColorAlpha(cHealthy, cModerate, aHealthy, aModerate, t);
          } else {
            return lerpColorAlpha(cModerate, cPolluted, aModerate, aPolluted, t - 1);
          }
        };

        // Slow auto-rotation when not interacting and enabled
        if (!isDraggingRef.current && isRotatingRef.current) {
          rotationAngleRef.current += 0.004 * rotationSpeedRef.current;
          cloudRotationAngleRef.current += 0.006 * rotationSpeedRef.current;
          // Slowly decay vertical tilt back to subtle standard tilt
          verticalTiltRef.current += (0.25 - verticalTiltRef.current) * 0.05;
        }

        // 1. Draw Space Starfield
        ctx.fillStyle = "#090d1a";
        ctx.fillRect(0, 0, width, height);

        // Render & Twinkle Stars
        stars.forEach(star => {
          star.alpha += star.speed;
          if (star.alpha > 1 || star.alpha < 0) {
            star.speed = -star.speed;
          }
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.08, Math.min(star.alpha, 0.9))})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();
        });

        // Center coordinates - apply a slight dynamic FLOATING offset using Sine wave
        const floatY = Math.sin(Date.now() / 1500) * 8;
        const cx = width / 2;
        const cy = (height / 2) + floatY;
        const radius = 176; // Enlarged sphere radius (up from 142) for massive prominence

        // 2. Realistic Atmosphere Glow base (smoothly lerped)
        const atmosphereGrad = ctx.createRadialGradient(cx, cy, radius - 6, cx, cy, radius + 54);
        const stop0 = getColorAlpha([16, 185, 129], [245, 158, 11], [239, 68, 68], 0.28, 0.2, 0.35);
        const stop05 = getColorAlpha([56, 189, 248], [234, 179, 8], [244, 63, 94], 0.16, 0.09, 0.18);
        const stop1 = getColorAlpha([56, 189, 248], [100, 116, 139], [127, 29, 29], 0, 0, 0);
        const stop05Idx = getVal(0.5, 0.5, 0.4);

        atmosphereGrad.addColorStop(0, stop0);
        atmosphereGrad.addColorStop(stop05Idx, stop05);
        atmosphereGrad.addColorStop(1, stop1);

        ctx.fillStyle = atmosphereGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius + 54, 0, Math.PI * 2);
        ctx.fill();

        // 3. Earth sphere background base (Ocean) (smoothly lerped)
        const sphereGrad = ctx.createRadialGradient(cx - 50, cy - 50, 36, cx, cy, radius);
        const ocean0 = getColor([2, 132, 199], [3, 105, 161], [84, 60, 46]);
        const oceanMid = getColor([3, 105, 161], [30, 41, 59], [45, 29, 21]);
        const ocean1 = getColor([15, 23, 42], [12, 17, 30], [14, 13, 12]);
        const oceanMidIdx = getVal(0.75, 0.7, 0.65);

        sphereGrad.addColorStop(0, ocean0);
        sphereGrad.addColorStop(oceanMidIdx, oceanMid);
        sphereGrad.addColorStop(1, ocean1);

        ctx.fillStyle = sphereGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();

        // Clip drawing to Earth Sphere so continents rotate inside
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.clip();

        // 4. Draw Continents with horizontal wrapping rotation & vertical tilt projection (smoothly lerped)
        const contColor = getColor([16, 185, 129], [180, 83, 9], [90, 58, 34]);
        const forestAlpha = Math.max(0, 1 - currentStateValRef.current);

        continents.forEach((cont) => {
          const initialX = cont.cx;
          // Continents slide laterally based on rotation Angle wrapping modulo width
          let rx = ((initialX + rotationAngleRef.current * 58 + width / 2) % width) - width / 2;
          
          // Apply vertical tilt offset dynamically
          const tiltOffsetY = Math.sin(verticalTiltRef.current) * cont.cx * 0.42;
          const finalY = cy + cont.cy + tiltOffsetY;

          ctx.fillStyle = contColor;
          ctx.beginPath();
          ctx.arc(cx + rx, finalY, cont.r, 0, Math.PI * 2);
          ctx.fill();

          // Sub-green forest overlays for depth representation (fades out as it gets polluted)
          if (forestAlpha > 0) {
            ctx.fillStyle = `rgba(5, 150, 105, ${forestAlpha})`;
            ctx.beginPath();
            ctx.arc(cx + rx - 10, finalY - 6, cont.r * 0.65, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        // 5. Draw Shrinking Ice Caps (reactive to environment stress and vertical tilt) (smoothly lerped)
        const iceCapRadiusY = getVal(32, 14, 1.0);

        if (iceCapRadiusY > 0) {
          ctx.fillStyle = "#f8fafc";
          const tiltCapOffset = verticalTiltRef.current * 32;
          // North Ice Cap
          ctx.beginPath();
          ctx.ellipse(cx, cy - (radius * 0.88) + tiltCapOffset, radius * 0.44, iceCapRadiusY, 0, 0, Math.PI * 2);
          ctx.fill();
          // South Ice Cap
          ctx.beginPath();
          ctx.ellipse(cx, cy + (radius * 0.88) + tiltCapOffset, radius * 0.44, iceCapRadiusY, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        // 6. Draw Atmosphere Clouds wrapping with speed (smoothly lerped)
        const cloudColor = getColorAlpha([255, 255, 255], [255, 255, 255], [120, 113, 108], 0.65, 0.65, 0.45);
        const shadowColor = getColorAlpha([255, 255, 255], [255, 255, 255], [78, 71, 65], 0.35, 0.35, 0.30);

        cloudsArray.forEach((cloud) => {
          let rx = ((cloud.cx + cloudRotationAngleRef.current * 32 + width / 2) % width) - width / 2;
          const tiltCloudY = Math.sin(verticalTiltRef.current) * cloud.cx * 0.3;
          
          ctx.fillStyle = cloudColor;
          ctx.beginPath();
          ctx.arc(cx + rx, cy + cloud.cy + tiltCloudY, cloud.radius, 0, Math.PI * 2);
          ctx.fill();

          // Cloud shadow styling
          ctx.fillStyle = shadowColor;
          ctx.beginPath();
          ctx.arc(cx + rx + 4, cy + cloud.cy + tiltCloudY + 3, cloud.radius * 0.75, 0, Math.PI * 2);
          ctx.fill();
        });

        // 7. Day-Night Overlay Shadow (creates stunning spherical render shading)
        const shadowGrad = ctx.createRadialGradient(cx - 62, cy - 62, 75, cx, cy, radius);
        shadowGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
        shadowGrad.addColorStop(0.5, "rgba(0, 0, 0, 0.3)");
        shadowGrad.addColorStop(0.82, "rgba(0, 0, 0, 0.85)");
        shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0.97)");
        ctx.fillStyle = shadowGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius + 1, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore(); // Exit earth clip boundary

        // 8. Draw Growing trees around the Earth perimeter (fades out as it gets polluted)
        const treesAlpha = Math.max(0, 1 - currentStateValRef.current);
        if (treesAlpha > 0) {
          ctx.save();
          ctx.globalAlpha = treesAlpha;
          ctx.fillStyle = "#34d399";
          for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
            // Include vertical tilt influence on perimeter tree angles
            const windVibe = Math.sin(rotationAngleRef.current * 2.5 + angle) * 3;
            const effectiveAngle = angle + verticalTiltRef.current * 0.15;
            const tx = cx + Math.cos(effectiveAngle) * (radius + 2);
            const ty = cy + Math.sin(effectiveAngle) * (radius + 2);

            ctx.beginPath();
            ctx.arc(tx, ty, 4.5, 0, Math.PI * 2);
            ctx.fill();

            // plant stem
            ctx.strokeStyle = "#059669";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(tx + Math.cos(effectiveAngle) * 9.5, ty + Math.sin(effectiveAngle) * 9.5 + windVibe);
            ctx.stroke();
          }
          ctx.restore();
        }

        // 9. Draw orbiting satellites / particles (smoothly transition configuration and color)
        debris.forEach((deb) => {
          if (!isDraggingRef.current) {
            deb.angle += deb.speed;
          }
          const orbitX = cx + Math.cos(deb.angle) * deb.rx;
          // Tilting 3D projection path of orbits
          const orbitY = cy + Math.sin(deb.angle) * deb.ry + Math.cos(deb.angle) * Math.sin(verticalTiltRef.current) * 54;
          const isBehind = Math.sin(deb.angle) < 0;

          ctx.save();
          if (isBehind) {
            ctx.globalAlpha = 0.22;
          } else {
            ctx.globalAlpha = 1.0;
          }

          let debColor = "";
          let debSize = 3;
          let lineAlpha = 0;
          let wobbleAmp = 0;

          const t = currentStateValRef.current;
          if (t <= 1) {
            // HEALTHY to MODERATE
            debColor = lerpColor([56, 189, 248], [203, 213, 225], t);
            debSize = lerp(deb.size, 3, t);
            lineAlpha = lerp(0.45, 0, t);
            wobbleAmp = 0;
          } else {
            // MODERATE to POLLUTED
            debColor = lerpColorAlpha([203, 213, 225], [239, 68, 68], 1.0, 0.7, t - 1);
            debSize = lerp(3, deb.size * 0.75, t - 1);
            lineAlpha = 0;
            wobbleAmp = lerp(0, 8, t - 1);
          }

          ctx.fillStyle = debColor;
          ctx.beginPath();
          ctx.arc(orbitX, orbitY + Math.sin(rotationAngleRef.current * 4) * wobbleAmp, debSize, 0, Math.PI * 2);
          ctx.fill();

          if (lineAlpha > 0) {
            ctx.strokeStyle = `rgba(56, 189, 248, ${lineAlpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(orbitX - 6, orbitY);
            ctx.lineTo(orbitX + 6, orbitY);
            ctx.stroke();
          }
          ctx.restore();
        });

        animationFrameId = requestAnimationFrame(render);
      };

      render();
    };

    resizeAndRender();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Drag Gesture Handlers
  const handleStart = (clientX: number, clientY: number) => {
    isDraggingRef.current = true;
    setIsRotatingAutomatically(false);
    lastXRef.current = clientX;
    lastYRef.current = clientY;
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDraggingRef.current) return;
    const deltaX = clientX - lastXRef.current;
    const deltaY = clientY - lastYRef.current;

    lastXRef.current = clientX;
    lastYRef.current = clientY;

    // Direct translation to Earth angle spinning & vertical tilts
    rotationAngleRef.current += deltaX * 0.009;
    cloudRotationAngleRef.current += deltaX * 0.012;
    verticalTiltRef.current = Math.max(-0.6, Math.min(0.6, verticalTiltRef.current + deltaY * 0.008));
  };

  const handleEnd = () => {
    isDraggingRef.current = false;
    // resume automatic rotation after 2 seconds if user supports background rotation
    setTimeout(() => {
      if (!isDraggingRef.current && userWantsAutoRotate) {
        setIsRotatingAutomatically(true);
      }
    }, 2000);
  };

  const toggleAutoRotate = () => {
    const nextVal = !userWantsAutoRotate;
    setUserWantsAutoRotate(nextVal);
    setIsRotatingAutomatically(nextVal);
  };

  const resetCamera = () => {
    rotationAngleRef.current = 0;
    cloudRotationAngleRef.current = 0;
    verticalTiltRef.current = 0.2;
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      {/* Absolute Badges */}
      <div className="absolute top-2 left-2 z-10">
        <span
          className={`px-3 py-1 text-xs font-mono rounded-full uppercase flex items-center gap-1.5 font-semibold shadow-md border ${
            earthState === "HEALTHY"
              ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/30"
              : earthState === "MODERATE"
              ? "bg-yellow-950/80 text-yellow-300 border-yellow-500/30"
              : "bg-red-950/80 text-red-300 border-red-500/30 animate-pulse"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              earthState === "HEALTHY"
                ? "bg-emerald-400"
                : earthState === "MODERATE"
                ? "bg-yellow-400"
                : "bg-red-500"
            }`}
          />
          Tactile Earth: {earthState === "HEALTHY" ? "Healthy Map" : earthState === "MODERATE" ? "Carbon Fatigue" : "Alarm State!"}
        </span>
      </div>

      <div className="absolute top-2 right-2 z-10 flex gap-2">
        <span className="bg-slate-900/85 backdrop-blur-md text-slate-300 text-xs px-2.5 py-1 rounded-full border border-slate-700/50 flex items-center gap-1">
          <Zap className="h-3 w-3 text-cyan-400" />
          {score > 0 ? `${score} kg CO₂` : "Estimating..."}
        </span>
      </div>

      {/* HTML5 Canvas with drag rotation triggers - Made bigger and fully responsive */}
      <div 
        className="relative max-w-full rounded-full overflow-hidden shadow-[0_0_65px_rgba(16,185,129,0.18)] hover:shadow-[0_0_80px_rgba(16,185,129,0.28)] hover:-translate-y-1 transition-all duration-500 border-2 border-slate-700/30 bg-slate-950 cursor-grab active:cursor-grabbing group animate-fade-in"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          handleEnd();
        }}
        onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
        onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
        onMouseUp={handleEnd}
        onTouchStart={(e) => {
          if (e.touches[0]) handleStart(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onTouchMove={(e) => {
          if (e.touches[0]) handleMove(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onTouchEnd={handleEnd}
      >
        <canvas 
          ref={canvasRef} 
          aria-label="Interactive 3D Earth representing carbon footprint status" 
          role="img" 
          className="max-w-full w-[430px] h-[430px] md:w-[490px] md:h-[490px] aspect-square block transition-transform duration-550 group-hover:scale-[1.01]" 
        />
        
        {/* Visual helper overlays on action hover */}
        <div className="absolute inset-x-0 bottom-6 flex justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="flex items-center gap-1 bg-slate-950/90 border border-emerald-500/30 text-emerald-400 text-[10px] uppercase tracking-wider font-mono px-2.5 py-1 rounded-full shadow-lg">
            <Move className="h-3 w-3 animate-pulse" />
            Drag or Swipe to Spin & Tilt
          </span>
        </div>
      </div>
 
      {/* Interactive Control Deck for Globe */}
      <div className="mt-6 w-full max-w-sm bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800/80 p-4 shrink-0 shadow-lg select-none">
        <div className="flex items-center gap-1.5 mb-3">
          <Sliders className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest">Globe Control Deck</span>
        </div>
 
        {/* 1. Simulation Override Mode */}
        <div className="mb-4">
          <label className="text-[9px] font-mono text-slate-400 block mb-1.5 uppercase">Interactive Biosphere Mode</label>
          <div className="grid grid-cols-4 gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/40">
            <button
              onClick={() => setOverrideState("auto")}
              className={`px-2 py-1 text-[9px] font-mono rounded-lg transition-all ${
                overrideState === "auto"
                  ? "bg-slate-800 text-emerald-400 font-semibold border-slate-750 border"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Sync
            </button>
            <button
              onClick={() => setOverrideState("HEALTHY")}
              className={`px-2 py-1 text-[9px] font-mono rounded-lg transition-all ${
                overrideState === "HEALTHY"
                  ? "bg-emerald-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Pristine
            </button>
            <button
              onClick={() => setOverrideState("MODERATE")}
              className={`px-2 py-1 text-[9px] font-mono rounded-lg transition-all ${
                overrideState === "MODERATE"
                  ? "bg-yellow-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Stress
            </button>
            <button
              onClick={() => setOverrideState("POLLUTED")}
              className={`px-2 py-1 text-[9px] font-mono rounded-lg transition-all ${
                overrideState === "POLLUTED"
                  ? "bg-rose-600 text-white font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Fossil
            </button>
          </div>
        </div>
 
        {/* 2. Motion Deck */}
        <div className="flex items-center justify-between gap-2.5">
          {/* Pause/Play Button & Reset */}
          <div className="flex gap-1.5">
            <button
              onClick={toggleAutoRotate}
              className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                userWantsAutoRotate
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/15"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
              title={userWantsAutoRotate ? "Pause Orbital Rotation" : "Resume Orbital Rotation"}
              aria-label={userWantsAutoRotate ? "Pause Orbital Rotation" : "Resume Orbital Rotation"}
            >
              {userWantsAutoRotate ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </button>
            
            <button
              onClick={resetCamera}
              className="p-2 rounded-xl border border-slate-850 bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-all cursor-pointer flex items-center justify-center"
              title="Reset View Angle"
              aria-label="Reset View Angle"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Speed Multiplier Switches */}
          <div className="flex-1 flex items-center gap-1 justify-end bg-slate-950/60 p-1 rounded-xl border border-slate-800/40">
            <span className="text-[9px] font-mono text-slate-400 mr-1.5 uppercase">Speed</span>
            {[0.5, 1, 2, 4].map((spd) => (
              <button
                key={spd}
                onClick={() => setRotationSpeed(spd)}
                disabled={!userWantsAutoRotate}
                className={`w-6 h-6 text-[9px] font-mono font-bold rounded-lg transition-all ${
                  !userWantsAutoRotate
                    ? "opacity-35 cursor-not-allowed text-slate-600"
                    : rotationSpeed === spd
                    ? "bg-emerald-500 text-slate-950"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
