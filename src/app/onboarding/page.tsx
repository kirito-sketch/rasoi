'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  buildStarterPantry,
  ALL_CUISINE_KEYS,
  type CuisineKey,
} from '@/lib/data/starter-pantry'
import { bulkAddStaples } from '@/lib/db/staples'
import type { Category } from '@/lib/types'
import { Button } from '@/components/ui/button'

const CUISINE_LABELS: Record<CuisineKey, string> = {
  Indian: 'Indian',
  Italian: 'Italian',
  Mediterranean: 'Mediterranean',
  Asian: 'Asian',
  Mexican: 'Mexican',
}

const CATEGORIES: Category[] = [
  'Grains & Lentils',
  'Pasta & Dry Goods',
  'Spices & Tempering',
  'Oils & Condiments',
  'Fridge',
]

type Step = 'cuisines' | 'pantry'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('cuisines')
  const [selectedCuisines, setSelectedCuisines] = useState<Set<CuisineKey>>(
    new Set(['Indian', 'Italian'])
  )
  const [pantryItems, setPantryItems] = useState<
    { name: string; category: Category; selected: boolean }[]
  >([])
  const [saving, setSaving] = useState(false)

  function toggleCuisine(cuisine: CuisineKey) {
    setSelectedCuisines(prev => {
      const next = new Set(prev)
      if (next.has(cuisine)) {
        // Keep at least 1 selected
        if (next.size > 1) next.delete(cuisine)
      } else {
        next.add(cuisine)
      }
      return next
    })
  }

  function handleContinue() {
    const cuisines = Array.from(selectedCuisines)
    const items = buildStarterPantry(cuisines).map(item => ({
      ...item,
      selected: true,
    }))
    setPantryItems(items)
    setStep('pantry')
  }

  function toggleItem(name: string) {
    setPantryItems(prev =>
      prev.map(item =>
        item.name === name ? { ...item, selected: !item.selected } : item
      )
    )
  }

  async function handleSave() {
    setSaving(true)
    try {
      const toSave = pantryItems
        .filter(item => item.selected)
        .map(({ name, category }) => ({ name, category }))
      await bulkAddStaples(toSave)
      localStorage.setItem('rasoi_onboarded', 'true')
      router.push('/')
    } catch {
      // Supabase not configured yet — mark onboarded anyway so user can proceed
      localStorage.setItem('rasoi_onboarded', 'true')
      router.push('/')
    } finally {
      setSaving(false)
    }
  }

  if (step === 'cuisines') {
    return (
      <div className="p-4 space-y-6 pt-8">
        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#C4621A]" />
          <div className="w-3 h-3 rounded-full bg-[#E8D5B7]" />
        </div>

        <div>
          <h1 className="font-lora text-2xl font-bold">Welcome to Rasoi</h1>
          <p className="font-lora italic text-muted-foreground mt-1">
            Let&apos;s set up your kitchen in 2 minutes.
          </p>
        </div>

        <div>
          <p className="text-sm font-medium mb-3">What do you cook?</p>
          <p className="text-xs text-muted-foreground mb-4">
            Pick everything that applies — your pantry is built from these.
          </p>
          <div className="flex flex-wrap gap-2">
            {ALL_CUISINE_KEYS.map(cuisine => (
              <button
                key={cuisine}
                onClick={() => toggleCuisine(cuisine)}
                className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                  selectedCuisines.has(cuisine)
                    ? 'bg-[#C4621A] text-[#FDF8F0] border-[#C4621A]'
                    : 'border-[#E8D5B7] text-[#8B7355] hover:border-[#C4621A]/40'
                }`}
              >
                {CUISINE_LABELS[cuisine]}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={handleContinue} className="w-full" disabled={selectedCuisines.size === 0}>
          Continue
        </Button>
      </div>
    )
  }

  const selectedCount = pantryItems.filter(i => i.selected).length

  return (
    <div className="p-4 space-y-6 pt-8">
      {/* Progress dots */}
      <div className="flex justify-center gap-2">
        <div className="w-3 h-3 rounded-full bg-[#E8D5B7]" />
        <div className="w-3 h-3 rounded-full bg-[#C4621A]" />
      </div>

      <div>
        <h1 className="font-lora text-2xl font-bold">Your starter pantry</h1>
        <p className="font-lora italic text-muted-foreground mt-1">
          Deselect anything you don&apos;t have.
        </p>
      </div>

      <div className="space-y-5">
        {CATEGORIES.map(cat => {
          const items = pantryItems.filter(i => i.category === cat)
          if (items.length === 0) return null
          return (
            <div key={cat}>
              <p className="font-lora italic text-xs font-semibold text-[#2C1810] uppercase tracking-wide mb-2">
                {cat}
              </p>
              <div className="flex flex-wrap gap-2">
                {items.map(item => (
                  <button
                    key={item.name}
                    onClick={() => toggleItem(item.name)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      item.selected
                        ? 'bg-[#C4621A] text-[#FDF8F0] border-[#C4621A]'
                        : 'border-[#E8D5B7] text-[#8B7355] line-through hover:border-[#C4621A]/40'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="space-y-2 pb-4">
        <Button
          onClick={handleSave}
          disabled={saving || selectedCount === 0}
          className="w-full"
        >
          {saving ? 'Saving...' : `Save ${selectedCount} items to my pantry`}
        </Button>
        <button
          onClick={() => setStep('cuisines')}
          className="w-full text-sm text-[#8B7355] py-2 hover:text-foreground transition-colors"
        >
          ← Back
        </button>
      </div>
    </div>
  )
}
