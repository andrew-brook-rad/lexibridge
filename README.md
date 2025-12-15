# LexiBridge Lite - Biblical Interlinear Generator

A Next.js tool for generating professional, print-ready interlinear books, with a primary focus on Biblical texts (German to English).

## Features

- **Morphological Tokenization**: Splits German compound words into meaningful parts using AI
- **The "Lego Method"**: Words break naturally across lines at morpheme boundaries
- **Biblical Formatting**: Verse numbers, chapter headers, and book titles
- **Print-Ready Output**: CSS Paged Media with KDP/IngramSpark safe margins
- **Interactive Editor**: Click to edit glosses and split points
- **Configurable Settings**: Page size, margins, font sizes with live preview

## Quick Start

### Prerequisites

- Node.js 18+
- npm
- OpenAI API key

### Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd lexibridge
   ```

2. Create your environment file:
   ```bash
   cp .env.example .env.local
   ```

3. Add your OpenAI API key to `.env.local`:
   ```
   OPENAI_API_KEY=sk-your-key-here
   ```

4. Run the setup script:
   ```bash
   chmod +x init.sh
   ./init.sh
   ```

   Or manually:
   ```bash
   npm install
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Usage

1. **Input Text**: Paste German biblical text (e.g., Luther Bible 1912)
2. **Translate**: Click to process through the AI translation engine
3. **Preview**: View the interlinear rendering with UPPERCASE glosses
4. **Adjust Settings**: Change page size, margins, and font sizes
5. **Edit**: Click any word to modify glosses or split points
6. **Print**: Use browser print (Ctrl/Cmd+P) to generate PDF

## Sample Text

```
1 Am Anfang schuf Gott Himmel und Erde. 2 Und die Erde war wüst und leer, und es war finster auf der Tiefe; und der Geist Gottes schwebte auf dem Wasser. 3 Und Gott sprach: Es werde Licht! und es ward Licht.
```

## Print Settings

- **Page Sizes**: 6x9", 5.5x8.5", A5, Custom
- **KDP Margins**: Inner 0.875", Outer 0.5", Top/Bottom 0.75"
- **Font Sizes**: Adjustable base size (10-14pt)

## Tech Stack

- **Framework**: Next.js 14+ with App Router (TypeScript)
- **Styling**: Tailwind CSS + Custom CSS Paged Media
- **State**: React Hooks + LocalStorage
- **AI**: OpenAI API (gpt-4o-mini)

## Project Structure

```
lexibridge/
├── app/
│   ├── api/translate/    # Server-side AI translation
│   ├── components/       # React components
│   └── page.tsx          # Main application
├── public/               # Static assets
├── styles/               # CSS files
└── types/                # TypeScript definitions
```

## Development

```bash
# Development server
npm run dev

# Production build
npm run build
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

## Deployment

This project is configured for Vercel deployment:

1. Push to main branch
2. Vercel auto-deploys
3. Add `OPENAI_API_KEY` in Vercel Environment Variables

## License

MIT
