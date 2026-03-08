'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import RecipeCard from '@/components/RecipeCard'
import { loadSession } from '@/lib/session'
import { getFavourites, addFavourite, removeFavourite } from '@/lib/db/favourites'
import type { Recipe, SessionPreferences } from '@/lib/types'

export default function RecipesPage() {
  const router = useRouter()

  const [session, setSession] = useState<SessionPreferences | null>(null)
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [favourites, setFavourites] = useState<Set<string>>(new Set())

  const fetchRecipes = useCallback(async (prefs: SessionPreferences) => {
    setLoading(true)
    setError(null)

    try {
      const [favData, recipeRes] = await Promise.all([
        getFavourites(),
        fetch('/api/recipes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(prefs),
        }),
      ])

      if (!recipeRes.ok) {
        const body = await recipeRes.json().catch(() => ({}))
        throw new Error(body?.error ?? `Request failed (${recipeRes.status})`)
      }

      const recipeData: Recipe[] = await recipeRes.json()

      setFavourites(new Set(favData.map((r) => r.name)))
      setRecipes(recipeData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const prefs = loadSession()
    if (!prefs) {
      router.replace('/')
      return
    }
    setSession(prefs)
    fetchRecipes(prefs)
  }, [router, fetchRecipes])

  const handleToggleFavourite = async (recipe: Recipe) => {
    const isFav = favourites.has(recipe.name)

    // Optimistic update
    setFavourites((prev) => {
      const next = new Set(prev)
      if (isFav) {
        next.delete(recipe.name)
      } else {
        next.add(recipe.name)
      }
      return next
    })

    try {
      if (isFav) {
        await removeFavourite(recipe.name)
      } else {
        await addFavourite(recipe)
      }
    } catch {
      // Revert on error
      setFavourites((prev) => {
        const next = new Set(prev)
        if (isFav) {
          next.add(recipe.name)
        } else {
          next.delete(recipe.name)
        }
        return next
      })
      toast.error('Could not update favourites.')
    }
  }

  // ── Loading state ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="px-4 pt-6 space-y-4">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-32" />
        <div className="space-y-4 mt-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-44 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  // ── Error state ────────────────────────────────────────────────
  if (error) {
    return (
      <div className="px-4 pt-6 space-y-4">
        <p className="text-destructive text-sm">{error}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          {session && (
            <Button size="sm" onClick={() => fetchRecipes(session)}>
              Try again
            </Button>
          )}
        </div>
      </div>
    )
  }

  // ── Main render ────────────────────────────────────────────────
  const subtitleParts: string[] = []
  if (session?.timeMinutes) subtitleParts.push(`Ready in ${session.timeMinutes} min`)
  if (session?.cuisine) subtitleParts.push(session.cuisine)

  return (
    <div className="px-4 pt-6 pb-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">Recipes for you</h1>
        {subtitleParts.length > 0 && (
          <p className="text-sm text-muted-foreground mt-0.5">
            {subtitleParts.join(' · ')}
          </p>
        )}
      </div>

      {/* Recipe cards */}
      <div className="space-y-4">
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.name}
            recipe={recipe}
            isFavourite={favourites.has(recipe.name)}
            onToggleFavourite={handleToggleFavourite}
          />
        ))}
      </div>
    </div>
  )
}
