'use client';

import type { ReactNode } from 'react';
import { FileText, Grid3X3, Library, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { themes } from '@/lib/theme';
import type { ThemeType } from '@/types';
import { BossMode } from './BossMode';

const icons = {
  feishu: FileText,
  dingtalk: Library,
  tencent_doc: Grid3X3
};

export function ThemeShell({
  theme,
  roomName,
  bossMode,
  onlineCount,
  toolbar,
  children
}: {
  theme: ThemeType;
  roomName: string;
  bossMode: boolean;
  onlineCount: number;
  toolbar: ReactNode;
  children: ReactNode;
}) {
  const meta = themes[theme];
  const Icon = icons[theme];

  return (
    <div className={cn('min-h-screen', meta.surface)}>
      <header className={cn('sticky top-0 z-20 border-b', meta.nav)}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-md', meta.accent)}>
              <Icon size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500">{meta.name}</p>
              <h1 className="truncate text-base font-semibold text-slate-950">{bossMode ? meta.fakeTitle : roomName}</h1>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 text-sm text-slate-600">
            <span className="hidden sm:inline">在线 {onlineCount}</span>
            {bossMode ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-amber-700">
                <Shield size={14} />
                伪装中
              </span>
            ) : null}
            {toolbar}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-5">
        <div className="min-h-[calc(100vh-104px)] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft">
          {bossMode ? <BossMode theme={theme} /> : children}
        </div>
      </div>
    </div>
  );
}
