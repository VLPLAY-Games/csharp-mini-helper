let topics = [];
let currentTopic = null;
let isMenuAnimating = false;
let currentMenuIsTopic = false;
let quizData = [];
let glossary = [];

// Загрузка данных
Promise.all([
    fetch("db/topics.json").then(r => r.json()),
    fetch("db/quiz.json").then(r => r.json()),
    fetch("db/glossary.json").then(r => r.json())
]).then(([topicsData, quizDataRaw, glossaryData]) => {
    topics = topicsData.topics;
    quizData = quizDataRaw.questions;
    glossary = glossaryData;
    renderMenu(topics, null);
    renderTopicCheckboxes();
    renderPrintCheckboxes();
    updateBreadcrumbs(['Главная']);
}).catch(err => console.error('Ошибка загрузки данных:', err));

// Универсальная функция для плавной смены содержимого меню
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

// Отображение главного меню (список тем)
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

// Отображение меню текущей темы (оглавление)
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
    }
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

function loadTopic(topic) {
    currentTopic = topic;

    document.getElementById("mainScreen").classList.add("hidden");
    document.getElementById("quizScreen").classList.add("hidden");
    document.getElementById("glossaryScreen").classList.add("hidden");
    document.getElementById("graphScreen").classList.add("hidden");
    document.getElementById("title").classList.remove("hidden");
    document.getElementById("theorySection").style.display = "block";
    document.getElementById("examplesSection").style.display = "block";
    document.getElementById("screensSection").style.display = "block";
    document.getElementById("info").style.display = "block";

    document.getElementById("title").textContent = topic.title;
    document.getElementById("theory").innerHTML = topic.theory;

    const infoDiv = document.getElementById("info");
    infoDiv.innerHTML = "";
    if (topic.important) infoDiv.innerHTML += `<div class="important">⚠ <b>Важно:</b> ${topic.important}</div>`;
    if (topic.error) infoDiv.innerHTML += `<div class="error">❌ <b>Ошибка:</b> ${topic.error}</div>`;
    if (topic.tip) infoDiv.innerHTML += `<div class="tip">💡 <b>Совет:</b> ${topic.tip}</div>`;

    const examplesDiv = document.getElementById("examples");
    examplesDiv.innerHTML = "";
    if (topic.examples && topic.examples.length > 0) {
        topic.examples.forEach((ex, idx) => {
            const block = document.createElement("div");
            block.className = "exampleBlock";
            block.id = `example-${idx}`;

            const h3 = document.createElement("h3");
            h3.textContent = ex.name;
            block.appendChild(h3);

            if (ex.description) {
                const descDiv = document.createElement("div");
                descDiv.className = "example-description";
                descDiv.innerHTML = ex.description;
                block.appendChild(descDiv);
            }

            if (ex.screens && ex.screens.length > 0) {
                const screensDiv = document.createElement("div");
                screensDiv.className = "example-screens";
                ex.screens.forEach(screen => {
                    let src, width, alt;
                    if (typeof screen === 'string') {
                        src = screen;
                        width = null;
                        alt = '';
                    } else {
                        src = screen.src;
                        width = screen.width || null;
                        alt = screen.alt || '';
                    }
                    const img = document.createElement("img");
                    img.src = src;
                    img.alt = alt;
                    img.className = "example-screen";
                    if (width) {
                        img.style.width = width + 'px';
                    }
                    screensDiv.appendChild(img);
                });
                block.appendChild(screensDiv);
            }

            if (ex.codes && Array.isArray(ex.codes)) {
                const columnsDiv = document.createElement("div");
                columnsDiv.className = "example-columns";

                ex.codes.forEach(codeText => {
                    const colDiv = document.createElement("div");
                    colDiv.className = "example-column";

                    const pre = document.createElement("pre");
                    const code = document.createElement("code");
                    code.className = "language-csharp";
                    code.textContent = codeText;
                    pre.appendChild(code);

                    const btn = document.createElement("button");
                    btn.textContent = "Копировать код";
                    btn.onclick = () => {
                        navigator.clipboard.writeText(codeText).then(() => {
                            const originalText = btn.textContent;
                            const originalBg = btn.style.backgroundColor;
                            btn.textContent = "Скопировано!";
                            btn.style.backgroundColor = "#28a745";
                            setTimeout(() => {
                                btn.textContent = originalText;
                                btn.style.backgroundColor = originalBg;
                            }, 1000);
                        }).catch(err => {
                            console.error("Ошибка копирования:", err);
                        });
                    };

                    colDiv.appendChild(pre);
                    colDiv.appendChild(btn);
                    columnsDiv.appendChild(colDiv);
                });

                block.appendChild(columnsDiv);
            } else if (ex.code) {
                const pre = document.createElement("pre");
                const code = document.createElement("code");
                code.className = "language-csharp";
                code.textContent = ex.code;
                pre.appendChild(code);

                const btn = document.createElement("button");
                btn.textContent = "Копировать код";
                btn.onclick = () => {
                    navigator.clipboard.writeText(ex.code).then(() => {
                        const originalText = btn.textContent;
                        const originalBg = btn.style.backgroundColor;
                        btn.textContent = "Скопировано!";
                        btn.style.backgroundColor = "#28a745";
                        setTimeout(() => {
                            btn.textContent = originalText;
                            btn.style.backgroundColor = originalBg;
                        }, 1000);
                    }).catch(err => {
                        console.error("Ошибка копирования:", err);
                    });
                };

                block.appendChild(pre);
                block.appendChild(btn);
            }

            examplesDiv.appendChild(block);
        });
    } else {
        document.getElementById("examplesSection").style.display = "none";
    }

    const screensDiv = document.getElementById("screens");
    screensDiv.innerHTML = "";
    if (topic.screens && topic.screens.length > 0) {
        topic.screens.forEach(img => {
            const image = document.createElement("img");
            image.src = img;
            image.className = "screen";
            screensDiv.appendChild(image);
        });
    } else {
        document.getElementById("screensSection").style.display = "none";
    }

    document.querySelectorAll('pre code').forEach((block) => {
        const code = block.textContent;
        const result = hljs.highlight('c#', code);
        block.innerHTML = result.value;
        block.classList.add('hljs');
    });

    document.getElementById("currentTopicTitle").textContent = topic.title;
    document.getElementById("currentTopicTitle").style.display = "block";
    document.getElementById("backToTopics").style.display = "block";

    switchMenu(renderTopicMenu, topic);

    if (window.innerWidth <= 768) {
        const sidebar = document.getElementById("sidebar");
        if (sidebar.classList.contains("show")) {
            sidebar.classList.remove("show");
            document.getElementById("toggleMenu").innerHTML = "☰";
        }
    }

    updateBreadcrumbs(['Главная', topic.title]);
}

function showMainMenu() {
    document.getElementById("currentTopicTitle").style.display = "none";
    document.getElementById("backToTopics").style.display = "none";
    if (currentMenuIsTopic) {
        switchMenu(renderMenu, topics, currentTopic ? currentTopic.title : null);
    }
}

// ================== ПОИСК ==================
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
        // Заголовок
        if (topic.title.toLowerCase().includes(query)) {
            score += 10;
            matchedParts.push(`Заголовок: ${topic.title}`);
        }
        // Теория
        if (topic.theory && topic.theory.toLowerCase().includes(query)) {
            score += 5;
            matchedParts.push("Теория");
        }
        // Важные заметки
        if (topic.important && topic.important.toLowerCase().includes(query)) {
            score += 4;
            matchedParts.push("Важно");
        }
        if (topic.error && topic.error.toLowerCase().includes(query)) {
            score += 4;
            matchedParts.push("Ошибка");
        }
        if (topic.tip && topic.tip.toLowerCase().includes(query)) {
            score += 4;
            matchedParts.push("Совет");
        }
        // Примеры
        if (topic.examples) {
            topic.examples.forEach((ex, exIdx) => {
                if (ex.name && ex.name.toLowerCase().includes(query)) {
                    score += 3;
                    matchedParts.push(`Пример: ${ex.name}`);
                }
                if (ex.description && ex.description.toLowerCase().includes(query)) {
                    score += 3;
                    matchedParts.push(`Описание примера: ${ex.name}`);
                }
                if (ex.code && ex.code.toLowerCase().includes(query)) {
                    score += 3;
                    matchedParts.push(`Код: ${ex.name}`);
                }
                if (ex.codes) {
                    ex.codes.forEach(code => {
                        if (code.toLowerCase().includes(query)) {
                            score += 3;
                            matchedParts.push(`Код: ${ex.name}`);
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
                matchedParts: matchedParts.slice(0, 3)
            });
        }
    });
    // Поиск по вопросам теста
    quizData.forEach((q, idx) => {
        if (q.question.toLowerCase().includes(query)) {
            results.push({
                type: "quiz",
                topicIndex: q.topicIndex,
                question: q.question,
                score: 5
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
                score: 4
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
                searchResultsDiv.classList.add("hidden");
                searchInput.value = "";
            };
        } else if (res.type === "quiz") {
            div.innerHTML = `<strong>❓ Вопрос теста:</strong> ${res.question}`;
            div.onclick = () => {
                // Перейти в тест с выбранной темой
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
                // Автоматически выбрать тему
                const topicCheckbox = document.querySelector(`#quizTopicsList input[value="${res.topicIndex}"]`);
                if (topicCheckbox) topicCheckbox.checked = true;
                searchResultsDiv.classList.add("hidden");
                searchInput.value = "";
            };
        } else if (res.type === "glossary") {
            div.innerHTML = `<strong>📖 Глоссарий: ${res.term}</strong><br><small>${res.definition.substring(0, 100)}...</small>`;
            div.onclick = () => {
                showGlossary();
                // Прокрутить к термину
                setTimeout(() => {
                    const termElem = document.getElementById(`glossary-${res.term.replace(/\s/g, '-')}`);
                    if (termElem) termElem.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 100);
                searchResultsDiv.classList.add("hidden");
                searchInput.value = "";
            };
        }
        searchResultsDiv.appendChild(div);
    });
    searchResultsDiv.classList.remove("hidden");
}

// ================== ГЛОССАРИЙ ==================
function showGlossary() {
    document.getElementById("mainScreen").classList.add("hidden");
    document.getElementById("quizScreen").classList.add("hidden");
    document.getElementById("glossaryScreen").classList.remove("hidden");
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
    updateBreadcrumbs(['Главная', 'Глоссарий']);
    renderGlossary();
}

function renderGlossary() {
    const container = document.getElementById("glossaryScreen");
    container.innerHTML = "";
    // Группировка по первой букве
    const grouped = {};
    glossary.forEach(term => {
        const letter = term.term[0].toUpperCase();
        if (!grouped[letter]) grouped[letter] = [];
        grouped[letter].push(term);
    });
    const letters = Object.keys(grouped).sort();
    // Алфавитный указатель
    const alphabetDiv = document.createElement("div");
    alphabetDiv.className = "glossary-alphabet";
    letters.forEach(letter => {
        const link = document.createElement("a");
        link.href = `#glossary-${letter}`;
        link.textContent = letter;
        alphabetDiv.appendChild(link);
    });
    container.appendChild(alphabetDiv);
    // Термины по буквам
    letters.forEach(letter => {
        const letterDiv = document.createElement("div");
        letterDiv.className = "glossary-letter";
        letterDiv.id = `glossary-${letter}`;
        const h3 = document.createElement("h3");
        h3.textContent = letter;
        letterDiv.appendChild(h3);
        grouped[letter].forEach(term => {
            const termDiv = document.createElement("div");
            termDiv.className = "glossary-term";
            termDiv.id = `glossary-${term.term.replace(/\s/g, '-')}`;
            const title = document.createElement("h4");
            title.textContent = term.term;
            const def = document.createElement("p");
            def.textContent = term.definition;
            termDiv.appendChild(title);
            termDiv.appendChild(def);
            letterDiv.appendChild(termDiv);
        });
        container.appendChild(letterDiv);
    });
}

// ================== ГРАФ ЗНАНИЙ ==================
let graphNetwork = null;
function showKnowledgeGraph() {
    document.getElementById("mainScreen").classList.add("hidden");
    document.getElementById("quizScreen").classList.add("hidden");
    document.getElementById("glossaryScreen").classList.add("hidden");
    document.getElementById("graphScreen").classList.remove("hidden");
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
    updateBreadcrumbs(['Главная', 'Граф знаний']);
    renderGraph();
}

function renderGraph() {
    const container = document.getElementById("graphScreen");
    container.innerHTML = '<div id="knowledgeGraph" style="width: 100%; height: 100%;"></div>';

    // Получаем актуальные цвета из CSS-переменных
    const style = getComputedStyle(document.body);
    const textColor = style.getPropertyValue('--text-dark').trim() || '#333333';
    const bgColor = style.getPropertyValue('--bg-card').trim() || '#ffffff';
    const borderColor = style.getPropertyValue('--accent-primary').trim() || '#4a7cff';
    const highlightBg = style.getPropertyValue('--accent-primary').trim() || '#4a7cff';

    const nodes = [];
    const edges = [];

    topics.forEach((topic, idx) => {
        nodes.push({
            id: idx,
            label: topic.title,
            title: topic.title,
            group: idx,
            font: { size: 14, color: textColor },
            color: {
                background: bgColor,
                border: borderColor,
                highlight: { background: highlightBg, border: borderColor }
            },
            shape: 'box',
            margin: 12,
            widthConstraint: { minimum: 100, maximum: 200 },
            mass: 2,          // увеличиваем массу для стабильности
            physics: true
        });

        if (topic.prerequisites) {
            topic.prerequisites.forEach(prereqIdx => {
                edges.push({
                    from: prereqIdx,
                    to: idx,
                    arrows: 'to',
                    color: { color: borderColor },
                    width: 2,
                    smooth: { type: 'continuous' }
                });
            });
        }
    });

    const data = {
        nodes: new vis.DataSet(nodes),
        edges: new vis.DataSet(edges)
    };

    const options = {
        nodes: {
            shape: 'box',
            font: { size: 14, color: textColor },
            color: { background: bgColor, border: borderColor },
            margin: 12,
            widthConstraint: { minimum: 100, maximum: 200 }
        },
        edges: {
            color: { color: borderColor },
            width: 2,
            smooth: { type: 'continuous' }
        },
        physics: {
            stabilization: {
                iterations: 300,
                updateInterval: 50,
                onlyDynamicEdges: false,
                fit: true
            },
            solver: 'forceAtlas2Based',
            forceAtlas2Based: {
                gravitationalConstant: -50,
                centralGravity: 0.005,
                springLength: 350,
                springConstant: 0.1,
                damping: 0.9,
                avoidOverlap: 0.5
            },
            maxVelocity: 6,
            minVelocity: 0.05,
            timestep: 0.2
        },
        layout: {
            improvedLayout: true,
            randomSeed: 1
        },
        interaction: {
            hover: true,
            navigationButtons: true,
            dragNodes: true,
            zoomView: true,
            tooltipDelay: 300,
            dragView: true,
            zoomSpeed: 0.8,
            navigation: {
                enabled: true,
                keyboard: {
                    enabled: true,
                    speed: { x: 1, y: 1, zoom: 0.8 }
                }
            }
        }
    };


    if (graphNetwork) {
        graphNetwork.destroy();
    }
    graphNetwork = new vis.Network(document.getElementById("knowledgeGraph"), data, options);

    // После стабилизации подгоняем масштаб
    graphNetwork.once('stabilizationIterationsDone', function () {
        graphNetwork.fit();
    });

    graphNetwork.on("click", function(params) {
        if (params.nodes.length > 0) {
            const topicId = params.nodes[0];
            loadTopic(topics[topicId]);
        }
    });
}


// ================== ПЕЧАТНАЯ ВЕРСИЯ ==================
function generatePrintVersion(selectedIndices, options) {
    if (!topics || topics.length === 0) {
        alert("Данные ещё не загружены. Попробуйте позже.");
        return;
    }
    if (selectedIndices.length === 0) {
        alert("Выберите хотя бы одну тему.");
        return;
    }

    let contentHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>C# Краткий учебник - Избранные темы</title>
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; line-height: 1.5; }
                h1 { color: #1e1e2f; border-bottom: 2px solid #4a7cff; padding-bottom: 10px; }
                h2 { color: #2f5fe0; margin-top: 30px; page-break-after: avoid; }
                h3 { color: #333; margin-top: 20px; page-break-after: avoid; }
                pre { background: #1e1e1e; color: #fff; padding: 15px; border-radius: 8px; overflow-x: auto; white-space: pre-wrap; word-wrap: break-word; }
                code { font-family: Consolas, monospace; }
                .important { background: #fff3cd; padding: 10px; border-left: 4px solid #ffc107; margin: 15px 0; }
                .error { background: #f8d7da; padding: 10px; border-left: 4px solid #dc3545; margin: 15px 0; }
                .tip { background: #d1ecf1; padding: 10px; border-left: 4px solid #17a2b8; margin: 15px 0; }
                .screen, .example-screen { max-width: 100%; margin: 10px 0; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); height: auto; }
                .exampleBlock { margin-bottom: 35px; }
                .example-columns { display: flex; gap: 20px; flex-wrap: wrap; }
                .example-column { flex: 1 1 250px; min-width: 0; }
                .example-screens { display: flex; flex-wrap: wrap; gap: 15px; margin: 15px 0; align-items: flex-start; }
                .example-screen { border: 1px solid #ddd; }
                .toc { margin-bottom: 30px; page-break-after: avoid; }
                .toc ul { list-style: none; padding-left: 20px; }
                .toc a { text-decoration: none; color: #4a7cff; }
                .toc a:hover { text-decoration: underline; }
                @media print {
                    body { margin: 0.5in; }
                    pre { background: #f5f5f5; color: #000; border: 1px solid #ccc; }
                    .page-break { page-break-before: always; }
                    .toc { page-break-after: avoid; }
                    h2, h3 { page-break-after: avoid; }
                }
                .page-number:after {
                    content: counter(page);
                }
            </style>
        </head>
        <body>
            <h1>C# Краткий учебник - Избранные темы</h1>
            <div class="toc">
                <h2>Содержание</h2>
                <ul>
    `;
    // Генерация оглавления
    selectedIndices.sort((a,b)=>a-b);
    selectedIndices.forEach(idx => {
        const topic = topics[idx];
        contentHTML += `<li><a href="#topic-${idx}">${idx}. ${topic.title}</a></li>`;
    });
    contentHTML += `</ul></div><div class="page-break"></div>`;

    // Тела тем
    selectedIndices.forEach(idx => {
        const topic = topics[idx];
        if (!topic) return;
        contentHTML += `<div id="topic-${idx}" class="topic-print">`;
        contentHTML += `<h2>${idx}. ${topic.title}</h2>`;
        if (options.includeTheory && topic.theory) {
            contentHTML += `<div>${topic.theory}</div>`;
        }
        if (options.includeNotes && (topic.important || topic.error || topic.tip)) {
            if (topic.important) contentHTML += `<div class="important">⚠ <b>Важно:</b> ${topic.important}</div>`;
            if (topic.error) contentHTML += `<div class="error">❌ <b>Ошибка:</b> ${topic.error}</div>`;
            if (topic.tip) contentHTML += `<div class="tip">💡 <b>Совет:</b> ${topic.tip}</div>`;
        }
        if (options.includeExamples && topic.examples && topic.examples.length > 0) {
            contentHTML += `<h3>Примеры</h3>`;
            topic.examples.forEach((ex, exIdx) => {
                contentHTML += `<div class="exampleBlock">`;
                contentHTML += `<h4>${ex.name}</h4>`;
                if (ex.description) contentHTML += `<div>${ex.description}</div>`;
                if (options.includeScreens && ex.screens && ex.screens.length > 0) {
                    contentHTML += `<div class="example-screens">`;
                    ex.screens.forEach(screen => {
                        let src, width, alt;
                        if (typeof screen === 'string') {
                            src = screen;
                            width = null;
                            alt = '';
                        } else {
                            src = screen.src;
                            width = screen.width || null;
                            alt = screen.alt || '';
                        }
                        let styleAttr = width ? ` style="width: ${width}px;"` : '';
                        contentHTML += `<img src="${src}" alt="${alt}" class="example-screen"${styleAttr}>`;
                    });
                    contentHTML += `</div>`;
                }
                if (ex.codes && Array.isArray(ex.codes)) {
                    contentHTML += `<div class="example-columns">`;
                    ex.codes.forEach(codeText => {
                        contentHTML += `<div class="example-column"><pre><code>${escapeHtml(codeText)}</code></pre></div>`;
                    });
                    contentHTML += `</div>`;
                } else if (ex.code) {
                    contentHTML += `<pre><code>${escapeHtml(ex.code)}</code></pre>`;
                }
                contentHTML += `</div>`;
            });
        }
        if (options.includeScreens && topic.screens && topic.screens.length > 0) {
            contentHTML += `<h3>Скриншоты</h3>`;
            topic.screens.forEach(img => {
                contentHTML += `<img src="${img}" class="screen" alt="Скриншот">`;
            });
        }
        contentHTML += `</div><div class="page-break"></div>`;
    });

    contentHTML += `</body></html>`;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(contentHTML);
    printWindow.document.close();
    printWindow.onload = function() {
        printWindow.print();
    };
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ================== ОБРАБОТЧИКИ СОБЫТИЙ ==================
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
document.getElementById("quizSelectAllBtn").addEventListener("click", function() {
    document.querySelectorAll('#quizTopicsList input[type="checkbox"]').forEach(cb => cb.checked = true);
});
document.getElementById("quizDeselectAllBtn").addEventListener("click", function() {
    document.querySelectorAll('#quizTopicsList input[type="checkbox"]').forEach(cb => cb.checked = false);
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log('Service Worker зарегистрирован:', reg))
            .catch(err => console.log('Ошибка регистрации Service Worker:', err));
    });
}

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
        // Обновить граф, если открыт
        if (graphNetwork) {
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