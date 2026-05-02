"use client"
import { motion } from "framer-motion";
import { useState } from "react";
import { getSourceConfig, TRUST_LEVEL_LABELS } from "@/constants/signalSources";

interface SignalSourceBadgeProps {
  source?: string;
  showReliability?: boolean;
  showTrustLevel?: boolean;
  size?: "sm" | "md" | "lg";
  animate?: boolean;
  className?: string;
}

const SIZE_CONFIG = {
  sm: { text: "text-[9px]", icon: 11, px: "px-2.5 py-1",   gap: "gap-1.5" },
  md: { text: "text-[10px]",icon: 13, px: "px-3 py-1.5",  gap: "gap-2"   },
  lg: { text: "text-xs",    icon: 15, px: "px-4 py-2",     gap: "gap-2.5" },
};

export default function SignalSourceBadge({
  source,
  showReliability = false,
  showTrustLevel  = false,
  size            = "md",
  animate         = false,
  className       = "",
}: SignalSourceBadgeProps) {
  const [hovered, setHovered] = useState(false);
  const cfg  = getSourceConfig(source);
  const sz   = SIZE_CONFIG[size];
  const Icon = cfg.icon;
  const isVerified = cfg.trustLevel === "VERIFIED";

  return (
    <div className="relative inline-flex">
      <motion.div
        whileHover={{ scale: 1.04, y: -1 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`
          inline-flex items-center ${sz.gap} ${sz.px} rounded-full border
          cursor-default select-none transition-all duration-200
          ${cfg.bgClass} ${cfg.borderClass} ${cfg.glowClass || ""}
          ${className}
        `}
      >
        {/* Verified pulse */}
        {isVerified && animate && (
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${cfg.bgClass.replace("/10","/40")}`} />
            <span className={`relative inline-flex h-2 w-2 rounded-full ${cfg.bgClass.replace("bg-","bg-").replace("/10","/80")}`} style={{ background: "currentColor" }} />
          </span>
        )}

        <Icon size={sz.icon} className={cfg.colorClass} strokeWidth={1.5} />
        <span className={`font-black uppercase tracking-widest ${sz.text} ${cfg.colorClass}`}>
          {cfg.label}
        </span>

        {showReliability && (
          <span className={`font-bold ${sz.text} opacity-60 ${cfg.colorClass}`}>
            {cfg.reliability}%
          </span>
        )}
      </motion.div>

      {/* Hover tooltip */}
      {hovered && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 w-52 bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-2xl pointer-events-none"
        >
          <div className={`flex items-center gap-2 mb-3`}>
            <Icon size={14} className={cfg.colorClass} />
            <span className={`text-[10px] font-black uppercase tracking-widest ${cfg.colorClass}`}>
              {cfg.label}
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Trust Level</span>
              <span className={`text-[9px] font-black uppercase ${cfg.colorClass}`}>
                {TRUST_LEVEL_LABELS[cfg.trustLevel] || cfg.trustLevel}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Reliability</span>
              <span className="text-[9px] font-black text-white">{cfg.reliability}%</span>
            </div>
            {/* Reliability bar */}
            <div className="h-1 bg-slate-900 rounded-full overflow-hidden mt-2">
              <div
                className="h-full rounded-full"
                style={{ width: `${cfg.reliability}%`, background: "currentColor" }}
              />
            </div>
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-slate-800" />
        </motion.div>
      )}
    </div>
  );
}

// Multi-source stack — shows multiple badges for corroborated signals
export function SourceStack({ sources, maxVisible = 3 }: { sources: string[]; maxVisible?: number }) {
  const unique = [...new Set(sources)];
  const visible = unique.slice(0, maxVisible);
  const overflow = unique.length - maxVisible;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visible.map((src, i) => (
        <SignalSourceBadge key={i} source={src} size="sm" animate />
      ))}
      {overflow > 0 && (
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-2 py-1 bg-slate-800 rounded-full border border-slate-700">
          +{overflow}
        </span>
      )}
    </div>
  );
}
