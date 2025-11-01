-- Daily Memories schema (camelCase to match existing tables)
create table if not exists daily_memories (
  id uuid primary key default uuid_generate_v4(),
  "userId" uuid not null references auth.users(id) on delete cascade,
  date date not null,
  "contentMd" text not null,
  "createdAt" timestamptz not null default now(),
  unique ("userId", date)
);

-- Enable Row Level Security
alter table daily_memories enable row level security;

-- Users can manage only their own memories
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = current_schema() and tablename = 'daily_memories' and policyname = 'Users manage own memories'
  ) then
    create policy "Users manage own memories"
      on daily_memories
      for all
      using (auth.uid() = "userId")
      with check (auth.uid() = "userId");
  end if;
end $$;


 curl -X POST 'https://kickboost-todos.vercel.app/api/memory/cron' \
      -H 'Authorization: Bearer 46b4c684da0d87495becf5b8786094002ef130834dbbced6c21ff99affa871ed' \
      -H 'Content-Type: application/json' -d '{}'