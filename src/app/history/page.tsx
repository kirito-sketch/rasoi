'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart } from 'lucide-react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { getFavourites, removeFavourite } from '@/lib/db/favourites'
import { getMealHistory } from '@/lib/db/history'
import type { Recipe, MealHistory } from '@/lib/types'

// ── Date formatting helper ────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const date = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

// ── Favourite compact card ────────────────────────────────────────────────────

interface FavouriteCardProps {
  recipe: Recipe
  onNavigate: (recipe: Recipe) => void
  onRemove: (name: string) => void
}

function FavouriteCard({ recipe, onNavigate, onRemove }: FavouriteCardProps) {
  const [removing, setRemoving] = useState(false)

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setRemoving(true)
    try {
      await onRemove(recipe.name)
    } catch {
      setRemoving(false)
      toast.error('Could not remove favourite.')
    }
  }

  return (
    <div
      onClick={() => onNavigate(recipe)}
      className="flex-shrink-0 w-36 rounded-xl border border-[#E8D5B7] bg-[#FAF3E4] p-3 cursor-pointer hover:bg-accent/50 transition-colors relative"
    >
      {/* Remove button */}
      <button
        onClick={handleRemove}
        disabled={removing}
        aria-label="Remove from favourites"
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors"
      >
        <Heart
          className={`w-3.5 h-3.5 transition-colors ${
            removing ? 'text-muted-foreground' : 'fill-[#C4621A] text-[#C4621A]'
          }`}
        />
      </button>

      {/* Card content */}
      <p className="font-medium font-lora italic text-sm truncate pr-5 leading-snug">{recipe.name}</p>
      <p className="text-xs text-muted-foreground mt-1 truncate">{recipe.cuisine}</p>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function HistoryPage() {
  const router = useRouter()

  const [favourites, setFavourites] = useState<Recipe[]>([])
  const [history, setHistory] = useState<MealHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [favs, hist] = await Promise.all([getFavourites(), getMealHistory()])
        setFavourites(favs)
        setHistory(hist as MealHistory[])
      } catch {
        setError('Failed to load history. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleNavigate = (recipe: Recipe) => {
    sessionStorage.setItem('rasoi_selected_recipe', JSON.stringify(recipe))
    router.push(`/recipe/${encodeURIComponent(recipe.name)}`)
  }

  const handleRemoveFavourite = async (name: string) => {
    await removeFavourite(name)
    setFavourites((prev) => prev.filter((f) => f.name !== name))
  }

  // ── Loading skeletons ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="px-4 pt-6 pb-32 space-y-8">
        {/* Favourites skeleton */}
        <section>
          <Skeleton className="h-6 w-28 mb-4" />
          <div className="flex gap-3 overflow-x-auto pb-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="flex-shrink-0 w-36 h-20 rounded-xl" />
            ))}
          </div>
        </section>

        {/* Meal log skeleton */}
        <section>
          <Skeleton className="h-6 w-36 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </section>
      </div>
    )
  }

  // ── Error state ─────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="px-4 pt-6">
        <p className="text-destructive text-sm">{error}</p>
      </div>
    )
  }

  // ── Resolved ────────────────────────────────────────────────────────────────

  return (
    <div className="px-4 pt-6 pb-32 space-y-8">
      {/* ── Favourites strip ──────────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold font-lora italic mb-3">Favourites</h2>

        {favourites.length === 0 ? (
          <p className="text-sm text-[#8B7355]">No favourites yet</p>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
            {favourites.map((recipe) => (
              <FavouriteCard
                key={recipe.name}
                recipe={recipe}
                onNavigate={handleNavigate}
                onRemove={handleRemoveFavourite}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Meal log ─────────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold font-lora italic mb-3">Cooked recently</h2>

        {history.length === 0 ? (
          <p className="text-sm text-[#8B7355]">
            No meals cooked yet — start cooking!
          </p>
        ) : (
          <div className="space-y-3">
            {history.map((entry) => {
              // Prefer recipe_data fields; fall back to top-level columns
              const name = entry.recipe_data?.name ?? entry.recipe_name
              const cuisine = entry.recipe_data?.cuisine ?? entry.cuisine

              return (
                <div
                  key={entry.id}
                  onClick={() => {
                    if (entry.recipe_data) handleNavigate(entry.recipe_data)
                  }}
                  className={`flex items-center justify-between rounded-xl border border-[#E8D5B7] bg-[#FAF3E4] px-4 py-3 ${
                    entry.recipe_data ? 'cursor-pointer hover:bg-accent/50 transition-colors' : ''
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{name}</p>
                    <p className="text-xs text-[#8B7355] mt-0.5">{cuisine}</p>
                  </div>
                  <span className="text-xs text-[#8B7355] ml-4 shrink-0">
                    {formatDate(entry.cooked_at)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
