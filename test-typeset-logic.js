
// Mock strict mode
'use strict';

// Mock types
const mockSettings = {
    baseFontSize: 12,
    pageSize: '6x9',
    margins: { inner: 0, outer: 0, top: 0, bottom: 0 } // Zero margins for easier math
};

// Mock Measure Module
const Measure = {
    measureParagraph: (tokens) => {
        return tokens.map(t => {
            // Mock width: 10px per character for simple math
            if (t.type === 'word') {
                return { ...t, width: t.parts[0].text.length * 10 };
            }
            return { ...t, width: 10 }; // punct/verse
        });
    }
};

// Mock the require/import since we are running this as a standalone script potentially
// But we can't easily import TS files in Node without compile step.
// So I will COPY the logic from layout.ts here for verification purposes
// ensuring that the ALGORITHM works.

function testLayoutLogic() {
    console.log('Testing Layout Logic...');

    // --- REPLICATED LOGIC FROM layout.ts ---
    function layoutParagraph(tokens, context) {
        const { maxWidth } = context;
        // Use our mock measure
        const measuredTokens = Measure.measureParagraph(tokens);

        const lines = [];
        let currentLineTokens = []; // { token, width, marginRight }
        let currentLineWidth = 0;
        const baseSpaceWidth = 40; // 40px space for visibility in test

        for (let i = 0; i < measuredTokens.length; i++) {
            const token = measuredTokens[i];
            const tokenWidth = token.width || 0;

            const potentialWidth = currentLineWidth + (currentLineTokens.length > 0 ? baseSpaceWidth : 0) + tokenWidth;

            if (potentialWidth <= maxWidth) {
                if (currentLineTokens.length > 0) {
                    currentLineTokens[currentLineTokens.length - 1].marginRight = baseSpaceWidth;
                    currentLineWidth += baseSpaceWidth;
                }
                currentLineTokens.push({ token, width: tokenWidth, marginRight: 0 });
                currentLineWidth += tokenWidth;
            } else {
                console.log(`Breaking line at "${getTokenText(token)}" (Potential: ${potentialWidth} > Max: ${maxWidth})`);
                if (currentLineTokens.length > 0) {
                    const justifiedLine = justifyLine(currentLineTokens, currentLineWidth, maxWidth);
                    lines.push(justifiedLine);
                }
                currentLineTokens = [{ token, width: tokenWidth, marginRight: 0 }];
                currentLineWidth = tokenWidth;
            }
        }

        if (currentLineTokens.length > 0) {
            lines.push({ tokens: currentLineTokens, width: currentLineWidth, justifySpacing: 0 });
        }

        return lines;
    }

    function justifyLine(lineTokens, currentWidth, maxWidth) {
        const tokenCount = lineTokens.length;
        if (tokenCount <= 1) return { tokens: lineTokens, width: currentWidth };

        const availableSpace = maxWidth - currentWidth;
        const gaps = tokenCount - 1;
        const spacePerGap = availableSpace / gaps;

        console.log(`Justifying: Extra space ${availableSpace} over ${gaps} gaps = +${spacePerGap} per gap`);

        const justifiedTokens = lineTokens.map((t, index) => {
            if (index < gaps) {
                return { ...t, marginRight: t.marginRight + spacePerGap };
            }
            return t;
        });
        return { tokens: justifiedTokens, width: maxWidth };
    }
    // ----------------------------------------

    function getTokenText(t) {
        return t.type === 'word' ? t.parts[0].text : t.value;
    }

    // TEST DATA
    const tokens = [
        { type: 'word', parts: [{ text: 'Hello', gloss: '' }] }, // 50px
        { type: 'word', parts: [{ text: 'World', gloss: '' }] }, // 50px
        { type: 'word', parts: [{ text: 'This', gloss: '' }] },  // 40px
        { type: 'word', parts: [{ text: 'Is', gloss: '' }] },    // 20px
        { type: 'word', parts: [{ text: 'A', gloss: '' }] },     // 10px
        { type: 'word', parts: [{ text: 'Test', gloss: '' }] },  // 40px
    ];

    // Total unspaced width: 50+50+40+20+10+40 = 210
    // Standard spacing (40px)
    // Max width: 200px

    // Line 1 attempt:
    // Hello (50)
    // + gap (40) + World (50) = 140
    // + gap (40) + This (40) = 220 -> EXCEEDS 200
    // So Line 1 should be "Hello World"
    // Width before justify: 140. Max: 200. Extra: 60.
    // Gap: 1. Target Gap: 40 + 60 = 100px.

    // Line 2 attempt:
    // This (40)
    // + gap (40) + Is (20) = 100
    // + gap (40) + A (10) = 150
    // + gap (40) + Test (40) = 230 -> EXCEEDS
    // So Line 2 should be "This Is A"
    // Width: 150. Max: 200. Extra: 50.
    // Gaps: 2. Per gap: 50/2 = 25. Target Gap: 40 + 25 = 65px.

    const lines = layoutParagraph(tokens, { maxWidth: 200, settings: mockSettings });

    console.log('\n--- RESULTS ---');
    lines.forEach((line, i) => {
        const lineText = line.tokens.map(t => getTokenText(t.token)).join(' ');
        const margins = line.tokens.map(t => t.marginRight).slice(0, -1).join(', ');
        console.log(`Line ${i}: "${lineText}" | Margins: [${margins}]`);

        // Verify
        if (i === 0) {
            if (line.tokens[0].marginRight === 100) console.log('PASS: Line 1 justification correct');
            else console.error(`FAIL: Line 1 margin expected 100, got ${line.tokens[0].marginRight}`);
        }
        if (i === 1) {
            if (line.tokens[0].marginRight === 65) console.log('PASS: Line 2 justification correct');
            else console.error(`FAIL: Line 2 margin expected 65, got ${line.tokens[0].marginRight}`);
        }
    });

}

testLayoutLogic();
