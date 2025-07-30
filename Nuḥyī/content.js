// Nuḥyī Chrome Extension - Content Script
// This script runs on web pages and can be used for future enhancements

console.log('Nuḥyī extension content script loaded');

// Listen for messages from the popup or background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getPageInfo') {
        // Example: Get current page information
        sendResponse({
            url: window.location.href,
            title: document.title,
            timestamp: new Date().toISOString()
        });
    }
    
    if (request.action === 'injectQuranVerse') {
        // Example: Inject a Quran verse into the current page
        const verse = request.verse;
        if (verse) {
            const div = document.createElement('div');
            div.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(34, 197, 94, 0.9);
                color: white;
                padding: 15px;
                border-radius: 8px;
                font-family: 'Noto Naskh Arabic', serif;
                font-size: 14px;
                line-height: 1.6;
                max-width: 300px;
                z-index: 10000;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            `;
            div.innerHTML = `
                <div style="margin-bottom: 8px; font-weight: bold;">آية قرآنية</div>
                <div style="text-align: right; direction: rtl;">${verse.text}</div>
                <div style="font-size: 12px; margin-top: 8px; opacity: 0.8;">
                    ${verse.surah} - ${verse.ayah}
                </div>
                <button onclick="this.parentElement.remove()" style="
                    position: absolute;
                    top: 5px;
                    left: 5px;
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    font-size: 16px;
                ">×</button>
            `;
            document.body.appendChild(div);
            
            // Auto-remove after 10 seconds
            setTimeout(() => {
                if (div.parentElement) {
                    div.remove();
                }
            }, 10000);
        }
    }
});

// Example: Add a floating prayer time widget
function addPrayerTimeWidget() {
    // This is a placeholder for future enhancement
    // Could show current prayer time or countdown to next prayer
    console.log('Prayer time widget feature not yet implemented');
}

// Example: Add keyboard shortcuts
document.addEventListener('keydown', (event) => {
    // Ctrl+Shift+N to open Nuḥyī popup
    if (event.ctrlKey && event.shiftKey && event.key === 'N') {
        event.preventDefault();
        chrome.runtime.sendMessage({ action: 'openPopup' });
    }
});

// Example: Context menu integration
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'addContextMenu') {
        // This could add right-click menu options
        console.log('Context menu feature not yet implemented');
    }
});

// Example: Page load completion
window.addEventListener('load', () => {
    // Could inject prayer time widget or other features
    console.log('Page loaded - Nuḥyī extension ready');
});

// Example: Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        // Page became visible - could refresh prayer times
        console.log('Page became visible');
    }
});

// Export functions for potential use by other scripts
window.nuhyiContentScript = {
    addPrayerTimeWidget,
    // Add more functions as needed
}; 