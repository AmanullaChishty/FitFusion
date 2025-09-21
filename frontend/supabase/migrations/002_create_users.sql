-- Create custom users profile table
create table if not exists public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique,
  email text,
  gender text check (gender in ('male','female','other')),
  age int check (age > 0),
  height numeric check (height > 0),
  weight numeric check (weight > 0),
  training_experience text, -- e.g. beginner, intermediate, advanced
  created_at timestamp with time zone default now()
);

-- Enable RLS (Row Level Security)
alter table public.users enable row level security;

-- Policy: users can select their own row
create policy "Users can view their own profile"
  on public.users for select
  using (auth.uid() = id);

-- Policy: users can insert their own profile (id must match auth.uid)
create policy "Users can insert their own profile"
  on public.users for insert
  with check (auth.uid() = id);

-- Policy: users can update their own profile
create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id);

-- Policy: users can delete their own profile
create policy "Users can delete their own profile"
  on public.users for delete
  using (auth.uid() = id);
