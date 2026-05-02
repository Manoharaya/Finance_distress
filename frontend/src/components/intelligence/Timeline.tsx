"use client"
import { Gavel, UserMinus, FileText, AlertCircle, Clock, Lock, MapPin, Newspaper, Info } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import SignalSourceBadge from "@/components/intelligence/SignalSourceBadge";

interface TimelineEvent {
  id: number;
  date: string;
  title: string;
  summary: string;
  severity: number;
  type: string;
  source: string;
  source_meta?: {
    label: string;
    type: string;
    trust_level: string;
    reliability: number;
  };
  recommendation: string;
  risk_color: string;
  icon_type: string;
}

const ICON_MAP: Record<string, any> = {
  gavel:     Gavel,
  user_minus:UserMinus,
  clock:     Clock,
  lock:      Lock,
  map_pin:   MapPin,
  newspaper: Newspaper,
  info:      Info,
};

const SEVERITY_NODE: Record<string, string> = {
  rose:    "bg-rose-600  text-white",
  amber:   "bg-amber-500 text-slate-950",
  emerald: "bg-blue-600  text-white",
};

import EmptyStateIntelligence from "@/components/intelligence/EmptyStateIntelligence";

export default function Timeline({ events }: { events: TimelineEvent[] }) {
  if (!events || events.length === 0) {
    return <EmptyStateIntelligence stateKey="NO_TIMELINE_HISTORY" />;
  }

  return (
    <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-500/70 before:via-slate-800/60 before:to-transparent">
      {events.map((event, index) => {
        const NodeIcon = ICON_MAP[event.icon_type] || FileText;
        const nodeColor = SEVERITY_NODE[event.risk_color] || SEVERITY_NODE.emerald;
        const isCritical = event.risk_color === "rose";

        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.07 }}
            className="relative flex items-start group"
          >
            {/* Timeline node */}
            <div className={`
              absolute left-0 mt-1 flex h-10 w-10 items-center justify-center rounded-full
              border-4 border-slate-950 shadow-lg transition-all duration-300
              group-hover:scale-110 ${nodeColor}
              ${isCritical ? "shadow-[0_0_12px_rgba(244,63,94,0.4)]" : ""}
            `}>
              <NodeIcon size={18} strokeWidth={1.5} />
            </div>

            {/* Event card */}
            <div className="ml-16 w-full">
              <div className={`
                glass-card rounded-2xl p-6 transition-all duration-300
                hover:border-slate-700 group-hover:shadow-xl
                ${isCritical ? "border-rose-500/20" : ""}
              `}>
                {/* Header row */}
                <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-white text-lg tracking-tight leading-snug uppercase">
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                        <Clock size={11} />
                        {event.date ? formatDistanceToNow(new Date(event.date), { addSuffix: true }) : "Unknown date"}
                      </span>
                    </div>
                  </div>

                  {/* Severity badge + severity score */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border
                      ${isCritical ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                        event.risk_color === "amber" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                        "bg-blue-500/10 text-blue-400 border-blue-500/20"}`}>
                      SEVERITY {event.severity}
                    </div>
                    {/* Source badge */}
                    <SignalSourceBadge source={event.source} size="sm" animate={isCritical} />
                  </div>
                </div>

                {/* Summary */}
                <p className="text-slate-300 text-sm leading-relaxed mb-4">
                  {event.summary}
                </p>

                {/* Trust bar */}
                {event.source_meta && (
                  <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest w-24 flex-shrink-0">
                      Source Trust
                    </span>
                    <div className="flex-1 h-1 bg-slate-900 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${event.source_meta.reliability}%` }}
                        transition={{ duration: 0.8, delay: index * 0.07 }}
                        className="h-full rounded-full bg-blue-500"
                      />
                    </div>
                    <span className="text-[9px] font-black text-slate-400 w-8">{event.source_meta.reliability}%</span>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                      {event.source_meta.trust_level}
                    </span>
                  </div>
                )}

                {/* Recommendation */}
                {event.recommendation && (
                  <div className="rounded-xl p-4 border bg-white/5 border-white/5">
                    <div className="flex items-start gap-2">
                      <AlertCircle size={14} className={isCritical ? "text-rose-500 mt-0.5 flex-shrink-0" : "text-blue-500 mt-0.5 flex-shrink-0"} />
                      <div className="text-xs">
                        <span className="font-black text-slate-200 uppercase tracking-tight">Intelligence Recommendation: </span>
                        <span className="text-slate-400 font-medium">{event.recommendation}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
