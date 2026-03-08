'use client'

import Link from 'next/link'
import { Heart, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Recipe } from '@/lib/types'

interface Props {
  recipe: Recipe
  isFavourite: boolean
  onToggleFavourite: (recipe: Recipe) => void
}

export default function RecipeCard({ recipe, isFavourite, onToggleFavourite }: Props) {
  const encodedName = encodeURIComponent(recipe.name)

  return (
    <Card className="relative overflow-hidden">
      {/* Heart button — outside the Link so it doesn't trigger navigation */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggleFavourite(recipe)
        }}
        aria-label={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
        className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
      >
        <Heart
          className={`w-5 h-5 transition-colors ${
            isFavourite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
          }`}
        />
      </button>

      {/* Clickable card body */}
      <Link href={`/recipe/${encodedName}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-[inherit]">
        <CardContent className="p-4 pr-12">
          {/* Name */}
          <h3 className="font-bold text-base leading-snug mb-2 pr-1">{recipe.name}</h3>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            <Badge variant="secondary">{recipe.cuisine}</Badge>
            <Badge
              variant={recipe.difficulty === 'Easy' ? 'outline' : 'secondary'}
            >
              {recipe.difficulty}
            </Badge>
          </div>

          {/* Time */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
            <Clock className="w-4 h-4 shrink-0" />
            <span>{recipe.total_time_mins} min</span>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {recipe.description}
          </p>

          {/* Tags — health highlight acts as a tag */}
          {recipe.health_highlight && (
            <div className="flex flex-wrap gap-1">
              <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
                {recipe.health_highlight}
              </span>
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  )
}
