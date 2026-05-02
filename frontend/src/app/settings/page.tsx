"use client"
import { Settings as SettingsIcon, Shield, Bell, Database, Cpu } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
        <p className="text-slate-400 mt-2">Configure data sources, AI parameters, and user preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1 space-y-1">
          <SettingsTab icon={<SettingsIcon size={18} />} label="General" active />
          <SettingsTab icon={<Bell size={18} />} label="Notifications" />
          <SettingsTab icon={<Shield size={18} />} label="Security" />
          <SettingsTab icon={<Database size={18} />} label="Data Sources" />
          <SettingsTab icon={<Cpu size={18} />} label="AI & Scoring" />
        </div>

        <div className="md:col-span-3 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-6">General Preferences</h2>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Interface Theme</p>
                  <p className="text-sm text-slate-500">Choose between light and dark mode terminal styles.</p>
                </div>
                <div className="flex bg-slate-800 p-1 rounded-lg">
                  <button className="px-3 py-1.5 text-xs rounded-md bg-slate-700 text-white shadow-sm">Dark</button>
                  <button className="px-3 py-1.5 text-xs rounded-md text-slate-400 hover:text-white transition-colors">Light</button>
                </div>
              </div>
              
              <div className="border-t border-slate-800 pt-6 flex justify-between items-center">
                <div>
                  <p className="font-medium">Real-time Ingestion</p>
                  <p className="text-sm text-slate-500">Automatically update dashboard when new signals are found.</p>
                </div>
                <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">API Configuration</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Backend API URL</label>
                <input 
                  type="text" 
                  defaultValue="http://localhost:8000/api/v1"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const SettingsTab = ({ icon, label, active = false }: any) => (
  <div className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition-all ${
    active ? 'bg-slate-800 text-blue-400 font-semibold' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
  }`}>
    {icon}
    <span className="text-sm">{label}</span>
  </div>
);
