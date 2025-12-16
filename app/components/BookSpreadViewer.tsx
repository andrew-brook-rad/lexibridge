'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { BookProject, Page, PAGE_SIZES, DEFAULT_TYPOGRAPHY } from '@/types'
import { layoutBook } from '@/app/lib/typesetter/layout'
import TypesetToken from './TypesetToken'

interface BookSpreadViewerProps {
    project: BookProject
    reflowKey: number
}

export default function BookSpreadViewer({ project, reflowKey }: BookSpreadViewerProps) {
    const { chapters, printSettings, meta } = project
    const [currentSpread, setCurrentSpread] = useState(0)

    // Reset to first spread when content changes
    useEffect(() => {
        setCurrentSpread(0)
    }, [reflowKey])

    // Get typography settings with defaults - merge to handle missing properties from older saved projects
    const typography = { ...DEFAULT_TYPOGRAPHY, ...printSettings.typography }

    // Calculate page dimensions
    const pageDimensions = printSettings.pageSize === 'custom'
        ? { width: printSettings.customWidth || 6, height: printSettings.customHeight || 9 }
        : PAGE_SIZES[printSettings.pageSize]

    // Run layout engine
    const pages = useMemo(() => {
        return layoutBook(chapters, printSettings)
    }, [chapters, printSettings, reflowKey])

    // Calculate spreads (pairs of pages)
    // Spread 0: Title page (blank verso + title recto)
    // Spread 1: Pages 1-2 (first content verso, second content recto)
    // etc.
    // We add 1 for the title page, then pair up content pages
    const totalContentPages = pages.length
    const totalSpreads = 1 + Math.ceil(totalContentPages / 2) // 1 for title spread + content spreads

    const getSpreadPages = (spreadIndex: number): { verso: Page | null; recto: Page | null; isTitle: boolean } => {
        if (spreadIndex === 0) {
            // Title spread: blank verso, title on recto
            return { verso: null, recto: null, isTitle: true }
        }
        // Content spreads (spreadIndex 1 = pages 0,1; spreadIndex 2 = pages 2,3; etc.)
        const versoIndex = (spreadIndex - 1) * 2
        const rectoIndex = versoIndex + 1
        return {
            verso: pages[versoIndex] || null,
            recto: pages[rectoIndex] || null,
            isTitle: false
        }
    }

    const { verso, recto, isTitle } = getSpreadPages(currentSpread)

    const goToPrevSpread = useCallback(() => {
        if (currentSpread > 0) {
            setCurrentSpread(currentSpread - 1)
        }
    }, [currentSpread])

    const goToNextSpread = useCallback(() => {
        if (currentSpread < totalSpreads - 1) {
            setCurrentSpread(currentSpread + 1)
        }
    }, [currentSpread, totalSpreads])

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                goToPrevSpread()
            } else if (e.key === 'ArrowRight') {
                goToNextSpread()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [goToPrevSpread, goToNextSpread])

    // CSS custom properties for pages
    const getPageStyles = (isVerso: boolean) => ({
        '--page-width': `${pageDimensions.width}in`,
        '--page-height': `${pageDimensions.height}in`,
        '--margin-top': `${printSettings.margins.top}in`,
        '--margin-bottom': `${printSettings.margins.bottom}in`,
        '--margin-left': isVerso ? `${printSettings.margins.outer}in` : `${printSettings.margins.inner}in`,
        '--margin-right': isVerso ? `${printSettings.margins.inner}in` : `${printSettings.margins.outer}in`,
        '--font-main': typography.mainFont,
        '--font-gloss': typography.glossFont,
        '--font-size-main': `${typography.mainFontSize}pt`,
        '--font-size-gloss': `${typography.glossFontSize}pt`,
        '--font-size-verse': `${typography.verseNumSize}pt`,
        '--verse-color': typography.verseNumColor,
        '--verse-offset': `${typography.verseNumOffset}pt`,
        '--verse-offset-x': `${typography.verseNumOffsetX}pt`,
        '--line-height': typography.lineHeight,
        '--font-size-chapter': `${Math.round(typography.mainFontSize * 1.5)}pt`,
        '--font-size-title': `${Math.round(typography.mainFontSize * 2)}pt`,
    } as React.CSSProperties)

    // Render title page
    const renderTitlePage = (isVerso: boolean) => {
        const styles = getPageStyles(isVerso)

        return (
            <div
                className="book-page bg-white shadow-lg relative"
                style={{
                    ...styles,
                    width: `${pageDimensions.width}in`,
                    height: `${pageDimensions.height}in`,
                    boxSizing: 'border-box',
                }}
            >
                {!isVerso && (
                    <div className="flex flex-col items-center justify-center h-full">
                        <h1 style={{
                            fontFamily: typography.mainFont,
                            fontSize: `${typography.mainFontSize * 3}pt`,
                            fontWeight: 'bold',
                            textAlign: 'center',
                            marginBottom: '1in',
                        }}>
                            {meta.title || 'Untitled'}
                        </h1>
                        {meta.language && (
                            <p style={{
                                fontFamily: typography.glossFont,
                                fontSize: `${typography.mainFontSize}pt`,
                                color: '#6b7280',
                            }}>
                                Interlinear Edition
                            </p>
                        )}
                    </div>
                )}
            </div>
        )
    }

    // Render content page
    const renderContentPage = (page: Page | null, isVerso: boolean, pageNumber: number) => {
        const styles = getPageStyles(isVerso)
        // Reserve space for page number (approximately 0.4in)
        const pageNumberHeight = 0.4

        return (
            <div
                className="book-page bg-white shadow-lg relative"
                style={{
                    ...styles,
                    width: `${pageDimensions.width}in`,
                    height: `${pageDimensions.height}in`,
                    boxSizing: 'border-box',
                }}
            >
                {/* Content area with proper margins */}
                <div
                    className="page-content overflow-hidden"
                    style={{
                        position: 'absolute',
                        top: `${printSettings.margins.top}in`,
                        left: isVerso ? `${printSettings.margins.outer}in` : `${printSettings.margins.inner}in`,
                        right: isVerso ? `${printSettings.margins.inner}in` : `${printSettings.margins.outer}in`,
                        bottom: `${printSettings.margins.bottom + pageNumberHeight}in`,
                    }}
                >
                    {page && page.lines.map((line, lineIndex) => (
                        <div
                            key={lineIndex}
                            className="typeset-line whitespace-nowrap overflow-visible"
                            style={{
                                textAlign: 'left',
                                lineHeight: 'var(--line-height)',
                            }}
                        >
                            {line.tokens.map((lineToken, tIndex) => (
                                <TypesetToken
                                    key={tIndex}
                                    token={lineToken.token}
                                    marginRight={lineToken.marginRight}
                                />
                            ))}
                        </div>
                    ))}
                </div>

                {/* Page number */}
                <div
                    className="absolute text-gray-500"
                    style={{
                        bottom: `${printSettings.margins.bottom}in`,
                        [isVerso ? 'left' : 'right']: `${printSettings.margins.outer}in`,
                        fontSize: `${typography.mainFontSize * 0.8}pt`,
                        fontFamily: typography.mainFont,
                    }}
                >
                    {pageNumber}
                </div>
            </div>
        )
    }

    // Unified render function that chooses title or content page
    const renderPage = (page: Page | null, isVerso: boolean, pageNumber: number | null) => {
        if (isTitle) {
            return renderTitlePage(isVerso)
        }
        return renderContentPage(page, isVerso, pageNumber || 0)
    }

    return (
        <div className="book-spread-viewer">
            {/* Navigation controls */}
            <div className="flex items-center justify-center gap-4 mb-4">
                <button
                    onClick={goToPrevSpread}
                    disabled={currentSpread === 0}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    ← Previous
                </button>

                <span className="text-sm text-gray-600">
                    Spread {currentSpread + 1} of {totalSpreads}
                    {pages.length > 0 && (
                        <span className="text-gray-400 ml-2">
                            (Pages {currentSpread === 0 ? '1' : `${currentSpread * 2}-${Math.min(currentSpread * 2 + 1, pages.length)}`})
                        </span>
                    )}
                </span>

                <button
                    onClick={goToNextSpread}
                    disabled={currentSpread >= totalSpreads - 1}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next →
                </button>
            </div>

            {/* Page indicator dots */}
            <div className="flex justify-center gap-1 mb-4">
                {Array.from({ length: totalSpreads }, (_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentSpread(i)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                            i === currentSpread ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                        title={`Go to spread ${i + 1}`}
                    />
                ))}
            </div>

            {/* Book spread container */}
            <div className="flex justify-center items-start gap-1 overflow-x-auto pb-4">
                {/* Verso (left) page */}
                <div className={`transition-opacity ${currentSpread === 0 ? 'opacity-30' : ''}`}>
                    {renderPage(
                        verso,
                        true,
                        currentSpread === 0 ? null : currentSpread * 2
                    )}
                </div>

                {/* Spine divider */}
                <div className="w-1 bg-gray-300 self-stretch" style={{ minHeight: `${pageDimensions.height}in` }} />

                {/* Recto (right) page */}
                <div>
                    {renderPage(
                        recto,
                        false,
                        currentSpread === 0 ? 1 : currentSpread * 2 + 1
                    )}
                </div>
            </div>

            {/* Keyboard hint */}
            <p className="text-center text-xs text-gray-400 mt-2">
                Use ← → arrow keys to navigate
            </p>
        </div>
    )
}
