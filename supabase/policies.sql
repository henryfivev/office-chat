alter table public.rooms enable row level security;
alter table public.room_members enable row level security;
alter table public.messages enable row level security;

drop policy if exists "authenticated users can create rooms" on public.rooms;
create policy "authenticated users can create rooms"
on public.rooms for insert
to authenticated
with check (auth.uid() = created_by);

drop policy if exists "authenticated users can read rooms" on public.rooms;
create policy "authenticated users can read rooms"
on public.rooms for select
to authenticated
using (true);

drop policy if exists "room creator can update room theme" on public.rooms;
create policy "room creator can update room theme"
on public.rooms for update
to authenticated
using (
  exists (
    select 1 from public.room_members
    where room_members.room_id = rooms.id
      and room_members.user_id = auth.uid()
  )
  or created_by = auth.uid()
)
with check (
  exists (
    select 1 from public.room_members
    where room_members.room_id = rooms.id
      and room_members.user_id = auth.uid()
  )
  or created_by = auth.uid()
);

drop policy if exists "authenticated users can join rooms" on public.room_members;
create policy "authenticated users can join rooms"
on public.room_members for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "members can update their membership" on public.room_members;
create policy "members can update their membership"
on public.room_members for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "authenticated users can read room members" on public.room_members;
create policy "authenticated users can read room members"
on public.room_members for select
to authenticated
using (true);

drop policy if exists "room members can read messages" on public.messages;
create policy "room members can read messages"
on public.messages for select
to authenticated
using (
  exists (
    select 1 from public.room_members
    where room_members.room_id = messages.room_id
      and room_members.user_id = auth.uid()
  )
);

drop policy if exists "room members can create messages" on public.messages;
create policy "room members can create messages"
on public.messages for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.room_members
    where room_members.room_id = messages.room_id
      and room_members.user_id = auth.uid()
  )
);

drop policy if exists "authenticated users can upload chat images" on storage.objects;
create policy "authenticated users can upload chat images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'chat-images'
  and owner = auth.uid()
);

drop policy if exists "public can read chat images" on storage.objects;
create policy "public can read chat images"
on storage.objects for select
to public
using (bucket_id = 'chat-images');
