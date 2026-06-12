create extension if not exists pgcrypto;

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text unique not null,
  theme text not null default 'feishu' check (theme in ('feishu', 'dingtalk', 'tencent_doc')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.room_members (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  nickname text not null,
  avatar_url text,
  joined_at timestamptz not null default now(),
  unique(room_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  nickname text not null,
  type text not null default 'text' check (type in ('text', 'image')),
  content text,
  file_url text,
  status text not null default 'normal' check (status in ('normal', 'deleted')),
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_room_created_at
on public.messages(room_id, created_at desc);

alter publication supabase_realtime add table public.messages;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'chat-images',
  'chat-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
