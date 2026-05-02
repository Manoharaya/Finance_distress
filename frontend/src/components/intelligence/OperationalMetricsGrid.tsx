"use client"
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  Zap, 
  ShieldAlert, 
  Bell, 
  Network,
  Activity,
  ArrowUpRight
} from "lucide-react";
import { useState, useEffect } from "react";

interface MetricItem {
  value: number;
  trend: string;
  status: string;
}

interface Metrics {
  companies_monitored: MetricItem;
  distress_events_24h: MetricItem;
  high_priority_entities: MetricItem;
  new_alerts_today: MetricItem;
  network_linked_entities: MetricItem;
  updated_at: string;
}

export default function OperationalMetricsGrid() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = () => {
      fetch("http://localhost:8000/api/v1/dashboard/operational-metrics")
        .then(res => res.json())
        .then(data => {
          setMetrics(data);
          setLoading(false);
        });
    };
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // 30s refresh
    return () => clearInterval(interval);
  }, []);

  if (loading || !metrics) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="h-24 glass-card animate-pulse border-white/5" />
      ))}
    </div>
  );

  const metricCards = [
    { label: "Companies Monitored", key: "companies_monitored", icon: Building2, color: "blue" },
    { label: "Distress Signals (24h)", key: "distress_events_24h", icon: Zap, color: "amber" },
    { label: "High Priority", key: "high_priority_entities", icon: ShieldAlert, color: "rose" },
    { label: "New Alerts Today", key: "new_alerts_today", icon: Bell, color: "indigo" },
    { label: "Network Links", key: "network_linked_entities", icon: Network, color: "emerald" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {metricCards.map((card, idx) => {
        const data = metrics[card.key as keyof Metrics] as MetricItem;
        const Icon = card.icon;
        
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="glass-card p-5 group hover:border-white/20 transition-all border-white/10"
          >
            <div className="flex justify-between items-start mb-3">
              <div className={`p-2 rounded-lg bg-${card.color}-500/10 text-${card.color}-500 border border-${card.color}-500/20`}>
                <Icon size={16} />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{card.label}</span>
                <div className="flex items-center gap-1 text-[8px] font-bold text-emerald-500 uppercase tracking-tighter">
                   <Activity size={8} className="animate-pulse" /> Live
                </div>
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <AnimatePresence mode="wait">
                <motion.span
                  key={data.value}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-black text-white tracking-tighter"
                >
                  {data.value.toLocaleString()}
                </motion.span>
              </AnimatePresence>
            </div>

            <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center">
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{data.trend}</span>
               <ArrowUpRight size={10} className="text-slate-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
