/**
 * Consolidate Interlinear TSV Files into JSON
 *
 * Reads all TSV files from the interlinear directory and merges them into
 * a single JSON file with the following structure:
 *
 * {
 *   "chapters": [
 *     {
 *       "number": 1,
 *       "verses": [
 *         {
 *           "number": 1,
 *           "words": [
 *             {"de": "Am", "en": "IN-THE"},
 *             {"de": "Anfang", "en": "BEGINNING"},
 *             ...
 *           ]
 *         }
 *       ]
 *     }
 *   ]
 * }
 */

const fs = require('fs');
const path = require('path');

/**
 * Parse a single TSV file and return verses
 * @param {string} filepath - Path to TSV file
 * @returns {Array} Array of verse objects
 */
function parseTsvFile(filepath) {
  const content = fs.readFileSync(filepath, 'utf-8');
  const lines = content.split('\n');
  const verses = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Split by tab
    const parts = trimmed.split('\t');
    if (parts.length !== 2) continue;

    const [ref, wordPairs] = parts;

    // Parse reference (chapter:verse)
    const refMatch = ref.match(/^(\d+):(\d+)$/);
    if (!refMatch) continue;

    const chapter = parseInt(refMatch[1], 10);
    const verseNum = parseInt(refMatch[2], 10);

    // Parse word pairs
    const words = [];
    for (const pair of wordPairs.split(' ')) {
      if (pair.includes('|')) {
        const [de, en] = pair.split('|', 2);
        words.push({ de, en });
      }
    }

    verses.push({
      chapter,
      verse: verseNum,
      words
    });
  }

  return verses;
}

/**
 * Consolidate all TSV files into a single JSON file
 * @param {string} inputDir - Directory containing TSV files
 * @param {string} outputFile - Path to output JSON file
 */
function consolidateFiles(inputDir, outputFile) {
  // Get all TSV files
  const files = fs.readdirSync(inputDir)
    .filter(f => f.endsWith('.tsv'))
    .sort()
    .map(f => path.join(inputDir, f));

  if (files.length === 0) {
    console.log(`No TSV files found in ${inputDir}`);
    return;
  }

  console.log(`Found ${files.length} TSV files`);

  // Parse all files
  const allVerses = [];
  for (const filepath of files) {
    console.log(`  Processing ${path.basename(filepath)}...`);
    const verses = parseTsvFile(filepath);
    allVerses.push(...verses);
  }

  console.log(`Total verses: ${allVerses.length}`);

  // Organize by chapter
  const chaptersDict = {};
  for (const verse of allVerses) {
    const chapterNum = verse.chapter;
    if (!chaptersDict[chapterNum]) {
      chaptersDict[chapterNum] = {
        number: chapterNum,
        verses: []
      };
    }

    chaptersDict[chapterNum].verses.push({
      number: verse.verse,
      words: verse.words
    });
  }

  // Sort chapters and verses
  const chapters = [];
  const chapterNums = Object.keys(chaptersDict).map(n => parseInt(n, 10)).sort((a, b) => a - b);

  for (const chapterNum of chapterNums) {
    const chapter = chaptersDict[chapterNum];
    chapter.verses.sort((a, b) => a.number - b.number);
    chapters.push(chapter);
  }

  // Build output structure
  const output = { chapters };

  // Write JSON
  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`Wrote ${chapters.length} chapters to ${outputFile}`);
}

// Main execution
if (require.main === module) {
  const scriptDir = __dirname;
  const projectDir = path.dirname(scriptDir);

  const inputDir = path.join(projectDir, 'data', 'interlinear');
  const outputFile = path.join(projectDir, 'data', 'genesis_interlinear.json');

  consolidateFiles(inputDir, outputFile);
}

module.exports = { parseTsvFile, consolidateFiles };
