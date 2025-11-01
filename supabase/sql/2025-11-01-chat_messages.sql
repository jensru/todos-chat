-- Chat messages per user and day (timezone-agnostic via date column)
create table if not exists chat_messages (
  id uuid primary key default uuid_generate_v4(),
  "userId" uuid not null references auth.users(id) on delete cascade,
  date date not null,
  role text not null check (role in ('user','bot')),
  content text not null,
  "createdAt" timestamptz not null default now()
);

create index if not exists idx_chat_messages_user_date_created on chat_messages ("userId", date, "createdAt");

alter table chat_messages enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = current_schema() and tablename = 'chat_messages' and policyname = 'Users manage own chat'
  ) then
    create policy "Users manage own chat"
      on chat_messages
      for all
      using (auth.uid() = "userId")
      with check (auth.uid() = "userId");
  end if;
end $$;


