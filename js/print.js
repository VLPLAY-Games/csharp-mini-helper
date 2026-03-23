// print.js
let topicPrintSettings = {}; // { topicIndex: { includeExamples: true, includeScreens: true, selectedExamples: [], selectedScreens: [] } }

// Добавляем чекбокс "Содержание" в панель печати, если его ещё нет
function addTocOptionToPrintPanel() {
    const printOptions = document.querySelector('#printOptions');
    if (!printOptions) return;
    // Проверяем, существует ли уже чекбокс
    if (document.getElementById('includeToc')) return;
    const label = document.createElement('label');
    label.innerHTML = '<input type="checkbox" id="includeToc" checked> Содержание (оглавление)';
    printOptions.appendChild(label);
}

// Вызываем при загрузке страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addTocOptionToPrintPanel);
} else {
    addTocOptionToPrintPanel();
}

function renderPrintCheckboxesWithGear() {
    const container = document.getElementById("printTopicsList");
    if (!container) return;
    container.innerHTML = "";
    topics.forEach((topic, index) => {
        if (!topicPrintSettings[index]) {
            topicPrintSettings[index] = {
                includeExamples: true,
                includeScreens: true,
                selectedExamples: topic.examples ? topic.examples.map((_, i) => i) : [],
                selectedScreens: topic.screens ? topic.screens.map((_, i) => i) : []
            };
        }
        const itemDiv = document.createElement("div");
        itemDiv.className = "print-topic-item";
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = `print_topic_${index}`;
        checkbox.value = index;
        const label = document.createElement("label");
        label.htmlFor = `print_topic_${index}`;
        label.textContent = `${index}. ${topic.title}`;
        const gearBtn = document.createElement("button");
        gearBtn.textContent = "⚙️";
        gearBtn.className = "topic-gear";
        gearBtn.title = "Настройки темы";
        gearBtn.onclick = (e) => {
            e.stopPropagation();
            openTopicSettings(index, topic);
        };
        itemDiv.appendChild(checkbox);
        itemDiv.appendChild(label);
        itemDiv.appendChild(gearBtn);
        container.appendChild(itemDiv);
    });
}

function openTopicSettings(topicIndex, topic) {
    const existingModal = document.querySelector(".print-topic-settings-modal");
    if (existingModal) existingModal.remove();

    const settings = topicPrintSettings[topicIndex];
    const modal = document.createElement("div");
    modal.className = "print-topic-settings-modal";
    modal.innerHTML = `
        <div class="modal-header">
            <h4>Настройки темы: ${topic.title}</h4>
            <button class="close-modal">&times;</button>
        </div>
        <div class="settings-group">
            <h5>Примеры</h5>
            <label><input type="checkbox" class="include-examples" ${settings.includeExamples ? 'checked' : ''}> Включить примеры (общее)</label>
            <div class="examples-list" style="margin-left: 20px; ${!settings.includeExamples ? 'display:none;' : ''}">
                ${topic.examples ? topic.examples.map((ex, idx) => `
                    <label><input type="checkbox" class="example-item" data-idx="${idx}" ${settings.selectedExamples.includes(idx) ? 'checked' : ''}> ${ex.name}</label>
                `).join('') : '<em>Нет примеров</em>'}
            </div>
        </div>
        <div class="settings-group">
            <h5>Скриншоты</h5>
            <label><input type="checkbox" class="include-screens" ${settings.includeScreens ? 'checked' : ''}> Включить скриншоты (общее)</label>
            <div class="screens-list" style="margin-left: 20px; ${!settings.includeScreens ? 'display:none;' : ''}">
                ${topic.screens ? topic.screens.map((_, idx) => `
                    <label><input type="checkbox" class="screen-item" data-idx="${idx}" ${settings.selectedScreens.includes(idx) ? 'checked' : ''}> Скриншот ${idx+1}</label>
                `).join('') : '<em>Нет скриншотов</em>'}
            </div>
        </div>
        <button id="saveTopicSettings">Сохранить</button>
    `;
    document.body.appendChild(modal);

    const includeExamplesCheckbox = modal.querySelector('.include-examples');
    const examplesList = modal.querySelector('.examples-list');
    const includeScreensCheckbox = modal.querySelector('.include-screens');
    const screensList = modal.querySelector('.screens-list');

    includeExamplesCheckbox.addEventListener('change', () => {
        examplesList.style.display = includeExamplesCheckbox.checked ? 'block' : 'none';
    });
    includeScreensCheckbox.addEventListener('change', () => {
        screensList.style.display = includeScreensCheckbox.checked ? 'block' : 'none';
    });

    modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
    modal.querySelector('#saveTopicSettings').addEventListener('click', () => {
        settings.includeExamples = includeExamplesCheckbox.checked;
        settings.includeScreens = includeScreensCheckbox.checked;
        settings.selectedExamples = [];
        if (settings.includeExamples) {
            modal.querySelectorAll('.example-item:checked').forEach(cb => {
                settings.selectedExamples.push(parseInt(cb.dataset.idx, 10));
            });
        }
        settings.selectedScreens = [];
        if (settings.includeScreens) {
            modal.querySelectorAll('.screen-item:checked').forEach(cb => {
                settings.selectedScreens.push(parseInt(cb.dataset.idx, 10));
            });
        }
        modal.remove();
    });
}

function generatePrintVersion(selectedIndices, options) {
    if (!topics || topics.length === 0) {
        alert("Данные ещё не загружены. Попробуйте позже.");
        return;
    }
    if (selectedIndices.length === 0) {
        alert("Выберите хотя бы одну тему.");
        return;
    }

    // Если в options не передан includeToc, пробуем прочитать из DOM
    if (options.includeToc === undefined) {
        const tocCheckbox = document.getElementById("includeToc");
        options.includeToc = tocCheckbox ? tocCheckbox.checked : true;
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
    `;

    // Добавляем оглавление, если включено
    if (options.includeToc) {
        contentHTML += `
            <div class="toc">
                <h2>Содержание</h2>
                <ul>
        `;
        selectedIndices.sort((a,b)=>a-b);
        selectedIndices.forEach(idx => {
            const topic = topics[idx];
            contentHTML += `<li><a href="#topic-${idx}">${idx}. ${topic.title}</a></li>`;
        });
        contentHTML += `</ul></div><div class="page-break"></div>`;
    } else {
        contentHTML += `<div class="page-break"></div>`;
    }

    selectedIndices.forEach((idx, i) => {
        const topic = topics[idx];
        if (!topic) return;
        const settings = topicPrintSettings[idx] || {
            includeExamples: true,
            includeScreens: true,
            selectedExamples: topic.examples ? topic.examples.map((_, i) => i) : [],
            selectedScreens: topic.screens ? topic.screens.map((_, i) => i) : []
        };
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
        if (options.includeExamples && topic.examples && topic.examples.length > 0 && settings.includeExamples && settings.selectedExamples.length > 0) {
            contentHTML += `<h3>Примеры</h3>`;
            topic.examples.forEach((ex, exIdx) => {
                if (!settings.selectedExamples.includes(exIdx)) return;
                contentHTML += `<div class="exampleBlock">`;
                contentHTML += `<h4>${ex.name}</h4>`;
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
            contentHTML += `<h3>Скриншоты</h3>`;
            topic.screens.forEach((img, scrIdx) => {
                if (settings.selectedScreens.includes(scrIdx)) {
                    contentHTML += `<img src="${img}" class="screen" alt="Скриншот">`;
                }
            });
        }
        contentHTML += `</div>`;
        // Добавляем разрыв страницы, только если это не последняя тема
        if (i < selectedIndices.length - 1) {
            contentHTML += `<div class="page-break"></div>`;
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

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}