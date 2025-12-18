import { jsPDF } from 'jspdf'
import { BookProject, Token, Line, PAGE_SIZES, DEFAULT_TYPOGRAPHY } from '@/types'
import { layoutBook } from '@/app/lib/typesetter/layout'

// Points to mm conversion (1 pt = 0.352778 mm)
const PT_TO_MM = 0.352778
// Inches to mm conversion
const INCH_TO_MM = 25.4

// Default word spacing in mm (can be overridden by typography settings)
const DEFAULT_MIN_WORD_SPACE_MM = 1.5  // ~4pt minimum space between words
const DEFAULT_MAX_WORD_SPACE_MM = 8.0  // ~22pt maximum space between words

// Map CSS font families to jsPDF built-in fonts
// jsPDF only supports: helvetica, times, courier (built-in)
type PDFFontFamily = 'helvetica' | 'times' | 'courier'

function mapCSSFontToPDF(cssFont: string): PDFFontFamily {
    const lower = cssFont.toLowerCase()

    // Serif fonts -> Times
    if (lower.includes('georgia') ||
        lower.includes('times') ||
        lower.includes('garamond') ||
        lower.includes('palatino') ||
        lower.includes('serif')) {
        return 'times'
    }

    // Monospace fonts -> Courier
    if (lower.includes('courier') ||
        lower.includes('mono') ||
        lower.includes('consolas')) {
        return 'courier'
    }

    // Sans-serif fonts -> Helvetica (default)
    return 'helvetica'
}

interface PDFRenderOptions {
    project: BookProject
    showPageNumbers?: boolean
    previewPages?: number[] // If provided, only render these page numbers (1-indexed)
}

/**
 * Generate a PDF from a BookProject using jsPDF
 */
export function generatePDF(options: PDFRenderOptions): jsPDF {
    const { project, showPageNumbers = true, previewPages } = options
    const { chapters, printSettings, meta } = project

    // Get typography settings with defaults
    const typography = { ...DEFAULT_TYPOGRAPHY, ...printSettings.typography }

    // Get page dimensions in inches
    const pageDimensions = printSettings.pageSize === 'custom'
        ? { width: printSettings.customWidth || 6, height: printSettings.customHeight || 9 }
        : PAGE_SIZES[printSettings.pageSize] || PAGE_SIZES['6x9']

    // Convert to mm for jsPDF
    const pageWidthMM = pageDimensions.width * INCH_TO_MM
    const pageHeightMM = pageDimensions.height * INCH_TO_MM

    // Create PDF with custom page size
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pageWidthMM, pageHeightMM],
    })

    // Margins in mm
    const marginTop = printSettings.margins.top * INCH_TO_MM
    const marginBottom = printSettings.margins.bottom * INCH_TO_MM
    const marginInner = printSettings.margins.inner * INCH_TO_MM
    const marginOuter = printSettings.margins.outer * INCH_TO_MM

    // Font sizes in pt (jsPDF uses pt for fonts)
    const mainFontSize = typography.mainFontSize

    // Line height calculations
    const lineHeightMultiplier = typography.lineHeight
    const lineHeightMM = mainFontSize * PT_TO_MM * lineHeightMultiplier

    // Content area dimensions
    const contentWidth = pageWidthMM - marginInner - marginOuter

    // Run layout engine to get pages
    const pages = layoutBook(chapters, printSettings)

    // Determine which pages to render
    const shouldRenderPage = (pageNum: number) => !previewPages || previewPages.includes(pageNum)
    let isFirstRenderedPage = true

    // Render title page (page 1, recto) if included
    if (shouldRenderPage(1)) {
        renderTitlePage(pdf, {
            title: meta.title || 'Untitled',
            subtitle: meta.language ? `${meta.language} Interlinear Edition` : 'Interlinear Edition',
            pageWidth: pageWidthMM,
            pageHeight: pageHeightMM,
            marginInner,
            marginOuter,
            marginTop,
            typography,
        })
        isFirstRenderedPage = false
    }

    // Render content pages
    pages.forEach((page, pageIndex) => {
        const pageNum = pageIndex + 2 // Title is page 1, content starts at 2
        if (!shouldRenderPage(pageNum)) return

        if (isFirstRenderedPage) {
            isFirstRenderedPage = false
        } else {
            pdf.addPage()
        }

        // Determine if this is verso (even page number, left side) or recto (odd, right side)
        // In a book spread, page 1 is recto, page 2 is verso, etc.
        // After title page (1), content starts at page 2
        const isVerso = (pageIndex + 2) % 2 === 0
        const marginLeft = isVerso ? marginOuter : marginInner
        const marginRight = isVerso ? marginInner : marginOuter

        let currentY = marginTop

        // Render each line
        page.lines.forEach((line, lineIndex) => {
            const isLastLine = lineIndex === page.lines.length - 1
            currentY = renderLine(pdf, line, {
                x: marginLeft,
                y: currentY,
                contentWidth,
                typography,
                lineHeightMM,
                forceJustify: !isLastLine, // Don't justify the last line of a page
            })
        })

        // Page number
        if (showPageNumbers) {
            const pageNumX = isVerso ? marginLeft : pageWidthMM - marginRight
            pdf.setFontSize(mainFontSize * 0.8)
            pdf.setTextColor(128, 128, 128)
            pdf.text(
                String(pageNum),
                pageNumX,
                pageHeightMM - marginBottom + 5,
                { align: isVerso ? 'left' : 'right' }
            )
        }
    })

    return pdf
}

interface TitlePageOptions {
    title: string
    subtitle?: string
    pageWidth: number
    pageHeight: number
    marginInner: number
    marginOuter: number
    marginTop: number
    typography: typeof DEFAULT_TYPOGRAPHY
}

function renderTitlePage(pdf: jsPDF, options: TitlePageOptions) {
    const { title, subtitle, pageWidth, pageHeight, typography, marginTop } = options

    // Map fonts
    const mainPdfFont = mapCSSFontToPDF(typography.mainFont)
    const glossPdfFont = mapCSSFontToPDF(typography.glossFont)

    const centerX = pageWidth / 2

    // Decorative line at top third
    const lineY = pageHeight * 0.25
    const lineWidth = pageWidth * 0.3
    pdf.setDrawColor(180, 180, 180)
    pdf.setLineWidth(0.3)
    pdf.line(centerX - lineWidth/2, lineY, centerX + lineWidth/2, lineY)

    // Main title - elegant and large
    const titleFontSize = typography.mainFontSize * 3.5
    pdf.setFontSize(titleFontSize)
    pdf.setTextColor(31, 41, 55) // gray-800
    pdf.setFont(mainPdfFont, 'bold')

    const titleY = pageHeight * 0.35

    // Handle long titles by splitting
    const titleLines = pdf.splitTextToSize(title.toUpperCase(), pageWidth * 0.7)
    pdf.text(titleLines, centerX, titleY, { align: 'center' })

    // Decorative divider below title
    const dividerY = titleY + (titleLines.length * titleFontSize * PT_TO_MM) + 15
    pdf.setDrawColor(180, 180, 180)
    pdf.setLineWidth(0.2)
    // Small ornamental line
    pdf.line(centerX - 10, dividerY, centerX + 10, dividerY)

    // Subtitle
    if (subtitle) {
        pdf.setFontSize(typography.mainFontSize * 1.2)
        pdf.setFont(glossPdfFont, 'italic')
        pdf.setTextColor(107, 114, 128) // gray-500
        pdf.text(subtitle, centerX, dividerY + 15, { align: 'center' })
    }

    // Bottom decorative line
    const bottomLineY = pageHeight * 0.75
    pdf.setDrawColor(180, 180, 180)
    pdf.setLineWidth(0.3)
    pdf.line(centerX - lineWidth/2, bottomLineY, centerX + lineWidth/2, bottomLineY)
}

interface RenderLineOptions {
    x: number
    y: number
    contentWidth: number
    typography: typeof DEFAULT_TYPOGRAPHY
    lineHeightMM: number
    forceJustify?: boolean // If true, always justify (unless last line)
}

interface MeasuredToken {
    token: Token
    width: number  // Total width of this token in mm
    isExpandable: boolean  // Can this token have space added after it?
    canHaveSpaceAfter: boolean  // Should space be added after this token?
}

function renderLine(pdf: jsPDF, line: Line, options: RenderLineOptions): number {
    const { x: startX, y, contentWidth, typography, lineHeightMM, forceJustify = true } = options

    // Map CSS fonts to PDF fonts
    const mainPdfFont = mapCSSFontToPDF(typography.mainFont)
    const glossPdfFont = mapCSSFontToPDF(typography.glossFont)

    // First pass: measure all tokens using PDF fonts to get accurate widths
    const measuredTokens: MeasuredToken[] = []
    let totalContentWidth = 0
    const tokensList = line.tokens

    for (let tokenIndex = 0; tokenIndex < tokensList.length; tokenIndex++) {
        const { token } = tokensList[tokenIndex]
        let width = 0
        let isExpandable = false

        if (token.type === 'verse_num') {
            // Verse numbers are small, measure them
            pdf.setFontSize(typography.verseNumSize)
            pdf.setFont(mainPdfFont, 'bold')
            width = pdf.getTextWidth(token.value) + 0.5 // Small padding
            isExpandable = false
        } else if (token.type === 'chapter_num') {
            pdf.setFontSize(typography.mainFontSize * 1.5)
            pdf.setFont(mainPdfFont, 'bold')
            width = pdf.getTextWidth(String(token.value)) + 2
            isExpandable = true
        } else if (token.type === 'punctuation') {
            pdf.setFontSize(typography.mainFontSize)
            pdf.setFont(mainPdfFont, 'normal')
            width = pdf.getTextWidth(token.value)
            isExpandable = false
        } else if (token.type === 'word') {
            // Measure each part and sum up
            let wordWidth = 0
            for (let i = 0; i < token.parts.length; i++) {
                const part = token.parts[i]

                pdf.setFontSize(typography.mainFontSize)
                pdf.setFont(mainPdfFont, 'normal')
                const sourceWidth = pdf.getTextWidth(part.text)

                pdf.setFontSize(typography.glossFontSize)
                pdf.setFont(glossPdfFont, 'normal')
                const glossWidth = pdf.getTextWidth(part.gloss)

                const partWidth = Math.max(sourceWidth, glossWidth)
                wordWidth += partWidth

                // Add internal spacing between parts
                if (i < token.parts.length - 1) {
                    wordWidth += 1 // ~1mm between morphemes
                }
            }
            width = wordWidth
            isExpandable = true
        }

        // Check if next token is punctuation or verse number - if so, don't add space after this token
        const nextToken = tokenIndex < tokensList.length - 1 ? tokensList[tokenIndex + 1].token : null
        const nextIsPunctuation = nextToken && (nextToken.type === 'punctuation' || nextToken.type === 'verse_num')
        const canHaveSpaceAfter = isExpandable && !nextIsPunctuation

        measuredTokens.push({ token, width, isExpandable, canHaveSpaceAfter })
        totalContentWidth += width
    }

    // Calculate how much space we need to distribute
    // Only count tokens that can actually have space after them
    const gapCount = measuredTokens.filter(t => t.canHaveSpaceAfter).length
    const availableSpace = contentWidth - totalContentWidth
    const rawSpacePerGap = gapCount > 0 ? availableSpace / gapCount : 0

    // Get word spacing constraints from typography settings or use defaults
    const minWordSpace = typography.minWordSpace ?? DEFAULT_MIN_WORD_SPACE_MM
    const maxWordSpace = typography.maxWordSpace ?? DEFAULT_MAX_WORD_SPACE_MM

    // Determine spacing strategy:
    // - If justifying and space is within reasonable bounds: use calculated spacing
    // - If space per gap would be < minimum: use minimum spacing (left-align remainder)
    // - If space per gap would be > maximum: use maximum spacing (left-align remainder)
    // - If not justifying (last line): use minimum spacing

    let spacePerGap = minWordSpace  // Default to minimum
    let shouldJustify = false

    if (forceJustify && gapCount >= 1) {
        if (rawSpacePerGap >= minWordSpace && rawSpacePerGap <= maxWordSpace) {
            // Perfect - use calculated spacing for full justification
            spacePerGap = rawSpacePerGap
            shouldJustify = true
        } else if (rawSpacePerGap > maxWordSpace) {
            // Too much space - cap at maximum
            spacePerGap = maxWordSpace
            shouldJustify = false  // Will be left-aligned with capped spacing
        } else {
            // Too little space (or negative) - use minimum spacing
            spacePerGap = minWordSpace
            shouldJustify = false  // Will be left-aligned with minimum spacing
        }
    }

    // Second pass: render tokens with justification
    let currentX = startX

    for (const measured of measuredTokens) {
        const { token, width, canHaveSpaceAfter } = measured

        if (token.type === 'verse_num') {
            const offsetX = (typography.verseNumOffsetX || 0) * PT_TO_MM
            const offsetY = (typography.verseNumOffset || 0) * PT_TO_MM

            pdf.setFontSize(typography.verseNumSize)
            pdf.setFont(mainPdfFont, 'bold')
            pdf.setTextColor(...hexToRGB(typography.verseNumColor))

            pdf.text(token.value, currentX + offsetX, y + offsetY, { baseline: 'top' })
            currentX += width
        } else if (token.type === 'chapter_num') {
            // Render chapter number as a large decorative drop-cap style numeral
            const chapterFontSize = typography.mainFontSize * 2.5
            pdf.setFontSize(chapterFontSize)
            pdf.setFont(mainPdfFont, 'bold')
            pdf.setTextColor(51, 51, 51) // Dark gray

            // Position chapter number slightly raised
            const chapterY = y - 1
            pdf.text(String(token.value), currentX, chapterY, { baseline: 'top' })
            currentX += width + 2 // Add extra padding after chapter number

            // Add spacing after chapter number (always add spacing for readability)
            if (canHaveSpaceAfter) {
                currentX += spacePerGap
            }
        } else if (token.type === 'punctuation') {
            pdf.setFontSize(typography.mainFontSize)
            pdf.setFont(mainPdfFont, 'normal')
            pdf.setTextColor(0, 0, 0)

            pdf.text(token.value, currentX, y, { baseline: 'top' })
            currentX += width
        } else if (token.type === 'word') {
            // Render each part
            for (let i = 0; i < token.parts.length; i++) {
                const part = token.parts[i]
                const isLastPart = i === token.parts.length - 1

                pdf.setFontSize(typography.mainFontSize)
                pdf.setFont(mainPdfFont, 'normal')
                const sourceWidth = pdf.getTextWidth(part.text)

                pdf.setFontSize(typography.glossFontSize)
                pdf.setFont(glossPdfFont, 'normal')
                const glossWidth = pdf.getTextWidth(part.gloss)

                const partWidth = Math.max(sourceWidth, glossWidth)

                // Center the source text within the part width
                const sourceX = currentX + (partWidth - sourceWidth) / 2

                // Render source text
                pdf.setFontSize(typography.mainFontSize)
                pdf.setFont(mainPdfFont, 'normal')
                pdf.setTextColor(0, 0, 0)
                pdf.text(part.text, sourceX, y, { baseline: 'top' })

                // Render gloss below
                const glossY = y + (typography.mainFontSize * PT_TO_MM * 1.1)
                const glossX = currentX + (partWidth - glossWidth) / 2

                pdf.setFontSize(typography.glossFontSize)
                pdf.setFont(glossPdfFont, 'normal')
                pdf.setTextColor(80, 80, 80)
                pdf.text(part.gloss.toLowerCase(), glossX, glossY, { baseline: 'top' })

                currentX += partWidth
                if (!isLastPart) {
                    currentX += 1 // Internal morpheme spacing
                }
            }

            // Add spacing after this word (always add spacing for readability)
            if (canHaveSpaceAfter) {
                currentX += spacePerGap
            }
        }
    }

    // Return the next Y position
    return y + lineHeightMM
}

/**
 * Convert hex color to RGB tuple for jsPDF
 */
function hexToRGB(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (result) {
        return [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16),
        ]
    }
    return [107, 114, 128] // Default gray
}

/**
 * Generate PDF and return as data URL for preview
 */
export function generatePDFDataURL(project: BookProject, previewPages?: number[]): string {
    const pdf = generatePDF({ project, previewPages })
    return pdf.output('dataurlstring')
}

/**
 * Generate PDF and trigger download
 */
export function downloadPDF(project: BookProject, filename?: string) {
    const pdf = generatePDF({ project })
    const name = filename || `${project.meta.title || 'lexibridge'}-interlinear.pdf`
    pdf.save(name)
}
