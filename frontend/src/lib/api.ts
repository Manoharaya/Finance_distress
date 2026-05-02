import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
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

export const getSystemStatus = async () => {
  const response = await api.get("/system/status");
  return response.data;
};

export default api;
