/**
 * Build a German-English dictionary from existing TSV files
 *
 * Usage: npx ts-node tools/interlinear/build-dictionary.ts
 */

import * as fs from 'fs'
import * as path from 'path'

interface DictionaryEntry {
  gloss: string
  count: number
}

type Dictionary = Map<string, DictionaryEntry[]>

function parseTsvFiles(dir: string): Dictionary {
  const dictionary: Dictionary = new Map()
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsv'))

  for (const file of files) {
    const content = fs.readFileSync(path.join(dir, file), 'utf-8')

    for (const line of content.split('\n')) {
      if (!line.trim()) continue
      const [_ref, wordPairs] = line.split('\t')
      if (!wordPairs) continue

      for (const pair of wordPairs.split(' ')) {
        if (!pair.includes('|')) continue
        const [de, en] = pair.split('|', 2)
        if (!de || !en) continue

        const key = de.toLowerCase()
        const entries = dictionary.get(key) || []

        const existing = entries.find(e => e.gloss.toLowerCase() === en.toLowerCase())
        if (existing) {
          existing.count++
        } else {
          entries.push({ gloss: en, count: 1 })
        }

        dictionary.set(key, entries)
      }
    }
  }

  return dictionary
}

function exportDictionary(dictionary: Dictionary, outputPath: string) {
  // Sort entries by count (most common first) and convert to plain object
  const output: Record<string, string[]> = {}

  dictionary.forEach((entries, word) => {
    // Sort by count descending, take top glosses
    const sorted = entries.sort((a: DictionaryEntry, b: DictionaryEntry) => b.count - a.count)
    output[word] = sorted.map((e: DictionaryEntry) => e.gloss)
  })

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2))
  console.log(`Dictionary saved: ${Object.keys(output).length} words`)
}

function printStats(dictionary: Dictionary) {
  let totalWords = 0
  let multiMeaning = 0

  dictionary.forEach((entries) => {
    totalWords++
    if (entries.length > 1) multiMeaning++
  })

  console.log(`\nDictionary Stats:`)
  console.log(`  Total unique words: ${totalWords}`)
  console.log(`  Words with multiple glosses: ${multiMeaning}`)
  console.log(`  Single-meaning words: ${totalWords - multiMeaning}`)
}

// Main
const toolsDir = path.dirname(__filename)
const tsvDir = path.join(toolsDir, 'source/legacy-tsv')
const outputPath = path.join(toolsDir, 'dictionaries/dictionary-de-en.json')

console.log(`Reading TSV files from: ${tsvDir}`)
const dictionary = parseTsvFiles(tsvDir)
printStats(dictionary)
exportDictionary(dictionary, outputPath)
