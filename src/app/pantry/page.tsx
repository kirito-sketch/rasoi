'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

const CATEGORIES: Category[] = [
  'Grains & Lentils',
  'Pasta & Dry Goods',
  'Spices & Tempering',
  'Oils & Condiments',
  'Fridge',
]

export default function PantryPage() {
  const router = useRouter()
  const [staples, setStaples] = useState<Staple[]>([])
  const [loading, setLoading] = useState(true)
  const [clearing, setClearing] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [loadError, setLoadError] = useState(false)

  const reload = useCallback(async () => {
    setLoadError(false)
    try {
      const data = await getStaples()
      setStaples(data)
    } catch {
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  async function handleClearFresh() {
    setClearing(true)
    try {
      await clearFreshIngredients()
      await reload()
    } finally {
      setClearing(false)
      setShowClearDialog(false)
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
        <h1 className="text-2xl font-bold font-lora">Pantry</h1>
        <Button variant="outline" size="sm" onClick={() => setShowScanner(true)} className="border-primary text-primary hover:bg-primary/10">
          <Camera size={15} className="mr-1" />
          Scan
        </Button>
      </div>

      <Tabs defaultValue="staples">
        <TabsList className="w-full">
          <TabsTrigger value="staples" className="flex-1 data-[state=active]:text-primary">
            Staples
          </TabsTrigger>
          <TabsTrigger value="fresh" className="flex-1 data-[state=active]:text-primary">
            Fresh / Today
            {freshItems.length > 0 && (
              <span className="ml-1.5 text-xs bg-primary text-primary-foreground rounded-full px-1.5">
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
          ) : loadError ? (
            <div className="space-y-2">
              <p className="text-sm text-destructive">Failed to load pantry. Please try again.</p>
              <Button size="sm" variant="outline" onClick={reload}>Try again</Button>
            </div>
          ) : (
            <>
              {CATEGORIES.map(cat => {
                const items = permanentStaples.filter(s => s.category === cat)
                if (items.length === 0) return null
                return (
                  <div key={cat}>
                    <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2 font-lora italic">
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
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">No staples yet.</p>
                  <Button variant="outline" size="sm" onClick={() => router.push('/onboarding')}>
                    Set up your pantry
                  </Button>
                </div>
              )}
              <AddIngredientSheet type="staple" onAdded={reload} />
            </>
          )}
        </TabsContent>

        <TabsContent value="fresh" className="space-y-3 mt-4">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : loadError ? (
            <div className="space-y-2">
              <p className="text-sm text-destructive">Failed to load. Please try again.</p>
              <Button size="sm" variant="outline" onClick={reload}>Try again</Button>
            </div>
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
                  onClick={() => setShowClearDialog(true)}
                  className="w-full text-sm text-primary/70 py-2 hover:text-primary transition-colors"
                >
                  Clear today&apos;s fresh items
                </button>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* ── Clear fresh confirmation dialog ─────────────────────────────── */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Clear fresh items?</DialogTitle>
            <DialogDescription>
              This will remove all of today&apos;s fresh ingredients. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearFresh} disabled={clearing}>
              {clearing ? 'Clearing…' : 'Clear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
