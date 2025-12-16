
import { Token, WordPart, PrintSettings, DEFAULT_TYPOGRAPHY } from '@/types'

// Default font configuration (fallback)
export const FONTS = {
    base: 'Inter, system-ui, sans-serif',
    verse: 'Inter, system-ui, sans-serif',
}

interface MeasureContext {
    canvas: OffscreenCanvas | HTMLCanvasElement
    ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D
}

let measureContext: MeasureContext | null = null

function getMeasureContext(): MeasureContext {
    if (measureContext) return measureContext

    // Prefer OffscreenCanvas if available (Web Worker friendly)
    if (typeof OffscreenCanvas !== 'undefined') {
        const canvas = new OffscreenCanvas(100, 100)
        const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D
        measureContext = { canvas, ctx }
    } else {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
        measureContext = { canvas, ctx }
    }

    return measureContext!
}

/**
 * Measures a text string with a specific font style
 */
export function measureText(text: string, font: string): number {
    const { ctx } = getMeasureContext()
    ctx.font = font
    return ctx.measureText(text).width
}

/**
 * Calculates the total width of a token including all its segments.
 * For interlinear text, the width is determined by the max width of 
 * the source text or the gloss text for each segment.
 */
export function measureToken(token: Token, settings: PrintSettings): Token {
    // If we're not in a browser environment, return 0 widths (or handle gracefully)
    if (typeof window === 'undefined' && typeof OffscreenCanvas === 'undefined') {
        return token
    }

    // Use typography settings if available, otherwise fall back to defaults
    const typography = { ...DEFAULT_TYPOGRAPHY, ...settings.typography }

    // Use typography settings for font families and sizes
    const mainFont = typography.mainFont
    const glossFont = typography.glossFont
    const mainFontSize = typography.mainFontSize
    const glossFontSize = typography.glossFontSize
    const verseNumSize = typography.verseNumSize

    const fonts = {
        base: `${mainFontSize}pt ${mainFont}`,
        gloss: `${glossFontSize}pt ${glossFont}`,
        verse: `bold ${verseNumSize}pt ${mainFont}`,
    }

    if (token.type === 'verse_num') {
        // Verse numbers should be "floating" and not take up layout space
        return { ...token, width: 0 }
    }

    if (token.type === 'chapter_num') {
        // Chapter numbers are large decorative numerals
        // They take up space inline - approximately 1.5x main font size for the numeral
        const chapterFontSize = mainFontSize * 1.5
        const chapterFont = `bold ${chapterFontSize}pt ${mainFont}`
        const width = measureText(String(token.value), chapterFont) + 8 // Add padding
        return { ...token, width }
    }

    if (token.type === 'punctuation') {
        const width = measureText(token.value, fonts.base)
        return { ...token, width: width } // Same here
    }

    if (token.type === 'word') {
        const measuredParts: WordPart[] = token.parts.map((part: WordPart) => {
            const textWidth = Math.ceil(measureText(part.text, fonts.base))
            const glossWidth = Math.ceil(measureText(part.gloss, fonts.gloss))

            // The segment width is the maximum of the text or gloss
            // Adding a tiny bit of padding (e.g., 1px) can prevent tight collision
            // Rounding up is safer to avoid overflow
            const width = Math.max(textWidth, glossWidth) + 1

            return {
                ...part,
                width
            }
        })

        // Total token width is sum of parts PLUS internal spacing
        // In TypesetToken, we use 0.25em spacing between parts.
        // 1em = 12pt * 1.333 = 16px (approx). 0.25em = 4px.
        const partSpacing = 4 // 0.25em approx
        const totalGap = (measuredParts.length - 1) * partSpacing

        const totalWidth = measuredParts.reduce((sum, part) => sum + (part.width || 0), 0) + (totalGap > 0 ? totalGap : 0)

        return {
            ...token,
            parts: measuredParts,
            width: totalWidth // We need to extend the Token type union or add this to WordToken specifically
        }
    }

    return token
}

/**
 * Batch measures a list of tokens
 */
export function measureParagraph(tokens: Token[], settings: PrintSettings): Token[] {
    return tokens.map(t => measureToken(t, settings))
}
