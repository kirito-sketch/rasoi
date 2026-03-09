'use client'

import Link from 'next/link'
import { Heart, Clock } from 'lucide-react'
import { TornEdge } from '@/components/ui/TornEdge'
import type { Recipe } from '@/lib/types'

interface Props {
  recipe: Recipe
  isFavourite: boolean
  onToggleFavourite: (recipe: Recipe) => void
  onSelect?: (recipe: Recipe) => void
}

export default function RecipeCard({ recipe, isFavourite, onToggleFavourite, onSelect }: Props) {
  const encodedName = encodeURIComponent(recipe.name)

  return (
    <div
      className="relative"
      style={{ filter: 'url(#grain)' }}
    >
      {/* Corner fold — top right dog-ear */}
      <div
        className="absolute top-0 right-0 z-10 w-0 h-0 pointer-events-none"
        style={{
          borderStyle: 'solid',
          borderWidth: '28px 28px 0 0',
          borderColor: '#E8D5B7 transparent transparent transparent',
          filter: 'drop-shadow(-2px 2px 3px rgba(44,24,16,0.18))',
        }}
        aria-hidden="true"
      />

      {/* Favourite button — above fold, offset left of corner */}
      <button
        onClick={e => {
          e.preventDefault()
          e.stopPropagation()
          onToggleFavourite(recipe)
        }}
        className="absolute top-3 right-9 z-20 p-1.5 rounded-full transition-transform active:scale-90"
        aria-label={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
      >
        <Heart
          size={18}
          className={isFavourite ? 'fill-[#C4621A] text-[#C4621A]' : 'text-[#8B7355]'}
        />
      </button>

      {/* Card body */}
      <div
        className="relative rounded-xl overflow-hidden cursor-pointer"
        style={{
          backgroundColor: '#F5EDD8',
          border: '1px solid #E8D5B7',
          boxShadow: '2px 4px 16px rgba(196,98,26,0.12)',
          transition: 'transform 200ms ease, box-shadow 200ms ease',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.transform = 'translateY(-2px)'
          el.style.boxShadow = '3px 6px 24px rgba(196,98,26,0.2)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.transform = 'translateY(0)'
          el.style.boxShadow = '2px 4px 16px rgba(196,98,26,0.12)'
        }}
      >
        <Link
          href={`/recipe/${encodedName}`}
          onClick={() => onSelect?.(recipe)}
          className="block p-5 pr-12 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C4621A] rounded-t-xl"
        >
          {/* Cuisine stamp */}
          {recipe.cuisine && (
            <p
              className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-2"
              style={{ color: '#C4621A' }}
            >
              {recipe.cuisine}
            </p>
          )}

          {/* Recipe name — Lora italic */}
          <h3
            className="font-lora italic text-xl leading-snug mb-2"
            style={{ color: '#2C1810' }}
          >
            {recipe.name}
          </h3>

          {/* Warm rule */}
          <div
            className="mb-3"
            style={{ height: '1px', width: '60%', backgroundColor: 'rgba(196,98,26,0.3)' }}
          />

          {/* Description */}
          <p
            className="text-sm leading-relaxed line-clamp-2 mb-4"
            style={{ color: '#8B7355' }}
          >
            {recipe.description}
          </p>

          {/* Stats row — small caps, no badges */}
          <div
            className="flex items-center gap-3 text-xs"
            style={{ color: '#8B7355', fontVariant: 'small-caps', letterSpacing: '0.05em' }}
          >
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {recipe.total_time_mins} min
            </span>
            {recipe.difficulty && <span>{recipe.difficulty}</span>}
            {recipe.servings && <span>{recipe.servings} servings</span>}
          </div>
        </Link>

        {/* Torn bottom edge */}
        <TornEdge fill="#F5EDD8" />
      </div>
    </div>
  )
}
