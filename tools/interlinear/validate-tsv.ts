/**
 * Validate TSV files and flag problematic verses for AI review
 *
 * Flags:
 * - Consecutive duplicate glosses (e.g., "walked walked")
 * - Words not in dictionary
 * - Words with multiple possible meanings
 *
 * Usage: npx ts-node tools/interlinear/validate-tsv.ts
 */

import * as fs from 'fs'
import * as path from 'path'

interface Issue {
  type: 'duplicate' | 'unknown' | 'ambiguous'
  details: string
}

interface FlaggedVerse {
  ref: string
  original: string
  glossed: string
  issues: Issue[]
}

type Dictionary = Record<string, string[]>

function loadDictionary(dictPath: string): Dictionary {
  if (!fs.existsSync(dictPath)) {
    console.log('Dictionary not found. Run build-dictionary.ts first.')
    process.exit(1)
  }
  return JSON.parse(fs.readFileSync(dictPath, 'utf-8'))
}

function validateVerse(
  ref: string,
  wordPairs: string,
  dictionary: Dictionary
): FlaggedVerse | null {
  const issues: Issue[] = []
  const pairs = wordPairs.split(' ').filter(p => p.includes('|'))
  const glosses = pairs.map(p => p.split('|')[1]?.toLowerCase())

  // Check for consecutive duplicate glosses
  for (let i = 1; i < glosses.length; i++) {
    if (glosses[i] && glosses[i] === glosses[i - 1]) {
      // Check if it's not a common repeated word (and, the, etc)
      const commonRepeats = ['and', 'the', 'of', 'to', 'in', 'a']
      if (!commonRepeats.includes(glosses[i])) {
        issues.push({
          type: 'duplicate',
          details: `"${glosses[i]}" repeated at positions ${i}, ${i + 1}`
        })
      }
    }
  }

  // Check for unknown or ambiguous words
  for (const pair of pairs) {
    const [de, en] = pair.split('|', 2)
    if (!de) continue

    const key = de.toLowerCase()
    const dictEntries = dictionary[key]

    if (!dictEntries) {
      issues.push({
        type: 'unknown',
        details: `"${de}" not in dictionary`
      })
    } else if (dictEntries.length >= 3) {
      issues.push({
        type: 'ambiguous',
        details: `"${de}" has ${dictEntries.length} meanings: ${dictEntries.slice(0, 3).join(', ')}...`
      })
    }
  }

  if (issues.length === 0) return null

  // Extract original German text
  const original = pairs.map(p => p.split('|')[0]).join(' ')
  const glossed = pairs.map(p => p.split('|')[1]).join(' ')

  return { ref, original, glossed, issues }
}

function validateTsvFiles(tsvDir: string, dictionary: Dictionary): FlaggedVerse[] {
  const flagged: FlaggedVerse[] = []
  const files = fs.readdirSync(tsvDir).filter(f => f.endsWith('.tsv'))

  for (const file of files) {
    const content = fs.readFileSync(path.join(tsvDir, file), 'utf-8')

    for (const line of content.split('\n')) {
      if (!line.trim()) continue
      const [ref, wordPairs] = line.split('\t')
      if (!ref || !wordPairs) continue

      const result = validateVerse(ref, wordPairs, dictionary)
      if (result) {
        flagged.push(result)
      }
    }
  }

  return flagged
}

function generateReport(flagged: FlaggedVerse[], outputPath: string) {
  const duplicates = flagged.filter(v => v.issues.some(i => i.type === 'duplicate'))
  const unknowns = flagged.filter(v => v.issues.some(i => i.type === 'unknown'))

  let report = `# TSV Validation Report\n\n`
  report += `Total flagged verses: ${flagged.length}\n`
  report += `- Duplicate glosses: ${duplicates.length}\n`
  report += `- Unknown words: ${unknowns.length}\n\n`

  report += `## Duplicate Glosses (Priority)\n\n`
  report += `These verses have consecutive repeated English glosses:\n\n`

  for (const verse of duplicates.slice(0, 50)) {
    report += `### ${verse.ref}\n`
    report += `**German:** ${verse.original}\n`
    report += `**Current:** ${verse.glossed}\n`
    report += `**Issues:**\n`
    for (const issue of verse.issues.filter(i => i.type === 'duplicate')) {
      report += `- ${issue.details}\n`
    }
    report += `\n`
  }

  if (duplicates.length > 50) {
    report += `... and ${duplicates.length - 50} more\n\n`
  }

  fs.writeFileSync(outputPath, report)
  console.log(`\nReport saved to: ${outputPath}`)
}

function generateAiPrompt(flagged: FlaggedVerse[], outputPath: string) {
  const duplicates = flagged.filter(v => v.issues.some(i => i.type === 'duplicate'))

  let prompt = `Review these German Bible verses that have duplicate English glosses.
Provide corrected literal word-for-word translations.

Format your response as TSV: reference<TAB>word1|gloss1 word2|gloss2 ...

---

`
  for (const verse of duplicates.slice(0, 30)) {
    prompt += `${verse.ref}: "${verse.original}"\n`
    prompt += `Current: ${verse.glossed}\n\n`
  }

  fs.writeFileSync(outputPath, prompt)
  console.log(`AI prompt saved to: ${outputPath}`)
}

// Main
const projectDir = path.resolve(__dirname, '../..')
const tsvDir = path.join(projectDir, 'data/interlinear')
const dictPath = path.join(__dirname, 'dictionary-de-en.json')
const reportPath = path.join(__dirname, 'validation-report.md')
const promptPath = path.join(__dirname, 'ai-review-prompt.txt')

console.log('Loading dictionary...')
const dictionary = loadDictionary(dictPath)
console.log(`Dictionary loaded: ${Object.keys(dictionary).length} words`)

console.log('\nValidating TSV files...')
const flagged = validateTsvFiles(tsvDir, dictionary)

console.log(`\nResults:`)
console.log(`  Total verses flagged: ${flagged.length}`)
console.log(`  - Duplicates: ${flagged.filter(v => v.issues.some(i => i.type === 'duplicate')).length}`)
console.log(`  - Unknown words: ${flagged.filter(v => v.issues.some(i => i.type === 'unknown')).length}`)
console.log(`  - Ambiguous: ${flagged.filter(v => v.issues.some(i => i.type === 'ambiguous')).length}`)

generateReport(flagged, reportPath)
generateAiPrompt(flagged, promptPath)
