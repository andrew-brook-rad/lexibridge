const fs = require('fs');
const data = JSON.parse(fs.readFileSync('feature_list.json', 'utf-8'));
const failing = data.filter(t => !t.passes);
failing.forEach((t, i) => console.log((i+1) + '. ' + t.description));
console.log('\nTotal failing: ' + failing.length);
