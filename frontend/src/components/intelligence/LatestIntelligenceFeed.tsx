"use client"
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getIntelligenceFeed } from "@/lib/api";
import SignalSourceBadge from "@/components/intelligence/SignalSourceBadge";
import { Clock, Zap, AlertTriangle, Info, ChevronRight, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface FeedItem {
  id: number;
  company_id: number;
  company_name: string;
  feed_type: string;
  severity: string;
  source: string;
  title: string;
  summary: string;
  event_time: string;
}

const SEVERITY_CONFIG: Record<string, { color: string; bg: string; border: string; icon: any }> = {
  CRITICAL: { color: "#f43f5e", bg: "bg-rose-500/10", border: "border-rose-500/30", icon: Zap },
  HIGH:     { color: "#f59e0b", bg: "bg-amber-500/10", border: "border-amber-500/30", icon: AlertTriangle },
  MEDIUM:   { color: "#3b82f6", bg: "bg-blue-500/10", border: "border-blue-500/30", icon: Info },
  LOW:      { color: "#94a3b8", bg: "bg-slate-700/10", border: "border-slate-700/30", icon: Info },
};

import EmptyStateIntelligence from "@/components/intelligence/EmptyStateIntelligence";

export default function LatestIntelligenceFeed() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeed = async () => {
    try {
      const data = await getIntelligenceFeed();
      setItems(data);
    } catch (error) {
      console.error("Failed to fetch intelligence feed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
    const interval = setInterval(fetchFeed, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, []);

  if (loading && items.length === 0) {
    return (
      <div className="flex flex-col gap-4 p-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 w-full bg-white/5 animate-pulse rounded-2xl border border-white/5" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return <EmptyStateIntelligence stateKey="NO_EVENTS" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2 mb-2">
        <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Latest Intelligence Feed
        </h2>
        <span className="text-[10px] font-black text-slate-600 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
          LIVE MONITORING
        </span>
      </div>

      <div className="relative max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence initial={false}>
          {items.map((item) => {
            const cfg = SEVERITY_CONFIG[item.severity] || SEVERITY_CONFIG.LOW;
            const Icon = cfg.icon;
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: "auto" }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="mb-3"
              >
                <div className={`
                  glass-card rounded-2xl p-4 border transition-all duration-300 hover:border-slate-700
                  ${item.severity === "CRITICAL" ? "border-rose-500/20" : ""}
                `}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-wrap gap-2">
                      <SignalSourceBadge source={item.source} size="sm" animate={item.severity === "CRITICAL"} />
                      <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${cfg.bg} ${cfg.border}`} style={{ color: cfg.color }}>
                        {item.severity}
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 flex items-center gap-1">
                      <Clock size={10} />
                      {formatDistanceToNow(new Date(item.event_time), { addSuffix: true })}
                    </span>
                  </div>

                  <Link href={`/companies/${item.company_id}`}>
                    <h3 className="text-white font-black text-sm tracking-tight hover:text-blue-400 transition-colors cursor-pointer uppercase">
                      {item.title}
                    </h3>
                  </Link>
                  
                  <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-tighter opacity-80">
                    {item.company_name}
                  </p>
                  
                  <p className="text-slate-400 text-xs leading-relaxed mt-2 line-clamp-2">
                    {item.summary}
                  </p>

                  <div className="mt-3 flex justify-end">
                    <Link href={`/companies/${item.company_id}`}>
                      <button className="flex items-center gap-1 text-[9px] font-black text-blue-500/70 hover:text-blue-400 uppercase tracking-widest transition-colors">
                        Full Intelligence <ChevronRight size={10} />
                      </button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
