// glossary.js
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

    const searchInput = document.getElementById("glossarySearch");
    if (searchInput) {
        searchInput.addEventListener("input", filterGlossary);
    }
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