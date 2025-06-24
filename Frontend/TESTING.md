# Testing Guide - localStorage Persistence & Restart Button

## Features Implemented

### 1. localStorage Persistence for Test Configuration
- **Purpose**: Test settings (mode, time limit, word count, text source) now persist across page refreshes
- **Storage Keys**: 
  - `typingApp_testMode`
  - `typingApp_timeLimit` 
  - `typingApp_wordCount`
  - `typingApp_textSource`

### 2. Enhanced Restart Button
- **Purpose**: Restart button now fetches completely new text instead of just resetting with the same text
- **Implementation**: Uses `generateNewText()` instead of `resetTest()`

## Manual Testing Steps

### Test 1: localStorage Persistence
1. **Initial Setup**
   - Open the application in browser
   - Change test mode from default (time) to "words"
   - Change word count to 25 (if different from default)
   - Change text source to "quotes" (if different from default)
   - Change time limit to 60 seconds (if in time mode)

2. **Test Persistence**
   - Refresh the browser page (F5 or Ctrl+R)
   - Verify all settings remain as configured:
     - Test mode should still be "words"
     - Word count should still be 25
     - Text source should still be "quotes"
     - Time limit should still be 60 (if applicable)

3. **Test Cross-Session Persistence**
   - Close the browser tab completely
   - Reopen the application
   - Verify settings are still preserved

### Test 2: Enhanced Restart Button Functionality
1. **Test New Text Generation**
   - Start typing a few words of the current text
   - Note the first few words of the text
   - Click the "restart" button
   - Verify that:
     - The text has changed (different content)
     - Typing input is cleared
     - Stats are reset (WPM, accuracy back to defaults)
     - Cursor position is reset to beginning

2. **Test Multiple Restarts**
   - Click restart button multiple times
   - Verify each restart generates different text
   - Verify no errors occur in console

### Test 3: Integration Testing
1. **Settings + Restart Combination**
   - Change test mode to "time" with 15 seconds
   - Click restart - verify new text appears
   - Change to "words" with 30 words
   - Click restart - verify new text appears and mode is correct
   - Refresh page - verify mode setting persisted
   - Click restart again - verify still generates new text

2. **Error Handling**
   - Open browser DevTools (F12)
   - Check Console tab for any errors
   - Verify localStorage entries exist:
     ```javascript
     // Run in browser console:
     console.log('Test Mode:', localStorage.getItem('typingApp_testMode'))
     console.log('Time Limit:', localStorage.getItem('typingApp_timeLimit'))
     console.log('Word Count:', localStorage.getItem('typingApp_wordCount'))
     console.log('Text Source:', localStorage.getItem('typingApp_textSource'))
     ```

## Expected Behavior

### localStorage Values
- Values should be stored as JSON strings
- Default values should be:
  - testMode: "time"
  - timeLimit: 30
  - wordCount: 50
  - textSource: "mixed"

### Error Handling
- If localStorage is unavailable, app should gracefully fall back to defaults
- No console errors should appear during normal operation

## Debugging

If issues occur:

1. **Clear localStorage**: 
   ```javascript
   localStorage.clear()
   ```

2. **Check for console errors**
   
3. **Verify network requests** (if text is not loading)

4. **Check that all required functions are properly exported from useTypingTest hook**

## Files Modified

- `src/hooks/typing/useTypingTest.js` - Added localStorage persistence
- `src/pages/TypePage.jsx` - Updated restart button to use generateNewText
- `TESTING.md` - This testing documentation
