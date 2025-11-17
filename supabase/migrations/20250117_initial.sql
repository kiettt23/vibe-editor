-- VibeEdit Initial Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- PROJECTS TABLE
-- ============================================
create table if not exists projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  thumbnail_url text,
  canvas_data jsonb not null default '{}'::jsonb,
  width integer default 1920,
  height integer default 1080,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Indexes for better query performance
create index if not exists idx_projects_user_id on projects(user_id);
create index if not exists idx_projects_updated_at on projects(updated_at desc);

-- Row Level Security (RLS)
alter table projects enable row level security;

-- RLS Policies
create policy "Users can view their own projects"
  on projects for select
  using (auth.uid() = user_id);

create policy "Users can create their own projects"
  on projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own projects"
  on projects for update
  using (auth.uid() = user_id);

create policy "Users can delete their own projects"
  on projects for delete
  using (auth.uid() = user_id);

-- ============================================
-- USER PROFILES TABLE
-- ============================================
create table if not exists user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  subscription text default 'free' check (subscription in ('free', 'pro')),
  ai_quota_used integer default 0,
  ai_quota_limit integer default 5,
  created_at timestamp with time zone default now()
);

-- RLS for user_profiles
alter table user_profiles enable row level security;

create policy "Users can view their own profile"
  on user_profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on user_profiles for update
  using (auth.uid() = id);

-- Function to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, display_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'display_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to auto-create profile
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- USAGE LOGS TABLE
-- ============================================
create table if not exists usage_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  action text not null,
  metadata jsonb,
  timestamp timestamp with time zone default now()
);

-- Indexes
create index if not exists idx_usage_logs_user_id on usage_logs(user_id);
create index if not exists idx_usage_logs_timestamp on usage_logs(timestamp desc);

-- RLS
alter table usage_logs enable row level security;

create policy "Users can view their own logs"
  on usage_logs for select
  using (auth.uid() = user_id);

create policy "Users can create their own logs"
  on usage_logs for insert
  with check (auth.uid() = user_id);

-- ============================================
-- PRESET FILTERS TABLE
-- ============================================
create table if not exists preset_filters (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  thumbnail_url text,
  filters_config jsonb not null,
  is_public boolean default false,
  created_at timestamp with time zone default now()
);

-- Indexes
create index if not exists idx_preset_filters_user_id on preset_filters(user_id);
create index if not exists idx_preset_filters_public on preset_filters(is_public) where is_public = true;

-- RLS
alter table preset_filters enable row level security;

create policy "Anyone can view public presets"
  on preset_filters for select
  using (is_public = true or auth.uid() = user_id);

create policy "Users can create their own presets"
  on preset_filters for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own presets"
  on preset_filters for update
  using (auth.uid() = user_id);

create policy "Users can delete their own presets"
  on preset_filters for delete
  using (auth.uid() = user_id);

-- ============================================
-- UTILITY FUNCTIONS
-- ============================================

-- Function to get user statistics
create or replace function get_user_stats(user_uuid uuid)
returns table (
  total_projects bigint,
  ai_quota_remaining integer
) as $$
begin
  return query
  select 
    count(p.id) as total_projects,
    (up.ai_quota_limit - up.ai_quota_used) as ai_quota_remaining
  from user_profiles up
  left join projects p on p.user_id = up.id
  where up.id = user_uuid
  group by up.ai_quota_limit, up.ai_quota_used;
end;
$$ language plpgsql security definer;

-- Function to update timestamp on update
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to auto-update updated_at
drop trigger if exists update_projects_updated_at on projects;
create trigger update_projects_updated_at
  before update on projects
  for each row
  execute function update_updated_at();

-- ============================================
-- SEED DATA (Built-in Preset Filters)
-- ============================================
insert into preset_filters (user_id, name, thumbnail_url, filters_config, is_public)
values
  (null, 'Valencia', null, 
   '{"filters": [{"type": "Brightness", "brightness": 0.1}, {"type": "Saturation", "saturation": 0.2}, {"type": "Sepia", "value": 0.1}]}'::jsonb,
   true),
  (null, 'Clarendon', null,
   '{"filters": [{"type": "Contrast", "contrast": 0.2}, {"type": "Brightness", "brightness": 0.15}]}'::jsonb,
   true),
  (null, 'Gingham', null,
   '{"filters": [{"type": "Sepia", "value": 0.2}, {"type": "Contrast", "contrast": -0.1}]}'::jsonb,
   true),
  (null, 'Juno', null,
   '{"filters": [{"type": "Brightness", "brightness": 0.12}, {"type": "Saturation", "saturation": 0.25}]}'::jsonb,
   true),
  (null, 'Lark', null,
   '{"filters": [{"type": "Brightness", "brightness": 0.08}, {"type": "Grayscale", "value": 0.1}]}'::jsonb,
   true)
on conflict do nothing;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
do $$
begin
  raise notice 'Database schema created successfully! 🎉';
  raise notice 'Tables created: projects, user_profiles, usage_logs, preset_filters';
  raise notice 'RLS policies enabled for all tables';
  raise notice 'Built-in preset filters seeded';
end $$;
