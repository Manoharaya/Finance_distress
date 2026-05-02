import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/_/backend/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getDashboardSummary = async () => {
  const response = await api.get('/dashboard/summary');
  return response.data;
};

export const getCompanies = async () => {
  const response = await api.get('/companies/');
  return response.data;
};

export const getCompanyDetail = async (id: number) => {
  const response = await api.get(`/companies/${id}`);
  return response.data;
};

export const getCompanyTimeline = async (id: number) => {
  const response = await api.get(`/companies/${id}/timeline`);
  return response.data;
};

export const getDistressDrivers = async (id: number) => {
  const response = await api.get(`/companies/${id}/distress-drivers`);
  return response.data;
};

export const getConfidenceReport = async (id: number) => {
  const response = await api.get(`/companies/${id}/confidence`);
  return response.data;
};

export const getNetworkRisk = async (id: number) => {
  const response = await api.get(`/companies/${id}/network-risk`);
  return response.data;
};

export const getIntelligenceFeed = async () => {
  const response = await api.get("/dashboard/intelligence-feed");
  return response.data;
};

export const getExecutiveBriefing = async () => {
  const response = await api.get("/dashboard/executive-briefing");
  return response.data;
};

export const getSectorRisk = async () => {
  const response = await api.get("/dashboard/sector-risk-heatmap");
  return response.data;
};

export const getOperationalMetrics = async () => {
  const response = await api.get("/dashboard/operational-metrics");
  return response.data;
};

export const getDistressMomentum = async () => {
  const response = await api.get("/dashboard/momentum");
  return response.data;
};

export const getCompanyMomentum = async (id: number) => {
  const response = await api.get(`/companies/${id}/momentum`);
  return response.data;
};

export const getCompanyRecommendation = async (id: number) => {
  const response = await api.get(`/companies/${id}/recommendation`);
  return response.data;
};

export const searchIntelligence = async (query: string) => {
  const response = await api.get(`/search?q=${query}`);
  return response.data;
};

export const getSystemStatus = async () => {
  const response = await api.get("/system/status");
  return response.data;
};

export default api;
