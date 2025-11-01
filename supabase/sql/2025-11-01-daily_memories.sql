-- Daily Memories schema (camelCase to match existing tables)
create table if not exists daily_memories (
  id uuid primary key default uuid_generate_v4(),
  "userId" uuid not null references auth.users(id) on delete cascade,
  date date not null,
  "contentMd" text not null,
  "createdAt" timestamptz not null default now(),
  unique ("userId", date)
);


