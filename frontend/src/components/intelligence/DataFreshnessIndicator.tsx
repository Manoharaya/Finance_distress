"use client"
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getSystemStatus } from "@/lib/api";
import { Activity, Clock, ShieldCheck, Database, Zap, AlertCircle } from "lucide-react";

interface StatusData {
  monitoring_status: string;
  system_health: string;
  intelligence_freshness: {
    last_updated: string;
    last_updated_mins: number;
    level: string;
    last_scrape_time: string;
    active_scrapers: number;
  };
  operational_metrics: {
    scrapers_online: number;
    recent_failures: number;
  };
}

const FRESHNESS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  LIVE:   { color: "#10b981", bg: "bg-emerald-500/10", label: "LIVE" },
  FRESH:  { color: "#10b981", bg: "bg-emerald-500/10", label: "FRESH" },
  RECENT: { color: "#3b82f6", bg: "bg-blue-500/10",    label: "RECENT" },
  AGING:  { color: "#f59e0b", bg: "bg-amber-500/10",   label: "AGING" },
  STALE:  { color: "#f43f5e", bg: "bg-rose-500/10",    label: "STALE" },
};

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string; icon: any }> = {
  ACTIVE:   { color: "#10b981", bg: "bg-emerald-500/10", label: "MONITORING ACTIVE", icon: Zap },
  DEGRADED: { color: "#f59e0b", bg: "bg-amber-500/10",  label: "SYSTEM DEGRADED",   icon: AlertCircle },
  DELAYED:  { color: "#f43f5e", bg: "bg-rose-500/10",   label: "INGESTION DELAYED", icon: Clock },
  OFFLINE:  { color: "#6b7280", bg: "bg-slate-700/10",   label: "MONITORING OFFLINE", icon: AlertCircle },
};

export default function DataFreshnessIndicator({ variant = "dashboard" }: { variant?: "dashboard" | "profile" }) {
  const [data, setData] = useState<StatusData | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await getSystemStatus();
      setData(res);
    } catch (error) {
      console.error("Failed to fetch status:", error);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  if (!data) return null;

  const f = data.intelligence_freshness;
  const s = STATUS_CONFIG[data.monitoring_status] || STATUS_CONFIG.ACTIVE;
  const fc = FRESHNESS_CONFIG[f.level] || FRESHNESS_CONFIG.LIVE;

  if (variant === "dashboard") {
    return (
      <div className="flex flex-wrap items-center gap-6 px-6 py-3 bg-white/5 border border-white/5 rounded-2xl backdrop-blur-md">
        {/* Monitoring Status */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75`} style={{ backgroundColor: s.color }}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3`} style={{ backgroundColor: s.color }}></span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-white">{s.label}</span>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Status: {data.system_health}</span>
          </div>
        </div>

        <div className="h-8 w-px bg-white/10 hidden sm:block" />

        {/* Freshness Indicator */}
        <div className="flex items-center gap-3">
          <Clock size={14} className="text-blue-400" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Updated {f.last_updated}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-black ${fc.bg}`} style={{ color: fc.color }}>{fc.label}</span>
            </div>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Last Scrape: {f.last_scrape_time}</span>
          </div>
        </div>

        <div className="h-8 w-px bg-white/10 hidden lg:block" />

        {/* Source Stats */}
        <div className="flex items-center gap-3 hidden lg:flex">
          <Database size={14} className="text-indigo-400" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-white">{f.active_scrapers} ACTIVE SOURCES</span>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Ingestion Rate: Normal</span>
          </div>
        </div>
      </div>
    );
  }

  // Profile variant — more compact
  return (
    <div className="flex items-center gap-4 py-2 px-4 rounded-xl bg-white/5 border border-white/5">
      <div className="flex items-center gap-2">
        <div className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75`} style={{ backgroundColor: s.color }}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2`} style={{ backgroundColor: s.color }}></span>
        </div>
        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Live Monitoring Active</span>
      </div>
      <div className="h-4 w-px bg-white/10" />
      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
        <Clock size={11} /> Updated {f.last_updated}
      </span>
      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black ${fc.bg}`} style={{ color: fc.color }}>{fc.label} FRESHNESS</span>
    </div>
  );
}
