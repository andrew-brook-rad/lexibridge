import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { Chapter, Token, TranslateRequest, TranslateResponse } from '@/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const SYSTEM_PROMPT = `You are a Biblical Interlinear Generator.

Your task is to process German biblical text and produce a morphologically-analyzed interlinear translation.

RULES:
1. Respect Verse Numbers: Return them as distinct objects with type "verse_num" and value being the number string.
2. Morphology: Split complex German compound words into roots for line-breaking.
   - Example: "Handschuh" -> parts: [{text: "Hand", gloss: "HAND"}, {text: "schuh", gloss: "SHOE"}]
   - Example: "Unterschied" -> parts: [{text: "Unter", gloss: "UNDER"}, {text: "schied", gloss: "DIFFERENCE"}]
   - Example: "Finsternis" -> parts: [{text: "Finster", gloss: "DARK"}, {text: "nis", gloss: "NESS"}]
   - Example for ge- prefix: "geschah" -> parts: [{text: "ge", gloss: "PAST"}, {text: "schah", gloss: "HAPPENED"}]
   - Example for three-part compound: "Unabhängigkeit" -> parts: [{text: "Un", gloss: "UN"}, {text: "abhängig", gloss: "DEPENDENT"}, {text: "keit", gloss: "NESS"}]
   - Simple words should NOT be split, just have a single part.
3. Gloss: Provide literal UPPERCASE English translations for each part.
4. Punctuation: Keep punctuation as separate tokens with type "punctuation".
5. Paragraphs:
   - The input text may contain [PARAGRAPH_BREAK] markers indicating where paragraph breaks should occur.
   - Each paragraph should be a separate array in the "paragraphs" array.
   - Text before the first [PARAGRAPH_BREAK] is paragraph 1, text between [PARAGRAPH_BREAK] markers are subsequent paragraphs.
   - If NO [PARAGRAPH_BREAK] markers are present, suggest natural paragraph breaks based on narrative flow (roughly every 3-5 verses).

OUTPUT FORMAT:
Return a JSON object with this exact structure:
{
  "number": <chapter_number>,
  "paragraphs": [
    [
      {"type": "verse_num", "value": "1"},
      {"type": "word", "original_full": "Am", "parts": [{"text": "Am", "gloss": "IN"}]},
      {"type": "word", "original_full": "Anfang", "parts": [{"text": "Anfang", "gloss": "BEGINNING"}]},
      {"type": "punctuation", "value": "."}
    ]
  ]
}

IMPORTANT:
- Every word must have type "word" with original_full (the full word) and parts array
- Simple words have ONE part with text = original_full
- Compound words have MULTIPLE parts that when concatenated equal original_full
- Verse numbers at the start of verses (e.g., "1 Am Anfang") should be separate tokens
- Keep all punctuation (. , ; : ! ?) as separate punctuation tokens`

// Preprocess text to detect paragraph markers
function preprocessText(text: string): string {
  let processed = text

  // Replace ¶ symbol with [PARAGRAPH_BREAK]
  processed = processed.replace(/¶/g, '[PARAGRAPH_BREAK]')

  // Replace double newlines (with optional whitespace between) with [PARAGRAPH_BREAK]
  processed = processed.replace(/\n\s*\n/g, ' [PARAGRAPH_BREAK] ')

  // Clean up extra whitespace
  processed = processed.replace(/\s+/g, ' ').trim()

  return processed
}

export async function POST(request: NextRequest) {
  try {
    const body: TranslateRequest = await request.json()
    const { text, chapterNumber = 1 } = body

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // Preprocess text to convert paragraph markers
    const processedText = preprocessText(text)

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Process this German biblical text (Chapter ${chapterNumber}):\n\n${processedText}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 16384,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      return NextResponse.json(
        { error: 'No response from OpenAI' },
        { status: 500 }
      )
    }

    let chapter: Chapter
    try {
      chapter = JSON.parse(content)
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError)
      console.error('Raw content (first 500 chars):', content.substring(0, 500))
      console.error('Raw content (last 500 chars):', content.substring(content.length - 500))
      return NextResponse.json(
        { error: 'Failed to parse AI response as JSON. The response may have been truncated.' },
        { status: 500 }
      )
    }

    // Validate the response structure
    if (!chapter.paragraphs || !Array.isArray(chapter.paragraphs)) {
      return NextResponse.json(
        { error: 'Invalid response structure from AI' },
        { status: 500 }
      )
    }

    const response: TranslateResponse = {
      chapter: {
        number: chapterNumber,
        paragraphs: chapter.paragraphs,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Translation failed' },
      { status: 500 }
    )
  }
}
