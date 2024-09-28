import { create } from "zustand";
import { User } from "@/lib/types/types";

interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
  getUser: () => User | null;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),
  getUser: () => get().user,
}));
