'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select } from '@/components/ui/Field';
import { generateInviteCode } from '@/lib/utils';
import { ensureAnonymousSession, hasSupabaseEnv, supabase } from '@/lib/supabase';
import { themeOptions } from '@/lib/theme';
import type { ThemeType } from '@/types';
import { useUserStore } from '@/store/userStore';

export default function CreateRoomPage() {
  const router = useRouter();
  const nickname = useUserStore((state) => state.nickname);
  const setUser = useUserStore((state) => state.setUser);
  const [roomName, setRoomName] = useState('项目方案讨论');
  const [theme, setTheme] = useState<ThemeType>('feishu');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await ensureAnonymousSession();
      setUser(user.id, nickname || '匿名同事');

      let inviteCode = generateInviteCode();
      let lastErrorMessage = '创建房间失败';

      for (let attempt = 0; attempt < 5; attempt += 1) {
        const { error: insertError } = await supabase.from('rooms').insert({
          name: roomName.trim() || '未命名房间',
          invite_code: inviteCode,
          theme,
          created_by: user.id
        });

        if (!insertError) {
          router.push(`/room/${inviteCode}`);
          return;
        }

        lastErrorMessage = insertError.message;
        inviteCode = generateInviteCode();
      }

      throw new Error(lastErrorMessage);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : '创建房间失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-6 py-8">
      <div className="mx-auto w-full max-w-3xl">
        <Link className="mb-6 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-950" href="/">
          <ArrowLeft size={16} />
          返回首页
        </Link>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-slate-950">创建房间</h1>
            <p className="mt-2 text-sm text-slate-500">
              房间创建后会生成邀请码，后续通过 `/room/{'{inviteCode}'}` 访问。
            </p>
          </div>

          {!hasSupabaseEnv ? (
            <div className="mb-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              请先复制 `.env.example` 为 `.env.local` 并填写 Supabase URL 与 anon key。
            </div>
          ) : null}

          <form className="grid gap-5" onSubmit={handleCreate}>
            <Field label="房间名称">
              <Input
                value={roomName}
                onChange={(event) => setRoomName(event.target.value)}
                placeholder="项目方案讨论"
                maxLength={48}
              />
            </Field>

            <Field label="默认主题">
              <Select value={theme} onChange={(event) => setTheme(event.target.value as ThemeType)}>
                {themeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Field>

            {error ? <p className="text-sm text-rose-600">{error}</p> : null}

            <Button disabled={loading || !hasSupabaseEnv}>
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
              创建并进入
            </Button>
          </form>
        </section>
      </div>
    </main>
  );
}
