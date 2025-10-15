-- Schema bootstrap for Supabase project: tasks table, indexes, RLS policies, trigger

-- Table: tasks
create table if not exists public.tasks (
  id text primary key,
  "userId" uuid not null,
  title text not null,
  description text default '' not null,
  notes text default '' not null,
  completed boolean default false not null,
  priority boolean default false not null,
  "dueDate" date,
  category text,
  tags jsonb default '[]'::jsonb not null,
  subtasks jsonb default '[]'::jsonb not null,
  "globalPosition" bigint not null,
  "createdAt" timestamptz default now() not null,
  "updatedAt" timestamptz default now() not null
);

-- Indexes
create index if not exists idx_tasks_user on public.tasks("userId");
create index if not exists idx_tasks_due on public.tasks("dueDate");
create index if not exists idx_tasks_global_position on public.tasks("globalPosition");

-- RLS
alter table public.tasks enable row level security;

drop policy if exists "Allow read own tasks" on public.tasks;
create policy "Allow read own tasks" on public.tasks
  for select using (auth.uid() = "userId");

drop policy if exists "Allow insert own tasks" on public.tasks;
create policy "Allow insert own tasks" on public.tasks
  for insert with check (auth.uid() = "userId");

drop policy if exists "Allow update own tasks" on public.tasks;
create policy "Allow update own tasks" on public.tasks
  for update using (auth.uid() = "userId") with check (auth.uid() = "userId");

drop policy if exists "Allow delete own tasks" on public.tasks;
create policy "Allow delete own tasks" on public.tasks
  for delete using (auth.uid() = "userId");

-- Trigger to update updatedAt
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new."updatedAt" = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_tasks_updated_at on public.tasks;
create trigger set_tasks_updated_at
before update on public.tasks
for each row
execute procedure public.set_updated_at();


