// menu.js
function switchMenu(renderFunc, ...args) {
    if (isMenuAnimating) return;
    const menu = document.getElementById("menu");
    isMenuAnimating = true;
    menu.classList.add("menu-hidden");
    setTimeout(() => {
        renderFunc(...args);
        menu.classList.remove("menu-hidden");
        isMenuAnimating = false;
    }, 250);
}

function renderMenu(list, activeTitle) {
    currentMenuIsTopic = false;
    const menu = document.getElementById("menu");
    menu.innerHTML = "";

    list.forEach((topic, index) => {
        const li = document.createElement("li");
        li.textContent = `${index}. ${topic.title}`;
        li.setAttribute("data-title", topic.title);
        if (activeTitle === topic.title) {
            li.classList.add("active");
        }
        li.onclick = () => loadTopic(topic);
        menu.appendChild(li);
    });

    filterMenu();
}

function renderTopicMenu(topic) {
    currentMenuIsTopic = true;
    const menu = document.getElementById("menu");
    menu.innerHTML = "";

    addMenuItem(menu, "📘 Теория", "theory");

    if (topic.important || topic.error || topic.tip) {
        addMenuItem(menu, "⚠️ Важное", "info");
    }

    if (topic.examples && topic.examples.length > 0) {
        topic.examples.forEach((ex, idx) => {
            addMenuItem(menu, `📄 ${ex.name}`, `example-${idx}`);
        });
    }

    if (topic.screens && topic.screens.length > 0) {
        addMenuItem(menu, "🖼️ Скриншоты", "screens");
    }

    filterMenu();
}

function addMenuItem(menu, text, targetId) {
    const li = document.createElement("li");
    li.textContent = text;
    li.setAttribute("data-title", text);
    li.setAttribute("data-target", targetId);
    li.onclick = (e) => {
        e.stopPropagation();
        scrollToElement(targetId);
        if (window.innerWidth <= 768) {
            const sidebar = document.getElementById("sidebar");
            if (sidebar.classList.contains("show")) {
                sidebar.classList.remove("show");
                document.getElementById("toggleMenu").innerHTML = "☰";
            }
        }
    };
    menu.appendChild(li);
}

function scrollToElement(id) {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        highlightElement(element);
    }
}

function highlightElement(el) {
    const originalBg = el.style.backgroundColor;
    el.style.backgroundColor = "var(--accent-primary)";
    el.style.transition = "background-color 0.5s";
    setTimeout(() => {
        el.style.backgroundColor = originalBg;
    }, 1500);
}

function filterMenu() {
    const searchValue = document.getElementById("search").value.toLowerCase();
    const items = document.querySelectorAll("#menu li");
    items.forEach(li => {
        const title = li.dataset.title.toLowerCase();
        li.style.display = title.includes(searchValue) ? "flex" : "none";
    });
}

function updateBreadcrumbs(path) {
    const container = document.getElementById("breadcrumbs");
    if (!container) return;
    let html = '';
    for (let i = 0; i < path.length; i++) {
        const item = path[i];
        if (i === path.length - 1) {
            html += `<span class="current">${item}</span>`;
        } else {
            html += `<a href="#" data-index="${i}">${item}</a>`;
            html += `<span class="separator">/</span>`;
        }
    }
    container.innerHTML = html;

    container.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const index = parseInt(e.target.dataset.index, 10);
            if (index === 0) {
                showMainScreen();
            }
        });
    });
}

function showMainScreen() {
    document.getElementById("mainScreen").classList.remove("hidden");
    document.getElementById("quizScreen").classList.add("hidden");
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
    
    updateBreadcrumbs(['Главная']);
}

function showMainMenu() {
    document.getElementById("currentTopicTitle").style.display = "none";
    document.getElementById("backToTopics").style.display = "none";
    if (currentMenuIsTopic) {
        switchMenu(renderMenu, topics, currentTopic ? currentTopic.title : null);
    }
}

// ========== ПОИСК ==========
const searchInput = document.getElementById("search");
const searchResultsDiv = document.getElementById("searchResults");

searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    if (query.length < 2) {
        searchResultsDiv.classList.add("hidden");
        return;
    }
    const results = fullTextSearch(query);
    displaySearchResults(results);
});

function fullTextSearch(query) {
    const results = [];
    // Поиск по темам
    topics.forEach((topic, idx) => {
        let score = 0;
        let matchedParts = [];
        let targetId = null;
        if (topic.title.toLowerCase().includes(query)) {
            score += 10;
            matchedParts.push(`Заголовок: ${topic.title}`);
            targetId = `topic-${idx}`;
        }
        if (topic.theory && topic.theory.toLowerCase().includes(query)) {
            score += 5;
            matchedParts.push("Теория");
            targetId = "theory";
        }
        if (topic.important && topic.important.toLowerCase().includes(query)) {
            score += 4;
            matchedParts.push("Важно");
            targetId = "info";
        }
        if (topic.error && topic.error.toLowerCase().includes(query)) {
            score += 4;
            matchedParts.push("Ошибка");
            targetId = "info";
        }
        if (topic.tip && topic.tip.toLowerCase().includes(query)) {
            score += 4;
            matchedParts.push("Совет");
            targetId = "info";
        }
        if (topic.examples) {
            topic.examples.forEach((ex, exIdx) => {
                if (ex.name && ex.name.toLowerCase().includes(query)) {
                    score += 3;
                    matchedParts.push(`Пример: ${ex.name}`);
                    targetId = `example-${exIdx}`;
                }
                if (ex.description && ex.description.toLowerCase().includes(query)) {
                    score += 3;
                    matchedParts.push(`Описание примера: ${ex.name}`);
                    targetId = `example-${exIdx}`;
                }
                if (ex.code && ex.code.toLowerCase().includes(query)) {
                    score += 3;
                    matchedParts.push(`Код: ${ex.name}`);
                    targetId = `example-${exIdx}`;
                }
                if (ex.codes) {
                    ex.codes.forEach(code => {
                        if (code.toLowerCase().includes(query)) {
                            score += 3;
                            matchedParts.push(`Код: ${ex.name}`);
                            targetId = `example-${exIdx}`;
                        }
                    });
                }
            });
        }
        if (score > 0) {
            results.push({
                type: "topic",
                topicIndex: idx,
                title: topic.title,
                score: score,
                matchedParts: matchedParts.slice(0, 3),
                targetId: targetId || `topic-${idx}`
            });
        }
    });
    // Поиск по вопросам теста
    quizData.forEach((q, qIdx) => {
        if (q.question.toLowerCase().includes(query)) {
            results.push({
                type: "quiz",
                topicIndex: q.topicIndex,
                question: q.question,
                score: 5,
                targetId: `quiz-question-${qIdx}`
            });
        }
    });
    // Поиск по глоссарию
    glossary.forEach(term => {
        if (term.term.toLowerCase().includes(query) || term.definition.toLowerCase().includes(query)) {
            results.push({
                type: "glossary",
                term: term.term,
                definition: term.definition,
                score: 4,
                targetId: `glossary-${term.term.replace(/\s/g, '-')}`
            });
        }
    });
    results.sort((a,b) => b.score - a.score);
    return results.slice(0, 15);
}

function displaySearchResults(results) {
    if (results.length === 0) {
        searchResultsDiv.classList.add("hidden");
        return;
    }
    searchResultsDiv.innerHTML = "";
    results.forEach(res => {
        const div = document.createElement("div");
        div.className = "search-result-item";
        if (res.type === "topic") {
            div.innerHTML = `<strong>📘 Тема: ${res.title}</strong><br><small>${res.matchedParts.join(", ")}</small>`;
            div.onclick = () => {
                loadTopic(topics[res.topicIndex]);
                setTimeout(() => {
                    if (res.targetId) {
                        const elem = document.getElementById(res.targetId);
                        if (elem) {
                            elem.scrollIntoView({ behavior: "smooth", block: "center" });
                            highlightElement(elem);
                        }
                    }
                }, 300);
                searchResultsDiv.classList.add("hidden");
                searchInput.value = "";
            };
        } else if (res.type === "quiz") {
            div.innerHTML = `<strong>❓ Вопрос теста:</strong> ${res.question}`;
            div.onclick = () => {
                const quizScreen = document.getElementById("quizScreen");
                document.getElementById("mainScreen").classList.add("hidden");
                quizScreen.classList.remove("hidden");
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
                const topicCheckbox = document.querySelector(`#quizTopicsList input[value="${res.topicIndex}"]`);
                if (topicCheckbox) topicCheckbox.checked = true;
                document.getElementById("quizStartBtn").click();
                setTimeout(() => {
                    const questionElem = document.getElementById(res.targetId);
                    if (questionElem) {
                        questionElem.scrollIntoView({ behavior: "smooth", block: "center" });
                        highlightElement(questionElem);
                    }
                }, 500);
                searchResultsDiv.classList.add("hidden");
                searchInput.value = "";
            };
        } else if (res.type === "glossary") {
            div.innerHTML = `<strong>📖 Глоссарий: ${res.term}</strong><br><small>${res.definition.substring(0, 100)}...</small>`;
            div.onclick = () => {
                showGlossary();
                setTimeout(() => {
                    const termElem = document.getElementById(res.targetId);
                    if (termElem) termElem.scrollIntoView({ behavior: "smooth", block: "start" });
                    if (termElem) highlightElement(termElem);
                }, 100);
                searchResultsDiv.classList.add("hidden");
                searchInput.value = "";
            };
        }
        searchResultsDiv.appendChild(div);
    });
    searchResultsDiv.classList.remove("hidden");
}