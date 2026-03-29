const questions = [
  {
    question: "Which CSS property is used to create a flex container?",
    answers: [
      { text: "display: grid", correct: false },
      { text: "display: block", correct: false },
      { text: "display: flex", correct: true },
      { text: "display: table", correct: false },
    ],
  },
  {
    question: "What does HTML stand for?",
    answers: [
      { text: "Hyper Text Markup Language", correct: true },
      { text: "Home Tool Markup Language", correct: false },
      { text: "Hyperlinks and Text Markup Language", correct: false },
      { text: "Hyper Text Modern Language", correct: false },
    ],
  },
  {
    question: "Which company originally developed JavaScript?",
    answers: [
      { text: "Microsoft", correct: false },
      { text: "Netscape", correct: true },
      { text: "Google", correct: false },
      { text: "IBM", correct: false },
    ],
  },
  {
    question: "Which CSS unit is relative to the root element font size?",
    answers: [
      { text: "em", correct: false },
      { text: "px", correct: false },
      { text: "rem", correct: true },
      { text: "vh", correct: false },
    ],
  },
  {
    question: "What is the correct way to declare a variable in modern JavaScript?",
    answers: [
      { text: "var x = 5", correct: false },
      { text: "const x = 5", correct: true },
      { text: "int x = 5", correct: false },
      { text: "declare x = 5", correct: false },
    ],
  },
];

let currentQuestionIndex = 0;
let score = 0;

const questionEl = document.getElementById("question-text");
const answerButtonsEl = document.getElementById("answer-buttons");
const progressEl = document.getElementById("quiz-progress");
const scoreEl = document.getElementById("quiz-score");
const qNumEl = document.getElementById("question-number");
const resultScreen = document.getElementById("result-screen");
const quizBody = document.querySelector(".quiz-body");
const finalScoreText = document.getElementById("final-score-text");
const restartBtn = document.getElementById("restart-btn");

function startQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  resultScreen.style.display = "none";
  quizBody.style.display = "block";
  updateScore();
  showQuestion(questions[currentQuestionIndex]);
}

function showQuestion(question) {
  questionEl.innerText = question.question;
  answerButtonsEl.innerHTML = "";

  qNumEl.innerText = `Question ${currentQuestionIndex + 1}/${questions.length}`;
  progressEl.style.width = `${(currentQuestionIndex / questions.length) * 100}%`;

  question.answers.forEach((answer) => {
    const button = document.createElement("button");
    button.innerText = answer.text;
    button.classList.add("quiz-btn");
    if (answer.correct) button.dataset.correct = "true";
    button.addEventListener("click", selectAnswer);
    answerButtonsEl.appendChild(button);
  });
}

function selectAnswer(e) {
  const selectedBtn = e.target;
  const isCorrect = selectedBtn.dataset.correct === "true";

  if (isCorrect) {
    selectedBtn.classList.add("correct");
    score++;
  } else {
    selectedBtn.classList.add("incorrect");
    Array.from(answerButtonsEl.children).forEach((btn) => {
      if (btn.dataset.correct === "true") btn.classList.add("correct");
    });
  }

  Array.from(answerButtonsEl.children).forEach((btn) => (btn.disabled = true));
  updateScore();

  setTimeout(() => {
    currentQuestionIndex++;
    if (questions.length > currentQuestionIndex) {
      showQuestion(questions[currentQuestionIndex]);
    } else {
      showResults();
    }
  }, 1400);
}

function updateScore() {
  scoreEl.innerText = `Score: ${score}`;
}

function showResults() {
  quizBody.style.display = "none";
  resultScreen.style.display = "block";
  progressEl.style.width = "100%";

  const pct = Math.round((score / questions.length) * 100);
  let emoji = pct === 100 ? "🏆" : pct >= 60 ? "🎯" : "📚";

  // Inject score circle if it doesn't exist
  let scoreCircle = resultScreen.querySelector(".score-display");
  if (!scoreCircle) {
    scoreCircle = document.createElement("div");
    scoreCircle.className = "score-display";
    resultScreen.insertBefore(scoreCircle, resultScreen.querySelector("p"));
  }
  scoreCircle.textContent = `${score}/${questions.length}`;

  if (finalScoreText) {
    finalScoreText.innerText = `${emoji} You scored ${pct}% — ${score} out of ${questions.length} correct!`;
  }
}

restartBtn.addEventListener("click", startQuiz);
startQuiz();
