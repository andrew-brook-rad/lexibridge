'use client'

import { useState, useEffect, useMemo } from 'react'
import { BookProject } from '@/types'
import { generatePDFDataURL, downloadPDF } from '@/app/lib/pdf/generatePDF'

interface PDFViewerProps {
    project: BookProject
    reflowKey: number
}

export default function PDFViewer({ project, reflowKey }: PDFViewerProps) {
    const [pdfDataURL, setPdfDataURL] = useState<string | null>(null)
    const [isGenerating, setIsGenerating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Generate PDF when project or settings change
    useEffect(() => {
        if (project.chapters.length === 0) {
            setPdfDataURL(null)
            return
        }

        setIsGenerating(true)
        setError(null)

        // Use setTimeout to allow UI to update before heavy PDF generation
        const timer = setTimeout(() => {
            try {
                // Only render pages 2 and 3 for preview (first content spread)
                const dataURL = generatePDFDataURL(project, [2, 3])
                setPdfDataURL(dataURL)
            } catch (err) {
                console.error('PDF generation error:', err)
                setError(err instanceof Error ? err.message : 'Failed to generate PDF')
            } finally {
                setIsGenerating(false)
            }
        }, 50)

        return () => clearTimeout(timer)
    }, [project, reflowKey])

    const handleDownload = () => {
        try {
            downloadPDF(project)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to download PDF')
        }
    }

    if (project.chapters.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500 text-lg">No content yet</p>
                <p className="text-gray-400 text-sm mt-2">
                    Enter German text and click "Translate" to generate interlinear text
                </p>
            </div>
        )
    }

    if (isGenerating) {
        return (
            <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Generating PDF...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-96 bg-red-50 rounded-lg border border-red-200">
                <p className="text-red-600 font-medium">Error generating PDF</p>
                <p className="text-red-500 text-sm mt-2">{error}</p>
                <button
                    onClick={() => setError(null)}
                    className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                    Retry
                </button>
            </div>
        )
    }

    return (
        <div className="pdf-viewer">
            {/* Controls */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-700">PDF Preview (Pages 2-3)</h3>
                <button
                    onClick={handleDownload}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                >
                    Download PDF
                </button>
            </div>

            {/* PDF Embed */}
            {pdfDataURL && (
                <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-100">
                    <iframe
                        src={pdfDataURL}
                        className="w-full"
                        style={{ height: '80vh', minHeight: '600px' }}
                        title="PDF Preview"
                    />
                </div>
            )}
        </div>
    )
}
