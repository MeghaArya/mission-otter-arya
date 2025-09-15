// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";

// /**
//  * 🦦 Mission Otter — Multi-Checkpoint Interactive Resume
//  * - Dock at 5 zones to unlock sections in a side panel
//  * - Mobile-friendly, starry backdrop, tiny confetti finish
//  */

// // -------------------- Small UI helpers --------------------
// const Badge: React.FC<React.PropsWithChildren> = ({ children }) => (
//   <span className="px-2 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-200 text-xs">
//     {children}
//   </span>
// );

// const Kbd: React.FC<React.PropsWithChildren> = ({ children }) => (
//   <kbd className="px-2 py-0.5 rounded-md border border-slate-700 bg-slate-900/70 text-slate-200 text-[11px] font-mono">
//     {children}
//   </kbd>
// );

// // -------------------- Hooks / utilities --------------------
// function useKeyPressMap() {
//   const mapRef = useRef<Record<string, boolean>>({});
//   useEffect(() => {
//     const down = (e: KeyboardEvent) => (mapRef.current[e.key] = true);
//     const up = (e: KeyboardEvent) => (mapRef.current[e.key] = false);
//     window.addEventListener("keydown", down);
//     window.addEventListener("keyup", up);
//     return () => {
//       window.removeEventListener("keydown", down);
//       window.removeEventListener("keyup", up);
//     };
//   }, []);
//   return mapRef;
// }

// const BackgroundStars: React.FC = () => {
//   const ref = useRef<HTMLCanvasElement | null>(null);
//   useEffect(() => {
//     const c = ref.current!;
//     const ctx = c.getContext("2d")!;
//     let w = (c.width = window.innerWidth);
//     let h = (c.height = window.innerHeight);
//     const onResize = () => {
//       w = c.width = window.innerWidth;
//       h = c.height = window.innerHeight;
//     };
//     window.addEventListener("resize", onResize);

//     const stars = Array.from({ length: 240 }, () => ({
//       x: Math.random() * w,
//       y: Math.random() * h,
//       s: 0.6 + Math.random() * 1.0,
//       p: 0.25 + Math.random() * 0.75,
//       t: Math.random() * 1000,
//     }));

//     let raf = 0;
//     const tick = () => {
//       ctx.fillStyle = "#05070d";
//       ctx.fillRect(0, 0, w, h);
//       stars.forEach((st, i) => {
//         const a =
//           st.p + 0.55 * Math.sin((st.t + performance.now() * 0.002 + i) * 0.95);
//         ctx.fillStyle = `rgba(200,220,255,${Math.max(0.08, Math.min(1, a))})`;
//         ctx.fillRect(st.x, st.y, st.s, st.s);
//       });
//       raf = requestAnimationFrame(tick);
//     };
//     tick();
//     return () => {
//       cancelAnimationFrame(raf);
//       window.removeEventListener("resize", onResize);
//     };
//   }, []);
//   return (
//     <canvas ref={ref} className="fixed inset-0 -z-10" aria-hidden="true" />
//   );
// };

// // tiny, no-deps confetti
// const ConfettiBurst: React.FC<{ kick: number }> = ({ kick }) => {
//   const ref = useRef<HTMLCanvasElement | null>(null);
//   useEffect(() => {
//     if (!kick) return;
//     const c = ref.current!;
//     const ctx = c.getContext("2d")!;
//     let w = (c.width = window.innerWidth),
//       h = (c.height = window.innerHeight);
//     const onResize = () => {
//       w = c.width = window.innerWidth;
//       h = c.height = window.innerHeight;
//     };
//     window.addEventListener("resize", onResize);

//     const N = 140;
//     const parts = Array.from({ length: N }, () => ({
//       x: w / 2,
//       y: h * 0.25,
//       vx: (Math.random() - 0.5) * 6,
//       vy: -Math.random() * 6 - 2,
//       g: 0.08 + Math.random() * 0.05,
//       a: 1,
//       r: 2 + Math.random() * 3,
//     }));

//     let t0 = performance.now();
//     let raf = 0;
//     const loop = () => {
//       const t = performance.now() - t0;
//       ctx.clearRect(0, 0, w, h);
//       parts.forEach((p) => {
//         p.vy += p.g;
//         p.x += p.vx;
//         p.y += p.vy;
//         p.a *= 0.985;
//         ctx.fillStyle = `rgba(${150 + ((Math.random() * 100) | 0)},${
//           150 + ((Math.random() * 100) | 0)
//         },255,${p.a})`;
//         ctx.beginPath();
//         ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
//         ctx.fill();
//       });
//       if (t < 2200) raf = requestAnimationFrame(loop);
//     };
//     loop();
//     return () => {
//       cancelAnimationFrame(raf);
//       window.removeEventListener("resize", onResize);
//     };
//   }, [kick]);
//   return (
//     <canvas
//       ref={ref}
//       className="fixed inset-0 pointer-events-none z-40"
//       aria-hidden="true"
//     />
//   );
// };

// // -------------------- Side panel --------------------
// type ZoneKey = "about" | "why" | "projects" | "snippets" | "contact";

// const ZONES: { key: ZoneKey; label: string }[] = [
//   { key: "about", label: "About Me" },
//   { key: "why", label: "Why Starfish" },
//   { key: "projects", label: "Projects" },
//   { key: "snippets", label: "Code Snippets" },
//   { key: "contact", label: "Contact" },
// ];

// const SidePanel: React.FC<{
//   open: boolean;
//   onClose: () => void;
//   unlocked: Set<ZoneKey>;
//   currentTab: ZoneKey;
//   setCurrentTab: (k: ZoneKey) => void;
// }> = ({ open, onClose, unlocked, currentTab, setCurrentTab }) => {
//   const TabButton = ({ z }: { z: { key: ZoneKey; label: string } }) => {
//     const isUnlocked = unlocked.has(z.key);
//     const isActive = currentTab === z.key;
//     const number = ZONES.findIndex((q) => q.key === z.key) + 1;
//     return (
//       <button
//         disabled={!isUnlocked}
//         onClick={() => isUnlocked && setCurrentTab(z.key)}
//         className={[
//           "w-full text-left px-3 py-2 rounded-lg border transition flex items-center gap-2",
//           isActive
//             ? "bg-slate-800 border-slate-600"
//             : "bg-slate-900 border-slate-800 hover:bg-slate-800/70",
//           !isUnlocked ? "opacity-40 cursor-not-allowed" : "",
//         ].join(" ")}
//       >
//         <span className="text-[11px] px-2 py-0.5 rounded-full border border-slate-700 bg-slate-800/70">
//           {number}
//         </span>
//         <span className="text-sm">{z.label}</span>
//         {isUnlocked && (
//           <span className="ml-auto text-emerald-400 text-xs">✔</span>
//         )}
//       </button>
//     );
//   };

//   const Content: React.FC = () => {
//     switch (currentTab) {
//       case "about":
//         return (
//           <div className="space-y-2 text-sm text-slate-300">
//             <p>
//               Seattle-based U.S. citizen. Python & C++ engineer with hands-on
//               work in simulation, autonomy, and data tooling. Former Air Force
//               Research Labratory fellow; University VEX U Robotics team captain.
//             </p>
//             <p>
//               I like hard problems with feedback loops: dynamics, control,
//               planning, and the glue code that keeps experiments honest (tests,
//               logs, reproducibility).
//             </p>
//           </div>
//         );
//       case "why":
//         return (
//           <ul className="list-disc pl-5 space-y-2 text-sm text-slate-300">
//             <li>
//               On-orbit servicing keeps space sustainable — I want to build it.
//             </li>
//             <li>
//               Simulation-first workflow: rapid iteration, measurable progress,
//               verification culture.
//             </li>
//             <li>I thrive in small teams with ownership and high trust.</li>
//           </ul>
//         );
//       case "projects":
//         return (
//           <ul className="list-disc pl-5 space-y-2 text-sm text-slate-300">
//             <li>
//               <b>Orbital Mechanics Simulator (Python · Jupyter)</b> — 2-body
//               propagation with clean numerics & visualizations.
//             </li>
//             <li>
//               <b>PID Controller (C++)</b> — stabilizes a simulated robot angle;
//               real-time telemetry.
//             </li>
//             <li>
//               <b>Autonomous Path Planning (Python)</b> — A*/Dijkstra on 2D grids
//               with obstacles.
//             </li>
//           </ul>
//         );
//       case "snippets":
//         return (
//           <div className="space-y-3">
//             <details className="rounded-lg border border-slate-800 bg-slate-900/60">
//               <summary className="px-3 py-2 cursor-pointer text-sm">
//                 Pose error & gentle-dock check (TS/JS)
//               </summary>
//               <pre className="m-3 whitespace-pre-wrap text-xs bg-slate-950/60 p-3 rounded-lg border border-slate-800 overflow-auto">{`// Compute relative pose error between ship and target
// function poseError(ship, target){
//   const dx = target.x - ship.x;
//   const dy = target.y - ship.y;
//   const range = Math.hypot(dx, dy);
//   const speed = Math.hypot(ship.vx, ship.vy);
//   const aligned = Math.abs(ship.omega) < 0.2; // low rotation
//   const gentle = speed < 0.9;                 // low closing speed
//   return { range, aligned, gentle };
// }

// // Dock when close, slow, and stable
// const { range, aligned, gentle } = poseError(ship, target);
// if (range < target.r + 10 && aligned && gentle) dock();`}</pre>
//             </details>

//             <details className="rounded-lg border border-slate-800 bg-slate-900/60">
//               <summary className="px-3 py-2 cursor-pointer text-sm">
//                 Semi-implicit Euler (Python-style pseudo)
//               </summary>
//               <pre className="m-3 whitespace-pre-wrap text-xs bg-slate-950/60 p-3 rounded-lg border border-slate-800 overflow-auto">{`# update rotation
// omega += torque_cmd * dt
// omega *= 0.995  # damp
// angle += omega * dt

// # local forward thrust -> world frame
// ax = sin(angle) * thrust
// ay = -cos(angle) * thrust
// vx += (ax / mass) * dt
// vy += (ay / mass) * dt

// # drift & integrate
// vx *= 0.999; vy *= 0.999
// x += vx; y += vy`}</pre>
//             </details>
//           </div>
//         );
//       case "contact":
//         return (
//           <div className="text-sm text-slate-300 space-y-3">
//             <p>
//               Open to on-site in Tukwila. Happy to walk through tradeoffs or
//               code.
//             </p>
//             <div className="flex flex-wrap gap-2">
//               <a
//                 href="mailto:megha.arya07@gmail.com"
//                 className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 border border-emerald-400/30 text-sm"
//               >
//                 Email
//               </a>
//               <a
//                 href="https://github.com/MeghaArya"
//                 target="_blank"
//                 rel="noreferrer"
//                 className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm"
//               >
//                 GitHub
//               </a>
//               <a
//                 href="https://www.linkedin.com/in/megha-arya-80a264192/"
//                 target="_blank"
//                 rel="noreferrer"
//                 className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm"
//               >
//                 LinkedIn
//               </a>
//             </div>
//           </div>
//         );
//     }
//   };

//   return (
//     <AnimatePresence>
//       {open && (
//         <motion.aside
//           initial={{ x: 500, opacity: 0 }}
//           animate={{ x: 0, opacity: 1 }}
//           exit={{ x: 500, opacity: 0 }}
//           transition={{ type: "spring", stiffness: 200, damping: 24 }}
//           className="fixed right-0 top-0 h-full w-[380px] max-w-[92vw] bg-slate-950/95 backdrop-blur border-l border-slate-800 z-40"
//           role="dialog"
//           aria-label="Profile side panel"
//         >
//           <div className="h-full grid grid-rows-[auto,1fr]">
//             <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
//               <h2 className="text-sm font-semibold">
//                 Mission Otter — Unlocked
//               </h2>
//               <button
//                 onClick={onClose}
//                 className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs"
//               >
//                 Close
//               </button>
//             </div>
//             <div className="grid grid-cols-[150px,1fr] overflow-hidden">
//               <nav className="p-3 space-y-2 border-r border-slate-800 overflow-auto">
//                 {ZONES.map((z) => (
//                   <TabButton key={z.key} z={z} />
//                 ))}
//               </nav>
//               <div className="p-4 overflow-auto">
//                 <Content />
//               </div>
//             </div>
//           </div>
//         </motion.aside>
//       )}
//     </AnimatePresence>
//   );
// };

// // -------------------- Canvas game --------------------
// const MultiZoneDockingSim: React.FC<{
//   onDockZone: (zone: ZoneKey) => void;
//   activeZone: ZoneKey;
// }> = ({ onDockZone, activeZone }) => {
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);
//   const keysRef = useKeyPressMap();
//   const [fuel, setFuel] = useState(220);
//   const [paused, setPaused] = useState(false);

//   const world = useMemo(() => {
//     return {
//       w: 600,
//       h: 380,
//       dt: 1 / 60,
//       ship: {
//         x: 600 / 2,
//         y: 380 / 2,
//         vx: 0,
//         vy: 0,
//         angle: Math.PI * 0.05,
//         omega: 0,
//         mass: 1,
//         thrust: 8,
//         torque: 1.1,
//         r: 14,
//       },

//       targets: {
//         about: { x: 490, y: 80, r: 26, color: "#67e8f9" },
//         why: { x: 490, y: 300, r: 26, color: "#facc15" },
//         projects: { x: 320, y: 55, r: 26, color: "#22c55e" },
//         snippets: { x: 320, y: 325, r: 26, color: "#a78bfa" },
//         contact: { x: 110, y: 190, r: 26, color: "#f472b6" },
//       } as Record<ZoneKey, { x: number; y: number; r: number; color: string }>,
//     };
//   }, []);

//   useEffect(() => {
//     const ctx = canvasRef.current!.getContext("2d")!;
//     let raf = 0;

//     const drawFuelPill = () => {
//       // fuel pill safely inside frame
//       const hudX = 12,
//         hudY = 12,
//         hudW = 90,
//         hudH = 22;
//       ctx.save();
//       ctx.globalAlpha = 0.95;
//       // rounded rect
//       const r = 10;
//       ctx.beginPath();
//       ctx.moveTo(hudX + r, hudY);
//       ctx.arcTo(hudX + hudW, hudY, hudX + hudW, hudY + hudH, r);
//       ctx.arcTo(hudX + hudW, hudY + hudH, hudX, hudY + hudH, r);
//       ctx.arcTo(hudX, hudY + hudH, hudX, hudY, r);
//       ctx.arcTo(hudX, hudY, hudX + hudW, hudY, r);
//       ctx.closePath();
//       ctx.fillStyle = "rgba(15,23,42,0.85)";
//       ctx.strokeStyle = "#334155";
//       ctx.lineWidth = 1;
//       ctx.fill();
//       ctx.stroke();

//       ctx.fillStyle = "#93c5fd";
//       ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, monospace";
//       ctx.textBaseline = "middle";
//       ctx.textAlign = "left";
//       ctx.fillText("Fuel", hudX + 10, hudY + hudH / 2);

//       const pct = Math.max(0, Math.min(1, fuel / 220));
//       const barX = hudX + 40,
//         barY = hudY + 6,
//         barW = hudW - 50,
//         barH = hudH - 12;
//       ctx.strokeStyle = "#475569";
//       ctx.strokeRect(barX, barY, barW, barH);
//       ctx.fillStyle = pct > 0.33 ? "#22c55e" : "#f97316";
//       ctx.fillRect(barX + 1, barY + 1, Math.max(0, barW - 2) * pct, barH - 2);
//       ctx.restore();
//     };

//     const draw = () => {
//       ctx.clearRect(0, 0, world.w, world.h);
//       ctx.fillStyle = "rgba(0,0,0,0.25)";
//       ctx.fillRect(0, 0, world.w, world.h);

//       (Object.keys(world.targets) as ZoneKey[]).forEach((k) => {
//         const t = world.targets[k];
//         const isActive = k === activeZone;

//         ctx.strokeStyle = isActive ? t.color : "#334155";
//         ctx.lineWidth = isActive ? 3 : 1.5;
//         ctx.save();
//         if (isActive) {
//           ctx.shadowColor = t.color;
//           ctx.shadowBlur = 12;
//         }
//         ctx.beginPath();
//         ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
//         ctx.stroke();
//         ctx.restore();

//         const number = ZONES.findIndex((z) => z.key === k) + 1;
//         ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, monospace";
//         ctx.textAlign = "center";
//         ctx.textBaseline = "middle";
//         ctx.fillStyle = isActive ? t.color : "#94a3b8";
//         ctx.fillText(String(number), t.x, t.y - t.r - 12);
//       });

//       // ship
//       const s = world.ship;
//       ctx.save();
//       ctx.translate(s.x, s.y);
//       ctx.rotate(s.angle);
//       ctx.fillStyle = "#38bdf8";
//       ctx.beginPath();
//       ctx.moveTo(0, -s.r);
//       ctx.lineTo(s.r * 0.8, s.r);
//       ctx.lineTo(-s.r * 0.8, s.r);
//       ctx.closePath();
//       ctx.fill();

//       const thrusting =
//         (keysRef.current["ArrowUp"] || keysRef.current["w"]) &&
//         fuel > 0 &&
//         !paused;
//       if (thrusting) {
//         ctx.fillStyle = "#f97316";
//         ctx.beginPath();
//         ctx.moveTo(0, s.r + 2);
//         ctx.lineTo(6, s.r + 14 + Math.random() * 4);
//         ctx.lineTo(-6, s.r + 14 + Math.random() * 4);
//         ctx.closePath();
//         ctx.fill();
//       }
//       ctx.restore();

//       drawFuelPill();
//     };

//     const step = () => {
//       const s = world.ship;
//       const dt = world.dt;
//       if (!paused) {
//         const left = keysRef.current["ArrowLeft"] || keysRef.current["a"];
//         const right = keysRef.current["ArrowRight"] || keysRef.current["d"];
//         const up = keysRef.current["ArrowUp"] || keysRef.current["w"];
//         const down = keysRef.current["ArrowDown"] || keysRef.current["s"];
//         const brake = keysRef.current[" "] || keysRef.current["z"];

//         if (left) s.omega -= world.ship.torque * dt;
//         if (right) s.omega += world.ship.torque * dt;
//         s.omega *= 0.96;
//         s.angle += s.omega * dt;

//         if (up && fuel > 0) {
//           s.vx += Math.sin(s.angle) * world.ship.thrust * dt;
//           s.vy += -Math.cos(s.angle) * world.ship.thrust * dt;
//           setFuel((f) => Math.max(0, f - 0.15));
//         }
//         if (down && fuel > 0) {
//           s.vx -= Math.sin(s.angle) * world.ship.thrust * 0.8 * dt;
//           s.vy -= -Math.cos(s.angle) * world.ship.thrust * 0.8 * dt;
//           setFuel((f) => Math.max(0, f - 0.12));
//         }

//         // base damping
//         s.vx *= 0.985;
//         s.vy *= 0.985;

//         // brake
//         if (brake) {
//           s.vx *= 0.9;
//           s.vy *= 0.9;
//           s.omega *= 0.85;
//         }

//         // integrate + bounds
//         s.x = Math.min(Math.max(s.x + s.vx, 10), world.w - 10);
//         s.y = Math.min(Math.max(s.y + s.vy, 10), world.h - 10);

//         // near-target assist
//         const t = world.targets[activeZone];
//         const dx = t.x - s.x;
//         const dy = t.y - s.y;
//         const dist = Math.hypot(dx, dy);
//         s.vx *= 0.983;
//         s.vy *= 0.983;
//         if (dist < 100) {
//           s.vx *= 0.93;
//           s.vy *= 0.93;
//           s.omega *= 0.88;
//         }

//         // docking check
//         const speed = Math.hypot(s.vx, s.vy);
//         if (dist < t.r + 28 && speed < 2.0 && Math.abs(s.omega) < 0.6) {
//           onDockZone(activeZone);
//           s.x = 160;
//           s.y = 190;
//           s.vx = 0;
//           s.vy = 0;
//           s.omega = 0;
//           s.angle = Math.PI * 0.05;
//         }
//       }
//       draw();
//       raf = requestAnimationFrame(step);
//     };

//     const keyHandler = (e: KeyboardEvent) => {
//       if (e.key.toLowerCase() === "p") setPaused((p) => !p);
//       if (e.key.toLowerCase() === "r") {
//         const s = world.ship;
//         s.x = world.w / 2;
//         s.y = world.h / 2;
//         s.vx = 0;
//         s.vy = 0;
//         s.omega = 0;
//         s.angle = Math.PI * 0.05;
//         setFuel(220);
//       }
//     };

//     window.addEventListener("keydown", keyHandler);
//     draw();
//     raf = requestAnimationFrame(step);
//     return () => {
//       window.removeEventListener("keydown", keyHandler);
//       cancelAnimationFrame(raf);
//     };
//   }, [activeZone, fuel, paused, keysRef, onDockZone, world]);

//   return (
//     <div className="w-full flex flex-col gap-3 items-center">
//       <canvas
//         ref={canvasRef}
//         width={world.w}
//         height={world.h}
//         aria-label="Otter mission map"
//         className="w-full max-w-[600px] h-auto rounded-2xl shadow-lg border border-slate-800"
//       />
//       {/* touch controls */}
//       <div className="sm:hidden mt-1 flex gap-2">
//         {[
//           { k: "a", label: "←" },
//           { k: "w", label: "↑" },
//           { k: "d", label: "→" },
//           { k: "z", label: "⎵" },
//         ].map((b) => (
//           <button
//             key={b.k}
//             onTouchStart={() => (keysRef.current[b.k] = true)}
//             onTouchEnd={() => (keysRef.current[b.k] = false)}
//             className="px-4 py-2 rounded-lg bg-slate-800 active:bg-slate-700 border border-slate-700 text-slate-100"
//             aria-label={b.label}
//           >
//             {b.label}
//           </button>
//         ))}
//       </div>
//       <div className="text-xs text-slate-400 text-center">
//         Controls: <Kbd>←</Kbd>/<Kbd>→</Kbd> rotate · <Kbd>↑</Kbd> thrust ·{" "}
//         <Kbd>↓</Kbd> retro · <Kbd>Space</Kbd>/<Kbd>Z</Kbd> brake · <Kbd>P</Kbd>{" "}
//         pause · <Kbd>R</Kbd> reset
//       </div>
//     </div>
//   );
// };

// // -------------------- Main page --------------------
// const MissionOtter: React.FC = () => {
//   const [unlocked, setUnlocked] = useState<Set<ZoneKey>>(new Set()); // no persistence
//   const [activeZone, setActiveZone] = useState<ZoneKey>("about");
//   const [panelOpen, setPanelOpen] = useState(false);
//   const [panelTab, setPanelTab] = useState<ZoneKey>("about");
//   const [justDocked, setJustDocked] = useState(false);
//   const [celebrated, setCelebrated] = useState(false);

//   // force fresh game mount (prevents dev fast-refresh state carryover)
//   const [mountKey] = useState(() => Date.now());

//   // deep-link tabs (#about, #projects)
//   useEffect(() => {
//     const h = window.location.hash.replace("#", "") as ZoneKey;
//     if (ZONES.some((z) => z.key === h)) {
//       setPanelTab(h);
//       setPanelOpen(true);
//     }
//   }, []);
//   useEffect(() => {
//     if (panelOpen) window.location.hash = panelTab;
//   }, [panelOpen, panelTab]);

//   const skillBadges = useMemo(
//     () => [
//       "C++ (RAII, STL, Concurrency)",
//       "Python (NumPy, pandas, asyncio)",
//       "Simulation (game loop, physics)",
//       "Algorithms (graphs, A*, DP)",
//       "Cloud (Docker, basics of K8s)",
//       "GitHub + Testing",
//     ],
//     []
//   );

//   const handleDockZone = (zone: ZoneKey) => {
//     const next = new Set(unlocked);
//     next.add(zone);
//     setUnlocked(next);
//     setPanelTab(zone);
//     setPanelOpen(true);

//     setJustDocked(true);
//     setTimeout(() => setJustDocked(false), 4000);

//     const order = ZONES.map((z) => z.key);
//     const idx = order.indexOf(zone);
//     const remaining = order.slice(idx + 1).find((k) => !next.has(k));
//     if (remaining) setActiveZone(remaining);

//     if (order.every((k) => next.has(k))) setCelebrated(true);
//   };

//   return (
//     <div className="min-h-screen w-full text-slate-100">
//       <BackgroundStars />
//       {celebrated && <ConfettiBurst kick={Date.now()} />}

//       <header className="max-w-5xl mx-auto px-5 pt-10 pb-6 text-center relative z-10">
//         <p className="text-2xl sm:text-3xl md:text-4xl font-semibold text-slate-100">
//           Hi Starfish — I’m <span className="text-cyan-300">Meg</span>, a
//           Python/C++ engineer who builds{" "}
//           <span className="text-emerald-300">simulation</span> & autonomy
//           systems.
//         </p>
//         <h1 className="mt-3 text-lg sm:text-xl md:text-2xl font-medium text-slate-300">
//           Dock → open panel → discover why I’m a strong fit for Starfish. 🚀
//         </h1>
//       </header>

//       <section className="max-w-5xl mx-auto px-5 pb-4 relative z-10">
//         <motion.div
//           initial={{ opacity: 0, y: 8 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.4 }}
//         >
//           <MultiZoneDockingSim
//             key={mountKey}
//             activeZone={activeZone}
//             onDockZone={handleDockZone}
//           />
//         </motion.div>
//       </section>

//       {justDocked && (
//         <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 sm:hidden">
//           <button
//             onClick={() => {
//               setPanelOpen(true);
//               setJustDocked(false);
//             }}
//             className="px-4 py-2 rounded-full bg-cyan-600 text-white shadow-lg border border-cyan-400/40"
//           >
//             Open panel →
//           </button>
//         </div>
//       )}

//       <section className="max-w-5xl mx-auto px-5 pb-2 relative z-10">
//         <div className="flex flex-wrap gap-2 justify-center">
//           {skillBadges.map((b) => (
//             <Badge key={b}>{b}</Badge>
//           ))}
//         </div>
//       </section>

//       <SidePanel
//         open={panelOpen}
//         onClose={() => setPanelOpen(false)}
//         unlocked={unlocked}
//         currentTab={panelTab}
//         setCurrentTab={setPanelTab}
//       />

//       {celebrated && (
//         <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-emerald-600 text-white border border-emerald-300/40 shadow">
//           Mission Complete 🎉 — See you in Tukwila?
//         </div>
//       )}

//       <footer className="max-w-5xl mx-auto px-5 pb-10 text-xs text-slate-500 text-center relative z-10">
//         Built with React, Tailwind, and Framer Motion — thoughtfully engineered
//         to showcase simulation & systems thinking.
//       </footer>
//     </div>
//   );
// };

// export default MissionOtter;

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * 🦦 Mission Otter — Multi-Checkpoint Interactive Resume
 * - Dock at 5 zones to unlock sections in a side panel
 * - Mobile-friendly, starry backdrop, tiny confetti finish
 */

// -------------------- Small UI helpers --------------------
const Badge: React.FC<React.PropsWithChildren> = ({ children }) => (
  <span className="px-2 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-200 text-xs">
    {children}
  </span>
);

const Kbd: React.FC<React.PropsWithChildren> = ({ children }) => (
  <kbd className="px-2 py-0.5 rounded-md border border-slate-700 bg-slate-900/70 text-slate-200 text-[11px] font-mono">
    {children}
  </kbd>
);

// -------------------- Hooks / utilities --------------------
function useKeyPressMap() {
  const mapRef = useRef<Record<string, boolean>>({});
  useEffect(() => {
    const down = (e: KeyboardEvent) => (mapRef.current[e.key] = true);
    const up = (e: KeyboardEvent) => (mapRef.current[e.key] = false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);
  return mapRef;
}

const BackgroundStars: React.FC = () => {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    let w = (c.width = window.innerWidth);
    let h = (c.height = window.innerHeight);
    const onResize = () => {
      w = c.width = window.innerWidth;
      h = c.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    const stars = Array.from({ length: 240 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      s: 0.6 + Math.random() * 1.0,
      p: 0.25 + Math.random() * 0.75,
      t: Math.random() * 1000,
    }));

    let rafId = 0;
    const tick = () => {
      ctx.fillStyle = "#05070d";
      ctx.fillRect(0, 0, w, h);
      stars.forEach((st, i) => {
        const a =
          st.p + 0.55 * Math.sin((st.t + performance.now() * 0.002 + i) * 0.95);
        ctx.fillStyle = `rgba(200,220,255,${Math.max(0.08, Math.min(1, a))})`;
        ctx.fillRect(st.x, st.y, st.s, st.s);
      });
      rafId = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
    };
  }, []);
  return (
    <canvas ref={ref} className="fixed inset-0 -z-10" aria-hidden="true" />
  );
};

// tiny, no-deps confetti
const ConfettiBurst: React.FC<{ kick: number }> = ({ kick }) => {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    if (!kick) return;
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    let w = (c.width = window.innerWidth),
      h = (c.height = window.innerHeight);
    const onResize = () => {
      w = c.width = window.innerWidth;
      h = c.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    const N = 140;
    const parts = Array.from({ length: N }, () => ({
      x: w / 2,
      y: h * 0.25,
      vx: (Math.random() - 0.5) * 6,
      vy: -Math.random() * 6 - 2,
      g: 0.08 + Math.random() * 0.05,
      a: 1,
      r: 2 + Math.random() * 3,
    }));

    let t0 = performance.now();
    let rafId = 0;
    const loop = () => {
      const t = performance.now() - t0;
      ctx.clearRect(0, 0, w, h);
      parts.forEach((p) => {
        p.vy += p.g;
        p.x += p.vx;
        p.y += p.vy;
        p.a *= 0.985;
        ctx.fillStyle = `rgba(${150 + ((Math.random() * 100) | 0)},${
          150 + ((Math.random() * 100) | 0)
        },255,${p.a})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      if (t < 2200) rafId = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
    };
  }, [kick]);
  return (
    <canvas
      ref={ref}
      className="fixed inset-0 pointer-events-none z-40"
      aria-hidden="true"
    />
  );
};

// -------------------- Side panel --------------------
type ZoneKey = "about" | "why" | "projects" | "snippets" | "contact";

const ZONES: { key: ZoneKey; label: string }[] = [
  { key: "about", label: "About Me" },
  { key: "why", label: "Why Starfish" },
  { key: "projects", label: "Projects" },
  { key: "snippets", label: "Code Snippets" },
  { key: "contact", label: "Contact" },
];

const SidePanel: React.FC<{
  open: boolean;
  onClose: () => void;
  unlocked: Set<ZoneKey>;
  currentTab: ZoneKey;
  setCurrentTab: (k: ZoneKey) => void;
}> = ({ open, onClose, unlocked, currentTab, setCurrentTab }) => {
  const TabButton = ({ z }: { z: { key: ZoneKey; label: string } }) => {
    const isUnlocked = unlocked.has(z.key);
    const isActive = currentTab === z.key;
    const number = ZONES.findIndex((q) => q.key === z.key) + 1;
    return (
      <button
        disabled={!isUnlocked}
        onClick={() => isUnlocked && setCurrentTab(z.key)}
        className={[
          "w-full text-left px-3 py-2 rounded-lg border transition flex items-center gap-2",
          isActive
            ? "bg-slate-800 border-slate-600"
            : "bg-slate-900 border-slate-800 hover:bg-slate-800/70",
          !isUnlocked ? "opacity-40 cursor-not-allowed" : "",
        ].join(" ")}
      >
        <span className="text-[11px] px-2 py-0.5 rounded-full border border-slate-700 bg-slate-800/70">
          {number}
        </span>
        <span className="text-sm">{z.label}</span>
        {isUnlocked && (
          <span className="ml-auto text-emerald-400 text-xs">✔</span>
        )}
      </button>
    );
  };

  const Content: React.FC = () => {
    switch (currentTab) {
      case "about":
        return (
          <div className="space-y-2 text-sm text-slate-300">
            <p>
              Seattle-based U.S. citizen. Python & C++ engineer with hands-on
              work in simulation, autonomy, and data tooling. Former Air Force
              Research Laboratory fellow; VEX U Robotics team captain.
            </p>
            <p>
              I like hard problems with feedback loops: dynamics, control,
              planning, and the glue code that keeps experiments honest (tests,
              logs, reproducibility).
            </p>
          </div>
        );
      case "why":
        return (
          <ul className="list-disc pl-5 space-y-2 text-sm text-slate-300">
            <li>
              🌌 Building on-orbit servicing keeps space sustainable — I want to
              help make that future real.
            </li>
            <li>
              🛰️ I believe in simulation-first workflows: rapid iteration,
              measurable progress, and rigorous verification loops.
            </li>
            <li>
              🤝I thrive in small, high-trust crews where ownership,
              collaboration, and bold problem-solving matter.
            </li>
          </ul>
        );
      case "projects":
        return (
          <ul className="list-disc pl-5 space-y-2 text-sm text-slate-300">
            <li>
              <b>Orbital Mechanics Simulator (Python · Jupyter)</b> — 2-body
              propagation with clean numerics & visualizations.
            </li>
            <li>
              <b>PID Controller (C++)</b> — stabilizes a simulated robot angle;
              real-time telemetry.
            </li>
            <li>
              <b>Autonomous Path Planning (Python)</b> — A*/Dijkstra on 2D grids
              with obstacles.
            </li>
          </ul>
        );
      case "snippets":
        return (
          <div className="space-y-3">
            <details className="rounded-lg border border-slate-800 bg-slate-900/60">
              <summary className="px-3 py-2 cursor-pointer text-sm">
                Pose error & gentle-dock check (TS/JS)
              </summary>
              <pre className="m-3 whitespace-pre-wrap text-xs bg-slate-950/60 p-3 rounded-lg border border-slate-800 overflow-auto">{`// Relative pose error
function poseError(ship, target){
  const dx = target.x - ship.x, dy = target.y - ship.y;
  const range = Math.hypot(dx, dy);
  const speed = Math.hypot(ship.vx, ship.vy);
  const aligned = Math.abs(ship.omega) < 0.2;
  const gentle = speed < 0.9;
  return { range, aligned, gentle };
}
const { range, aligned, gentle } = poseError(ship, target);
if (range < target.r + 10 && aligned && gentle) dock();`}</pre>
            </details>

            <details className="rounded-lg border border-slate-800 bg-slate-900/60">
              <summary className="px-3 py-2 cursor-pointer text-sm">
                Semi-implicit Euler (pseudo)
              </summary>
              <pre className="m-3 whitespace-pre-wrap text-xs bg-slate-950/60 p-3 rounded-lg border border-slate-800 overflow-auto">{`omega += torque_cmd * dt
omega *= 0.995
angle += omega * dt
ax = sin(angle) * thrust
ay = -cos(angle) * thrust
vx += (ax / mass) * dt
vy += (ay / mass) * dt
vx *= 0.999; vy *= 0.999
x += vx; y += vy`}</pre>
            </details>
          </div>
        );
      case "contact":
        return (
          <div className="text-sm text-slate-300 space-y-3">
            <p>Open to on-site in Tukwila.</p>
            <div className="flex flex-wrap gap-2">
              <a
                href="mailto:megha.arya07@gmail.com"
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 border border-emerald-400/30 text-sm"
              >
                Email
              </a>
              <a
                href="https://github.com/MeghaArya"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm"
              >
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/megha-arya-80a264192/"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm"
              >
                LinkedIn
              </a>
            </div>
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: 500, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 500, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 24 }}
          className="fixed right-0 top-0 h-full w-[380px] max-w-[92vw] bg-slate-950/95 backdrop-blur border-l border-slate-800 z-40"
          role="dialog"
          aria-label="Profile side panel"
        >
          <div className="h-full grid grid-rows-[auto,1fr]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
              <h2 className="text-sm font-semibold">
                Mission Otter — Unlocked
              </h2>
              <button
                onClick={onClose}
                className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-[150px,1fr] overflow-hidden">
              <nav className="p-3 space-y-2 border-r border-slate-800 overflow-auto">
                {ZONES.map((z) => (
                  <TabButton key={z.key} z={z} />
                ))}
              </nav>
              <div className="p-4 overflow-auto">
                <Content />
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

// -------------------- Canvas game --------------------
const MultiZoneDockingSim: React.FC<{
  onDockZone: (zone: ZoneKey) => void;
  activeZone: ZoneKey;
}> = ({ onDockZone, activeZone }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const keysRef = useKeyPressMap();
  const [fuel, setFuel] = useState(220);
  const [paused, setPaused] = useState(false);

  const world = useMemo(() => {
    return {
      w: 600,
      h: 380,
      dt: 1 / 60,
      ship: {
        x: 600 / 2,
        y: 380 / 2,
        vx: 0,
        vy: 0,
        angle: Math.PI * 0.05,
        omega: 0,
        mass: 1,
        thrust: 8,
        torque: 1.1,
        r: 14,
      },
      targets: {
        about: { x: 490, y: 80, r: 26, color: "#67e8f9" },
        why: { x: 490, y: 300, r: 26, color: "#facc15" },
        projects: { x: 320, y: 55, r: 26, color: "#22c55e" },
        snippets: { x: 320, y: 325, r: 26, color: "#a78bfa" },
        contact: { x: 110, y: 190, r: 26, color: "#f472b6" },
      } as Record<ZoneKey, { x: number; y: number; r: number; color: string }>,
    };
  }, []);

  // helper: center reset
  const resetToCenter = () => {
    const s = world.ship;
    s.x = world.w / 2;
    s.y = world.h / 2;
    s.vx = 0;
    s.vy = 0;
    s.omega = 0;
    s.angle = Math.PI * 0.05;
  };

  useEffect(() => {
    const ctx = canvasRef.current!.getContext("2d")!;
    let rafId = 0;

    const drawFuelPill = () => {
      const hudX = 12,
        hudY = 12,
        hudW = 100,
        hudH = 22;
      ctx.save();
      ctx.globalAlpha = 0.95;
      const r = 10;
      ctx.beginPath();
      ctx.moveTo(hudX + r, hudY);
      ctx.arcTo(hudX + hudW, hudY, hudX + hudW, hudY + hudH, r);
      ctx.arcTo(hudX + hudW, hudY + hudH, hudX, hudY + hudH, r);
      ctx.arcTo(hudX, hudY + hudH, hudX, hudY, r);
      ctx.arcTo(hudX, hudY, hudX + hudW, hudY, r);
      ctx.closePath();
      ctx.fillStyle = "rgba(15,23,42,0.85)";
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 1;
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#93c5fd";
      ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textBaseline = "middle";
      ctx.textAlign = "left";
      ctx.fillText("Fuel", hudX + 10, hudY + hudH / 2);

      const pct = Math.max(0, Math.min(1, fuel / 220));
      const barX = hudX + 40,
        barY = hudY + 6,
        barW = hudW - 50,
        barH = hudH - 12;
      ctx.strokeStyle = "#475569";
      ctx.strokeRect(barX, barY, barW, barH);
      ctx.fillStyle = pct > 0.33 ? "#22c55e" : "#f97316";
      ctx.fillRect(barX + 1, barY + 1, Math.max(0, barW - 2) * pct, barH - 2);
      ctx.restore();
    };

    const draw = () => {
      ctx.clearRect(0, 0, world.w, world.h);
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fillRect(0, 0, world.w, world.h);

      // targets
      (Object.keys(world.targets) as ZoneKey[]).forEach((k) => {
        const t = world.targets[k];
        const isActive = k === activeZone;

        ctx.strokeStyle = isActive ? t.color : "#334155";
        ctx.lineWidth = isActive ? 3 : 1.5;
        ctx.save();
        if (isActive) {
          ctx.shadowColor = t.color;
          ctx.shadowBlur = 12;
        }
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        const number = ZONES.findIndex((z) => z.key === k) + 1;
        ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = isActive ? t.color : "#94a3b8";
        ctx.fillText(String(number), t.x, t.y - t.r - 12);
      });

      // ship
      const s = world.ship;
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.angle);
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.moveTo(0, -s.r);
      ctx.lineTo(s.r * 0.8, s.r);
      ctx.lineTo(-s.r * 0.8, s.r);
      ctx.closePath();
      ctx.fill();

      const thrusting =
        (keysRef.current["ArrowUp"] || keysRef.current["w"]) &&
        fuel > 0 &&
        !paused;
      if (thrusting) {
        ctx.fillStyle = "#f97316";
        ctx.beginPath();
        ctx.moveTo(0, s.r + 2);
        ctx.lineTo(6, s.r + 14 + Math.random() * 4);
        ctx.lineTo(-6, s.r + 14 + Math.random() * 4);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      drawFuelPill();
    };

    const step = () => {
      const s = world.ship;
      const dt = world.dt;
      if (!paused) {
        const left = keysRef.current["ArrowLeft"] || keysRef.current["a"];
        const right = keysRef.current["ArrowRight"] || keysRef.current["d"];
        const up = keysRef.current["ArrowUp"] || keysRef.current["w"];
        const down = keysRef.current["ArrowDown"] || keysRef.current["s"];
        const brake = keysRef.current[" "] || keysRef.current["z"];

        if (left) s.omega -= world.ship.torque * dt;
        if (right) s.omega += world.ship.torque * dt;
        s.omega *= 0.96;
        s.angle += s.omega * dt;

        if (up && fuel > 0) {
          s.vx += Math.sin(s.angle) * world.ship.thrust * dt;
          s.vy += -Math.cos(s.angle) * world.ship.thrust * dt;
          setFuel((f) => Math.max(0, f - 0.15));
        }
        if (down && fuel > 0) {
          s.vx -= Math.sin(s.angle) * world.ship.thrust * 0.8 * dt;
          s.vy -= -Math.cos(s.angle) * world.ship.thrust * 0.8 * dt;
          setFuel((f) => Math.max(0, f - 0.12));
        }

        // base damping
        s.vx *= 0.985;
        s.vy *= 0.985;

        // brake
        if (brake) {
          s.vx *= 0.9;
          s.vy *= 0.9;
          s.omega *= 0.85;
        }

        // integrate + bounds
        s.x = Math.min(Math.max(s.x + s.vx, 10), world.w - 10);
        s.y = Math.min(Math.max(s.y + s.vy, 10), world.h - 10);

        // near-target assist
        const t = world.targets[activeZone];
        const dx = t.x - s.x;
        const dy = t.y - s.y;
        const dist = Math.hypot(dx, dy);
        s.vx *= 0.983;
        s.vy *= 0.983;
        if (dist < 100) {
          s.vx *= 0.93;
          s.vy *= 0.93;
          s.omega *= 0.88;
        }

        // docking check
        const speed = Math.hypot(s.vx, s.vy);
        if (dist < t.r + 28 && speed < 2.0 && Math.abs(s.omega) < 0.6) {
          onDockZone(activeZone);
          resetToCenter();
        }
      }
      draw();
      rafId = requestAnimationFrame(step);
    };

    const keyHandler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "p") setPaused((p) => !p);
      if (e.key.toLowerCase() === "r") {
        resetToCenter();
        setFuel(220);
      }
    };

    window.addEventListener("keydown", keyHandler);
    draw();
    rafId = requestAnimationFrame(step);
    return () => {
      window.removeEventListener("keydown", keyHandler);
      cancelAnimationFrame(rafId);
    };
  }, [activeZone, fuel, paused, keysRef, onDockZone, world]);

  return (
    <div className="w-full flex flex-col gap-3 items-center">
      <canvas
        ref={canvasRef}
        width={world.w}
        height={world.h}
        aria-label="Otter mission map"
        className="w-full max-w-[600px] h-auto rounded-2xl shadow-lg border border-slate-800"
      />
      {/* touch controls */}
      <div className="sm:hidden mt-1 flex gap-2">
        {[
          { k: "a", label: "←" },
          { k: "w", label: "↑" },
          { k: "d", label: "→" },
          { k: "z", label: "⎵" },
        ].map((b) => (
          <button
            key={b.k}
            onTouchStart={() => (keysRef.current[b.k] = true)}
            onTouchEnd={() => (keysRef.current[b.k] = false)}
            className="px-4 py-2 rounded-lg bg-slate-800 active:bg-slate-700 border border-slate-700 text-slate-100"
            aria-label={b.label}
          >
            {b.label}
          </button>
        ))}
      </div>
      <div className="text-xs text-slate-400 text-center">
        Controls: <Kbd>←</Kbd>/<Kbd>→</Kbd> rotate · <Kbd>↑</Kbd> thrust ·{" "}
        <Kbd>↓</Kbd> retro · <Kbd>Space</Kbd>/<Kbd>Z</Kbd> brake · <Kbd>P</Kbd>{" "}
        pause · <Kbd>R</Kbd> reset
      </div>
    </div>
  );
};

// -------------------- Main page --------------------
const MissionOtter: React.FC = () => {
  const [unlocked, setUnlocked] = useState<Set<ZoneKey>>(new Set()); // no persistence
  const [activeZone, setActiveZone] = useState<ZoneKey>("about");
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelTab, setPanelTab] = useState<ZoneKey>("about");
  const [justDocked, setJustDocked] = useState(false);
  const [celebrated, setCelebrated] = useState(false);

  // force fresh game mount each reload (avoids dev fast-refresh state carryover)
  const [mountKey] = useState(() => Date.now());

  // deep-link tabs (#about, #projects)
  useEffect(() => {
    const h = window.location.hash.replace("#", "") as ZoneKey;
    if (ZONES.some((z) => z.key === h)) {
      setPanelTab(h);
      setPanelOpen(true);
    }
  }, []);
  useEffect(() => {
    if (panelOpen) window.location.hash = panelTab;
  }, [panelOpen, panelTab]);

  const skillBadges = useMemo(
    () => [
      "C++ (RAII, STL, Concurrency)",
      "Python (NumPy, pandas, asyncio)",
      "Simulation (game loop, physics)",
      "Algorithms (graphs, A*, DP)",
      "Cloud (Docker, basics of K8s)",
      "GitHub + Testing",
    ],
    []
  );

  const handleDockZone = (zone: ZoneKey) => {
    const next = new Set(unlocked);
    next.add(zone);
    setUnlocked(next);
    setPanelTab(zone);
    setPanelOpen(true);

    setJustDocked(true);
    setTimeout(() => setJustDocked(false), 4000);

    const order = ZONES.map((z) => z.key);
    const idx = order.indexOf(zone);
    const remaining = order.slice(idx + 1).find((k) => !next.has(k));
    if (remaining) setActiveZone(remaining);

    if (order.every((k) => next.has(k))) setCelebrated(true);
  };

  return (
    <div className="min-h-screen w-full text-slate-100">
      <BackgroundStars />
      {celebrated && <ConfettiBurst kick={Date.now()} />}

      <header className="max-w-5xl mx-auto px-5 pt-10 pb-6 text-center relative z-10">
        <p className="text-2xl sm:text-3xl md:text-4xl font-semibold text-slate-100">
          Hi Starfish — I’m <span className="text-cyan-300">Meg</span>, a
          Python/C++ engineer who builds{" "}
          <span className="text-emerald-300">simulation</span> & autonomy
          systems.
        </p>
        <h1 className="mt-3 text-lg sm:text-xl md:text-2xl font-medium text-slate-300">
          Dock → open panel → learn why I’m a strong fit for your team. 🚀
        </h1>
      </header>

      <section className="max-w-5xl mx-auto px-5 pb-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <MultiZoneDockingSim
            key={mountKey}
            activeZone={activeZone}
            onDockZone={handleDockZone}
          />
        </motion.div>
      </section>

      {justDocked && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 sm:hidden">
          <button
            onClick={() => {
              setPanelOpen(true);
              setJustDocked(false);
            }}
            className="px-4 py-2 rounded-full bg-cyan-600 text-white shadow-lg border border-cyan-400/40"
          >
            Open panel →
          </button>
        </div>
      )}

      <section className="max-w-5xl mx-auto px-5 pb-2 relative z-10">
        <div className="flex flex-wrap gap-2 justify-center">
          {skillBadges.map((b) => (
            <Badge key={b}>{b}</Badge>
          ))}
        </div>
      </section>

      <SidePanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        unlocked={unlocked}
        currentTab={panelTab}
        setCurrentTab={setPanelTab}
      />

      {celebrated && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-emerald-600 text-white border border-emerald-300/40 shadow">
          Mission Complete 🎉 — See you in Tukwila?
        </div>
      )}

      <footer className="max-w-5xl mx-auto px-5 pb-10 text-xs text-slate-500 text-center relative z-10">
        Built with React, Tailwind, and Framer Motion — thoughtfully engineered
        to showcase simulation & systems thinking.
      </footer>
    </div>
  );
};

export default MissionOtter;
