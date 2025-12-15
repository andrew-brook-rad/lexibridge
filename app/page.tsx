'use client'

import { useState, useEffect, useCallback } from 'react'
import { BookProject, Chapter, DEFAULT_PROJECT, TranslateResponse } from '@/types'
import SettingsPanel from './components/SettingsPanel'
import PrintPreview from './components/PrintPreview'
import TextInput from './components/TextInput'

const STORAGE_KEY = 'lexibridge-project'

export default function Home() {
  const [project, setProject] = useState<BookProject>(DEFAULT_PROJECT)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reflowKey, setReflowKey] = useState(0)
  const [settingsCollapsed, setSettingsCollapsed] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [showInput, setShowInput] = useState(true)

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
  }, [])

  // Save project to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project))
  }, [project])

  const handleTranslate = async (text: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, chapterNumber: 1 }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Translation failed')
      }

      const data: TranslateResponse = await response.json()

      setProject((prev) => ({
        ...prev,
        chapters: [data.chapter],
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
    // TODO: Implement edit dialog
    console.log('Edit token:', { chapterIndex, paragraphIndex, tokenIndex })
  }

  return (
    <main className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm no-print">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">LexiBridge Lite</h1>
              <p className="text-sm text-gray-500">Biblical Interlinear Generator</p>
            </div>

            <div className="flex items-center gap-4">
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
        <div className="flex gap-6">
          {/* Settings panel */}
          <div className="no-print flex-shrink-0">
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
            <PrintPreview
              project={project}
              reflowKey={reflowKey}
              editMode={editMode}
              onTokenClick={handleTokenClick}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
