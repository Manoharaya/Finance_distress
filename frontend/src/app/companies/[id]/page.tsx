"use client"
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getCompanyDetail, getCompanyTimeline, getDistressDrivers, getConfidenceReport, getNetworkRisk } from "@/lib/api";
import Timeline from "@/components/intelligence/Timeline";
import IntelligenceGraph from "@/components/intelligence/IntelligenceGraph";
import DistressDriversCard from "@/components/intelligence/DistressDriversCard";
import ScoreTrendChart from "@/components/intelligence/ScoreTrendChart";
import ConfidenceScoreCard from "@/components/intelligence/ConfidenceScoreCard";
import NetworkRiskExposureCard from "@/components/intelligence/NetworkRiskExposureCard";
import DataFreshnessIndicator from "@/components/intelligence/DataFreshnessIndicator";
import RecommendedActionCard from "@/components/intelligence/RecommendedActionCard";
import DistressMomentumCard from "@/components/intelligence/DistressMomentumCard";
import { 
  Building2, Users, Link as LinkIcon, ShieldAlert, 
  MapPin, Calendar, Fingerprint, ExternalLink,
  ChevronLeft, Info, Loader2, Sparkles
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function CompanyProfile() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any>(null);
  const [confidence, setConfidence] = useState<any>(null);
  const [networkRisk, setNetworkRisk] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [companyData, timelineData, driversData, confidenceData, networkData] = await Promise.all([
          getCompanyDetail(Number(id)),
          getCompanyTimeline(Number(id)),
          getDistressDrivers(Number(id)),
          getConfidenceReport(Number(id)),
          getNetworkRisk(Number(id))
        ]);
        setData(companyData);
        setTimeline(timelineData);
        setDrivers(driversData);
        setConfidence(confidenceData);
        setNetworkRisk(networkData);
      } catch (error) {
        console.error("Failed to fetch company details:", error);
      } finally {
        setTimeout(() => setLoading(false), 1000);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return (
    <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
      <Loader2 size={48} className="text-blue-500 animate-spin" />
      <div className="text-center">
        <p className="text-xl font-black text-white tracking-tighter uppercase">Decoding Intelligence...</p>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em] mt-2">Connecting to ASIC & Federal Court Registries</p>
      </div>
    </div>
  );
  
  if (!data) return <div className="p-8 text-rose-500 font-bold">CRITICAL: Entity not found in intelligence database.</div>;

  const { company, latest_score } = data;
  const scoreValue = latest_score?.score || 0;

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-20">
      {/* Breadcrumbs */}
      <Link href="/leads" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-400 transition-all w-fit group">
        <div className="p-1 rounded-full bg-slate-900 border border-slate-800 group-hover:border-blue-500/50">
          <ChevronLeft size={16} />
        </div>
        BACK TO INTELLIGENCE FEED
      </Link>

      {/* Header Profile */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-10 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-white/5"
      >
        <div className="absolute top-0 right-0 p-10 hidden lg:block">
           <div className="text-center bg-black/40 backdrop-blur-xl p-8 rounded-2xl border border-white/5 shadow-inner">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Distress Score</p>
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 12 }}
                className={`text-7xl font-black ${scoreValue >= 70 ? 'text-rose-500' : 'text-amber-500'} tracking-tighter`}
              >
                {scoreValue}
              </motion.div>
              <p className="text-[10px] font-black text-slate-400 mt-3 uppercase tracking-[0.2em] px-3 py-1 bg-white/5 rounded-full border border-white/5">
                {latest_score?.risk_level || 'Calculating...'}
              </p>
           </div>
        </div>

        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10 text-center lg:text-left">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className={`p-8 rounded-3xl ${scoreValue >= 70 ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'} border shadow-2xl`}
          >
            <Building2 size={64} />
          </motion.div>
          <div className="flex-1">
            <h1 className="text-5xl font-black text-white tracking-tight leading-tight uppercase">{company.company_name}</h1>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-6">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                <Fingerprint size={16} className="text-blue-500" />
                <span className="font-mono uppercase tracking-tighter text-sm">ABN: {company.abn}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                <MapPin size={16} className="text-blue-500" />
                <span className="uppercase tracking-widest">AUSTRALIA</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-white/5 px-4 py-2 rounded-xl border border-white/5 text-sm">
                <Calendar size={16} className="text-blue-500" />
                <span className="uppercase tracking-widest">{new Date(company.registration_date).toLocaleDateString()}</span>
              </div>
              <div className={`flex items-center gap-2 text-xs font-black px-4 py-2 rounded-xl border uppercase tracking-[0.2em] shadow-lg
                ${company.entity_status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                {company.entity_status}
              </div>
              <DataFreshnessIndicator variant="profile" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Strategic Intelligence Row — Score, Momentum, and Action */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <ScoreTrendChart companyId={Number(id)} />
          </motion.div>
        </div>
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.11 }}
          >
            <DistressMomentumCard companyId={Number(id)} />
          </motion.div>
        </div>
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
          >
            <RecommendedActionCard companyId={Number(id)} />
          </motion.div>
        </div>
      </div>

      {/* Confidence Score Intelligence Module */}
      {confidence && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          <ConfidenceScoreCard report={confidence} />
        </motion.div>
      )}

      {/* Network Risk Exposure Module */}
      {networkRisk && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
        >
          <NetworkRiskExposureCard report={networkRisk} />
        </motion.div>
      )}

      {/* Distress Drivers — Main Explainability Module */}
      {drivers && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <DistressDriversCard
            drivers={drivers.drivers || []}
            momentum={drivers.momentum || {}}
            executive_explanation={drivers.executive_explanation || ""}
            top_driver={drivers.top_driver}
            total_drivers={drivers.total_drivers || 0}
            risk_level={drivers.risk_level || "Monitor"}
            recommended_action={drivers.recommended_action || "Monitor"}
          />
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
           {/* Relationship Graph Section */}
           <div className="space-y-4">
              <h2 className="text-xl font-black flex items-center gap-3 text-white uppercase tracking-tighter px-2">
                <div className="p-2 bg-blue-600 rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                   <LinkIcon size={18} className="text-white" />
                </div>
                Relationship Intelligence Map
              </h2>
              <IntelligenceGraph />
           </div>

           {/* Timeline Section */}
           <div className="space-y-6">
              <div className="flex justify-between items-center px-2">
                 <h2 className="text-xl font-black flex items-center gap-3 text-white uppercase tracking-tighter">
                   <div className="p-2 bg-blue-600 rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                      <ShieldAlert size={18} className="text-white" />
                   </div>
                   Chronological Risk Signals
                 </h2>
                 <div className="text-[10px] font-black text-slate-500 bg-white/5 border border-white/5 px-4 py-2 rounded-full uppercase tracking-[0.2em]">
                   {timeline.length} Signals Captured
                 </div>
              </div>
              <Timeline events={timeline} />
           </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-10">
           {/* AI Analyst Summary */}
           <motion.div 
             whileHover={{ y: -5 }}
             className="bg-gradient-to-br from-blue-700 via-indigo-900 to-slate-950 rounded-3xl p-8 shadow-[0_20px_40px_rgba(37,99,235,0.2)] text-white relative overflow-hidden group border border-white/10"
           >
              <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-125 transition-transform duration-1000 pointer-events-none">
                <ShieldAlert size={160} />
              </div>
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
                   <Sparkles size={20} className="text-blue-300" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-blue-200">
                  AGENT ANALYST SUMMARY
                </h3>
              </div>
              <p className="text-md leading-relaxed text-blue-50/90 font-medium italic relative z-10">
                "{latest_score?.recommendation || "Our neural intelligence engine is currently synthesizing a custom risk profile for this entity. Expected completion in < 2ms."}"
              </p>
              <div className="mt-8 pt-8 border-t border-white/10 flex flex-col gap-3">
                 <button className="w-full bg-white text-slate-950 hover:bg-blue-50 py-4 rounded-2xl text-xs font-black transition-all shadow-xl uppercase tracking-[0.1em]">
                   Initiate Strategic Outreach
                 </button>
                 <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-2xl text-[10px] font-bold transition-all uppercase tracking-[0.1em] text-white/60">
                   Generate Investigation PDF
                 </button>
              </div>
           </motion.div>

           {/* Director Interlocks */}
           <div className="glass-card rounded-3xl p-8 shadow-xl">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2 mb-8">
                <Users size={16} className="text-blue-500" />
                Director Interlocks
              </h3>
              <div className="space-y-6">
                 {[1, 2].map((i) => (
                   <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-blue-500/30 transition-all cursor-pointer group shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-black text-slate-600 group-hover:text-blue-400 transition-colors shadow-inner">
                          {i === 1 ? 'GV' : 'MW'}
                        </div>
                        <div>
                          <p className="text-sm font-black text-white uppercase tracking-tight">{i === 1 ? 'Gregory Vance' : 'Mark Wilson'}</p>
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">{i === 1 ? '3 Companies Linked' : '1 Company Linked'}</p>
                        </div>
                      </div>
                      <ExternalLink size={14} className="text-slate-700 group-hover:text-blue-500 transition-colors" />
                   </div>
                 ))}
              </div>
              <button className="mt-8 w-full text-center text-[10px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-[0.2em] transition-colors">
                View Full Network Graph
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
