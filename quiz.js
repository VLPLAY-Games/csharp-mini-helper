let quizData = [];          // все вопросы из quiz.json
let currentMode = 'radio';   // 'radio' или 'match'
let currentQuestions = [];   // текущие вопросы (для radio)
let matchQuestions = [];     // данные для блочного режима: массив вопросов { qId, text }
let matchAnswers = [];       // данные для блочного режима: массив ответов { aId, text, questionId, isCorrect }
let matchState = {
    selected: null,          // { type: 'question', id } или { type: 'answer', id } или null
    pairs: [],               // [{ qId, aId }] успешные пары
};

// Загружаем вопросы при старте
fetch("db/quiz.json")
    .then(r => r.json())
    .then(data => {
        quizData = data.questions;
    });

// Переключение режима
document.querySelectorAll('input[name="quizMode"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        currentMode = e.target.value;
        document.getElementById('quizContainer').classList.toggle('hidden', currentMode !== 'radio');
        document.getElementById('matchContainer').classList.toggle('hidden', currentMode !== 'match');
        // Скрываем кнопку "Проверить" в блочном режиме
        document.getElementById('quizCheckBtn').style.display = currentMode === 'radio' ? 'inline-block' : 'none';
    });
});

// Кнопка сворачивания/разворачивания настроек теста
document.getElementById('toggleQuizSettingsBtn').addEventListener('click', function() {
    const settingsPanel = document.getElementById('quizSettingsPanel');
    const testArea = document.getElementById('quizTestArea');
    
    settingsPanel.classList.toggle('hidden');
    testArea.classList.toggle('hidden');
});

// Начать тест
document.getElementById("quizStartBtn").addEventListener("click", function() {
    const checkboxes = document.querySelectorAll('#quizTopicsList input[type="checkbox"]:checked');
    const selectedIndices = Array.from(checkboxes).map(cb => parseInt(cb.value, 10));

    if (selectedIndices.length === 0) {
        alert("Выберите хотя бы одну тему.");
        return;
    }

    document.getElementById('quizSettingsPanel').classList.add('hidden');
    document.getElementById('quizTestArea').classList.remove('hidden');

    if (currentMode === 'radio') {
        startRadioQuiz(selectedIndices);
    } else {
        startMatchQuiz(selectedIndices);
    }
});

// ------------------ Обычный режим (radio) ------------------
function startRadioQuiz(selectedIndices) {
    document.getElementById('quizCheckBtn').style.display = 'inline-block';

    clearMatchData();

    const questionsByTopic = {};
    selectedIndices.forEach(idx => {
        questionsByTopic[idx] = quizData.filter(q => q.topicIndex === idx);
    });

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

    selectedQuestions.sort(() => Math.random() - 0.5);
    renderRadioQuiz(selectedQuestions);
    document.getElementById("quizControls").style.display = "flex";
    document.getElementById('quizContainer').classList.remove('hidden');
    document.getElementById('matchContainer').classList.add('hidden');
}

function renderRadioQuiz(questions) {
    const container = document.getElementById("quizContainer");
    container.innerHTML = "";
    currentQuestions = questions;

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

    document.querySelectorAll('#quizContainer code').forEach(block => {
        const code = block.textContent;
        const result = hljs.highlight('c#', code);
        block.innerHTML = result.value;
        block.classList.add('hljs');
    });
}

// Проверка обычного теста
document.getElementById("quizCheckBtn").addEventListener("click", function() {
    if (currentMode === 'radio') {
        checkRadioQuiz();
    }
});

function checkRadioQuiz() {
    if (!currentQuestions || currentQuestions.length === 0) return;

    const questions = document.querySelectorAll("#quizContainer .quiz-question");
    let correctCount = 0;

    questions.forEach((qDiv, idx) => {
        const selectedRadio = qDiv.querySelector('input[type="radio"]:checked');
        if (!selectedRadio) return;

        const selectedValue = parseInt(selectedRadio.value, 10);
        const correctValue = currentQuestions[idx].correct;

        qDiv.classList.remove("correct", "incorrect");
        if (selectedValue === correctValue) {
            qDiv.classList.add("correct");
            correctCount++;
        } else {
            qDiv.classList.add("incorrect");
            const options = qDiv.querySelectorAll('.quiz-option');
            options.forEach((opt, optIdx) => {
                opt.style.border = '';
                if (optIdx === correctValue) {
                    opt.style.border = '2px solid #28a745';
                } else if (optIdx === selectedValue) {
                    opt.style.border = '2px solid #dc3545';
                }
            });
        }
    });

    alert(`Правильных ответов: ${correctCount} из ${questions.length}`);
}

// ------------------ Блочный режим (match) ------------------
function startMatchQuiz(selectedIndices) {
    document.getElementById('quizCheckBtn').style.display = 'none';

    document.getElementById("quizContainer").innerHTML = "";
    currentQuestions = [];

    const { questions, answers } = generateMatchData(selectedIndices);
    matchQuestions = questions;
    matchAnswers = answers;

    if (questions.length === 0 || answers.length === 0) {
        alert("Нет вопросов для выбранных тем.");
        return;
    }

    renderMatchQuiz(questions, answers);

    document.getElementById('quizContainer').classList.add('hidden');
    document.getElementById('matchContainer').classList.remove('hidden');
    document.getElementById("quizControls").style.display = "flex";

    matchState = { selected: null, pairs: [] };
}

function generateMatchData(selectedIndices) {
    const questions = [];
    const answers = [];
    const questionsByTopic = {};

    selectedIndices.forEach(idx => {
        questionsByTopic[idx] = quizData.filter(q => q.topicIndex === idx);
    });

    let selectedQuestions = [];
    if (selectedIndices.length === 1) {
        const topicIdx = selectedIndices[0];
        const topicQuestions = questionsByTopic[topicIdx];
        if (topicQuestions.length > 0) {
            const shuffled = [...topicQuestions].sort(() => Math.random() - 0.5);
            selectedQuestions = shuffled.slice(0, Math.min(3, shuffled.length));
        }
    } else {
        selectedIndices.forEach(idx => {
            const topicQuestions = questionsByTopic[idx];
            if (topicQuestions.length > 0) {
                const randomIndex = Math.floor(Math.random() * topicQuestions.length);
                selectedQuestions.push(topicQuestions[randomIndex]);
            }
        });
    }

    if (selectedQuestions.length === 0) return { questions: [], answers: [] };

    selectedQuestions.forEach((q, idx) => {
        const qId = `q_${idx}_${Math.random()}`;
        questions.push({
            qId: qId,
            text: q.question,
        });

        const correctAnswer = {
            aId: `a_${idx}_correct_${Math.random()}`,
            text: q.options[q.correct],
            questionId: qId,
            isCorrect: true,
        };
        answers.push(correctAnswer);

        const incorrectOptions = q.options.filter((_, optIdx) => optIdx !== q.correct);
        const numIncorrect = Math.random() < 0.5 ? 1 : 2;
        const shuffledIncorrect = [...incorrectOptions].sort(() => Math.random() - 0.5);
        const selectedIncorrect = shuffledIncorrect.slice(0, numIncorrect);

        selectedIncorrect.forEach((opt, i) => {
            answers.push({
                aId: `a_${idx}_incorrect_${i}_${Math.random()}`,
                text: opt,
                questionId: qId,
                isCorrect: false,
            });
        });
    });

    const shuffledAnswers = [...answers].sort(() => Math.random() - 0.5);
    return { questions, answers: shuffledAnswers };
}

function renderMatchQuiz(questions, answers) {
    const leftCol = document.getElementById("matchQuestions");
    const rightCol = document.getElementById("matchAnswers");
    leftCol.innerHTML = '';
    rightCol.innerHTML = '';

    questions.forEach((q) => {
        const block = document.createElement("div");
        block.className = "match-block";
        block.dataset.id = q.qId;
        block.dataset.type = "question";
        block.textContent = q.text;
        block.addEventListener('click', onMatchBlockClick);
        leftCol.appendChild(block);
    });

    answers.forEach((a) => {
        const block = document.createElement("div");
        block.className = "match-block";
        block.dataset.id = a.aId;
        block.dataset.type = "answer";
        block.textContent = a.text;
        block.addEventListener('click', onMatchBlockClick);
        rightCol.appendChild(block);
    });

    setTimeout(drawMatchLines, 50);
    window.addEventListener('resize', drawMatchLines);
}

function onMatchBlockClick(e) {
    const block = e.currentTarget;
    if (block.classList.contains('matched')) return;

    const type = block.dataset.type;
    const id = block.dataset.id;

    if (matchState.selected === null) {
        clearSelected();
        block.classList.add('selected');
        matchState.selected = { type, id, element: block };
        return;
    }

    const selected = matchState.selected;

    if (selected.id === id) {
        clearSelected();
        matchState.selected = null;
        return;
    }

    if (selected.type !== type) {
        const questionBlock = selected.type === 'question' ? selected.element : block;
        const answerBlock = selected.type === 'answer' ? selected.element : block;
        const questionId = questionBlock.dataset.id;
        const answerId = answerBlock.dataset.id;

        const answer = matchAnswers.find(a => a.aId === answerId);
        if (answer && answer.questionId === questionId && answer.isCorrect) {
            matchState.pairs.push({ qId: questionId, aId: answerId });
            questionBlock.classList.add('matched');
            answerBlock.classList.add('matched');
            clearSelected();
            matchState.selected = null;
            drawMatchLines();
        } else {
            drawTempLine(questionBlock, answerBlock, 'red');
            clearSelected();
            matchState.selected = null;
        }
    } else {
        clearSelected();
        block.classList.add('selected');
        matchState.selected = { type, id, element: block };
    }
}

function clearSelected() {
    document.querySelectorAll('.match-block.selected').forEach(b => b.classList.remove('selected'));
}

function drawMatchLines() {
    const canvas = document.getElementById('matchCanvas');
    const ctx = canvas.getContext('2d');
    const container = document.querySelector('.match-container');
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    matchState.pairs.forEach(pair => {
        const qBlock = document.querySelector(`.match-block[data-id="${pair.qId}"]`);
        const aBlock = document.querySelector(`.match-block[data-id="${pair.aId}"]`);
        if (qBlock && aBlock) {
            drawLineBetween(qBlock, aBlock, ctx, '#28a745', 3);
        }
    });
}

function drawTempLine(blockA, blockB, color) {
    const canvas = document.getElementById('matchCanvas');
    const ctx = canvas.getContext('2d');
    const container = document.querySelector('.match-container');
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    drawLineBetween(blockA, blockB, ctx, color, 3);

    setTimeout(() => {
        drawMatchLines();
    }, 1000);
}

function drawLineBetween(el1, el2, ctx, color, width) {
    const rect1 = el1.getBoundingClientRect();
    const rect2 = el2.getBoundingClientRect();
    const containerRect = document.querySelector('.match-container').getBoundingClientRect();

    const x1 = rect1.right - containerRect.left - 5;
    const y1 = rect1.top + rect1.height/2 - containerRect.top;
    const x2 = rect2.left - containerRect.left + 5;
    const y2 = rect2.top + rect2.height/2 - containerRect.top;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
}

// Очистка данных блочного режима
function clearMatchData() {
    document.getElementById('matchQuestions').innerHTML = '';
    document.getElementById('matchAnswers').innerHTML = '';
    matchQuestions = [];
    matchAnswers = [];
    matchState = { selected: null, pairs: [] };
    const canvas = document.getElementById('matchCanvas');
    if (canvas) {
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    }
}

// Сброс теста (общий для обоих режимов)
document.getElementById("quizResetBtn").addEventListener("click", function() {
    if (currentMode === 'radio') {
        document.getElementById("quizContainer").innerHTML = "";
        currentQuestions = [];
    } else {
        clearMatchData();
    }
    document.getElementById("quizControls").style.display = "none";
    
    document.getElementById('quizSettingsPanel').classList.remove('hidden');
    document.getElementById('quizTestArea').classList.add('hidden');
});