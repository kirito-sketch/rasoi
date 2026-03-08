import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { imageBase64 } = await req.json()

    if (!imageBase64) {
      return NextResponse.json({ error: 'imageBase64 is required' }, { status: 400 })
    }

    const prompt =
      'You are a kitchen ingredient scanner. Look at this image and list only the food ingredients you can see. Return ONLY a JSON array of ingredient names, nothing else. Example: ["tomatoes", "onions", "garlic"]'

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                },
              },
              {
                type: 'text',
                text: prompt,
              },
            ],
          },
        ],
        max_tokens: 500,
      }),
    })

    if (!groqResponse.ok) {
      const errText = await groqResponse.text()
      return NextResponse.json({ error: errText }, { status: 500 })
    }

    const groqData = await groqResponse.json()
    const content: string = groqData.choices?.[0]?.message?.content ?? '[]'

    const match = content.match(/\[[\s\S]*\]/)
    if (!match) {
      return NextResponse.json({ ingredients: [] })
    }

    const ingredients: string[] = JSON.parse(match[0])
    return NextResponse.json({ ingredients })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
