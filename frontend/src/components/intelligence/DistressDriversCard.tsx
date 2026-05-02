"use client"
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Gavel, UserMinus, Clock, Lock, MapPin, Network,
  TrendingUp, TrendingDown, Minus, ChevronDown,
  AlertTriangle, ShieldAlert, Info, Zap
} from "lucide-react";
import SignalSourceBadge from "@/components/intelligence/SignalSourceBadge";

interface Driver {
  title: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  weight: number;
  source: string;
  confidence: number;
  icon: string;
  detail?: string;
}

interface Momentum {
  momentum: string;
  label: string;
  pct_change: number;
  direction: string;
}

interface DistressDriversCardProps {
  drivers: Driver[];
  momentum: Momentum;
  executive_explanation: string;
  top_driver?: Driver;
  total_drivers: number;
  risk_level: string;
  recommended_action: string;
}

const SEVERITY_CONFIG = {
  CRITICAL: {
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    text: "text-rose-400",
    dot: "bg-rose-500",
    badge: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    pulse: true
  },
  HIGH: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-400",
    dot: "bg-amber-500",
    badge: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    pulse: false
  },
  MEDIUM: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    text: "text-blue-400",
    dot: "bg-blue-500",
    badge: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    pulse: false
  },
  LOW: {
    bg: "bg-slate-800/50",
    border: "border-slate-700/30",
    text: "text-slate-400",
    dot: "bg-slate-500",
    badge: "bg-slate-700/50 text-slate-400 border-slate-600/30",
    pulse: false
  }
};

const ICON_MAP: Record<string, any> = {
  gavel: Gavel,
  user_minus: UserMinus,
  clock: Clock,
  lock: Lock,
  map_pin: MapPin,
  network: Network
};

const MomentumIcon = ({ direction }: { direction: string }) => {
  if (direction === "up") return <TrendingUp size={16} className="text-rose-400" />;
  if (direction === "down") return <TrendingDown size={16} className="text-emerald-400" />;
  return <Minus size={16} className="text-slate-400" />;
};

function DriverRow({ driver, index }: { driver: Driver; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = SEVERITY_CONFIG[driver.severity] || SEVERITY_CONFIG.LOW;
  const Icon = ICON_MAP[driver.icon] || AlertTriangle;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`rounded-2xl border ${cfg.border} ${cfg.bg} overflow-hidden`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/5 transition-all"
      >
        {/* Severity dot */}
        <div className="relative flex-shrink-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.bg} border ${cfg.border}`}>
            <Icon size={18} className={cfg.text} />
          </div>
          {cfg.pulse && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
            </span>
          )}
        </div>

        {/* Title & source */}
        <div className="flex-1 min-w-0">
          <p className="font-black text-white text-sm tracking-tight leading-snug">{driver.title}</p>
          <div className="mt-2">
            <SignalSourceBadge source={driver.source} size="sm" />
          </div>
        </div>

        {/* Right: badges */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${cfg.badge}`}>
            {driver.severity}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500">Confidence:</span>
            <span className={`text-[10px] font-black ${cfg.text}`}>{driver.confidence}%</span>
          </div>
        </div>

        {/* Expand chevron */}
        <ChevronDown
          size={16}
          className={`text-slate-600 transition-transform flex-shrink-0 ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {/* Expandable detail */}
      <AnimatePresence>
        {expanded && driver.detail && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-white/5 pt-4">
              <p className="text-sm text-slate-300 leading-relaxed italic font-medium">
                "{driver.detail}"
              </p>
              {/* Impact bar */}
              <div className="mt-4 flex items-center gap-3">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Impact Weight</span>
                <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${driver.weight}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className={`h-full ${driver.severity === "CRITICAL" ? "bg-rose-500" : driver.severity === "HIGH" ? "bg-amber-500" : "bg-blue-500"} rounded-full`}
                  />
                </div>
                <span className="text-[10px] font-black text-slate-400">{driver.weight}/100</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function DistressDriversCard({
  drivers,
  momentum,
  executive_explanation,
  top_driver,
  total_drivers,
  risk_level,
  recommended_action
}: DistressDriversCardProps) {
  const momentumColor = momentum.direction === "up"
    ? "text-rose-400"
    : momentum.direction === "down"
    ? "text-emerald-400"
    : "text-slate-400";

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
          <div className="p-2 bg-rose-600 rounded-lg shadow-[0_0_15px_rgba(244,63,94,0.4)]">
            <ShieldAlert size={18} className="text-white" />
          </div>
          Distress Drivers
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] bg-white/5 border border-white/5 px-4 py-2 rounded-full">
            {total_drivers} Signals
          </span>
        </div>
      </div>

      {/* Top signal highlight (Critical only) */}
      {top_driver && top_driver.severity === "CRITICAL" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-950/60 to-slate-950 border border-rose-500/30 p-6 shadow-[0_0_30px_rgba(244,63,94,0.1)]"
        >
          <div className="absolute top-0 right-0 opacity-5 pointer-events-none">
            <Zap size={180} />
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-rose-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
            </span>
            <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em]">Most Critical Signal</span>
          </div>
          <p className="text-lg font-black text-white tracking-tight">{top_driver.title}</p>
          <div className="flex items-center gap-4 mt-4">
            <span className="text-[10px] font-black text-rose-400/70 uppercase tracking-widest">Source: {top_driver.source}</span>
            <span className="text-[10px] font-black text-rose-400/70 uppercase tracking-widest">Confidence: {top_driver.confidence}%</span>
          </div>
        </motion.div>
      )}

      {/* Momentum row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 text-center">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] mb-2">Momentum</p>
          <div className={`flex items-center justify-center gap-2 font-black text-sm ${momentumColor}`}>
            <MomentumIcon direction={momentum.direction} />
            {momentum.momentum}
          </div>
        </div>
        <div className="glass-card rounded-2xl p-5 text-center">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] mb-2">Score Change</p>
          <p className={`font-black text-sm ${momentumColor}`}>
            {momentum.pct_change > 0 ? "+" : ""}{momentum.pct_change}%
          </p>
        </div>
        <div className="glass-card rounded-2xl p-5 text-center">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] mb-2">Action</p>
          <p className="font-black text-xs text-white uppercase tracking-tight">{recommended_action}</p>
        </div>
      </div>

      {/* AI Executive Explanation */}
      {executive_explanation && (
        <div className="glass-card rounded-2xl p-6 border border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <Info size={14} className="text-blue-400" />
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Intelligence Assessment</span>
          </div>
          <p className="text-slate-200 text-sm leading-relaxed font-medium italic">
            "{executive_explanation}"
          </p>
        </div>
      )}

      {/* Driver list */}
      <div className="space-y-3">
        {drivers.map((driver, i) => (
          <DriverRow key={i} driver={driver} index={i} />
        ))}
      </div>

      {drivers.length === 0 && (
        <div className="glass-card rounded-2xl p-10 text-center">
          <p className="text-slate-500 font-bold text-sm">No distress drivers detected yet. Monitoring active.</p>
        </div>
      )}
    </div>
  );
}
