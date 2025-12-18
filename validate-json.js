const fs = require('fs');

const data = JSON.parse(fs.readFileSync('./data/genesis_interlinear.json', 'utf-8'));

console.log('Chapters:', data.chapters.length);
console.log('Chapter 1 verses:', data.chapters[0].verses.length);
console.log('Chapter 50 verses:', data.chapters[49].verses.length);

let totalVerses = 0;
for (const chapter of data.chapters) {
    totalVerses += chapter.verses.length;
}
console.log('Total verses:', totalVerses);

// Show sample from chapter 1 verse 1
console.log('Sample (1:1):', JSON.stringify(data.chapters[0].verses[0].words.slice(0, 3)));

// Show sample from chapter 50 last verse
const ch50 = data.chapters[49];
const lastVerse = ch50.verses[ch50.verses.length - 1];
console.log('Sample (50:' + lastVerse.number + '):', JSON.stringify(lastVerse.words.slice(-3)));
