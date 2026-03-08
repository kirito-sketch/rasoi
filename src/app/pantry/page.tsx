'use client'

import { useCallback, useEffect, useState } from 'react'
import { Camera } from 'lucide-react'
import { getStaples, clearFreshIngredients, addStaple } from '@/lib/db/staples'
import type { Category, Staple } from '@/lib/types'
import { StapleCard } from '@/components/StapleCard'
import { AddIngredientSheet } from '@/components/AddIngredientSheet'
import { CameraScanner } from '@/components/CameraScanner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

const CATEGORIES: Category[] = [
  'Grains & Lentils',
  'Pasta & Dry Goods',
  'Spices & Tempering',
  'Oils & Condiments',
  'Fridge',
]

export default function PantryPage() {
  const [staples, setStaples] = useState<Staple[]>([])
  const [loading, setLoading] = useState(true)
  const [clearing, setClearing] = useState(false)
  const [showScanner, setShowScanner] = useState(false)

  const reload = useCallback(async () => {
    try {
      const data = await getStaples()
      setStaples(data)
    } catch {
      // Supabase not configured — show empty state
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  async function handleClearFresh() {
    if (!confirm('Clear all fresh ingredients?')) return
    setClearing(true)
    try {
      await clearFreshIngredients()
      await reload()
    } finally {
      setClearing(false)
    }
  }

  const permanentStaples = staples.filter(s => s.item_type === 'staple')
  const freshItems = staples.filter(
    s => s.item_type === 'fresh' || s.item_type === 'leftover'
  )

  async function handleScanComplete(ingredients: string[]) {
    await Promise.all(
      ingredients.map(name => addStaple(name, 'Fridge', 'fresh'))
    )
    await reload()
    setShowScanner(false)
    toast.success(`Added ${ingredients.length} ingredient${ingredients.length !== 1 ? 's' : ''}`)
  }

  return (
    <div className="p-4 space-y-4">
      {showScanner && (
        <CameraScanner
          onComplete={handleScanComplete}
          onClose={() => setShowScanner(false)}
        />
      )}
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-2xl font-bold">Pantry</h1>
        <Button variant="outline" size="sm" onClick={() => setShowScanner(true)}>
          <Camera size={15} className="mr-1" />
          Scan
        </Button>
      </div>

      <Tabs defaultValue="staples">
        <TabsList className="w-full">
          <TabsTrigger value="staples" className="flex-1">
            Staples
          </TabsTrigger>
          <TabsTrigger value="fresh" className="flex-1">
            Fresh / Today
            {freshItems.length > 0 && (
              <span className="ml-1.5 text-xs bg-foreground text-background rounded-full px-1.5">
                {freshItems.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="staples" className="space-y-5 mt-4">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <>
              {CATEGORIES.map(cat => {
                const items = permanentStaples.filter(s => s.category === cat)
                if (items.length === 0) return null
                return (
                  <div key={cat}>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      {cat}
                    </p>
                    <div className="space-y-1.5">
                      {items.map(s => (
                        <StapleCard key={s.id} staple={s} onChange={reload} />
                      ))}
                    </div>
                  </div>
                )
              })}
              {permanentStaples.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No staples yet. Complete onboarding or add items manually.
                </p>
              )}
              <AddIngredientSheet type="staple" onAdded={reload} />
            </>
          )}
        </TabsContent>

        <TabsContent value="fresh" className="space-y-3 mt-4">
          {loading ? (
            <Skeleton className="h-12 w-full rounded-lg" />
          ) : (
            <>
              {freshItems.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nothing added yet today. Add what you bought or have fresh.
                </p>
              )}
              {freshItems.map(s => (
                <StapleCard key={s.id} staple={s} onChange={reload} />
              ))}
              <AddIngredientSheet type="fresh" onAdded={reload} />
              {freshItems.length > 0 && (
                <button
                  onClick={handleClearFresh}
                  disabled={clearing}
                  className="w-full text-sm text-muted-foreground py-2 hover:text-destructive transition-colors"
                >
                  {clearing ? 'Clearing...' : 'Clear today\'s fresh items'}
                </button>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
