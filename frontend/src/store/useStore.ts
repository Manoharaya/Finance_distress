import { create } from 'zustand';

interface PlatformState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  selectedCompanyId: string | null;
  setSelectedCompanyId: (id: string | null) => void;
  filters: {
    industry: string;
    minScore: number;
    riskLevel: string;
  };
  setFilter: (key: string, value: any) => void;
}

export const useStore = create<PlatformState>((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  selectedCompanyId: null,
  setSelectedCompanyId: (id) => set({ selectedCompanyId: id }),
  filters: {
    industry: 'All',
    minScore: 0,
    riskLevel: 'All',
  },
  setFilter: (key, value) => set((state) => ({
    filters: { ...state.filters, [key]: value }
  })),
}));
