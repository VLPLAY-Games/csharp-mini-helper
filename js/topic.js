// topic.js
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
                    img.loading = "lazy";
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
            image.loading = "lazy";
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

    addTooltipsToContent();

    // Добавляем кнопку экспорта темы
    addTopicExportButton(topic);
}

function addTooltipsToContent() {
    const containers = [
        document.getElementById("theory"),
        document.getElementById("info"),
        document.getElementById("examples")
    ];
    const glossaryMap = new Map();
    glossary.forEach(term => glossaryMap.set(term.term.toLowerCase(), term.definition));

    containers.forEach(container => {
        if (!container) return;
        const html = container.innerHTML;
        const newHtml = html.replace(/\b([А-Яа-яA-Za-z0-9\s]+)\b/g, (match) => {
            const lower = match.toLowerCase();
            if (glossaryMap.has(lower)) {
                return `<span class="tooltip-term" data-definition="${glossaryMap.get(lower).replace(/"/g, '&quot;')}">${match}</span>`;
            }
            return match;
        });
        container.innerHTML = newHtml;
    });
}

function addTopicExportButton(topic) {
    // Удаляем старую кнопку, если есть
    const oldBtn = document.getElementById("exportCurrentTopicBtn");
    if (oldBtn) oldBtn.remove();

    const btn = document.createElement("button");
    btn.id = "exportCurrentTopicBtn";
    btn.textContent = "📄 Экспорт темы в PDF";
    btn.style.marginTop = "30px";
    btn.style.display = "block";
    btn.style.marginLeft = "auto";
    btn.style.marginRight = "auto";
    btn.style.background = "var(--success)";
    btn.onclick = () => showTopicExportModal(topic);

    // Вставляем после последней секции (скриншоты или после примеров)
    const screensSection = document.getElementById("screensSection");
    if (screensSection && screensSection.style.display !== "none") {
        screensSection.insertAdjacentElement('afterend', btn);
    } else {
        const examplesSection = document.getElementById("examplesSection");
        if (examplesSection && examplesSection.style.display !== "none") {
            examplesSection.insertAdjacentElement('afterend', btn);
        } else {
            const theorySection = document.getElementById("theorySection");
            theorySection.insertAdjacentElement('afterend', btn);
        }
    }
}

function showTopicExportModal(topic) {
    const topicIndex = topics.findIndex(t => t.title === topic.title);
    if (topicIndex === -1) return;

    // Убираем предыдущее модальное окно
    const existingModal = document.querySelector(".topic-export-modal");
    if (existingModal) existingModal.remove();

    const settings = topicPrintSettings[topicIndex] || {
        includeExamples: true,
        includeScreens: true,
        selectedExamples: topic.examples ? topic.examples.map((_, i) => i) : [],
        selectedScreens: topic.screens ? topic.screens.map((_, i) => i) : []
    };

    const modal = document.createElement("div");
    modal.className = "topic-export-modal";
    modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--bg-card);
        border-radius: 12px;
        padding: 25px;
        z-index: 2100;
        width: 90%;
        max-width: 500px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        border: 1px solid var(--border-light);
    `;

    modal.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="margin: 0;">Экспорт темы: ${escapeHtml(topic.title)}</h3>
            <button class="close-modal" style="background: transparent; border: none; font-size: 24px; cursor: pointer;">&times;</button>
        </div>
        <div class="export-options">
            <label><input type="checkbox" id="exportTheory" checked> Теория</label><br>
            <label><input type="checkbox" id="exportNotes" checked> Важное/Ошибки/Советы</label><br>
            <label><input type="checkbox" id="exportExamples" ${settings.includeExamples ? 'checked' : ''}> Примеры</label><br>
            <label><input type="checkbox" id="exportScreens" ${settings.includeScreens ? 'checked' : ''}> Скриншоты</label><br>
            <button id="configureExamplesBtn" style="margin-top: 15px; background: var(--accent-primary);">⚙️ Настроить примеры и скриншоты</button>
        </div>
        <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
            <button id="cancelExportBtn" style="background: #6c757d;">Отмена</button>
            <button id="confirmExportBtn" style="background: var(--success);">Создать PDF</button>
        </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('.close-modal');
    const cancelBtn = modal.querySelector('#cancelExportBtn');
    const confirmBtn = modal.querySelector('#confirmExportBtn');
    const configureBtn = modal.querySelector('#configureExamplesBtn');

    closeBtn.onclick = () => modal.remove();
    cancelBtn.onclick = () => modal.remove();

    configureBtn.onclick = () => {
        modal.remove();
        if (typeof openTopicSettings === 'function') {
            openTopicSettings(topicIndex, topic);
        } else {
            alert("Функция настроек недоступна");
        }
    };

    confirmBtn.onclick = () => {
        const options = {
            includeTheory: document.getElementById('exportTheory').checked,
            includeNotes: document.getElementById('exportNotes').checked,
            includeExamples: document.getElementById('exportExamples').checked,
            includeScreens: document.getElementById('exportScreens').checked
        };
        modal.remove();
        exportSingleTopicToPDF(topic, options, topicIndex);
    };
}

function exportSingleTopicToPDF(topic, options, topicIndex) {
    const settings = topicPrintSettings[topicIndex] || {
        includeExamples: true,
        includeScreens: true,
        selectedExamples: topic.examples ? topic.examples.map((_, i) => i) : [],
        selectedScreens: topic.screens ? topic.screens.map((_, i) => i) : []
    };

    let contentHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>C# - ${escapeHtml(topic.title)}</title>
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; margin: 20px; line-height: 1.5; }
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
                @media print { body { margin: 0.5in; } pre { background: #f5f5f5; color: #000; border: 1px solid #ccc; } h2, h3 { page-break-after: avoid; } }
            </style>
        </head>
        <body>
            <h1>${escapeHtml(topic.title)}</h1>
    `;

    if (options.includeTheory && topic.theory) {
        contentHTML += `<div>${topic.theory}</div>`;
    }

    if (options.includeNotes && (topic.important || topic.error || topic.tip)) {
        if (topic.important) contentHTML += `<div class="important">⚠ <b>Важно:</b> ${topic.important}</div>`;
        if (topic.error) contentHTML += `<div class="error">❌ <b>Ошибка:</b> ${topic.error}</div>`;
        if (topic.tip) contentHTML += `<div class="tip">💡 <b>Совет:</b> ${topic.tip}</div>`;
    }

    if (options.includeExamples && topic.examples && topic.examples.length > 0 && settings.includeExamples && settings.selectedExamples.length > 0) {
        contentHTML += `<h2>Примеры</h2>`;
        topic.examples.forEach((ex, exIdx) => {
            if (!settings.selectedExamples.includes(exIdx)) return;
            contentHTML += `<div class="exampleBlock">`;
            contentHTML += `<h3>${escapeHtml(ex.name)}</h3>`;
            if (ex.description) contentHTML += `<div>${ex.description}</div>`;
            if (options.includeScreens && settings.includeScreens && ex.screens && ex.screens.length > 0) {
                contentHTML += `<div class="example-screens">`;
                ex.screens.forEach((screen, scrIdx) => {
                    if (settings.selectedScreens.includes(scrIdx)) {
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
                    }
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

    if (options.includeScreens && topic.screens && topic.screens.length > 0 && settings.includeScreens && settings.selectedScreens.length > 0) {
        contentHTML += `<h2>Скриншоты</h2>`;
        topic.screens.forEach((img, scrIdx) => {
            if (settings.selectedScreens.includes(scrIdx)) {
                contentHTML += `<img src="${img}" class="screen" alt="Скриншот">`;
            }
        });
    }

    contentHTML += `</body></html>`;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(contentHTML);
    printWindow.document.close();
    printWindow.onload = function() { printWindow.print(); };
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}