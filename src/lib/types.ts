export type QuantityLevel = 'a little' | 'enough' | 'plenty'
export type ItemType = 'staple' | 'fresh' | 'leftover'
export type Category =
  | 'Grains & Lentils'
  | 'Spices & Tempering'
  | 'Oils & Condiments'
  | 'Fridge'
  | 'Pasta & Dry Goods'

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
  cuisine?: 'Indian' | 'Italian' | 'Mediterranean' | 'Asian' | 'Mexican' | 'Surprise me'
  servings: 1 | 2 | 3
  health_note?: string
}
