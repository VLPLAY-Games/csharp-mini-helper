// data.js
let topics = [];
let currentTopic = null;
let isMenuAnimating = false;
let currentMenuIsTopic = false;
let quizData = [];
let glossary = [];
let graphPhysicsEnabled = true;
let graphNetwork = null;

// Загрузка данных
Promise.all([
    fetch("db/topics.json").then(r => r.json()),
    fetch("db/quiz.json").then(r => r.json()),
    fetch("db/glossary.json").then(r => r.json())
]).then(([topicsData, quizDataRaw, glossaryData]) => {
    topics = topicsData.topics;
    quizData = quizDataRaw.questions;
    glossary = glossaryData;
    // Уведомляем остальные модули о загрузке данных
    if (window.onDataLoaded) window.onDataLoaded();
}).catch(err => console.error('Ошибка загрузки данных:', err));