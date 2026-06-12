'use client';

import { create } from 'zustand';
import type { ThemeType } from '@/types';

interface RoomState {
  roomId: string | null;
  theme: ThemeType;
  bossMode: boolean;
  setRoomId: (roomId: string | null) => void;
  setTheme: (theme: ThemeType) => void;
  toggleBossMode: () => void;
  setBossMode: (bossMode: boolean) => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  roomId: null,
  theme: 'feishu',
  bossMode: false,
  setRoomId: (roomId) => set({ roomId }),
  setTheme: (theme) => set({ theme }),
  toggleBossMode: () => set((state) => ({ bossMode: !state.bossMode })),
  setBossMode: (bossMode) => set({ bossMode })
}));
