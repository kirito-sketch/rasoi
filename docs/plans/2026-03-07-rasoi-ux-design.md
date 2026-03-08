# Rasoi — UX Design Documentation

**Version:** 1.0
**Date:** 2026-03-07
**Designer:** Arun Peri
**Platform:** Mobile-first progressive web app (PWA)

---

## 1. Product Principles

Before any screen — these are the rules every design decision must pass:

1. **Default to smart.** Pre-fill everything from last session. The user should only change what's different today.
2. **Don't interrupt.** Health notes, utensil changes, pantry updates — all optional. Never block the main flow.
3. **Respect the kitchen.** Cooking mode must work with dirty hands, bad lighting, and no WiFi.
4. **Earn trust slowly.** Nutrition data is an estimate — never present it as fact.
5. **Delight through specificity.** A recipe that knows you have a kadai and no oven is more valuable than 1,000 generic results.

---

## 2. User Persona

**Arun, 30s — UX Designer, Part-time Chef**

| Attribute | Detail |
|-----------|--------|
| Context | Works full-time, cooks for himself, gas stove only |
| Cuisine identity | South Indian roots, makes great pasta and omelettes, open to any cuisine |
| Health goal | High protein + balanced, varies by day |
| Pain point | Stares at the pantry, doesn't know what to make with what's there |
| Time reality | Weekdays: 20–30 mins. Weekends: can stretch |
| Physical context | Uses phone in the kitchen — hands get dirty |
| Motivation | Eat well, not eat out. Feel good about what he put in his body |

---

## 3. Information Architecture

```
Rasoi
│
├── ONBOARDING (first launch only — linear, one-time)
│   ├── Step 1: Welcome + cuisine questionnaire
│   ├── Step 2: Pantry auto-populate (South Indian starter list)
│   ├── Step 3: Camera scan to fill gaps (SKIPPABLE)
│   └── Step 4: Utensil setup
│
├── HOME / COOK (Tab 1)
│   ├── Session config (time, health goal, servings)
│   ├── Cuisine mood filter (collapsible, optional — defaults to "Anything")
│   ├── Health note (collapsible, optional)
│   └── → [Find Recipes] →
│           └── RECIPES (3 cards)
│                   └── → RECIPE DETAIL
│                               └── → COOKING MODE (full screen, no nav)
│                                           └── → Done → HOME
│
├── PANTRY (Tab 2)
│   ├── Staples tab
│   │   ├── Grouped by category
│   │   ├── Toggle in / out
│   │   ├── Quantity level (a little / enough / plenty)
│   │   └── Add staple (sheet)
│   └── Fresh / Today tab
│       ├── Today's fresh ingredients
│       ├── Leftovers (marked from previous sessions)
│       ├── Add manually (sheet)
│       └── Camera scan → Confirm → Added
│
├── HISTORY (Tab 3)
│   ├── Weekly nutrition summary (card)
│   │   ├── Protein / Carbs / Fat totals
│   │   ├── Meals cooked count
│   │   └── Most-used ingredients
│   ├── Favourites strip (horizontal scroll)
│   └── Meal log (reverse chronological)
│
└── SETTINGS (Tab 4)
    ├── Utensil profile (toggle each)
    ├── Appearance (dark / light mode)
    └── Pantry → link to Pantry tab
```

---

## 4. Navigation Model

**Pattern:** Fixed bottom tab bar with 4 items.
**Rationale:** Thumb-reachable on mobile. No hamburger menus — everything is visible and accessible in one tap from anywhere.

```
┌─────────────────────────────────┐
│                                 │
│         [screen content]        │
│                                 │
│                                 │
├─────────────────────────────────┤
│  [Cook]  [Pantry] [History] [Settings] │
└─────────────────────────────────┘
```

**Tab bar rules:**
- Active tab: primary colour icon + label
- Inactive: muted grey icon + label
- Tab bar HIDES during Cooking Mode (full-screen, distraction-free)
- Tab bar does NOT hide on Recipe Detail (user may want to check pantry)

**Back navigation:**
- Recipes → back to Home (preferences preserved, not regenerated)
- Recipe Detail → back to Recipes (same 3 cards still showing)
- Cooking Mode → back button in top-left exits to Recipe Detail (with confirmation: "Exit cooking?")

---

## 5. User Flows

### Flow 1: First-time user — Onboarding

```
App launch
    │
    ▼
[Onboarding: Welcome]
"Let's set up your kitchen"
    │
    ▼
[Onboarding: Cuisine questionnaire]
"What do you cook?" (multi-select)
Indian / Italian / Mediterranean / Asian / Mexican / Other
    │
    ▼
[Onboarding: Review starter pantry]
Pre-selected list of staples
User deselects what they don't have
    │
    ▼
[Onboarding: Camera scan — SKIPPABLE]
"Want to scan your pantry to fill gaps?"
[Scan now]   [Skip for now]
    │
    ▼
[Onboarding: Utensils]
Toggle each utensil on/off
    │
    ▼
[Home screen]
"You're all set. What are you cooking today?"
```

**UX notes:**
- Progress indicator at top (Step 1 of 4 dots)
- Each step is one decision — no cognitive overload
- Camera scan is clearly skippable — users shouldn't feel forced
- Utensil setup is last because it's less emotionally engaging than food

---

### Flow 2: Returning user — Daily cooking (primary flow)

```
Open app
    │
    ▼
[Home screen]
Preferences pre-filled from last session
User glances, adjusts if needed (30 seconds max)
    │
    ├── (optional) Tap "+ Not feeling 100%?"
    │       └── Select health note or type custom
    │
    ▼
[Find Recipes] tapped
    │
    ▼
[Recipes page — loading]
"Finding your recipes..." skeleton cards
(3–5 second Groq API call)
    │
    ▼
[3 Recipe cards]
User browses, taps one
    │
    ├── (optional) Heart to favourite
    ├── (optional) "Show 3 more" → regenerate
    │
    ▼
[Recipe Detail]
User reviews ingredients, nutrition, steps
    │
    ▼
[Let's cook] tapped
    │
    ▼
[Cooking Mode — full screen]
Step by step, tap to advance
    │
    ▼
[Done screen]
"Meal logged." / "Great cook!"
    │
    ▼
[Home screen]
```

**UX notes:**
- Meal is logged when user taps "Let's cook" (not "Done") — captures intent even if they abandon mid-cook
- Done screen is a moment of completion — small but meaningful
- No rating or review prompt — keeps it frictionless

---

### Flow 3: Pantry management — before cooking

```
[Pantry tab]
    │
    ├── Staples tab (default)
    │   ├── See all permanent staples
    │   ├── Toggle "out" for anything empty
    │   ├── Adjust quantity levels
    │   └── Add new permanent staple →
    │           [Add ingredient sheet slides up]
    │           Name + category → Save
    │
    └── Fresh / Today tab
        ├── See today's fresh ingredients
        ├── Add manually → [Add ingredient sheet]
        └── Camera scan →
                [Camera opens — capture photo]
                    │
                    ▼
                [Identified ingredients — dialog]
                "Groq found these — deselect anything wrong"
                [Confirm] → Added to Fresh tab
```

---

### Flow 4: Health override

```
[Home screen]
    │
    ▼
Tap "+ Not feeling 100%?"
    │
    ▼
[Health note section expands inline]
Preset pills: Body heat / Stomach issue / Cold or fever / Low energy
[Or type custom...]
    │
    ├── Tap a preset → pill highlights → section stays open
    ├── Type custom → overrides preset
    │
    ▼
Active health note shows as amber pill in session summary area
    │
    ▼
[Find Recipes] → Groq adjusts all 3 recipes accordingly
```

---

### Flow 5: Cooking abandoned mid-way

```
[Cooking Mode — step 3 of 8]
    │
User taps [← Back]
    │
    ▼
[Confirmation dialog]
"Exit cooking? Your progress will be lost."
[Stay]   [Exit]
    │
    ▼ (if Exit)
[Recipe Detail page]
Meal is ALREADY logged (logged on "Let's cook")
```

---

## 6. Screen-by-Screen Design

---

### Screen 1: Home (Cook tab)

**Purpose:** Set today's cooking preferences and launch recipe generation.

**Design principle:** This is a configuration screen, not a form. Ingredients drive the output — cuisine is just a mood, not a constraint. Three quick selections and you're cooking.

```
┌─────────────────────────────────┐
│ Rasoi              Good morning │  ← Wordmark left, greeting right
│ What are you cooking today?     │  ← Subtitle, muted
├─────────────────────────────────┤
│                                 │
│  Time available                 │  ← Section label (uppercase, small, muted)
│  [15 min] [30 min] [45 min] [1hr+]  ← Chip group, selected = filled primary
│                                 │
│  Health goal                    │
│  [High protein] [Balanced]      │
│  [Low oil] [Low carb] [Flexible]│
│                                 │
│  Servings                       │
│  [1]  [2]  [3+]                 │
│                                 │
│  ─────────────────────────────  │
│  + In the mood for something?   │  ← CUISINE — collapsed, optional
│                                 │  ← Default: Anything (not shown until opened)
│  + Not feeling 100%?            │  ← Collapsed by default, muted text
│                                 │
│  [FIND RECIPES ──────────────►] │  ← Full-width CTA, high contrast
│                                 │
└─────────────────────────────────┘
         [Cook] [Pantry] [History] [Settings]
```

**States:**

**A — Default (returning user)**
- Last session's time + health goal + servings pre-selected
- Cuisine defaults to "Anything" — collapsed, invisible unless you want it
- Greeting changes by time of day: "Good morning", "Good afternoon", "Good evening"
- "Find Recipes" button is always active (never disabled)

**B — Cuisine mood filter expanded**
```
│  + In the mood for something? [×]   │
│                                     │
│  [Anything ✓] [Indian] [Italian]    │
│  [Mediterranean] [Asian] [Mexican]  │
│  [Surprise me]                      │
```
- "Anything" is selected by default — ingredients drive the output
- Tapping a cuisine = soft filter, not hard constraint
- If selected cuisine shows as a small chip next to the collapsed label: `In the mood for: Italian`

**C — Health note active**
- After expanding the health note section and selecting one:
- An amber pill appears between the chips and the CTA: `Body heat mode active`
- This makes it visible at a glance before generating recipes

**D — Health note expanded**
```
│  + Not feeling 100%?  [×]      │  ← X to collapse
│                                │
│  [Body heat] [Stomach issue]   │
│  [Cold / fever] [Low energy]   │
│  ─────────────────────────     │
│  Or describe it: ____________  │  ← Text input, placeholder
```

**Chip interaction:**
- Single-select per group
- Tap selected chip = it stays selected (cannot deselect to nothing)
- Visual: selected chip = filled background + white text; unselected = outlined

**Spacing:**
- Section labels: 12px, uppercase, 1.5px letter-spacing, muted foreground
- Chip groups: 8px gap between chips, 16px below each group
- Card padding: 20px all sides
- CTA: 56px height, 16px margin top

---

### Screen 2: Recipes

**Purpose:** Present 3 AI-generated recipe options. Fast to scan, easy to pick.

```
┌─────────────────────────────────┐
│ ← Back     Your recipes    [↺]  │  ← Back to home, refresh icon
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────┐   │
│  │ Egg Pepper Fry          ♡  │   ← Recipe name + heart (unfilled)
│  │ A spicy South Indian    │   │   ← One-line description, muted
│  │ dry preparation         │   │
│  │ ─────────────────────── │   │
│  │ [25 min] [Easy]         │   │   ← Time badge, difficulty badge
│  │ [High protein · ~22g]   │   │   ← Health highlight badge, green tint
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Dal Tadka               ♡  │
│  │ Creamy toor dal with    │   │
│  │ classic tempering       │   │
│  │ ─────────────────────── │   │
│  │ [30 min] [Easy]         │   │
│  │ [Balanced · ~18g prot]  │   │
│  │ ! Marination not needed │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Poha with Peanuts       ♡  │
│  │ Light, filling, quick   │   │
│  │ ─────────────────────── │   │
│  │ [15 min] [Easy]         │   │
│  │ [Balanced · ~12g prot]  │   │
│  │ Prep: 5m  Cook: 10m     │   │  ← Prep vs cook breakdown, small, muted
│  └─────────────────────────┘   │
│                                 │
│  [Show 3 different options]     │  ← Outlined button, below cards
│                                 │
└─────────────────────────────────┘
```

**Loading state:**
```
│ Finding your recipes...         │  ← Copy matters — not "Loading"
│ [████████░░░░░░░░░░░░░░░░]     │  ← Skeleton card 1
│ [████████░░░░░░░░░░░░░░░░]     │  ← Skeleton card 2
│ [████████░░░░░░░░░░░░░░░░]     │  ← Skeleton card 3
```

**Empty / no-match state:**
```
│ No recipes matched your setup   │
│ Your time + ingredients were    │
│ too tight for 3 results.        │
│                                 │
│ Try: relaxing the time limit    │  ← Specific suggestion, not generic
│ or adding more ingredients      │
│                                 │
│ [Adjust preferences]            │  ← Returns to Home with prefs intact
```

**Marination warning design:**
- Shown as a small amber row at the bottom of the card
- Icon: clock or alert
- Copy: "Needs 30 min marination — plan ahead"
- Prevents the user committing to a recipe and only discovering this on the detail page

---

### Screen 3: Recipe Detail

**Purpose:** All the information needed to decide to cook this, and a preview of steps before committing.

```
┌─────────────────────────────────┐
│ ← Back                      ♡  │
├─────────────────────────────────┤
│                                 │
│  Egg Pepper Fry                 │  ← H1, large
│  A spicy South Indian dry       │
│  preparation with whole spices  │  ← Description, muted
│                                 │
│  [25 min] [Prep: 8m] [Cook: 17m]│
│  [Easy] [Serves 1]              │  ← Badge row
│                                 │
│  ┌─ Nutrition (est.) ─────────┐ │
│  │ Note: AI estimate, not     │ │  ← Disclaimer first, prominent
│  │ clinical data              │ │
│  │ Protein  Carbs  Fat        │ │
│  │  22g      18g    14g       │ │
│  └────────────────────────────┘ │
│                                 │
│  Ingredients                    │
│  ─────────────────────────────  │
│  Eggs (fresh)       3 whole     │  ← Fresh = bold/normal weight
│  Coconut oil ·····  1 tbsp     │  ← Staple = dotted + muted
│  Black pepper ·····  1 tsp     │
│  Curry leaves ·····  8–10      │
│  ─────────────────────────────  │
│  Bold = fresh today             │  ← Legend, xs, muted
│  Muted = from your pantry      │
│                                 │
│  Substitutions                  │
│  No curry leaves? Use dried     │
│  curry leaf powder              │
│                                 │
│  Steps overview                 │
│  ─────────────────────────────  │
│  1. Heat coconut oil in kadai   │
│  2. Add mustard seeds, let      │
│     them splutter               │
│  3. Add curry leaves + dried    │
│     red chillies                │
│  4. Add beaten eggs, scramble   │
│     on medium heat              │
│  5. Add pepper + salt, toss     │
│     on high heat for 1 min      │
│                                 │
│  [LET'S COOK ───────────────►] │  ← Full-width, high contrast CTA
│                                 │
└─────────────────────────────────┘
```

**Design decisions:**
- Nutrition disclaimer appears BEFORE the numbers — sets expectations
- Ingredients use visual weight to differentiate fresh vs staple (no colour dependency — works in dark mode, accessible)
- Steps overview is scannable before committing — the user can bail if the recipe is not what they expected
- "Let's cook" logs the meal and launches cooking mode — one tap, committed

---

### Screen 4: Cooking Mode

**Purpose:** Guide the user through cooking step by step. Full focus, no distractions.

```
┌─────────────────────────────────┐
│ ←                    3 of 5    │  ← Back left, counter right. Minimal.
│ ████████████░░░░░░░░░░░░░░░░░  │  ← Progress bar. Thin, full width.
├─────────────────────────────────┤
│                                 │
│                                 │
│  Egg Pepper Fry                 │  ← Recipe name, small, muted
│                                 │
│                                 │
│  Add curry leaves and           │  ← STEP TEXT. Large (24px+). Bold.
│  dried red chillies to          │  High contrast. Readable at arm's
│  the kadai. They will           │  length.
│  splutter — stand back.         │
│                                 │
│                                 │
│                                 │
│                                 │
│  ┌─ Tip ──────────────────────┐ │
│  │ Use medium heat here —     │ │  ← Amber/warm bg. Only if tip exists.
│  │ high heat burns curry      │ │
│  │ leaves fast                │ │
│  └────────────────────────────┘ │
│                                 │
│  Tap anywhere for next step     │  ← Muted instruction. Small.
└─────────────────────────────────┘
         [NO BOTTOM NAV IN COOKING MODE]
```

**Last step state:**
```
│  Remove from heat and           │
│  serve immediately with         │
│  rice or as a side.             │
│                                 │
│  [DONE — back to home]          │  ← Button replaces "tap anywhere"
```

**Done / completion state (brief, before redirecting):**
```
│                                 │
│                                 │
│         Well cooked.            │  ← Simple. Not over the top.
│                                 │
│         Egg Pepper Fry          │
│         logged to history       │
│                                 │
│  [Back to home]                 │
│                                 │
```

**Interaction model:**
- Tap anywhere on screen = advance to next step
- Back button = previous step (NOT exit)
- Back button on step 1 = show exit confirmation dialog
- Screen wake lock active — screen will not turn off

**Typography in cooking mode:**
- Step text: 24px, font-weight 500, line-height 1.5
- Recipe name: 13px, muted, uppercase
- Step counter: 13px, muted, right-aligned
- Tip text: 14px, regular weight

---

### Screen 5: Pantry

**Purpose:** Manage what you have. Toggle availability, add new, scan with camera.

```
┌─────────────────────────────────┐
│ Pantry                  [Scan]  │  ← Camera scan always visible top-right
├─────────────────────────────────┤
│ [Staples ──────] [Fresh/Today]  │  ← Tab switcher
├─────────────────────────────────┤
│                                 │
│  GRAINS & LENTILS               │  ← Category label, xs, uppercase, muted
│  Rice ················ [enough] │  ← Name left, quantity pills right
│  Toor dal ············ [plenty] │
│  Chana dal   [OUT]              │  ← "Out" badge. Item is muted/dimmed.
│  Poha ················· [a little]
│                                 │
│  SPICES & TEMPERING             │
│  Mustard seeds ······· [enough] │
│  Curry leaves  [OUT]            │
│  Turmeric ············ [plenty] │
│                                 │
│  OILS & CONDIMENTS              │
│  Coconut oil ·········· [enough]│
│                                 │
│  FRIDGE                         │
│  Eggs ················· [enough]│
│  Curd ················· [a little]
│                                 │
│  [+ Add staple]                 │  ← Text button at bottom
│                                 │
└─────────────────────────────────┘
```

**Fresh / Today tab:**
```
│ [Staples] [Fresh/Today ────────]│
├─────────────────────────────────┤
│                                 │
│  Today's ingredients            │  ← Section label
│  Chicken breast ········[enough]│  ← Deletable (trash icon on right)
│  Spinach ···············[a little]
│                                 │
│  Leftovers                      │  ← Section label (if any)
│  Dal (from yesterday) ··[plenty]│  ← Leftover badge/indicator
│                                 │
│  Nothing here yet.              │  ← Empty state if no fresh items
│  Add what you bought today.     │
│                                 │
│  [+ Add manually]   [Scan]      │  ← Two equal options
│                                 │
│  [Clear today's fresh items]    │  ← Destructive action, text button, muted
│                                 │
└─────────────────────────────────┘
```

**Toggle interaction:**
- Tap the item name = toggle in stock / out
- Out of stock = item dims to 40% opacity + "OUT" badge
- Tap again = back in stock, full opacity
- Quantity pills are inline — tap a pill to change level (a little / enough / plenty)

**Camera scan flow (from pantry):**
- Tap [Scan] → native camera opens (file input with capture="environment")
- After capture → loading indicator ("Identifying ingredients...")
- Dialog slides up with identified items as pills
- User taps to deselect incorrect ones
- Tap [Add X ingredients] → added to Fresh tab

---

### Screen 6: History

**Purpose:** Show what was cooked, weekly nutrition, and allow quick access to favourites.

```
┌─────────────────────────────────┐
│ History                         │
├─────────────────────────────────┤
│                                 │
│  This week                      │  ← Card
│  ┌─────────────────────────────┐│
│  │ Protein   Carbs   Fat       ││
│  │  ~142g    ~210g   ~86g      ││
│  │ ─────────────────────────── ││
│  │ 5 meals cooked this week    ││
│  │ Most used: Eggs, Rice, Dal  ││
│  │                             ││
│  │ * AI estimates, not clinical││  ← Always present disclaimer
│  └─────────────────────────────┘│
│                                 │
│  Favourites                     │  ← Section header with → arrow
│  ──────────────────────────────-│
│  [Egg Pepper Fry] [Dal Tadka]   │  ← Horizontal scroll, chips/cards
│                                 │
│  Recent meals                   │
│  ─────────────────────────────  │
│  Egg Pepper Fry                 │
│  Today · High protein           │  ← Date + health goal, muted
│                              22g│  ← Protein right-aligned
│                                 │
│  Dal Tadka                      │
│  Yesterday · Balanced           │
│                              18g│
│                                 │
│  Poha with Peanuts              │
│  Mon · Balanced                 │
│                              12g│
│                                 │
└─────────────────────────────────┘
```

**Empty state (first week):**
```
│  No meals logged yet.           │
│  Cook your first recipe to      │
│  start tracking.                │
│                                 │
│  [Find something to cook →]     │  ← CTA to home tab
```

**Favourites empty state:**
```
│  No favourites yet.             │
│  Tap the heart on any recipe    │
│  to save it here.               │
```

---

### Screen 7: Settings

**Purpose:** Configure what doesn't change often — utensils and appearance.

```
┌─────────────────────────────────┐
│ Settings                        │
├─────────────────────────────────┤
│                                 │
│  My Kitchen                     │  ← Section label
│  ─────────────────────────────  │
│  Gas stove              [  ON ] │  ← Toggle switches
│  Pressure cooker        [  ON ] │
│  Kadai / wok            [  ON ] │
│  Tawa                   [  ON ] │
│  Blender / mixie        [  ON ] │
│  Oven                   [ OFF ] │
│  Microwave              [ OFF ] │
│                                 │
│  Appearance                     │
│  ─────────────────────────────  │
│  Dark mode              [ OFF ] │
│                                 │
│  Pantry                         │
│  ─────────────────────────────  │
│  Manage staples       →         │  ← Link to pantry tab
│                                 │
└─────────────────────────────────┘
```

---

## 7. Onboarding Screens

### Onboarding Step 1: Welcome + Cuisine

```
┌─────────────────────────────────┐
│              ● ○ ○ ○            │  ← Progress dots (4 steps)
│                                 │
│         Welcome to Rasoi        │  ← H1
│   Let's set up your kitchen     │  ← Subtitle, muted
│   in 2 minutes.                 │
│                                 │
│   What do you cook?             │  ← Question
│   Pick everything that applies. │  ← Multi-select instruction, muted
│                                 │
│   [Indian ✓] [Italian ✓]        │  ← Pills, can select multiple
│   [Mediterranean] [Asian]       │
│   [Mexican] [Other]             │
│                                 │
│   Your pantry is built from     │  ← Helper text, muted, small
│   what you select here.         │
│                                 │
│   [Continue ─────────────────►] │
└─────────────────────────────────┘
```

**Key change:** Multi-select, not single. Selecting Italian + Indian means the starter pantry includes both South Indian spices AND pasta/olive oil/garlic. The pantry is built from the union of all selected cuisines.

### Onboarding Step 2: Starter Pantry

```
┌─────────────────────────────────┐
│              ○ ● ○ ○            │
│                                 │
│   Here's your starter pantry   │  ← H1
│   Deselect anything you         │  ← Subtitle
│   don't have.                   │
│                                 │
│   GRAINS & LENTILS              │
│   [Rice ✓] [Toor dal ✓]        │  ← Pills, selected by default
│   [Chana dal ✓] [Poha ✓]       │
│                                 │
│   PASTA & DRY GOODS             │  ← Added because Italian was selected
│   [Spaghetti ✓] [Penne ✓]      │
│   [Pasta (any) ✓]               │
│                                 │
│   SPICES & TEMPERING            │
│   [Mustard seeds ✓] [Cumin ✓]  │
│   [Curry leaves ✓] [Turmeric ✓]│
│   [Dried oregano ✓] [Basil ✓]  │  ← Italian herbs included
│                                 │
│   OILS & CONDIMENTS             │
│   [Coconut oil ✓] [Olive oil ✓] │  ← Both included
│   [Canned tomatoes ✓]           │
│                                 │
│   FRIDGE                        │
│   [Eggs ✓] [Curd ✓] [Milk ✓]   │
│   [Parmesan ✓] [Butter ✓]       │  ← Italian fridge staples
│                                 │
│   [Save my pantry ────────────►]│
└─────────────────────────────────┘
```

### Onboarding Step 3: Camera Scan (skippable)

```
┌─────────────────────────────────┐
│              ○ ○ ● ○            │
│                                 │
│   Anything else in              │  ← H1
│   your pantry?                  │
│                                 │
│   Point your camera at your     │  ← Description
│   shelves or fridge and we'll   │
│   identify what's there.        │
│                                 │
│   [Scan my pantry ────────────►]│  ← Primary CTA
│                                 │
│   [Skip for now]                │  ← Secondary, muted text link
│                                 │
└─────────────────────────────────┘
```

### Onboarding Step 4: Utensils

```
┌─────────────────────────────────┐
│              ○ ○ ○ ●            │
│                                 │
│   What do you cook with?        │  ← H1
│   Turn off what you don't have. │  ← Subtitle
│                                 │
│   Gas stove             [  ON ] │
│   Pressure cooker       [  ON ] │
│   Kadai / wok           [  ON ] │
│   Tawa                  [  ON ] │
│   Blender / mixie       [  ON ] │
│   Oven                  [ OFF ] │
│   Microwave             [ OFF ] │
│                                 │
│   [Done — let's cook ─────────►]│
│                                 │
└─────────────────────────────────┘
```

---

## 8. UX Audit Findings

These are issues found in the initial design, and how they're resolved.

| # | Issue | Severity | Resolution |
|---|-------|----------|------------|
| 1 | Home screen stacks 4 preference groups — feels form-like | Medium | Wrap in single card, thin section labels, chips feel light not heavy |
| 2 | No indicator that health note is active before generating recipes | High | Amber pill shows below chips when active: "Body heat mode active" |
| 3 | Meal logged at "Let's cook" — user may not know | Medium | Toast notification: "Meal logged to history" on cooking mode entry |
| 4 | Onboarding: 3 steps with no progress indicator | High | 4 dot progress indicator at top of each onboarding screen |
| 5 | Camera scan forced in onboarding | Medium | Clearly skippable — "Skip for now" secondary action |
| 6 | No Favourites browsing page | High | Horizontal scroll strip on History page |
| 7 | Fresh ingredients never clear | Medium | "Clear today's fresh items" button on Fresh tab + auto-clear on new session (with confirmation) |
| 8 | Recipes page: navigating away loses generated results | Medium | Generated recipes cached in localStorage — navigating back to /recipes restores them |
| 9 | Nutrition data presented without context | High | Disclaimer appears ABOVE the numbers, not below. Always visible. |
| 10 | Cooking mode back button exits accidentally | Medium | Back on step 1 = exit confirmation dialog. Back on steps 2+ = previous step |
| 11 | No empty state for History | Low | "No meals logged yet" with CTA to Cook tab |
| 12 | Pantry page: no way to know if fresh items are from today | Low | Timestamp on each fresh item ("Added 2h ago") |
| 13 | Regenerating recipes resets everything | Low | "Show 3 more" keeps all preferences, only regenerates output |
| 14 | No confirmation before clearing fresh items | High | Confirmation dialog: "Clear all fresh ingredients?" — destructive action |
| 15 | Cuisine as a primary required selector limits discovery | High | Cuisine demoted to optional mood filter — defaults to "Anything". Ingredients drive suggestions, not cuisine. |
| 16 | Onboarding assumes Indian-only pantry | High | Onboarding Step 1 is multi-select across cuisines. Pantry is built from union of selected cuisines. |

---

## 9. Interaction Patterns & Micro-interactions

### Chip selection
- Tap unselected chip → fills with primary colour, white text (instant, no animation needed)
- Tap selected chip → stays selected (no empty state possible)
- Multi-select: cuisine and time — single select only

### Toggle (staple in/out)
- Tap item name → immediate opacity drop to 40%, "OUT" badge appears
- Smooth opacity transition (150ms ease)
- No confirmation needed (easily reversible)

### Heart / Favourite
- Tap → heart fills red instantly (optimistic update)
- If API fails → heart reverts + toast: "Couldn't save — try again"

### Cooking mode tap
- Tap anywhere → step text fades out, new step fades in (200ms cross-fade)
- Progress bar animates smoothly forward
- Tapping on the back button area does NOT advance (tap target exclusion zone)

### Loading states
- Recipe generation: skeleton cards with shimmer + "Finding your recipes..." copy
- Camera scan: spinner on the Scan button + "Identifying ingredients..." inline
- Any save action: button shows spinner, disabled state

### Error states
- API failure: toast at top "Something went wrong — tap to retry"
- Camera fail: inline error below button "Couldn't identify ingredients — add manually"
- No internet in cooking mode: silently works (recipe cached offline)

---

## 10. Accessibility Considerations

- All interactive elements: minimum 44×44px tap target
- Colour is never the only differentiator (fresh vs staple ingredients use text weight, not just colour)
- Dark mode support throughout
- Nutrition disclaimer is always visible text — never hidden behind an icon tooltip
- Camera scan always has manual input fallback
- Screen wake lock: gracefully degrades if browser doesn't support it (no error shown)

---

## 11. Design Tokens (to be implemented)

```
Colors:
  primary: slate-900 (light) / slate-50 (dark)
  muted: slate-500
  accent-health: emerald-600 bg: emerald-50/950
  accent-warning: amber-600 bg: amber-50/950
  accent-danger: red-500

Typography:
  h1: 28px / 700
  h2: 20px / 600
  body: 15px / 400
  label: 12px / 600 / uppercase / 1.5px tracking
  cooking-step: 24px / 500

Spacing:
  page-padding: 16px
  section-gap: 24px
  card-padding: 20px
  chip-gap: 8px

Radius:
  card: 16px
  chip: 999px (fully rounded)
  sheet: 20px top corners only
  dialog: 16px

Motion:
  toggle: 150ms ease
  page-transition: 200ms ease
  skeleton-shimmer: 1.5s linear infinite
  cooking-step-fade: 200ms ease
```

---

## 12. Open Questions

These need a decision before implementation:

| Question | Options | Recommendation |
|----------|---------|----------------|
| Should meal be logged at "Let's cook" or "Done"? | At "Let's cook" (captures intent) vs "Done" (confirms completion) | "Let's cook" — most users won't tap Done, they'll just close the app |
| Should fresh ingredients auto-clear on new session? | Auto-clear on app open vs manual clear button | Manual clear — user might want to use same fresh items two days in a row |
| Where do favourites live? | Separate tab vs strip on History | Strip on History — saves a tab slot, still discoverable |
| Should onboarding have a "back" button? | Yes (standard) vs No (force forward) | Yes — users will make mistakes in Step 2 pantry selection |
| Serving size: stepper or chips? | Stepper (- 1 +) vs chips (1 / 2 / 3+) | Chips — simpler, consistent with other selectors on the page |
