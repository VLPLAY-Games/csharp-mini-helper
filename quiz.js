let quizData = [];          // все вопросы из quiz.json
let currentQuiz = null;     // текущий отображаемый набор вопросов

// Загружаем вопросы при старте
fetch("quiz.json")
    .then(r => r.json())
    .then(data => {
        quizData = data.questions; // ожидаем массив вопросов
    });

// Начать тест
document.getElementById("quizStartBtn").addEventListener("click", function() {
    // Собираем выбранные темы
    const checkboxes = document.querySelectorAll('#quizTopicsList input[type="checkbox"]:checked');
    const selectedIndices = Array.from(checkboxes).map(cb => parseInt(cb.value, 10));

    if (selectedIndices.length === 0) {
        alert("Выберите хотя бы одну тему.");
        return;
    }

    // Фильтруем вопросы по выбранным темам
    const questionsByTopic = {};
    selectedIndices.forEach(idx => {
        questionsByTopic[idx] = quizData.filter(q => q.topicIndex === idx);
    });

    // Для каждой темы случайно выбираем один вопрос (если есть)
    const selectedQuestions = [];
    selectedIndices.forEach(idx => {
        const topicQuestions = questionsByTopic[idx];
        if (topicQuestions.length > 0) {
            const randomIndex = Math.floor(Math.random() * topicQuestions.length);
            selectedQuestions.push(topicQuestions[randomIndex]);
        }
    });

    if (selectedQuestions.length === 0) {
        alert("В выбранных темах нет вопросов.");
        return;
    }

    // Перемешиваем вопросы, чтобы они шли в случайном порядке
    selectedQuestions.sort(() => Math.random() - 0.5);

    // Отображаем вопросы
    renderQuiz(selectedQuestions);
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
            // Подсвечиваем правильный вариант зелёным, выбранный неправильный красным
            const options = qDiv.querySelectorAll('.quiz-option');
            options.forEach((opt, optIdx) => {
                opt.style.border = ''; // сброс
                if (optIdx === correctValue) {
                    opt.style.border = '2px solid #28a745';
                } else if (optIdx === selectedValue) {
                    opt.style.border = '2px solid #dc3545';
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
    // Также можно сбросить выделение чекбоксов? Оставим как есть.
});