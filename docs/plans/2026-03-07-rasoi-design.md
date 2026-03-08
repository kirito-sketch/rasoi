# Rasoi — Design Document
**Date:** 2026-03-07
**Type:** Personal portfolio project (experiments / things I build for fun)
**Owner:** Arun Peri (UX Designer)

---

## Overview

Rasoi is a personal AI-powered cooking companion built for real daily use. It takes into account your pantry, available fresh ingredients, utensil constraints, time available, health goals, and how you're feeling — and generates healthy recipes tailored to your exact situation across any cuisine. It also tracks your meal history and nutrition over time to make progressively smarter suggestions.

The primary use case: a working professional who wants to eat healthy (high protein, balanced), cooks across cuisines (South Indian, Italian, and more), has a gas stove and limited utensils, and needs recipes that fit around real time constraints. Ingredients drive suggestions — cuisine is a soft mood filter, not a hard constraint.

---

## Core User Flow

1. Open app — defaults to last session's preferences
2. Check pantry — toggle out any staples that are empty, add today's fresh ingredients (type or camera scan)
3. Optionally add a health note (body heat, stomach issue, cold, custom)
4. Set session preferences — time available, health goal, cuisine, servings
5. Generate recipes — get 3 options
6. Pick one — enter cooking mode with full step-by-step instructions
7. Meal is logged automatically to history

---

## Features

### Pantry Management
- **Permanent staples** — set once, always available unless toggled "out"
- **Fresh ingredients** — added per session, cleared after
- **Ingredient quantities** — simple scale: a little / enough / plenty
- **Camera scan** — point at ingredients, Groq vision identifies and bulk-adds them
- **Toggle out** — mark a staple as empty without deleting it; one tap to restock
- **Leftovers** — mark leftovers from previous meals as available ingredients

**Staple categories:**
- Grains & Lentils (rice, toor dal, chana dal, poha, rava, etc.)
- Pasta & Dry Goods (spaghetti, penne, breadcrumbs, etc.)
- Spices & Tempering (mustard seeds, curry leaves, turmeric, cumin, oregano, basil, etc.)
- Oils & Condiments (coconut oil, olive oil, sesame oil, tamarind, canned tomatoes, etc.)
- Fridge (eggs, curd/yogurt, milk, parmesan, butter, etc.)

### Onboarding (first launch only — split into 4 steps, camera is skippable)
1. Cuisine questionnaire (multi-select: Indian / Italian / Mediterranean / Asian / Mexican / Other) → pre-populates starter pantry from union of selected cuisines
2. Review + deselect starter pantry items
3. Camera scan → fill gaps (skippable, can do later)
4. Utensil profile setup

### Utensil Profile (set once, editable)
- Gas stove
- Pressure cooker
- Kadai / wok
- Tawa
- Blender / mixie
- Oven (off by default)
- Microwave (off by default)
- Temporary unlock per session ("borrowed a utensil today")

### Session Setup
- Time available: 15 / 30 / 45 / 60+ mins (includes both prep and cook time)
- Health goal: High protein / Balanced / Low oil / Low carb / Flexible
- Servings: 1 / 2 / 3+
- Cuisine mood (optional, collapsed, defaults to "Anything"): Indian / Italian / Mediterranean / Asian / Mexican / Surprise me
- Health note (optional override): Body heat / Stomach issue / Cold or fever / Low energy / Custom

**Design decision:** Cuisine is not a primary selector. Ingredients drive what gets suggested. Cuisine is a soft filter — "if I'm in the mood for Italian tonight" — and defaults to open/anything so the best available recipe wins regardless of origin.

### Recipe Generation
All of the following is passed to Groq LLM in a structured prompt:
- Available ingredients (staples in stock + fresh today + leftovers)
- Prep time + cook time constraints (separate)
- Marination flag (recipes needing marination are flagged upfront)
- Health goal
- Cuisine preference
- Servings
- Utensil profile
- Health note (if any)
- Recent meal history (for variety and nutrition gap filling)
- Substitution instructions (Groq knows common substitutes across Indian, Italian, and other cuisines)

Returns **3 recipe options** in strict JSON schema (for consistent parsing).

**Fallback:** If constraints are too tight for a match, app prompts "Relax one constraint?" with specific suggestions rather than showing a blank screen.

### Recipe Display
**Card view (3 options):**
- Name + one-line description
- Health highlight (e.g. "High protein · ~28g per serving")
- Total time (prep + cook, separated)
- Marination warning if applicable
- Difficulty: Easy / Medium
- Favourite (heart icon)

**Full recipe view:**
- Ingredients list — staples in one style, fresh ingredients highlighted
- Step-by-step instructions (cuisine-aware — tadka sequence for Indian, pasta technique for Italian, etc.)
- Substitution tips inline
- Estimated nutrition (protein, carbs, fat — clearly labeled as AI estimates)
- Regenerate options: "Show 3 more" / "Make it faster" / "Swap an ingredient"

### Cooking Mode
- Activated when you start a recipe
- Full-screen, one step at a time
- Large text, minimal UI
- Tap anywhere to advance to next step
- Screen stays on
- Recipe cached locally at start — works offline mid-cook

### Health & History Tracking
- Every completed meal is auto-logged: date, recipe, estimated nutrition
- Weekly nutrition running totals
- Smart suggestions informed by history:
  - "You've had eggs 3 times this week — want something different?"
  - "Your protein has been low the last 2 days — prioritising high-protein options"
  - "No vegetable-heavy meal since Monday"
- Weekly summary dashboard: nutrition balance, variety, streaks
- Nutrition estimates are AI-generated — clearly labeled, not clinical data

### Health Note System
- Default is always "feeling good" — no daily prompt
- Tap to add a note only when needed
- Options: Body heat ("vedi chesindi") → cooling foods, less spice, coconut-based / Stomach issue → light, easy to digest / Cold or fever → rasam, pepper, warm dishes / Low energy → iron-rich, energising / Custom → type anything
- Multi-day mode: set a condition for multiple days, it persists until you clear it

---

## Data Model (Supabase / PostgreSQL)

### `staples`
| field | type | notes |
|-------|------|-------|
| id | uuid | |
| name | text | |
| category | text | Grains, Spices, Oils, Fridge |
| in_stock | boolean | toggled per session |
| type | text | staple / fresh / leftover |
| quantity_level | text | a little / enough / plenty |

### `utensils`
| field | type | notes |
|-------|------|-------|
| id | uuid | |
| name | text | |
| available | boolean | permanent setting |
| temp_unlock | boolean | per session override |

### `meal_history`
| field | type | notes |
|-------|------|-------|
| id | uuid | |
| date | timestamp | |
| recipe_name | text | |
| cuisine | text | |
| ingredients_used | text[] | |
| estimated_protein | float | grams |
| estimated_carbs | float | grams |
| estimated_fat | float | grams |
| health_goal | text | |
| health_note | text | if any |

### `favourites`
| field | type | notes |
|-------|------|-------|
| id | uuid | |
| recipe_name | text | |
| recipe_data | jsonb | full recipe JSON |
| saved_at | timestamp | |

---

## Pages / Routes

| Route | Purpose |
|-------|---------|
| `/` | Session setup — time, health goal, cuisine, servings, health note |
| `/pantry` | Manage staples, toggle stock, camera scan, add fresh ingredients |
| `/recipes` | 3 generated recipe cards |
| `/recipe/[id]` | Full recipe detail + cooking mode |
| `/history` | Meal history + weekly nutrition summary |
| `/settings` | Utensil profile, pantry management, app preferences |

---

## Tech Stack

| Layer | Tool |
|-------|------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| AI — Recipe generation | Groq LLM (llama-3.1-70b or equivalent) |
| AI — Camera recognition | Groq Vision (llama-3.2-11b-vision) |
| Database | Supabase (PostgreSQL) |
| Deployment | Vercel |
| PWA | next-pwa (installable on home screen) |

---

## Technical Decisions

- **Groq API key lives server-side only** — Next.js API routes, never exposed to browser
- **Strict JSON schema from Groq** — prompt enforces structured output for consistent parsing
- **Streaming responses** — Groq streaming API for recipe generation so text appears word by word
- **Camera flow** — capture-and-analyze (not live), image compressed before sending to Groq vision
- **Offline recipe caching** — full recipe cached to localStorage when opened, survives lost signal mid-cook
- **Supabase Row Level Security** — single-user app, secured without auth via RLS policies
- **Dark mode** — Tailwind dark mode, important for kitchen use
- **PWA** — installable on phone home screen for daily-use feel
- **Nutrition disclaimer** — all nutrition figures labeled as AI estimates throughout the UI

---

## Edge Cases

| Scenario | Solution |
|----------|----------|
| Staple runs out | Toggle "out" — one tap, preserved for restock |
| New permanent ingredient | Add to pantry from any screen |
| Borrowed a utensil today | Temporary unlock in session setup |
| Camera misidentifies ingredient | Manual edit before confirming |
| No recipes match constraints | "Relax one constraint?" prompt with suggestions |
| Recipe needs marination | Flagged upfront on recipe card before you commit |
| Lost WiFi while cooking | Recipe cached locally when opened |
| Cooked too much | Mark leftovers — available as ingredients next session |
| Health condition for multiple days | Multi-day mode — persists until cleared |
| Groq returns inconsistent data | Strict JSON schema in prompt + validation layer |

---

## What This Is Not

- Not a calorie counter or medical nutrition tool
- Not a social app — purely personal
- Not a meal planner (week ahead) — session by session
- Not a grocery list generator (out of scope for v1)
