"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCompanies } from "@/lib/api";
import { Search, ArrowUpDown, ChevronRight, Target, Loader2, MessageSquareText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LeadsPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const data = await getCompanies();
        setCompanies(data);
      } catch (error) {
        console.error("Failed to fetch leads:", error);
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };
    fetchLeads();
  }, []);

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gradient uppercase">Priority Intelligence Feed</h1>
          <p className="text-slate-400 mt-2 font-medium">Strategic lead signals prioritized by distress severity and relationship risk.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search entities..." 
              className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-950/80 text-slate-500 text-[10px] uppercase tracking-[0.2em] font-black">
              <tr>
                <th className="px-8 py-6">Target Entity</th>
                <th className="px-8 py-6">Distress Score</th>
                <th className="px-8 py-6">Risk Classification</th>
                <th className="px-8 py-6">Recommended Action</th>
                <th className="px-8 py-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-8 py-6"><div className="h-10 bg-slate-800/50 rounded-lg w-48" /></td>
                    <td className="px-8 py-6"><div className="h-10 bg-slate-800/50 rounded-full w-10" /></td>
                    <td className="px-8 py-6"><div className="h-6 bg-slate-800/50 rounded-full w-32" /></td>
                    <td className="px-8 py-6"><div className="h-4 bg-slate-800/50 rounded w-64" /></td>
                    <td className="px-8 py-6"><div className="h-8 bg-slate-800/50 rounded-full w-8 ml-auto" /></td>
                  </tr>
                ))
              ) : (
                <AnimatePresence>
                  {companies.map((company, index) => (
                      <motion.tr 
                        key={company.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => router.push(`/companies/${company.id}`)}
                        className="hover:bg-white/5 transition-all group cursor-pointer"
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${company.latest_score?.score >= 60 ? 'bg-rose-500/10 text-rose-500' : 'bg-blue-500/10 text-blue-400'} border border-current/10 shadow-sm group-hover:scale-110 transition-transform`}>
                              <Target size={20} />
                            </div>
                            <div>
                              <p className="font-black text-white group-hover:text-blue-400 transition-colors text-lg uppercase tracking-tight">
                                {company.company_name}
                              </p>
                              <p className="text-xs text-slate-500 font-mono font-bold tracking-tighter uppercase">ABN: {company.abn} | {company.industry}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-3">
                              <span className={`text-2xl font-black ${company.latest_score?.score >= 80 ? 'text-rose-500' : company.latest_score?.score >= 60 ? 'text-amber-500' : 'text-blue-400'} tracking-tighter`}>
                                {company.latest_score?.score || 0}
                              </span>
                              <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${company.latest_score?.score || 0}%` }}
                                  className={`h-full ${company.latest_score?.score >= 80 ? 'bg-rose-500' : company.latest_score?.score >= 60 ? 'bg-amber-500' : 'bg-blue-400'}`} 
                                />
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-lg
                            ${company.latest_score?.score >= 80 ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 
                              company.latest_score?.score >= 60 ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                              'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                            {company.latest_score?.risk_level || 'Monitor'}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3 text-slate-200 text-sm font-black uppercase tracking-widest">
                            <MessageSquareText size={16} className={company.latest_score?.score >= 80 ? 'text-rose-500' : 'text-blue-400'} />
                            {company.latest_score?.recommended_action || "Baseline Monitoring"}
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                            <div className="p-2 bg-blue-600 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.5)]">
                               <ChevronRight size={18} className="text-white" />
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] py-8 border-t border-white/5 mt-10">
        <Loader2 size={14} className="animate-spin" />
        Live Intelligence OS syncing with AU Federal Courts
      </div>
    </div>
  );
}
