// Simple debug script to check if React is loading
// Paste this in browser console to debug

console.log('🔍 Debugging frontend...');

// Check if React is loaded
if (window.React) {
    console.log('✅ React is loaded');
} else {
    console.log('❌ React is not loaded');
}

// Check if the app root exists
const root = document.getElementById('root');
if (root) {
    console.log('✅ Root element found');
    console.log('📝 Root innerHTML length:', root.innerHTML.length);
    console.log('📄 Root content preview:', root.innerHTML.substring(0, 200));
} else {
    console.log('❌ Root element not found');
}

// Check for any visible content
const allElements = document.querySelectorAll('*');
console.log('📊 Total elements on page:', allElements.length);

// Check for any React errors
if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('✅ React DevTools detected');
} else {
    console.log('⚠️ React DevTools not detected');
}

// Check console for errors
console.log('🎯 Check browser console for any red error messages');

// Check if specific components exist
setTimeout(() => {
    const typeArea = document.querySelector('.typing-area');
    const header = document.querySelector('.app-header');
    const textDisplay = document.querySelector('.text-display');
    
    console.log('🎯 Component check:');
    console.log('  - Typing area:', !!typeArea);
    console.log('  - Header:', !!header);
    console.log('  - Text display:', !!textDisplay);
    
    if (!typeArea && !header && !textDisplay) {
        console.log('❌ No main components found - likely a rendering issue');
    }
}, 1000);
