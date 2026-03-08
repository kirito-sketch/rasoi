-- Rasoi Database Schema
-- Run this in Supabase SQL Editor: your project → SQL Editor → paste and run

-- Staples / pantry items
create table if not exists staples (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in (
    'Grains & Lentils',
    'Spices & Tempering',
    'Oils & Condiments',
    'Fridge',
    'Pasta & Dry Goods'
  )),
  in_stock boolean not null default true,
  item_type text not null default 'staple' check (item_type in ('staple', 'fresh', 'leftover')),
  quantity_level text not null default 'enough' check (quantity_level in ('a little', 'enough', 'plenty')),
  created_at timestamptz default now()
);

-- Utensil profile
create table if not exists utensils (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  available boolean not null default true,
  temp_unlock boolean not null default false
);

-- Meal history
create table if not exists meal_history (
  id uuid primary key default gen_random_uuid(),
  cooked_at timestamptz default now(),
  recipe_name text not null,
  cuisine text not null,
  ingredients_used text[] not null default '{}',
  estimated_protein float,
  estimated_carbs float,
  estimated_fat float,
  health_goal text,
  health_note text,
  recipe_data jsonb
);

-- Favourites
create table if not exists favourites (
  id uuid primary key default gen_random_uuid(),
  recipe_name text not null,
  recipe_data jsonb not null,
  saved_at timestamptz default now()
);

-- Row Level Security (open policies — single user personal app)
alter table staples enable row level security;
alter table utensils enable row level security;
alter table meal_history enable row level security;
alter table favourites enable row level security;

create policy "Allow all on staples" on staples for all using (true) with check (true);
create policy "Allow all on utensils" on utensils for all using (true) with check (true);
create policy "Allow all on meal_history" on meal_history for all using (true) with check (true);
create policy "Allow all on favourites" on favourites for all using (true) with check (true);

-- Seed default utensils
insert into utensils (name, available) values
  ('Gas stove', true),
  ('Pressure cooker', true),
  ('Kadai / wok', true),
  ('Tawa', true),
  ('Blender / mixie', true),
  ('Oven', false),
  ('Microwave', false)
on conflict (name) do nothing;
