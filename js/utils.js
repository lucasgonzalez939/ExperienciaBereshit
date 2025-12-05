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
