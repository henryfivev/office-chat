'use client';

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Copy, Loader2, Moon, RefreshCw } from 'lucide-react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select } from '@/components/ui/Field';
import { MessageInput } from '@/components/chat/MessageInput';
import { MessageList } from '@/components/chat/MessageList';
import { ThemeShell } from '@/components/themes/ThemeShell';
import { ensureAnonymousSession, hasSupabaseEnv, supabase } from '@/lib/supabase';
import { getAppUrl } from '@/lib/utils';
import { themeOptions } from '@/lib/theme';
import { useRoomStore } from '@/store/roomStore';
import { useUserStore } from '@/store/userStore';
import type { ChatMessage, PresenceUser, Room, ThemeType } from '@/types';

function uniqueMessages(messages: ChatMessage[]) {
  const byId = new Map<string, ChatMessage>();
  for (const message of messages) {
    byId.set(message.id, message);
  }
  return Array.from(byId.values()).sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
}

export function ChatRoom({ inviteCode }: { inviteCode: string }) {
  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
  const [nicknameDraft, setNicknameDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const messageChannelRef = useRef<RealtimeChannel | null>(null);
  const presenceChannelRef = useRef<RealtimeChannel | null>(null);

  const { userId, nickname, setUser, setNickname } = useUserStore();
  const { roomId, theme, bossMode, setRoomId, setTheme, toggleBossMode } = useRoomStore();
  const inviteUrl = `${getAppUrl()}/room/${inviteCode}`;

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
        setRoom(roomData as Room);
        setRoomId(roomData.id);
        setTheme(roomData.theme as ThemeType);

        const { data: messageData, error: messageError } = await supabase
          .from('messages')
          .select('*')
          .eq('room_id', roomData.id)
          .order('created_at', { ascending: false })
          .limit(100);

        if (messageError) throw messageError;
        setMessages(uniqueMessages([...(messageData || [])].reverse() as ChatMessage[]));
      } catch (bootstrapError) {
        setError(bootstrapError instanceof Error ? bootstrapError.message : '加载房间失败');
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
      if (messageChannelRef.current) void supabase.removeChannel(messageChannelRef.current);
      if (presenceChannelRef.current) void supabase.removeChannel(presenceChannelRef.current);
    };
  }, [inviteCode, nickname, setRoomId, setTheme, setUser]);

  const joinRoom = useCallback(
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
        setError(joinError instanceof Error ? joinError.message : '加入房间失败');
      } finally {
        setJoining(false);
      }
    },
    [room, setNickname, userId]
  );

  useEffect(() => {
    if (room && userId && nickname && !needsNickname) {
      void joinRoom(nickname);
    }
  }, [joinRoom, needsNickname, nickname, room, userId]);

  useEffect(() => {
    if (!roomId || !userId || !nickname || needsNickname) return;

    if (messageChannelRef.current) void supabase.removeChannel(messageChannelRef.current);
    if (presenceChannelRef.current) void supabase.removeChannel(presenceChannelRef.current);

    const messagesChannel = supabase
      .channel(`room:${roomId}:messages`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          setMessages((current) => uniqueMessages([...current, payload.new as ChatMessage]));
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
      setOnlineUsers(Array.from(byUser.values()));
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

    messageChannelRef.current = messagesChannel;
    presenceChannelRef.current = presenceChannel;

    return () => {
      void supabase.removeChannel(messagesChannel);
      void supabase.removeChannel(presenceChannel);
    };
  }, [needsNickname, nickname, roomId, userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length]);

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
    await joinRoom(nicknameDraft);
  }

  async function handleSendText(content: string) {
    if (!room || !userId || !nickname) return;
    const { data, error: insertError } = await supabase
      .from('messages')
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
    if (data) setMessages((current) => uniqueMessages([...current, data as ChatMessage]));
  }

  async function handleSendImage(file: File) {
    if (!room || !userId || !nickname) return;
    const ext = file.name.split('.').pop() || 'png';
    const path = `${room.id}/${userId}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('chat-images').upload(path, file);
    if (uploadError) throw uploadError;

    const { data: publicData } = supabase.storage.from('chat-images').getPublicUrl(path);
    const { data, error: insertError } = await supabase
      .from('messages')
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
    if (data) setMessages((current) => uniqueMessages([...current, data as ChatMessage]));
  }

  async function handleThemeChange(nextTheme: ThemeType) {
    setTheme(nextTheme);
    if (!room) return;
    setRoom({ ...room, theme: nextTheme });
    await supabase.from('rooms').update({ theme: nextTheme }).eq('id', room.id);
  }

  async function copyInvite() {
    await navigator.clipboard.writeText(inviteUrl);
  }

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f5f7fb] text-slate-600">
        <div className="inline-flex items-center gap-2">
          <Loader2 className="animate-spin" size={18} />
          正在加载房间
        </div>
      </div>
    );
  }

  if (error && !room) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f5f7fb] px-6">
        <div className="max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-soft">
          <h1 className="text-xl font-semibold text-slate-950">无法进入房间</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <ThemeShell
      theme={theme}
      roomName={room?.name || 'OfficeChat'}
      bossMode={bossMode}
      onlineCount={onlineUsers.length}
      toolbar={
        <>
          <Button variant="secondary" className="hidden sm:inline-flex" onClick={copyInvite} title="复制邀请链接">
            <Copy size={16} />
            邀请
          </Button>
          <Button variant="secondary" onClick={toggleBossMode} title="老板键">
            <Moon size={16} />
          </Button>
        </>
      }
    >
      <div className="grid h-[calc(100vh-104px)] grid-rows-[auto_1fr_auto]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-3">
          <div>
            <p className="text-sm font-medium text-slate-900">{room?.name}</p>
            <p className="mt-1 text-xs text-slate-500">邀请码 {inviteCode}</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={theme} onChange={(event) => void handleThemeChange(event.target.value as ThemeType)}>
              {themeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Button variant="ghost" onClick={() => window.location.reload()} title="刷新">
              <RefreshCw size={16} />
            </Button>
          </div>
        </div>

        <div className="overflow-y-auto bg-white">
          <MessageList messages={messages} currentUserId={userId} theme={theme} />
          <div ref={bottomRef} />
        </div>

        <MessageInput onSendText={handleSendText} onSendImage={handleSendImage} disabled={needsNickname || !room} />
      </div>

      {needsNickname ? (
        <div className="fixed inset-0 z-30 grid place-items-center bg-slate-950/35 px-6">
          <form className="w-full max-w-sm rounded-lg bg-white p-5 shadow-soft" onSubmit={handleNicknameSubmit}>
            <h2 className="text-lg font-semibold text-slate-950">填写昵称加入房间</h2>
            <p className="mt-2 text-sm text-slate-500">昵称会显示在文档讨论记录里。</p>
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
                加入房间
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </ThemeShell>
  );
}
