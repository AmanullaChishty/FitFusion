-- Workouts Table
create table if not exists workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  exercise_name text not null,
  sets int not null,
  reps int not null,
  weight numeric, -- optional (kg)
  created_at timestamp with time zone default now()
);

-- Meals Table
create table if not exists meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  meal_type text check (meal_type in ('breakfast','lunch','dinner','snack')) not null,
  calories numeric not null,
  protein numeric,
  carbs numeric,
  fat numeric,
  created_at timestamp with time zone default now()
);

-- Progress Tracking
create table if not exists progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  weight numeric,     -- body weight (kg)
  body_fat numeric,   -- %
  strength_score int, -- optional composite score
  created_at timestamp with time zone default now()
);

-- Enable Row-Level Security (RLS)
alter table workouts enable row level security;
alter table meals enable row level security;
alter table progress enable row level security;

-- Policies: Only the logged-in user can CRUD their own data
create policy "Users can insert their own workouts"
  on workouts for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own workouts"
  on workouts for select
  using (auth.uid() = user_id);

create policy "Users can update their own workouts"
  on workouts for update
  using (auth.uid() = user_id);

create policy "Users can delete their own workouts"
  on workouts for delete
  using (auth.uid() = user_id);

-- Repeat for meals
create policy "Users can insert their own meals"
  on meals for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own meals"
  on meals for select
  using (auth.uid() = user_id);

create policy "Users can update their own meals"
  on meals for update
  using (auth.uid() = user_id);

create policy "Users can delete their own meals"
  on meals for delete
  using (auth.uid() = user_id);

-- Repeat for progress
create policy "Users can insert their own progress"
  on progress for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own progress"
  on progress for select
  using (auth.uid() = user_id);

create policy "Users can update their own progress"
  on progress for update
  using (auth.uid() = user_id);

create policy "Users can delete their own progress"
  on progress for delete
  using (auth.uid() = user_id);
