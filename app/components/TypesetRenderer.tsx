
'use client'

import { useMemo } from 'react'
import { BookProject, Page, PrintSettings } from '@/types'
import { layoutBook } from '@/app/lib/typesetter/layout'
import TypesetToken from './TypesetToken'

interface TypesetRendererProps {
    project: BookProject
    editMode: boolean
    onTokenClick?: (chapterIndex: number, paragraphIndex: number, tokenIndex: number) => void
    previewPageType?: 'recto' | 'verso'
    reflowKey?: number
}

export default function TypesetRenderer({ project, editMode, onTokenClick, previewPageType = 'recto', reflowKey }: TypesetRendererProps) {
    const { chapters, printSettings } = project

    // Run layout engine
    // Memoize this heavily - it's expensive!
    const pages = useMemo(() => {
        // Use layoutBook to flow all chapters continuously with inline chapter markers
        return layoutBook(chapters, printSettings)
    }, [chapters, printSettings, reflowKey])

    return (
        <div className="typeset-content">
            {pages.map((page, pageIndex) => (
                <div key={pageIndex} className="page-content mb-8">
                    {/* Render lines */}
                    {page.lines.map((line, lineIndex) => (
                        <div
                            key={lineIndex}
                            className="typeset-line whitespace-nowrap overflow-visible"
                            style={{
                                textAlign: 'left',
                                lineHeight: 'var(--line-height)',
                            }}
                        >
                            {line.tokens.map((lineToken, tIndex) => (
                                <TypesetToken
                                    key={tIndex}
                                    token={lineToken.token}
                                    marginRight={lineToken.marginRight}
                                    isEditing={editMode}
                                    onClick={
                                        // We need to map back to original indices if possible.
                                        // The layout engine flattened structure loses easy index access unless we preserve it.
                                        // For now, click verification might be tricky without metadata directly on token.
                                        // We'll skip click handler for this pass or need to add metadata to token during measure.
                                        undefined
                                    }
                                />
                            ))}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}
