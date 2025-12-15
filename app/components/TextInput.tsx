'use client'

import { useState } from 'react'

interface TextInputProps {
  onTranslate: (text: string) => void
  isLoading: boolean
}

const SAMPLE_TEXT = `1 Am Anfang schuf Gott Himmel und Erde. 2 Und die Erde war wüst und leer, und es war finster auf der Tiefe; und der Geist Gottes schwebte auf dem Wasser. 3 Und Gott sprach: Es werde Licht! und es ward Licht. 4 Und Gott sah, daß das Licht gut war. Da schied Gott das Licht von der Finsternis 5 und nannte das Licht Tag und die Finsternis Nacht. Da ward aus Abend und Morgen der erste Tag.

6 Und Gott sprach: Es werde eine Feste zwischen den Wassern, und die sei ein Unterschied zwischen den Wassern. 7 Da machte Gott die Feste und schied das Wasser unter der Feste von dem Wasser über der Feste. Und es geschah also. 8 Und Gott nannte die Feste Himmel. Da ward aus Abend und Morgen der andere Tag.`

const MULTI_CHAPTER_SAMPLE = `Chapter 1
1 Am Anfang schuf Gott Himmel und Erde. 2 Und die Erde war wüst und leer, und es war finster auf der Tiefe; und der Geist Gottes schwebte auf dem Wasser. 3 Und Gott sprach: Es werde Licht! und es ward Licht.

Chapter 2
1 Also ward vollendet Himmel und Erde mit ihrem ganzen Heer. 2 Und also vollendete Gott am siebenten Tage seine Werke, die er machte. 3 Und Gott segnete den siebenten Tag und heiligte ihn.`

export default function TextInput({ onTranslate, isLoading }: TextInputProps) {
  const [text, setText] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (text.trim()) {
      onTranslate(text)
    }
  }

  const loadSample = () => {
    setText(SAMPLE_TEXT)
  }

  const loadMultiChapterSample = () => {
    setText(MULTI_CHAPTER_SAMPLE)
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">German Source Text</h2>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={loadSample}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Load Genesis 1:1-8
          </button>
          <button
            type="button"
            onClick={loadMultiChapterSample}
            className="text-sm text-green-600 hover:text-green-800"
          >
            Load Multi-Chapter Sample
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste German biblical text here...&#10;&#10;Example: 1 Am Anfang schuf Gott Himmel und Erde..."
          className="w-full h-48 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-serif"
          disabled={isLoading}
        />

        <div className="mt-4 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => setText('')}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
            disabled={isLoading || !text}
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={isLoading || !text.trim()}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading && <span className="loading-spinner" />}
            {isLoading ? 'Translating...' : 'Translate'}
          </button>
        </div>
      </form>
    </div>
  )
}
