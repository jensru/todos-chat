-- Minimal Task Events (create/update/delete) with RLS
create table if not exists task_events (
  id uuid primary key default uuid_generate_v4(),
  "userId" uuid not null references auth.users(id) on delete cascade,
  "taskId" text not null,
  type text not null check (type in ('create','update','delete')),
  metadata jsonb default '{}'::jsonb,
  "createdAt" timestamptz not null default now()
);

create index if not exists idx_task_events_user_date on task_events ("userId", "createdAt");
create index if not exists idx_task_events_task on task_events ("taskId");

alter table task_events enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = current_schema() and tablename = 'task_events' and policyname = 'Users manage own task events'
  ) then
    create policy "Users manage own task events"
      on task_events
      for all
      using (auth.uid() = "userId")
      with check (auth.uid() = "userId");
  end if;
end $$;


