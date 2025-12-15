'use client'

import { PrintSettings, PAGE_SIZES, KDP_MARGINS } from '@/types'

interface SettingsPanelProps {
  settings: PrintSettings
  onSettingsChange: (settings: PrintSettings) => void
  onReflow: () => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

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

      {/* Page Size */}
      <div>
        <label>Page Size</label>
        <select
          value={settings.pageSize}
          onChange={(e) => handlePageSizeChange(e.target.value as PrintSettings['pageSize'])}
        >
          <option value="6x9">6" x 9" (Trade)</option>
          <option value="5.5x8.5">5.5" x 8.5" (Digest)</option>
          <option value="A5">A5 (148 x 210 mm)</option>
          <option value="custom">Custom</option>
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

      {/* Font Size */}
      <div>
        <label>Base Font Size: {settings.baseFontSize}pt</label>
        <input
          type="range"
          min="10"
          max="14"
          step="1"
          value={settings.baseFontSize}
          onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>10pt</span>
          <span>14pt</span>
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
