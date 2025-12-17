'use client'

import { PrintSettings, PAGE_SIZES, KDP_MARGINS, DEFAULT_TYPOGRAPHY } from '@/types'

interface SettingsPanelProps {
  settings: PrintSettings
  onSettingsChange: (settings: PrintSettings) => void
  onReflow: () => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

const FONT_OPTIONS = [
  { value: 'Georgia, serif', label: 'Georgia (Serif)' },
  { value: '"Times New Roman", Times, serif', label: 'Times New Roman' },
  { value: 'Garamond, serif', label: 'Garamond' },
  { value: '"Palatino Linotype", Palatino, serif', label: 'Palatino' },
  { value: 'Inter, sans-serif', label: 'Inter (Sans)' },
  { value: 'system-ui, sans-serif', label: 'System UI' },
  { value: '"Helvetica Neue", Helvetica, sans-serif', label: 'Helvetica' },
]

export default function SettingsPanel({
  settings,
  onSettingsChange,
  onReflow,
  isCollapsed,
  onToggleCollapse,
}: SettingsPanelProps) {
  const handlePageSizeChange = (pageSize: PrintSettings['pageSize']) => {
    onSettingsChange({ ...settings, pageSize })
  }

  const handleMarginChange = (key: keyof PrintSettings['margins'], value: number) => {
    onSettingsChange({
      ...settings,
      margins: { ...settings.margins, [key]: value },
    })
  }

  const handleFontSizeChange = (baseFontSize: number) => {
    onSettingsChange({ ...settings, baseFontSize })
  }

  const handleCustomDimensionChange = (key: 'customWidth' | 'customHeight', value: number) => {
    onSettingsChange({ ...settings, [key]: value })
  }

  const applyKDPPreset = () => {
    onSettingsChange({ ...settings, margins: KDP_MARGINS })
  }

  // Get typography with defaults - merge to handle missing properties from older saved projects
  const typography = { ...DEFAULT_TYPOGRAPHY, ...settings.typography }

  const handleTypographyChange = <K extends keyof typeof DEFAULT_TYPOGRAPHY>(
    key: K,
    value: typeof DEFAULT_TYPOGRAPHY[K]
  ) => {
    onSettingsChange({
      ...settings,
      typography: { ...typography, [key]: value },
    })
  }

  if (isCollapsed) {
    return (
      <div className="settings-panel w-12">
        <button
          onClick={onToggleCollapse}
          className="p-2 text-gray-600 hover:text-gray-900"
          title="Expand settings"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div className="settings-panel w-80 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Print Settings</h2>
        <button
          onClick={onToggleCollapse}
          className="p-1 text-gray-400 hover:text-gray-600"
          title="Collapse settings"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Page Size - KDP Trim Sizes */}
      <div>
        <label>Page Size (KDP Trim)</label>
        <select
          value={settings.pageSize}
          onChange={(e) => handlePageSizeChange(e.target.value)}
          className="text-sm"
        >
          <optgroup label="Popular Sizes">
            {Object.entries(PAGE_SIZES)
              .filter(([key]) => ['5x8', '5.5x8.5', '6x9'].includes(key))
              .map(([key, size]) => (
                <option key={key} value={key}>{size.label}</option>
              ))
            }
          </optgroup>
          <optgroup label="Other KDP Sizes">
            {Object.entries(PAGE_SIZES)
              .filter(([key]) => !['5x8', '5.5x8.5', '6x9', 'A5', 'A4'].includes(key))
              .map(([key, size]) => (
                <option key={key} value={key}>{size.label}</option>
              ))
            }
          </optgroup>
          <optgroup label="International">
            {Object.entries(PAGE_SIZES)
              .filter(([key]) => ['A5', 'A4'].includes(key))
              .map(([key, size]) => (
                <option key={key} value={key}>{size.label}</option>
              ))
            }
          </optgroup>
          <optgroup label="Custom">
            <option value="custom">Custom Size...</option>
          </optgroup>
        </select>
      </div>

      {/* Custom dimensions */}
      {settings.pageSize === 'custom' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Width (in)</label>
            <input
              type="number"
              step="0.1"
              min="4"
              max="12"
              value={settings.customWidth || 6}
              onChange={(e) => handleCustomDimensionChange('customWidth', parseFloat(e.target.value))}
            />
          </div>
          <div>
            <label>Height (in)</label>
            <input
              type="number"
              step="0.1"
              min="6"
              max="14"
              value={settings.customHeight || 9}
              onChange={(e) => handleCustomDimensionChange('customHeight', parseFloat(e.target.value))}
            />
          </div>
        </div>
      )}

      {/* Margins */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="mb-0">Margins (inches)</label>
          <button
            onClick={applyKDPPreset}
            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
          >
            KDP Preset
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500">Top</label>
            <input
              type="number"
              step="0.125"
              min="0.25"
              max="2"
              value={settings.margins.top}
              onChange={(e) => handleMarginChange('top', parseFloat(e.target.value))}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Bottom</label>
            <input
              type="number"
              step="0.125"
              min="0.25"
              max="2"
              value={settings.margins.bottom}
              onChange={(e) => handleMarginChange('bottom', parseFloat(e.target.value))}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Inner (Gutter)</label>
            <input
              type="number"
              step="0.125"
              min="0.25"
              max="2"
              value={settings.margins.inner}
              onChange={(e) => handleMarginChange('inner', parseFloat(e.target.value))}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Outer</label>
            <input
              type="number"
              step="0.125"
              min="0.25"
              max="2"
              value={settings.margins.outer}
              onChange={(e) => handleMarginChange('outer', parseFloat(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Typography Section */}
      <div className="border-t pt-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Typography</h3>

        {/* Main Text */}
        <div className="mb-3">
          <label className="text-xs text-gray-500 mb-1 block">Main Text</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-400">Font</label>
              <select
                value={typography.mainFont}
                onChange={(e) => handleTypographyChange('mainFont', e.target.value)}
                className="w-full text-xs"
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400">Size (pt)</label>
              <input
                type="number"
                step="0.5"
                value={typography.mainFontSize}
                onChange={(e) => handleTypographyChange('mainFontSize', parseFloat(e.target.value) || 12)}
                className="w-full text-sm"
              />
            </div>
          </div>
        </div>

        {/* Gloss Text */}
        <div className="mb-3">
          <label className="text-xs text-gray-500 mb-1 block">Gloss (Translation)</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-400">Font</label>
              <select
                value={typography.glossFont}
                onChange={(e) => handleTypographyChange('glossFont', e.target.value)}
                className="w-full text-xs"
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400">Size (pt)</label>
              <input
                type="number"
                step="0.5"
                value={typography.glossFontSize}
                onChange={(e) => handleTypographyChange('glossFontSize', parseFloat(e.target.value) || 5)}
                className="w-full text-sm"
              />
            </div>
          </div>
        </div>

        {/* Verse Number Settings */}
        <div className="mb-3">
          <label className="text-xs text-gray-500 mb-1 block">Verse Number</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-400">Size (pt)</label>
              <input
                type="number"
                step="0.5"
                value={typography.verseNumSize}
                onChange={(e) => handleTypographyChange('verseNumSize', parseFloat(e.target.value) || 8)}
                className="w-full text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Color</label>
              <div className="flex items-center gap-1">
                <input
                  type="color"
                  value={typography.verseNumColor}
                  onChange={(e) => handleTypographyChange('verseNumColor', e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer flex-shrink-0"
                />
                <input
                  type="text"
                  value={typography.verseNumColor}
                  onChange={(e) => handleTypographyChange('verseNumColor', e.target.value)}
                  className="flex-1 text-xs"
                  placeholder="#6b7280"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400">Y Offset (pt)</label>
              <input
                type="number"
                step="0.5"
                value={typography.verseNumOffset}
                onChange={(e) => handleTypographyChange('verseNumOffset', parseFloat(e.target.value) || 0)}
                className="w-full text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">X Offset (pt)</label>
              <input
                type="number"
                step="0.5"
                value={typography.verseNumOffsetX}
                onChange={(e) => handleTypographyChange('verseNumOffsetX', parseFloat(e.target.value) || 0)}
                className="w-full text-sm"
              />
            </div>
          </div>
        </div>

        {/* Line Height */}
        <div className="mb-3">
          <label className="text-xs text-gray-500 mb-1 block">Line Height</label>
          <input
            type="number"
            step="0.1"
            value={typography.lineHeight}
            onChange={(e) => handleTypographyChange('lineHeight', parseFloat(e.target.value) || 2.4)}
            className="w-full text-sm"
          />
        </div>

        {/* Word Spacing */}
        <div className="mb-3">
          <label className="text-xs text-gray-500 mb-1 block">Word Spacing (mm)</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-400">Min</label>
              <input
                type="number"
                step="0.25"
                min="0.5"
                max="5"
                value={typography.minWordSpace ?? 1.5}
                onChange={(e) => handleTypographyChange('minWordSpace', parseFloat(e.target.value) || 1.5)}
                className="w-full text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Max</label>
              <input
                type="number"
                step="0.5"
                min="2"
                max="15"
                value={typography.maxWordSpace ?? 8.0}
                onChange={(e) => handleTypographyChange('maxWordSpace', parseFloat(e.target.value) || 8.0)}
                className="w-full text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Reflow Button */}
      <button
        onClick={onReflow}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Reflow Layout
      </button>
    </div>
  )
}
