"use client";

import { motion } from "motion/react";

// The 10 required shots, in upload order — slot N is "done" once the Nth
// photo has been uploaded. We don't classify what angle a photo actually
// shows (that would need real image analysis); this tracks progress
// against the checklist, not automatic angle detection.
//
// Slot 1 is fixed as the primary/cover shot (3/4 front driver-side) —
// it's what images[0] always is, and what every grid/hero view renders
// as the vehicle's main photo.
export const PHOTO_GUIDE_COVER_SLOT = 1;
export const PHOTO_GUIDE_SHOTS = [
  { n: 1, label: "Portada — 3/4 delantera lado conductor", x: 65, y: 34 },
  { n: 2, label: "Parrilla central", x: 100, y: 22 },
  { n: 3, label: "Delantera derecha", x: 135, y: 34 },
  { n: 4, label: "Trasera izquierda", x: 65, y: 306 },
  { n: 5, label: "Baúl central", x: 100, y: 318 },
  { n: 6, label: "Trasera derecha", x: 135, y: 306 },
  { n: 7, label: "Perfil lado conductor", x: 26, y: 170 },
  { n: 8, label: "Perfil lado acompañante", x: 174, y: 170 },
  { n: 9, label: "Tablero / cabina delantera", x: 100, y: 118 },
  { n: 10, label: "Asientos traseros", x: 100, y: 222 },
] as const;

export const PHOTO_GUIDE_TOTAL = PHOTO_GUIDE_SHOTS.length;

export function PhotoGuideDiagram({ completedCount }: { completedCount: number }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <svg viewBox="0 0 200 340" className="h-auto w-32 shrink-0 self-center sm:self-start" aria-hidden="true">
        {/* Top-down car silhouette */}
        <rect x="50" y="20" width="100" height="300" rx="26" fill="#FFFFFF" stroke="#D2D2D7" strokeWidth="2" />
        {/* Windshield / rear glass hints */}
        <rect x="62" y="95" width="76" height="46" rx="8" fill="#F5F5F7" />
        <rect x="62" y="199" width="76" height="46" rx="8" fill="#F5F5F7" />
        {/* Wheels */}
        <rect x="38" y="58" width="12" height="34" rx="5" fill="#1D1D1F" />
        <rect x="150" y="58" width="12" height="34" rx="5" fill="#1D1D1F" />
        <rect x="38" y="248" width="12" height="34" rx="5" fill="#1D1D1F" />
        <rect x="150" y="248" width="12" height="34" rx="5" fill="#1D1D1F" />

        {PHOTO_GUIDE_SHOTS.map((shot) => {
          const done = completedCount >= shot.n;
          const isCover = shot.n === PHOTO_GUIDE_COVER_SLOT;
          return (
            <motion.g key={shot.n} initial={false} animate={{ scale: done ? 1.08 : 1 }} style={{ originX: `${shot.x}px`, originY: `${shot.y}px` }}>
              {/* Cover slot gets a permanent outer ring marking it as the fixed hero shot */}
              {isCover && (
                <circle cx={shot.x} cy={shot.y} r={14} fill="none" stroke="#0071E3" strokeWidth={1.2} strokeDasharray="2.5 2.5" opacity={0.6} />
              )}
              <motion.circle
                cx={shot.x}
                cy={shot.y}
                r={10}
                initial={false}
                animate={{
                  fill: done ? "#0071E3" : "#F5F5F7",
                  stroke: done ? "#0071E3" : "#D2D2D7",
                }}
                transition={{ type: "spring", stiffness: 380, damping: 26 }}
                strokeWidth={1.5}
              />
              <text
                x={shot.x}
                y={shot.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="9"
                fontWeight={700}
                fill={done ? "#FFFFFF" : "#6E6E73"}
              >
                {shot.n}
              </text>
            </motion.g>
          );
        })}
      </svg>

      <ul className="grid flex-1 grid-cols-1 gap-x-3 gap-y-1 text-[11px] text-[#6E6E73] sm:grid-cols-2">
        {PHOTO_GUIDE_SHOTS.map((shot) => {
          const done = completedCount >= shot.n;
          const isCover = shot.n === PHOTO_GUIDE_COVER_SLOT;
          return (
            <li key={shot.n} className="flex items-center gap-1.5">
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold transition-colors ${
                  isCover
                    ? `ring-2 ring-offset-1 ${done ? "ring-[#0071E3]" : "ring-[#0071E3]/40"}`
                    : ""
                } ${done ? "bg-[#0071E3] text-white" : "bg-black/[0.06] text-[#8E8E93]"}`}
              >
                {shot.n}
              </span>
              <span className={done ? "font-medium text-[#1D1D1F]" : undefined}>{shot.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
