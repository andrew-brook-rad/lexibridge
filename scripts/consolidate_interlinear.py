#!/usr/bin/env python3
"""
Consolidate Interlinear TSV Files into JSON

Reads all TSV files from the interlinear directory and merges them into
a single JSON file with the following structure:

{
  "chapters": [
    {
      "number": 1,
      "verses": [
        {
          "number": 1,
          "words": [
            {"de": "Am", "en": "IN-THE"},
            {"de": "Anfang", "en": "BEGINNING"},
            ...
          ]
        }
      ]
    }
  ]
}
"""

import os
import json
import glob
import re


def parse_tsv_file(filepath):
    """Parse a single TSV file and return verses."""
    verses = []

    with open(filepath, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue

            # Split by tab
            parts = line.split('\t')
            if len(parts) != 2:
                continue

            ref, word_pairs = parts

            # Parse reference (chapter:verse)
            ref_match = re.match(r'(\d+):(\d+)', ref)
            if not ref_match:
                continue

            chapter = int(ref_match.group(1))
            verse_num = int(ref_match.group(2))

            # Parse word pairs
            words = []
            for pair in word_pairs.split(' '):
                if '|' in pair:
                    de, en = pair.split('|', 1)
                    words.append({'de': de, 'en': en})

            verses.append({
                'chapter': chapter,
                'verse': verse_num,
                'words': words
            })

    return verses


def consolidate_files(input_dir, output_file):
    """Consolidate all TSV files into a single JSON file."""

    # Get all TSV files
    tsv_files = sorted(glob.glob(os.path.join(input_dir, '*.tsv')))

    if not tsv_files:
        print(f"No TSV files found in {input_dir}")
        return

    print(f"Found {len(tsv_files)} TSV files")

    # Parse all files
    all_verses = []
    for filepath in tsv_files:
        print(f"  Processing {os.path.basename(filepath)}...")
        verses = parse_tsv_file(filepath)
        all_verses.extend(verses)

    print(f"Total verses: {len(all_verses)}")

    # Organize by chapter
    chapters_dict = {}
    for verse in all_verses:
        chapter_num = verse['chapter']
        if chapter_num not in chapters_dict:
            chapters_dict[chapter_num] = {
                'number': chapter_num,
                'verses': []
            }

        chapters_dict[chapter_num]['verses'].append({
            'number': verse['verse'],
            'words': verse['words']
        })

    # Sort chapters and verses
    chapters = []
    for chapter_num in sorted(chapters_dict.keys()):
        chapter = chapters_dict[chapter_num]
        chapter['verses'] = sorted(chapter['verses'], key=lambda v: v['number'])
        chapters.append(chapter)

    # Build output structure
    output = {
        'chapters': chapters
    }

    # Write JSON
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"Wrote {len(chapters)} chapters to {output_file}")


if __name__ == '__main__':
    # Default paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.dirname(script_dir)

    input_dir = os.path.join(project_dir, 'data', 'interlinear')
    output_file = os.path.join(project_dir, 'data', 'genesis_interlinear.json')

    consolidate_files(input_dir, output_file)
