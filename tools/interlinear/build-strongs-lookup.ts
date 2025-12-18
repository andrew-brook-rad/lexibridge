/**
 * Build a simplified Strong's number → English gloss lookup
 *
 * Usage: npx tsx tools/interlinear/build-strongs-lookup.ts
 */

import * as fs from 'fs'
import * as path from 'path'

interface LexiconEntry {
  Hb_word?: string
  Gk_word?: string
  transliteration: string
  strongs_def: string
  outline_usage: string
  occurrences?: string
  root_word?: string
}

type Lexicon = Record<string, LexiconEntry>

function cleanHtml(text: string): string {
  return text
    .replace(/&#8212;?/g, '—')
    .replace(/&#39;?/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/<[^>]+>/g, '')
    .trim()
}

function extractGloss(entry: LexiconEntry): string {
  // Try to extract from occurrences first (most reliable for common words)
  // Format: "god(244x), judge(5x), ..."
  const occurrences = entry.occurrences || ''
  if (occurrences) {
    const match = occurrences.match(/^([a-zA-Z-]+)\(\d+x\)/)
    if (match && match[1].length <= 20) {
      return match[1]
    }
  }

  // Try to extract a short gloss from strongs_def
  // Format is often: "definition — gloss1, gloss2."
  const def = cleanHtml(entry.strongs_def || '')

  // Look for text after em dash (—)
  const dashMatch = def.match(/—\s*(.+?)\.?$/)
  if (dashMatch) {
    let glosses = dashMatch[1].trim()
    // Take first gloss before comma (but keep compound like "chief father")
    const parts = glosses.split(',')
    glosses = parts[0].trim()
    // Clean up parenthetical notes
    glosses = glosses.replace(/\([^)]+\)/g, '').trim()
    // Remove leading/trailing punctuation
    glosses = glosses.replace(/^[.\s]+|[.\s]+$/g, '')
    if (glosses.length > 0 && glosses.length <= 30) {
      return glosses
    }
  }

  // Try root_word (format: "H433 | אֱלוֹהַּ |  God, god")
  const rootWord = entry.root_word || ''
  const rootMatch = rootWord.match(/\|\s*([A-Za-z][A-Za-z, -]+)$/)
  if (rootMatch) {
    const gloss = rootMatch[1].split(',')[0].trim()
    if (gloss.length <= 20) {
      return gloss
    }
  }

  // Fall back to outline_usage first word/phrase
  const outline = cleanHtml(entry.outline_usage || '')
  if (outline) {
    // Skip if starts with (plural) or similar
    const firstPhrase = outline.replace(/^\([^)]+\),?\s*/, '').split(',')[0].trim()
    // Remove "= meaning" patterns
    const cleaned = firstPhrase.replace(/\s*=\s*".+?"/, '').trim()
    // Limit length
    if (cleaned.length > 0 && cleaned.length <= 25) {
      return cleaned
    }
    // Take first 2-3 words
    const words = cleaned.split(' ').slice(0, 3).join(' ')
    if (words.length <= 25) {
      return words
    }
  }

  // Last resort: transliteration
  return entry.transliteration || '?'
}

function buildLookup(lexiconPath: string, outputPath: string) {
  console.log('Loading lexicon...')
  const lexicon: Lexicon = JSON.parse(fs.readFileSync(lexiconPath, 'utf-8'))

  const lookup: Record<string, string> = {}
  let hebrewCount = 0
  let greekCount = 0

  for (const [key, entry] of Object.entries(lexicon)) {
    const gloss = extractGloss(entry)
    lookup[key] = gloss

    if (key.startsWith('H')) hebrewCount++
    if (key.startsWith('G')) greekCount++
  }

  console.log(`Hebrew entries: ${hebrewCount}`)
  console.log(`Greek entries: ${greekCount}`)
  console.log(`Total: ${Object.keys(lookup).length}`)

  // Save lookup
  fs.writeFileSync(outputPath, JSON.stringify(lookup, null, 2))
  console.log(`\nSaved to: ${outputPath}`)

  // Show samples
  console.log('\nSample entries:')
  const samples = ['H430', 'H1254', 'H7225', 'H8064', 'H776', 'G2316', 'G3056']
  for (const s of samples) {
    if (lookup[s]) {
      console.log(`  ${s}: ${lookup[s]}`)
    }
  }
}

// Main
const toolsDir = path.dirname(__filename)
const lexiconPath = path.join(toolsDir, 'dictionaries/strongs-lexicon.json')
const outputPath = path.join(toolsDir, 'dictionaries/strongs-lookup.json')

buildLookup(lexiconPath, outputPath)
