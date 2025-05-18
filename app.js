


function numberToThaiNumeral(n) {
  const thaiDigits = ['๐','๑','๒','๓','๔','๕','๖','๗','๘','๙'];
  return n.toString().split('').map(d => thaiDigits[parseInt(d)]).join('');
}
function numberToEnglish(n) {
  const ones = ["Zero","One","Two","Three","Four","Five","Six","Seven","Eight","Nine"];
  const teens = ["Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const tensNames = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  if (n < 10) return ones[n];
  if (n < 20) return teens[n - 10];
  if (n < 100) {
    const ten = Math.floor(n / 10);
    const unit = n % 10;
    return tensNames[ten] + (unit ? "-" + ones[unit] : "");
  }
  if (n === 100) return "One Hundred";
  return n.toString();
}

function numberToThai(n) {
  const units = ["ศูนย์","หนึ่ง","สอง","สาม","สี่","ห้า","หก","เจ็ด","แปด","เก้า"];
  if (n < 10) return units[n];
  if (n < 20) {
    if (n === 10) return "สิบ";
    return "สิบ" + (n % 10 === 1 ? "เอ็ด" : units[n % 10]);
  }
  if (n < 100) {
    const tens = Math.floor(n / 10);
    const unit = n % 10;
    const tensWord = (tens === 2 ? "ยี่" : units[tens]) + "สิบ";
    return tensWord + (unit > 0 ? (unit === 1 ? "เอ็ด" : units[unit]) : "");
  }
  if (n === 100) return "หนึ่งร้อย";
  return n.toString();
}

const correctSound = new Audio('https://cdn.pixabay.com/download/audio/2022/03/15/audio_1b0a31c6d7.mp3');
const wrongSound = new Audio('https://cdn.pixabay.com/download/audio/2022/03/15/audio_d5be23e57a.mp3');
let isMuted = false;

const timeupSound = new Audio('https://cdn.pixabay.com/download/audio/2022/03/15/audio_fcccbced5f.mp3');

let timer;
const TIME_LIMIT = 15;  // เวลาใหม่ต่อข้อ 15 วินาที
let correctAnswer = null;
let score = 0;
let questionCount = 0;

function generateQuestion() {
    clearInterval(timer);
  const resultDiv = document.getElementById('result');
  resultDiv.textContent = '';
  resultDiv.className = '';
  showCharacterMood('neutral');
  document.getElementById('timer').textContent = `${TIME_LIMIT}`;
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
    const rnd = Math.random();
    let displayText;
    if (rnd < 0.25) {
      displayText = choice.toString();
    } else if (rnd < 0.5) {
      displayText = numberToThai(choice);
    } else if (rnd < 0.75) {
      displayText = numberToEnglish(choice);
    } else {
      displayText = numberToThaiNumeral(choice);
    }
    btn.textContent = displayText;
    btn.onclick = () => {
      clearInterval(timer);
      disableChoiceButtons();
      const isCorrect = choice === correctAnswer;
      if (isCorrect) correctSound.play(); else wrongSound.play();
      if (isCorrect) playSound(correctSound); else playSound(wrongSound);
      showCharacterMood(isCorrect ? 'correct' : 'wrong');
      const resultDiv = document.getElementById('result');
      resultDiv.className = isCorrect ? 'correct' : 'wrong';
      resultDiv.textContent = isCorrect
        ? 'ถูกต้อง!'
        : `ผิด! คำตอบคือ ${correctAnswer}`;
      updateScore(isCorrect ? 1 : -1);
      updateQuestionCount();
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
    document.getElementById('timer').textContent = `${timeLeft}`;
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
      updateQuestionCount();
      document.getElementById('next').style.display = 'inline-block';
    }
  }, 1000);
}

function updateScore(delta) {
  score += delta;
  document.getElementById('score').textContent = `คะแนน: ${score}`;
  const scoreBox = document.getElementById('score');
  if (score < 0) {
    scoreBox.style.backgroundColor = '#ffcdd2';
    scoreBox.style.color = '#c62828';
  } else {
    scoreBox.style.backgroundColor = '#dcedc8';
    scoreBox.style.color = '#1b5e20';
  }
  const stars = Math.floor(score / 10);
  document.getElementById('stars').textContent = '⭐'.repeat(Math.max(0, stars));
}

function nextQuestion() {
    
function updateQuestionCount() {
  questionCount++;
  document.getElementById('question-count').textContent = `ข้อที่ทำ: ${questionCount}`;
}

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

  
function updateQuestionCount() {
  questionCount++;
  document.getElementById('question-count').textContent = `ข้อที่ทำ: ${questionCount}`;
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