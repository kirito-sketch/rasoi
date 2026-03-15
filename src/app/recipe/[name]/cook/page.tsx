'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { addMealHistory } from '@/lib/db/history'
import type { Recipe } from '@/lib/types'

export default function CookingModePage() {
  const router = useRouter()

  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [exitPrompt, setExitPrompt] = useState(false)

  // Load recipe from sessionStorage
  useEffect(() => {
    const raw = sessionStorage.getItem('rasoi_selected_recipe')
    const parsed: Recipe | null = raw ? JSON.parse(raw) : null
    setRecipe(parsed)
    setLoaded(true)
  }, [])

  // Wake lock to prevent screen sleep
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null

    async function requestWakeLock() {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen')
        }
      } catch {
        // Wake lock not supported — silently ignore
      }
    }

    requestWakeLock()

    return () => {
      wakeLock?.release()
    }
  }, [])

  if (!loaded) return null

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

  const totalSteps = recipe.steps.length
  const isLastStep = currentStep === totalSteps - 1
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0

  function handleNext() {
    if (isLastStep) {
      setCompleted(true)
      addMealHistory(recipe!).catch(() => {
        // Fire-and-forget — silently ignore errors
      })
    } else {
      setCurrentStep((s) => s + 1)
    }
  }

  function handlePrev() {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1)
    }
  }

  function handleCookAgain() {
    setCurrentStep(0)
    setCompleted(false)
  }

  // ── Completion screen ──────────────────────────────────────────────────
  if (completed) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center px-6 text-center gap-6 z-50">
        <CheckCircle2 className="w-20 h-20 text-primary" strokeWidth={1.5} />

        <div className="space-y-2">
          <div className="text-center">
            <p className="tracking-[0.3em] text-sm mb-2 text-primary">— ✦ —</p>
            <h2 className="font-lora italic text-3xl text-foreground">Well done!</h2>
            <p className="tracking-[0.3em] text-sm mt-2 text-primary">— ✦ —</p>
          </div>
          <p className="text-xl font-medium">{recipe.name}</p>
          <p className="text-sm text-muted-foreground">Saved to history</p>
        </div>

        <div className="w-full flex flex-col gap-3 max-w-xs">
          <Button size="lg" onClick={handleCookAgain} className="w-full">
            Cook again
          </Button>
          <Button size="lg" variant="outline" onClick={() => router.back()} className="w-full">
            Back to recipe
          </Button>
        </div>
      </div>
    )
  }

  // ── Cooking screen ──────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-background flex flex-col z-50">
      {/* Exit confirmation overlay */}
      {exitPrompt && (
        <div className="absolute inset-0 z-10 bg-background/90 flex flex-col items-center justify-center gap-4 px-8">
          <p className="font-lora text-xl font-semibold text-center">Exit cooking mode?</p>
          <p className="text-sm text-muted-foreground text-center">Your progress won&apos;t be saved.</p>
          <div className="flex gap-3 w-full max-w-xs">
            <Button variant="outline" className="flex-1" onClick={() => setExitPrompt(false)}>
              Keep cooking
            </Button>
            <Button variant="destructive" className="flex-1" onClick={() => router.back()}>
              Exit
            </Button>
          </div>
        </div>
      )}

      {/* Header */}
      <div
        className="flex items-center justify-between px-4 pb-2 shrink-0"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top, 0px))' }}
      >
        <button
          onClick={() => setExitPrompt(true)}
          aria-label="Exit cooking mode"
          className="p-2 -ml-2 rounded-full hover:bg-accent transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h2 className="text-sm font-medium font-lora italic truncate max-w-[60%] text-center">
          {recipe.name}
        </h2>

        <span className="text-sm text-muted-foreground font-medium tabular-nums">
          {currentStep + 1} / {totalSteps}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-border shrink-0">
        <div
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Cooking progress"
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step content — scrollable */}
      <div
        className="flex-1 overflow-y-auto px-6 py-8 flex flex-col justify-center"
        aria-live="polite"
        aria-atomic="true"
      >
        <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-4">
          Step {currentStep + 1}
        </p>
        <p className="text-2xl leading-relaxed font-medium font-lora">
          {recipe.steps[currentStep]}
        </p>
      </div>

      {/* Navigation — fixed at bottom */}
      <div
        className="shrink-0 px-4 pt-4 flex gap-3 border-t bg-background"
        style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom, 0px))' }}
      >
        <Button
          variant="outline"
          size="lg"
          className="flex-1"
          onClick={handlePrev}
          disabled={currentStep === 0}
        >
          Previous
        </Button>
        <Button
          size="lg"
          className="flex-1"
          onClick={handleNext}
        >
          {isLastStep ? "I'm Done!" : 'Next'}
        </Button>
      </div>
    </div>
  )
}
