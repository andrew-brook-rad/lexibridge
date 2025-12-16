
import { Token, Line, Page, PrintSettings, WordToken, WordPart, Chapter, ChapterNumToken, PAGE_SIZES } from '@/types'
import { measureParagraph, measureText, FONTS } from './measure'

interface LayoutContext {
    maxWidth: number
    settings: PrintSettings
}

/**
 * Minimum acceptable space width between words (in pixels)
 */
const MIN_SPACE_WIDTH = 6

/**
 * Maximum acceptable space width between words (in pixels)
 * If spacing would exceed this, we should try to fit more on the line
 */
const MAX_SPACE_WIDTH = 20

/**
 * Breaks a list of tokens into fully justified lines with equal spacing
 */
export function layoutParagraph(tokens: Token[], context: LayoutContext): Line[] {
    const { maxWidth, settings } = context
    const measuredTokens = measureParagraph(tokens, settings)

    const lines: Line[] = []
    let currentLineTokens: { token: Token, width: number, marginRight: number }[] = []
    let currentContentWidth = 0 // Width of tokens only, no spacing

    // Process tokens, potentially splitting wide ones
    let i = 0
    while (i < measuredTokens.length) {
        const token = measuredTokens[i]
        const tokenWidth = token.width || 0

        const isPunctuation = token.type === 'punctuation'
        const isVerseNum = token.type === 'verse_num'
        const isChapterNum = token.type === 'chapter_num'

        // Force a new line when we encounter a chapter number (unless line is empty)
        if (isChapterNum && currentLineTokens.length > 0) {
            // Justify and push the current line
            const justifiedLine = justifyLineEqual(currentLineTokens, maxWidth)
            lines.push(justifiedLine)
            // Start fresh line with the chapter token
            currentLineTokens = []
            currentContentWidth = 0
        }

        // For fitting check: estimate with minimum spacing
        // Chapter numbers get spacing before them (like words), but verse numbers don't
        const wordCount = currentLineTokens.filter(t => t.token.type === 'word' || t.token.type === 'chapter_num').length
        const minSpacingNeeded = (isPunctuation || isVerseNum) ? 0 : (wordCount > 0 ? MIN_SPACE_WIDTH : 0)

        const potentialWidth = currentContentWidth + minSpacingNeeded + tokenWidth

        if (potentialWidth <= maxWidth || currentLineTokens.length === 0) {
            // It fits (or we must add it because line is empty)
            currentLineTokens.push({
                token,
                width: tokenWidth,
                marginRight: 0
            })
            currentContentWidth += tokenWidth
            i++
        } else {
            // It doesn't fit - we need to break to a new line

            // Check if the last token(s) on the current line are verse numbers
            // If so, move them to the new line so they stay with their word
            const tokensToMove: { token: Token, width: number, marginRight: number }[] = []
            while (currentLineTokens.length > 0 &&
                   currentLineTokens[currentLineTokens.length - 1].token.type === 'verse_num') {
                const verseToken = currentLineTokens.pop()!
                tokensToMove.unshift(verseToken)
                currentContentWidth -= verseToken.width
            }

            // Justify the current line with equal spacing
            if (currentLineTokens.length > 0) {
                const justifiedLine = justifyLineEqual(currentLineTokens, maxWidth)
                lines.push(justifiedLine)
            }

            // Check if this token itself is too wide for a line
            // If so, try to split it at morpheme boundaries
            if (tokenWidth > maxWidth && token.type === 'word') {
                const splitTokens = splitWideToken(token, maxWidth, settings)
                if (splitTokens.length > 1) {
                    // Replace current token with split versions in the queue
                    // We need to re-measure the split tokens
                    const measuredSplit = measureParagraph(splitTokens, settings)
                    measuredTokens.splice(i, 1, ...measuredSplit)
                    // Don't increment i - process the first split token next
                    // Start new line with any verse numbers we moved
                    currentLineTokens = [...tokensToMove]
                    currentContentWidth = tokensToMove.reduce((sum, t) => sum + t.width, 0)
                    continue
                }
            }

            // Start new line with moved verse numbers plus current token
            currentLineTokens = [
                ...tokensToMove,
                {
                    token,
                    width: tokenWidth,
                    marginRight: 0
                }
            ]
            currentContentWidth = tokensToMove.reduce((sum, t) => sum + t.width, 0) + tokenWidth
            i++
        }
    }

    // Handle the last line (flush left with minimum spacing)
    if (currentLineTokens.length > 0) {
        const lastLine = applyMinimumSpacing(currentLineTokens)
        lines.push(lastLine)
    }

    return lines
}

/**
 * Apply minimum spacing to a line (for last line - flush left)
 */
function applyMinimumSpacing(
    lineTokens: { token: Token, width: number, marginRight: number }[]
): Line {
    const tokenCount = lineTokens.length
    let totalWidth = 0

    const spacedTokens = lineTokens.map((t, index) => {
        totalWidth += t.width

        // Last token gets no margin
        if (index === tokenCount - 1) {
            return { ...t, marginRight: 0 }
        }

        // Verse numbers don't get margin (they attach to following word)
        if (t.token.type === 'verse_num') {
            return { ...t, marginRight: 0 }
        }

        // Check if next token is punctuation or verse number
        const nextToken = lineTokens[index + 1]
        if (nextToken.token.type === 'punctuation' || nextToken.token.type === 'verse_num') {
            return { ...t, marginRight: 0 }
        }

        // Apply minimum spacing
        totalWidth += MIN_SPACE_WIDTH
        return { ...t, marginRight: MIN_SPACE_WIDTH }
    })

    return {
        tokens: spacedTokens,
        width: totalWidth,
        justifySpacing: 0
    }
}

/**
 * Distributes space EQUALLY among all word gaps in a line
 */
function justifyLineEqual(
    lineTokens: { token: Token, width: number, marginRight: number }[],
    maxWidth: number
): Line {
    const tokenCount = lineTokens.length

    // If only one token, left align it
    if (tokenCount <= 1) {
        const width = lineTokens.reduce((sum, t) => sum + t.width, 0)
        return {
            tokens: lineTokens,
            width
        }
    }

    // Calculate total content width (just tokens, no spacing)
    const contentWidth = lineTokens.reduce((sum, t) => sum + t.width, 0)

    // Count expandable gaps (gaps between words, not before punctuation or verse numbers)
    // Verse numbers should attach to the following word without extra space
    const expandableIndices: number[] = []

    lineTokens.forEach((t, index) => {
        // Last token never has right margin
        if (index === tokenCount - 1) return

        // Verse numbers don't get margin (they attach to following word)
        if (t.token.type === 'verse_num') return

        // Check next token - don't add space before punctuation or verse numbers
        const nextToken = lineTokens[index + 1]
        if (nextToken.token.type === 'punctuation' || nextToken.token.type === 'verse_num') return

        expandableIndices.push(index)
    })

    const gapCount = expandableIndices.length

    if (gapCount === 0) {
        // No gaps to expand (e.g., all punctuation) - return as-is
        return {
            tokens: lineTokens,
            width: contentWidth
        }
    }

    // Calculate equal spacing for all gaps
    const totalSpaceAvailable = maxWidth - contentWidth
    const spacePerGap = totalSpaceAvailable / gapCount

    // Apply equal spacing to all expandable gaps
    const justifiedTokens = lineTokens.map((t, index) => {
        if (expandableIndices.includes(index)) {
            return {
                ...t,
                marginRight: spacePerGap
            }
        }
        return { ...t, marginRight: 0 }
    })

    return {
        tokens: justifiedTokens,
        width: maxWidth
    }
}

/**
 * Check if a word token is too wide and should be split into parts
 * Returns the token as-is if it fits, or an array of part-tokens if it needs splitting
 */
function splitWideToken(
    token: Token,
    maxWidth: number,
    settings: PrintSettings
): Token[] {
    // Only split word tokens
    if (token.type !== 'word') {
        return [token]
    }

    const wordToken = token as WordToken
    const tokenWidth = wordToken.width || 0

    // If it fits, return as-is
    if (tokenWidth <= maxWidth) {
        return [token]
    }

    // If it has multiple parts, we can split at part boundaries
    if (wordToken.parts.length <= 1) {
        // Single part word that's too wide - we can't split it further
        // Just return it and let it overflow
        return [token]
    }

    // Split into individual parts, each becoming its own word token
    // Add hyphen indicator to all but the last part
    const splitTokens: Token[] = []

    for (let i = 0; i < wordToken.parts.length; i++) {
        const part = wordToken.parts[i]
        const isLast = i === wordToken.parts.length - 1

        // Create a new word token for this part
        const partToken: WordToken = {
            type: 'word',
            original_full: wordToken.original_full,
            parts: [{
                text: isLast ? part.text : part.text + '-', // Add hyphen for continuation
                gloss: part.gloss,
                width: part.width
            }],
            width: part.width
        }

        splitTokens.push(partToken)
    }

    return splitTokens
}

/**
 * Layout all chapters into pages with inline chapter numbers
 * Chapters flow continuously with decorative chapter numerals inline
 */
export function layoutBook(chapters: Chapter[], settings: PrintSettings): Page[] {
    // Convert inches to pixels (approximate for screen, usage dependent)
    // For print, we assume 96 DPI usually for CSS
    const dpi = 96

    // Get page dimensions from PAGE_SIZES constant (same as PDF generator)
    const pageDimensions = settings.pageSize === 'custom'
        ? { width: settings.customWidth || 6, height: settings.customHeight || 9 }
        : PAGE_SIZES[settings.pageSize] || PAGE_SIZES['6x9']

    const pageWidthPx = pageDimensions.width * dpi
    const pageHeightPx = pageDimensions.height * dpi

    const marginInnerPx = settings.margins.inner * dpi
    const marginOuterPx = settings.margins.outer * dpi
    const marginTopPx = settings.margins.top * dpi
    const marginBottomPx = settings.margins.bottom * dpi

    // Deduct a safety buffer to account for sub-pixel rendering differences and font mismatches
    const safetyBufferPx = 0.15 * dpi

    const contentWidth = pageWidthPx - marginInnerPx - marginOuterPx - safetyBufferPx
    const contentHeight = pageHeightPx - marginTopPx - marginBottomPx

    // Calculate line height in pixels
    const typography = settings.typography
    const lineHeightMultiplier = typography?.lineHeight || 2.4
    const mainFontSize = typography?.mainFontSize || 12
    // Approximate line height: font size in pt * lineHeight multiplier * conversion factor
    const lineHeightPx = mainFontSize * 1.333 * lineHeightMultiplier // 1pt ≈ 1.333px

    // Flatten all chapters into a single token stream with chapter markers
    const allTokens: Token[] = []

    chapters.forEach((chapter) => {
        // Insert chapter number token at the start of each chapter
        const chapterToken: ChapterNumToken = {
            type: 'chapter_num',
            value: chapter.number
        }
        allTokens.push(chapterToken)

        // Add all paragraph tokens
        chapter.paragraphs.forEach(paragraph => {
            allTokens.push(...paragraph)
        })
    })

    // Layout as one continuous flow
    const allLines = layoutParagraph(allTokens, { maxWidth: contentWidth, settings })

    // Paginate: split lines into pages based on content height
    const pages: Page[] = []
    let currentPageLines: Line[] = []
    let currentPageHeight = 0

    for (const line of allLines) {
        if (currentPageHeight + lineHeightPx > contentHeight && currentPageLines.length > 0) {
            // This line would overflow, start a new page
            pages.push({
                lines: currentPageLines,
                pageNumber: pages.length + 1
            })
            currentPageLines = []
            currentPageHeight = 0
        }

        currentPageLines.push(line)
        currentPageHeight += lineHeightPx
    }

    // Add the last page if it has content
    if (currentPageLines.length > 0) {
        pages.push({
            lines: currentPageLines,
            pageNumber: pages.length + 1
        })
    }

    return pages
}

/**
 * Layout multiple paragraphs into pages (legacy, kept for compatibility)
 */
export function layoutChapter(paragraphs: Token[][], settings: PrintSettings): Page[] {
    const dpi = 96
    const pageWidthPx = settings.pageSize === 'custom'
        ? (settings.customWidth || 6) * dpi
        : (settings.pageSize === 'A5' ? 5.83 : 6) * dpi

    const marginInnerPx = settings.margins.inner * dpi
    const marginOuterPx = settings.margins.outer * dpi
    const safetyBufferPx = 0.05 * dpi
    const contentWidth = pageWidthPx - marginInnerPx - marginOuterPx - safetyBufferPx

    const allLines: Line[] = []

    // Flatten all paragraphs into a single token stream for continuous flow
    // (User request: "I don't want new paragraphs after each verse")
    let allTokens: Token[] = []
    paragraphs.forEach(p => allTokens.push(...p))

    // Layout as one giant paragraph
    const lines = layoutParagraph(allTokens, { maxWidth: contentWidth, settings })
    allLines.push(...lines)

    // Very basic "everything on one page" for now, or arbitrary paging
    // Real pagination needs height checking
    return [{
        lines: allLines,
        pageNumber: 1
    }]
}
