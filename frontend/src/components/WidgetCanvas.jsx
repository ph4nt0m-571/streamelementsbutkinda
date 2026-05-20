import { useState } from 'react'
import { DndContext, closestCenter, useDraggable, useDroppable } from '@dnd-kit/core'
import { WIDGET_TYPES } from '../utils/constants'

export default function WidgetCanvas({ widgets, onChange }) {
  const [dragging, setDragging] = useState(null)

  const addWidget = (type) => {
    onChange([...widgets, { id: Date.now().toString(), type, x: 10, y: 10, w: 300, h: 200 }])
  }

  const removeWidget = (id) => onChange(widgets.filter(w => w.id !== id))

  const updateWidget = (id, changes) => onChange(widgets.map(w => w.id === id ? { ...w, ...changes } : w))

  return (
    <div className="flex gap-4">
      <div className="w-40 shrink-0 space-y-2">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Add Widget</p>
        {WIDGET_TYPES.map(type => (
          <button
            key={type}
            onClick={() => addWidget(type)}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-left text-sm text-gray-300 hover:border-purple-500 hover:text-white capitalize transition-colors"
          >
            {type}
          </button>
        ))}
      </div>

      <div
        className="relative flex-1 rounded-xl border border-gray-700 bg-gray-950 overflow-hidden"
        style={{ height: 540, background: 'repeating-linear-gradient(0deg,transparent,transparent 39px,#1f2937 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,#1f2937 40px)' }}
      >
        <p className="absolute top-2 left-2 text-xs text-gray-600">1920×1080 preview</p>
        {widgets.map(w => (
          <div
            key={w.id}
            className="absolute rounded border-2 border-purple-500 bg-purple-900/30 cursor-move select-none"
            style={{ left: w.x, top: w.y, width: w.w, height: w.h }}
          >
            <div className="flex items-center justify-between px-2 py-1 bg-purple-900/60">
              <span className="text-xs text-purple-200 capitalize">{w.type}</span>
              <button onClick={() => removeWidget(w.id)} className="text-xs text-red-400 hover:text-red-300">×</button>
            </div>
          </div>
        ))}
        {widgets.length === 0 && (
          <div className="flex h-full items-center justify-center text-gray-600 text-sm">
            Add widgets from the panel on the left
          </div>
        )}
      </div>
    </div>
  )
}