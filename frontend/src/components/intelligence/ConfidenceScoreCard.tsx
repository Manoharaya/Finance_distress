"use client"
import { motion } from "framer-motion";
import { Shield, ShieldCheck, ShieldAlert, ShieldX, CheckCircle2, Clock, Network, Database } from "lucide-react";

interface SourceBreakdown {
  source: string;
  trust_score: number;
  tier: string;
  contribution: number;
}

interface ConfidenceReport {
  confidence_score: number;
  confidence_level: string;
  reasoning: string[];
  source_breakdown: SourceBreakdown[];
  freshness: { label: string; tier: string; has_fresh_signal: boolean };
  event_count: number;
  high_trust_sources: number;
  corroboration_count: number;
  distress_score: number;
}

const LEVEL_CONFIG: Record<string, {
  color: string; bg: string; border: string;
  icon: any; label: string; glow: string;
}> = {
  "VERY HIGH": {
    color: "#10b981", bg: "bg-emerald-500/10", border: "border-emerald-500/30",
    icon: ShieldCheck, label: "VERIFIED", glow: "shadow-[0_0_30px_rgba(16,185,129,0.2)]"
  },
  HIGH: {
    color: "#3b82f6", bg: "bg-blue-500/10", border: "border-blue-500/30",
    icon: Shield, label: "HIGH", glow: "shadow-[0_0_20px_rgba(59,130,246,0.15)]"
  },
  MODERATE: {
    color: "#f59e0b", bg: "bg-amber-500/10", border: "border-amber-500/30",
    icon: ShieldAlert, label: "MODERATE", glow: ""
  },
  LOW: {
    color: "#6b7280", bg: "bg-slate-700/30", border: "border-slate-600/30",
    icon: ShieldX, label: "LOW", glow: ""
  },
};

const TIER_COLORS: Record<string, string> = {
  VERIFIED:  "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  HIGH:      "text-blue-400 bg-blue-500/10 border-blue-500/20",
  MODERATE:  "text-amber-400 bg-amber-500/10 border-amber-500/20",
  UNCERTAIN: "text-slate-400 bg-slate-700/30 border-slate-600/30",
};

// Animated radial gauge
function ConfidenceGauge({ score, color }: { score: number; color: string }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-40 h-40">
      <svg className="absolute" width="160" height="160" viewBox="0 0 160 160">
        {/* Track */}
        <circle cx="80" cy="80" r={radius} fill="none" stroke="#1f1f23" strokeWidth="10" />
        {/* Progress */}
        <motion.circle
          cx="80" cy="80" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - filled }}
          transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
          style={{ transform: "rotate(-90deg)", transformOrigin: "center", filter: `drop-shadow(0 0 6px ${color}80)` }}
        />
      </svg>
      {/* Center value */}
      <div className="relative text-center z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="text-4xl font-black"
          style={{ color }}
        >
          {score}
        </motion.div>
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-0.5">/ 100</p>
      </div>
    </div>
  );
}

export default function ConfidenceScoreCard({ report }: { report: ConfidenceReport }) {
  if (!report) return null;
  const cfg = LEVEL_CONFIG[report.confidence_level] || LEVEL_CONFIG.LOW;
  const LevelIcon = cfg.icon;
  const isVeryHigh = report.confidence_level === "VERY HIGH";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
          <div className="p-2 rounded-lg shadow-lg" style={{ background: cfg.color + "22", border: `1px solid ${cfg.color}44` }}>
            <LevelIcon size={18} style={{ color: cfg.color }} />
          </div>
          Intelligence Confidence
        </h2>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest ${cfg.bg} ${cfg.border}`}
          style={{ color: cfg.color }}>
          {isVeryHigh && <span className="flex h-2 w-2 relative mr-1">
            <span className="animate-ping absolute h-2 w-2 rounded-full opacity-75" style={{ background: cfg.color }} />
            <span className="relative h-2 w-2 rounded-full" style={{ background: cfg.color }} />
          </span>}
          {cfg.label} CONFIDENCE
        </div>
      </div>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`glass-card rounded-3xl p-8 border ${cfg.border} ${cfg.glow}`}
      >
        <div className="flex flex-col md:flex-row items-center gap-10">
          {/* Gauge */}
          <div className="flex flex-col items-center gap-3 flex-shrink-0">
            <ConfidenceGauge score={report.confidence_score} color={cfg.color} />
            <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${cfg.bg} ${cfg.border}`}
              style={{ color: cfg.color }}>
              {report.confidence_level} CONFIDENCE
            </div>
          </div>

          {/* Stats column */}
          <div className="flex-1 space-y-4 w-full">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Signals", value: report.event_count, icon: Database },
                { label: "Verified Sources", value: report.high_trust_sources, icon: CheckCircle2 },
                { label: "Corroborations", value: report.corroboration_count, icon: Network },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-white/5 rounded-2xl p-4 text-center border border-white/5">
                  <Icon size={14} className="text-slate-500 mx-auto mb-2" />
                  <p className="text-xl font-black text-white">{value}</p>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">{label}</p>
                </div>
              ))}
            </div>

            {/* Freshness badge */}
            <div className={`flex items-center gap-3 p-4 rounded-2xl border ${report.freshness?.has_fresh_signal ? "bg-emerald-500/5 border-emerald-500/20" : "bg-white/5 border-white/5"}`}>
              <Clock size={14} className={report.freshness?.has_fresh_signal ? "text-emerald-400" : "text-slate-500"} />
              <p className={`text-xs font-bold ${report.freshness?.has_fresh_signal ? "text-emerald-300" : "text-slate-400"}`}>
                {report.freshness?.label || "No freshness data"}
              </p>
              <span className={`ml-auto text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${report.freshness?.has_fresh_signal ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-slate-500 bg-white/5 border-white/5"}`}>
                {report.freshness?.tier || "UNKNOWN"}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Source reliability breakdown */}
      {report.source_breakdown?.length > 0 && (
        <div className="glass-card rounded-3xl p-6">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-5 flex items-center gap-2">
            <Database size={14} className="text-blue-400" /> Source Trust Registry
          </h3>
          <div className="space-y-3">
            {report.source_breakdown.map((src, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all"
              >
                <div className="flex-1">
                  <p className="text-sm font-black text-white">{src.source}</p>
                </div>
                {/* Trust bar */}
                <div className="flex items-center gap-3 w-40">
                  <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${src.trust_score}%` }}
                      transition={{ duration: 0.8, delay: i * 0.07 }}
                      className="h-full rounded-full"
                      style={{ background: src.trust_score >= 90 ? "#10b981" : src.trust_score >= 75 ? "#3b82f6" : "#f59e0b" }}
                    />
                  </div>
                  <span className="text-xs font-black text-slate-300 w-8">{src.trust_score}</span>
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${TIER_COLORS[src.tier] || TIER_COLORS.UNCERTAIN}`}>
                  {src.tier}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Reasoning bullets */}
      {report.reasoning?.length > 0 && (
        <div className="glass-card rounded-3xl p-6">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-5 flex items-center gap-2">
            <ShieldCheck size={14} className="text-blue-400" /> Confidence Rationale
          </h3>
          <ul className="space-y-3">
            {report.reasoning.map((reason, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
                className="flex items-start gap-3 text-sm text-slate-300 font-medium"
              >
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
                {reason}
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
