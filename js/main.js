// main.js
window.onDataLoaded = function() {
    renderMenu(topics, null);
    renderTopicCheckboxes();
    renderPrintCheckboxes();
    renderPrintCheckboxesWithGear();
    updateBreadcrumbs(['Главная']);
    attachEventHandlers();
    initScrollToTop();
    initLazyLoading();
    initKeyboardNav();
};

function attachEventHandlers() {
    document.getElementById("goToQuizBtn").addEventListener("click", function() {
        document.getElementById("mainScreen").classList.add("hidden");
        document.getElementById("quizScreen").classList.remove("hidden");
        document.getElementById("glossaryScreen").classList.add("hidden");
        document.getElementById("graphScreen").classList.add("hidden");
        document.getElementById("title").classList.add("hidden");
        document.getElementById("theorySection").style.display = "none";
        document.getElementById("examplesSection").style.display = "none";
        document.getElementById("screensSection").style.display = "none";
        document.getElementById("info").style.display = "none";
        document.getElementById("currentTopicTitle").style.display = "none";
        document.getElementById("backToTopics").style.display = "none";
        if (currentMenuIsTopic) {
            switchMenu(renderMenu, topics, null);
        }
        updateBreadcrumbs(['Главная', 'Тест']);
    });

    document.getElementById("printVersionBtn").addEventListener("click", function() {
        document.getElementById("printPanel").classList.remove("hidden");
    });
    document.getElementById("closePrintPanel").addEventListener("click", function() {
        document.getElementById("printPanel").classList.add("hidden");
    });
    document.getElementById("printSelectAllBtn").addEventListener("click", function() {
        document.querySelectorAll('#printTopicsList input[type="checkbox"]').forEach(cb => cb.checked = true);
    });
    document.getElementById("printDeselectAllBtn").addEventListener("click", function() {
        document.querySelectorAll('#printTopicsList input[type="checkbox"]').forEach(cb => cb.checked = false);
    });
    document.getElementById("generatePrintBtn").addEventListener("click", function() {
        const checkboxes = document.querySelectorAll('#printTopicsList input[type="checkbox"]:checked');
        const selectedIndices = Array.from(checkboxes).map(cb => parseInt(cb.value, 10));
        const options = {
            includeTheory: document.getElementById("includeTheory").checked,
            includeNotes: document.getElementById("includeNotes").checked,
            includeExamples: document.getElementById("includeExamples").checked,
            includeScreens: document.getElementById("includeScreens").checked
        };
        generatePrintVersion(selectedIndices, options);
        document.getElementById("printPanel").classList.add("hidden");
    });

    document.getElementById("glossaryBtn").addEventListener("click", showGlossary);
    document.getElementById("graphBtn").addEventListener("click", showKnowledgeGraph);

    document.getElementById("quizSelectAllBtn").addEventListener("click", function() {
        document.querySelectorAll('#quizTopicsList input[type="checkbox"]').forEach(cb => cb.checked = true);
    });
    document.getElementById("quizDeselectAllBtn").addEventListener("click", function() {
        document.querySelectorAll('#quizTopicsList input[type="checkbox"]').forEach(cb => cb.checked = false);
    });
}

function renderTopicCheckboxes() {
    const container = document.getElementById("quizTopicsList");
    if (!container) return;
    container.innerHTML = "";
    topics.forEach((topic, index) => {
        const itemDiv = document.createElement("div");
        itemDiv.className = "quiz-topic-item";
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = `topic_${index}`;
        checkbox.value = index;
        const label = document.createElement("label");
        label.htmlFor = `topic_${index}`;
        label.textContent = `${index}. ${topic.title}`;
        itemDiv.appendChild(checkbox);
        itemDiv.appendChild(label);
        container.appendChild(itemDiv);
    });
}

function renderPrintCheckboxes() {
    const container = document.getElementById("printTopicsList");
    if (!container) return;
    container.innerHTML = "";
    topics.forEach((topic, index) => {
        const itemDiv = document.createElement("div");
        itemDiv.className = "print-topic-item";
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = `print_topic_${index}`;
        checkbox.value = index;
        const label = document.createElement("label");
        label.htmlFor = `print_topic_${index}`;
        label.textContent = `${index}. ${topic.title}`;
        itemDiv.appendChild(checkbox);
        itemDiv.appendChild(label);
        container.appendChild(itemDiv);
    });
}

document.getElementById("search").addEventListener("input", filterMenu);
document.getElementById("toggleMenu").addEventListener("click", function(e) {
    e.stopPropagation();
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("show");
    this.innerHTML = sidebar.classList.contains("show") ? "✕" : "☰";
});
document.querySelector(".content").addEventListener("click", function() {
    if (window.innerWidth <= 768) {
        const sidebar = document.getElementById("sidebar");
        if (sidebar.classList.contains("show")) {
            sidebar.classList.remove("show");
            document.getElementById("toggleMenu").innerHTML = "☰";
        }
    }
});
document.getElementById("backButton").addEventListener("click", function() {
    showMainMenu();
});
window.addEventListener("resize", function() {
    if (window.innerWidth > 768) {
        document.getElementById("sidebar").classList.remove("show");
    }
});

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("theorySection").style.display = "none";
    document.getElementById("examplesSection").style.display = "none";
    document.getElementById("screensSection").style.display = "none";
    document.getElementById("title").classList.add("hidden");
    document.getElementById("backToTopics").style.display = "none";
    document.getElementById("currentTopicTitle").style.display = "none";
    document.getElementById("info").style.display = "none";
    initTheme();
    initLightbox();
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/js/service-worker.js')
            .then(reg => console.log('Service Worker зарегистрирован:', reg))
            .catch(err => console.log('Ошибка регистрации Service Worker:', err));
    });
}

// Кнопка "Наверх"
function initScrollToTop() {
    const btn = document.getElementById("scrollToTopBtn");
    const scrollableElement = document.querySelector(".content") || document.querySelector("main") || window;
    
    if (!btn) return;
    
    const checkScroll = () => {
        const scrollTop = scrollableElement === window 
            ? window.scrollY 
            : scrollableElement.scrollTop;
        
        if (scrollTop > 300) {
            btn.classList.add("show");
        } else {
            btn.classList.remove("show");
        }
    };
    
    scrollableElement.addEventListener("scroll", checkScroll);
    checkScroll();
    
    btn.addEventListener("click", () => {
        if (scrollableElement === window) {
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            scrollableElement.scrollTo({ top: 0, behavior: "smooth" });
        }
    });
}

// Ленивая загрузка изображений
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const images = document.querySelectorAll('img:not([loading="lazy"])');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.setAttribute('loading', 'lazy');
                    observer.unobserve(img);
                }
            });
        });
        images.forEach(img => imageObserver.observe(img));
    } else {
        document.querySelectorAll('img').forEach(img => img.setAttribute('loading', 'lazy'));
    }
}

// Навигация с клавиатуры
function initKeyboardNav() {
    const skipLink = document.createElement('a');
    skipLink.href = '#';
    skipLink.className = 'skip-to-content';
    skipLink.textContent = 'Перейти к контенту';
    skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector('.content').focus();
    });
    document.body.prepend(skipLink);
    document.querySelector('.content').setAttribute('tabindex', '-1');
}

// Обработка ошибок загрузки данных
Promise.all([
    fetch("db/topics.json").then(r => r.json()),
    fetch("db/quiz.json").then(r => r.json()),
    fetch("db/glossary.json").then(r => r.json())
]).then(([topicsData, quizDataRaw, glossaryData]) => {
    topics = topicsData.topics;
    quizData = quizDataRaw.questions;
    glossary = glossaryData;
    if (window.onDataLoaded) window.onDataLoaded();
}).catch(err => {
    console.error('Ошибка загрузки данных:', err);
    const mainScreen = document.getElementById("mainScreen");
    if (mainScreen) {
        mainScreen.innerHTML = `<div class="error" style="padding:20px; text-align:center;">
            <h2>Ошибка загрузки данных</h2>
            <p>Не удалось загрузить учебные материалы. Пожалуйста, проверьте подключение к интернету и перезагрузите страницу.</p>
            <button onclick="location.reload()">Обновить</button>
        </div>`;
    }
});