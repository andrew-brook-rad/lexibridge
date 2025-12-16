import { jsPDF } from 'jspdf'
import { BookProject, Token, Line, PAGE_SIZES, DEFAULT_TYPOGRAPHY } from '@/types'
import { layoutBook } from '@/app/lib/typesetter/layout'

// Points to mm conversion (1 pt = 0.352778 mm)
const PT_TO_MM = 0.352778
// Inches to mm conversion
const INCH_TO_MM = 25.4

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
}

/**
 * Generate a PDF from a BookProject using jsPDF
 */
export function generatePDF(options: PDFRenderOptions): jsPDF {
    const { project, showPageNumbers = true } = options
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

    // Render title page (page 1, recto)
    renderTitlePage(pdf, {
        title: meta.title || 'Untitled',
        pageWidth: pageWidthMM,
        pageHeight: pageHeightMM,
        marginInner,
        marginOuter,
        marginTop,
        typography,
    })

    // Render content pages
    pages.forEach((page, pageIndex) => {
        pdf.addPage()

        // Determine if this is verso (even page number, left side) or recto (odd, right side)
        // In a book spread, page 1 is recto, page 2 is verso, etc.
        // After title page (1), content starts at page 2
        const isVerso = (pageIndex + 2) % 2 === 0
        const marginLeft = isVerso ? marginOuter : marginInner
        const marginRight = isVerso ? marginInner : marginOuter

        let currentY = marginTop

        // Render each line
        page.lines.forEach((line) => {
            currentY = renderLine(pdf, line, {
                x: marginLeft,
                y: currentY,
                contentWidth,
                typography,
                lineHeightMM,
            })
        })

        // Page number
        if (showPageNumbers) {
            const pageNum = pageIndex + 2 // Title is page 1, content starts at 2
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
    pageWidth: number
    pageHeight: number
    marginInner: number
    marginOuter: number
    marginTop: number
    typography: typeof DEFAULT_TYPOGRAPHY
}

function renderTitlePage(pdf: jsPDF, options: TitlePageOptions) {
    const { title, pageWidth, pageHeight, typography } = options

    // Map fonts
    const mainPdfFont = mapCSSFontToPDF(typography.mainFont)
    const glossPdfFont = mapCSSFontToPDF(typography.glossFont)

    // Center title on page
    const titleFontSize = typography.mainFontSize * 3
    pdf.setFontSize(titleFontSize)
    pdf.setTextColor(0, 0, 0)
    pdf.setFont(mainPdfFont, 'bold')

    const centerX = pageWidth / 2
    const centerY = pageHeight / 3

    pdf.text(title, centerX, centerY, { align: 'center' })

    // Subtitle
    pdf.setFontSize(typography.mainFontSize)
    pdf.setFont(glossPdfFont, 'normal')
    pdf.setTextColor(107, 114, 128) // gray-500
    pdf.text('Interlinear Edition', centerX, centerY + 30, { align: 'center' })
}

interface RenderLineOptions {
    x: number
    y: number
    contentWidth: number
    typography: typeof DEFAULT_TYPOGRAPHY
    lineHeightMM: number
}

interface MeasuredToken {
    token: Token
    width: number  // Total width of this token in mm
    isExpandable: boolean  // Can this token have space added after it?
    canHaveSpaceAfter: boolean  // Should space be added after this token?
}

function renderLine(pdf: jsPDF, line: Line, options: RenderLineOptions): number {
    const { x: startX, y, contentWidth, typography, lineHeightMM } = options

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
    const spacePerGap = gapCount > 0 ? availableSpace / gapCount : 0

    // Only justify if we have enough gaps and not too much space
    // (Don't justify last lines or lines with very few words)
    const shouldJustify = gapCount > 1 && spacePerGap > 0 && spacePerGap < 15

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
            pdf.setFontSize(typography.mainFontSize * 1.5)
            pdf.setFont(mainPdfFont, 'bold')
            pdf.setTextColor(31, 41, 55)

            pdf.text(String(token.value), currentX, y, { baseline: 'top' })
            currentX += width

            // Add justification space if allowed
            if (shouldJustify && canHaveSpaceAfter) {
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

            // Add justification space after this word if allowed
            if (shouldJustify && canHaveSpaceAfter) {
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
export function generatePDFDataURL(project: BookProject): string {
    const pdf = generatePDF({ project })
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
