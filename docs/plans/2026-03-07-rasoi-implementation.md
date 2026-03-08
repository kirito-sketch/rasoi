# Rasoi Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build Rasoi — a personal AI-powered cooking companion that generates healthy recipes across any cuisine based on your pantry, constraints, and health goals, with meal history tracking and nutrition awareness. Ingredients drive suggestions — cuisine is an optional mood filter.

**Architecture:** Next.js 14 App Router with server-side API routes keeping the Groq API key secure. Supabase PostgreSQL stores pantry, utensils, meal history, and favourites. Groq LLM generates recipes via a strict JSON schema prompt; Groq Vision handles camera ingredient recognition.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Groq SDK, Supabase JS client, next-pwa, Vercel

---

## Phase 1: Foundation

### Task 1: Scaffold Next.js project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `.env.local.example`

**Step 1: Initialise project**

```bash
cd "/Users/arunperi/Documents/new project"
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git
```

Expected: Project files created, dependencies installed.

**Step 2: Install core dependencies**

```bash
npm install @supabase/supabase-js groq-sdk next-pwa lucide-react clsx tailwind-merge
npx shadcn@latest init
```

When prompted for shadcn: choose Default style, Slate base colour, yes to CSS variables.

**Step 3: Install shadcn components we'll need**

```bash
npx shadcn@latest add button card badge input label select sheet dialog toast progress switch skeleton tabs separator
```

**Step 4: Create `.env.local.example`**

```
GROQ_API_KEY=your_groq_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Copy to `.env.local` and fill in real values.

**Step 5: Verify dev server runs**

```bash
npm run dev
```

Expected: App running at http://localhost:3000 with default Next.js page.

**Step 6: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold Next.js project with Tailwind and shadcn/ui"
```

---

### Task 2: Supabase schema

**Files:**
- Create: `supabase/schema.sql`
- Create: `src/lib/supabase.ts`

**Step 1: Create schema SQL file**

```sql
-- supabase/schema.sql

-- Staples / pantry items
create table if not exists staples (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('Grains & Lentils', 'Spices & Tempering', 'Oils & Condiments', 'Fridge')),
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

-- Row Level Security (open policies — single user app)
alter table staples enable row level security;
alter table utensils enable row level security;
alter table meal_history enable row level security;
alter table favourites enable row level security;

create policy "Allow all" on staples for all using (true) with check (true);
create policy "Allow all" on utensils for all using (true) with check (true);
create policy "Allow all" on meal_history for all using (true) with check (true);
create policy "Allow all" on favourites for all using (true) with check (true);

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
```

**Step 2: Run schema in Supabase**

Go to your Supabase project → SQL Editor → paste and run `supabase/schema.sql`.

**Step 3: Create Supabase client**

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

**Step 4: Create shared TypeScript types**

```typescript
// src/lib/types.ts
export type QuantityLevel = 'a little' | 'enough' | 'plenty'
export type ItemType = 'staple' | 'fresh' | 'leftover'
export type Category = 'Grains & Lentils' | 'Spices & Tempering' | 'Oils & Condiments' | 'Fridge'

export interface Staple {
  id: string
  name: string
  category: Category
  in_stock: boolean
  item_type: ItemType
  quantity_level: QuantityLevel
  created_at: string
}

export interface Utensil {
  id: string
  name: string
  available: boolean
  temp_unlock: boolean
}

export interface MealHistory {
  id: string
  cooked_at: string
  recipe_name: string
  cuisine: string
  ingredients_used: string[]
  estimated_protein?: number
  estimated_carbs?: number
  estimated_fat?: number
  health_goal?: string
  health_note?: string
  recipe_data?: Recipe
}

export interface Recipe {
  name: string
  description: string
  cuisine: string
  prep_time_mins: number
  cook_time_mins: number
  total_time_mins: number
  needs_marination: boolean
  marination_time_mins?: number
  difficulty: 'Easy' | 'Medium'
  servings: number
  health_highlight: string
  estimated_protein: number
  estimated_carbs: number
  estimated_fat: number
  ingredients: RecipeIngredient[]
  steps: string[]
  tips: string[]
  substitutions: Substitution[]
}

export interface RecipeIngredient {
  name: string
  amount: string
  is_staple: boolean
}

export interface Substitution {
  original: string
  substitute: string
}

export interface SessionPreferences {
  time_available: 15 | 30 | 45 | 60
  health_goal: 'High protein' | 'Balanced' | 'Low oil' | 'Low carb' | 'Flexible'
  cuisine?: 'Indian' | 'Italian' | 'Mediterranean' | 'Asian' | 'Mexican' | 'Surprise me' // optional — undefined = "Anything"
  servings: 1 | 2 | 3
  health_note?: string
}
```

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add Supabase schema and TypeScript types"
```

---

### Task 3: Global layout and theme

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/app/globals.css` (update)
- Create: `src/components/BottomNav.tsx`

**Step 1: Update root layout**

```typescript
// src/app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import BottomNav from '@/components/BottomNav'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Rasoi',
  description: 'Your personal AI cooking companion',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#0f172a',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground min-h-screen`}>
        <main className="max-w-md mx-auto pb-20 min-h-screen">
          {children}
        </main>
        <BottomNav />
        <Toaster />
      </body>
    </html>
  )
}
```

**Step 2: Create BottomNav component**

```typescript
// src/components/BottomNav.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBasket, History, Settings } from 'lucide-react'

const links = [
  { href: '/', icon: Home, label: 'Cook' },
  { href: '/pantry', icon: ShoppingBasket, label: 'Pantry' },
  { href: '/history', icon: History, label: 'History' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export default function BottomNav() {
  const pathname = usePathname()
  // Hide nav during cooking mode
  if (pathname.startsWith('/recipe/') && pathname.endsWith('/cook')) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background z-50">
      <div className="max-w-md mx-auto flex">
        {links.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center py-3 gap-1 text-xs transition-colors
                ${active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Icon size={20} />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
```

**Step 3: Create PWA manifest**

```json
// public/manifest.json
{
  "name": "Rasoi",
  "short_name": "Rasoi",
  "description": "Your personal AI cooking companion",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#0f172a",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

Create placeholder icons (192x192 and 512x512 PNG files) in `/public/`.

**Step 4: Verify layout renders with nav**

```bash
npm run dev
```

Expected: Page loads with bottom navigation bar showing 4 tabs.

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add global layout, bottom nav, and PWA manifest"
```

---

## Phase 2: Pantry & Settings

### Task 4: Settings page — utensil profile

**Files:**
- Create: `src/app/settings/page.tsx`
- Create: `src/lib/db/utensils.ts`

**Step 1: Create utensil database helpers**

```typescript
// src/lib/db/utensils.ts
import { supabase } from '@/lib/supabase'
import { Utensil } from '@/lib/types'

export async function getUtensils(): Promise<Utensil[]> {
  const { data, error } = await supabase.from('utensils').select('*').order('name')
  if (error) throw error
  return data
}

export async function toggleUtensil(id: string, available: boolean) {
  const { error } = await supabase.from('utensils').update({ available }).eq('id', id)
  if (error) throw error
}

export async function tempUnlockUtensil(id: string, temp_unlock: boolean) {
  const { error } = await supabase.from('utensils').update({ temp_unlock }).eq('id', id)
  if (error) throw error
}

export async function resetTempUnlocks() {
  const { error } = await supabase.from('utensils').update({ temp_unlock: false }).neq('id', '')
  if (error) throw error
}
```

**Step 2: Create settings page**

```typescript
// src/app/settings/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { getUtensils, toggleUtensil } from '@/lib/db/utensils'
import { Utensil } from '@/lib/types'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SettingsPage() {
  const [utensils, setUtensils] = useState<Utensil[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getUtensils().then(setUtensils).finally(() => setLoading(false))
  }, [])

  async function handleToggle(id: string, current: boolean) {
    await toggleUtensil(id, !current)
    setUtensils(prev => prev.map(u => u.id === id ? { ...u, available: !current } : u))
  }

  if (loading) return <div className="p-6 text-muted-foreground">Loading...</div>

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">My Utensils</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {utensils.map(utensil => (
            <div key={utensil.id} className="flex items-center justify-between">
              <Label htmlFor={utensil.id}>{utensil.name}</Label>
              <Switch
                id={utensil.id}
                checked={utensil.available}
                onCheckedChange={() => handleToggle(utensil.id, utensil.available)}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
```

**Step 3: Test manually**

Navigate to http://localhost:3000/settings — should show utensil toggles loaded from Supabase.

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add settings page with utensil profile"
```

---

### Task 5: Onboarding flow

**Files:**
- Create: `src/app/onboarding/page.tsx`
- Create: `src/lib/data/south-indian-staples.ts`
- Create: `src/lib/db/staples.ts`

**Step 1: Create South Indian starter staples data**

```typescript
// src/lib/data/south-indian-staples.ts
import { Category } from '@/lib/types'

// Starter pantry items per cuisine — combined at onboarding based on user selection
export type CuisineKey = 'Indian' | 'Italian' | 'Mediterranean' | 'Asian' | 'Mexican'

export const starterPantryByCuisine: Record<CuisineKey, { name: string; category: Category }[]> = {
  Indian: [
    // Grains & Lentils
    { name: 'Rice', category: 'Grains & Lentils' },
    { name: 'Toor dal', category: 'Grains & Lentils' },
    { name: 'Chana dal', category: 'Grains & Lentils' },
    { name: 'Urad dal', category: 'Grains & Lentils' },
    { name: 'Moong dal', category: 'Grains & Lentils' },
    { name: 'Poha', category: 'Grains & Lentils' },
    { name: 'Rava / Semolina', category: 'Grains & Lentils' },
    { name: 'Atta / wheat flour', category: 'Grains & Lentils' },
    // Spices & Tempering
    { name: 'Mustard seeds', category: 'Spices & Tempering' },
    { name: 'Cumin seeds', category: 'Spices & Tempering' },
    { name: 'Curry leaves', category: 'Spices & Tempering' },
    { name: 'Turmeric powder', category: 'Spices & Tempering' },
    { name: 'Red chilli powder', category: 'Spices & Tempering' },
    { name: 'Coriander powder', category: 'Spices & Tempering' },
    { name: 'Garam masala', category: 'Spices & Tempering' },
    { name: 'Asafoetida (hing)', category: 'Spices & Tempering' },
    { name: 'Dry red chillies', category: 'Spices & Tempering' },
    { name: 'Black pepper', category: 'Spices & Tempering' },
    { name: 'Salt', category: 'Spices & Tempering' },
    // Oils & Condiments
    { name: 'Coconut oil', category: 'Oils & Condiments' },
    { name: 'Sesame / gingelly oil', category: 'Oils & Condiments' },
    { name: 'Sunflower oil', category: 'Oils & Condiments' },
    { name: 'Tamarind', category: 'Oils & Condiments' },
    { name: 'Coconut (desiccated)', category: 'Oils & Condiments' },
    { name: 'Jaggery', category: 'Oils & Condiments' },
    // Fridge
    { name: 'Eggs', category: 'Fridge' },
    { name: 'Curd / yogurt', category: 'Fridge' },
    { name: 'Milk', category: 'Fridge' },
  ],
  Italian: [
    // Pasta & Dry Goods
    { name: 'Spaghetti', category: 'Pasta & Dry Goods' },
    { name: 'Penne', category: 'Pasta & Dry Goods' },
    { name: 'Breadcrumbs', category: 'Pasta & Dry Goods' },
    // Spices & Tempering
    { name: 'Dried oregano', category: 'Spices & Tempering' },
    { name: 'Dried basil', category: 'Spices & Tempering' },
    { name: 'Dried thyme', category: 'Spices & Tempering' },
    { name: 'Chilli flakes', category: 'Spices & Tempering' },
    { name: 'Black pepper', category: 'Spices & Tempering' },
    { name: 'Salt', category: 'Spices & Tempering' },
    // Oils & Condiments
    { name: 'Olive oil', category: 'Oils & Condiments' },
    { name: 'Canned tomatoes', category: 'Oils & Condiments' },
    { name: 'Tomato paste', category: 'Oils & Condiments' },
    { name: 'Garlic', category: 'Oils & Condiments' },
    // Fridge
    { name: 'Eggs', category: 'Fridge' },
    { name: 'Parmesan', category: 'Fridge' },
    { name: 'Butter', category: 'Fridge' },
    { name: 'Milk', category: 'Fridge' },
  ],
  Mediterranean: [
    { name: 'Olive oil', category: 'Oils & Condiments' },
    { name: 'Chickpeas (canned)', category: 'Grains & Lentils' },
    { name: 'Lemon juice', category: 'Oils & Condiments' },
    { name: 'Dried oregano', category: 'Spices & Tempering' },
    { name: 'Cumin seeds', category: 'Spices & Tempering' },
    { name: 'Paprika', category: 'Spices & Tempering' },
    { name: 'Salt', category: 'Spices & Tempering' },
    { name: 'Garlic', category: 'Oils & Condiments' },
    { name: 'Eggs', category: 'Fridge' },
    { name: 'Feta cheese', category: 'Fridge' },
  ],
  Asian: [
    { name: 'Rice', category: 'Grains & Lentils' },
    { name: 'Soy sauce', category: 'Oils & Condiments' },
    { name: 'Sesame oil', category: 'Oils & Condiments' },
    { name: 'Garlic', category: 'Oils & Condiments' },
    { name: 'Ginger', category: 'Spices & Tempering' },
    { name: 'Chilli flakes', category: 'Spices & Tempering' },
    { name: 'Rice vinegar', category: 'Oils & Condiments' },
    { name: 'Salt', category: 'Spices & Tempering' },
    { name: 'Eggs', category: 'Fridge' },
  ],
  Mexican: [
    { name: 'Rice', category: 'Grains & Lentils' },
    { name: 'Black beans (canned)', category: 'Grains & Lentils' },
    { name: 'Cumin seeds', category: 'Spices & Tempering' },
    { name: 'Paprika', category: 'Spices & Tempering' },
    { name: 'Chilli flakes', category: 'Spices & Tempering' },
    { name: 'Garlic', category: 'Oils & Condiments' },
    { name: 'Olive oil', category: 'Oils & Condiments' },
    { name: 'Canned tomatoes', category: 'Oils & Condiments' },
    { name: 'Salt', category: 'Spices & Tempering' },
    { name: 'Eggs', category: 'Fridge' },
    { name: 'Cheddar cheese', category: 'Fridge' },
  ],
}

// Build combined starter pantry from selected cuisines (deduplicated by name)
export function buildStarterPantry(
  selectedCuisines: CuisineKey[]
): { name: string; category: Category }[] {
  const seen = new Set<string>()
  const result: { name: string; category: Category }[] = []
  for (const cuisine of selectedCuisines) {
    for (const item of starterPantryByCuisine[cuisine]) {
      if (!seen.has(item.name)) {
        seen.add(item.name)
        result.push(item)
      }
    }
  }
  return result
}

// Legacy export for backwards compat
export const southIndianStarterPantry = starterPantryByCuisine.Indian
```

**Step 2: Create staples database helpers**

```typescript
// src/lib/db/staples.ts
import { supabase } from '@/lib/supabase'
import { Staple, Category, ItemType, QuantityLevel } from '@/lib/types'

export async function getStaples(): Promise<Staple[]> {
  const { data, error } = await supabase
    .from('staples')
    .select('*')
    .order('category')
    .order('name')
  if (error) throw error
  return data
}

export async function addStaple(
  name: string,
  category: Category,
  item_type: ItemType = 'staple',
  quantity_level: QuantityLevel = 'enough'
): Promise<Staple> {
  const { data, error } = await supabase
    .from('staples')
    .insert({ name, category, item_type, quantity_level })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function bulkAddStaples(
  items: { name: string; category: Category }[]
): Promise<void> {
  const { error } = await supabase.from('staples').insert(
    items.map(item => ({ ...item, item_type: 'staple', quantity_level: 'enough' }))
  )
  if (error) throw error
}

export async function toggleStapleStock(id: string, in_stock: boolean) {
  const { error } = await supabase.from('staples').update({ in_stock }).eq('id', id)
  if (error) throw error
}

export async function updateQuantityLevel(id: string, quantity_level: QuantityLevel) {
  const { error } = await supabase.from('staples').update({ quantity_level }).eq('id', id)
  if (error) throw error
}

export async function deleteStaple(id: string) {
  const { error } = await supabase.from('staples').delete().eq('id', id)
  if (error) throw error
}

export async function clearFreshIngredients() {
  const { error } = await supabase.from('staples').delete().eq('item_type', 'fresh')
  if (error) throw error
}
```

**Step 3: Create onboarding page**

```typescript
// src/app/onboarding/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { southIndianStarterPantry } from '@/lib/data/south-indian-staples'
import { bulkAddStaples } from '@/lib/db/staples'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Category } from '@/lib/types'

const CATEGORIES: Category[] = ['Grains & Lentils', 'Spices & Tempering', 'Oils & Condiments', 'Fridge']

export default function OnboardingPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(
    new Set(southIndianStarterPantry.map(s => s.name))
  )
  const [saving, setSaving] = useState(false)

  function toggleItem(name: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  async function handleSave() {
    setSaving(true)
    const toSave = southIndianStarterPantry.filter(s => selected.has(s.name))
    await bulkAddStaples(toSave)
    localStorage.setItem('rasoi_onboarded', 'true')
    router.push('/pantry')
  }

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Set up your pantry</h1>
        <p className="text-muted-foreground mt-1">
          These are common South Indian staples. Deselect anything you don't have.
        </p>
      </div>

      {CATEGORIES.map(cat => {
        const items = southIndianStarterPantry.filter(s => s.category === cat)
        return (
          <div key={cat}>
            <h2 className="text-sm font-semibold text-muted-foreground mb-2">{cat}</h2>
            <div className="flex flex-wrap gap-2">
              {items.map(item => (
                <button
                  key={item.name}
                  onClick={() => toggleItem(item.name)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors
                    ${selected.has(item.name)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-muted-foreground border-border'}`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        )
      })}

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? 'Saving...' : 'Save my pantry'}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        You can always add or remove items later in Pantry
      </p>
    </div>
  )
}
```

**Step 4: Add onboarding redirect to home page**

In `src/app/page.tsx` (session setup — built in Task 8), add a check at top:

```typescript
useEffect(() => {
  if (!localStorage.getItem('rasoi_onboarded')) {
    router.push('/onboarding')
  }
}, [])
```

**Step 5: Test manually**

Navigate to http://localhost:3000/onboarding — deselect a few items, save. Check Supabase `staples` table — rows should be inserted.

**Step 6: Commit**

```bash
git add .
git commit -m "feat: add onboarding questionnaire with South Indian starter pantry"
```

---

### Task 6: Pantry management page

**Files:**
- Create: `src/app/pantry/page.tsx`
- Create: `src/components/StapleCard.tsx`
- Create: `src/components/AddIngredientSheet.tsx`

**Step 1: Create StapleCard component**

```typescript
// src/components/StapleCard.tsx
'use client'
import { Staple, QuantityLevel } from '@/lib/types'
import { toggleStapleStock, updateQuantityLevel, deleteStaple } from '@/lib/db/staples'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

const QUANTITY_LEVELS: QuantityLevel[] = ['a little', 'enough', 'plenty']

interface Props {
  staple: Staple
  onChange: () => void
}

export default function StapleCard({ staple, onChange }: Props) {
  async function handleToggleStock() {
    await toggleStapleStock(staple.id, !staple.in_stock)
    onChange()
  }

  async function handleQuantityChange(level: QuantityLevel) {
    await updateQuantityLevel(staple.id, level)
    onChange()
  }

  async function handleDelete() {
    await deleteStaple(staple.id)
    onChange()
  }

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border transition-opacity
      ${staple.in_stock ? 'opacity-100' : 'opacity-40'}`}>
      <div className="flex-1">
        <button
          onClick={handleToggleStock}
          className="text-sm font-medium text-left hover:text-primary transition-colors"
        >
          {staple.name}
        </button>
        {staple.in_stock && (
          <div className="flex gap-1 mt-1">
            {QUANTITY_LEVELS.map(level => (
              <button
                key={level}
                onClick={() => handleQuantityChange(level)}
                className={`text-xs px-2 py-0.5 rounded-full border transition-colors
                  ${staple.quantity_level === level
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground'}`}
              >
                {level}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 ml-2">
        {!staple.in_stock && (
          <Badge variant="outline" className="text-xs">Out</Badge>
        )}
        {staple.item_type !== 'staple' && (
          <button onClick={handleDelete} className="text-muted-foreground hover:text-destructive">
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
```

**Step 2: Create AddIngredientSheet component**

```typescript
// src/components/AddIngredientSheet.tsx
'use client'
import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { addStaple } from '@/lib/db/staples'
import { Category, ItemType } from '@/lib/types'
import { Plus } from 'lucide-react'

const CATEGORIES: Category[] = ['Grains & Lentils', 'Spices & Tempering', 'Oils & Condiments', 'Fridge']

interface Props {
  type: ItemType
  onAdded: () => void
  trigger?: React.ReactNode
}

export default function AddIngredientSheet({ type, onAdded, trigger }: Props) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [category, setCategory] = useState<Category>('Fridge')
  const [saving, setSaving] = useState(false)

  async function handleAdd() {
    if (!name.trim()) return
    setSaving(true)
    await addStaple(name.trim(), category, type)
    setName('')
    setSaving(false)
    setOpen(false)
    onAdded()
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            <Plus size={16} className="mr-1" /> Add
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Add {type} ingredient</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label>Name</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Chicken breast"
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
          </div>
          <div>
            <Label>Category</Label>
            <Select value={category} onValueChange={v => setCategory(v as Category)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAdd} disabled={saving || !name.trim()} className="w-full">
            {saving ? 'Adding...' : 'Add ingredient'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
```

**Step 3: Create pantry page**

```typescript
// src/app/pantry/page.tsx
'use client'
import { useEffect, useState, useCallback } from 'react'
import { getStaples } from '@/lib/db/staples'
import { Staple, Category } from '@/lib/types'
import StapleCard from '@/components/StapleCard'
import AddIngredientSheet from '@/components/AddIngredientSheet'
import CameraScanner from '@/components/CameraScanner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const CATEGORIES: Category[] = ['Grains & Lentils', 'Spices & Tempering', 'Oils & Condiments', 'Fridge']

export default function PantryPage() {
  const [staples, setStaples] = useState<Staple[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(() => {
    getStaples().then(setStaples).finally(() => setLoading(false))
  }, [])

  useEffect(() => { reload() }, [reload])

  const permanentStaples = staples.filter(s => s.item_type === 'staple')
  const freshItems = staples.filter(s => s.item_type === 'fresh' || s.item_type === 'leftover')

  if (loading) return <div className="p-6 text-muted-foreground">Loading pantry...</div>

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pantry</h1>
        <CameraScanner onAdded={reload} />
      </div>

      <Tabs defaultValue="staples">
        <TabsList className="w-full">
          <TabsTrigger value="staples" className="flex-1">Staples</TabsTrigger>
          <TabsTrigger value="fresh" className="flex-1">Fresh / Today</TabsTrigger>
        </TabsList>

        <TabsContent value="staples" className="space-y-4 mt-4">
          {CATEGORIES.map(cat => {
            const items = permanentStaples.filter(s => s.category === cat)
            if (items.length === 0) return null
            return (
              <div key={cat}>
                <h2 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                  {cat}
                </h2>
                <div className="space-y-2">
                  {items.map(s => (
                    <StapleCard key={s.id} staple={s} onChange={reload} />
                  ))}
                </div>
              </div>
            )
          })}
          <AddIngredientSheet type="staple" onAdded={reload} />
        </TabsContent>

        <TabsContent value="fresh" className="space-y-2 mt-4">
          {freshItems.length === 0 && (
            <p className="text-muted-foreground text-sm">Nothing added yet today.</p>
          )}
          {freshItems.map(s => (
            <StapleCard key={s.id} staple={s} onChange={reload} />
          ))}
          <AddIngredientSheet type="fresh" onAdded={reload} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

**Step 4: Test manually**

Navigate to http://localhost:3000/pantry — should see staples grouped by category with toggle and quantity controls.

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add pantry management page with staple and fresh ingredient tabs"
```

---

### Task 7: Camera scan — Groq Vision

**Files:**
- Create: `src/app/api/recognize/route.ts`
- Create: `src/components/CameraScanner.tsx`

**Step 1: Create Groq Vision API route**

```typescript
// src/app/api/recognize/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { imageBase64 } = await req.json()

    const response = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
            },
            {
              type: 'text',
              text: `You are a kitchen ingredient identifier. Look at this image and identify all visible food ingredients.
Return ONLY a JSON array of ingredient names, nothing else.
Example: ["Rice", "Tomatoes", "Onions", "Eggs"]
Only include actual food ingredients, not utensils or packaging.`,
            },
          ],
        },
      ],
      max_tokens: 256,
    })

    const content = response.choices[0].message.content ?? '[]'
    const ingredients: string[] = JSON.parse(content)
    return NextResponse.json({ ingredients })
  } catch (error) {
    console.error('Vision error:', error)
    return NextResponse.json({ ingredients: [], error: 'Could not identify ingredients' }, { status: 500 })
  }
}
```

**Step 2: Create CameraScanner component**

```typescript
// src/components/CameraScanner.tsx
'use client'
import { useRef, useState } from 'react'
import { Camera, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { addStaple } from '@/lib/db/staples'

interface Props {
  onAdded: () => void
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX = 800
        const ratio = Math.min(MAX / img.width, MAX / img.height, 1)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.8).split(',')[1])
      }
      img.src = e.target!.result as string
    }
    reader.readAsDataURL(file)
  })
}

export default function CameraScanner({ onAdded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [identified, setIdentified] = useState<string[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setScanning(true)
    setError('')
    const imageBase64 = await compressImage(file)
    const res = await fetch('/api/recognize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64 }),
    })
    const data = await res.json()
    setScanning(false)
    if (data.error) { setError(data.error); return }
    setIdentified(data.ingredients)
    setSelected(new Set(data.ingredients))
    setOpen(true)
  }

  async function handleAddSelected() {
    setSaving(true)
    for (const name of selected) {
      await addStaple(name, 'Fridge', 'fresh')
    }
    setSaving(false)
    setOpen(false)
    setIdentified([])
    onAdded()
  }

  function toggleItem(name: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleCapture}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={scanning}
      >
        <Camera size={16} className="mr-1" />
        {scanning ? 'Scanning...' : 'Scan'}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Identified ingredients</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Tap to deselect anything wrong</p>
          <div className="flex flex-wrap gap-2 my-2">
            {identified.map(item => (
              <button
                key={item}
                onClick={() => toggleItem(item)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors
                  ${selected.has(item)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'opacity-40 border-border'}`}
              >
                {item}
              </button>
            ))}
          </div>
          <Button onClick={handleAddSelected} disabled={saving || selected.size === 0} className="w-full">
            {saving ? 'Adding...' : `Add ${selected.size} ingredient${selected.size !== 1 ? 's' : ''}`}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
```

**Step 3: Test manually**

Go to /pantry → tap Scan → take a photo of some ingredients → verify identified list appears → confirm adds to fresh tab.

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add camera scan with Groq vision for ingredient recognition"
```

---

## Phase 3: Core Recipe Flow

### Task 8: Session setup — home page

**Files:**
- Create: `src/app/page.tsx`
- Create: `src/lib/session.ts`

**Step 1: Create session persistence helper**

```typescript
// src/lib/session.ts
import { SessionPreferences } from '@/lib/types'

const KEY = 'rasoi_session'

const defaults: SessionPreferences = {
  time_available: 30,
  health_goal: 'Balanced',
  cuisine: 'South Indian',
  servings: 1,
}

export function loadSession(): SessionPreferences {
  if (typeof window === 'undefined') return defaults
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }
  } catch {
    return defaults
  }
}

export function saveSession(prefs: SessionPreferences) {
  localStorage.setItem(KEY, JSON.stringify(prefs))
}
```

**Step 2: Create home / session setup page**

```typescript
// src/app/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadSession, saveSession } from '@/lib/session'
import { SessionPreferences } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { ChefHat } from 'lucide-react'

type Option<T> = { label: string; value: T }

const TIME_OPTIONS: Option<SessionPreferences['time_available']>[] = [
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '1 hr+', value: 60 },
]

const HEALTH_OPTIONS: Option<SessionPreferences['health_goal']>[] = [
  { label: 'High protein', value: 'High protein' },
  { label: 'Balanced', value: 'Balanced' },
  { label: 'Low oil', value: 'Low oil' },
  { label: 'Low carb', value: 'Low carb' },
  { label: 'Flexible', value: 'Flexible' },
]

// Cuisine is optional — undefined means "Anything"
const CUISINE_OPTIONS: { label: string; value: SessionPreferences['cuisine'] }[] = [
  { label: 'Anything', value: undefined },
  { label: 'Indian', value: 'Indian' },
  { label: 'Italian', value: 'Italian' },
  { label: 'Mediterranean', value: 'Mediterranean' },
  { label: 'Asian', value: 'Asian' },
  { label: 'Mexican', value: 'Mexican' },
  { label: 'Surprise me', value: 'Surprise me' },
]

const SERVING_OPTIONS: Option<SessionPreferences['servings']>[] = [
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3+', value: 3 },
]

const HEALTH_NOTES = [
  'Body heat (vedi chesindi)',
  'Stomach issue',
  'Cold / fever',
  'Low energy',
]

function OptionGroup<T>({
  label, options, value, onChange
}: {
  label: string
  options: Option<T>[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground uppercase tracking-wide">{label}</Label>
      <div className="flex flex-wrap gap-2 mt-2">
        {options.map(opt => (
          <button
            key={String(opt.value)}
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors
              ${value === opt.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-foreground hover:border-primary'}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function HomePage() {
  const router = useRouter()
  const [prefs, setPrefs] = useState<SessionPreferences>(loadSession)
  const [showHealthNote, setShowHealthNote] = useState(false)
  const [customNote, setCustomNote] = useState('')

  useEffect(() => {
    if (!localStorage.getItem('rasoi_onboarded')) {
      router.push('/onboarding')
    }
  }, [router])

  function update<K extends keyof SessionPreferences>(key: K, value: SessionPreferences[K]) {
    setPrefs(prev => ({ ...prev, [key]: value }))
  }

  function handleCook() {
    const finalPrefs = { ...prefs, health_note: customNote || prefs.health_note }
    saveSession(finalPrefs)
    localStorage.setItem('rasoi_current_session', JSON.stringify(finalPrefs))
    router.push('/recipes')
  }

  return (
    <div className="p-4 space-y-6">
      <div className="pt-4">
        <h1 className="text-3xl font-bold">Rasoi</h1>
        <p className="text-muted-foreground mt-1">What are you cooking today?</p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          <OptionGroup
            label="Time available"
            options={TIME_OPTIONS}
            value={prefs.time_available}
            onChange={v => update('time_available', v)}
          />
          <OptionGroup
            label="Health goal"
            options={HEALTH_OPTIONS}
            value={prefs.health_goal}
            onChange={v => update('health_goal', v)}
          />
          <OptionGroup
            label="Cuisine"
            options={CUISINE_OPTIONS}
            value={prefs.cuisine}
            onChange={v => update('cuisine', v)}
          />
          <OptionGroup
            label="Servings"
            options={SERVING_OPTIONS}
            value={prefs.servings}
            onChange={v => update('servings', v)}
          />

          <div>
            <button
              onClick={() => setShowHealthNote(!showHealthNote)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {showHealthNote ? '− ' : '+ '}Not feeling 100%? Add a note
            </button>
            {showHealthNote && (
              <div className="mt-3 space-y-2">
                <div className="flex flex-wrap gap-2">
                  {HEALTH_NOTES.map(note => (
                    <button
                      key={note}
                      onClick={() => setCustomNote(customNote === note ? '' : note)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors
                        ${customNote === note
                          ? 'bg-amber-500 text-white border-amber-500'
                          : 'border-border text-foreground'}`}
                    >
                      {note}
                    </button>
                  ))}
                </div>
                <Input
                  value={customNote}
                  onChange={e => setCustomNote(e.target.value)}
                  placeholder="Or type something custom..."
                  className="mt-2"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleCook} size="lg" className="w-full">
        <ChefHat className="mr-2" size={20} />
        Find recipes
      </Button>
    </div>
  )
}
```

**Step 5: Test manually**

Navigate to http://localhost:3000 — should show session setup, defaulting to last saved preferences.

**Step 6: Commit**

```bash
git add .
git commit -m "feat: add session setup home page with preference persistence"
```

---

### Task 9: Recipe generation API — Groq LLM

**Files:**
- Create: `src/app/api/recipes/route.ts`
- Create: `src/lib/prompts.ts`

**Step 1: Create prompt builder**

```typescript
// src/lib/prompts.ts
import { SessionPreferences, Staple, Utensil } from '@/lib/types'
import { MealHistory } from '@/lib/types'

export function buildRecipePrompt(
  prefs: SessionPreferences,
  staples: Staple[],
  utensils: Utensil[],
  recentHistory: MealHistory[]
): string {
  const inStock = staples.filter(s => s.in_stock)
  const ingredientList = inStock.map(s =>
    `${s.name} (${s.quantity_level}, ${s.item_type})`
  ).join(', ')

  const availableUtensils = [
    ...utensils.filter(u => u.available || u.temp_unlock).map(u => u.name)
  ].join(', ')

  const recentMeals = recentHistory.slice(0, 7).map(m =>
    `${m.recipe_name} (${new Date(m.cooked_at).toLocaleDateString()}, protein: ${m.estimated_protein ?? '?'}g)`
  ).join('; ')

  const recentIngredients = [...new Set(
    recentHistory.slice(0, 5).flatMap(m => m.ingredients_used)
  )].join(', ')

  const cuisineInstruction = prefs.cuisine
    ? `- Cuisine preference: ${prefs.cuisine === 'Surprise me' ? 'surprise me — pick any cuisine that works well with the ingredients' : `lean towards ${prefs.cuisine} but don't force it if the ingredients suit something else better`}`
    : `- Cuisine: open to anything — let the ingredients decide. Could be Indian, Italian, Mediterranean, Asian, fusion, anything.`

  return `You are a professional chef skilled across Indian, Italian, Mediterranean, Asian, and other cuisines, and a nutritionist. Generate exactly 3 healthy recipe options.

CONSTRAINTS:
- Total time (prep + cook combined): max ${prefs.time_available} minutes
- Health goal: ${prefs.health_goal}
${cuisineInstruction}
- Servings: ${prefs.servings}
- Available utensils ONLY: ${availableUtensils}
- NO oven, NO microwave unless listed above
${prefs.health_note ? `- Health note: ${prefs.health_note} — adjust recipes accordingly (cooling foods for body heat, light for stomach issues, etc.)` : ''}

AVAILABLE INGREDIENTS:
${ingredientList}

RECENT MEAL HISTORY (for variety):
${recentMeals || 'No history yet'}
Recent ingredients used: ${recentIngredients || 'none'}
Vary ingredients and recipes — avoid repeating what was cooked recently.

RULES:
- Only use ingredients from the available list above
- Provide substitutions where helpful
- Be cuisine-accurate in technique (e.g. tadka sequence for Indian, pasta cooking technique for Italian)
- Mark recipes needing marination with needs_marination: true
- Nutrition values are estimates per serving
- Prioritise the health goal in ingredient choices and cooking method

Return ONLY valid JSON matching this exact schema, no markdown, no explanation:
{
  "recipes": [
    {
      "name": "string",
      "description": "string (one line)",
      "cuisine": "string",
      "prep_time_mins": number,
      "cook_time_mins": number,
      "total_time_mins": number,
      "needs_marination": boolean,
      "marination_time_mins": number | null,
      "difficulty": "Easy" | "Medium",
      "servings": number,
      "health_highlight": "string (e.g. High protein · ~28g per serving)",
      "estimated_protein": number,
      "estimated_carbs": number,
      "estimated_fat": number,
      "ingredients": [
        { "name": "string", "amount": "string", "is_staple": boolean }
      ],
      "steps": ["string"],
      "tips": ["string"],
      "substitutions": [
        { "original": "string", "substitute": "string" }
      ]
    }
  ]
}`
}
```

**Step 2: Create recipe generation API route**

```typescript
// src/app/api/recipes/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { buildRecipePrompt } from '@/lib/prompts'
import { SessionPreferences, Staple, Utensil, MealHistory } from '@/lib/types'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { prefs, staples, utensils, recentHistory }: {
      prefs: SessionPreferences
      staples: Staple[]
      utensils: Utensil[]
      recentHistory: MealHistory[]
    } = await req.json()

    const prompt = buildRecipePrompt(prefs, staples, utensils, recentHistory)

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4096,
      response_format: { type: 'json_object' },
    })

    const content = completion.choices[0].message.content ?? '{}'
    const parsed = JSON.parse(content)

    if (!parsed.recipes || parsed.recipes.length === 0) {
      return NextResponse.json(
        { recipes: [], relaxSuggestion: 'Try increasing time or changing cuisine preference' },
        { status: 200 }
      )
    }

    return NextResponse.json({ recipes: parsed.recipes })
  } catch (error) {
    console.error('Recipe generation error:', error)
    return NextResponse.json({ recipes: [], error: 'Could not generate recipes' }, { status: 500 })
  }
}
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add recipe generation API route with Groq LLM and structured prompting"
```

---

### Task 10: Recipes page — 3 recipe cards

**Files:**
- Create: `src/app/recipes/page.tsx`
- Create: `src/components/RecipeCard.tsx`
- Create: `src/lib/db/favourites.ts`
- Create: `src/lib/db/history.ts`

**Step 1: Create favourites DB helpers**

```typescript
// src/lib/db/favourites.ts
import { supabase } from '@/lib/supabase'
import { Recipe } from '@/lib/types'

export async function getFavourites() {
  const { data, error } = await supabase.from('favourites').select('*').order('saved_at', { ascending: false })
  if (error) throw error
  return data
}

export async function addFavourite(recipe_name: string, recipe_data: Recipe) {
  const { error } = await supabase.from('favourites').insert({ recipe_name, recipe_data })
  if (error) throw error
}

export async function removeFavourite(id: string) {
  const { error } = await supabase.from('favourites').delete().eq('id', id)
  if (error) throw error
}

export async function isFavourite(recipe_name: string): Promise<boolean> {
  const { data } = await supabase.from('favourites').select('id').eq('recipe_name', recipe_name).single()
  return !!data
}
```

**Step 2: Create meal history DB helpers**

```typescript
// src/lib/db/history.ts
import { supabase } from '@/lib/supabase'
import { MealHistory, Recipe, SessionPreferences } from '@/lib/types'

export async function getRecentHistory(limit = 14): Promise<MealHistory[]> {
  const { data, error } = await supabase
    .from('meal_history')
    .select('*')
    .order('cooked_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

export async function logMeal(recipe: Recipe, prefs: SessionPreferences): Promise<void> {
  const { error } = await supabase.from('meal_history').insert({
    recipe_name: recipe.name,
    cuisine: recipe.cuisine,
    ingredients_used: recipe.ingredients.map(i => i.name),
    estimated_protein: recipe.estimated_protein,
    estimated_carbs: recipe.estimated_carbs,
    estimated_fat: recipe.estimated_fat,
    health_goal: prefs.health_goal,
    health_note: prefs.health_note ?? null,
    recipe_data: recipe,
  })
  if (error) throw error
}
```

**Step 3: Create RecipeCard component**

```typescript
// src/components/RecipeCard.tsx
'use client'
import { Recipe } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Heart, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { addFavourite, removeFavourite } from '@/lib/db/favourites'

interface Props {
  recipe: Recipe
  onSelect: (recipe: Recipe) => void
  isFav?: boolean
}

export default function RecipeCard({ recipe, onSelect, isFav = false }: Props) {
  const [fav, setFav] = useState(isFav)

  async function toggleFav(e: React.MouseEvent) {
    e.stopPropagation()
    if (fav) {
      // We don't have the ID here, handled by name match in full page
      setFav(false)
    } else {
      await addFavourite(recipe.name, recipe)
      setFav(true)
    }
  }

  return (
    <Card
      onClick={() => onSelect(recipe)}
      className="cursor-pointer hover:border-primary transition-colors active:scale-[0.98]"
    >
      <CardContent className="pt-5 pb-5">
        <div className="flex justify-between items-start">
          <div className="flex-1 pr-2">
            <h3 className="font-semibold text-base leading-snug">{recipe.name}</h3>
            <p className="text-muted-foreground text-sm mt-1">{recipe.description}</p>
          </div>
          <button onClick={toggleFav} className="mt-0.5 text-muted-foreground hover:text-red-500 transition-colors">
            <Heart size={18} fill={fav ? 'currentColor' : 'none'} className={fav ? 'text-red-500' : ''} />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock size={12} /> {recipe.total_time_mins} min
          </Badge>
          <Badge variant="secondary">{recipe.difficulty}</Badge>
          <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950">
            {recipe.health_highlight}
          </Badge>
        </div>

        {recipe.needs_marination && (
          <div className="flex items-center gap-1.5 mt-3 text-amber-600 text-xs">
            <AlertCircle size={12} />
            Needs {recipe.marination_time_mins} min marination (plan ahead)
          </div>
        )}

        <div className="flex gap-3 mt-3 text-xs text-muted-foreground">
          <span>Prep: {recipe.prep_time_mins}m</span>
          <span>Cook: {recipe.cook_time_mins}m</span>
          <span>~{recipe.estimated_protein}g protein</span>
        </div>
      </CardContent>
    </Card>
  )
}
```

**Step 4: Create recipes page**

```typescript
// src/app/recipes/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Recipe, SessionPreferences } from '@/lib/types'
import { getStaples } from '@/lib/db/staples'
import { getUtensils } from '@/lib/db/utensils'
import { getRecentHistory } from '@/lib/db/history'
import RecipeCard from '@/components/RecipeCard'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { RefreshCw } from 'lucide-react'

export default function RecipesPage() {
  const router = useRouter()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [relaxSuggestion, setRelaxSuggestion] = useState('')

  async function fetchRecipes() {
    setLoading(true)
    setError('')
    setRelaxSuggestion('')
    try {
      const prefsRaw = localStorage.getItem('rasoi_current_session')
      if (!prefsRaw) { router.push('/'); return }
      const prefs: SessionPreferences = JSON.parse(prefsRaw)

      const [staples, utensils, recentHistory] = await Promise.all([
        getStaples(),
        getUtensils(),
        getRecentHistory(14),
      ])

      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prefs, staples, utensils, recentHistory }),
      })
      const data = await res.json()

      if (data.recipes?.length > 0) {
        setRecipes(data.recipes)
      } else {
        setError('No recipes matched your constraints.')
        setRelaxSuggestion(data.relaxSuggestion ?? '')
      }
    } catch (e) {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRecipes() }, [])

  function handleSelectRecipe(recipe: Recipe) {
    localStorage.setItem('rasoi_selected_recipe', JSON.stringify(recipe))
    router.push(`/recipe/${encodeURIComponent(recipe.name)}`)
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your recipes</h1>
        <Button variant="ghost" size="icon" onClick={fetchRecipes} disabled={loading}>
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </Button>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-36 w-full rounded-xl" />)}
        </div>
      )}

      {!loading && error && (
        <div className="text-center py-12 space-y-3">
          <p className="text-muted-foreground">{error}</p>
          {relaxSuggestion && <p className="text-sm text-muted-foreground">{relaxSuggestion}</p>}
          <Button onClick={() => router.push('/')}>Adjust preferences</Button>
        </div>
      )}

      {!loading && recipes.length > 0 && (
        <>
          <div className="space-y-3">
            {recipes.map((recipe, i) => (
              <RecipeCard key={i} recipe={recipe} onSelect={handleSelectRecipe} />
            ))}
          </div>
          <Button variant="outline" onClick={fetchRecipes} className="w-full">
            Show 3 different options
          </Button>
        </>
      )}
    </div>
  )
}
```

**Step 5: Test manually**

Go through home → set preferences → tap Find recipes — should see loading skeletons then 3 recipe cards.

**Step 6: Commit**

```bash
git add .
git commit -m "feat: add recipes page with Groq-powered recipe cards and favouriting"
```

---

### Task 11: Full recipe detail page

**Files:**
- Create: `src/app/recipe/[name]/page.tsx`

**Step 1: Create recipe detail page**

```typescript
// src/app/recipe/[name]/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Recipe, SessionPreferences } from '@/lib/types'
import { logMeal } from '@/lib/db/history'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Clock, ChefHat, Info } from 'lucide-react'

export default function RecipeDetailPage() {
  const router = useRouter()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [logging, setLogging] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem('rasoi_selected_recipe')
    if (raw) setRecipe(JSON.parse(raw))
  }, [])

  async function handleStartCooking() {
    if (!recipe) return
    setLogging(true)
    const prefsRaw = localStorage.getItem('rasoi_current_session')
    const prefs: SessionPreferences = prefsRaw ? JSON.parse(prefsRaw) : {}
    await logMeal(recipe, prefs)
    router.push(`/recipe/${encodeURIComponent(recipe.name)}/cook`)
  }

  if (!recipe) return <div className="p-6 text-muted-foreground">Loading...</div>

  return (
    <div className="p-4 pb-8 space-y-6">
      <button onClick={() => router.back()} className="text-sm text-muted-foreground hover:text-foreground">
        ← Back
      </button>

      <div>
        <h1 className="text-2xl font-bold">{recipe.name}</h1>
        <p className="text-muted-foreground mt-1">{recipe.description}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock size={12} /> {recipe.total_time_mins} min total
          </Badge>
          <Badge variant="secondary">Prep: {recipe.prep_time_mins}m</Badge>
          <Badge variant="secondary">Cook: {recipe.cook_time_mins}m</Badge>
          <Badge variant="secondary">{recipe.difficulty}</Badge>
          <Badge variant="secondary">Serves {recipe.servings}</Badge>
        </div>
      </div>

      {/* Nutrition */}
      <div className="bg-emerald-50 dark:bg-emerald-950 rounded-xl p-4">
        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
          <Info size={12} /> Estimated nutrition per serving (AI estimate, not clinical)
        </p>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { label: 'Protein', value: `${recipe.estimated_protein}g` },
            { label: 'Carbs', value: `${recipe.estimated_carbs}g` },
            { label: 'Fat', value: `${recipe.estimated_fat}g` },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="font-semibold text-lg">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Ingredients */}
      <div>
        <h2 className="font-semibold mb-3">Ingredients</h2>
        <div className="space-y-2">
          {recipe.ingredients.map((ing, i) => (
            <div key={i} className="flex justify-between items-center text-sm">
              <span className={ing.is_staple ? 'text-muted-foreground' : 'font-medium'}>
                {ing.name}
              </span>
              <span className="text-muted-foreground">{ing.amount}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">Normal text = fresh · Muted = staple</p>
      </div>

      {/* Substitutions */}
      {recipe.substitutions.length > 0 && (
        <div>
          <h2 className="font-semibold mb-2">Substitutions</h2>
          <div className="space-y-1">
            {recipe.substitutions.map((s, i) => (
              <p key={i} className="text-sm text-muted-foreground">
                No <span className="font-medium text-foreground">{s.original}</span>? Use <span className="font-medium text-foreground">{s.substitute}</span>
              </p>
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* Steps preview */}
      <div>
        <h2 className="font-semibold mb-3">Steps overview</h2>
        <ol className="space-y-2">
          {recipe.steps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="text-muted-foreground font-mono w-5 shrink-0">{i + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <Button onClick={handleStartCooking} disabled={logging} size="lg" className="w-full">
        <ChefHat className="mr-2" size={20} />
        {logging ? 'Starting...' : "Let's cook"}
      </Button>
    </div>
  )
}
```

**Step 2: Test manually**

Click a recipe card → should see full detail with nutrition, ingredients, steps → tap "Let's cook."

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add recipe detail page with nutrition, ingredients, and steps"
```

---

### Task 12: Cooking mode

**Files:**
- Create: `src/app/recipe/[name]/cook/page.tsx`

**Step 1: Create cooking mode page**

```typescript
// src/app/recipe/[name]/cook/page.tsx
'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Recipe } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ChevronLeft } from 'lucide-react'

export default function CookingModePage() {
  const router = useRouter()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [step, setStep] = useState(0)

  useEffect(() => {
    // Cache recipe for offline use
    const raw = localStorage.getItem('rasoi_selected_recipe')
    if (raw) {
      const r: Recipe = JSON.parse(raw)
      setRecipe(r)
      // Cache for offline
      localStorage.setItem('rasoi_cooking_cache', raw)
    } else {
      // Try offline cache
      const cached = localStorage.getItem('rasoi_cooking_cache')
      if (cached) setRecipe(JSON.parse(cached))
    }

    // Keep screen on via Wake Lock API
    let wakeLock: WakeLockSentinel | null = null
    navigator.wakeLock?.request('screen').then(lock => { wakeLock = lock })
    return () => { wakeLock?.release() }
  }, [])

  const advance = useCallback(() => {
    if (!recipe) return
    if (step < recipe.steps.length - 1) {
      setStep(s => s + 1)
    }
  }, [recipe, step])

  if (!recipe) return <div className="p-6 text-muted-foreground">Loading...</div>

  const isLast = step === recipe.steps.length - 1
  const progress = ((step + 1) / recipe.steps.length) * 100

  return (
    <div
      className="min-h-screen bg-background flex flex-col p-6"
      onClick={advance}
    >
      {/* Progress bar */}
      <div className="h-1 bg-muted rounded-full mb-8">
        <div
          className="h-1 bg-primary rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step counter */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={e => { e.stopPropagation(); step > 0 ? setStep(s => s - 1) : router.back() }}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft size={18} /> {step > 0 ? 'Back' : 'Exit'}
        </button>
        <span className="text-sm text-muted-foreground">
          Step {step + 1} of {recipe.steps.length}
        </span>
      </div>

      {/* Recipe name */}
      <p className="text-sm text-muted-foreground mb-2">{recipe.name}</p>

      {/* Current step */}
      <div className="flex-1 flex items-center">
        <p className="text-2xl font-medium leading-relaxed">
          {recipe.steps[step]}
        </p>
      </div>

      {/* Tips */}
      {recipe.tips[step] && (
        <div className="bg-amber-50 dark:bg-amber-950 rounded-xl p-4 mb-6">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Tip: {recipe.tips[step]}
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="space-y-3">
        {isLast ? (
          <Button
            onClick={e => { e.stopPropagation(); router.push('/') }}
            size="lg"
            className="w-full"
          >
            <CheckCircle2 className="mr-2" size={20} />
            Done! Back to home
          </Button>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            Tap anywhere to go to next step
          </p>
        )}
      </div>
    </div>
  )
}
```

**Step 2: Test manually**

Go through full flow: home → recipes → recipe detail → Let's cook → should enter full-screen cooking mode with large text, tap to advance.

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add full-screen cooking mode with wake lock and offline caching"
```

---

## Phase 4: Intelligence Layer

### Task 13: History & weekly nutrition dashboard

**Files:**
- Create: `src/app/history/page.tsx`

**Step 1: Create history page**

```typescript
// src/app/history/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { getRecentHistory } from '@/lib/db/history'
import { MealHistory } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

function WeeklyStats({ meals }: { meals: MealHistory[] }) {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thisWeek = meals.filter(m => new Date(m.cooked_at) >= weekAgo)

  const totalProtein = thisWeek.reduce((sum, m) => sum + (m.estimated_protein ?? 0), 0)
  const totalCarbs = thisWeek.reduce((sum, m) => sum + (m.estimated_carbs ?? 0), 0)
  const totalFat = thisWeek.reduce((sum, m) => sum + (m.estimated_fat ?? 0), 0)

  const allIngredients = thisWeek.flatMap(m => m.ingredients_used)
  const mostUsed = Object.entries(
    allIngredients.reduce<Record<string, number>>((acc, ing) => {
      acc[ing] = (acc[ing] ?? 0) + 1; return acc
    }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name]) => name)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">This week</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { label: 'Protein', value: `~${Math.round(totalProtein)}g` },
            { label: 'Carbs', value: `~${Math.round(totalCarbs)}g` },
            { label: 'Fat', value: `~${Math.round(totalFat)}g` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-muted rounded-xl p-3">
              <div className="font-semibold">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-2">{thisWeek.length} meals cooked</p>
          {mostUsed.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Most used this week:</p>
              <div className="flex flex-wrap gap-1">
                {mostUsed.map(ing => (
                  <Badge key={ing} variant="secondary" className="text-xs">{ing}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground italic">
          Nutrition figures are AI estimates — not clinical data
        </p>
      </CardContent>
    </Card>
  )
}

export default function HistoryPage() {
  const [meals, setMeals] = useState<MealHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getRecentHistory(30).then(setMeals).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-6 text-muted-foreground">Loading history...</div>

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">History</h1>

      {meals.length === 0 ? (
        <p className="text-muted-foreground">No meals logged yet. Start cooking!</p>
      ) : (
        <>
          <WeeklyStats meals={meals} />
          <Separator />
          <div className="space-y-3">
            {meals.map(meal => (
              <div key={meal.id} className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-sm">{meal.recipe_name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(meal.cooked_at).toLocaleDateString('en-GB', {
                      weekday: 'short', day: 'numeric', month: 'short'
                    })}
                    {meal.health_goal && ` · ${meal.health_goal}`}
                  </p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  {meal.estimated_protein && `~${meal.estimated_protein}g protein`}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
```

**Step 2: Test manually**

Cook a couple recipes through the full flow, then check /history — should show meal log and weekly stats.

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add meal history page with weekly nutrition summary"
```

---

## Phase 5: Polish & Deployment

### Task 14: Dark mode

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `tailwind.config.ts`

**Step 1: Enable dark mode in Tailwind**

In `tailwind.config.ts`, ensure `darkMode: 'class'` is set (shadcn/ui sets this by default).

**Step 2: Add dark mode toggle to settings page**

```typescript
// Add to src/app/settings/page.tsx — import and add toggle:
import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

// Inside component:
const [dark, setDark] = useState(false)

useEffect(() => {
  const saved = localStorage.getItem('rasoi_theme')
  if (saved === 'dark') { document.documentElement.classList.add('dark'); setDark(true) }
}, [])

function toggleDark() {
  const next = !dark
  setDark(next)
  document.documentElement.classList.toggle('dark', next)
  localStorage.setItem('rasoi_theme', next ? 'dark' : 'light')
}

// In JSX, add after utensil card:
<Card>
  <CardContent className="pt-6">
    <div className="flex items-center justify-between">
      <Label>Dark mode</Label>
      <Switch checked={dark} onCheckedChange={toggleDark} />
    </div>
  </CardContent>
</Card>
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add dark mode toggle in settings"
```

---

### Task 15: Deploy to Vercel

**Step 1: Create GitHub repository**

```bash
cd "/Users/arunperi/Documents/new project"
git remote add origin <your-github-repo-url>
git push -u origin main
```

**Step 2: Deploy on Vercel**

1. Go to vercel.com → New Project → import your GitHub repo
2. Add environment variables:
   - `GROQ_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy

**Step 3: Test production build locally first**

```bash
npm run build
npm run start
```

Expected: No build errors. All pages load.

**Step 4: Final commit**

```bash
git add .
git commit -m "feat: production-ready Rasoi app"
```

---

## Summary

| Phase | Tasks | Key deliverable |
|-------|-------|----------------|
| Foundation | 1–3 | Next.js project, Supabase schema, layout |
| Pantry & Settings | 4–7 | Utensil profile, onboarding, pantry, camera scan |
| Core Recipe Flow | 8–12 | Session setup, recipe generation, cards, detail, cooking mode |
| Intelligence | 13 | History, weekly nutrition dashboard |
| Polish | 14–15 | Dark mode, Vercel deployment |

**Groq models used:**
- Recipe generation: `llama-3.3-70b-versatile`
- Camera recognition: `meta-llama/llama-4-scout-17b-16e-instruct` (vision)
