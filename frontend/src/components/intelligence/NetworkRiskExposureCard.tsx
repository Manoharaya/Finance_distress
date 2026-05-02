"use client"
import { motion } from "framer-motion";
import { Network, AlertTriangle, Building2, Users, Zap, ShieldAlert, ArrowUpRight, CheckCircle } from "lucide-react";
import Link from "next/link";

interface LinkedEntity {
  id: number;
  name: string;
  industry: string;
  status: string;
  distress_score: number;
  risk_level: string;
  is_liquidated: boolean;
  is_distressed: boolean;
}

interface DirectorProfile {
  director_id: number;
  full_name: string;
  total_companies: number;
  active_companies: number;
  liquidated_companies: number;
  reputation_index: number;
  risk_score: number;
  role?: string;
  insights: string[];
}

interface NetworkRiskReport {
  network_exposure_score: number;
  risk_level: string;
  summary: string[];
  metrics: {
    total_linked_entities: number;
    distressed_entities: number;
    liquidated_entities: number;
    shared_directors: number;
    high_risk_directors: number;
    repeat_distress_directors: number;
    cross_legal_actions: number;
  };
  cascading_risk: string;
  is_cascading: boolean;
  linked_entities: LinkedEntity[];
  director_profiles: DirectorProfile[];
  score_breakdown: { factor: string; points: number }[];
}

const RISK_CONFIG = {
  HIGH:     { color: "#f43f5e", bg: "bg-rose-500/10",   border: "border-rose-500/30",   glow: "shadow-[0_0_25px_rgba(244,63,94,0.15)]",  label: "HIGH EXPOSURE" },
  MODERATE: { color: "#f59e0b", bg: "bg-amber-500/10",  border: "border-amber-500/30",  glow: "",                                          label: "MODERATE" },
  LOW:      { color: "#10b981", bg: "bg-emerald-500/10",border: "border-emerald-500/30",glow: "",                                          label: "LOW EXPOSURE" },
};

function ExposureGauge({ score, color }: { score: number; color: string }) {
  const r = 46;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative flex items-center justify-center w-28 h-28">
      <svg width="112" height="112" viewBox="0 0 112 112" className="absolute">
        <circle cx="56" cy="56" r={r} fill="none" stroke="#1f1f23" strokeWidth="8" />
        <motion.circle
          cx="56" cy="56" r={r} fill="none"
          stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (score / 100) * circ }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ transform: "rotate(-90deg)", transformOrigin: "center", filter: `drop-shadow(0 0 4px ${color}80)` }}
        />
      </svg>
      <div className="relative text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-2xl font-black" style={{ color }}
        >{score}</motion.p>
        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">/100</p>
      </div>
    </div>
  );
}

function EntityPill({ entity }: { entity: LinkedEntity }) {
  const isLiquidated = entity.is_liquidated;
  const isDistressed = entity.is_distressed;

  return (
    <Link href={`/companies/${entity.id}`}>
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all duration-200
          ${isLiquidated ? "bg-rose-500/5 border-rose-500/20 hover:bg-rose-500/10" :
            isDistressed ? "bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10" :
            "bg-white/5 border-white/5 hover:bg-white/10"}`}
      >
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isLiquidated ? "bg-rose-500" : isDistressed ? "bg-amber-500" : "bg-emerald-500"}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-white truncate tracking-tight">{entity.name}</p>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{entity.industry} · {entity.status}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {entity.distress_score > 0 && (
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
              isLiquidated ? "text-rose-400 bg-rose-500/10 border-rose-500/20" :
              isDistressed ? "text-amber-400 bg-amber-500/10 border-amber-500/20" :
              "text-slate-400 bg-white/5 border-white/5"
            }`}>Score: {entity.distress_score}</span>
          )}
          {isLiquidated && (
            <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest">LIQUIDATED</span>
          )}
        </div>
        <ArrowUpRight size={13} className="text-slate-600 flex-shrink-0" />
      </motion.div>
    </Link>
  );
}

function DirectorCard({ profile }: { profile: DirectorProfile }) {
  const repColor = profile.reputation_index >= 70 ? "#10b981" : profile.reputation_index >= 40 ? "#f59e0b" : "#f43f5e";

  return (
    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-black text-white tracking-tight">{profile.full_name}</p>
          {profile.role && <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{profile.role}</p>}
        </div>
        <div className="text-right">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Rep. Index</p>
          <p className="text-lg font-black" style={{ color: repColor }}>{profile.reputation_index}</p>
        </div>
      </div>
      <div className="flex gap-3 text-center">
        {[
          { label: "Companies", value: profile.total_companies },
          { label: "Active",    value: profile.active_companies },
          { label: "Failed",    value: profile.liquidated_companies, alert: profile.liquidated_companies > 0 },
        ].map(({ label, value, alert }) => (
          <div key={label} className={`flex-1 rounded-xl p-2.5 ${alert ? "bg-rose-500/10 border border-rose-500/20" : "bg-white/5"}`}>
            <p className={`text-base font-black ${alert ? "text-rose-400" : "text-white"}`}>{value}</p>
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-0.5">{label}</p>
          </div>
        ))}
      </div>
      {profile.insights.slice(0, 2).map((insight, i) => (
        <div key={i} className="flex items-start gap-2 text-xs text-slate-400 font-medium">
          <span className="mt-1.5 w-1 h-1 rounded-full bg-amber-500 flex-shrink-0" />
          {insight}
        </div>
      ))}
    </div>
  );
}

export default function NetworkRiskExposureCard({ report }: { report: NetworkRiskReport }) {
  if (!report) return null;
  const cfg = RISK_CONFIG[report.risk_level as keyof typeof RISK_CONFIG] || RISK_CONFIG.LOW;
  const { metrics } = report;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
          <div className="p-2 rounded-lg shadow-lg" style={{ background: cfg.color + "22", border: `1px solid ${cfg.color}44` }}>
            <Network size={18} style={{ color: cfg.color }} />
          </div>
          Network Risk Exposure
        </h2>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest"
          style={{ color: cfg.color, borderColor: cfg.color + "40", background: cfg.color + "11" }}>
          {report.is_cascading && <Zap size={12} />}
          {cfg.label}
        </div>
      </div>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`glass-card rounded-3xl p-8 border ${cfg.border} ${cfg.glow}`}
      >
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          {/* Gauge */}
          <div className="flex flex-col items-center gap-3 flex-shrink-0">
            <ExposureGauge score={report.network_exposure_score} color={cfg.color} />
            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500">Exposure Score</span>
          </div>

          {/* Metrics grid */}
          <div className="flex-1 w-full space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Linked Entities",  value: metrics.total_linked_entities, icon: Building2,   alert: false },
                { label: "Distressed",        value: metrics.distressed_entities,   icon: AlertTriangle,alert: metrics.distressed_entities > 0 },
                { label: "Liquidated",        value: metrics.liquidated_entities,   icon: ShieldAlert,  alert: metrics.liquidated_entities > 0 },
                { label: "High-Risk Directors",value: metrics.high_risk_directors,  icon: Users,        alert: metrics.high_risk_directors > 0 },
              ].map(({ label, value, icon: Icon, alert }) => (
                <div key={label} className={`rounded-2xl p-4 text-center border transition-all
                  ${alert && value > 0 ? "bg-rose-500/10 border-rose-500/20" : "bg-white/5 border-white/5"}`}>
                  <Icon size={15} className={alert && value > 0 ? "text-rose-400 mx-auto mb-2" : "text-slate-500 mx-auto mb-2"} />
                  <p className={`text-2xl font-black ${alert && value > 0 ? "text-rose-400" : "text-white"}`}>{value}</p>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1 leading-tight">{label}</p>
                </div>
              ))}
            </div>

            {/* Cascading risk indicator */}
            <div className={`flex items-center gap-3 p-4 rounded-2xl border ${
              report.is_cascading
                ? "bg-rose-500/10 border-rose-500/20"
                : "bg-white/5 border-white/5"
            }`}>
              {report.is_cascading
                ? <Zap size={14} className="text-rose-400 flex-shrink-0" />
                : <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
              }
              <div>
                <p className={`text-xs font-black uppercase tracking-widest ${report.is_cascading ? "text-rose-400" : "text-emerald-400"}`}>
                  Cascading Risk: {report.cascading_risk}
                </p>
                {report.is_cascading && (
                  <p className="text-[10px] text-rose-400/70 font-medium mt-0.5">
                    Distress signals detected across multiple connected entities simultaneously
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Intelligence summary bullets */}
      {report.summary.length > 0 && (
        <div className="glass-card rounded-3xl p-6">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-5 flex items-center gap-2">
            <ShieldAlert size={14} style={{ color: cfg.color }} /> Network Intelligence
          </h3>
          <ul className="space-y-3">
            {report.summary.map((s, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex items-start gap-3 text-sm text-slate-300 font-medium"
              >
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
                {s}
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      {/* Linked entities */}
      {report.linked_entities.length > 0 && (
        <div className="glass-card rounded-3xl p-6">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-5 flex items-center gap-2">
            <Building2 size={14} className="text-blue-400" /> Linked Entity Network
            <span className="ml-auto text-[9px] font-black text-slate-600 bg-white/5 border border-white/5 px-3 py-1 rounded-full">
              {report.linked_entities.length} entities
            </span>
          </h3>
          <div className="space-y-2">
            {report.linked_entities.map((entity) => (
              <EntityPill key={entity.id} entity={entity} />
            ))}
          </div>
        </div>
      )}

      {/* Director profiles */}
      {report.director_profiles.length > 0 && (
        <div className="glass-card rounded-3xl p-6">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-5 flex items-center gap-2">
            <Users size={14} className="text-indigo-400" /> Director Risk Intelligence
          </h3>
          <div className="space-y-3">
            {report.director_profiles.map((dp) => (
              <DirectorCard key={dp.director_id} profile={dp} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
