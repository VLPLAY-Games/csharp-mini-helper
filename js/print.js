// print.js
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
    selectedIndices.sort((a,b)=>a-b);
    selectedIndices.forEach(idx => {
        const topic = topics[idx];
        contentHTML += `<li><a href="#topic-${idx}">${idx}. ${topic.title}</a></li>`;
    });
    contentHTML += `</ul></div><div class="page-break"></div>`;

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