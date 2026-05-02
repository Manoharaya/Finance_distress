"use client"
import { Users, Building2, Link2, AlertTriangle } from "lucide-react";

interface GraphNode {
  id: string;
  name: string;
  type: 'director' | 'company';
  status?: string;
  isTarget?: boolean;
}

export default function IntelligenceGraph() {
  // Demo Data for the Graph
  const nodes: GraphNode[] = [
    { id: 'd1', name: 'Gregory Vance', type: 'director' },
    { id: 'c1', name: 'GV Infrastructure', type: 'company', isTarget: true, status: 'High Risk' },
    { id: 'c2', name: 'Vance Civil Eng.', type: 'company', status: 'Liquidated' },
  ];

  return (
    <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-8 relative overflow-hidden h-[400px] flex items-center justify-center">
      {/* Background Grid Effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#2563eb 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
      
      <div className="relative flex flex-col items-center gap-16">
        {/* Director Node */}
        <div className="z-10 flex flex-col items-center group">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center border-4 border-slate-950 shadow-[0_0_20px_rgba(37,99,235,0.4)] group-hover:scale-110 transition-transform">
            <Users size={32} className="text-white" />
          </div>
          <p className="mt-3 font-bold text-white text-sm tracking-tight">{nodes[0].name}</p>
          <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Primary Director</span>
        </div>

        {/* Connection Lines (Simulated with CSS/SVG) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>

        <div className="flex gap-24 items-start">
          {/* Company 1 (Target) */}
          <div className="z-10 flex flex-col items-center group">
            <div className="w-14 h-14 rounded-xl bg-slate-900 border-2 border-rose-500 flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.2)] group-hover:scale-110 transition-transform">
              <Building2 size={28} className="text-rose-500" />
            </div>
            <p className="mt-3 font-bold text-white text-xs">{nodes[1].name}</p>
            <div className="flex items-center gap-1 mt-1">
              <AlertTriangle size={10} className="text-rose-500" />
              <span className="text-[9px] text-rose-500 font-black uppercase">{nodes[1].status}</span>
            </div>
          </div>

          {/* Company 2 (Linked Failed) */}
          <div className="z-10 flex flex-col items-center group opacity-60 hover:opacity-100 transition-opacity">
            <div className="w-14 h-14 rounded-xl bg-slate-900 border-2 border-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 size={28} className="text-slate-500" />
            </div>
            <p className="mt-3 font-bold text-slate-400 text-xs">{nodes[2].name}</p>
            <span className="mt-1 text-[9px] text-slate-600 font-black uppercase">{nodes[2].status}</span>
          </div>
        </div>

        {/* Labels & Legend */}
        <div className="absolute top-0 right-0 text-right">
          <div className="flex items-center justify-end gap-2 text-[10px] text-slate-500 mb-1">
            <span>Directorship Link</span>
            <div className="w-8 h-0.5 bg-slate-700"></div>
          </div>
          <div className="flex items-center justify-end gap-2 text-[10px] text-slate-500">
            <span>Historical Association</span>
            <div className="w-8 h-0.5 bg-slate-800 border-t border-dashed border-slate-600"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
