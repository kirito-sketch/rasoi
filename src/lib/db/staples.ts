import { supabase } from '@/lib/supabase'
import type { Staple, Category, ItemType, QuantityLevel } from '@/lib/types'

export async function getStaples(): Promise<Staple[]> {
  const { data, error } = await supabase
    .from('staples')
    .select('*')
    .order('category')
    .order('name')
  if (error) throw error
  return data ?? []
}

export async function bulkAddStaples(
  items: { name: string; category: Category }[]
): Promise<void> {
  if (items.length === 0) return
  const { error } = await supabase.from('staples').insert(
    items.map(item => ({
      name: item.name,
      category: item.category,
      item_type: 'staple' as ItemType,
      quantity_level: 'enough' as QuantityLevel,
      in_stock: true,
    }))
  )
  if (error) throw error
}

export async function addStaple(
  name: string,
  category: Category,
  item_type: ItemType = 'staple',
  quantity_level: QuantityLevel = 'enough'
): Promise<Staple> {
  const { data, error } = await supabase
    .from('staples')
    .insert({ name, category, item_type, quantity_level, in_stock: true })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function toggleStapleStock(id: string, in_stock: boolean): Promise<void> {
  const { error } = await supabase
    .from('staples')
    .update({ in_stock })
    .eq('id', id)
  if (error) throw error
}

export async function updateQuantityLevel(
  id: string,
  quantity_level: QuantityLevel
): Promise<void> {
  const { error } = await supabase
    .from('staples')
    .update({ quantity_level })
    .eq('id', id)
  if (error) throw error
}

export async function deleteStaple(id: string): Promise<void> {
  const { error } = await supabase.from('staples').delete().eq('id', id)
  if (error) throw error
}

export async function clearFreshIngredients(): Promise<void> {
  const { error } = await supabase
    .from('staples')
    .delete()
    .eq('item_type', 'fresh')
  if (error) throw error
}
