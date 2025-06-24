import { useCallback, useEffect } from 'react'

export const useFocusManagement = (inputRef, showResults) => {
  // Check if any modal is open
  const isModalOpen = useCallback(() => {
    return document.querySelector('.auth-modal-overlay, .stats-modal-overlay, .modal-overlay')
  }, [])

  // Focus management - keep focus on typing input
  const refocusInput = useCallback(() => {
    if (isModalOpen()) {
      return
    }
    
    if (inputRef.current && !showResults) {
      inputRef.current.focus()
    }
  }, [showResults, inputRef, isModalOpen])

  // Global click handler to refocus input
  const handlePageClick = useCallback((e) => {
    if (isModalOpen()) {
      return
    }
    
    const interactiveElements = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA']
    if (!interactiveElements.includes(e.target.tagName) && !showResults) {
      setTimeout(() => refocusInput(), 0)
    }
  }, [refocusInput, showResults, isModalOpen])

  // Global keydown handler to refocus input and handle typing when not focused
  const handleGlobalKeyDown = useCallback((e, currentText, typedText, isActive, startTest, updateTypedText, autoScrollToCurrentPosition) => {
    if (isModalOpen()) {
      return
    }
    
    if (showResults || e.ctrlKey || e.metaKey || e.altKey) return
    
    const specialKeys = ['Tab', 'Enter', 'Escape', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12']
    if (specialKeys.includes(e.key)) return
    
    if (document.activeElement !== inputRef.current) {
      e.preventDefault()
      refocusInput()
      
      if (e.key.length === 1) {
        setTimeout(() => {
          if (inputRef.current) {
            const currentValue = inputRef.current.value
            const newValue = currentValue + e.key
            
            if (newValue.length > currentText.length) {
              return
            }
            inputRef.current.value = newValue
            updateTypedText(newValue)
            
            if (!isActive) {
              startTest()
            }
            
            setTimeout(() => autoScrollToCurrentPosition(), 0)
          }
        }, 0)
      }
    }
  }, [showResults, refocusInput, inputRef, isModalOpen])

  // Add event listeners for focus management
  useEffect(() => {
    const globalKeyHandler = (e) => handleGlobalKeyDown(e)
    
    document.addEventListener('click', handlePageClick)
    document.addEventListener('keydown', globalKeyHandler)
    
    return () => {
      document.removeEventListener('click', handlePageClick)
      document.removeEventListener('keydown', globalKeyHandler)
    }
  }, [handlePageClick, handleGlobalKeyDown])

  return {
    refocusInput,
    handleGlobalKeyDown
  }
}
