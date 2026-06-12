'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  userId: string | null;
  nickname: string | null;
  setUser: (userId: string, nickname: string) => void;
  setNickname: (nickname: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userId: null,
      nickname: null,
      setUser: (userId, nickname) => set({ userId, nickname }),
      setNickname: (nickname) => set({ nickname })
    }),
    {
      name: 'office-chat-user'
    }
  )
);
