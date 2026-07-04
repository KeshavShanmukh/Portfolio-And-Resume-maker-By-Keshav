import { useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'builder-split-width'

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export default function SplitPane({ left, right, initialLeftWidth = 80, leftMin = 20, rightMin = 20, className = '' }) {
  const containerRef = useRef(null)
  const [leftWidth, setLeftWidth] = useState(() => {
    if (typeof window === 'undefined') return initialLeftWidth
    const stored = window.sessionStorage.getItem(STORAGE_KEY)
    const parsed = Number(stored)
    return Number.isFinite(parsed) ? clamp(parsed, leftMin, 85) : initialLeftWidth
  })
  const [isCompact, setIsCompact] = useState(() => typeof window !== 'undefined' ? window.innerWidth <= 900 : false)
  const [showPreview, setShowPreview] = useState(() => typeof window !== 'undefined' ? window.innerWidth > 900 : true)

  useEffect(() => {
    window.sessionStorage.setItem(STORAGE_KEY, String(leftWidth))
  }, [leftWidth])

  useEffect(() => {
    const handleResize = () => {
      const compact = window.innerWidth <= 900
      setIsCompact(compact)
      if (compact) {
        setShowPreview(false)
      } else {
        setShowPreview(true)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const startResize = (event) => {
    event.preventDefault()
    const container = containerRef.current
    if (!container) return

    const onPointerMove = (moveEvent) => {
      const rect = container.getBoundingClientRect()
      const nextWidth = clamp(((moveEvent.clientX - rect.left) / rect.width) * 100, leftMin, 85)
      setLeftWidth(nextWidth)
    }

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      document.body.style.cursor = ''
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    document.body.style.cursor = 'col-resize'
  }

  const rightWidth = 100 - leftWidth

  return (
    <div ref={containerRef} className={`split-view ${className}`} style={{ gridTemplateColumns: isCompact ? '1fr' : `${leftWidth}% 12px ${rightWidth}%` }}>
      {!isCompact && (
        <>
          <div className="split-panel">{left}</div>
          <div className="split-divider" onPointerDown={startResize} title="Drag to resize" />
          <div className="split-panel split-panel--grow">{right}</div>
        </>
      )}

      {isCompact && (
        <div className="split-panel split-panel--grow">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowPreview(v => !v)}>
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
          </div>
          {showPreview ? <div>{left}{right}</div> : right}
        </div>
      )}
    </div>
  )
}
