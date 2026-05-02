"use client"
import { motion } from "framer-motion";
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  ChevronRight,
  ShieldCheck,
  Zap
} from "lucide-react";
import { useState, useEffect } from "react";
import { getExecutiveBriefing } from "@/lib/api";

interface Briefing {
  title: string;
  summary: string;
  key_insights: string[];
  risk_level: string;
  sectors: any[];
}

export default function ExecutiveBriefingCard() {
  const [data, setData] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getExecutiveBriefing()
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch executive briefing:", err);
        setLoading(false);
      });
  }, []);

  if (loading || !data) return (
    <div className="h-64 glass-card animate-pulse flex items-center justify-center text-slate-500 font-black tracking-widest text-[10px] uppercase">
      Synthesizing Executive Briefing...
    </div>
  );

  const isStable = data.risk_level === "STABLE";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card relative overflow-hidden bg-gradient-to-br from-blue-600/5 to-indigo-600/5 border-white/10"
    >
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
        <Brain size={120} />
      </div>

      <div className="p-8">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center border border-blue-500/20">
              <Brain size={20} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">{data.title}</h2>
              <p className="text-[9px] font-bold text-blue-500/60 uppercase tracking-widest">AI-Generated Intelligence</p>
            </div>
          </div>
          <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${
            isStable ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400 animate-pulse'
          }`}>
             Risk Level: {data.risk_level}
          </div>
        </div>

        <div className="max-w-3xl mb-8">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg text-slate-200 leading-relaxed font-medium"
          >
            {data.summary}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/5">
          <div>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Key Insights</h3>
            <div className="space-y-3">
              {data.key_insights.map((insight, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <p className="text-xs font-bold text-slate-400 leading-snug uppercase tracking-tight">{insight}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Sector Signals</h3>
            <div className="flex flex-wrap gap-3">
              {data.sectors.map((s, idx) => (
                <div key={idx} className={`px-4 py-3 rounded-2xl border flex flex-col gap-1 transition-all hover:scale-105 ${
                  s.risk_level === 'CRITICAL' ? 'bg-rose-500/5 border-rose-500/20' : 
                  s.risk_level === 'ELEVATED' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-white/5 border-white/10'
                }`}>
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{s.sector}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-200">{s.avg_score}</span>
                    <div className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                      s.risk_level === 'CRITICAL' ? 'bg-rose-500/20 text-rose-500' : 
                      s.risk_level === 'ELEVATED' ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-500'
                    }`}>
                      {s.risk_level}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
