'use client'

import { BookProject, Token, PAGE_SIZES, DEFAULT_TYPOGRAPHY } from '@/types'
import InterlinearWord from './InterlinearWord'
import TypesetRenderer from './TypesetRenderer'

interface PrintPreviewProps {
  project: BookProject
  reflowKey: number
  editMode: boolean
  onTokenClick?: (chapterIndex: number, paragraphIndex: number, tokenIndex: number) => void
  previewPageType?: 'recto' | 'verso'
}

export default function PrintPreview({ project, reflowKey, editMode, onTokenClick, previewPageType = 'recto' }: PrintPreviewProps) {
  const { meta, printSettings, chapters } = project

  // Calculate page dimensions
  const pageDimensions = printSettings.pageSize === 'custom'
    ? { width: printSettings.customWidth || 6, height: printSettings.customHeight || 9 }
    : PAGE_SIZES[printSettings.pageSize]

  // For recto (odd) pages: inner margin on left, outer on right
  // For verso (even) pages: outer margin on left, inner on right
  const marginLeft = previewPageType === 'recto'
    ? printSettings.margins.inner
    : printSettings.margins.outer
  const marginRight = previewPageType === 'recto'
    ? printSettings.margins.outer
    : printSettings.margins.inner

  // Get typography settings with defaults - merge to handle missing properties from older saved projects
  const typography = { ...DEFAULT_TYPOGRAPHY, ...printSettings.typography }

  // CSS custom properties for dynamic styling
  const customStyles = {
    '--page-width': `${pageDimensions.width}in`,
    '--page-height': `${pageDimensions.height}in`,
    '--margin-top': `${printSettings.margins.top}in`,
    '--margin-bottom': `${printSettings.margins.bottom}in`,
    '--margin-inner': `${printSettings.margins.inner}in`,
    '--margin-outer': `${printSettings.margins.outer}in`,
    '--margin-left': `${marginLeft}in`,
    '--margin-right': `${marginRight}in`,
    // Typography settings
    '--font-main': typography.mainFont,
    '--font-gloss': typography.glossFont,
    '--font-size-main': `${typography.mainFontSize}pt`,
    '--font-size-gloss': `${typography.glossFontSize}pt`,
    '--font-size-verse': `${typography.verseNumSize}pt`,
    '--verse-color': typography.verseNumColor,
    '--verse-offset': `${typography.verseNumOffset}pt`,
    '--verse-offset-x': `${typography.verseNumOffsetX}pt`,
    '--line-height': typography.lineHeight,
    // Legacy variables for compatibility
    '--font-size-base': `${printSettings.baseFontSize}pt`,
    '--font-size-chapter': `${Math.round(typography.mainFontSize * 1.5)}pt`,
    '--font-size-title': `${Math.round(typography.mainFontSize * 2)}pt`,
  } as React.CSSProperties

  const renderToken = (
    token: Token,
    chapterIndex: number,
    paragraphIndex: number,
    tokenIndex: number
  ) => {
    switch (token.type) {
      case 'verse_num':
        return (
          <sup key={`${chapterIndex}-${paragraphIndex}-${tokenIndex}`} className="verse-number">
            {token.value}
          </sup>
        )
      case 'word':
        return (
          <InterlinearWord
            key={`${chapterIndex}-${paragraphIndex}-${tokenIndex}`}
            token={token}
            onClick={editMode ? () => onTokenClick?.(chapterIndex, paragraphIndex, tokenIndex) : undefined}
          />
        )
      case 'punctuation':
        return (
          <span key={`${chapterIndex}-${paragraphIndex}-${tokenIndex}`} className="punctuation">
            {token.value}
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div
      key={reflowKey}
      className={`print-preview mx-auto relative ${editMode ? 'edit-mode' : ''}`}
      style={customStyles}
    >
      {/* Margin Guides - Safe Area Indicators */}
      <div className="margin-guides no-print">
        <div className="margin-guide-top" />
        <div className="margin-guide-bottom" />
        <div className="margin-guide-inner" />
        <div className="margin-guide-outer" />
      </div>

      {/* Book Title */}
      {meta.title && (
        <h1 className="book-title">{meta.title}</h1>
      )}

      {/* Programmatic Typesetting Renderer */}
      <TypesetRenderer
        project={project}
        editMode={editMode}
        previewPageType={previewPageType}
        onTokenClick={onTokenClick}
        reflowKey={reflowKey}
      />

      {/* Empty state */}
      {chapters.length === 0 && (
        <div className="text-center text-gray-400 py-20">
          <p className="text-lg">No content yet</p>
          <p className="text-sm">Enter German text and click "Translate" to generate interlinear text</p>
        </div>
      )}
    </div>
  )
}
