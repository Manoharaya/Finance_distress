"use client"
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import StatCard from "@/components/dashboard/StatCard";
import { Building2, AlertTriangle, TrendingUp, ArrowUpRight, Clock, ShieldAlert, Loader2, Sparkles } from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { getDashboardSummary } from "@/lib/api";
import Link from "next/link";
import SignalSourceBadge from "@/components/intelligence/SignalSourceBadge";
import LatestIntelligenceFeed from "@/components/intelligence/LatestIntelligenceFeed";
import DataFreshnessIndicator from "@/components/intelligence/DataFreshnessIndicator";
import ExecutiveBriefingCard from "@/components/intelligence/ExecutiveBriefingCard";
import OperationalMetricsGrid from "@/components/intelligence/OperationalMetricsGrid";
import SectorRiskHeatmap from "@/components/intelligence/SectorRiskHeatmap";

export default function Home() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await getDashboardSummary();
        setSummary(data);
      } catch (error) {
        console.error("Failed to fetch summary:", error);
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };
    fetchSummary();
  }, []);

  if (loading) return (
    <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
      <Loader2 size={48} className="text-blue-500 animate-spin" />
      <p className="text-sm font-black text-slate-500 uppercase tracking-[0.3em]">Initializing Analyst Terminal...</p>
    </div>
  );

  const chartData = [
    { name: 'Jan', value: 40 },
    { name: 'Feb', value: 30 },
    { name: 'Mar', value: 65 },
    { name: 'Apr', value: 45 },
    { name: 'May', value: 90 },
    { name: 'Jun', value: 75 },
  ];

  const riskDistribution = [
    { name: 'Critical', count: summary?.high_risk_companies || 0, color: '#f43f5e' },
    { name: 'Monitor', count: summary?.total_companies - summary?.high_risk_companies || 0, color: '#fbbf24' },
  ];

  return (
    <div className="space-y-10 max-w-[1400px] mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-blue-400" />
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">System Intelligence v4.2</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-gradient uppercase">
            Analyst Command Center
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Real-time surveillance of Australian corporate distress signals.</p>
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
          <div className="flex gap-4 w-full md:w-auto">
            <Link href="/leads" className="flex-1 md:flex-none text-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl text-xs font-black transition-all hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] uppercase tracking-widest">
              Priority Leads Feed
            </Link>
          </div>
          <DataFreshnessIndicator />
        </div>
      </div>

      {/* Operational Intelligence Metrics — Perception of Scale */}
      <OperationalMetricsGrid />
      
      {/* AI Executive Briefing — Strategic Intelligence Layer */}
      <ExecutiveBriefingCard />

      {/* Macro Sector Risk Heatmap — Economic Distress Overlay */}
      <SectorRiskHeatmap />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 glass-card rounded-3xl p-8 shadow-2xl"
        >
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-sm font-black flex items-center gap-3 text-white uppercase tracking-[0.2em]">
              <TrendingUp size={18} className="text-blue-500" />
              Market Distress Velocity
            </h2>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" vertical={false} />
                <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', border: '1px solid #1f1f23', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="value" stroke="#2563eb" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-3xl p-8 shadow-2xl"
        >
          <h2 className="text-sm font-black mb-10 flex items-center gap-3 text-white uppercase tracking-[0.2em]">
            <ShieldAlert size={18} className="text-rose-500" />
            Risk Classification
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskDistribution} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} width={70} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#09090b', border: '1px solid #1f1f23', borderRadius: '12px' }}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={24}>
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 space-y-4">
            {riskDistribution.map((item) => (
              <div key={item.name} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="text-sm font-black text-white">{item.count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-3 glass-card rounded-3xl p-8 shadow-2xl"
        >
          <LatestIntelligenceFeed />
        </motion.div>

      </div>
    </div>
  );
}
