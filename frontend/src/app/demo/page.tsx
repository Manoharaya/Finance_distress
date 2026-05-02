"use client"
import { useEffect, useState } from "react";
import OperationalMetricsGrid from "@/components/intelligence/OperationalMetricsGrid";
import ExecutiveBriefingCard from "@/components/intelligence/ExecutiveBriefingCard";
import LatestIntelligenceFeed from "@/components/intelligence/LatestIntelligenceFeed";
import { Sparkles, ShieldCheck, Zap, ArrowRight, ShieldAlert, Building2, PlayCircle } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function DemoDashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // In demo mode, we force the components to use demo endpoints or fixed data
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-blue-500/30 pb-20">
      {/* Demo Top Banner */}
      <div className="bg-blue-600 px-8 py-2 flex items-center justify-between border-b border-blue-400/20 sticky top-0 z-[100] shadow-[0_0_30px_rgba(37,99,235,0.2)]">
        <div className="flex items-center gap-3">
          <ShieldCheck size={14} className="text-white" />
          <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
            Deterministic Demo Environment Active • System Isolated
          </span>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 px-2 py-0.5 bg-black/20 rounded-full border border-white/5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] font-black text-white uppercase tracking-tighter">API Simulation: 100% Stable</span>
           </div>
           <Link href="/">
             <button className="text-[9px] font-black text-blue-100 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-1.5">
               Exit Demo <Zap size={10} />
             </button>
           </Link>
        </div>
      </div>

      <div className="p-8 space-y-10 max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-blue-400" />
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Vortex Intel • Enterprise Demo</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-gradient uppercase">
              Intelligence Operations Center
            </h1>
            <p className="text-slate-400 mt-2 font-medium">Real-time surveillance walkthrough featuring the 'Gregory Vance' contagion arc.</p>
          </div>
          
          <div className="flex gap-4">
            <Link href="/demo/narrative" className="bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3">
              <PlayCircle size={14} className="text-blue-400" />
              Launch Cinematic Walkthrough
            </Link>
            <div className="bg-slate-900/50 border border-slate-800 px-6 py-3 rounded-2xl">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Demo State</p>
               <p className="text-xs font-bold text-emerald-400 uppercase">Synchronized</p>
            </div>
          </div>
        </div>

        {/* Operational Metrics — Perfectly Seeded */}
        <OperationalMetricsGrid />
        
        {/* AI Executive Briefing — Fixed Narrative */}
        <ExecutiveBriefingCard />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-3 glass-card rounded-3xl p-8 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
              <div>
                 <h2 className="text-sm font-black text-slate-200 uppercase tracking-[0.2em] flex items-center gap-3">
                   <ShieldAlert size={18} className="text-rose-500" />
                   High-Density Intelligence Feed
                 </h2>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Simulated Monitoring Pulse • v1.0 Dataset</p>
              </div>
              <div className="flex gap-4">
                 <div className="px-3 py-1 bg-black/40 border border-white/5 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest">
                   Entities Monitored: 1,284
                 </div>
                 <div className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-lg text-[9px] font-black text-rose-500 uppercase tracking-widest">
                   Priority Signals: 12
                 </div>
              </div>
            </div>
            <LatestIntelligenceFeed />
          </motion.div>
        </div>

        {/* Wow Moment Integration: Network Risk */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="glass-card p-10 rounded-3xl border-white/5 bg-gradient-to-br from-indigo-600/5 to-transparent">
              <Building2 size={32} className="text-blue-400 mb-6" />
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Network Contagion Detection</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                Exposing the 'Vortex' effect: Observe how Gregory Vance's historical liquidation at Vance Civil (Construction) ripple-triggered the current critical distress at Horizon Transport (Logistics).
              </p>
              <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                Analyze Contagion Graph
              </button>
           </div>
           
           <div className="glass-card p-10 rounded-3xl border-white/5 bg-gradient-to-br from-rose-600/5 to-transparent">
              <ShieldAlert size={32} className="text-rose-400 mb-6" />
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Distress Predictive Analytics</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                The deterministic model correctly predicted the distress of Harbor Hospitality 14 days in advance based purely on director associations and sectoral legal velocity.
              </p>
              <button className="bg-rose-600 hover:bg-rose-500 text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                View Predictive Signals
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
