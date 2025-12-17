const http = require('http');
const https = require('https');
const fs = require('fs');

const PORT = 3004;
const BASE_URL = `http://localhost:${PORT}`;

async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function fetchJson(path) {
  const res = await fetchUrl(`${BASE_URL}${path}`);
  return { status: res.status, data: JSON.parse(res.data) };
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('SESSION 61 VERIFICATION - LexiBridge Lite');
  console.log('='.repeat(60));
  console.log('');

  const results = [];

  // Test 1: Main page loads
  console.log('Test 1: Main page loads...');
  try {
    const res = await fetchUrl(BASE_URL);
    const passes = res.status === 200 && res.data.includes('LexiBridge');
    results.push({ name: 'Main page loads', passes });
    console.log(`  Status: ${res.status}`);
    console.log(`  Contains LexiBridge: ${res.data.includes('LexiBridge')}`);
    console.log(`  Result: ${passes ? 'PASS' : 'FAIL'}`);
  } catch (e) {
    results.push({ name: 'Main page loads', passes: false, error: e.message });
    console.log(`  Error: ${e.message}`);
  }
  console.log('');

  // Test 2: Check for sample data files
  console.log('Test 2: Sample data files exist...');
  try {
    const res = await fetchUrl(`${BASE_URL}/data/genesis-1-10-translated.json`);
    const passes = res.status === 200;
    results.push({ name: 'Sample data files exist', passes });
    console.log(`  Status: ${res.status}`);
    if (passes) {
      const data = JSON.parse(res.data);
      console.log(`  Has chapters: ${!!data.chapters}`);
      console.log(`  Title: ${data.meta?.title || 'N/A'}`);
    }
    console.log(`  Result: ${passes ? 'PASS' : 'FAIL'}`);
  } catch (e) {
    results.push({ name: 'Sample data files exist', passes: false, error: e.message });
    console.log(`  Error: ${e.message}`);
  }
  console.log('');

  // Test 3: Page structure verification
  console.log('Test 3: Page structure verification...');
  try {
    const res = await fetchUrl(BASE_URL);
    const hasSettingsPanel = res.data.includes('Print Settings') || res.data.includes('settings');
    const hasEditMode = res.data.includes('Edit') || res.data.includes('edit');
    const hasViewModes = res.data.includes('PDF') || res.data.includes('Single') || res.data.includes('Spread');
    const hasSampleButtons = res.data.includes('Genesis') || res.data.includes('sample') || res.data.includes('Load');

    const passes = hasViewModes;
    results.push({ name: 'Page structure', passes });
    console.log(`  Has view modes: ${hasViewModes}`);
    console.log(`  Has settings panel indicators: ${hasSettingsPanel}`);
    console.log(`  Has edit mode indicators: ${hasEditMode}`);
    console.log(`  Has sample load buttons: ${hasSampleButtons}`);
    console.log(`  Result: ${passes ? 'PASS' : 'FAIL'}`);
  } catch (e) {
    results.push({ name: 'Page structure', passes: false, error: e.message });
    console.log(`  Error: ${e.message}`);
  }
  console.log('');

  // Test 4: Check static assets
  console.log('Test 4: Next.js static assets...');
  try {
    const res = await fetchUrl(BASE_URL);
    const hasNextScripts = res.data.includes('_next');
    const passes = hasNextScripts;
    results.push({ name: 'Next.js assets', passes });
    console.log(`  Has _next scripts: ${hasNextScripts}`);
    console.log(`  Result: ${passes ? 'PASS' : 'FAIL'}`);
  } catch (e) {
    results.push({ name: 'Next.js assets', passes: false, error: e.message });
    console.log(`  Error: ${e.message}`);
  }
  console.log('');

  // Summary
  console.log('='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  const passing = results.filter(r => r.passes).length;
  const total = results.length;
  console.log(`Passing: ${passing}/${total}`);
  results.forEach(r => {
    console.log(`  ${r.passes ? '✓' : '✗'} ${r.name}`);
  });
  console.log('');

  if (passing === total) {
    console.log('All basic tests pass! Server is healthy.');
  } else {
    console.log('Some tests failed. See details above.');
  }
}

runTests().catch(console.error);
