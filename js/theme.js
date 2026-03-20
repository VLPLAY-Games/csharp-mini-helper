// theme.js
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.textContent = '☀️';
    } else {
        themeToggle.textContent = '🌙';
    }
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        themeToggle.textContent = isDark ? '☀️' : '🌙';
        
        if (graphNetwork && !document.getElementById("graphScreen").classList.contains("hidden")) {
            renderGraph();
            addGraphControls();
        } else if (graphNetwork) {
            renderGraph();
        }
    });
}

function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = lightbox.querySelector('.lightbox-image');
    const lightboxCaption = lightbox.querySelector('.lightbox-caption');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const overlay = lightbox.querySelector('.lightbox-overlay');
    function openLightbox(imgElement) {
        lightboxImg.src = imgElement.getAttribute('src');
        lightboxImg.alt = imgElement.getAttribute('alt') || '';
        lightboxCaption.textContent = lightboxImg.alt;
        lightbox.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
    function closeLightbox() {
        lightbox.classList.add('hidden');
        document.body.style.overflow = '';
    }
    document.body.addEventListener('click', (e) => {
        if (e.target.matches('.screen, .example-screen')) {
            e.preventDefault();
            openLightbox(e.target);
        }
    });
    closeBtn.addEventListener('click', closeLightbox);
    overlay.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !lightbox.classList.contains('hidden')) {
            closeLightbox();
        }
    });
}