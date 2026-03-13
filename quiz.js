let quizData = [];          // все вопросы из quiz.json
let filteredQuestions = []; // вопросы после фильтрации по темам
let currentQuiz = null;     // текущий отображаемый набор вопросов

// Загружаем вопросы при старте
fetch("quiz.json")
    .then(r => r.json())
    .then(data => {
        quizData = data.questions; // ожидаем массив вопросов
    });

// Заполнение селектов тем вызывается из script.js после загрузки topics
// (функция fillTopicSelects уже определена в script.js)

// Начать тест
document.getElementById("quizStartBtn").addEventListener("click", function() {
    const start = parseInt(document.getElementById("quizTopicStart").value, 10);
    const end = parseInt(document.getElementById("quizTopicEnd").value, 10);
    if (start > end) {
        alert("Начальная тема не может быть больше конечной.");
        return;
    }

    // Фильтруем вопросы по диапазону тем (индексы от start до end включительно)
    filteredQuestions = quizData.filter(q => q.topicIndex >= start && q.topicIndex <= end);

    if (filteredQuestions.length === 0) {
        alert("В выбранных темах нет вопросов.");
        return;
    }

    // Отображаем вопросы
    renderQuiz(filteredQuestions);
    document.getElementById("quizControls").style.display = "flex";
});

// Отрисовка теста
function renderQuiz(questions) {
    const container = document.getElementById("quizContainer");
    container.innerHTML = "";
    questions.forEach((q, idx) => {
        const questionDiv = document.createElement("div");
        questionDiv.className = "quiz-question";
        questionDiv.dataset.questionIndex = idx;

        const questionText = document.createElement("div");
        questionText.className = "quiz-question-text";
        questionText.textContent = q.question;
        questionDiv.appendChild(questionText);

        const optionsDiv = document.createElement("div");
        optionsDiv.className = "quiz-options";

        q.options.forEach((opt, optIdx) => {
            const optionLabel = document.createElement("label");
            optionLabel.className = "quiz-option";

            const radio = document.createElement("input");
            radio.type = "radio";
            radio.name = `q_${idx}`;
            radio.value = optIdx;

            const codeSpan = document.createElement("code");
            codeSpan.textContent = opt;

            optionLabel.appendChild(radio);
            optionLabel.appendChild(codeSpan);
            optionsDiv.appendChild(optionLabel);
        });

        questionDiv.appendChild(optionsDiv);
        container.appendChild(questionDiv);
    });

    // Применить подсветку кода
    document.querySelectorAll('#quizContainer code').forEach(block => {
        const code = block.textContent;
        const result = hljs.highlight('c#', code);
        block.innerHTML = result.value;
        block.classList.add('hljs');
    });

    currentQuiz = questions;
}

// Проверка ответов
document.getElementById("quizCheckBtn").addEventListener("click", function() {
    if (!currentQuiz) return;

    const questions = document.querySelectorAll(".quiz-question");
    let correctCount = 0;

    questions.forEach((qDiv, idx) => {
        const selectedRadio = qDiv.querySelector('input[type="radio"]:checked');
        if (!selectedRadio) return; // не выбран ответ

        const selectedValue = parseInt(selectedRadio.value, 10);
        const correctValue = currentQuiz[idx].correct;

        // Удаляем предыдущие классы подсветки
        qDiv.classList.remove("correct", "incorrect");

        if (selectedValue === correctValue) {
            qDiv.classList.add("correct");
            correctCount++;
        } else {
            qDiv.classList.add("incorrect");
            // Можно подсветить правильный вариант (зеленым) и неправильный (красным)
            // Для этого можно перебрать варианты
            const options = qDiv.querySelectorAll('.quiz-option');
            options.forEach((opt, optIdx) => {
                if (optIdx === correctValue) {
                    opt.style.border = '2px solid #28a745';
                } else if (optIdx === selectedValue) {
                    opt.style.border = '2px solid #dc3545';
                } else {
                    opt.style.border = '';
                }
            });
        }
    });

    alert(`Правильных ответов: ${correctCount} из ${questions.length}`);
});

// Сброс теста
document.getElementById("quizResetBtn").addEventListener("click", function() {
    document.getElementById("quizContainer").innerHTML = "";
    document.getElementById("quizControls").style.display = "none";
    currentQuiz = null;
});