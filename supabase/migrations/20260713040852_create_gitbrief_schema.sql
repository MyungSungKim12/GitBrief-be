create extension if not exists pgcrypto;

create table public.users (
  id uuid primary key default gen_random_uuid(),
  github_id bigint not null unique,
  github_login text not null,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  session_hash text not null unique,
  user_id uuid not null references public.users(id) on delete cascade,
  github_access_token text not null,
  expires_at timestamptz not null,
  last_used_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.repositories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  github_repository_id bigint not null,
  owner text not null,
  name text not null,
  full_name text not null,
  default_branch text not null,
  is_private boolean not null default false,
  synced_at timestamptz not null default now(),
  unique (user_id, github_repository_id)
);

create table public.summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  repository_id uuid references public.repositories(id) on delete set null,
  repository_full_name text not null,
  base_ref text not null,
  head_ref text not null,
  diff_hash text not null,
  purpose text not null,
  key_changes jsonb not null default '[]'::jsonb,
  review_notes jsonb not null default '[]'::jsonb,
  code_smells jsonb not null default '[]'::jsonb,
  model text not null,
  status text not null default 'completed' check (status in ('completed', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.review_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  original_message text not null,
  is_valid boolean not null,
  suggestion text,
  explanation text not null,
  created_at timestamptz not null default now()
);

create index sessions_user_id_idx on public.sessions(user_id);
create index sessions_expires_at_idx on public.sessions(expires_at);
create index repositories_user_id_idx on public.repositories(user_id);
create index summaries_user_created_idx on public.summaries(user_id, created_at desc);
create index review_results_user_created_idx on public.review_results(user_id, created_at desc);

alter table public.users enable row level security;
alter table public.sessions enable row level security;
alter table public.repositories enable row level security;
alter table public.summaries enable row level security;
alter table public.review_results enable row level security;

revoke all on public.users from anon, authenticated;
revoke all on public.sessions from anon, authenticated;
revoke all on public.repositories from anon, authenticated;
revoke all on public.summaries from anon, authenticated;
revoke all on public.review_results from anon, authenticated;
