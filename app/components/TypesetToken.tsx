
'use client'

import { Token, WordPart } from '@/types'

interface TypesetTokenProps {
    token: Token
    marginRight: number
    debug?: boolean
    onClick?: () => void
    isEditing?: boolean
}

export default function TypesetToken({ token, marginRight, debug, onClick, isEditing }: TypesetTokenProps) {
    const style = {
        marginRight: `${marginRight}px`,
    }

    // Debug visualizer for token box
    const debugClass = debug ? 'outline outline-1 outline-blue-300' : ''
    const isClickable = !!onClick

    if (token.type === 'verse_num') {
        return (
            <span
                className={`verse-number inline-block ${debugClass}`}
                style={{
                    ...style,
                    overflow: 'visible',
                    whiteSpace: 'nowrap',
                    position: 'relative',
                    verticalAlign: 'baseline',
                    marginRight: '0.1em',
                    fontSize: 'var(--font-size-verse)',
                    fontWeight: 'bold',
                    color: 'var(--verse-color)',
                    transform: `translate(var(--verse-offset-x), var(--verse-offset))`,
                }}
            >
                {token.value}
            </span>
        )
    }

    if (token.type === 'chapter_num') {
        // Large decorative chapter number inline with text
        return (
            <span
                className={`chapter-num inline-block align-top ${debugClass}`}
                style={{
                    ...style,
                    fontSize: 'var(--font-size-chapter)',
                    fontWeight: 'bold',
                    lineHeight: '1',
                    color: '#1f2937',
                    fontFamily: 'var(--font-main)',
                    paddingRight: '4px',
                    verticalAlign: 'top',
                }}
            >
                {token.value}
            </span>
        )
    }

    if (token.type === 'punctuation') {
        return (
            <span
                className={`punctuation inline-block ${debugClass}`}
                style={style}
            >
                {token.value}
            </span>
        )
    }

    if (token.type === 'word') {
        return (
            <span
                className={`word-unit inline-block align-top ${debugClass} ${isEditing ? 'editing' : ''} ${isClickable ? 'cursor-pointer' : ''}`}
                style={style}
                onClick={onClick}
            >
                {token.parts.map((part, index) => {
                    // Internal spacing for compound words (0.25em), zero for last part
                    const isLast = index === token.parts.length - 1
                    const rubyMargin = isLast ? 0 : '0.25em'

                    return (
                        <span key={index} className="morpheme-unit" style={{
                            display: 'inline-block',
                            width: part.width ? `${part.width}px` : 'auto',
                            textAlign: 'center',
                            marginRight: rubyMargin,
                            verticalAlign: 'top',
                        }}>
                            <span className="source-text" style={{
                                display: 'block',
                                fontFamily: 'var(--font-main)',
                                fontSize: 'var(--font-size-main)',
                                textAlign: 'center',
                            }}>{part.text}</span>
                            <span className="gloss-text" style={{
                                display: 'block',
                                fontFamily: 'var(--font-gloss)',
                                fontSize: 'var(--font-size-gloss)',
                                textTransform: 'lowercase',
                                textAlign: 'center',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}>{part.gloss}</span>
                        </span>
                    )
                })}
            </span>
        )
    }

    return null
}
