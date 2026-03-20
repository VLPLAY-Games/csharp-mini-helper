// quiz.js
let currentMode = 'radio';   // 'radio', 'checkbox' или 'match'
let currentQuestions = [];   // текущие вопросы (для radio/checkbox)
let matchQuestions = [];     // данные для блочного режима: массив вопросов { qId, text }
let matchAnswers = [];       // данные для блочного режима: массив ответов { aId, text, questionId, isCorrect }
let matchState = {
    selected: null,          // { type: 'question', id } или { type: 'answer', id } или null
    pairs: [],               // [{ qId, aId }] успешные пары
};

// Переключение режима
document.querySelectorAll('input[name="quizMode"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        currentMode = e.target.value;
        document.getElementById('quizContainer').classList.toggle('hidden', currentMode !== 'radio' && currentMode !== 'checkbox');
        document.getElementById('matchContainer').classList.toggle('hidden', currentMode !== 'match');
        document.getElementById('quizCheckBtn').style.display = (currentMode === 'radio' || currentMode === 'checkbox') ? 'inline-block' : 'none';
        document.getElementById('quizResult').classList.add('hidden');
    });
});

// Кнопка сворачивания/разворачивания настроек теста
document.getElementById('toggleQuizSettingsBtn').addEventListener('click', function() {
    const settingsPanel = document.getElementById('quizSettingsPanel');
    const testArea = document.getElementById('quizTestArea');
    
    settingsPanel.classList.toggle('hidden');
    testArea.classList.toggle('hidden');
    document.getElementById('quizResult').classList.add('hidden');
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
    document.getElementById('quizResult').classList.add('hidden');

    if (currentMode === 'radio') {
        startRadioQuiz(selectedIndices);
    } else if (currentMode === 'checkbox') {
        startCheckboxQuiz(selectedIndices);
    } else {
        startMatchQuiz(selectedIndices);
    }
});

// ------------------ Режим с одним вариантом (radio) ------------------
function startRadioQuiz(selectedIndices) {
    document.getElementById('quizCheckBtn').style.display = 'inline-block';
    clearMatchData();

    // Фильтруем вопросы: только с одним правильным ответом и из выбранных тем
    let questionsByTopic = {};
    selectedIndices.forEach(idx => {
        questionsByTopic[idx] = quizData.filter(q => q.topicIndex === idx && q.correct.length === 1);
    });

    // Проверяем, есть ли хоть какие-то вопросы
    if (Object.values(questionsByTopic).every(arr => arr.length === 0)) {
        alert("В выбранных темах нет вопросов с одним правильным ответом.");
        return;
    }

    let selectedQuestions = [];

    if (selectedIndices.length === 1) {
        // Одна тема – берём 2 вопроса (или меньше, если их меньше 2)
        const topicIdx = selectedIndices[0];
        const topicQuestions = questionsByTopic[topicIdx];
        const shuffled = shuffleArray([...topicQuestions]);
        selectedQuestions = shuffled.slice(0, Math.min(2, shuffled.length));
    } else {
        // Несколько тем – из каждой по 2 вопроса
        selectedIndices.forEach(idx => {
            const topicQuestions = questionsByTopic[idx];
            if (topicQuestions.length > 0) {
                const shuffled = shuffleArray([...topicQuestions]);
                const taken = shuffled.slice(0, Math.min(2, shuffled.length));
                selectedQuestions.push(...taken);
            }
        });
    }

    if (selectedQuestions.length === 0) {
        alert("Не удалось сформировать вопросы для выбранных тем.");
        return;
    }

    renderQuiz(selectedQuestions, 'radio');
    document.getElementById("quizControls").style.display = "flex";
    document.getElementById('quizContainer').classList.remove('hidden');
    document.getElementById('matchContainer').classList.add('hidden');
}

// ------------------ Режим с несколькими вариантами (checkbox) ------------------
function startCheckboxQuiz(selectedIndices) {
    document.getElementById('quizCheckBtn').style.display = 'inline-block';
    clearMatchData();

    // Фильтруем вопросы: только с несколькими правильными ответами и из выбранных тем
    let questionsByTopic = {};
    selectedIndices.forEach(idx => {
        questionsByTopic[idx] = quizData.filter(q => q.topicIndex === idx && q.correct.length > 1);
    });

    // Проверяем, есть ли хоть какие-то вопросы
    if (Object.values(questionsByTopic).every(arr => arr.length === 0)) {
        alert("В выбранных темах нет вопросов с несколькими правильными ответами.");
        return;
    }

    let selectedQuestions = [];

    if (selectedIndices.length === 1) {
        // Одна тема – берём 2 вопроса (или меньше, если их меньше 2)
        const topicIdx = selectedIndices[0];
        const topicQuestions = questionsByTopic[topicIdx];
        const shuffled = shuffleArray([...topicQuestions]);
        selectedQuestions = shuffled.slice(0, Math.min(2, shuffled.length));
    } else {
        // Несколько тем – из каждой по 2 вопроса
        selectedIndices.forEach(idx => {
            const topicQuestions = questionsByTopic[idx];
            if (topicQuestions.length > 0) {
                const shuffled = shuffleArray([...topicQuestions]);
                const taken = shuffled.slice(0, Math.min(2, shuffled.length));
                selectedQuestions.push(...taken);
            }
        });
    }

    if (selectedQuestions.length === 0) {
        alert("Не удалось сформировать вопросы для выбранных тем.");
        return;
    }

    renderQuiz(selectedQuestions, 'checkbox');
    document.getElementById("quizControls").style.display = "flex";
    document.getElementById('quizContainer').classList.remove('hidden');
    document.getElementById('matchContainer').classList.add('hidden');
}

// Перемешивание массива (алгоритм Фишера-Йетса)
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Рендеринг вопросов (radio или checkbox) с перемешиванием вариантов ответов
function renderQuiz(questions, type) {
    const container = document.getElementById("quizContainer");
    container.innerHTML = "";
    currentQuestions = [];

    questions.forEach((q, idx) => {
        // Сохраняем вопрос с его исходными данными
        currentQuestions.push(q);

        // Перемешиваем варианты ответов
        const shuffledOptions = shuffleArray([...q.options]);
        // Создаём маппинг: индекс в перемешанном массиве -> исходный индекс
        const mapping = shuffledOptions.map(opt => q.options.indexOf(opt));

        const questionDiv = document.createElement("div");
        questionDiv.className = "quiz-question";
        questionDiv.dataset.questionIndex = idx;
        // Сохраняем маппинг в dataset для проверки
        questionDiv.dataset.mapping = JSON.stringify(mapping);

        const questionText = document.createElement("div");
        questionText.className = "quiz-question-text";
        questionText.textContent = q.question;
        questionDiv.appendChild(questionText);

        const optionsDiv = document.createElement("div");
        optionsDiv.className = "quiz-options";

        shuffledOptions.forEach((opt, optIdx) => {
            const optionLabel = document.createElement("label");
            optionLabel.className = "quiz-option";

            const input = document.createElement("input");
            input.type = type;
            input.name = `q_${idx}`;
            input.value = optIdx; // значение — индекс в перемешанном массиве

            const codeSpan = document.createElement("code");
            codeSpan.textContent = opt;

            optionLabel.appendChild(input);
            optionLabel.appendChild(codeSpan);
            optionsDiv.appendChild(optionLabel);
        });

        questionDiv.appendChild(optionsDiv);
        container.appendChild(questionDiv);
    });
}

// Проверка ответов (общая для radio и checkbox)
document.getElementById("quizCheckBtn").addEventListener("click", function() {
    if (currentMode === 'radio') {
        checkQuiz('radio');
    } else if (currentMode === 'checkbox') {
        checkQuiz('checkbox');
    }
});

function checkQuiz(type) {
    if (!currentQuestions || currentQuestions.length === 0) return;

    const questionsDivs = document.querySelectorAll("#quizContainer .quiz-question");
    let correctCount = 0;

    questionsDivs.forEach((qDiv, idx) => {
        const currentQ = currentQuestions[idx];
        const correctIndices = currentQ.correct; // массив исходных правильных индексов
        const mapping = JSON.parse(qDiv.dataset.mapping); // mapping[shuffledIndex] = originalIndex

        if (type === 'radio') {
            const selectedRadio = qDiv.querySelector('input[type="radio"]:checked');
            if (selectedRadio) {
                const selectedShuffledIdx = parseInt(selectedRadio.value, 10);
                const selectedOriginalIdx = mapping[selectedShuffledIdx];
                highlightRadioQuestion(qDiv, selectedShuffledIdx, correctIndices[0], mapping);
                if (selectedOriginalIdx === correctIndices[0]) {
                    correctCount++;
                }
            } else {
                highlightRadioQuestion(qDiv, undefined, correctIndices[0], mapping);
            }
        } else { // checkbox
            const selectedCheckboxes = Array.from(qDiv.querySelectorAll('input[type="checkbox"]:checked')).map(cb => parseInt(cb.value, 10));
            const selectedOriginalIndices = selectedCheckboxes.map(shuffledIdx => mapping[shuffledIdx]);
            highlightCheckboxQuestion(qDiv, selectedCheckboxes, correctIndices, mapping);
            const isCorrect = selectedOriginalIndices.length === correctIndices.length &&
                              selectedOriginalIndices.every(v => correctIndices.includes(v));
            if (isCorrect) correctCount++;
        }
    });

    const resultDiv = document.getElementById('quizResult');
    resultDiv.innerHTML = `<span class="correct-count">${correctCount}</span> из <span class="total-count">${questionsDivs.length}</span> правильных ответов.`;
    resultDiv.classList.remove('hidden');
}

// Подсветка для radio (с учётом перемешанных индексов)
function highlightRadioQuestion(questionDiv, selectedShuffledIdx, correctOriginalIdx, mapping) {
    const options = questionDiv.querySelectorAll('.quiz-option');
    options.forEach(opt => opt.classList.remove('correct-option', 'incorrect-option'));

    // Находим правильный перемешанный индекс
    let correctShuffledIdx = mapping.findIndex(orig => orig === correctOriginalIdx);

    if (selectedShuffledIdx !== undefined) {
        const selectedOption = options[selectedShuffledIdx];
        if (selectedShuffledIdx === correctShuffledIdx) {
            selectedOption.classList.add('correct-option');
        } else {
            selectedOption.classList.add('incorrect-option');
            options[correctShuffledIdx].classList.add('correct-option');
        }
    } else {
        options[correctShuffledIdx].classList.add('correct-option');
    }
}

// Подсветка для checkbox (с учётом перемешанных индексов)
function highlightCheckboxQuestion(questionDiv, selectedShuffledIndices, correctOriginalIndices, mapping) {
    const options = questionDiv.querySelectorAll('.quiz-option');
    // Находим перемешанные индексы правильных ответов
    const correctShuffledIndices = correctOriginalIndices.map(origIdx => mapping.findIndex(m => m === origIdx));

    options.forEach((opt, idx) => {
        opt.classList.remove('correct-option', 'incorrect-option');
        if (correctShuffledIndices.includes(idx)) {
            opt.classList.add('correct-option');
        } else if (selectedShuffledIndices.includes(idx)) {
            opt.classList.add('incorrect-option');
        }
    });
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
    document.getElementById('quizResult').classList.add('hidden');
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
            const shuffled = shuffleArray([...topicQuestions]);
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

        // Берём первый правильный ответ для сопоставления
        const correctAnswerIndex = q.correct[0];
        const correctAnswerText = q.options[correctAnswerIndex];
        const correctAnswer = {
            aId: `a_${idx}_correct_${Math.random()}`,
            text: correctAnswerText,
            questionId: qId,
            isCorrect: true,
        };
        answers.push(correctAnswer);

        const incorrectOptions = q.options.filter((_, optIdx) => !q.correct.includes(optIdx));
        const numIncorrect = Math.random() < 0.5 ? 1 : 2;
        const shuffledIncorrect = shuffleArray([...incorrectOptions]);
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

    const shuffledAnswers = shuffleArray([...answers]);
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
    if (currentMode === 'radio' || currentMode === 'checkbox') {
        document.getElementById("quizContainer").innerHTML = "";
        currentQuestions = [];
    } else {
        clearMatchData();
    }
    document.getElementById("quizControls").style.display = "none";
    
    document.getElementById('quizSettingsPanel').classList.remove('hidden');
    document.getElementById('quizTestArea').classList.add('hidden');
    document.getElementById('quizResult').classList.add('hidden');
});