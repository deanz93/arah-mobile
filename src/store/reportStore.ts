import { create } from 'zustand'
import type { Report } from '@/types'

interface ReportState {
  reports: Report[]
  setReports: (reports: Report[]) => void
  addReport: (report: Report) => void
  removeReport: (id: string) => void
  updateReport: (id: string, updates: Partial<Report>) => void
}

export const useReportStore = create<ReportState>((set) => ({
  reports: [],
  setReports: (reports) => set({ reports }),
  addReport: (report) =>
    set((state) => ({ reports: [...state.reports, report] })),
  removeReport: (id) =>
    set((state) => ({ reports: state.reports.filter((r) => r.id !== id) })),
  updateReport: (id, updates) =>
    set((state) => ({
      reports: state.reports.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    })),
}))
