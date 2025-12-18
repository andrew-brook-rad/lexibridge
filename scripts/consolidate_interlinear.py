#!/usr/bin/env python3
"""
Consolidate Interlinear TSV Files into LexiBridge JSON Format

Reads TSV files (format: "1:1\tAm|in-the Anfang|beginning ...") and outputs
JSON following docs/BIBLE_JSON_FORMAT.md
"""

import os
import json
import re

def parse_tsv_file(filepath):
    """Parse TSV file, return list of (chapter, verse, words)."""
    verses = []
    with open(filepath, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            parts = line.split('\t')
            if len(parts) != 2:
                continue
            ref, word_pairs = parts
            match = re.match(r'(\d+):(\d+)', ref)
            if not match:
                continue
            words = []
            for pair in word_pairs.split(' '):
                if '|' in pair:
                    de, en = pair.split('|', 1)
                    words.append((de, en))
            verses.append((int(match.group(1)), int(match.group(2)), words))
    return verses

def build_chapter_tokens(verses):
    """Convert verses to token array (one paragraph per chapter)."""
    tokens = []
    for verse_num, words in verses:
        tokens.append({"type": "verse_num", "value": str(verse_num)})
        for de, en in words:
            tokens.append({
                "type": "word",
                "original_full": de,
                "parts": [{"text": de, "gloss": en.upper()}]
            })
    return tokens

DEFAULT_PRINT_SETTINGS = {
    "pageSize": "6x9",
    "margins": {"top": 0.75, "bottom": 0.75, "inner": 0.875, "outer": 0.5},
    "baseFontSize": 12,
    "typography": {
        "mainFont": "Georgia, serif",
        "mainFontSize": 10,
        "glossFont": "Inter, sans-serif",
        "glossFontSize": 5,
        "verseNumSize": 6,
        "verseNumColor": "#6b7280",
        "verseNumOffset": -2,
        "verseNumOffsetX": 1,
        "lineHeight": 1.8,
        "minWordSpace": 1.5,
        "maxWordSpace": 8.0
    }
}

def consolidate_file(tsv_file, output_file, title, language="DE"):
    """Convert a single TSV file into LexiBridge JSON format."""
    if not os.path.exists(tsv_file):
        print(f"TSV file not found: {tsv_file}")
        return

    all_verses = parse_tsv_file(tsv_file)

    # Group by chapter
    chapters_dict = {}
    for chapter, verse, words in all_verses:
        if chapter not in chapters_dict:
            chapters_dict[chapter] = []
        chapters_dict[chapter].append((verse, words))

    # Build output
    chapters = []
    for chapter_num in sorted(chapters_dict.keys()):
        verses = sorted(chapters_dict[chapter_num], key=lambda x: x[0])
        tokens = build_chapter_tokens(verses)
        chapters.append({"number": chapter_num, "paragraphs": [tokens]})

    output = {
        "meta": {"title": title, "language": language},
        "printSettings": DEFAULT_PRINT_SETTINGS,
        "chapters": chapters
    }

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"Wrote {len(chapters)} chapters to {output_file}")

if __name__ == '__main__':
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.dirname(script_dir)
    input_dir = os.path.join(project_dir, 'tools', 'interlinear', 'output')
    bibles_dir = os.path.join(project_dir, 'data', 'bibles')

    # Book configurations: (tsv_name, folder_name, title)
    books = [
        ('gen', 'genesis-de', 'Genesis'),
        ('exo', 'exodus-de', 'Exodus'),
    ]

    for tsv_name, folder_name, title in books:
        tsv_file = os.path.join(input_dir, f'{tsv_name}.tsv')
        if not os.path.exists(tsv_file):
            continue
        output_dir = os.path.join(bibles_dir, folder_name)
        os.makedirs(output_dir, exist_ok=True)
        output_file = os.path.join(output_dir, f'{tsv_name.lower()}.json')
        consolidate_file(tsv_file, output_file, title)
