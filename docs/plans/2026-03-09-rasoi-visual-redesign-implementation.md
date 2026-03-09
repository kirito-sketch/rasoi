# Rasoi Visual Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform Rasoi from generic shadcn defaults into a warm editorial "Julia Child meets Ratatouille" visual identity — cream backgrounds, terracotta accent, Lora serif headings, and recipe cards with torn edges and corner folds.

**Architecture:** Pure CSS/className changes — no functional logic touched. Update CSS custom properties in globals.css, add Lora font, re-skin existing components with new Tailwind classes and two new reusable UI components (TornEdge SVG, GrainFilter SVG).

**Tech Stack:** Tailwind CSS v4 (arbitrary values), Next.js App Router, Google Fonts (Lora), inline SVG for torn edge and grain filter.

---

## Task 1: Color system + Lora font foundation

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

**Step 1: Add Lora font import to layout.tsx**

In `src/app/layout.tsx`, add the Lora font alongside the existing Geist import:

```tsx
import { Geist, Lora } from 'next/font/google'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
})

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  style: ['normal', 'italic'],
})
```

Update the `<html>` tag to include both variables:
```tsx
<html lang="en" className={`${geist.variable} ${lora.variable}`} suppressHydrationWarning>
```

**Step 2: Update CSS custom properties in globals.css**

Replace the existing `:root` and `.dark` color blocks with the warm editorial palette. Find the current CSS variable block and replace:

```css
:root {
  --background: #FDF8F0;
  --foreground: #2C1810;
  --card: #FAF3E4;
  --card-foreground: #2C1810;
  --popover: #FAF3E4;
  --popover-foreground: #2C1810;
  --primary: #C4621A;
  --primary-foreground: #FDF8F0;
  --secondary: #F0E6D3;
  --secondary-foreground: #2C1810;
  --muted: #F0E6D3;
  --muted-foreground: #8B7355;
  --accent: #F0E6D3;
  --accent-foreground: #2C1810;
  --destructive: oklch(0.58 0.22 27);
  --destructive-foreground: oklch(0.985 0 0);
  --border: #E8D5B7;
  --input: #E8D5B7;
  --ring: #C4621A;
  --radius: 0.75rem;
}

.dark {
  --background: #1C1008;
  --foreground: #F5EDD8;
  --card: #2A1A0E;
  --card-foreground: #F5EDD8;
  --popover: #2A1A0E;
  --popover-foreground: #F5EDD8;
  --primary: #E07830;
  --primary-foreground: #1C1008;
  --secondary: #3D2410;
  --secondary-foreground: #F5EDD8;
  --muted: #3D2410;
  --muted-foreground: #A8865C;
  --accent: #3D2410;
  --accent-foreground: #F5EDD8;
  --destructive: oklch(0.58 0.22 27);
  --destructive-foreground: oklch(0.985 0 0);
  --border: #4A2E18;
  --input: #4A2E18;
  --ring: #E07830;
}
```

**Step 3: Add font utility classes to globals.css**

Add after the variable block:
```css
.font-lora {
  font-family: var(--font-lora), Georgia, serif;
}
```

**Step 4: Add GrainFilter SVG to layout.tsx**

Inside the `<body>` tag, before `{children}`, add a hidden SVG that defines the grain filter once for the whole app:

```tsx
{/* SVG grain filter - referenced by recipe cards */}
<svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
  <defs>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
      <feBlend in="SourceGraphic" mode="multiply" result="blend" />
      <feComposite in="blend" in2="SourceGraphic" operator="in" />
    </filter>
  </defs>
</svg>
```

**Step 5: Run build to verify no errors**
```bash
cd "/Users/arunperi/Documents/new project" && npm run build
```
Expected: clean build, Lora font loaded.

**Step 6: Commit**
```bash
git add src/app/globals.css src/app/layout.tsx
git commit -m "feat(design): warm editorial color system + Lora font foundation"
```

---

## Task 2: TornEdge component + RecipeCard vintage redesign

**Files:**
- Create: `src/components/ui/TornEdge.tsx`
- Modify: `src/components/RecipeCard.tsx`

**Step 1: Create TornEdge component**

Create `src/components/ui/TornEdge.tsx`:

```tsx
interface Props {
  fill?: string
  className?: string
}

export function TornEdge({ fill = '#F5EDD8', className = '' }: Props) {
  return (
    <svg
      viewBox="0 0 400 24"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full block ${className}`}
      style={{ marginTop: '-1px', display: 'block' }}
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <path
        d="M0,8 L8,2 L16,10 L24,4 L34,14 L42,6 L52,12 L60,3 L70,11 L80,5 L88,13 L98,7 L106,15 L116,8 L124,2 L134,10 L142,5 L152,13 L160,7 L170,14 L178,4 L188,11 L196,6 L206,14 L214,8 L224,3 L232,11 L242,6 L250,13 L260,7 L268,15 L278,8 L286,3 L296,11 L304,5 L314,13 L322,7 L332,14 L340,4 L350,12 L358,6 L368,14 L376,8 L384,13 L392,5 L400,10 L400,24 L0,24 Z"
        fill={fill}
      />
    </svg>
  )
}
```

**Step 2: Read the current RecipeCard**

Read `src/components/RecipeCard.tsx` in full before modifying.

**Step 3: Rewrite RecipeCard with vintage styling**

Replace the full contents of `src/components/RecipeCard.tsx`:

```tsx
'use client'

import Link from 'next/link'
import { Heart, Clock } from 'lucide-react'
import { TornEdge } from '@/components/ui/TornEdge'
import type { Recipe } from '@/lib/types'

interface Props {
  recipe: Recipe
  isFavourite: boolean
  onToggleFavourite: (recipe: Recipe) => void
  onSelect?: (recipe: Recipe) => void
}

export function RecipeCard({ recipe, isFavourite, onToggleFavourite, onSelect }: Props) {
  const encodedName = encodeURIComponent(recipe.name)
  const timeLabel = recipe.total_time_mins ?? recipe.prep_time_mins ?? '?'
  const cuisine = recipe.cuisine ?? ''
  const difficulty = recipe.difficulty ?? ''

  return (
    <div
      className="relative overflow-visible"
      style={{ filter: 'url(#grain)' }}
    >
      {/* Corner fold — top right dog-ear */}
      <div
        className="absolute top-0 right-0 z-10 w-0 h-0 pointer-events-none"
        style={{
          borderStyle: 'solid',
          borderWidth: '28px 28px 0 0',
          borderColor: '#E8D5B7 transparent transparent transparent',
          filter: 'drop-shadow(-2px 2px 3px rgba(44,24,16,0.18))',
        }}
        aria-hidden="true"
      />

      {/* Card body */}
      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          backgroundColor: '#F5EDD8',
          border: '1px solid #E8D5B7',
          boxShadow: '2px 4px 16px rgba(196,98,26,0.12)',
          transition: 'transform 200ms ease, box-shadow 200ms ease',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget
          el.style.transform = 'translateY(-2px)'
          el.style.boxShadow = '3px 6px 24px rgba(196,98,26,0.2)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget
          el.style.transform = 'translateY(0)'
          el.style.boxShadow = '2px 4px 16px rgba(196,98,26,0.12)'
        }}
      >
        {/* Favourite button */}
        <button
          onClick={e => {
            e.preventDefault()
            onToggleFavourite(recipe)
          }}
          className="absolute top-3 right-8 z-10 p-1.5 rounded-full transition-transform active:scale-90"
          aria-label={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
        >
          <Heart
            size={18}
            className={isFavourite ? 'fill-[#C4621A] text-[#C4621A]' : 'text-[#8B7355]'}
          />
        </button>

        {/* Card content */}
        <Link
          href={`/recipe/${encodedName}`}
          onClick={() => onSelect?.(recipe)}
          className="block p-5 pr-12 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C4621A] rounded-xl"
        >
          {/* Cuisine stamp */}
          {cuisine && (
            <p
              className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-2"
              style={{ color: '#C4621A' }}
            >
              {cuisine}
            </p>
          )}

          {/* Recipe name — Lora italic */}
          <h3
            className="font-lora italic text-xl leading-snug mb-2"
            style={{ color: '#2C1810' }}
          >
            {recipe.name}
          </h3>

          {/* Warm rule */}
          <div
            className="mb-3 h-px w-3/5"
            style={{ backgroundColor: 'rgba(196,98,26,0.3)' }}
          />

          {/* Description */}
          <p
            className="text-sm leading-relaxed line-clamp-2 mb-4"
            style={{ color: '#8B7355' }}
          >
            {recipe.description}
          </p>

          {/* Health highlight */}
          {recipe.health_highlight && (
            <p
              className="text-xs mb-3 italic"
              style={{ color: '#C4621A' }}
            >
              {recipe.health_highlight}
            </p>
          )}

          {/* Stats row — small caps, no badges */}
          <div
            className="flex items-center gap-3 text-xs"
            style={{ color: '#8B7355', fontVariant: 'small-caps', letterSpacing: '0.05em' }}
          >
            {timeLabel && (
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {timeLabel} min
              </span>
            )}
            {difficulty && <span>{difficulty}</span>}
            {recipe.servings && <span>{recipe.servings} servings</span>}
          </div>
        </Link>

        {/* Torn bottom edge */}
        <TornEdge fill="#F5EDD8" />
      </div>
    </div>
  )
}
```

**Step 4: Run build**
```bash
cd "/Users/arunperi/Documents/new project" && npm run build
```
Expected: clean build.

**Step 5: Commit**
```bash
git add src/components/ui/TornEdge.tsx src/components/RecipeCard.tsx
git commit -m "feat(design): vintage recipe cards with torn edge, corner fold, Lora italic"
```

---

## Task 3: Home screen warm redesign

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Read the current home page**

Read `src/app/page.tsx` in full.

**Step 2: Apply warm editorial styling**

Key changes — do NOT touch any logic, only classNames and structure:

1. Replace emoji `👨‍🍳` icon with nothing — let the Lora "Rasoi" wordmark speak for itself
2. "Rasoi" heading: add `font-lora` class
3. Subtitle: add `font-lora italic`
4. Add thin warm rule `<hr className="border-[#E8D5B7]" />` between each section (Time, Health, Cuisine)
5. Time pill buttons selected state: change from `bg-foreground text-background` to `bg-[#C4621A] text-[#FDF8F0]`
6. Unselected pill: change border from `border-border` to `border-[#E8D5B7]`, text from `text-muted-foreground` to `text-[#8B7355]`
7. Cuisine pills: same treatment as time pills
8. Health note label: `font-lora italic text-sm`
9. "Find Recipes" button: ensure it uses `bg-[#C4621A]` — if it uses the `primary` variant it will inherit from CSS vars automatically

The section labels ("How much time do you have?", "Any health notes?", "Cuisine mood") should have `font-lora italic` applied.

**Step 3: Run build**
```bash
cd "/Users/arunperi/Documents/new project" && npm run build
```

**Step 4: Commit**
```bash
git add src/app/page.tsx
git commit -m "feat(design): home screen warm editorial styling"
```

---

## Task 4: Bottom nav warm + terracotta active

**Files:**
- Modify: `src/components/BottomNav.tsx`

**Step 1: Read current BottomNav**

Read `src/components/BottomNav.tsx` in full.

**Step 2: Apply changes**

1. Nav background: change `bg-background/95` — this now inherits `#FDF8F0` from CSS vars, which is correct. No change needed here.
2. Active tab color: change `text-foreground` to `text-[#C4621A]`
3. Inactive tab color: change `text-muted-foreground` to `text-[#8B7355]`
4. Add active indicator dot above the active icon:

```tsx
{isActive && (
  <span
    className="absolute top-1 w-1 h-1 rounded-full"
    style={{ backgroundColor: '#C4621A' }}
  />
)}
```

The Link needs `relative` positioning for this to work. Change:
```tsx
className={`relative flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors ...`}
```

**Step 3: Run build**
```bash
cd "/Users/arunperi/Documents/new project" && npm run build
```

**Step 4: Commit**
```bash
git add src/components/BottomNav.tsx
git commit -m "feat(design): bottom nav terracotta active state with dot indicator"
```

---

## Task 5: Pantry page + StapleCard warm redesign

**Files:**
- Modify: `src/app/pantry/page.tsx`
- Modify: `src/components/StapleCard.tsx`
- Modify: `src/components/AddIngredientSheet.tsx`

**Step 1: Read all three files**

Read each file in full before modifying.

**Step 2: Pantry page changes**

1. Category headers: add `font-lora italic` class, change color to `text-[#2C1810]`
2. Tabs: the shadcn Tabs component inherits from CSS vars — primary color is now terracotta automatically. Verify tab trigger active state looks right. If not, add explicit `data-[state=active]:text-[#C4621A]` class.
3. Scan button: change to terracotta — `className="... border-[#C4621A] text-[#C4621A] hover:bg-[#C4621A]/10"`

**Step 3: StapleCard changes**

1. Card background: add `bg-[#FAF3E4]` (parchment)
2. Out-of-stock treatment: replace `opacity-40` with a CSS diagonal strikethrough on the name:
   ```tsx
   // Instead of opacity on the whole card, apply to inner text only:
   <button
     className={`text-sm font-medium text-left transition-colors truncate block w-full ${
       !optimisticStock ? 'line-through text-[#8B7355]' : 'hover:text-[#C4621A]'
     }`}
   >
   ```
   Remove the opacity class from the outer div entirely.
3. Quantity pill selected state: `bg-[#C4621A] text-[#FDF8F0] border-[#C4621A]`
4. Delete button hover: `hover:text-destructive` stays (red is fine for delete)

**Step 4: AddIngredientSheet changes**

1. SheetTitle: add `font-lora italic`
2. The "Add ingredient" button inherits terracotta from CSS vars (primary). No change needed.

**Step 5: Run build**
```bash
cd "/Users/arunperi/Documents/new project" && npm run build
```

**Step 6: Commit**
```bash
git add src/app/pantry/page.tsx src/components/StapleCard.tsx src/components/AddIngredientSheet.tsx
git commit -m "feat(design): pantry warm redesign — Lora headers, parchment cards, terracotta pills"
```

---

## Task 6: Cooking mode warm redesign

**Files:**
- Modify: `src/app/recipe/[name]/cook/page.tsx`

**Step 1: Read the current cook page**

Read `src/app/recipe/[name]/cook/page.tsx` in full.

**Step 2: Apply changes**

1. Header recipe name: add `font-lora italic`
2. Step label ("Step N"): change color to `text-[#C4621A]`
3. Step text: add `font-lora` class
4. Progress bar track: `bg-[#E8D5B7]` (warm tan)
5. Progress bar fill: `bg-[#C4621A]` (terracotta)
6. Step number circle (if rendered in header or elsewhere): `bg-[#C4621A] text-[#FDF8F0]`
7. Completion screen: wrap "Well done!" in Lora italic. Add a simple CSS border ornament above and below the heading:
   ```tsx
   <div className="text-center">
     <p className="text-[#C4621A] tracking-[0.3em] text-sm mb-2">— ✦ —</p>
     <h2 className="font-lora italic text-3xl text-[#2C1810]">Well done!</h2>
     <p className="text-[#C4621A] tracking-[0.3em] text-sm mt-2">— ✦ —</p>
   </div>
   ```
8. "I'm Done!" / "Next" buttons: primary variant inherits terracotta from CSS vars.

**Step 3: Run build**
```bash
cd "/Users/arunperi/Documents/new project" && npm run build
```

**Step 4: Commit**
```bash
git add "src/app/recipe/[name]/cook/page.tsx"
git commit -m "feat(design): cooking mode Lora serif, terracotta progress, warm completion screen"
```

---

## Task 7: Recipe detail page warm redesign

**Files:**
- Modify: `src/app/recipe/[name]/page.tsx`

**Step 1: Read the file**

Read `src/app/recipe/[name]/page.tsx` in full.

**Step 2: Apply changes**

1. Recipe name: add `font-lora italic`
2. Section headings (Ingredients, Steps, Substitutions, Nutrition, Tips): add `font-lora italic`
3. Step number circles: `bg-[#C4621A] text-[#FDF8F0]`
4. Ingredient rows with pantry check icon: `text-[#C4621A]` for the CheckCircle2 icon
5. Health highlight pill: `bg-[#C4621A]/10 text-[#C4621A]`
6. "Start Cooking" button: primary variant inherits terracotta
7. Back button hover: `hover:bg-[#F0E6D3]` (warm accent)
8. Badge components for cuisine/difficulty: if using shadcn Badge, they may still look gray. Replace with:
   ```tsx
   <span className="text-xs font-medium tracking-wide uppercase text-[#8B7355]">
     {recipe.cuisine}
   </span>
   ```

**Step 3: Run build**
```bash
cd "/Users/arunperi/Documents/new project" && npm run build
```

**Step 4: Commit**
```bash
git add "src/app/recipe/[name]/page.tsx"
git commit -m "feat(design): recipe detail warm Lora headings and terracotta accents"
```

---

## Task 8: History + Settings warm treatment

**Files:**
- Modify: `src/app/history/page.tsx`
- Modify: `src/app/settings/page.tsx`

**Step 1: Read both files**

**Step 2: History page changes**

1. "Favourites" and "Cooked recently" headings: add `font-lora italic`
2. Favourite cards: add `bg-[#FAF3E4]` and `border-[#E8D5B7]`
3. Favourite card recipe name: add `font-lora italic`
4. Meal log entries: add `bg-[#FAF3E4] border-[#E8D5B7]`
5. Date text color: `text-[#8B7355]`
6. Unfavourite heart: `fill-[#C4621A] text-[#C4621A]`

**Step 3: Settings page changes**

1. "Settings" heading: add `font-lora`
2. CardTitle for "Appearance" and "My Kitchen": add `font-lora italic`
3. Cards inherit parchment background from CSS vars (`--card: #FAF3E4`)
4. Switch component: inherits `--primary` for the checked state → terracotta automatically

**Step 4: Run build**
```bash
cd "/Users/arunperi/Documents/new project" && npm run build
```

**Step 5: Commit**
```bash
git add src/app/history/page.tsx src/app/settings/page.tsx
git commit -m "feat(design): history and settings warm parchment + Lora typography"
```

---

## Task 9: Onboarding warm treatment

**Files:**
- Modify: `src/app/onboarding/page.tsx`

**Step 1: Read the file**

**Step 2: Apply changes**

1. Progress dots: change from `w-2 h-2` to `w-3 h-3` (larger), active dot color to `bg-[#C4621A]`
2. Step title: add `font-lora`
3. Step subtitle: add `font-lora italic`
4. Cuisine pills selected state: `bg-[#C4621A] text-[#FDF8F0] border-[#C4621A]`
5. Pantry item pills selected state: same terracotta treatment
6. Deselected pantry items: replace `line-through opacity-50` with just `text-[#8B7355] line-through` (no opacity — more readable)
7. Category headers: add `font-lora italic`
8. Continue/Save buttons: primary variant inherits terracotta from CSS vars

**Step 3: Run build**
```bash
cd "/Users/arunperi/Documents/new project" && npm run build
```

**Step 4: Commit**
```bash
git add src/app/onboarding/page.tsx
git commit -m "feat(design): onboarding warm Lora headings, larger progress dots, terracotta pills"
```

---

## Task 10: Final polish + recipes page header

**Files:**
- Modify: `src/app/recipes/page.tsx`

**Step 1: Read the file**

**Step 2: Apply changes**

1. "Recipes for you" heading: add `font-lora italic`
2. Subtitle (time + cuisine): change color to `text-[#8B7355]`
3. Error state "Try again" button: primary variant → terracotta
4. Skeleton cards: update height to match new RecipeCard with torn edge (slightly taller — `h-56` instead of `h-44`)

**Step 3: Final full build**
```bash
cd "/Users/arunperi/Documents/new project" && npm run build
```
Expected: all 11 routes compile cleanly. Zero TypeScript errors.

**Step 4: Commit**
```bash
git add src/app/recipes/page.tsx
git commit -m "feat(design): recipes page Lora header + final visual polish"
```

---

## Definition of Done

- [ ] `npm run build` passes cleanly
- [ ] All pages use cream/parchment backgrounds (no pure white)
- [ ] All headings use Lora font
- [ ] All primary actions (buttons, active pills) use terracotta (#C4621A)
- [ ] Recipe cards have torn edge + corner fold + Lora italic name
- [ ] Bottom nav shows terracotta dot for active tab
- [ ] Dark mode still functions (warm dark palette)
- [ ] No functional logic changed — only classNames
