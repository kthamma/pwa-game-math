const correctSound = new Audio('https://cdn.pixabay.com/download/audio/2022/03/15/audio_1b0a31c6d7.mp3');
const wrongSound = new Audio('https://cdn.pixabay.com/download/audio/2022/03/15/audio_d5be23e57a.mp3');
let isMuted = false;

const timeupSound = new Audio('https://cdn.pixabay.com/download/audio/2022/03/15/audio_fcccbced5f.mp3');

let timer;
const TIME_LIMIT = 10;
let correctAnswer = null;
let score = 0;

function generateQuestion() {
  clearInterval(timer);
  const resultDiv = document.getElementById('result');
  resultDiv.textContent = '';
  resultDiv.className = '';
  showCharacterMood('neutral');
  document.getElementById('timer').textContent = `เวลาที่เหลือ: ${TIME_LIMIT} วินาที`;
  document.getElementById('next').style.display = 'none';
  enableChoiceButtons();

  const ops = ['+', '-', '×', '÷'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a, b;

  if (op === '+') {
    a = Math.floor(Math.random() * 20) + 1;
    b = Math.floor(Math.random() * 20) + 1;
    correctAnswer = a + b;
  } else if (op === '-') {
    a = Math.floor(Math.random() * 20) + 10;
    b = Math.floor(Math.random() * 10) + 1;
    correctAnswer = a - b;
  } else if (op === '×') {
    a = Math.floor(Math.random() * 10) + 1;
    b = Math.floor(Math.random() * 10) + 1;
    correctAnswer = a * b;
  } else {
    b = Math.floor(Math.random() * 9) + 1;
    correctAnswer = Math.floor(Math.random() * 10) + 1;
    a = correctAnswer * b;
  }

  let displayQuestion;
  const isMissing = Math.random() < 0.4;
  if (isMissing) {
    if (Math.random() < 0.5) {
      displayQuestion = `? ${op} ${b} = ${correctAnswer}`;
      correctAnswer = a;
    } else {
      displayQuestion = `${a} ${op} ? = ${correctAnswer}`;
      correctAnswer = b;
    }
  } else {
    displayQuestion = `${a} ${op} ${b} = ?`;
  }

  document.getElementById('question').textContent = displayQuestion;

  const choices = [correctAnswer];
  while (choices.length < 6) {
    let wrong = correctAnswer + Math.floor(Math.random() * 21) - 10;
    if (!choices.includes(wrong) && wrong >= 0) choices.push(wrong);
  }

  shuffle(choices);
  const choicesDiv = document.getElementById('choices');
  choicesDiv.innerHTML = '';
  choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.textContent = choice;
    btn.onclick = () => {
      clearInterval(timer);
      disableChoiceButtons();
      const isCorrect = choice === correctAnswer;
      if (isCorrect) playSound(correctSound); else playSound(wrongSound);
      showCharacterMood(isCorrect ? 'correct' : 'wrong');
      const resultDiv = document.getElementById('result');
      resultDiv.className = isCorrect ? 'correct' : 'wrong';
      resultDiv.textContent = isCorrect
        ? 'ถูกต้อง!'
        : `ผิด! คำตอบคือ ${correctAnswer}`;
      updateScore(isCorrect ? 1 : -1);
      document.getElementById('next').style.display = 'inline-block';
    };
    choicesDiv.appendChild(btn);
  });

  startTimer();
}

function startTimer() {
  let timeLeft = TIME_LIMIT;
  const bar = document.getElementById('progress-bar');
  bar.style.width = '100%';
  timer = setInterval(() => {
    timeLeft--;
    document.getElementById('timer').textContent = `เวลาที่เหลือ: ${timeLeft} วินาที`;
    bar.style.width = ((timeLeft / TIME_LIMIT) * 100) + '%';
    if (timeLeft <= 0) {
      clearInterval(timer);
      disableChoiceButtons();
      playSound(timeupSound);
      showCharacterMood('wrong');
      const resultDiv = document.getElementById('result');
      resultDiv.className = 'timeout';
      resultDiv.textContent = `หมดเวลา! คำตอบคือ ${correctAnswer}`;
      updateScore(-1);
      document.getElementById('next').style.display = 'inline-block';
    }
  }, 1000);
}

function updateScore(delta) {
  score += delta;
  document.getElementById('score').textContent = `คะแนน: ${score}`;
  const stars = Math.floor(score / 10);
  document.getElementById('stars').textContent = '⭐'.repeat(Math.max(0, stars));
}

function nextQuestion() {
  generateQuestion();
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function disableChoiceButtons() {
  const buttons = document.querySelectorAll('#choices button');
  buttons.forEach(btn => btn.disabled = true);
}

function enableChoiceButtons() {
  const buttons = document.querySelectorAll('#choices button');
  buttons.forEach(btn => btn.disabled = false);
}

generateQuestion();


function showCharacterMood(state) {
  const img = document.getElementById('character-img');
  if (state === 'correct') {
    img.src = 'images/happy.png';
  } else if (state === 'wrong') {
    img.src = 'images/sad.png';
  } else {
    img.src = 'images/neutral.png';
  }
}


function toggleMute() {
  isMuted = !isMuted;
  document.getElementById('mute-toggle').textContent = isMuted ? '🔇 ปิดเสียง' : '🔊 เปิดเสียง';
}

function playSound(audio) {
  if (!isMuted) {
    audio.play();
  }
}
