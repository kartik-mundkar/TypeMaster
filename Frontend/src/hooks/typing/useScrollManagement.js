import { useCallback } from 'react'

export const useScrollManagement = (textDisplayRef) => {
  // Auto-scroll function to keep current typing position visible
  const autoScrollToCurrentPosition = useCallback(() => {
    if (!textDisplayRef.current) return
    
    const currentChar = textDisplayRef.current.querySelector('.char.current')
    if (!currentChar) return
    
    const container = textDisplayRef.current
    const containerRect = container.getBoundingClientRect()
    const charRect = currentChar.getBoundingClientRect()
    
    // Calculate line height based on CSS
    const computedStyle = getComputedStyle(container)
    const fontSize = parseFloat(computedStyle.fontSize)
    const lineHeight = parseFloat(computedStyle.lineHeight) || fontSize * 1.8
    
    // Calculate which line the current character is on
    const charTop = charRect.top - containerRect.top + container.scrollTop
    const currentLine = Math.floor(charTop / lineHeight)
    
    // We want to keep the typing in the middle line (line 1 of 3 visible lines)
    const targetMiddleLine = 1
    const targetScrollTop = (currentLine - targetMiddleLine) * lineHeight
    
    // Only scroll if needed and ensure we don't scroll to negative values
    if (currentLine > targetMiddleLine) {
      container.scrollTop = Math.max(0, targetScrollTop)
    }
  }, [textDisplayRef])

  const scrollToTop = useCallback(() => {
    if (textDisplayRef.current) {
      textDisplayRef.current.scrollTop = 0
    }
  }, [textDisplayRef])

  return {
    autoScrollToCurrentPosition,
    scrollToTop
  }
}
