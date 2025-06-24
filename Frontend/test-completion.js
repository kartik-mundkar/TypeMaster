// Browser Console Test Script for Typing Test Completion
// Open the browser console (F12) and paste this script to test completion logic

function testCompletion() {
    console.log('🧪 Starting test completion simulation...');
    
    // Wait for the app to load
    setTimeout(() => {
        const textInput = document.querySelector('.typing-input');
        const textDisplay = document.querySelector('.text-display');
        
        if (!textInput || !textDisplay) {
            console.error('❌ Could not find typing input or text display elements');
            return;
        }
        
        console.log('✅ Found typing elements');
        
        // Focus on the input
        textInput.focus();
        
        // Get the text to type (extract from spans)
        const textSpans = textDisplay.querySelectorAll('span');
        const fullText = Array.from(textSpans).map(span => span.textContent).join('');
        
        console.log('📝 Text to type:', fullText);
        console.log('📏 Text length:', fullText.length);
        
        // Simulate typing the entire text
        let index = 0;
        const typeInterval = setInterval(() => {
            if (index >= fullText.length) {
                clearInterval(typeInterval);
                console.log('✅ Finished typing the complete text');
                
                // Check if results are shown
                setTimeout(() => {
                    const resultsSection = document.querySelector('.results-section');
                    const completionMessage = document.querySelector('.completion-message');
                    
                    if (resultsSection && resultsSection.style.display !== 'none') {
                        console.log('🎉 SUCCESS: Results section is visible!');
                    } else {
                        console.log('❌ FAIL: Results section is not visible');
                    }
                    
                    if (completionMessage) {
                        console.log('🎉 SUCCESS: Completion message found!');
                        console.log('💬 Message:', completionMessage.textContent);
                    } else {
                        console.log('❌ FAIL: Completion message not found');
                    }
                    
                    // Check stats
                    const wpmElement = document.querySelector('.stat-item:nth-child(1) .stat-value');
                    const accuracyElement = document.querySelector('.stat-item:nth-child(2) .stat-value');
                    
                    if (wpmElement && accuracyElement) {
                        console.log('📊 WPM:', wpmElement.textContent);
                        console.log('📊 Accuracy:', accuracyElement.textContent);
                    }
                }, 100);
                
                return;
            }
            
            const char = fullText[index];
            
            // Create and dispatch input event
            textInput.value = fullText.substring(0, index + 1);
            const inputEvent = new Event('input', { bubbles: true });
            textInput.dispatchEvent(inputEvent);
            
            // Create and dispatch keydown event
            const keydownEvent = new KeyboardEvent('keydown', {
                key: char,
                bubbles: true
            });
            document.dispatchEvent(keydownEvent);
            
            index++;
            
            if (index % 10 === 0) {
                console.log(`⏳ Typed ${index}/${fullText.length} characters...`);
            }
        }, 50); // Type at 20 characters per second
        
    }, 1000); // Wait 1 second for app to load
}

// Auto-run the test
console.log('🚀 Loading typing test completion simulator...');
console.log('📋 To run manually, call: testCompletion()');

// Uncomment the next line to auto-run:
// testCompletion();
