'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, MessagesSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';
import { useUserStore } from '@/store/userStore';

function extractInviteCode(value: string) {
  const trimmed = value.trim();
  const match = trimmed.match(/\/room\/([^/?#]+)/);
  return decodeURIComponent(match?.[1] || trimmed).toUpperCase();
}

export default function HomePage() {
  const router = useRouter();
  const nickname = useUserStore((state) => state.nickname);
  const setNickname = useUserStore((state) => state.setNickname);
  const [nameDraft, setNameDraft] = useState(nickname || '');
  const [inviteDraft, setInviteDraft] = useState('');

  const canContinue = useMemo(() => nameDraft.trim().length > 0, [nameDraft]);

  function saveNickname() {
    if (canContinue) {
      setNickname(nameDraft.trim());
    }
  }

  function handleCreate() {
    saveNickname();
    router.push('/create');
  }

  function handleJoin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveNickname();
    const inviteCode = extractInviteCode(inviteDraft);
    if (inviteCode) {
      router.push(`/room/${inviteCode}`);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb]">
      <section className="mx-auto grid min-h-screen w-full max-w-5xl content-center gap-10 px-6 py-12">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            <MessagesSquare size={16} />
            文档协作界面的实时聊天室
          </div>
          <h1 className="text-5xl font-semibold tracking-normal text-slate-950 sm:text-6xl">
            OfficeChat
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            创建一个伪装成办公文档的聊天室，通过邀请链接加入，支持实时消息、在线人数、图片和老板键。
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-950">开始一个房间</h2>
              <p className="mt-1 text-sm text-slate-500">先设置昵称，进入房间后可继续使用。</p>
            </div>
            <div className="grid gap-4">
              <Field label="你的昵称">
                <Input
                  value={nameDraft}
                  onChange={(event) => setNameDraft(event.target.value)}
                  placeholder="例如：产品小王"
                  maxLength={24}
                />
              </Field>
              <Button onClick={handleCreate} disabled={!canContinue}>
                <Plus size={16} />
                创建房间
              </Button>
            </div>
          </div>

          <form className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft" onSubmit={handleJoin}>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-950">加入已有房间</h2>
              <p className="mt-1 text-sm text-slate-500">粘贴邀请链接或输入邀请码。</p>
            </div>
            <div className="grid gap-4">
              <Field label="邀请码 / 邀请链接">
                <Input
                  value={inviteDraft}
                  onChange={(event) => setInviteDraft(event.target.value)}
                  placeholder="ABC123 或 http://localhost:3000/room/ABC123"
                />
              </Field>
              <Button disabled={!canContinue || !inviteDraft.trim()}>
                <ArrowRight size={16} />
                加入房间
              </Button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
