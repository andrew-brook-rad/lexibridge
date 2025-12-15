'use client'

import { BookProject, Token, PAGE_SIZES } from '@/types'
import InterlinearWord from './InterlinearWord'

interface PrintPreviewProps {
  project: BookProject
  reflowKey: number
  editMode: boolean
  onTokenClick?: (chapterIndex: number, paragraphIndex: number, tokenIndex: number) => void
}

export default function PrintPreview({ project, reflowKey, editMode, onTokenClick }: PrintPreviewProps) {
  const { meta, printSettings, chapters } = project

  // Calculate page dimensions
  const pageDimensions = printSettings.pageSize === 'custom'
    ? { width: printSettings.customWidth || 6, height: printSettings.customHeight || 9 }
    : PAGE_SIZES[printSettings.pageSize]

  // CSS custom properties for dynamic styling
  const customStyles = {
    '--page-width': `${pageDimensions.width}in`,
    '--page-height': `${pageDimensions.height}in`,
    '--margin-top': `${printSettings.margins.top}in`,
    '--margin-bottom': `${printSettings.margins.bottom}in`,
    '--margin-inner': `${printSettings.margins.inner}in`,
    '--margin-outer': `${printSettings.margins.outer}in`,
    '--font-size-base': `${printSettings.baseFontSize}pt`,
    '--font-size-gloss': `${Math.round(printSettings.baseFontSize * 0.58)}pt`,
    '--font-size-verse': `${Math.round(printSettings.baseFontSize * 0.67)}pt`,
    '--font-size-chapter': `${Math.round(printSettings.baseFontSize * 1.5)}pt`,
    '--font-size-title': `${Math.round(printSettings.baseFontSize * 2)}pt`,
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
      className={`print-preview mx-auto ${editMode ? 'edit-mode' : ''}`}
      style={customStyles}
    >
      {/* Book Title */}
      {meta.title && (
        <h1 className="book-title">{meta.title}</h1>
      )}

      {/* Chapters */}
      {chapters.map((chapter, chapterIndex) => (
        <div key={chapterIndex} className="chapter">
          {/* Chapter Header */}
          <h2 className="chapter-header">Chapter {chapter.number}</h2>

          {/* Paragraphs */}
          {chapter.paragraphs.map((paragraph, paragraphIndex) => (
            <p key={paragraphIndex} className="paragraph interlinear-text">
              {paragraph.map((token, tokenIndex) =>
                renderToken(token, chapterIndex, paragraphIndex, tokenIndex)
              )}
            </p>
          ))}
        </div>
      ))}

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
