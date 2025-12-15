// Utility functions for Experiencia Bereshit

// Random number generator
function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Play sound (placeholder for future implementation)
function playSound(type) {
    // Future: Add actual sound effects
    console.log(`Sound: ${type}`);
}

// Show notification (placeholder for future implementation)
function showNotification(message, type = 'info') {
    console.log(`Notification [${type}]: ${message}`);
}

// Robust Fullscreen Toggle
function toggleFullscreen(element) {
    element = element || document.documentElement;
    const doc = document;
    
    // Check if already in fullscreen (standard + prefixes)
    const isFullscreen = doc.fullscreenElement || 
                         doc.webkitFullscreenElement || 
                         doc.mozFullScreenElement || 
                         doc.msFullscreenElement;

    if (!isFullscreen) {
        // Request fullscreen (standard + prefixes)
        if (element.requestFullscreen) {
            element.requestFullscreen().catch(err => console.log(`Error enabling fullscreen: ${err.message}`));
        } else if (element.webkitRequestFullscreen) { /* Safari/Chrome */
            element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) { /* Firefox */
            element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) { /* IE/Edge */
            element.msRequestFullscreen();
        }
        
        // Try to lock orientation to landscape for games
        if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape').catch(() => {
                // Orientation lock might fail on some devices/browsers, which is fine
            });
        }
    } else {
        // Exit fullscreen (standard + prefixes)
        if (doc.exitFullscreen) {
            doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
            doc.webkitExitFullscreen();
        } else if (doc.mozCancelFullScreen) {
            doc.mozCancelFullScreen();
        } else if (doc.msExitFullscreen) {
            doc.msExitFullscreen();
        }
    }
}

// Helper to setup auto-fullscreen on interaction
function setupAutoFullscreen() {
    const requestFS = () => {
        const el = document.documentElement;
        if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
        else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
        else if (el.msRequestFullscreen) el.msRequestFullscreen();
    };

    // Try immediately (might fail)
    requestFS();

    // Try on first interaction
    const enableFullscreen = () => {
        requestFS();
        document.removeEventListener('click', enableFullscreen);
        document.removeEventListener('touchstart', enableFullscreen);
    };
    document.addEventListener('click', enableFullscreen);
    document.addEventListener('touchstart', enableFullscreen);
}
