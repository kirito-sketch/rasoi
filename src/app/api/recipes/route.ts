import { NextRequest, NextResponse } from 'next/server'
import { getStaples } from '@/lib/db/staples'
import { getUtensils } from '@/lib/db/utensils'
import { buildRecipePrompt } from '@/lib/prompts'
import type { SessionPreferences, Recipe } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { preferences }: { preferences: SessionPreferences } = body

    if (!preferences || typeof preferences.timeMinutes !== 'number' || preferences.timeMinutes <= 0) {
      return NextResponse.json(
        { error: 'preferences with a valid timeMinutes is required' },
        { status: 400 }
      )
    }

    const [staples, utensils] = await Promise.all([getStaples(), getUtensils()])

    const prompt = buildRecipePrompt(staples, preferences, utensils)

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 4096,
      }),
    })

    if (!groqResponse.ok) {
      const errText = await groqResponse.text()
      return NextResponse.json({ error: errText }, { status: 500 })
    }

    const groqData = await groqResponse.json()
    const content: string = groqData.choices?.[0]?.message?.content ?? ''

    const match = content.match(/\[[\s\S]*\]/)
    if (!match) {
      return NextResponse.json({ error: 'Failed to parse recipe response from AI' }, { status: 500 })
    }

    const recipes: Recipe[] = JSON.parse(match[0])

    return NextResponse.json({ recipes })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
