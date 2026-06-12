'use client';

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Copy, Loader2, Moon, RefreshCw } from 'lucide-react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select } from '@/components/ui/Field';
import { CommentInput } from '@/components/comments/CommentInput';
import { themeRenderers } from '@/components/themes/renderers';
import { documentTypeOptions, getDocumentShell } from '@/lib/documentTemplates';
import { ensureAnonymousSession, hasSupabaseEnv, supabase } from '@/lib/supabase';
import { themeOptions } from '@/lib/theme';
import { getAppUrl } from '@/lib/utils';
import { useRoomStore } from '@/store/roomStore';
import { useUserStore } from '@/store/userStore';
import type { Comment, DocumentType, PresenceUser, Room, ThemeType } from '@/types';

function uniqueComments(comments: Comment[]) {
  const byId = new Map<string, Comment>();
  for (const comment of comments) {
    byId.set(comment.id, comment);
  }
  return Array.from(byId.values()).sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
}

export function DocumentRoom({ inviteCode }: { inviteCode: string }) {
  const [room, setRoom] = useState<Room | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [collaborators, setCollaborators] = useState<PresenceUser[]>([]);
  const [nicknameDraft, setNicknameDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const commentChannelRef = useRef<RealtimeChannel | null>(null);
  const presenceChannelRef = useRef<RealtimeChannel | null>(null);

  const { userId, nickname, setUser, setNickname } = useUserStore();
  const { roomId, theme, bossMode, setRoomId, setTheme, toggleBossMode } = useRoomStore();
  const inviteUrl = `${getAppUrl()}/room/${inviteCode}`;
  const document = getDocumentShell(room?.document_type);
  const renderer = themeRenderers[theme];

  const needsNickname = useMemo(() => !nickname || nickname.trim().length === 0, [nickname]);

  useEffect(() => {
    setNicknameDraft(nickname || '');
  }, [nickname]);

  useEffect(() => {
    async function bootstrap() {
      setLoading(true);
      setError('');
      try {
        const user = await ensureAnonymousSession();
        setUser(user.id, nickname || '');

        const { data: roomData, error: roomError } = await supabase
          .from('rooms')
          .select('*')
          .eq('invite_code', inviteCode)
          .single();

        if (roomError) throw roomError;

        const normalizedRoom = {
          document_type: 'project_plan',
          ...roomData
        } as Room;

        setRoom(normalizedRoom);
        setRoomId(normalizedRoom.id);
        setTheme(normalizedRoom.theme as ThemeType);

        const { data: commentData, error: commentError } = await supabase
          .from('comments')
          .select('*')
          .eq('room_id', normalizedRoom.id)
          .order('created_at', { ascending: false })
          .limit(100);

        if (commentError) throw commentError;
        setComments(uniqueComments([...(commentData || [])].reverse() as Comment[]));
      } catch (bootstrapError) {
        setError(bootstrapError instanceof Error ? bootstrapError.message : '加载文档空间失败');
      } finally {
        setLoading(false);
      }
    }

    if (hasSupabaseEnv) {
      void bootstrap();
    } else {
      setLoading(false);
      setError('缺少 Supabase 环境变量，请先配置 .env.local。');
    }

    return () => {
      setRoomId(null);
      if (commentChannelRef.current) void supabase.removeChannel(commentChannelRef.current);
      if (presenceChannelRef.current) void supabase.removeChannel(presenceChannelRef.current);
    };
  }, [inviteCode, nickname, setRoomId, setTheme, setUser]);

  const joinDocument = useCallback(
    async (name: string) => {
      if (!room || !userId) return;
      setJoining(true);
      setError('');
      try {
        const displayName = name.trim();
        if (!displayName) {
          throw new Error('请填写昵称。');
        }

        const { error: joinError } = await supabase.from('room_members').upsert(
          {
            room_id: room.id,
            user_id: userId,
            nickname: displayName
          },
          { onConflict: 'room_id,user_id' }
        );

        if (joinError) throw joinError;
        setNickname(displayName);
      } catch (joinError) {
        setError(joinError instanceof Error ? joinError.message : '加入文档空间失败');
      } finally {
        setJoining(false);
      }
    },
    [room, setNickname, userId]
  );

  useEffect(() => {
    if (room && userId && nickname && !needsNickname) {
      void joinDocument(nickname);
    }
  }, [joinDocument, needsNickname, nickname, room, userId]);

  useEffect(() => {
    if (!roomId || !userId || !nickname || needsNickname) return;

    if (commentChannelRef.current) void supabase.removeChannel(commentChannelRef.current);
    if (presenceChannelRef.current) void supabase.removeChannel(presenceChannelRef.current);

    const commentsChannel = supabase
      .channel(`document:${roomId}:comments`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          setComments((current) => uniqueComments([...current, payload.new as Comment]));
        }
      )
      .subscribe();

    const presenceChannel = supabase.channel(`room:${roomId}:presence`, {
      config: {
        presence: {
          key: userId
        }
      }
    });

    presenceChannel.on('presence', { event: 'sync' }, () => {
      const state = presenceChannel.presenceState();
      const users = Object.values(state)
        .flat()
        .map((item) => item as unknown as PresenceUser);
      const byUser = new Map(users.map((user) => [user.user_id, user]));
      setCollaborators(Array.from(byUser.values()));
    });

    presenceChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await presenceChannel.track({
          user_id: userId,
          nickname,
          online_at: new Date().toISOString()
        });
      }
    });

    commentChannelRef.current = commentsChannel;
    presenceChannelRef.current = presenceChannel;

    return () => {
      void supabase.removeChannel(commentsChannel);
      void supabase.removeChannel(presenceChannel);
    };
  }, [needsNickname, nickname, roomId, userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [comments.length]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' || (event.ctrlKey && event.key === '`')) {
        event.preventDefault();
        toggleBossMode();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleBossMode]);

  async function handleNicknameSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await joinDocument(nicknameDraft);
  }

  async function handlePublishText(content: string) {
    if (!room || !userId || !nickname) return;
    const { data, error: insertError } = await supabase
      .from('comments')
      .insert({
        room_id: room.id,
        user_id: userId,
        nickname,
        type: 'text',
        content
      })
      .select('*')
      .single();

    if (insertError) throw insertError;
    if (data) setComments((current) => uniqueComments([...current, data as Comment]));
  }

  async function handleInsertAttachment(file: File) {
    if (!room || !userId || !nickname) return;
    const ext = file.name.split('.').pop() || 'png';
    const path = `${room.id}/${userId}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('doc-attachments').upload(path, file);
    if (uploadError) throw uploadError;

    const { data: publicData } = supabase.storage.from('doc-attachments').getPublicUrl(path);
    const { data, error: insertError } = await supabase
      .from('comments')
      .insert({
        room_id: room.id,
        user_id: userId,
        nickname,
        type: 'image',
        content: file.name,
        file_url: publicData.publicUrl
      })
      .select('*')
      .single();

    if (insertError) throw insertError;
    if (data) setComments((current) => uniqueComments([...current, data as Comment]));
  }

  async function handleThemeChange(nextTheme: ThemeType) {
    setTheme(nextTheme);
    if (!room) return;
    setRoom({ ...room, theme: nextTheme });
    await supabase.from('rooms').update({ theme: nextTheme }).eq('id', room.id);
  }

  async function handleDocumentTypeChange(nextType: DocumentType) {
    if (!room) return;
    const nextRoom = { ...room, document_type: nextType };
    setRoom(nextRoom);
    await supabase.from('rooms').update({ document_type: nextType }).eq('id', room.id);
  }

  async function copyInvite() {
    await navigator.clipboard.writeText(inviteUrl);
  }

  const controls = (
    <div className="flex items-center gap-2">
      <Select className="h-9 w-32" value={theme} onChange={(event) => void handleThemeChange(event.target.value as ThemeType)}>
        {themeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      <Select
        className="h-9 w-32"
        value={room?.document_type || 'project_plan'}
        onChange={(event) => void handleDocumentTypeChange(event.target.value as DocumentType)}
      >
        {documentTypeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  );

  const toolbar = (
    <>
      <Button variant="secondary" className="hidden sm:inline-flex" onClick={copyInvite} title="复制邀请链接">
        <Copy size={16} />
        邀请
      </Button>
      <Button variant="secondary" onClick={toggleBossMode} title="老板键">
        <Moon size={16} />
      </Button>
      <Button variant="ghost" onClick={() => window.location.reload()} title="刷新">
        <RefreshCw size={16} />
      </Button>
    </>
  );

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f5f7fb] text-slate-600">
        <div className="inline-flex items-center gap-2">
          <Loader2 className="animate-spin" size={18} />
          正在加载文档空间
        </div>
      </div>
    );
  }

  if (error && !room) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f5f7fb] px-6">
        <div className="max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-soft">
          <h1 className="text-xl font-semibold text-slate-950">无法打开文档</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <>
      {renderer.render({
        document,
        comments,
        currentUserId: userId,
        collaboratorCount: collaborators.length,
        bossMode,
        toolbar,
        controls,
        input: (
          <CommentInput
            onPublishText={handlePublishText}
            onInsertAttachment={handleInsertAttachment}
            disabled={needsNickname || !room}
          />
        ),
        bottomRef
      })}

      {needsNickname ? (
        <div className="fixed inset-0 z-30 grid place-items-center bg-slate-950/35 px-6">
          <form className="w-full max-w-sm rounded-lg bg-white p-5 shadow-soft" onSubmit={handleNicknameSubmit}>
            <h2 className="text-lg font-semibold text-slate-950">填写协作者昵称</h2>
            <p className="mt-2 text-sm text-slate-500">昵称会显示在评论、编辑记录或讨论区中。</p>
            <div className="mt-5 grid gap-4">
              <Field label="昵称">
                <Input
                  value={nicknameDraft}
                  onChange={(event) => setNicknameDraft(event.target.value)}
                  placeholder="例如：设计小李"
                  maxLength={24}
                  autoFocus
                />
              </Field>
              {error ? <p className="text-sm text-rose-600">{error}</p> : null}
              <Button disabled={joining || !nicknameDraft.trim()}>
                {joining ? <Loader2 className="animate-spin" size={16} /> : null}
                进入文档
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
