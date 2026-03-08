import { supabase } from '@/lib/supabase'
import type { Recipe } from '@/lib/types'

export async function addMealHistory(recipe: Recipe): Promise<void> {
  const { error } = await supabase
    .from('meal_history')
    .insert({ recipe_data: recipe, cooked_at: new Date().toISOString() })
  if (error) throw error
}

export async function getMealHistory() {
  const { data, error } = await supabase
    .from('meal_history')
    .select('*')
    .order('cooked_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return data ?? []
}
