const fs = require('fs');
const path = require('path');

const interlinearDir = './data/interlinear';
const files = fs.readdirSync(interlinearDir).filter(f => f.endsWith('.tsv')).sort();

console.log('TSV File Verification:');
console.log('='.repeat(60));

let totalLines = 0;
let allOk = true;

for (const file of files) {
    const content = fs.readFileSync(path.join(interlinearDir, file), 'utf-8');
    const lines = content.trim().split('\n').filter(l => l.trim());

    // Extract chapter range from filename
    const match = file.match(/genesis_(\d+)-(\d+)\.tsv/);
    if (!match) continue;

    const startChapter = parseInt(match[1]);
    const endChapter = parseInt(match[2]);

    // Check which chapters are present
    const chaptersFound = new Set();
    let hasValidFormat = true;

    for (const line of lines) {
        const parts = line.split('\t');
        if (parts.length !== 2) {
            hasValidFormat = false;
            continue;
        }
        const refMatch = parts[0].match(/^(\d+):\d+$/);
        if (refMatch) {
            chaptersFound.add(parseInt(refMatch[1]));
        }
    }

    const expectedChapters = [];
    for (let i = startChapter; i <= endChapter; i++) {
        expectedChapters.push(i);
    }

    const missingChapters = expectedChapters.filter(c => !chaptersFound.has(c));

    const status = missingChapters.length === 0 && hasValidFormat ? 'OK' : 'ISSUE';
    if (status !== 'OK') allOk = false;

    console.log(`${file}: ${lines.length} verses, chapters ${[...chaptersFound].sort((a,b)=>a-b).join(',')} [${status}]`);
    if (missingChapters.length > 0) {
        console.log(`  Missing chapters: ${missingChapters.join(', ')}`);
    }

    totalLines += lines.length;
}

console.log('='.repeat(60));
console.log(`Total verses across all files: ${totalLines}`);
console.log(`Overall status: ${allOk ? 'ALL FILES OK' : 'SOME ISSUES FOUND'}`);
