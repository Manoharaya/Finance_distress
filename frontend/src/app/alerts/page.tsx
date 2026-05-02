"use client"
import { Bell, AlertTriangle, Info, CheckCircle2 } from "lucide-react";

const alerts = [
  { id: 1, type: 'critical', title: 'Winding Up Application', company: 'Vertex Solutions Pty Ltd', time: '2h ago', status: 'Unread' },
  { id: 2, type: 'warning', title: 'Late Filing Detected', company: 'Oceanic Logistics', time: '5h ago', status: 'Read' },
  { id: 3, type: 'info', title: 'New News Signal', company: 'Sydney Build Group', time: '1d ago', status: 'Read' },
];

export default function AlertsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Intelligence Alerts</h1>
        <p className="text-slate-400 mt-2">Manage and review critical distress signals.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
          <div className="flex gap-2">
            <button className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium">All Alerts</button>
            <button className="text-slate-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">Critical</button>
            <button className="text-slate-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">Unread</button>
          </div>
          <button className="text-xs text-blue-400 hover:underline">Mark all as read</button>
        </div>
        <div className="divide-y divide-slate-800">
          {alerts.map((alert) => (
            <div key={alert.id} className="p-6 hover:bg-slate-800/50 transition-colors flex items-start gap-4">
              <div className={`p-2 rounded-lg ${
                alert.type === 'critical' ? 'bg-rose-500/10 text-rose-500' : 
                alert.type === 'warning' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
              }`}>
                {alert.type === 'critical' ? <AlertTriangle size={20} /> : 
                 alert.type === 'warning' ? <Bell size={20} /> : <Info size={20} />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-white">{alert.title}</h3>
                  <span className="text-xs text-slate-500">{alert.time}</span>
                </div>
                <p className="text-sm text-slate-400 mt-1">Entity: <span className="text-slate-200">{alert.company}</span></p>
                <div className="mt-4 flex gap-3">
                  <button className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded text-slate-300 transition-colors">View Details</button>
                  <button className="text-xs text-slate-500 hover:text-white transition-colors">Archive</button>
                </div>
              </div>
              {alert.status === 'Unread' && (
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
