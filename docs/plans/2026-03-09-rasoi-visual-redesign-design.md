# Rasoi Visual Redesign — Design Document

**Date:** 2026-03-09
**Brief:** Warm editorial — Julia Child meets Ratatouille. Aged cookbook energy, not a generic app.

---

## Design Direction

The current app is functional but visually vanilla: no brand color, flat shadcn defaults, gray-on-white, no personality. This redesign gives Rasoi a warm, editorial identity — like a well-loved cookbook crossed with Gusteau's restaurant menu. Cream backgrounds, terracotta accent, Lora serif for headings, and recipe cards that feel like real index cards pulled from a wooden box.

---

## Color System

| Token | Value | Description |
|---|---|---|
| `--background` | `#FDF8F0` | Aged cream paper |
| `--card` | `#FAF3E4` | Parchment |
| `--recipe-card` | `#F5EDD8` | Darker parchment for recipe cards |
| `--foreground` | `#2C1810` | Espresso brown (not pure black) |
| `--primary` | `#C4621A` | Terracotta / warm amber |
| `--primary-foreground` | `#FDF8F0` | Cream on terracotta |
| `--muted` | `#F0E6D3` | Warm light tan |
| `--muted-foreground` | `#8B7355` | Warm mocha |
| `--border` | `#E8D5B7` | Warm tan |
| `--accent` | `#F0E6D3` | Same as muted |
| `--accent-foreground` | `#2C1810` | Espresso |

Dark mode: deepen all values proportionally — dark espresso backgrounds, cream foreground, terracotta accent stays warm.

---

## Typography

- **Lora** (Google Font, serif) — headings, recipe names, cooking step text, section labels
- **Geist Sans** (existing) — body text, labels, meta info, UI chrome
- Recipe card name: `font-lora italic` — like typed on an old index card
- Category headers in pantry/onboarding: `font-lora italic text-sm` — cookbook chapter feel
- Cooking step text: `font-lora text-2xl leading-relaxed` — readable from arm's length

---

## Recipe Cards — The Hero Element

Each card feels like a physical recipe index card from a wooden box.

### Visual anatomy

```
┌──────────────────────────────────┐╲  ← CSS corner fold, top-right dog-ear
│                                  │ ╲   (#E8D5B7, ~24×24px triangle)
│  ITALIAN                    ♥   │  │  ← cuisine: tiny uppercase, letter-spaced
│                                  │     terracotta color (#C4621A)
│  Spaghetti Aglio e Olio         │     ← recipe name: Lora italic, large
│  ─────────────────────           │     ← short warm rule (~60% width, terracotta/30)
│  A classic Roman pantry pasta…   │     ← description: Geist, mocha color, line-clamp-2
│                                  │
│  25 min · Easy · 2 servings     │     ← stats: small-caps Geist, no badges
│                                  │
╰──╮────╮──────╮────╮──────────╯      ← torn bottom edge: SVG mask, jagged organic
```

### Implementation details

**Corner fold (CSS triangle, top-right):**
- Absolutely positioned div, `w-0 h-0`
- CSS border trick: `border-t-[24px] border-r-[24px] border-t-[#E8D5B7] border-r-[#FAF3E4]`
- Subtle drop shadow underneath the fold

**Torn bottom edge (SVG):**
- `<TornEdge />` component — inline SVG with irregular path
- `fill` matches card background (`#F5EDD8`)
- Positioned at the bottom of the card, overlaps slightly

**Grain texture:**
- SVG `<feTurbulence>` filter defined once in layout, referenced via `filter: url(#grain)` on card
- 3–5% opacity — aged paper feel without being heavy

**Warm shadow:**
- `box-shadow: 2px 4px 16px rgba(196, 98, 26, 0.12)` — amber glow, not cold gray

**Hover:**
- `transform: translateY(-2px)` + shadow deepens
- `transition: all 200ms ease`

**No shadcn Badge components** — replace with plain small-caps text. More print-like.

**Heart icon:** terracotta when filled, mocha when empty.

---

## Screen-by-Screen Specs

### Home Screen
- "Rasoi" in Lora serif (`text-4xl font-lora font-bold`)
- Subtitle in Lora italic: *"What are we cooking today?"*
- Thin warm rule (`border-b border-[#E8D5B7]`) between each input section
- Time pills: terracotta selected (`bg-[#C4621A] text-[#FDF8F0]`), warm tan border unselected
- Cuisine pills: same warm treatment
- "Find Recipes" button: terracotta, cream text, full width — feels like a rubber stamp

### Bottom Nav
- Active tab: small terracotta dot indicator above icon + icon color → terracotta
- Inactive: mocha color instead of cold gray
- Nav background: `#FDF8F0` cream instead of pure white

### Pantry Page
- Tabs: pill-style toggle (same as time picker) — warm + terracotta active
- Category headers: Lora italic instead of uppercase muted text
- StapleCard: warm cream card background (`#FAF3E4`)
- Out-of-stock: CSS diagonal strikethrough line instead of opacity-40 (more readable)
- AddIngredientSheet category select: consider pill layout matching onboarding

### Cooking Mode
- Step number: terracotta circle (`bg-[#C4621A] text-[#FDF8F0]`)
- Step instruction text: Lora serif, `text-2xl leading-relaxed`
- Progress bar: terracotta fill on warm tan track
- Header recipe name: Lora italic
- Completion screen: CSS border ornament / flourish around "Well done!" (no images)

### Recipe Detail Page
- Recipe name: Lora italic, large
- Section headings (Ingredients, Steps, etc.): Lora italic
- Step number circles: terracotta
- Ingredient rows: warm card backgrounds
- "Start Cooking" button: terracotta

### History Page
- Favourite cards: parchment background, Lora italic name
- Meal log entries: warm card style
- Date text: mocha color

### Settings Page
- Card backgrounds: parchment `#FAF3E4`
- Switch accent: terracotta
- Section headings: Lora italic

### Onboarding
- Progress dots: larger (12px), terracotta for active
- Step titles: Lora serif
- Cuisine pills: warm treatment (consistent with home)

---

## Component Library

### `<TornEdge />` — reusable SVG component
Single file: `src/components/ui/TornEdge.tsx`
Props: `fill` (color string), `className`
Renders an SVG with an irregular torn paper path.

### `<GrainFilter />` — SVG filter definition
Placed once in layout.tsx, defines `id="grain"` filter.
Cards reference via `style={{ filter: 'url(#grain)' }}`.

---

## What Stays the Same
- All functional logic (no JS changes)
- shadcn component structure (re-skinned via className, not replaced)
- Routing, API calls, data fetching
- Dark mode (ThemeProvider stays, dark mode CSS vars updated to be warm-dark)
