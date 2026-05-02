import {
  Scale, Building2, BadgeCheck, Lock, Newspaper,
  Sparkles, Cpu, Network, UserCheck, HelpCircle
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface SourceConfig {
  label: string;
  icon: LucideIcon;
  reliability: number;
  trustLevel: "VERIFIED" | "HIGH" | "MODERATE" | "INFERRED" | "UNCERTAIN";
  colorClass: string;       // Tailwind text color
  bgClass: string;          // Tailwind bg
  borderClass: string;      // Tailwind border
  glowClass?: string;       // Optional shadow glow
}

export const SIGNAL_SOURCES: Record<string, SourceConfig> = {
  FEDERAL_COURT: {
    label:       "Federal Court",
    icon:        Scale,
    reliability: 95,
    trustLevel:  "VERIFIED",
    colorClass:  "text-rose-400",
    bgClass:     "bg-rose-500/10",
    borderClass: "border-rose-500/30",
    glowClass:   "shadow-[0_0_10px_rgba(244,63,94,0.2)]",
  },
  ASIC: {
    label:       "ASIC Registry",
    icon:        Building2,
    reliability: 92,
    trustLevel:  "VERIFIED",
    colorClass:  "text-blue-400",
    bgClass:     "bg-blue-500/10",
    borderClass: "border-blue-500/30",
    glowClass:   "shadow-[0_0_8px_rgba(59,130,246,0.15)]",
  },
  ABN: {
    label:       "ABN Lookup",
    icon:        BadgeCheck,
    reliability: 88,
    trustLevel:  "HIGH",
    colorClass:  "text-emerald-400",
    bgClass:     "bg-emerald-500/10",
    borderClass: "border-emerald-500/30",
  },
  PPSR: {
    label:       "PPSR Register",
    icon:        Lock,
    reliability: 88,
    trustLevel:  "HIGH",
    colorClass:  "text-orange-400",
    bgClass:     "bg-orange-500/10",
    borderClass: "border-orange-500/30",
  },
  NEWS: {
    label:       "News Media",
    icon:        Newspaper,
    reliability: 65,
    trustLevel:  "MODERATE",
    colorClass:  "text-yellow-400",
    bgClass:     "bg-yellow-500/10",
    borderClass: "border-yellow-500/30",
  },
  AI_ENRICHMENT: {
    label:       "AI Enrichment",
    icon:        Sparkles,
    reliability: 45,
    trustLevel:  "INFERRED",
    colorClass:  "text-violet-400",
    bgClass:     "bg-violet-500/10",
    borderClass: "border-violet-500/30",
  },
  SCORING_ENGINE: {
    label:       "Scoring Engine",
    icon:        Cpu,
    reliability: 75,
    trustLevel:  "HIGH",
    colorClass:  "text-cyan-400",
    bgClass:     "bg-cyan-500/10",
    borderClass: "border-cyan-500/30",
  },
  ENTITY_RESOLUTION: {
    label:       "Entity Resolution",
    icon:        Network,
    reliability: 80,
    trustLevel:  "HIGH",
    colorClass:  "text-indigo-400",
    bgClass:     "bg-indigo-500/10",
    borderClass: "border-indigo-500/30",
  },
  ANALYST: {
    label:       "Analyst Review",
    icon:        UserCheck,
    reliability: 98,
    trustLevel:  "VERIFIED",
    colorClass:  "text-slate-300",
    bgClass:     "bg-slate-700/40",
    borderClass: "border-slate-600/40",
    glowClass:   "shadow-[0_0_8px_rgba(100,116,139,0.2)]",
  },
  UNKNOWN: {
    label:       "Unknown Source",
    icon:        HelpCircle,
    reliability: 30,
    trustLevel:  "UNCERTAIN",
    colorClass:  "text-slate-500",
    bgClass:     "bg-slate-800/40",
    borderClass: "border-slate-700/30",
  },
};

// Resolve a backend source string to the config key
export function resolveSourceKey(raw?: string): string {
  if (!raw) return "UNKNOWN";
  const upper = raw.toUpperCase().replace(/\s+/g, "_");
  // Try exact match first
  if (SIGNAL_SOURCES[upper]) return upper;
  // Fuzzy match by label
  for (const [key, cfg] of Object.entries(SIGNAL_SOURCES)) {
    if (cfg.label.toLowerCase() === raw.toLowerCase()) return key;
  }
  // Partial keyword match
  const low = raw.toLowerCase();
  if (low.includes("court"))     return "FEDERAL_COURT";
  if (low.includes("asic"))      return "ASIC";
  if (low.includes("ppsr"))      return "PPSR";
  if (low.includes("abn"))       return "ABN";
  if (low.includes("news"))      return "NEWS";
  if (low.includes("ai") || low.includes("gemini") || low.includes("enrichment")) return "AI_ENRICHMENT";
  if (low.includes("entity") || low.includes("resolution")) return "ENTITY_RESOLUTION";
  if (low.includes("scoring") || low.includes("engine"))    return "SCORING_ENGINE";
  return "UNKNOWN";
}

export function getSourceConfig(raw?: string): SourceConfig {
  const key = resolveSourceKey(raw);
  return SIGNAL_SOURCES[key] || SIGNAL_SOURCES.UNKNOWN;
}

export const TRUST_LEVEL_LABELS: Record<string, string> = {
  VERIFIED:   "Verified",
  HIGH:       "High Confidence",
  MODERATE:   "Moderate",
  INFERRED:   "AI Inferred",
  UNCERTAIN:  "Uncertain",
};
