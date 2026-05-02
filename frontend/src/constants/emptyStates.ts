export const EMPTY_STATES = {
  MONITORING_ACTIVE: {
    title: "System Monitoring Active",
    description: "No elevated distress signals detected at this time. Monitoring continues across all tracked entities.",
    icon: "ShieldCheck"
  },
  NO_RESULTS_FOUND: {
    title: "No Matching Intelligence",
    description: "Search completed across monitored entities. No matching records identified in current surveillance graph.",
    icon: "Search"
  },
  NO_HIGH_RISK: {
    title: "Risk Thresholds Maintained",
    description: "No high-risk entities currently identified in this view. All monitored companies remain within acceptable parameters.",
    icon: "Shield"
  },
  NO_EVENTS: {
    title: "No Recent Signal Events",
    description: "Event pipeline active. No significant distress signals or legal events recorded in the current window.",
    icon: "Radar"
  },
  NO_NETWORK_RISK: {
    title: "No Significant Network Exposure",
    description: "Structural relationship analysis complete. No elevated network contagion or director-linked risks detected.",
    icon: "Network"
  },
  NO_ALERTS: {
    title: "Alert Monitoring Engaged",
    description: "No active alerts. Surveillance systems remain engaged and tracking for anomalous entity behavior.",
    icon: "BellOff"
  },
  NO_TIMELINE_HISTORY: {
    title: "No Historical Anomalies",
    description: "Entity surveillance active. No significant historical distress events or filing delays recorded in this dataset.",
    icon: "Clock"
  }
};

export type EmptyStateKey = keyof typeof EMPTY_STATES;
