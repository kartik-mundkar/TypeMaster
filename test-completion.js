// Simple test script to verify test completion functionality
// Run this in the browser console to automatically complete a typing test

const testCompletion = () => {
  console.log('Testing typing completion functionality...');
  
  // Find the typing input
  const input = document.querySelector('.typing-input');
  if (!input) {
    console.error('Typing input not found');
    return;
  }
  
  // Get the current text to type
  const textDisplay = document.querySelector('.text-display');
  if (!textDisplay) {
    console.error('Text display not found');
    return;
  }
  
  // Extract the text from the display
  const chars = textDisplay.querySelectorAll('.char');
  const fullText = Array.from(chars).map(char => char.textContent).join('');
  
  console.log('Full text to type:', fullText);
  console.log('Text length:', fullText.length);
  
  // Simulate typing the entire text
  input.focus();
  input.value = fullText;
  
  // Trigger the change event
  const event = new Event('input', { bubbles: true });
  input.dispatchEvent(event);
  
  console.log('Test completion simulation finished');
  
  // Check if results are shown after a short delay
  setTimeout(() => {
    const results = document.querySelector('.results');
    if (results) {
      console.log('✅ Test completed successfully! Results are shown.');
      
      // Show final stats
      const wpm = document.querySelector('.result-value');
      const completionMessage = document.querySelector('.completion-message');
      
      console.log('WPM:', wpm ? wpm.textContent : 'Not found');
      console.log('Completion message:', completionMessage ? completionMessage.textContent : 'Not found');
    } else {
      console.log('❌ Test did not complete as expected. Results not shown.');
    }
  }, 200);
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testCompletion = testCompletion;
  console.log('Test function available as window.testCompletion()');
}
