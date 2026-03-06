let topics = [];

fetch("topics.json")
    .then(r => r.json())
    .then(data => {
        topics = data.topics;
        renderMenu(topics);
    });

function renderMenu(list) {
    const menu = document.getElementById("menu");
    menu.innerHTML = "";

    list.forEach((topic, index) => {
        const li = document.createElement("li");
        li.textContent = `${index}. ${topic.title}`; // Нумерация
        li.setAttribute("data-title", topic.title);
        li.onclick = () => loadTopic(topic);
        menu.appendChild(li);
    });
}

function loadTopic(topic) {
    const mainScreen = document.getElementById("mainScreen");
    const title = document.getElementById("title");

    const theorySection = document.getElementById("theorySection");
    const examplesSection = document.getElementById("examplesSection");
    const screensSection = document.getElementById("screensSection");
    const info = document.getElementById("info");

    mainScreen.classList.add("hidden");
    title.classList.remove("hidden");
    theorySection.style.display = "block";
    examplesSection.style.display = "block";
    screensSection.style.display = "block";

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
        topic.examples.forEach(ex => {
            const block = document.createElement("div");
            block.className = "exampleBlock";

            const h3 = document.createElement("h3");
            h3.textContent = ex.name;
            block.appendChild(h3);

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
    } else {
        screensSection.style.display = "none";
    }

    document.querySelectorAll('pre code').forEach((block) => {
        const code = block.textContent;
        const result = hljs.highlight('c#', code);
        block.innerHTML = result.value;
        block.classList.add('hljs');
    });

    document.querySelectorAll("#menu li").forEach(li => li.classList.remove("active"));
    const activeLi = document.querySelector(`#menu li[data-title="${topic.title}"]`);
    if (activeLi) {
        activeLi.classList.add("active");
    }

    if (window.innerWidth <= 768) {
        const sidebar = document.getElementById("sidebar");
        if (sidebar.classList.contains("show")) {
            sidebar.classList.remove("show");
            document.getElementById("toggleMenu").innerHTML = "☰";
        }
    }
}

document.getElementById("search").addEventListener("input", e => {
    const value = e.target.value.toLowerCase();
    const items = document.querySelectorAll("#menu li");
    items.forEach(li => {
        const title = li.dataset.title.toLowerCase();
        if (title.includes(value)) {
            li.style.display = "flex";
        } else {
            li.style.display = "none";
        }
    });
});

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
});