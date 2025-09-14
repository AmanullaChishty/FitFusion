-- Users (linked with Supabase Auth)
create table if not exists profiles (
  id uuid references auth.users not null primary key,
  username text unique,
  created_at timestamp default now()
);

-- Workouts
create table if not exists workouts (
  id serial primary key,
  user_id uuid references profiles(id),
  exercise text not null,
  sets int not null,
  reps int not null,
  weight float,
  created_at timestamp default now()
);

-- Meals
create table if not exists meals (
  id serial primary key,
  user_id uuid references profiles(id),
  name text not null,
  calories int,
  protein float,
  carbs float,
  fat float,
  created_at timestamp default now()
);

-- Progress (weight, body fat, etc.)
create table if not exists progress (
  id serial primary key,
  user_id uuid references profiles(id),
  weight float,
  body_fat float,
  strength_score float,
  created_at timestamp default now()
);
