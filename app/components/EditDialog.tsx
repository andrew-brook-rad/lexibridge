'use client'

import { useState, useEffect, useRef } from 'react'
import { WordToken, WordPart } from '@/types'

interface EditDialogProps {
  token: WordToken
  onSave: (updatedParts: WordPart[]) => void
  onClose: () => void
}

export default function EditDialog({ token, onSave, onClose }: EditDialogProps) {
  const [parts, setParts] = useState<WordPart[]>(token.parts)
  const dialogRef = useRef<HTMLDivElement>(null)
  const firstInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Focus first input on mount
    firstInputRef.current?.focus()

    // Close on escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    // Close when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const handleGlossChange = (index: number, newGloss: string) => {
    setParts(prev => prev.map((part, i) =>
      i === index ? { ...part, gloss: newGloss.toUpperCase() } : part
    ))
  }

  const handleSave = () => {
    onSave(parts)
    onClose()
  }

  const handleAddSplit = (index: number) => {
    const part = parts[index]
    if (part.text.length <= 1) return

    const midPoint = Math.ceil(part.text.length / 2)
    const text1 = part.text.slice(0, midPoint)
    const text2 = part.text.slice(midPoint)

    const newParts = [...parts]
    newParts.splice(index, 1,
      { text: text1, gloss: part.gloss },
      { text: text2, gloss: '' }
    )
    setParts(newParts)
  }

  const handleMergeParts = (index: number) => {
    if (index >= parts.length - 1) return

    const newParts = [...parts]
    const merged = {
      text: parts[index].text + parts[index + 1].text,
      gloss: parts[index].gloss || parts[index + 1].gloss
    }
    newParts.splice(index, 2, merged)
    setParts(newParts)
  }

  const handleTextChange = (index: number, newText: string) => {
    setParts(prev => prev.map((part, i) =>
      i === index ? { ...part, text: newText } : part
    ))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={dialogRef}
        className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
      >
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          Edit Word: <span className="text-blue-600">{token.original_full}</span>
        </h3>

        <div className="space-y-4">
          {parts.map((part, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-500 uppercase tracking-wide">Part {index + 1}</span>
                {parts.length > 1 && index < parts.length - 1 && (
                  <button
                    onClick={() => handleMergeParts(index)}
                    className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded hover:bg-gray-300"
                  >
                    Merge with next
                  </button>
                )}
                {part.text.length > 1 && (
                  <button
                    onClick={() => handleAddSplit(index)}
                    className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                  >
                    Split
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Source Text</label>
                  <input
                    type="text"
                    value={part.text}
                    onChange={(e) => handleTextChange(index, e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm font-serif"
                    ref={index === 0 ? firstInputRef : undefined}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Gloss (UPPERCASE)</label>
                  <input
                    type="text"
                    value={part.gloss}
                    onChange={(e) => handleGlossChange(index, e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm uppercase"
                    placeholder="GLOSS"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
