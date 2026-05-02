import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
}

const StatCard = ({ title, value, icon, trend, trendUp }: StatCardProps) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-slate-800 rounded-lg text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            trendUp ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' : 'bg-rose-400/10 text-rose-400 border border-rose-400/20'
          }`}>
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
    </div>
  );
};

export default StatCard;
