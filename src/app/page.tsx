'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { saveSession } from '@/lib/session'
import { cn } from '@/lib/utils'

const TIME_OPTIONS = [15, 30, 45, 60, 90]
const CUISINE_OPTIONS = ['Anything', 'Indian', 'Italian', 'Mediterranean', 'Asian', 'Mexican']

export default function Home() {
  const router = useRouter()
  const [checked, setChecked] = useState(false)
  const [timeMinutes, setTimeMinutes] = useState<number | null>(null)
  const [healthNote, setHealthNote] = useState('')
  const [cuisine, setCuisine] = useState('Anything')
  const [cuisineOpen, setCuisineOpen] = useState(false)

  useEffect(() => {
    const onboarded = localStorage.getItem('rasoi_onboarded')
    if (!onboarded) {
      router.replace('/onboarding')
    } else {
      setChecked(true)
    }
  }, [router])

  if (!checked) {
    return null
  }

  function handleFindRecipes() {
    if (!timeMinutes) return
    saveSession({
      timeMinutes,
      healthNote: healthNote.trim() || undefined,
      cuisine: cuisine === 'Anything' ? undefined : cuisine,
    })
    router.push('/recipes')
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex w-full flex-col gap-8 px-6 py-12 max-w-md mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-1 items-center text-center pt-4">
          <span className="text-4xl">👨‍🍳</span>
          <h1 className="text-4xl font-bold tracking-tight mt-2 font-lora">Rasoi</h1>
          <p className="text-muted-foreground text-sm mt-1 font-lora italic">What are we cooking today?</p>
        </div>

        {/* Time Section */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium font-lora italic">How much time do you have?</label>
          <div className="flex flex-wrap gap-2">
            {TIME_OPTIONS.map((mins) => (
              <button
                key={mins}
                onClick={() => setTimeMinutes(mins)}
                className={cn(
                  'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                  timeMinutes === mins
                    ? 'bg-[#C4621A] text-[#FDF8F0] border-[#C4621A]'
                    : 'border-[#E8D5B7] text-[#8B7355] hover:border-[#C4621A]/40'
                )}
              >
                {mins} min
              </button>
            ))}
          </div>
        </div>

        <hr className="border-[#E8D5B7]" />

        {/* Health Note Section */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-muted-foreground font-medium font-lora italic">Any health notes?</label>
          <Input
            placeholder="e.g. feeling bloated, avoiding spicy"
            value={healthNote}
            onChange={(e) => setHealthNote(e.target.value)}
          />
        </div>

        <hr className="border-[#E8D5B7]" />

        {/* Cuisine Mood Section */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setCuisineOpen((prev) => !prev)}
            className="flex items-center justify-between text-sm font-medium w-full"
          >
            <span className="font-lora italic">
              Cuisine mood{' '}
              <span className="text-muted-foreground font-normal">— {cuisine}</span>
            </span>
            {cuisineOpen ? (
              <ChevronUp className="size-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="size-4 text-muted-foreground" />
            )}
          </button>

          {cuisineOpen && (
            <div className="flex flex-wrap gap-2 pt-1">
              {CUISINE_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => setCuisine(option)}
                  className={cn(
                    'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                    cuisine === option
                      ? 'bg-[#C4621A] text-[#FDF8F0] border-[#C4621A]'
                      : 'border-[#E8D5B7] text-[#8B7355] hover:border-[#C4621A]/40'
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Find Recipes Button */}
        <Button
          className="w-full mt-2 h-11 text-base"
          disabled={!timeMinutes}
          onClick={handleFindRecipes}
        >
          Find Recipes
        </Button>
      </main>
    </div>
  )
}
