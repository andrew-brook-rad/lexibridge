'use client'

import { WordToken } from '@/types'

interface InterlinearWordProps {
  token: WordToken
  isEditing?: boolean
  onClick?: () => void
}

export default function InterlinearWord({ token, isEditing, onClick }: InterlinearWordProps) {
  const isClickable = !!onClick

  return (
    <span
      className={`word-unit ${isEditing ? 'editing' : ''} ${isClickable ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      title={isClickable ? 'Click to edit' : undefined}
    >
      {token.parts.map((part, index) => (
        <ruby key={index}>
          <span className="source-text">{part.text}</span>
          <rt className="gloss-text">{part.gloss}</rt>
        </ruby>
      ))}
    </span>
  )
}
