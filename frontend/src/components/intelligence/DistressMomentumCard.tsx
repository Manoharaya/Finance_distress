"use client"
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  AlertTriangle,
  Zap,
  Activity
} from "lucide-react";
import { useState, useEffect } from "react";
import { getCompanyMomentum } from "@/lib/api";

interface Momentum {
  momentum: number;
  trend: string;
  current_score: number;
  previous_score: number;
  label: string;
  direction: string;
}

export default function DistressMomentumCard({ companyId }: { companyId: number }) {
  const [data, setData] = useState<Momentum | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCompanyMomentum(companyId)
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch momentum:", err);
        setLoading(false);
      });
  }, [companyId]);

  if (loading || !data) return (
    <div className="h-32 glass-card animate-pulse flex items-center justify-center text-slate-500 font-black tracking-widest text-[10px] uppercase">
      Calculating Risk Velocity...
    </div>
  );

  const isUp = data.direction === "UPWARD";
  const isDown = data.direction === "DOWNWARD";
  const isNeutral = data.direction === "NEUTRAL";

  const getUrgencyColor = () => {
    if (data.trend === "ACCELERATING") return "text-rose-500";
    if (data.trend === "RISING") return "text-amber-500";
    if (data.trend === "IMPROVING") return "text-emerald-500";
    return "text-slate-400";
  };

  const getUrgencyBg = () => {
    if (data.trend === "ACCELERATING") return "bg-rose-500/10 border-rose-500/20";
    if (data.trend === "RISING") return "bg-amber-500/10 border-amber-500/20";
    if (data.trend === "IMPROVING") return "bg-emerald-500/10 border-emerald-500/20";
    return "bg-slate-500/10 border-slate-500/20";
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`glass-card p-6 border transition-all duration-300 ${getUrgencyBg()}`}
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Distress Momentum</h3>
          <p className="text-[9px] font-bold text-blue-500/60 uppercase tracking-tighter">7-Day Velocity Analysis</p>
        </div>
        <div className={`p-2 rounded-lg bg-black/20 ${getUrgencyColor()}`}>
          {isUp ? <TrendingUp size={16} /> : isDown ? <TrendingDown size={16} /> : <Minus size={16} />}
        </div>
      </div>

      <div className="flex items-end gap-3 mb-4">
        <span className={`text-4xl font-black tracking-tighter ${getUrgencyColor()}`}>
          {data.momentum > 0 ? `+${data.momentum}` : data.momentum}
        </span>
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
          Points this week
        </span>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
           <Activity size={12} className={getUrgencyColor()} />
           <span className={`text-xs font-black uppercase tracking-tight ${getUrgencyColor()}`}>
             Risk is {data.trend.toLowerCase()}
           </span>
        </div>
        
        <p className="text-[11px] text-slate-400 font-bold leading-snug uppercase tracking-tight opacity-80">
          {data.label}
        </p>

        <div className="pt-4 border-t border-white/5 flex justify-between items-center">
           <div className="flex flex-col">
              <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Previous Baseline</span>
              <span className="text-xs font-black text-slate-400">{data.previous_score}</span>
           </div>
           <div className="flex flex-col items-end">
              <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Current State</span>
              <span className="text-xs font-black text-white">{data.current_score}</span>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
