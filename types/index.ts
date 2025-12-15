// LexiBridge Lite - Type Definitions

export interface WordPart {
  text: string
  gloss: string
}

export interface VerseNumToken {
  type: 'verse_num'
  value: string
}

export interface WordToken {
  type: 'word'
  original_full: string
  parts: WordPart[]
}

export interface PunctuationToken {
  type: 'punctuation'
  value: string
}

export type Token = VerseNumToken | WordToken | PunctuationToken

export type Paragraph = Token[]

export interface Chapter {
  number: number
  paragraphs: Paragraph[]
}

export interface PrintSettings {
  pageSize: '6x9' | '5.5x8.5' | 'A5' | 'custom'
  customWidth?: number
  customHeight?: number
  margins: {
    top: number
    bottom: number
    inner: number
    outer: number
  }
  baseFontSize: number
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

// Page size dimensions in inches
export const PAGE_SIZES: Record<string, { width: number; height: number }> = {
  '6x9': { width: 6, height: 9 },
  '5.5x8.5': { width: 5.5, height: 8.5 },
  'A5': { width: 5.83, height: 8.27 }, // 148mm x 210mm
}

// KDP recommended margins
export const KDP_MARGINS = {
  top: 0.75,
  bottom: 0.75,
  inner: 0.875,
  outer: 0.5,
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
  },
  chapters: [],
}
