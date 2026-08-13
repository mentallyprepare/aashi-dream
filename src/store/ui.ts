import { create } from "zustand";

export type PageKey =
  | "dashboard"
  | "profile"
  | "universities"
  | "shortlist"
  | "ielts"
  | "research"
  | "sops"
  | "lors"
  | "applications"
  | "scholarships"
  | "visas"
  | "careers"
  | "portfolio"
  | "opportunities"
  | "people"
  | "sources"
  | "delta"
  | "advisor"
  | "top1"
  | "life";

type UiState = {
  page: PageKey;
  collapsed: boolean;
  setPage: (page: PageKey) => void;
  toggleCollapsed: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  page: "dashboard",
  collapsed: false,
  setPage: (page) => set({ page }),
  toggleCollapsed: () => set((state) => ({ collapsed: !state.collapsed })),
}));
