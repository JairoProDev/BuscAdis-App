'use client'

import { useCallback, useRef } from 'react'

interface LongPressOptions {
  threshold?: number
  captureEvent?: boolean
}

export function useLongPress(
  callback: (id: string) => void,
  { threshold = 500, captureEvent = false }: LongPressOptions = {}
) {
  const timeout = useRef<NodeJS.Timeout>()
  const target = useRef<string>()

  const start = useCallback((id: string) => {
    timeout.current = setTimeout(() => {
      callback(id)
    }, threshold)
    target.current = id
  }, [callback, threshold])

  const clear = useCallback(() => {
    if (timeout.current) {
      clearTimeout(timeout.current)
    }
    target.current = undefined
  }, [])

  return useCallback((id: string) => ({
    onMouseDown: () => start(id),
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchStart: (e: React.TouchEvent) => {
      if (captureEvent) e.preventDefault()
      start(id)
    },
    onTouchEnd: clear,
  }), [start, clear, captureEvent])
} 