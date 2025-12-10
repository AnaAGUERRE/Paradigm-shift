// Animate flower growth based on score
function animateFlowerGrowth(flowerElement, growthScore) {
    // Minimum size is 50px, maximum is 160px
    const minSize = 50;
    const maxSize = 160;
    // Clamp growthScore between 0 and 100
    const score = Math.max(0, Math.min(100, growthScore));
    // Calculate new size
    const newSize = minSize + (score / 100) * (maxSize - minSize);
    flowerElement.style.width = newSize + 'px';
    flowerElement.style.height = newSize + 'px';
}

// Example usage: animate all flowers after results are shown
window.animateAllFlowers = function(scores) {
    // scores: array of growth scores for each flower
    const flowerImages = document.querySelectorAll('.flower-image.grow-phase');
    flowerImages.forEach((img, idx) => {
        const score = scores[idx] || 0;
        animateFlowerGrowth(img, score);
    });
}
// To use: call window.animateAllFlowers([score1, score2, ...]) after results are loaded
