"use client"
import { useEffect, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Dot
} from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Zap, Activity, AlertTriangle } from "lucide-react";
import api from "@/lib/api";

interface ScorePoint {
  date: string;
  score: number;
  risk_level: string;
  change_delta: number;
  momentum: string;
  reason: string;
}

interface MomentumSummary {
  status: string;
  delta_7d: number;
  delta_30d: number;
  current_score: number;
  baseline_score: number;
  label: string;
}

const MOMENTUM_CONFIG: Record<string, { color: string; bg: string; icon: any; label: string }> = {
  CRITICAL:   { color: "#f43f5e", bg: "bg-rose-500/10",   icon: Zap,         label: "Critical" },
  ESCALATING: { color: "#f59e0b", bg: "bg-amber-500/10",  icon: TrendingUp,  label: "Escalating" },
  RISING:     { color: "#3b82f6", bg: "bg-blue-500/10",   icon: TrendingUp,  label: "Rising" },
  IMPROVING:  { color: "#10b981", bg: "bg-emerald-500/10",icon: TrendingDown, label: "Improving" },
  STABLE:     { color: "#6b7280", bg: "bg-slate-500/10",  icon: Minus,       label: "Stable" },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as ScorePoint;
  const cfg = MOMENTUM_CONFIG[d.momentum] || MOMENTUM_CONFIG.STABLE;

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-2xl w-64">
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{d.date}</p>
      <p className="text-3xl font-black text-white">{d.score}</p>
      <div className="flex items-center gap-2 mt-2">
        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border`}
          style={{ color: cfg.color, borderColor: cfg.color + "44", background: cfg.color + "11" }}>
          {cfg.label}
        </span>
        {d.change_delta > 0 && (
          <span className="text-[10px] font-bold text-rose-400">+{d.change_delta} pts</span>
        )}
      </div>
      <p className="text-xs text-slate-400 mt-2 italic leading-snug">"{d.reason}"</p>
    </div>
  );
};

const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  const isEscalating = ["CRITICAL", "ESCALATING"].includes(payload?.momentum);
  if (!isEscalating) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill="#f43f5e" opacity={0.9} />
      <circle cx={cx} cy={cy} r={10} fill="none" stroke="#f43f5e" strokeWidth={1} opacity={0.3} />
    </g>
  );
};

export default function ScoreTrendChart({ companyId }: { companyId: number }) {
  const [history, setHistory] = useState<ScorePoint[]>([]);
  const [momentum, setMomentum] = useState<MomentumSummary | null>(null);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [histRes, momRes] = await Promise.all([
          api.get(`/companies/${companyId}/score-history`),
          api.get(`/companies/${companyId}/momentum`)
        ]);
        setHistory(histRes.data.history || []);
        setMomentum(histRes.data.momentum || null);
        setInsights(momRes.data || null);
      } catch (e) {
        console.error("Failed to fetch score history", e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [companyId]);

  const currentMomentum = momentum?.status || "STABLE";
  const cfg = MOMENTUM_CONFIG[currentMomentum] || MOMENTUM_CONFIG.STABLE;
  const MomentumIcon = cfg.icon;

  // Dynamic gradient based on momentum
  const gradientId = "scoreGradient";

  if (loading) return (
    <div className="glass-card rounded-3xl p-8 animate-pulse h-64 flex items-center justify-center">
      <Activity size={32} className="text-slate-700 animate-pulse" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.4)]">
            <Activity size={18} className="text-white" />
          </div>
          Risk Score Trajectory
        </h2>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest"
          style={{ color: cfg.color, borderColor: cfg.color + "40", background: cfg.color + "11" }}>
          <MomentumIcon size={12} />
          {cfg.label}
        </div>
      </div>

      {/* Main Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-8 shadow-2xl"
      >
        {history.length > 0 ? (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={cfg.color} stopOpacity={0.4} />
                    <stop offset="60%"  stopColor={cfg.color} stopOpacity={0.1} />
                    <stop offset="100%" stopColor={cfg.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#3f3f46"
                  fontSize={9}
                  tickLine={false}
                  axisLine={false}
                  dy={8}
                  tickFormatter={(val) => val.slice(5)} // Show MM-DD only
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="#3f3f46"
                  fontSize={9}
                  tickLine={false}
                  axisLine={false}
                  dx={-4}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: cfg.color, strokeWidth: 1, strokeDasharray: "4 4" }} />
                {/* Critical threshold line */}
                <ReferenceLine y={80} stroke="#f43f5e" strokeDasharray="4 4" strokeOpacity={0.4} label={{ value: "Critical", fill: "#f43f5e", fontSize: 9, fontWeight: 900 }} />
                <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="4 4" strokeOpacity={0.3} />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke={cfg.color}
                  strokeWidth={3}
                  fill={`url(#${gradientId})`}
                  dot={<CustomDot />}
                  activeDot={{ r: 6, fill: cfg.color, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center">
            <p className="text-slate-600 font-bold text-sm">No trend data available yet.</p>
          </div>
        )}

        {/* Legend */}
        <div className="flex gap-6 mt-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-rose-500 opacity-50" style={{ borderTop: "1px dashed" }} />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Critical (80+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-amber-500 opacity-50" style={{ borderTop: "1px dashed" }} />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">High (60+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500" />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Escalation event</span>
          </div>
        </div>
      </motion.div>

      {/* Intelligence Insights Panel */}
      {(momentum || insights) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card rounded-2xl p-5 text-center">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] mb-2">7-Day Change</p>
            <p className={`text-xl font-black ${(momentum?.delta_7d || 0) > 0 ? "text-rose-400" : "text-emerald-400"}`}>
              {(momentum?.delta_7d || 0) > 0 ? "+" : ""}{momentum?.delta_7d ?? 0}
            </p>
          </div>
          <div className="glass-card rounded-2xl p-5 text-center">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] mb-2">30-Day Change</p>
            <p className={`text-xl font-black ${(momentum?.delta_30d || 0) > 0 ? "text-amber-400" : "text-emerald-400"}`}>
              {(momentum?.delta_30d || 0) > 0 ? "+" : ""}{momentum?.delta_30d ?? 0}
            </p>
          </div>
          <div className="glass-card rounded-2xl p-5 text-center">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] mb-2">Baseline Score</p>
            <p className="text-xl font-black text-slate-300">{momentum?.baseline_score ?? 0}</p>
          </div>
          <div className="glass-card rounded-2xl p-5 text-center">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] mb-2">Critical Events</p>
            <p className="text-xl font-black text-rose-400">{insights?.critical_event_count ?? 0}</p>
          </div>
        </div>
      )}

      {/* Headline + insights list */}
      {insights?.headline && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-6 border border-white/5"
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={14} style={{ color: cfg.color }} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: cfg.color }}>
              Momentum Intelligence
            </span>
          </div>
          <p className="text-slate-200 text-sm font-medium italic leading-relaxed mb-4">"{insights.headline}"</p>
          <ul className="space-y-2">
            {(insights.insights || []).map((item: string, i: number) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className="flex items-start gap-3 text-sm text-slate-300 font-medium"
              >
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
                {item}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
}
