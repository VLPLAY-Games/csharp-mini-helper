// main.js
window.onDataLoaded = function() {
    renderMenu(topics, null);
    renderTopicCheckboxes();
    renderPrintCheckboxes();
    updateBreadcrumbs(['Главная']);
    attachEventHandlers(); // после загрузки данных
};

function attachEventHandlers() {
    // кнопка "Пройти тест"
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

    // печатная версия
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

    // глоссарий и граф
    document.getElementById("glossaryBtn").addEventListener("click", showGlossary);
    document.getElementById("graphBtn").addEventListener("click", showKnowledgeGraph);

    // кнопки в тесте
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

// Обработчики, которые не зависят от данных
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
    // attachEventHandlers вызывается после загрузки данных
});

// Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log('Service Worker зарегистрирован:', reg))
            .catch(err => console.log('Ошибка регистрации Service Worker:', err));
    });
}