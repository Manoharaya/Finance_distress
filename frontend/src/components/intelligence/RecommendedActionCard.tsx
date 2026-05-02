"use client"
import { motion } from "framer-motion";
import { 
  Flame, 
  AlertTriangle, 
  Info, 
  ChevronRight, 
  CheckCircle2, 
  ArrowRightCircle,
  ShieldAlert,
  Clock
} from "lucide-react";
import { useState, useEffect } from "react";
import { getCompanyRecommendation } from "@/lib/api";

interface Recommendation {
  score: number;
  urgency: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  action: string;
  badge: string;
  next_steps: string[];
  reasoning: string[];
  confidence_score: number;
}

export default function RecommendedActionCard({ companyId }: { companyId: number }) {
  const [rec, setRec] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCompanyRecommendation(companyId)
      .then(data => {
        setRec(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch recommendation:", err);
        setLoading(false);
      });
  }, [companyId]);

  if (loading || !rec) return (
    <div className="h-48 glass-card animate-pulse flex items-center justify-center text-slate-500 font-black tracking-widest text-[10px] uppercase">
      Analyzing Recommended Action...
    </div>
  );

  const isCritical = rec.urgency === "CRITICAL";
  const isHigh = rec.urgency === "HIGH";

  return (
    <div className={`glass-card relative overflow-hidden transition-all duration-500 ${isCritical ? 'border-rose-500/30' : isHigh ? 'border-amber-500/30' : 'border-white/5'}`}>
      {/* Background Pulse for Critical */}
      {isCritical && (
        <motion.div 
          animate={{ opacity: [0.05, 0.15, 0.05] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-rose-500 pointer-events-none"
        />
      )}

      <div className="relative z-10 p-6">
        {/* Urgency Badge */}
        <div className="flex justify-between items-start mb-6">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
            isCritical ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
            isHigh ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
            'bg-blue-500/10 border-blue-500/20 text-blue-500'
          }`}>
            {isCritical ? <Flame size={12} className="animate-pulse" /> : <ShieldAlert size={12} />}
            <span className="text-[10px] font-black uppercase tracking-widest">{rec.badge}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Advisory Score</span>
            <span className={`text-xl font-black ${isCritical ? 'text-rose-400' : 'text-slate-200'}`}>{rec.score}</span>
          </div>
        </div>

        {/* Action Statement */}
        <div className="mb-6">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Recommended Next Action</h3>
          <p className={`text-2xl font-black tracking-tight leading-tight uppercase ${isCritical ? 'text-white' : 'text-slate-100'}`}>
            {rec.action}
          </p>
        </div>

        {/* Next Steps List */}
        <div className="space-y-3 mb-8">
          {rec.next_steps.map((step, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
            >
              <ArrowRightCircle size={14} className={isCritical ? 'text-rose-500' : 'text-blue-500'} />
              <span className="text-xs font-bold text-slate-300">{step}</span>
            </motion.div>
          ))}
        </div>

        {/* Reasoning Footer */}
        <div className="pt-6 border-t border-white/5">
           <div className="flex flex-wrap gap-2">
             {rec.reasoning.map((reason, idx) => (
               <div key={idx} className="px-2 py-1 bg-black/40 rounded text-[9px] font-bold text-slate-500 border border-white/5 flex items-center gap-1.5 uppercase tracking-tighter">
                 <div className={`w-1 h-1 rounded-full ${isCritical ? 'bg-rose-500' : 'bg-blue-500'}`} />
                 {reason}
               </div>
             ))}
           </div>
        </div>

        {/* CTA Button */}
        <button className={`w-full mt-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
          isCritical ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_20px_rgba(225,29,72,0.3)]' :
          'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.2)]'
        }`}>
          Execute Advisory Workflow
        </button>
      </div>
    </div>
  );
}
