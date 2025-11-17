-- Estates
create table if not exists estates (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  address text,
  created_at timestamptz default now()
);

-- Residents (users)
create table if not exists users (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  username text,
  password_hash text,
  role text not null default 'resident', -- 'estate' | 'resident' | 'admin'
  estate_id uuid references estates(id) on delete set null,
  created_at timestamptz default now()
);

-- Devices
create table if not exists devices (
  id uuid default gen_random_uuid() primary key,
  estate_id uuid references estates(id) on delete cascade,
  name text not null,
  type text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Indexes and small helpers
create index if not exists idx_users_estate on users(estate_id);
