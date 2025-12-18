/**
 * Parse USFM files and generate interlinear TSV using Strong's numbers + dictionary
 *
 * Pipeline: USFM → Strong's lookup → Dictionary fallback → Flag unknowns → TSV output
 *
 * Usage: npx tsx tools/interlinear/usfm-to-tsv.ts [usfm-file]
 * Example: npx tsx tools/interlinear/usfm-to-tsv.ts data/original-bible/deu1912_usfm/02-GENdeu1912.usfm
 */

import * as fs from 'fs'
import * as path from 'path'

type Dictionary = Record<string, string[]>
type StrongsLookup = Record<string, string>

interface ParsedWord {
  word: string
  strongs?: string // e.g., "H430"
}

interface ParsedVerse {
  chapter: number
  verse: number
  words: ParsedWord[]
}

interface GlossedWord {
  word: string
  gloss: string
  confidence: 'high' | 'medium' | 'low' | 'unknown'
  source: 'strongs' | 'dictionary' | 'none'
}

interface GlossedVerse {
  ref: string
  words: GlossedWord[]
  hasIssues: boolean
}

// Load dictionary
function loadDictionary(dictPath: string): Dictionary {
  if (!fs.existsSync(dictPath)) {
    console.log('Dictionary not found. Run build-dictionary.ts first.')
    process.exit(1)
  }
  return JSON.parse(fs.readFileSync(dictPath, 'utf-8'))
}

// Load Strong's lookup
function loadStrongsLookup(path: string): StrongsLookup {
  if (!fs.existsSync(path)) {
    console.log('Strong\'s lookup not found. Run build-strongs-lookup.ts first.')
    return {}
  }
  return JSON.parse(fs.readFileSync(path, 'utf-8'))
}

// Parse USFM file to extract verses with Strong's numbers
function parseUsfm(content: string): ParsedVerse[] {
  const verses: ParsedVerse[] = []
  let currentChapter = 0

  const lines = content.split('\n')

  for (const line of lines) {
    // Chapter marker
    const chapterMatch = line.match(/^\\c\s+(\d+)/)
    if (chapterMatch) {
      currentChapter = parseInt(chapterMatch[1], 10)
      continue
    }

    // Verse marker
    const verseMatch = line.match(/^\\v\s+(\d+)\s+(.+)/)
    if (verseMatch && currentChapter > 0) {
      const verseNum = parseInt(verseMatch[1], 10)
      const verseText = verseMatch[2]

      // Extract words with Strong's numbers
      const words = extractWordsWithStrongs(verseText)

      if (words.length > 0) {
        verses.push({
          chapter: currentChapter,
          verse: verseNum,
          words
        })
      }
    }
  }

  return verses
}

// Extract words from verse text, preserving Strong's numbers
function extractWordsWithStrongs(text: string): ParsedWord[] {
  const words: ParsedWord[] = []

  // Match \w word|strong="H1234"\w* patterns
  const taggedPattern = /\\w\s+([^|]+)\|strong="([^"]+)"\\w\*/g
  let lastIndex = 0
  let match

  // Process text, extracting both tagged and untagged words
  const processedText = text

  // First, extract all tagged words with their positions
  const taggedWords: { word: string; strongs: string; start: number; end: number }[] = []
  while ((match = taggedPattern.exec(text)) !== null) {
    taggedWords.push({
      word: match[1].trim(),
      strongs: match[2],
      start: match.index,
      end: match.index + match[0].length
    })
  }

  // Now process the text sequentially
  let pos = 0
  let tagIndex = 0

  while (pos < text.length) {
    // Check if we're at a tagged word
    if (tagIndex < taggedWords.length && pos === taggedWords[tagIndex].start) {
      words.push({
        word: taggedWords[tagIndex].word,
        strongs: taggedWords[tagIndex].strongs
      })
      pos = taggedWords[tagIndex].end
      tagIndex++
      continue
    }

    // Check if we're approaching a tagged word
    const nextTagStart = tagIndex < taggedWords.length ? taggedWords[tagIndex].start : text.length

    // Extract untagged text before next tag
    const segment = text.substring(pos, nextTagStart)

    // Clean and split untagged segment
    const cleaned = segment
      .replace(/\\[a-z]+\*?/g, '') // Remove USFM tags
      .replace(/[.,;:!?"""''„‚()—–]/g, ' ') // Remove punctuation

    const untaggedWords = cleaned.split(/\s+/).filter((w) => w.length > 0)
    for (const w of untaggedWords) {
      words.push({ word: w })
    }

    pos = nextTagStart
  }

  return words
}

// Gloss a word using Strong's first, then dictionary fallback
function glossWord(
  parsedWord: ParsedWord,
  strongsLookup: StrongsLookup,
  dictionary: Dictionary
): GlossedWord {
  const { word, strongs } = parsedWord

  // Try Strong's number first
  if (strongs && strongsLookup[strongs]) {
    return {
      word,
      gloss: strongsLookup[strongs],
      confidence: 'high',
      source: 'strongs'
    }
  }

  // Fall back to dictionary
  const key = word.toLowerCase()
  const entries = dictionary[key]

  if (!entries || entries.length === 0) {
    return { word, gloss: `[${word}]`, confidence: 'unknown', source: 'none' }
  }

  if (entries.length === 1) {
    return { word, gloss: entries[0], confidence: 'high', source: 'dictionary' }
  }

  if (entries.length === 2) {
    return { word, gloss: entries[0], confidence: 'medium', source: 'dictionary' }
  }

  // 3+ meanings - ambiguous
  return { word, gloss: entries[0], confidence: 'low', source: 'dictionary' }
}

// Gloss entire verse and check for issues
function glossVerse(
  verse: ParsedVerse,
  strongsLookup: StrongsLookup,
  dictionary: Dictionary
): GlossedVerse {
  const glossedWords = verse.words.map((w) => glossWord(w, strongsLookup, dictionary))

  // Check for consecutive duplicate glosses
  let hasIssues = false
  const commonRepeats = ['and', 'the', 'of', 'to', 'in', 'a', 'that', 'was', 'is']

  for (let i = 1; i < glossedWords.length; i++) {
    const curr = glossedWords[i].gloss.toLowerCase()
    const prev = glossedWords[i - 1].gloss.toLowerCase()
    if (curr === prev && !commonRepeats.includes(curr)) {
      hasIssues = true
      break
    }
  }

  // Check for unknown words
  if (glossedWords.some((w) => w.confidence === 'unknown')) {
    hasIssues = true
  }

  return {
    ref: `${verse.chapter}:${verse.verse}`,
    words: glossedWords,
    hasIssues
  }
}

// Convert to TSV format
function toTsvLine(verse: GlossedVerse): string {
  const pairs = verse.words.map((w) => `${w.word}|${w.gloss}`).join(' ')
  return `${verse.ref}\t${pairs}`
}

// Main
function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log('Usage: npx tsx tools/interlinear/usfm-to-tsv.ts <usfm-file>')
    console.log('Example: npx tsx tools/interlinear/usfm-to-tsv.ts data/original-bible/deu1912_usfm/02-GENdeu1912.usfm')
    process.exit(1)
  }

  const usfmPath = args[0]
  if (!fs.existsSync(usfmPath)) {
    console.log(`File not found: ${usfmPath}`)
    process.exit(1)
  }

  // Paths
  const toolsDir = path.dirname(__filename)
  const projectDir = path.resolve(toolsDir, '../..')
  const dictPath = path.join(toolsDir, 'dictionaries/dictionary-de-en.json')
  const strongsPath = path.join(toolsDir, 'dictionaries/strongs-lookup.json')
  const outputDir = path.join(toolsDir, 'output')

  // Load lookups
  console.log('Loading Strong\'s lexicon...')
  const strongsLookup = loadStrongsLookup(strongsPath)
  console.log(`Strong's: ${Object.keys(strongsLookup).length} entries`)

  console.log('Loading dictionary...')
  const dictionary = loadDictionary(dictPath)
  console.log(`Dictionary: ${Object.keys(dictionary).length} words`)

  // Parse USFM
  console.log(`\nParsing: ${usfmPath}`)
  const content = fs.readFileSync(usfmPath, 'utf-8')
  const verses = parseUsfm(content)
  console.log(`Found ${verses.length} verses`)

  // Count words with Strong's numbers
  let withStrongs = 0
  let withoutStrongs = 0
  verses.forEach((v) => {
    v.words.forEach((w) => {
      if (w.strongs) withStrongs++
      else withoutStrongs++
    })
  })
  console.log(`Words with Strong's: ${withStrongs}`)
  console.log(`Words without Strong's: ${withoutStrongs}`)

  // Gloss verses
  const glossed = verses.map((v) => glossVerse(v, strongsLookup, dictionary))

  // Stats
  const withIssues = glossed.filter((v) => v.hasIssues)
  const unknownWords = new Set<string>()
  let fromStrongs = 0
  let fromDict = 0

  glossed.forEach((v) => {
    v.words.forEach((w) => {
      if (w.confidence === 'unknown') unknownWords.add(w.word)
      if (w.source === 'strongs') fromStrongs++
      if (w.source === 'dictionary') fromDict++
    })
  })

  console.log(`\nResults:`)
  console.log(`  Total verses: ${glossed.length}`)
  console.log(`  Glossed from Strong's: ${fromStrongs}`)
  console.log(`  Glossed from dictionary: ${fromDict}`)
  console.log(`  Verses with issues: ${withIssues.length}`)
  console.log(`  Unknown words: ${unknownWords.size}`)

  if (unknownWords.size > 0 && unknownWords.size <= 30) {
    console.log(`  Unknown: ${[...unknownWords].join(', ')}`)
  }

  // Output TSV
  const bookName = path.basename(usfmPath, '.usfm').replace(/^\d+-/, '').replace(/deu1912$/, '').toLowerCase()
  const tsvPath = path.join(outputDir, `${bookName}.tsv`)
  const tsvContent = glossed.map(toTsvLine).join('\n') + '\n'
  fs.writeFileSync(tsvPath, tsvContent)
  console.log(`\nTSV saved: ${tsvPath}`)

  // Output issues report
  if (withIssues.length > 0) {
    const issuesPath = path.join(outputDir, `${bookName}-issues.txt`)
    let issuesContent = `# Verses needing AI review\n\n`
    for (const v of withIssues.slice(0, 100)) {
      issuesContent += `${v.ref}: ${v.words.map((w) => w.word).join(' ')}\n`
      issuesContent += `Current: ${v.words.map((w) => w.gloss).join(' ')}\n\n`
    }
    fs.writeFileSync(issuesPath, issuesContent)
    console.log(`Issues saved: ${issuesPath}`)
  }
}

main()
