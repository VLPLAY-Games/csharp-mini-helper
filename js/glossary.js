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
}

function renderGlossary() {
    const container = document.getElementById("glossaryScreen");
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