let topics = [];
let currentTopic = null;
let isMenuAnimating = false;
let currentMenuIsTopic = false; // false - список тем, true - оглавление темы

fetch("db/topics.json")
    .then(r => r.json())
    .then(data => {
        topics = data.topics;
        renderMenu(topics, null);
        renderTopicCheckboxes();
        renderPrintCheckboxes();
        updateBreadcrumbs(['Главная']);
    });

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

// Вспомогательная функция для создания пункта меню темы
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

// Плавный скролл к элементу
function scrollToElement(id) {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

// Фильтрация меню по поиску
function filterMenu() {
    const searchValue = document.getElementById("search").value.toLowerCase();
    const items = document.querySelectorAll("#menu li");
    items.forEach(li => {
        const title = li.dataset.title.toLowerCase();
        li.style.display = title.includes(searchValue) ? "flex" : "none";
    });
}

// Обновление хлебных крошек
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

// Показать главный экран
function showMainScreen() {
    document.getElementById("mainScreen").classList.remove("hidden");
    document.getElementById("quizScreen").classList.add("hidden");
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

// Загрузка темы
function loadTopic(topic) {
    currentTopic = topic;

    const mainScreen = document.getElementById("mainScreen");
    const title = document.getElementById("title");
    const quizScreen = document.getElementById("quizScreen");

    const theorySection = document.getElementById("theorySection");
    const examplesSection = document.getElementById("examplesSection");
    const screensSection = document.getElementById("screensSection");
    const info = document.getElementById("info");

    quizScreen.classList.add("hidden");

    mainScreen.classList.add("hidden");
    title.classList.remove("hidden");
    theorySection.style.display = "block";
    examplesSection.style.display = "block";
    screensSection.style.display = "block";

    info.style.display = "block";

    [mainScreen, title, document.getElementById("theory"), document.getElementById("examples"), info, document.getElementById("screens")].forEach(el => {
        if (el) {
            el.classList.remove("fadeIn");
            void el.offsetWidth;
            el.classList.add("fadeIn");
        }
    });

    document.getElementById("title").textContent = topic.title;
    document.getElementById("theory").innerHTML = topic.theory;

    info.innerHTML = "";
    if (topic.important) info.innerHTML += `<div class="important">⚠ <b>Важно:</b> ${topic.important}</div>`;
    if (topic.error) info.innerHTML += `<div class="error">❌ <b>Ошибка:</b> ${topic.error}</div>`;
    if (topic.tip) info.innerHTML += `<div class="tip">💡 <b>Совет:</b> ${topic.tip}</div>`;

    const examples = document.getElementById("examples");
    examples.innerHTML = "";
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

            // Добавление скриншотов примера, если есть (поддержка объектов с src, width, alt)
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

            examples.appendChild(block);
        });
    } else {
        examplesSection.style.display = "none";
    }

    const screens = document.getElementById("screens");
    screens.innerHTML = "";
    if (topic.screens && topic.screens.length > 0) {
        topic.screens.forEach(img => {
            const image = document.createElement("img");
            image.src = img;
            image.className = "screen";
            screens.appendChild(image);
        });
        screens.id = "screens";
    } else {
        screensSection.style.display = "none";
    }

    document.querySelectorAll('pre code').forEach((block) => {
        const code = block.textContent;
        const result = hljs.highlight('c#', code);
        block.innerHTML = result.value;
        block.classList.add('hljs');
    });

    const currentTopicTitle = document.getElementById("currentTopicTitle");
    if (currentTopicTitle) {
        currentTopicTitle.textContent = topic.title;
        currentTopicTitle.style.display = "block";
    }
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

// Возврат к главному меню (список тем), но контент текущей темы остаётся видимым
function showMainMenu() {
    const currentTopicTitle = document.getElementById("currentTopicTitle");
    if (currentTopicTitle) {
        currentTopicTitle.style.display = "none";
    }
    document.getElementById("backToTopics").style.display = "none";

    if (currentMenuIsTopic) {
        switchMenu(renderMenu, topics, currentTopic ? currentTopic.title : null);
    }
}

// Генерация печатной версии (PDF) для выбранных тем
function generatePrintVersion(selectedIndices) {
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
                body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; line-height: 1.5; }
                h1 { color: #1e1e2f; border-bottom: 2px solid #4a7cff; padding-bottom: 10px; }
                h2 { color: #2f5fe0; margin-top: 30px; }
                h3 { color: #333; margin-top: 20px; }
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
                @media print {
                    body { margin: 0.5in; }
                    pre { background: #f5f5f5; color: #000; border: 1px solid #ccc; }
                }
            </style>
        </head>
        <body>
            <h1>C# Краткий учебник - Избранные темы</h1>
    `;

    selectedIndices.sort((a, b) => a - b);

    selectedIndices.forEach(index => {
        const topic = topics[index];
        if (!topic) return;

        contentHTML += `<h2>${index}. ${topic.title}</h2>`;

        if (topic.theory) {
            contentHTML += `<div>${topic.theory}</div>`;
        }

        if (topic.important || topic.error || topic.tip) {
            if (topic.important) contentHTML += `<div class="important">⚠ <b>Важно:</b> ${topic.important}</div>`;
            if (topic.error) contentHTML += `<div class="error">❌ <b>Ошибка:</b> ${topic.error}</div>`;
            if (topic.tip) contentHTML += `<div class="tip">💡 <b>Совет:</b> ${topic.tip}</div>`;
        }

        if (topic.examples && topic.examples.length > 0) {
            contentHTML += `<h3>Примеры</h3>`;
            topic.examples.forEach((ex, idx) => {
                contentHTML += `<div class="exampleBlock">`;
                contentHTML += `<h4>${ex.name}</h4>`;
                if (ex.description) contentHTML += `<div>${ex.description}</div>`;

                // Добавляем скриншоты примера в печатную версию (поддержка объектов)
                if (ex.screens && ex.screens.length > 0) {
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

        if (topic.screens && topic.screens.length > 0) {
            contentHTML += `<h3>Скриншоты</h3>`;
            topic.screens.forEach(img => {
                contentHTML += `<img src="${img}" class="screen" alt="Скриншот">`;
            });
        }
    });

    contentHTML += `</body></html>`;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(contentHTML);
    printWindow.document.close();

    printWindow.onload = function() {
        printWindow.print();
    };
}

// Вспомогательная функция для экранирования HTML (чтобы код отображался корректно)
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Обработчики событий
document.getElementById("search").addEventListener("input", filterMenu);

document.getElementById("toggleMenu").addEventListener("click", function(e) {
    e.stopPropagation();
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("show");

    if (sidebar.classList.contains("show")) {
        this.innerHTML = "✕";
        this.style.minHeight = "60px";
    } else {
        this.innerHTML = "☰";
        this.style.minHeight = "80px";
    }
});

document.querySelector(".content").addEventListener("click", function() {
    if (window.innerWidth <= 768) {
        const sidebar = document.getElementById("sidebar");
        if (sidebar.classList.contains("show")) {
            sidebar.classList.remove("show");
            const toggleBtn = document.getElementById("toggleMenu");
            toggleBtn.innerHTML = "☰";
            toggleBtn.style.minHeight = "80px";
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
    const currentTopicTitle = document.getElementById("currentTopicTitle");
    if (currentTopicTitle) {
        currentTopicTitle.style.display = "none";
    }
    document.getElementById("info").style.display = "none";

    // Инициализация темы
    initTheme();
    // Инициализация lightbox
    initLightbox();
});

// Обработчик кнопки перехода к тесту
document.getElementById("goToQuizBtn").addEventListener("click", function() {
    document.getElementById("mainScreen").classList.add("hidden");
    document.getElementById("quizScreen").classList.remove("hidden");
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

// Обработчик кнопки печатной версии
document.getElementById("printVersionBtn").addEventListener("click", function() {
    document.getElementById("printPanel").classList.remove("hidden");
});

// Закрыть панель печати
document.getElementById("closePrintPanel").addEventListener("click", function() {
    document.getElementById("printPanel").classList.add("hidden");
});

// Выбрать все темы для печати
document.getElementById("printSelectAllBtn").addEventListener("click", function() {
    document.querySelectorAll('#printTopicsList input[type="checkbox"]').forEach(cb => cb.checked = true);
});

// Сбросить все темы для печати
document.getElementById("printDeselectAllBtn").addEventListener("click", function() {
    document.querySelectorAll('#printTopicsList input[type="checkbox"]').forEach(cb => cb.checked = false);
});

// Создать PDF для выбранных тем
document.getElementById("generatePrintBtn").addEventListener("click", function() {
    const checkboxes = document.querySelectorAll('#printTopicsList input[type="checkbox"]:checked');
    const selectedIndices = Array.from(checkboxes).map(cb => parseInt(cb.value, 10));
    generatePrintVersion(selectedIndices);
    document.getElementById("printPanel").classList.add("hidden");
});

// Функция для создания чекбоксов тем для теста
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

// Функция для создания чекбоксов тем для печати
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

// Обработчики для кнопок "Выбрать все" и "Сбросить" в тесте
document.getElementById("quizSelectAllBtn").addEventListener("click", function() {
    document.querySelectorAll('#quizTopicsList input[type="checkbox"]').forEach(cb => cb.checked = true);
});
document.getElementById("quizDeselectAllBtn").addEventListener("click", function() {
    document.querySelectorAll('#quizTopicsList input[type="checkbox"]').forEach(cb => cb.checked = false);
});

// Регистрация Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('Service Worker зарегистрирован:', reg))
      .catch(err => console.log('Ошибка регистрации Service Worker:', err));
  });
}

// ================== Тёмная тема ==================
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
    });
}

// ================== Lightbox ==================
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = lightbox.querySelector('.lightbox-image');
    const lightboxCaption = lightbox.querySelector('.lightbox-caption');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const overlay = lightbox.querySelector('.lightbox-overlay');

    function openLightbox(imgElement) {
        const src = imgElement.getAttribute('src');
        const alt = imgElement.getAttribute('alt') || '';
        lightboxImg.src = src;
        lightboxImg.alt = alt;
        lightboxCaption.textContent = alt;
        lightbox.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.add('hidden');
        document.body.style.overflow = '';
    }

    // Делегирование событий для всех скриншотов (как общих, так и примеров)
    document.body.addEventListener('click', (e) => {
        const target = e.target;
        if (target.matches('.screen, .example-screen')) {
            e.preventDefault();
            openLightbox(target);
        }
    });

    closeBtn.addEventListener('click', closeLightbox);
    overlay.addEventListener('click', closeLightbox);

    // Закрытие по Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !lightbox.classList.contains('hidden')) {
            closeLightbox();
        }
    });
}