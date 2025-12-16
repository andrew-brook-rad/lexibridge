// LexiBridge Lite - Type Definitions

export interface WordPart {
  text: string
  gloss: string
  width?: number
}

export interface VerseNumToken {
  type: 'verse_num'
  value: string
  width?: number
}

export interface WordToken {
  type: 'word'
  original_full: string
  parts: WordPart[]
  width?: number
}

export interface PunctuationToken {
  type: 'punctuation'
  value: string
  width?: number
}

export interface ChapterNumToken {
  type: 'chapter_num'
  value: number
  width?: number
}

export type Token = VerseNumToken | WordToken | PunctuationToken | ChapterNumToken

export interface Line {
  tokens: {
    token: Token
    width: number
    marginRight: number
  }[]
  width: number
  justifySpacing?: number
}

export interface Page {
  lines: Line[]
  pageNumber: number
}

export type Paragraph = Token[]

export interface Chapter {
  number: number
  paragraphs: Paragraph[]
}

export interface PrintSettings {
  pageSize: string // KDP trim size key or 'custom'
  customWidth?: number
  customHeight?: number
  margins: {
    top: number
    bottom: number
    inner: number
    outer: number
  }
  baseFontSize: number
  // Typography settings
  typography?: {
    mainFont: string
    mainFontSize: number
    glossFont: string
    glossFontSize: number
    verseNumSize: number
    verseNumColor: string
    verseNumOffset: number // Vertical offset in pt units (negative = up)
    verseNumOffsetX: number // Horizontal offset in pt units (negative = left)
    lineHeight: number
  }
}

export interface ProjectMeta {
  title: string
  language: string
}

export interface BookProject {
  meta: ProjectMeta
  printSettings: PrintSettings
  chapters: Chapter[]
}

export interface TranslateRequest {
  text: string
  chapterNumber?: number
}

export interface TranslateResponse {
  chapter: Chapter
  error?: string
}

// Page size dimensions in inches - KDP supported trim sizes
export const PAGE_SIZES: Record<string, { width: number; height: number; label: string }> = {
  // Popular KDP sizes
  '5x8': { width: 5, height: 8, label: '5" x 8" (Mass Market)' },
  '5.06x7.81': { width: 5.06, height: 7.81, label: '5.06" x 7.81"' },
  '5.25x8': { width: 5.25, height: 8, label: '5.25" x 8"' },
  '5.5x8.5': { width: 5.5, height: 8.5, label: '5.5" x 8.5" (Digest)' },
  '6x9': { width: 6, height: 9, label: '6" x 9" (US Trade)' },
  '6.14x9.21': { width: 6.14, height: 9.21, label: '6.14" x 9.21" (Royal)' },
  '6.69x9.61': { width: 6.69, height: 9.61, label: '6.69" x 9.61" (Super Royal)' },
  // Larger sizes
  '7x10': { width: 7, height: 10, label: '7" x 10" (Executive)' },
  '7.44x9.69': { width: 7.44, height: 9.69, label: '7.44" x 9.69"' },
  '7.5x9.25': { width: 7.5, height: 9.25, label: '7.5" x 9.25"' },
  '8x10': { width: 8, height: 10, label: '8" x 10"' },
  '8.5x11': { width: 8.5, height: 11, label: '8.5" x 11" (Letter)' },
  // International
  'A5': { width: 5.83, height: 8.27, label: 'A5 (148 x 210 mm)' },
  'A4': { width: 8.27, height: 11.69, label: 'A4 (210 x 297 mm)' },
}

// KDP recommended margins
export const KDP_MARGINS = {
  top: 0.75,
  bottom: 0.75,
  inner: 0.875,
  outer: 0.5,
}

// Default typography settings
export const DEFAULT_TYPOGRAPHY = {
  mainFont: 'Georgia, serif',
  mainFontSize: 10,
  glossFont: 'Inter, sans-serif',
  glossFontSize: 5,
  verseNumSize: 6,
  verseNumColor: '#6b7280', // Muted gray-500 for non-intrusive verse numbers
  verseNumOffset: -2, // pt units (negative = up, positive = down) - superscript position
  verseNumOffsetX: 1, // pt units (negative = left, positive = right)
  lineHeight: 1.8,
}

// Default project state
export const DEFAULT_PROJECT: BookProject = {
  meta: {
    title: 'Genesis',
    language: 'DE',
  },
  printSettings: {
    pageSize: '6x9',
    margins: KDP_MARGINS,
    baseFontSize: 12,
    typography: DEFAULT_TYPOGRAPHY,
  },
  chapters: [],
}
