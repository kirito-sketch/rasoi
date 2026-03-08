import { supabase } from '@/lib/supabase'
import type { Recipe } from '@/lib/types'

export async function getFavourites(): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from('favourites')
    .select('recipe_data')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(row => row.recipe_data as Recipe)
}

export async function addFavourite(recipe: Recipe): Promise<void> {
  const { error } = await supabase
    .from('favourites')
    .insert({ recipe_data: recipe })
  if (error) throw error
}

export async function removeFavourite(recipeName: string): Promise<void> {
  const { error } = await supabase
    .from('favourites')
    .delete()
    .eq('recipe_data->>name', recipeName)
  if (error) throw error
}
