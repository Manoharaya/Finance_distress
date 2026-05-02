"use client"
import { useState, useEffect, useRef } from "react";
import { Search, X, Building2, User, FileText, ChevronRight, Loader2, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import EmptyStateIntelligence from "@/components/intelligence/EmptyStateIntelligence";

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults(null);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8000/api/v1/search?q=${query}`);
        const data = await res.json();
        setResults(data);
        setIsOpen(true);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  return (
    <div ref={searchRef} className="relative w-full max-w-xl">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {loading ? <Loader2 size={18} className="text-blue-500 animate-spin" /> : <Search size={18} className="text-slate-500 group-focus-within:text-blue-500 transition-colors" />}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder="Search Intelligence Graph (Companies, Directors, Events...)"
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-10 text-sm font-bold text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all backdrop-blur-md"
        />
        {query && (
          <button 
            onClick={() => setQuery("")}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && results && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="absolute top-full left-0 right-0 mt-3 glass-card border-white/10 shadow-2xl overflow-hidden z-[100] max-h-[80vh] flex flex-col"
          >
            {/* Highlights Bar */}
            {results.highlights.length > 0 && (
              <div className="px-6 py-3 bg-blue-600/10 border-b border-white/5 flex gap-4 overflow-x-auto no-scrollbar">
                {results.highlights.map((h: string, i: number) => (
                  <span key={i} className="whitespace-nowrap text-[9px] font-black uppercase tracking-widest text-blue-400 flex items-center gap-2">
                    <ShieldAlert size={10} /> {h}
                  </span>
                ))}
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
              {/* Category: Directors */}
              {results.results.directors?.length > 0 && (
                <div className="mb-4">
                  <h4 className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Directors</h4>
                  {results.results.directors.map((d: any) => (
                    <Link key={d.id} href={`/directors/${d.id}`} onClick={() => setIsOpen(false)}>
                      <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500">
                            <User size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-200">{d.name}</p>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{d.associations} Linked Entities</p>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-600 group-hover:text-blue-500 transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Category: Companies */}
              {results.results.companies?.length > 0 && (
                <div className="mb-4">
                  <h4 className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Companies</h4>
                  {results.results.companies.map((c: any) => (
                    <Link key={c.id} href={`/companies/${c.id}`} onClick={() => setIsOpen(false)}>
                      <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${c.score >= 70 ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                            <Building2 size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-200">{c.name}</p>
                            <div className="flex gap-2">
                               <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">ABN: {c.abn}</span>
                               <span className={`text-[10px] font-black uppercase tracking-tighter ${c.score >= 70 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                 Score: {c.score}
                               </span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-600 group-hover:text-blue-500 transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Category: Events */}
              {results.results.events?.length > 0 && (
                <div className="mb-4">
                  <h4 className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Related Signals</h4>
                  {results.results.events.map((e: any) => (
                    <Link key={e.id} href={`/companies/${e.company_id}`} onClick={() => setIsOpen(false)}>
                      <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-500">
                            <FileText size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-200">{e.name}</p>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{e.source} • {new Date(e.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-600 group-hover:text-blue-500 transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {results.results.directors?.length === 0 && results.results.companies?.length === 0 && results.results.events?.length === 0 && (
                <EmptyStateIntelligence stateKey="NO_RESULTS_FOUND" compact />
              )}
            </div>

            <div className="px-6 py-4 bg-black/40 border-t border-white/5 flex justify-between items-center">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Intelligence Graph Search v1.0</span>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                   <span className="text-[8px] font-black text-slate-600 border border-white/10 px-1.5 py-0.5 rounded">ESC</span>
                   <span className="text-[9px] font-black text-slate-500 uppercase">to close</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
