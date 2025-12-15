'use client'

import { WordToken } from '@/types'

interface InterlinearWordProps {
  token: WordToken
  isEditing?: boolean
  onClick?: () => void
}

export default function InterlinearWord({ token, isEditing, onClick }: InterlinearWordProps) {
  const isClickable = !!onClick
  const isCompound = token.parts.length > 1

  return (
    <span
      className={`word-unit ${isCompound ? 'compound' : ''} ${isEditing ? 'editing' : ''} ${isClickable ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      title={isClickable ? 'Click to edit' : undefined}
    >
      {token.parts.map((part, index) => (
        <span key={index} className="morpheme-unit">
          {/* Add soft hyphen before parts (except first) to allow line breaking with hyphen */}
          {index > 0 && <span className="soft-hyphen">{'\u00AD'}</span>}
          <ruby>
            <span className="source-text">{part.text}</span>
            <rt className="gloss-text">{part.gloss}</rt>
          </ruby>
        </span>
      ))}
    </span>
  )
}
