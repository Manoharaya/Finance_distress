"use client"
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Building2, AlertTriangle, Settings, BarChart3, Users, ShieldCheck, Terminal } from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-slate-950 text-white h-screen fixed left-0 top-0 flex flex-col border-r border-border shadow-[20px_0_40px_rgba(0,0,0,0.3)] z-50">
      <div className="p-8 border-b border-border bg-slate-900/20">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.5)]">
              <ShieldCheck size={20} className="text-white" />
           </div>
           <h1 className="text-lg font-black tracking-tighter text-white uppercase">Vortex Intel</h1>
        </div>
        <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-[0.3em] font-black">Intelligence OS v4.2</p>
      </div>
      
      <nav className="flex-1 p-6 space-y-4 mt-6">
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] px-4">Operations</p>
        <div className="space-y-1">
          <NavItem icon={<Home size={18} />} label="Overview" href="/" active={pathname === "/"} />
          <NavItem icon={<AlertTriangle size={18} />} label="Priority Leads" href="/leads" active={pathname === "/leads" || pathname.startsWith("/companies/")} />
          <NavItem icon={<Building2 size={18} />} label="Entity Registry" href="/companies" active={pathname === "/companies"} />
        </div>

        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] px-4 mt-10">Analysis</p>
        <div className="space-y-1">
          <NavItem icon={<Users size={18} />} label="Network Map" href="/directors" active={pathname === "/directors"} />
          <NavItem icon={<BarChart3 size={18} />} label="Sector Risk" href="/analytics" active={pathname === "/analytics"} />
        </div>
      </nav>
      
      <div className="p-6 border-t border-border bg-slate-900/20">
        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 mb-6">
           <Terminal size={14} className="text-emerald-400" />
           <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">System Online</span>
        </div>
        <NavItem icon={<Settings size={18} />} label="Configuration" href="/settings" active={pathname === "/settings"} />
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, href, active = false }: { icon: any, label: string, href: string, active?: boolean }) => (
  <Link href={href}>
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
      active 
        ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20 shadow-[inset_0_0_20px_rgba(37,99,235,0.1)]' 
        : 'text-slate-500 hover:bg-white/5 hover:text-white border border-transparent'
    }`}>
      <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
        {icon}
      </div>
      <span className="text-xs font-black uppercase tracking-widest">{label}</span>
    </div>
  </Link>
);

export default Sidebar;
