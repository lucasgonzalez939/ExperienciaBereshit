// Experiencia Bereshit - Main JavaScript

function selectGrade(grade) {
    // Navigate to the appropriate grade page
    window.location.href = `games/grado${grade}.html`;
}

// Add keyboard navigation support
document.addEventListener('DOMContentLoaded', () => {
    const gradeButtons = document.querySelectorAll('.grade-btn');
    
    gradeButtons.forEach(btn => {
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const grade = btn.getAttribute('data-grade');
                selectGrade(grade);
            }
        });
    });
});
