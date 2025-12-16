'use client'

import { useState, useEffect, useCallback } from 'react'
import { BookProject, Chapter, DEFAULT_PROJECT, TranslateResponse, WordToken, WordPart } from '@/types'
import SettingsPanel from './components/SettingsPanel'
import PrintPreview from './components/PrintPreview'
import BookSpreadViewer from './components/BookSpreadViewer'
import PDFViewer from './components/PDFViewer'
import TextInput from './components/TextInput'
import EditDialog from './components/EditDialog'

const STORAGE_KEY = 'lexibridge-project'

export default function Home() {
  const [project, setProject] = useState<BookProject>(DEFAULT_PROJECT)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reflowKey, setReflowKey] = useState(0)
  const [settingsCollapsed, setSettingsCollapsed] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [showInput, setShowInput] = useState(true)
  const [editingToken, setEditingToken] = useState<{
    chapterIndex: number
    paragraphIndex: number
    tokenIndex: number
    token: WordToken
  } | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [previewPageType, setPreviewPageType] = useState<'recto' | 'verso'>('recto')
  const [viewMode, setViewMode] = useState<'spread' | 'single' | 'pdf'>('pdf')

  // Load project from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setProject(parsed)
        if (parsed.chapters.length > 0) {
          setShowInput(false)
        }
      } catch (e) {
        console.error('Failed to load saved project:', e)
      }
    }
    setIsInitialized(true)
  }, [])

  // Save project to localStorage on change (only after initialization)
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project))
    }
  }, [project, isInitialized])

  // Helper function to split text into chapters
  const splitIntoChapters = (text: string): { chapterNumber: number; text: string }[] => {
    // Common chapter markers
    const chapterPattern = /(?:^|\n)\s*(?:CHAPTER|Chapter|Kapitel|KAPITEL)\s+(\d+)\s*[:\.]?\s*/gi

    const chapters: { chapterNumber: number; text: string }[] = []
    const matches: { index: number; chapterNumber: number }[] = []

    let match
    while ((match = chapterPattern.exec(text)) !== null) {
      matches.push({ index: match.index, chapterNumber: parseInt(match[1], 10) })
    }

    if (matches.length === 0) {
      // No chapter markers found, treat as single chapter (Chapter 1)
      return [{ chapterNumber: 1, text: text.trim() }]
    }

    // Extract each chapter's text
    for (let i = 0; i < matches.length; i++) {
      const start = matches[i].index
      const end = i + 1 < matches.length ? matches[i + 1].index : text.length

      // Get text from after the chapter marker to the next chapter or end
      const chapterText = text.substring(start, end)
        .replace(/^\s*(?:CHAPTER|Chapter|Kapitel|KAPITEL)\s+\d+\s*[:\.]?\s*/i, '')
        .trim()

      if (chapterText.length > 0) {
        chapters.push({ chapterNumber: matches[i].chapterNumber, text: chapterText })
      }
    }

    return chapters
  }

  const handleTranslate = async (text: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // Split text into chapters
      const chapterTexts = splitIntoChapters(text)
      const translatedChapters: Chapter[] = []

      // Process each chapter sequentially
      for (const { chapterNumber, text: chapterText } of chapterTexts) {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: chapterText, chapterNumber }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `Translation failed for Chapter ${chapterNumber}`)
        }

        const data: TranslateResponse = await response.json()
        translatedChapters.push(data.chapter)
      }

      setProject((prev) => ({
        ...prev,
        chapters: translatedChapters,
      }))

      setShowInput(false)
      setReflowKey((k) => k + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSettingsChange = useCallback((newSettings: BookProject['printSettings']) => {
    setProject((prev) => ({ ...prev, printSettings: newSettings }))
  }, [])

  const handleReflow = useCallback(() => {
    setReflowKey((k) => k + 1)
  }, [])

  const handleNewProject = () => {
    if (confirm('Start a new project? This will clear all current data.')) {
      setProject(DEFAULT_PROJECT)
      setShowInput(true)
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  const handleLoadSample = async (samplePath: string) => {
    try {
      const response = await fetch(samplePath)
      if (!response.ok) throw new Error('Failed to load sample')
      const sampleProject = await response.json()
      setProject(sampleProject)
      setShowInput(false)
      setReflowKey((k) => k + 1)
    } catch (err) {
      setError('Failed to load sample project')
    }
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(project, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${project.meta.title || 'lexibridge'}-project.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string)
        setProject(imported)
        setShowInput(false)
        setReflowKey((k) => k + 1)
      } catch (err) {
        setError('Failed to import project file')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleTokenClick = (chapterIndex: number, paragraphIndex: number, tokenIndex: number) => {
    if (!editMode) return

    const token = project.chapters[chapterIndex]?.paragraphs[paragraphIndex]?.[tokenIndex]
    if (token && token.type === 'word') {
      setEditingToken({
        chapterIndex,
        paragraphIndex,
        tokenIndex,
        token: token as WordToken
      })
    }
  }

  const handleSaveEdit = (updatedParts: WordPart[]) => {
    if (!editingToken) return

    const { chapterIndex, paragraphIndex, tokenIndex } = editingToken

    setProject((prev) => {
      const newProject = { ...prev }
      const newChapters = [...newProject.chapters]
      const newChapter = { ...newChapters[chapterIndex] }
      const newParagraphs = [...newChapter.paragraphs]
      const newParagraph = [...newParagraphs[paragraphIndex]]

      const oldToken = newParagraph[tokenIndex] as WordToken
      newParagraph[tokenIndex] = {
        ...oldToken,
        parts: updatedParts
      }

      newParagraphs[paragraphIndex] = newParagraph
      newChapter.paragraphs = newParagraphs
      newChapters[chapterIndex] = newChapter
      newProject.chapters = newChapters

      return newProject
    })

    setReflowKey((k) => k + 1)
    setEditingToken(null)
  }

  return (
    <main className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm no-print">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">LexiBridge Lite</h1>
              <p className="text-xs sm:text-sm text-gray-500">Biblical Interlinear Generator</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              {/* Title input */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Title:</label>
                <input
                  type="text"
                  value={project.meta.title}
                  onChange={(e) =>
                    setProject((prev) => ({
                      ...prev,
                      meta: { ...prev.meta, title: e.target.value },
                    }))
                  }
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>

              {/* Action buttons */}
              <button
                onClick={() => setShowInput(!showInput)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                {showInput ? 'Hide Input' : 'Show Input'}
              </button>

              <button
                onClick={() => setEditMode(!editMode)}
                className={`px-3 py-1.5 text-sm border rounded ${
                  editMode
                    ? 'bg-yellow-100 border-yellow-400 text-yellow-800'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {editMode ? 'Exit Edit' : 'Edit Mode'}
              </button>

              <button
                onClick={handleNewProject}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                New Project
              </button>

              <button
                onClick={() => handleLoadSample('/data/genesis-1-10-translated.json')}
                className="px-3 py-1.5 text-sm border border-purple-400 text-purple-700 rounded hover:bg-purple-50"
              >
                Genesis (DE)
              </button>

              <button
                onClick={() => handleLoadSample('/data/genesis-1-afrikaans-translated.json')}
                className="px-3 py-1.5 text-sm border border-green-400 text-green-700 rounded hover:bg-green-50"
              >
                Genesis (AF)
              </button>

              <button
                onClick={() => handleLoadSample('/data/luke-1-2-afrikaans-translated.json')}
                className="px-3 py-1.5 text-sm border border-blue-400 text-blue-700 rounded hover:bg-blue-50"
              >
                Luke 1-2 (AF)
              </button>

              <button
                onClick={handleExport}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                Export
              </button>

              <label className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 cursor-pointer">
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>

              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Print / PDF
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Error display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 no-print">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-sm underline mt-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Text input panel */}
        {showInput && (
          <div className="mb-6 no-print">
            <TextInput onTranslate={handleTranslate} isLoading={isLoading} />
          </div>
        )}

        {/* Main layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Settings panel - hidden by default on mobile, shown when expanded */}
          <div className="no-print flex-shrink-0 w-full lg:w-auto">
            <SettingsPanel
              settings={project.printSettings}
              onSettingsChange={handleSettingsChange}
              onReflow={handleReflow}
              isCollapsed={settingsCollapsed}
              onToggleCollapse={() => setSettingsCollapsed(!settingsCollapsed)}
            />
          </div>

          {/* Preview area */}
          <div className="flex-grow overflow-x-auto">
            {/* View mode toggle */}
            <div className="mb-4 flex flex-wrap items-center gap-4 no-print">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">View:</span>
                <div className="flex rounded-lg overflow-hidden border border-gray-300">
                  <button
                    onClick={() => setViewMode('pdf')}
                    className={`px-3 py-1 text-sm ${
                      viewMode === 'pdf'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => setViewMode('spread')}
                    className={`px-3 py-1 text-sm ${
                      viewMode === 'spread'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Book Spread
                  </button>
                  <button
                    onClick={() => setViewMode('single')}
                    className={`px-3 py-1 text-sm ${
                      viewMode === 'single'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Single Page
                  </button>
                </div>
              </div>

              {/* Recto/Verso toggle - only show in single page mode */}
              {viewMode === 'single' && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Page Type:</span>
                  <div className="flex rounded-lg overflow-hidden border border-gray-300">
                    <button
                      onClick={() => setPreviewPageType('recto')}
                      className={`px-3 py-1 text-sm ${
                        previewPageType === 'recto'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Recto (Odd)
                    </button>
                    <button
                      onClick={() => setPreviewPageType('verso')}
                      className={`px-3 py-1 text-sm ${
                        previewPageType === 'verso'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Verso (Even)
                    </button>
                  </div>
                  <span className="text-xs text-gray-400 ml-2 hidden sm:inline">
                    {previewPageType === 'recto' ? 'Inner margin on left' : 'Inner margin on right'}
                  </span>
                </div>
              )}
            </div>

            {/* Render based on view mode */}
            {viewMode === 'pdf' ? (
              <PDFViewer
                project={project}
                reflowKey={reflowKey}
              />
            ) : viewMode === 'spread' ? (
              <BookSpreadViewer
                project={project}
                reflowKey={reflowKey}
              />
            ) : (
              <PrintPreview
                project={project}
                reflowKey={reflowKey}
                editMode={editMode}
                onTokenClick={handleTokenClick}
                previewPageType={previewPageType}
              />
            )}
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      {editingToken && (
        <EditDialog
          token={editingToken.token}
          onSave={handleSaveEdit}
          onClose={() => setEditingToken(null)}
        />
      )}
    </main>
  )
}
