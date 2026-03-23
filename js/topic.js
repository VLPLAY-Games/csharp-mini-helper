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