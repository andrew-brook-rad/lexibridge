# AI Review Instructions for German Interlinear Translation

## Your Task
Review the flagged verses in `gen-issues.txt` and provide corrections for `gen.tsv`.

## German Grammar Patterns to Handle

### 1. Separable Verbs (Trennbare Verben)
German separable verbs split into prefix + verb. The prefix often appears at the end of the clause.

**Example:** "aufgehen" (to rise/sprout)
- "Es lasse die Erde **aufgehen** Gras" → The prefix stays with the verb
- "Die Sonne **ging** ... **auf**" → Separated: "ging" = went, "auf" = UP (particle)

**Rule:** When a prefix (auf, an, aus, ein, mit, vor, zu, etc.) appears alone, gloss it as a particle:
- `auf|UP` or `auf|FORTH` (verbal particle, leave blank gloss is also acceptable: `auf|—`)
- `hervor|FORTH`
- `hinein|INTO`

### 2. Idiomatic Death Phrases
"des Todes sterben" = "surely die" (Hebrew idiom: מות תמות)

**Correct glossing:**
- `des|OF-THE Todes|DEATH sterben|DIE` → Literally "of-the death die"
- OR use: `des|SURELY Todes|— sterben|DIE`

Do NOT gloss as: `die die`

### 3. Reflexive Pronouns
"sich" often accompanies verbs and doesn't need a heavy gloss.
- `sich|ITSELF` or `sich|—` (reflexive marker)

### 4. Contracted Words
German contracts articles with prepositions:
- `im` = in + dem → `im|IN-THE`
- `am` = an + dem → `am|ON-THE`
- `zum` = zu + dem → `zum|TO-THE`
- `vom` = von + dem → `vom|FROM-THE`

### 5. Words That Can Be Left Blank
Some grammatical words don't translate well word-for-word. Use `—` for:
- Verbal particles when separated: `auf|—` (the meaning is in the main verb)
- Expletive "es": `es|—` when it's a dummy subject
- Redundant reflexives: `sich|—`

## Output Format

Provide corrections in TSV format:
```
VERSE_REF<TAB>word1|gloss1 word2|gloss2 ...
```

Example:
```
1:24	Und|AND Gott|GOD sprach|SAID Die|THE Erde|EARTH bringe|BRING hervor|FORTH ...
```

## Common Fixes Needed

| Pattern | Wrong | Correct |
|---------|-------|---------|
| Separable verb | `bringe|BRING hervor|BRING` | `bringe|BRING hervor|FORTH` |
| Death idiom | `Todes|DIE sterben|DIE` | `Todes|DEATH sterben|DIE` |
| Repeated gloss | `creep|CREEP creep|CREEP` | Check context, fix root cause |
| Unknown word | `[rührt]` | `rührt|TOUCH` |

## Verses to Review

See `gen-issues.txt` for the list of flagged verses.
