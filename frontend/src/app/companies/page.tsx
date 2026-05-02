"use client"
import { Building2, Search, Filter, Download } from "lucide-react";
import Link from "next/link";

const companies = [
  { id: 1, name: "Vertex Solutions Pty Ltd", abn: "45 123 456 789", score: 84, risk: "Immediate Engagement", industry: "Construction" },
  { id: 2, name: "Oceanic Logistics", abn: "12 987 654 321", score: 42, risk: "Warm Outreach", industry: "Transport" },
  { id: 3, name: "Sydney Build Group", abn: "88 444 555 666", score: 68, risk: "Warm Outreach", industry: "Construction" },
  { id: 4, name: "TechNova AU", abn: "33 111 222 333", score: 15, risk: "Monitor", industry: "Software" },
  { id: 5, name: "Gold Coast Hospitality", abn: "77 888 999 000", score: 92, risk: "Immediate Engagement", industry: "Tourism" },
];

export default function CompaniesPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Corporate Directory</h1>
          <p className="text-slate-400 mt-2">Browse and filter monitored entities in the intelligence database.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Filter size={18} /> Filters
          </button>
          <button className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 bg-slate-900/50 border-b border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Filter by name, ABN, or industry..." 
              className="bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 w-full"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900/50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Entity Name</th>
                <th className="px-6 py-4 font-semibold">Industry</th>
                <th className="px-6 py-4 font-semibold">Distress Score</th>
                <th className="px-6 py-4 font-semibold">Risk Profile</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {companies.map((company) => (
                <tr key={company.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-blue-400">
                        <Building2 size={16} />
                      </div>
                      <div>
                        <p className="font-medium text-white">{company.name}</p>
                        <p className="text-xs text-slate-500">ABN: {company.abn}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-400">{company.industry}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${
                        company.score > 70 ? 'text-rose-500' : company.score > 40 ? 'text-amber-500' : 'text-emerald-500'
                      }`}>
                        {company.score}
                      </span>
                      <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            company.score > 70 ? 'bg-rose-500' : company.score > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`} 
                          style={{ width: `${company.score}%` }} 
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] uppercase font-black px-2 py-1 rounded-full border ${
                      company.risk === 'Immediate Engagement' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 
                      company.risk === 'Warm Outreach' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                      'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    }`}>
                      {company.risk}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href={`/companies/${company.id}`}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                    >
                      View Intelligence
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
