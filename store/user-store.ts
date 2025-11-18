import { create } from "zustand";
import type { User, UserProfile } from "@/types/user";

interface UserStore {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;

  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (isLoading: boolean) => void;

  updateProfile: (updates: Partial<UserProfile>) => void;

  // Subscription helpers
  isPro: () => boolean;
  canCreateProject: (currentCount: number) => boolean;
  canUseAI: () => boolean;
  canRemoveWatermark: () => boolean;

  reset: () => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),

  updateProfile: (updates) => {
    const { profile } = get();
    if (profile) {
      set({ profile: { ...profile, ...updates } });
    }
  },

  isPro: () => {
    const { profile } = get();
    return profile?.subscription === "pro";
  },

  canCreateProject: (currentCount) => {
    const { profile } = get();
    if (!profile) return false;
    if (profile.subscription === "pro") return true;
    return currentCount < 5;
  },

  canUseAI: () => {
    const { profile } = get();
    if (!profile) return false;
    return profile.ai_quota_used < profile.ai_quota_limit;
  },

  canRemoveWatermark: () => {
    const { profile } = get();
    return profile?.subscription === "pro";
  },

  reset: () => set({ user: null, profile: null, isLoading: false }),
}));
