import type { Category } from '@/lib/types'

export type CuisineKey = 'Indian' | 'Italian' | 'Mediterranean' | 'Asian' | 'Mexican'

const pantryByCuisine: Record<CuisineKey, { name: string; category: Category }[]> = {
  Indian: [
    { name: 'Rice', category: 'Grains & Lentils' },
    { name: 'Toor dal', category: 'Grains & Lentils' },
    { name: 'Chana dal', category: 'Grains & Lentils' },
    { name: 'Urad dal', category: 'Grains & Lentils' },
    { name: 'Moong dal', category: 'Grains & Lentils' },
    { name: 'Poha', category: 'Grains & Lentils' },
    { name: 'Rava / Semolina', category: 'Grains & Lentils' },
    { name: 'Atta / wheat flour', category: 'Grains & Lentils' },
    { name: 'Mustard seeds', category: 'Spices & Tempering' },
    { name: 'Cumin seeds', category: 'Spices & Tempering' },
    { name: 'Curry leaves', category: 'Spices & Tempering' },
    { name: 'Turmeric powder', category: 'Spices & Tempering' },
    { name: 'Red chilli powder', category: 'Spices & Tempering' },
    { name: 'Coriander powder', category: 'Spices & Tempering' },
    { name: 'Garam masala', category: 'Spices & Tempering' },
    { name: 'Asafoetida (hing)', category: 'Spices & Tempering' },
    { name: 'Dry red chillies', category: 'Spices & Tempering' },
    { name: 'Black pepper', category: 'Spices & Tempering' },
    { name: 'Salt', category: 'Spices & Tempering' },
    { name: 'Coconut oil', category: 'Oils & Condiments' },
    { name: 'Sesame / gingelly oil', category: 'Oils & Condiments' },
    { name: 'Sunflower oil', category: 'Oils & Condiments' },
    { name: 'Tamarind', category: 'Oils & Condiments' },
    { name: 'Coconut (desiccated)', category: 'Oils & Condiments' },
    { name: 'Jaggery', category: 'Oils & Condiments' },
    { name: 'Eggs', category: 'Fridge' },
    { name: 'Curd / yogurt', category: 'Fridge' },
    { name: 'Milk', category: 'Fridge' },
  ],
  Italian: [
    { name: 'Spaghetti', category: 'Pasta & Dry Goods' },
    { name: 'Penne', category: 'Pasta & Dry Goods' },
    { name: 'Breadcrumbs', category: 'Pasta & Dry Goods' },
    { name: 'Dried oregano', category: 'Spices & Tempering' },
    { name: 'Dried basil', category: 'Spices & Tempering' },
    { name: 'Dried thyme', category: 'Spices & Tempering' },
    { name: 'Chilli flakes', category: 'Spices & Tempering' },
    { name: 'Black pepper', category: 'Spices & Tempering' },
    { name: 'Salt', category: 'Spices & Tempering' },
    { name: 'Olive oil', category: 'Oils & Condiments' },
    { name: 'Canned tomatoes', category: 'Oils & Condiments' },
    { name: 'Tomato paste', category: 'Oils & Condiments' },
    { name: 'Garlic', category: 'Oils & Condiments' },
    { name: 'Eggs', category: 'Fridge' },
    { name: 'Parmesan', category: 'Fridge' },
    { name: 'Butter', category: 'Fridge' },
    { name: 'Milk', category: 'Fridge' },
  ],
  Mediterranean: [
    { name: 'Chickpeas (canned)', category: 'Grains & Lentils' },
    { name: 'Olive oil', category: 'Oils & Condiments' },
    { name: 'Lemon juice', category: 'Oils & Condiments' },
    { name: 'Garlic', category: 'Oils & Condiments' },
    { name: 'Dried oregano', category: 'Spices & Tempering' },
    { name: 'Cumin seeds', category: 'Spices & Tempering' },
    { name: 'Paprika', category: 'Spices & Tempering' },
    { name: 'Salt', category: 'Spices & Tempering' },
    { name: 'Black pepper', category: 'Spices & Tempering' },
    { name: 'Eggs', category: 'Fridge' },
    { name: 'Feta cheese', category: 'Fridge' },
  ],
  Asian: [
    { name: 'Rice', category: 'Grains & Lentils' },
    { name: 'Soy sauce', category: 'Oils & Condiments' },
    { name: 'Sesame oil', category: 'Oils & Condiments' },
    { name: 'Garlic', category: 'Oils & Condiments' },
    { name: 'Rice vinegar', category: 'Oils & Condiments' },
    { name: 'Ginger', category: 'Spices & Tempering' },
    { name: 'Chilli flakes', category: 'Spices & Tempering' },
    { name: 'Salt', category: 'Spices & Tempering' },
    { name: 'Black pepper', category: 'Spices & Tempering' },
    { name: 'Eggs', category: 'Fridge' },
  ],
  Mexican: [
    { name: 'Rice', category: 'Grains & Lentils' },
    { name: 'Black beans (canned)', category: 'Grains & Lentils' },
    { name: 'Cumin seeds', category: 'Spices & Tempering' },
    { name: 'Paprika', category: 'Spices & Tempering' },
    { name: 'Chilli flakes', category: 'Spices & Tempering' },
    { name: 'Salt', category: 'Spices & Tempering' },
    { name: 'Black pepper', category: 'Spices & Tempering' },
    { name: 'Garlic', category: 'Oils & Condiments' },
    { name: 'Olive oil', category: 'Oils & Condiments' },
    { name: 'Canned tomatoes', category: 'Oils & Condiments' },
    { name: 'Eggs', category: 'Fridge' },
    { name: 'Cheddar cheese', category: 'Fridge' },
  ],
}

export function buildStarterPantry(
  selectedCuisines: CuisineKey[]
): { name: string; category: Category }[] {
  const seen = new Set<string>()
  const result: { name: string; category: Category }[] = []
  for (const cuisine of selectedCuisines) {
    for (const item of pantryByCuisine[cuisine]) {
      if (!seen.has(item.name)) {
        seen.add(item.name)
        result.push(item)
      }
    }
  }
  return result
}

export const ALL_CUISINE_KEYS: CuisineKey[] = [
  'Indian', 'Italian', 'Mediterranean', 'Asian', 'Mexican',
]
