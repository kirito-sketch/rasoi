import { supabase } from '@/lib/supabase'
import type { Utensil } from '@/lib/types'

export async function getUtensils(): Promise<Utensil[]> {
  const { data, error } = await supabase
    .from('utensils')
    .select('*')
    .order('name')
  if (error) throw error
  return data ?? []
}

export async function toggleUtensil(id: string, available: boolean): Promise<void> {
  const { error } = await supabase
    .from('utensils')
    .update({ available })
    .eq('id', id)
  if (error) throw error
}

export async function resetTempUnlocks(): Promise<void> {
  const { error } = await supabase
    .from('utensils')
    .update({ temp_unlock: false })
    .neq('id', '00000000-0000-0000-0000-000000000000')
  if (error) throw error
}
