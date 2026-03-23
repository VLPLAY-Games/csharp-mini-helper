// glossary.js
let glossaryExportButtonAdded = false; // флаг для предотвращения дублирования

function showGlossary() {
    // Удаляем кнопку экспорта темы, если она есть (чтобы не мешала на экране глоссария)
    const topicExportBtn = document.getElementById("exportCurrentTopicBtn");
    if (topicExportBtn) topicExportBtn.remove();

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

    const searchInput = document.getElementById("glossarySearch");
    if (searchInput) {
        searchInput.addEventListener("input", filterGlossary);
    }

    addExportGlossaryButton();
}

function addExportGlossaryButton() {
    // Добавляем кнопку только один раз за всё время работы приложения
    if (glossaryExportButtonAdded) return;

    const glossaryScreen = document.getElementById("glossaryScreen");
    let exportBtn = document.getElementById("exportGlossaryBtn");
    if (!exportBtn) {
        exportBtn = document.createElement("button");
        exportBtn.id = "exportGlossaryBtn";
        exportBtn.textContent = "📄 Экспорт глоссария в PDF";
        exportBtn.style.marginTop = "30px";
        exportBtn.style.display = "block";
        exportBtn.style.marginLeft = "auto";
        exportBtn.style.marginRight = "auto";
        exportBtn.style.background = "var(--success)";
        exportBtn.addEventListener("click", exportGlossaryToPDF);
        const contentDiv = document.getElementById("glossaryContent");
        if (contentDiv) {
            contentDiv.insertAdjacentElement('afterend', exportBtn);
        } else {
            glossaryScreen.appendChild(exportBtn);
        }
        glossaryExportButtonAdded = true;
    }
}

function exportGlossaryToPDF() {
    if (!glossary || glossary.length === 0) {
        alert("Глоссарий пуст.");
        return;
    }

    const grouped = {};
    glossary.forEach(term => {
        const letter = term.term[0].toUpperCase();
        if (!grouped[letter]) grouped[letter] = [];
        grouped[letter].push(term);
    });
    const letters = Object.keys(grouped).sort();

    let contentHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>C# Глоссарий</title>
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; margin: 20px; line-height: 1.5; }
                h1 { color: #1e1e2f; border-bottom: 2px solid #4a7cff; padding-bottom: 10px; }
                .glossary-letter { margin-bottom: 30px; page-break-inside: avoid; }
                .glossary-letter h2 { color: #2f5fe0; background: #f0f2f8; padding: 5px 10px; border-radius: 6px; margin-bottom: 15px; }
                .glossary-term { margin: 15px 0; padding: 10px; border-left: 4px solid #4a7cff; background: #f9f9fc; }
                .glossary-term h3 { margin: 0 0 5px 0; color: #2f5fe0; }
                .glossary-term p { margin: 0; }
                @media print { body { margin: 0.5in; } .glossary-letter { page-break-inside: avoid; } .glossary-term { break-inside: avoid; } }
            </style>
        </head>
        <body>
            <h1>Глоссарий терминов C#</h1>
    `;

    letters.forEach(letter => {
        contentHTML += `<div class="glossary-letter">`;
        contentHTML += `<h2>${letter}</h2>`;
        grouped[letter].forEach(term => {
            contentHTML += `
                <div class="glossary-term">
                    <h3>${escapeHtml(term.term)}</h3>
                    <p>${escapeHtml(term.definition)}</p>
                </div>
            `;
        });
        contentHTML += `</div>`;
    });

    contentHTML += `</body></html>`;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(contentHTML);
    printWindow.document.close();
    printWindow.onload = function() { printWindow.print(); };
}

function renderGlossary() {
    const container = document.getElementById("glossaryContent");
    container.innerHTML = "";
    const grouped = {};
    glossary.forEach(term => {
        const letter = term.term[0].toUpperCase();
        if (!grouped[letter]) grouped[letter] = [];
        grouped[letter].push(term);
    });
    const letters = Object.keys(grouped).sort();
    const alphabetDiv = document.createElement("div");
    alphabetDiv.className = "glossary-alphabet";
    letters.forEach(letter => {
        const link = document.createElement("a");
        link.href = `#glossary-${letter}`;
        link.textContent = letter;
        alphabetDiv.appendChild(link);
    });
    container.appendChild(alphabetDiv);
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

function filterGlossary() {
    const query = document.getElementById("glossarySearch").value.toLowerCase();
    const terms = document.querySelectorAll(".glossary-term");
    terms.forEach(term => {
        const text = term.textContent.toLowerCase();
        term.style.display = text.includes(query) ? "" : "none";
    });
    const letters = document.querySelectorAll(".glossary-letter");
    letters.forEach(letter => {
        const visibleTerms = Array.from(letter.querySelectorAll(".glossary-term")).some(t => t.style.display !== "none");
        letter.style.display = visibleTerms ? "" : "none";
    });
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}