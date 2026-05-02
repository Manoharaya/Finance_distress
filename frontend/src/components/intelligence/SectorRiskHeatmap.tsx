"use client"
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  ChevronRight,
  ShieldAlert,
  Zap,
  Activity,
  Layers
} from "lucide-react";
import { useState, useEffect } from "react";
import { getSectorRisk } from "@/lib/api";

interface SectorRisk {
  sector: string;
  risk_level: string;
  avg_score: number;
  momentum: number;
  legal_signals: number;
  company_count: number;
}

export default function SectorRiskHeatmap() {
  const [data, setData] = useState<SectorRisk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSectorRisk()
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch sector risk:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="h-64 glass-card animate-pulse flex items-center justify-center text-slate-500 font-black tracking-widest text-[10px] uppercase">
      Analyzing Macro Sector Distress...
    </div>
  );

  if (data.length === 0) return null;

  const getRiskColor = (level: string) => {
    switch (level) {
      case "HIGH": return "rose";
      case "ELEVATED": return "amber";
      case "ESCALATING": return "orange";
      case "MODERATE": return "yellow";
      default: return "blue";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2 mb-2">
        <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
          <Layers size={16} className="text-blue-500" />
          Macro Sector Risk Heatmap
        </h2>
        <span className="text-[10px] font-black text-slate-600 bg-white/5 px-2 py-0.5 rounded-full border border-white/5 uppercase tracking-widest">
          Industry Intensity Overlay
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.map((item, idx) => {
          const color = getRiskColor(item.risk_level);
          const isHigh = item.risk_level === "HIGH" || item.risk_level === "ESCALATING";
          
          return (
            <motion.div
              key={item.sector}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className={`glass-card p-6 border transition-all duration-300 relative overflow-hidden group hover:scale-[1.02] ${
                color === 'rose' ? 'bg-rose-500/5 border-rose-500/20' : 
                color === 'amber' ? 'bg-amber-500/5 border-amber-500/20' :
                color === 'orange' ? 'bg-orange-500/5 border-orange-500/20' : 'bg-white/5 border-white/10'
              }`}
            >
              {isHigh && (
                <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-${color}-500/10 blur-3xl rounded-full animate-pulse`} />
              )}
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{item.company_count} Entities</span>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight">{item.sector}</h3>
                </div>
                <div className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${
                  color === 'rose' ? 'bg-rose-500/20 text-rose-500' : 
                  color === 'amber' ? 'bg-amber-500/20 text-amber-500' :
                  color === 'orange' ? 'bg-orange-500/20 text-orange-500' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {item.risk_level}
                </div>
              </div>

              <div className="flex items-end gap-3 mb-6 relative z-10">
                <span className={`text-3xl font-black tracking-tighter ${
                  color === 'rose' ? 'text-rose-500' : 
                  color === 'amber' ? 'text-amber-500' : 'text-white'
                }`}>
                  {item.avg_score}
                </span>
                <div className="flex flex-col">
                   <div className={`flex items-center gap-1 text-[10px] font-black ${item.momentum >= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {item.momentum >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {item.momentum >= 0 ? `+${item.momentum}` : item.momentum}
                   </div>
                   <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Velocity</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-between items-center relative z-10">
                 <div className="flex items-center gap-2">
                    <Zap size={10} className="text-slate-500" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.legal_signals} Legal Signals</span>
                 </div>
                 <ChevronRight size={14} className="text-slate-700 group-hover:text-white transition-colors" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
