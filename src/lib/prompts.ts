import type { Staple, Utensil, SessionPreferences } from '@/lib/types'

export function buildRecipePrompt(
  staples: Staple[],
  preferences: SessionPreferences,
  utensils: Utensil[]
): string {
  const inStock = staples.filter(s => s.in_stock)
  const outOfStock = staples.filter(s => !s.in_stock)

  const formatStaple = (s: Staple): string => {
    if (s.quantity_level === 'a little' || s.quantity_level === 'plenty') {
      return `${s.name} (${s.quantity_level})`
    }
    return s.name
  }

  const inStockList = inStock.length > 0
    ? inStock.map(formatStaple).join(', ')
    : 'None'

  const outOfStockList = outOfStock.length > 0
    ? outOfStock.map(s => s.name).join(', ')
    : 'None'

  const availableUtensils = utensils.filter(u => u.available || u.temp_unlock)
  const utensilList = availableUtensils.length > 0
    ? availableUtensils.map(u => u.name).join(', ')
    : 'Basic stovetop only'

  const healthLine = preferences.healthNote
    ? `\nHEALTH NOTE: ${preferences.healthNote} — factor this into suggestions.`
    : ''

  const cuisineLine = preferences.cuisine
    ? `\nCUISINE MOOD: Prefer ${preferences.cuisine} style if it fits naturally with the available ingredients.`
    : `\nCUISINE: Be creative — ingredients drive the choice, not a fixed cuisine.`

  return `You are a creative chef. Generate exactly 3 recipe suggestions based on what's available in the pantry.

PANTRY (use these ingredients as the primary basis for suggestions):
In stock: ${inStockList}
Out of stock (can be used if essential): ${outOfStockList}

TIME CONSTRAINT: Must be completable in ${preferences.timeMinutes} minutes or less.${healthLine}${cuisineLine}

AVAILABLE UTENSILS: ${utensilList}

Return ONLY a valid JSON array of exactly 3 recipe objects. No markdown, no explanation, just the JSON array. Each recipe must follow this exact shape:
{
  "name": "string",
  "description": "string (1-2 sentences)",
  "cuisine": "string",
  "prep_time_mins": number,
  "cook_time_mins": number,
  "total_time_mins": number,
  "needs_marination": boolean,
  "marination_time_mins": number (optional, only if needs_marination is true),
  "difficulty": "Easy" | "Medium",
  "servings": number,
  "health_highlight": "string",
  "estimated_protein": number,
  "estimated_carbs": number,
  "estimated_fat": number,
  "ingredients": [{ "name": "string", "amount": "string", "is_staple": boolean }],
  "steps": ["string"],
  "tips": ["string"],
  "substitutions": [{ "original": "string", "substitute": "string" }]
}`
}
