"use client"
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  Search, 
  Shield, 
  Radar, 
  Network, 
  BellOff, 
  Clock,
  Activity
} from "lucide-react";
import { EMPTY_STATES, EmptyStateKey } from "@/constants/emptyStates";

const iconMap = {
  ShieldCheck,
  Search,
  Shield,
  Radar,
  Network,
  BellOff,
  Clock
};

interface EmptyStateProps {
  stateKey: EmptyStateKey;
  compact?: boolean;
}

export default function EmptyStateIntelligence({ stateKey, compact = false }: EmptyStateProps) {
  const { title, description, icon } = EMPTY_STATES[stateKey];
  const IconComponent = iconMap[icon as keyof typeof iconMap] || Shield;

  return (
    <div className={`flex flex-col items-center justify-center text-center px-6 py-12 glass-card border-dashed border-white/5 bg-transparent shadow-none ${compact ? 'py-6' : 'min-h-[200px]'}`}>
      {/* Radar Animation for Background */}
      <div className="relative mb-6">
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0, 0.1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl"
        />
        <div className="relative w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
          <IconComponent size={compact ? 24 : 32} className="text-slate-500" />
        </div>
      </div>

      <div className="max-w-md">
        <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {title}
        </h3>
        <p className="text-xs font-bold text-slate-500 leading-relaxed">
          {description}
        </p>
      </div>

      {!compact && (
        <div className="mt-8 flex items-center gap-2 px-4 py-2 bg-black/40 rounded-full border border-white/5">
          <Activity size={10} className="text-emerald-500" />
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
            Real-time monitoring active across all sources
          </span>
        </div>
      )}
    </div>
  );
}
