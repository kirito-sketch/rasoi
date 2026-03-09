'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Heart, Clock, ShoppingBag, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getFavourites, addFavourite, removeFavourite } from '@/lib/db/favourites'
import type { Recipe } from '@/lib/types'

export default function RecipeDetailPage() {
  const router = useRouter()

  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [isFavourite, setIsFavourite] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem('rasoi_selected_recipe')
    const parsed: Recipe | null = raw ? JSON.parse(raw) : null
    setRecipe(parsed)

    if (parsed) {
      getFavourites()
        .then((favs) => {
          setIsFavourite(favs.some((f) => f.name === parsed.name))
        })
        .catch(() => {
          // Non-critical — ignore
        })
    }

    setLoaded(true)
  }, [])

  const handleToggleFavourite = async () => {
    if (!recipe) return

    const wasFav = isFavourite
    setIsFavourite(!wasFav)

    try {
      if (wasFav) {
        await removeFavourite(recipe.name)
      } else {
        await addFavourite(recipe)
      }
    } catch {
      setIsFavourite(wasFav)
      toast.error('Could not update favourites.')
    }
  }

  // Still loading from sessionStorage
  if (!loaded) return null

  // No recipe found (direct URL access)
  if (!recipe) {
    return (
      <div className="px-4 pt-6 space-y-4">
        <p className="text-muted-foreground">Recipe not found.</p>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
      </div>
    )
  }

  const encodedName = encodeURIComponent(recipe.name)
  const missingCount = recipe.ingredients.filter((i) => !i.is_staple).length

  return (
    <div className="pb-32">
      {/* ── Header bar ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-6 pb-2">
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          className="p-2 -ml-2 rounded-full hover:bg-[#F0E6D3] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <button
          onClick={handleToggleFavourite}
          aria-label={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
          className="p-2 -mr-2 rounded-full hover:bg-accent transition-colors"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              isFavourite ? 'fill-[#C4621A] text-[#C4621A]' : 'text-[#8B7355]'
            }`}
          />
        </button>
      </div>

      {/* ── Recipe name ─────────────────────────────────────────── */}
      <div className="px-4 space-y-3">
        <h1 className="text-2xl font-bold leading-tight font-lora italic">{recipe.name}</h1>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: '#8B7355' }}>
            {recipe.cuisine}
          </span>
          <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: '#8B7355' }}>
            {recipe.difficulty}
          </span>
          <span className="flex items-center gap-1 text-sm text-[#8B7355]">
            <Clock className="w-4 h-4 shrink-0 text-[#8B7355]" />
            {recipe.total_time_mins} min
          </span>
        </div>

        {/* Health highlight pill */}
        {recipe.health_highlight && (
          <span className="inline-block text-xs bg-[#C4621A]/10 text-[#C4621A] rounded-full px-3 py-1">
            {recipe.health_highlight}
          </span>
        )}

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">{recipe.description}</p>
      </div>

      {/* ── Ingredients ─────────────────────────────────────────── */}
      <section className="px-4 mt-6">
        <h2 className="text-lg font-semibold mb-3 font-lora italic">Ingredients</h2>

        {missingCount > 0 && (
          <p className="text-xs text-[#8B7355] mb-3">
            Missing {missingCount} ingredient{missingCount > 1 ? 's' : ''} — check substitutions
            below
          </p>
        )}

        <ul className="space-y-2">
          {recipe.ingredients.map((ing, idx) => (
            <li
              key={idx}
              className={`flex items-center gap-2 text-sm ${
                ing.is_staple ? '' : 'text-muted-foreground'
              }`}
            >
              {ing.is_staple ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#C4621A]" />
              ) : (
                <ShoppingBag className="w-4 h-4 shrink-0 text-muted-foreground" />
              )}
              <span className="font-medium">{ing.amount}</span>
              <span>{ing.name}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Steps ───────────────────────────────────────────────── */}
      <section className="px-4 mt-6">
        <h2 className="text-lg font-semibold mb-3 font-lora italic">Steps</h2>

        <div className="space-y-3">
          {recipe.steps.map((step, idx) => (
            <div key={idx} className="flex gap-3">
              {/* Step number circle */}
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#C4621A] text-[#FDF8F0] text-xs font-bold flex items-center justify-center mt-0.5">
                {idx + 1}
              </div>
              <Card className="flex-1">
                <CardContent className="p-3">
                  <p className="text-sm leading-relaxed">{step}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* ── Substitutions ───────────────────────────────────────── */}
      {recipe.substitutions && recipe.substitutions.length > 0 && (
        <section className="px-4 mt-6">
          <h2 className="text-lg font-semibold mb-3 font-lora italic">Substitutions</h2>

          <div className="space-y-2">
            {recipe.substitutions.map((sub, idx) => (
              <div key={idx} className="text-sm">
                <span className="font-medium">{sub.original}</span>
                <span className="text-muted-foreground mx-1">→</span>
                <span>{sub.substitute}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Nutrition note ──────────────────────────────────────── */}
      {(recipe.estimated_protein || recipe.estimated_carbs || recipe.estimated_fat) && (
        <section className="px-4 mt-6">
          <h2 className="text-lg font-semibold mb-3 font-lora italic">Nutrition note</h2>

          <div className="flex flex-wrap gap-4 text-sm">
            {recipe.estimated_protein > 0 && (
              <div className="text-center">
                <p className="font-semibold">{recipe.estimated_protein}g</p>
                <p className="text-xs text-muted-foreground">Protein</p>
              </div>
            )}
            {recipe.estimated_carbs > 0 && (
              <div className="text-center">
                <p className="font-semibold">{recipe.estimated_carbs}g</p>
                <p className="text-xs text-muted-foreground">Carbs</p>
              </div>
            )}
            {recipe.estimated_fat > 0 && (
              <div className="text-center">
                <p className="font-semibold">{recipe.estimated_fat}g</p>
                <p className="text-xs text-muted-foreground">Fat</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Tips ────────────────────────────────────────────────── */}
      {recipe.tips && recipe.tips.length > 0 && (
        <section className="px-4 mt-6">
          <h2 className="text-lg font-semibold mb-3 font-lora italic">Tips</h2>
          <ul className="space-y-1.5">
            {recipe.tips.map((tip, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                <span className="text-primary font-bold">·</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Start Cooking button ─────────────────────────────────── */}
      <div className="fixed bottom-20 left-0 right-0 px-4 z-20">
        <Button
          className="w-full"
          size="lg"
          onClick={() => router.push(`/recipe/${encodedName}/cook`)}
        >
          Start Cooking
        </Button>
      </div>
    </div>
  )
}
