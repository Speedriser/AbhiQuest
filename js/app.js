/* =============================================
   RADT Quest - Main Application Logic
   Multi-user, website-design version
   ============================================= */

// ─── SHOP CATALOG ─────────────────────────────
const SHOP_CATALOG = {
  avatars: [
    { id:'av_dog',    icon:'🐶', name:'Doggo',      price:0,    type:'avatar' },
    { id:'av_cat',    icon:'🐱', name:'Kitty',      price:100,  type:'avatar' },
    { id:'av_bear',   icon:'🐻', name:'Bear',       price:100,  type:'avatar' },
    { id:'av_fox',    icon:'🦊', name:'Fox',        price:150,  type:'avatar' },
    { id:'av_frog',   icon:'🐸', name:'Froggy',     price:150,  type:'avatar' },
    { id:'av_lion',   icon:'🦁', name:'Lion',       price:200,  type:'avatar' },
    { id:'av_koala',  icon:'🐨', name:'Koala',      price:200,  type:'avatar' },
    { id:'av_panda',  icon:'🐼', name:'Panda',      price:250,  type:'avatar' },
    { id:'av_eagle',  icon:'🦅', name:'Eagle',      price:300,  type:'avatar' },
    { id:'av_dragon', icon:'🐉', name:'Dragon',     price:500,  type:'avatar' },
    { id:'av_robot',  icon:'🤖', name:'Robot',      price:400,  type:'avatar' },
    { id:'av_alien',  icon:'👽', name:'Alien',      price:450,  type:'avatar' },
  ],
  themes: [
    { id:'th_default', icon:'🌈', name:'Classic',   price:0,    type:'theme', class:'' },
    { id:'th_ocean',   icon:'🌊', name:'Ocean',     price:200,  type:'theme', class:'theme-ocean' },
    { id:'th_forest',  icon:'🌲', name:'Forest',    price:250,  type:'theme', class:'theme-forest' },
    { id:'th_sunset',  icon:'🌅', name:'Sunset',    price:300,  type:'theme', class:'theme-sunset' },
    { id:'th_space',   icon:'🚀', name:'Space',     price:400,  type:'theme', class:'theme-space' },
    { id:'th_candy',   icon:'🍭', name:'Candy',     price:350,  type:'theme', class:'theme-candy' },
  ],
  powerups: [
    { id:'pu_2x',     icon:'⚡', name:'Double XP',  price:150,  type:'powerup', desc:'Double points on your next quiz!' },
    { id:'pu_hint',   icon:'💡', name:'Hint Pass',  price:100,  type:'powerup', desc:'Reveal one wrong answer per quiz' },
    { id:'pu_skip',   icon:'⏭️', name:'Skip Card',  price:120,  type:'powerup', desc:'Skip 2 hard questions' },
    { id:'pu_shield', icon:'🛡️', name:'Time Shield',price:180,  type:'powerup', desc:'No timer pressure for one quiz' },
    { id:'pu_streak', icon:'🔥', name:'Streak Saver',price:200, type:'powerup', desc:'Protects your streak if you lose' },
  ]
};

// ─── ACHIEVEMENT DEFINITIONS ──────────────────
const ACHIEVEMENTS = [
  { id:'first_quiz',   icon:'🎉', name:'First Quest',    desc:'Complete your first quiz',          check: u => u.quizzesCompleted >= 1 },
  { id:'five_quizzes', icon:'📚', name:'Bookworm',       desc:'Complete 5 quizzes',                check: u => u.quizzesCompleted >= 5 },
  { id:'ten_quizzes',  icon:'🎓', name:'Scholar',        desc:'Complete 10 quizzes',               check: u => u.quizzesCompleted >= 10 },
  { id:'perfect',      icon:'💯', name:'Perfect Score',  desc:'Get 100% on any quiz',              check: u => (u.bestScore || 0) >= 100 },
  { id:'streak3',      icon:'🔥', name:'On Fire!',       desc:'Get 3 questions right in a row',    check: u => (u.maxStreak || 0) >= 3 },
  { id:'streak5',      icon:'💥', name:'Unstoppable',    desc:'Get 5 questions right in a row',    check: u => (u.maxStreak || 0) >= 5 },
  { id:'coins100',     icon:'🪙', name:'Coin Collector', desc:'Earn 100 coins total',              check: u => (u.totalCoinsEarned || 0) >= 100 },
  { id:'coins500',     icon:'💰', name:'Treasure Hunter',desc:'Earn 500 coins total',              check: u => (u.totalCoinsEarned || 0) >= 500 },
  { id:'math_master',  icon:'🧮', name:'Maths Master',   desc:'Complete 5 maths quizzes',          check: u => (u.mathQuizzes || 0) >= 5 },
  { id:'eng_master',   icon:'📖', name:'Word Wizard',    desc:'Complete 5 English quizzes',        check: u => (u.englishQuizzes || 0) >= 5 },
  { id:'speed_demon',  icon:'⚡', name:'Speed Demon',    desc:'Answer 10 questions under 5s each', check: u => (u.fastAnswers || 0) >= 10 },
  { id:'social',       icon:'👥', name:'Team Player',    desc:'Use the friend challenge feature',  check: u => u.usedChallenge === true },
];

// No demo users — leaderboard shows only real registered players

// ─── STATE ─────────────────────────────────────
let currentUser  = null;
let quizState    = null;
let timerInterval = null;
let currentSubject = 'math';
let currentTopic   = null;
let currentDiff    = null;
let currentScreen  = 'landing';
let challengeQuestions = null;

// ─── STORAGE HELPERS ───────────────────────────
const USERS_KEY   = 'radtquest_users';
const SESSION_KEY = 'radtquest_session';

function getAllUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
}
function saveAllUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
function getUser(email) {
  return getAllUsers()[email.toLowerCase()] || null;
}
function saveUser(user) {
  const all = getAllUsers();
  all[user.email.toLowerCase()] = user;
  saveAllUsers(all);
}
function saveSession(email) {
  localStorage.setItem(SESSION_KEY, email.toLowerCase());
}
function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
function getSavedSession() {
  return localStorage.getItem(SESSION_KEY);
}

function createNewUser(name, email, password) {
  return {
    name, email: email.toLowerCase(), password,
    avatar: 'av_dog',
    theme: 'th_default',
    coins: 50,
    points: 0,
    quizzesCompleted: 0,
    mathQuizzes: 0,
    englishQuizzes: 0,
    bestScore: 0,
    totalScore: 0,
    streak: 0,
    lastActiveDate: null,
    maxStreak: 0,
    totalCoinsEarned: 50,
    fastAnswers: 0,
    usedChallenge: false,
    ownedItems: ['av_dog', 'th_default'],
    quizHistory: [],
    createdAt: Date.now()
  };
}

// ─── SCREEN MANAGEMENT ─────────────────────────
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('screen-' + name);
  if (el) {
    el.classList.add('active');
    currentScreen = name;
    window.scrollTo(0, 0);
  }

  const loggedIn = !!currentUser;
  const hdr = document.getElementById('site-header');
  if (hdr) {
    if (loggedIn && name !== 'landing' && name !== 'auth') {
      hdr.classList.remove('hidden');
    } else {
      hdr.classList.add('hidden');
    }
  }

  if (name === 'home')        refreshHome();
  if (name === 'shop')        renderShop();
  if (name === 'leaderboard') renderLeaderboard('all-time');
  if (name === 'profile')     renderProfile();
  if (name === 'results')     {} // populated by finishQuiz()
}

// ─── AUTH ──────────────────────────────────────
function showAuth(mode) {
  showScreen('auth');
  toggleAuthMode(mode);
}

function toggleAuthMode(mode) {
  document.getElementById('auth-login').style.display    = mode === 'login'    ? 'block' : 'none';
  document.getElementById('auth-register').style.display = mode === 'register' ? 'block' : 'none';
  document.getElementById('auth-error').style.display    = 'none';
}

function handleLogin(e) {
  e.preventDefault();
  const raw = document.getElementById('login-email').value.trim();
  const pwd = document.getElementById('login-password').value;

  // Find by email or name
  const allUsers = getAllUsers();
  let found = null;
  const key = raw.toLowerCase();
  if (allUsers[key]) {
    found = allUsers[key];
  } else {
    found = Object.values(allUsers).find(u => u.name.toLowerCase() === key) || null;
  }

  if (!found || found.password !== pwd) {
    showAuthError('Incorrect email/username or password.');
    return;
  }
  loginUser(found);
}

function handleRegister(e) {
  e.preventDefault();
  const name  = document.getElementById('register-name').value.trim();
  const email = document.getElementById('register-email').value.trim().toLowerCase();
  const pwd   = document.getElementById('register-password').value;

  if (name.length < 2) { showAuthError('Name must be at least 2 characters.'); return; }
  if (getUser(email))  { showAuthError('An account with this email already exists.'); return; }

  const newUser = createNewUser(name, email, pwd);
  saveUser(newUser);
  loginUser(newUser);
}

function showAuthError(msg) {
  const el = document.getElementById('auth-error');
  el.textContent = msg;
  el.style.display = 'block';
}

function loginUser(user) {
  currentUser = user;
  saveSession(user.email);
  updateDayStreak();
  showScreen('home');
  showToast('Welcome back, ' + user.name + '! 🎉');
}

function handleLogout() {
  currentUser = null;
  clearSession();
  showScreen('landing');
  showToast('Logged out. See you soon!');
}

function playAsGuest() {
  currentUser = createNewUser('Guest', '__guest__@radtquest', '');
  currentUser.isGuest = true;
  showScreen('home');
}

function toggleMobileNav() {
  const nav = document.getElementById('site-nav');
  nav.classList.toggle('mobile-open');
}

// ─── DAY STREAK ────────────────────────────────
function updateDayStreak() {
  if (!currentUser || currentUser.isGuest) return;
  const today = new Date().toDateString();
  const last  = currentUser.lastActiveDate;
  if (last !== today) {
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (last === yesterday) {
      currentUser.streak++;
    } else if (last && last !== today) {
      currentUser.streak = 1;
    } else if (!last) {
      currentUser.streak = 1;
    }
    currentUser.lastActiveDate = today;
    saveUser(currentUser);
  }
}

// ─── HOME / DASHBOARD ──────────────────────────
function refreshHome() {
  if (!currentUser) return;
  const u = currentUser;
  const avatar = getAvatarIcon(u.avatar);
  const rank   = getRank(u.points);

  // Header
  document.getElementById('hdr-coins').textContent    = u.coins;
  document.getElementById('hdr-avatar').textContent   = avatar;
  document.getElementById('hdr-username').textContent = u.name;

  // Sidebar
  document.getElementById('sidebar-avatar').textContent   = avatar;
  document.getElementById('sidebar-username').textContent = u.name;
  document.getElementById('sidebar-rank').textContent     = rank;
  document.getElementById('sb-points').textContent  = u.points;
  document.getElementById('sb-coins').textContent   = u.coins;
  document.getElementById('sb-quizzes').textContent = u.quizzesCompleted;
  const best = u.quizzesCompleted > 0 ? u.bestScore + '%' : '0%';
  document.getElementById('sb-best').textContent    = best;

  // Greeting
  const hour = new Date().getHours();
  let greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  document.getElementById('home-greeting-text').textContent = greet + ', ' + u.name.split(' ')[0] + '! 🎯';

  // Streak
  document.getElementById('dash-streak').textContent = u.streak || 0;

  // Progress bars
  const mq  = u.mathQuizzes    || 0;
  const eq  = u.englishQuizzes || 0;
  const maxQ = 20;
  document.getElementById('math-progress-bar').style.width    = Math.min(mq / maxQ * 100, 100) + '%';
  document.getElementById('english-progress-bar').style.width = Math.min(eq / maxQ * 100, 100) + '%';
  document.getElementById('math-progress-text').textContent    = mq + ' quiz' + (mq !== 1 ? 'zes' : '');
  document.getElementById('english-progress-text').textContent = eq + ' quiz' + (eq !== 1 ? 'zes' : '');

  // Recent quizzes
  renderRecentQuizzes();

  // Mini leaderboard
  renderMiniLeaderboard();
}

function renderRecentQuizzes() {
  const cont = document.getElementById('recent-quizzes-list');
  const hist = (currentUser.quizHistory || []).slice().reverse().slice(0, 5);
  if (!hist.length) {
    cont.innerHTML = '<p class="empty-state">No quizzes yet – start one above! 🚀</p>';
    return;
  }
  cont.innerHTML = hist.map(h => {
    const pct = Math.round(h.score);
    const cls = pct >= 80 ? 'good' : pct >= 50 ? 'ok' : 'bad';
    const ico = h.subject === 'math' ? '🧮' : '📖';
    return `<div class="recent-item">
      <span class="ri-icon">${ico}</span>
      <div class="ri-info">
        <div class="ri-title">${cap(h.topic)} – ${cap(h.difficulty)}</div>
        <div class="ri-meta">${new Date(h.date).toLocaleDateString()}</div>
      </div>
      <span class="ri-score ${cls}">${pct}%</span>
    </div>`;
  }).join('');
}

function renderMiniLeaderboard() {
  const all  = buildAllTimeLeaderboard().slice(0, 5);
  const cont = document.getElementById('mini-leaderboard');
  if (!all.length) {
    cont.innerHTML = '<p class="empty-state">No players yet — invite friends to compete! 🏆</p>';
    return;
  }
  const medals = ['🥇','🥈','🥉','4️⃣','5️⃣'];
  cont.innerHTML = all.map((p, i) => {
    const isMe = currentUser && p.name === currentUser.name;
    return `<div class="mini-lb-item ${isMe ? 'me' : ''}">
      <span class="mini-rank">${medals[i]}</span>
      <span class="mini-avatar">${p.avatar}</span>
      <span class="mini-name">${p.name}${isMe ? ' (You)' : ''}</span>
      <span class="mini-pts">${p.points} pts</span>
    </div>`;
  }).join('');
}

// ─── QUIZ SETUP ────────────────────────────────
function showQuizSetup(subj) {
  currentSubject = subj || 'math';
  currentTopic   = null;
  currentDiff    = null;
  showScreen('quiz-setup');

  // Reset selections
  document.querySelectorAll('.option-card').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.difficulty-card').forEach(c => c.classList.remove('active'));
  document.getElementById('start-quiz-btn').disabled = true;

  // Toggle subject UI
  selectSubject(currentSubject, true);
}

function selectSubject(subj, noToggle) {
  currentSubject = subj;
  currentTopic   = null;
  document.getElementById('math-setup').style.display    = subj === 'math'    ? 'block' : 'none';
  document.getElementById('english-setup').style.display = subj === 'english' ? 'block' : 'none';
  document.getElementById('ss-math').classList.toggle('active',    subj === 'math');
  document.getElementById('ss-english').classList.toggle('active', subj === 'english');
  if (!noToggle) {
    document.querySelectorAll('.option-card').forEach(c => c.classList.remove('active'));
    document.getElementById('start-quiz-btn').disabled = true;
  }
}

function selectTopic(topic, el) {
  currentTopic = topic;
  document.querySelectorAll('.option-card').forEach(c => c.classList.remove('active'));
  if (el) el.classList.add('active');
  checkStartReady();
}

function selectDifficulty(diff, el) {
  currentDiff = diff;
  document.querySelectorAll('.difficulty-card').forEach(c => c.classList.remove('active'));
  if (el) el.classList.add('active');
  checkStartReady();
}

function checkStartReady() {
  document.getElementById('start-quiz-btn').disabled = !(currentTopic && currentDiff);
}

// ─── QUIZ LOGIC ────────────────────────────────
function startQuiz() {
  if (!currentTopic || !currentDiff) return;

  // Power-up: Double XP active?
  const doubleXp = currentUser && (currentUser.activePowerup === 'pu_2x');
  const noTimer  = currentUser && (currentUser.activePowerup === 'pu_shield');

  const questions = challengeQuestions || generateQuestions(currentSubject, currentTopic, currentDiff, 20);
  challengeQuestions = null;

  quizState = {
    questions,
    current: 0,
    correct: 0,
    wrong: 0,
    coins: 0,
    streak: 0,
    maxStreak: 0,
    doubleXp,
    noTimer,
    answerTimes: [],
    answers: [],
    subject: currentSubject,
    topic: currentTopic,
    difficulty: currentDiff,
    qStartTime: 0
  };

  showScreen('quiz');
  renderQuestion();
}

function generateQuestions(subj, topic, diff, n) {
  const qs = [];
  for (let i = 0; i < n; i++) {
    qs.push(generateOneQuestion(subj, topic, diff));
  }
  return qs;
}

function renderQuestion() {
  const s  = quizState;
  const q  = s.questions[s.current];
  const pct = (s.current / s.questions.length) * 100;

  document.getElementById('quiz-progress-fill').style.width = pct + '%';
  document.getElementById('quiz-q-count').textContent = (s.current + 1) + ' / ' + s.questions.length;
  document.getElementById('quiz-coins').textContent   = s.coins;
  document.getElementById('question-text').textContent = q.question;
  document.getElementById('question-number').textContent = 'Q' + (s.current + 1);
  document.getElementById('question-subject-tag').textContent = s.subject === 'math' ? '🧮 Maths' : '📖 English';

  const ctx = document.getElementById('question-context');
  if (q.context) {
    ctx.textContent  = q.context;
    ctx.style.display = 'block';
  } else {
    ctx.style.display = 'none';
  }

  // Streak badge
  const sb = document.getElementById('streak-badge');
  if (s.streak >= 3) {
    sb.style.display = 'block';
    document.getElementById('quiz-streak').textContent = s.streak;
  } else {
    sb.style.display = 'none';
  }

  // Answer buttons
  const grid = document.getElementById('answer-grid');
  grid.innerHTML = '';
  q.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className   = 'answer-btn';
    btn.textContent = opt;
    btn.onclick     = () => answerQuestion(opt, btn);
    grid.appendChild(btn);
  });

  document.getElementById('feedback-panel').style.display = 'none';

  // Start timer
  startQuestionTimer(s.noTimer ? 0 : 30);
  s.qStartTime = Date.now();
}

function answerQuestion(selected, btn) {
  clearInterval(timerInterval);
  const s = quizState;
  const q = s.questions[s.current];
  const timeMs = Date.now() - s.qStartTime;

  s.answerTimes.push(timeMs);
  s.answers.push({ question: q.question, selected, correct: q.answer, isCorrect: selected === q.answer });

  // Disable all buttons
  document.querySelectorAll('.answer-btn').forEach(b => b.disabled = true);

  if (selected === q.answer) {
    btn.classList.add('correct');
    s.correct++;
    s.streak++;
    if (s.streak > s.maxStreak) s.maxStreak = s.streak;

    const bonusStreak = s.streak >= 5 ? 3 : s.streak >= 3 ? 2 : 1;
    let coinsThisQ = 10 * bonusStreak * (s.doubleXp ? 2 : 1);
    s.coins += coinsThisQ;

    if (timeMs < 5000 && currentUser) {
      currentUser.fastAnswers = (currentUser.fastAnswers || 0) + 1;
    }

    showFeedback(true, s.streak >= 3 ? '🔥 On Fire! +' + coinsThisQ + ' coins' : '✅ Correct! +' + coinsThisQ + ' coins');
  } else {
    btn.classList.add('wrong');
    s.streak = 0;
    s.wrong++;
    // Highlight correct
    document.querySelectorAll('.answer-btn').forEach(b => {
      if (b.textContent === q.answer) b.classList.add('correct');
    });
    showFeedback(false, '❌ Wrong! Answer was: ' + q.answer);
  }

  document.getElementById('quiz-coins').textContent = s.coins;
}

function showFeedback(correct, msg) {
  const panel = document.getElementById('feedback-panel');
  document.getElementById('feedback-icon').textContent    = correct ? '🎉' : '😬';
  document.getElementById('feedback-message').textContent = msg;
  panel.style.display = 'flex';
}

function nextQuestion() {
  quizState.current++;
  if (quizState.current >= quizState.questions.length) {
    finishQuiz();
  } else {
    renderQuestion();
  }
}

function startQuestionTimer(seconds) {
  if (seconds === 0) {
    document.getElementById('timer-fill').style.width = '100%';
    document.getElementById('timer-num').textContent  = '∞';
    return;
  }
  let left = seconds;
  document.getElementById('timer-fill').style.width = '100%';
  document.getElementById('timer-num').textContent  = left;

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    left--;
    const pct = (left / seconds) * 100;
    document.getElementById('timer-fill').style.width = pct + '%';
    document.getElementById('timer-num').textContent  = left;
    if (left <= 0) {
      clearInterval(timerInterval);
      // Auto-answer as wrong
      answerQuestion('__timeout__', document.createElement('button'));
    }
  }, 1000);
}

function quitQuiz() {
  clearInterval(timerInterval);
  if (confirm('Are you sure you want to quit this quiz?')) {
    challengeQuestions = null;
    showScreen('home');
  }
}

// ─── RESULTS ───────────────────────────────────
function finishQuiz() {
  clearInterval(timerInterval);
  const s = quizState;
  const total    = s.questions.length;
  const pct      = Math.round((s.correct / total) * 100);
  const { grade, title, sub } = getGrade(pct);
  const avgTime  = s.answerTimes.length ? Math.round(s.answerTimes.reduce((a,b) => a+b, 0) / s.answerTimes.length / 1000) : 0;

  // Results UI
  document.getElementById('grade-letter').textContent   = grade;
  document.getElementById('results-title').textContent  = title;
  document.getElementById('results-subtitle').textContent = sub;
  document.getElementById('result-correct').textContent = s.correct;
  document.getElementById('result-wrong').textContent   = s.wrong;
  document.getElementById('result-score').textContent   = pct + '%';
  document.getElementById('result-time').textContent    = avgTime + 's';
  document.getElementById('coins-earned').textContent   = s.coins;

  // Grade ring colour
  const ring = document.getElementById('grade-ring');
  ring.style.background = pct >= 90 ? 'linear-gradient(135deg,#58CC02,#1cb0f6)'
                        : pct >= 70 ? 'linear-gradient(135deg,#1cb0f6,#ce82ff)'
                        : pct >= 50 ? 'linear-gradient(135deg,#ff9600,#ffcc00)'
                        : 'linear-gradient(135deg,#ff4b4b,#ff9600)';

  // Bonus badges
  const badges = [];
  if (pct === 100)          badges.push('💯 Perfect Score!');
  if (s.maxStreak >= 5)     badges.push('🔥 5x Streak!');
  if (s.maxStreak >= 3)     badges.push('⚡ 3x Streak Bonus!');
  if (s.doubleXp)           badges.push('✨ Double XP Active!');
  if (avgTime < 8)          badges.push('⚡ Speed Demon!');
  document.getElementById('bonus-badges').innerHTML = badges.map(b =>
    `<span class="bonus-badge">${b}</span>`).join('');

  // Question review
  const reviewList = document.getElementById('review-list');
  reviewList.innerHTML = s.answers.map((a, i) => `
    <div class="review-item ${a.isCorrect ? 'correct' : 'wrong'}">
      <span>${a.isCorrect ? '✅' : '❌'}</span>
      <span class="ri-q">Q${i+1}: ${a.question}</span>
      <span class="ri-a">${a.isCorrect ? a.correct : a.selected + ' → ' + a.correct}</span>
    </div>
  `).join('');

  // Update user stats
  if (currentUser) {
    currentUser.coins += s.coins;
    currentUser.points += Math.round(pct * (s.doubleXp ? 2 : 1));
    currentUser.totalCoinsEarned = (currentUser.totalCoinsEarned || 0) + s.coins;
    currentUser.quizzesCompleted++;
    if (s.subject === 'math')    currentUser.mathQuizzes++;
    else                         currentUser.englishQuizzes++;
    if (pct > (currentUser.bestScore || 0)) currentUser.bestScore = pct;
    currentUser.totalScore = (currentUser.totalScore || 0) + pct;
    if (s.maxStreak > (currentUser.maxStreak || 0)) currentUser.maxStreak = s.maxStreak;
    if (s.doubleXp) currentUser.activePowerup = null;

    currentUser.quizHistory = currentUser.quizHistory || [];
    currentUser.quizHistory.push({
      subject: s.subject, topic: s.topic, difficulty: s.difficulty,
      score: pct, correct: s.correct, coins: s.coins, date: Date.now()
    });

    if (!currentUser.isGuest) {
      checkAchievements();
      saveUser(currentUser);
    }
  }

  if (pct >= 70) launchConfetti();
  showScreen('results');
}

function getGrade(pct) {
  if (pct >= 97) return { grade:'A+', title:'Outstanding! 🌟',    sub:'You nailed every question!' };
  if (pct >= 90) return { grade:'A',  title:'Excellent! 🎉',      sub:'Almost perfect, keep it up!' };
  if (pct >= 80) return { grade:'B',  title:'Great Job! 👏',      sub:'Solid performance!' };
  if (pct >= 70) return { grade:'C',  title:'Good Try! 🙂',       sub:'A bit more practice will help.' };
  if (pct >= 60) return { grade:'D',  title:'Keep Going! 💪',     sub:'You\'re learning – keep at it!' };
  return               { grade:'F',  title:'Don\'t Give Up! 🤔', sub:'Try again – you\'ll do better!' };
}

function replayQuiz() {
  showScreen('quiz-setup');
  // Re-select the same options
  selectSubject(quizState.subject, true);
  setTimeout(() => {
    const topicEl = document.querySelector(`[data-topic="${quizState.topic}"]`);
    if (topicEl) topicEl.click();
    const diffEl  = document.querySelector(`[data-diff="${quizState.difficulty}"]`);
    if (diffEl)  diffEl.click();
  }, 100);
}

// ─── SHOP ──────────────────────────────────────
function renderShop() {
  if (!currentUser) return;
  document.getElementById('shop-coins').textContent = currentUser.coins;

  renderShopSection('avatars');
  renderShopSection('themes');
  renderShopSection('powerups');
}

function renderShopSection(type) {
  const grid = document.getElementById('shop-' + type);
  const items = SHOP_CATALOG[type];
  const owned = currentUser.ownedItems || [];

  grid.innerHTML = items.map(item => {
    const isOwned    = owned.includes(item.id);
    const isEquipped = item.type === 'avatar' ? currentUser.avatar === item.id
                     : item.type === 'theme'  ? currentUser.theme  === item.id : false;

    let badge = '';
    if (isEquipped)   badge = '<span class="equipped-badge">✅ Equipped</span>';
    else if (isOwned) badge = '<span class="owned-badge">✔ Owned</span>';
    else              badge = `<span class="shop-item-price">🪙 ${item.price}</span>`;

    return `<div class="shop-item ${isOwned ? 'owned' : ''} ${isEquipped ? 'active-item' : ''}"
                  onclick="shopItemClick('${item.id}','${type}')">
      <span class="shop-item-icon">${item.icon}</span>
      <div class="shop-item-name">${item.name}</div>
      <div class="shop-item-desc">${item.desc || (item.class ? 'App theme' : '')}</div>
      ${badge}
    </div>`;
  }).join('');
}

function shopItemClick(id, type) {
  const item = SHOP_CATALOG[type].find(i => i.id === id);
  if (!item) return;

  const owned = currentUser.ownedItems || [];
  if (owned.includes(id)) {
    equipItem(item);
    return;
  }
  if (currentUser.coins < item.price) {
    showToast('Not enough coins! 🪙 Need ' + item.price);
    return;
  }
  showModal('🛍️', 'Buy ' + item.name + '?',
    'Cost: 🪙 ' + item.price + ' coins. You have 🪙 ' + currentUser.coins + ' coins.',
    () => { buyItem(item); });
}

function buyItem(item) {
  currentUser.coins -= item.price;
  currentUser.ownedItems = currentUser.ownedItems || [];
  currentUser.ownedItems.push(item.id);
  equipItem(item, true);
  if (!currentUser.isGuest) saveUser(currentUser);
  renderShop();
  showToast(item.icon + ' ' + item.name + ' purchased!');
}

function equipItem(item, justBought) {
  if (item.type === 'avatar') {
    currentUser.avatar = item.id;
    document.getElementById('hdr-avatar').textContent = item.icon;
    document.getElementById('sidebar-avatar').textContent = item.icon;
  }
  if (item.type === 'theme') {
    currentUser.theme = item.id;
    const th = SHOP_CATALOG.themes.find(t => t.id === item.id);
    document.body.className = th ? th.class : '';
  }
  if (item.type === 'powerup') {
    currentUser.activePowerup = item.id;
    showToast('⚡ ' + item.name + ' activated for your next quiz!');
  }
  if (!currentUser.isGuest) saveUser(currentUser);
  if (!justBought) { renderShop(); showToast('✅ ' + item.name + ' equipped!'); }
}

function switchShopTab(tab, btn) {
  document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  ['avatars','themes','powerups'].forEach(t => {
    document.getElementById('shop-' + t).style.display = t === tab ? 'grid' : 'none';
  });
}

// ─── LEADERBOARD ───────────────────────────────
function buildAllTimeLeaderboard() {
  const realUsers = Object.values(getAllUsers());
  const combined = realUsers
    .filter(u => !u.isGuest)
    .map(u => ({
      name: u.name,
      avatar: getAvatarIcon(u.avatar),
      points: u.points || 0,
      coins: u.coins || 0,
      quizzesCompleted: u.quizzesCompleted || 0,
      bestScore: u.bestScore || 0,
      streak: u.streak || 0,
      mathQuizzes: u.mathQuizzes || 0,
      englishQuizzes: u.englishQuizzes || 0,
      isReal: true,
      email: u.email
    }));
  combined.sort((a, b) => b.points - a.points);
  return combined;
}

function renderLeaderboard(tab) {
  let data = buildAllTimeLeaderboard();
  if (tab === 'weekly') {
    // Weekly: only players who quizzed this week (last 7 days)
    // Since we don't store exact weekly data, show all sorted by points (real data only)
    data = [...data];
  }
  if (tab === 'math')    data = [...data].sort((a, b) => (b.mathQuizzes || 0) - (a.mathQuizzes || 0));
  if (tab === 'english') data = [...data].sort((a, b) => (b.englishQuizzes || 0) - (a.englishQuizzes || 0));

  // Podium (top 3)
  const podium = document.getElementById('leaderboard-podium');
  const top3   = data.slice(0, 3);

  if (data.length === 0) {
    podium.innerHTML = `<div style="color:rgba(255,255,255,0.6);text-align:center;padding:20px;font-size:15px;">
      🏆 No players yet — be the first to take a quiz and claim #1!
    </div>`;
  } else {
    // Display order: 2nd place (left), 1st place (centre), 3rd place (right)
    const displayOrder = data.length >= 3 ? [1, 0, 2]
                       : data.length === 2 ? [1, 0]
                       : [0];
    podium.innerHTML = displayOrder.map(i => {
      const p = top3[i];
      if (!p) return '';
      const medals = ['🥇','🥈','🥉'];
      const heights = [90, 70, 55];
      const place = i + 1;
      return `<div class="podium-place place-${place}">
        <div class="podium-avatar">${p.avatar}</div>
        <div class="podium-name">${p.name}</div>
        <div class="podium-pts">${p.points} pts</div>
        <div class="podium-bar" style="height:${heights[i]}px"><span class="podium-rank">${medals[i]}</span></div>
      </div>`;
    }).join('');
  }

  // Table (all real players)
  const tbody = document.getElementById('leaderboard-table-body');
  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;color:#9ca3af;font-size:14px;">
      No players on the leaderboard yet. Sign up and complete a quiz to appear here! 🚀
    </td></tr>`;
  } else {
    tbody.innerHTML = data.map((p, i) => {
      const isMe = currentUser && p.name === currentUser.name;
      const medal = i < 3 ? ['🥇','🥈','🥉'][i] : (i + 1);
      return `<tr class="${isMe ? 'me' : ''}">
        <td class="lb-row-rank">${medal}</td>
        <td><div class="lb-row-player"><span class="lb-row-avatar">${p.avatar}</span>${p.name}${isMe ? ' <strong>(You)</strong>' : ''}</div></td>
        <td>${p.quizzesCompleted}</td>
        <td class="lb-row-score">${p.bestScore}%</td>
        <td class="lb-row-pts">${p.points}</td>
        <td class="lb-row-streak">${p.streak > 0 ? '🔥 ' + p.streak : '—'}</td>
      </tr>`;
    }).join('');
  }

  // My rank
  const myIdx = currentUser && !currentUser.isGuest
    ? data.findIndex(p => p.name === currentUser.name)
    : -1;
  document.getElementById('my-rank-num').textContent  = myIdx >= 0 ? '#' + (myIdx + 1) : '#—';
  document.getElementById('my-rank-name').textContent = currentUser ? currentUser.name : '—';
  document.getElementById('my-rank-pts').textContent  = currentUser ? currentUser.points + ' points' : '0 points';

  // Online players (real users only)
  renderOnlinePlayers(data);
}

function renderOnlinePlayers(data) {
  const el = document.getElementById('online-players');
  if (!data.length) {
    el.innerHTML = '<p class="empty-state" style="font-size:13px;padding:8px 0;">No players yet — invite your friends!</p>';
    return;
  }
  el.innerHTML = data.slice(0, 6).map(p => `
    <div class="online-player-item">
      <span class="online-dot"></span>
      <span class="online-name">${p.avatar} ${p.name}</span>
      <span class="online-pts">${p.points} pts</span>
    </div>`).join('');
}

function switchLbTab(tab, btn) {
  document.querySelectorAll('.lb-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderLeaderboard(tab);
}

// ─── CHALLENGE SYSTEM ──────────────────────────
function generateChallengeCode() {
  if (!currentSubject || !currentDiff) {
    currentSubject = 'math';
    currentTopic   = 'mixed-math';
    currentDiff    = 'medium';
  }
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  const challengeData = {
    code,
    subject: currentSubject,
    topic: currentTopic || 'mixed-math',
    difficulty: currentDiff || 'medium',
    createdBy: currentUser ? currentUser.name : 'Guest',
    questions: generateQuestions(currentSubject, currentTopic || 'mixed-math', currentDiff || 'medium', 20),
    timestamp: Date.now()
  };
  localStorage.setItem('radtquest_challenge_' + code, JSON.stringify(challengeData));

  // Show in both places
  ['challenge-code', 'challenge-code-sidebar'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = code;
  });

  if (currentUser) { currentUser.usedChallenge = true; if (!currentUser.isGuest) saveUser(currentUser); }
  showToast('🎯 Challenge code: ' + code + ' – Share it!');
  return code;
}

function joinChallenge() {
  joinChallengeWithCode(document.getElementById('join-code-input').value.trim().toUpperCase());
}
function joinChallengeFromSidebar() {
  joinChallengeWithCode(document.getElementById('join-code-sidebar').value.trim().toUpperCase());
}
function joinChallengeWithCode(code) {
  if (!code || code.length < 4) { showToast('Enter a valid challenge code!'); return; }

  const raw = localStorage.getItem('radtquest_challenge_' + code);
  if (!raw) { showToast('Code not found. Ask your friend to generate a new one!'); return; }

  const data = JSON.parse(raw);
  // Check not expired (24h)
  if (Date.now() - data.timestamp > 86400000) {
    showToast('This challenge has expired!'); return;
  }

  currentSubject = data.subject;
  currentTopic   = data.topic;
  currentDiff    = data.difficulty;
  challengeQuestions = data.questions;

  if (currentUser) { currentUser.usedChallenge = true; if (!currentUser.isGuest) saveUser(currentUser); }
  showToast('🎯 Joined ' + data.createdBy + "'s challenge!");
  startQuiz();
}

// ─── PROFILE ───────────────────────────────────
function renderProfile() {
  if (!currentUser) return;
  const u = currentUser;
  const avatar = getAvatarIcon(u.avatar);
  const rank   = getRank(u.points);
  const avg    = u.quizzesCompleted > 0 ? Math.round((u.totalScore || 0) / u.quizzesCompleted) : 0;

  document.getElementById('profile-avatar').textContent        = avatar;
  document.getElementById('profile-name').textContent          = u.name;
  document.getElementById('profile-email').textContent         = u.isGuest ? 'Guest Account' : u.email;
  document.getElementById('profile-rank').textContent          = rank;
  document.getElementById('profile-total-points').textContent  = u.points;
  document.getElementById('profile-coins').textContent         = u.coins;
  document.getElementById('profile-quizzes').textContent       = u.quizzesCompleted;
  document.getElementById('profile-streak').textContent        = u.streak || 0;
  document.getElementById('profile-best-score').textContent    = (u.bestScore || 0) + '%';
  document.getElementById('profile-avg-score').textContent     = avg + '%';

  // Achievements
  const grid = document.getElementById('achievements-grid');
  grid.innerHTML = ACHIEVEMENTS.map(a => {
    const unlocked = a.check(u);
    return `<div class="achievement-item ${unlocked ? 'unlocked' : 'locked'}">
      <span class="ach-icon">${a.icon}</span>
      <div class="ach-name">${a.name}</div>
      <div class="ach-desc">${a.desc}</div>
    </div>`;
  }).join('');

  // Quiz history
  const hist = (u.quizHistory || []).slice().reverse();
  const histEl = document.getElementById('quiz-history-list');
  if (!hist.length) {
    histEl.innerHTML = '<p class="empty-state">No quiz history yet.</p>';
  } else {
    histEl.innerHTML = hist.map(h => {
      const g = h.score >= 90 ? 'a' : h.score >= 70 ? 'b' : h.score >= 50 ? 'c' : 'f';
      const ico = h.subject === 'math' ? '🧮' : '📖';
      return `<div class="qh-item">
        <span class="qh-icon">${ico}</span>
        <div class="qh-info">
          <div class="qh-title">${cap(h.topic)} – ${cap(h.difficulty)}</div>
          <div class="qh-meta">${new Date(h.date).toLocaleDateString()} · ${h.correct}/20 correct</div>
        </div>
        <span class="qh-score ${g}">${h.score}%</span>
      </div>`;
    }).join('');
  }
}

// ─── ACHIEVEMENTS ──────────────────────────────
function checkAchievements() {
  if (!currentUser) return;
  ACHIEVEMENTS.forEach(a => {
    const key = 'ach_notified_' + a.id;
    if (!currentUser[key] && a.check(currentUser)) {
      currentUser[key] = true;
      setTimeout(() => showToast(a.icon + ' Achievement unlocked: ' + a.name + '!'), 1200);
    }
  });
}

// ─── HELPERS ───────────────────────────────────
function getAvatarIcon(id) {
  const item = [...SHOP_CATALOG.avatars].find(a => a.id === id);
  return item ? item.icon : '🐶';
}

function getRank(points) {
  if (points >= 5000) return '🏆 Legend';
  if (points >= 2000) return '💎 Diamond';
  if (points >= 1000) return '🥇 Gold';
  if (points >= 500)  return '🥈 Silver';
  if (points >= 200)  return '🥉 Bronze';
  return '🎓 Beginner';
}

function cap(s) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ');
}

// ─── MODAL ─────────────────────────────────────
let pendingModalCb = null;
function showModal(icon, title, body, onConfirm) {
  document.getElementById('modal-icon').textContent  = icon;
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').textContent  = body;
  pendingModalCb = onConfirm;
  document.getElementById('modal-confirm').onclick   = () => { closeModal(); if (pendingModalCb) pendingModalCb(); };
  document.getElementById('modal-overlay').style.display = 'flex';
}
function closeModal() {
  document.getElementById('modal-overlay').style.display = 'none';
  pendingModalCb = null;
}

// ─── TOAST ─────────────────────────────────────
let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
}

// ─── CONFETTI ──────────────────────────────────
function launchConfetti() {
  const cont = document.getElementById('confetti-container');
  const colors = ['#58CC02','#1cb0f6','#ce82ff','#ff9600','#FFD700','#ff4b4b'];
  cont.innerHTML = '';
  for (let i = 0; i < 80; i++) {
    const c  = document.createElement('div');
    c.className = 'confetti-piece';
    c.style.left     = Math.random() * 100 + 'vw';
    c.style.background = colors[Math.floor(Math.random() * colors.length)];
    c.style.animationDuration  = (Math.random() * 2 + 1.5) + 's';
    c.style.animationDelay     = (Math.random() * 0.8) + 's';
    c.style.width  = (Math.random() * 10 + 6)  + 'px';
    c.style.height = (Math.random() * 10 + 6)  + 'px';
    c.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    cont.appendChild(c);
  }
  setTimeout(() => { if (cont) cont.innerHTML = ''; }, 5000);
}

// ─── QUESTION GENERATOR (wrapper) ──────────────
function generateOneQuestion(subj, topic, diff) {
  if (subj === 'math') {
    if (topic === 'addition')       return genAddition(diff);
    if (topic === 'subtraction')    return genSubtraction(diff);
    if (topic === 'multiplication') return genMultiplication(diff);
    if (topic === 'division')       return genDivision(diff);
    if (topic === 'mixed-math') {
      const fns = [genAddition, genSubtraction, genMultiplication, genDivision, genWordProblem];
      return fns[Math.floor(Math.random() * fns.length)](diff);
    }
  } else {
    if (topic === 'spelling')       return genSpelling(diff);
    if (topic === 'vocabulary')     return genVocabulary(diff);
    if (topic === 'grammar')        return genGrammar(diff);
    if (topic === 'mixed-english') {
      const fns = [genSpelling, genVocabulary, genGrammar];
      return fns[Math.floor(Math.random() * fns.length)](diff);
    }
  }
  return genAddition(diff);
}

// ─── BOOT ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Restore session
  const savedEmail = getSavedSession();
  if (savedEmail) {
    const user = getUser(savedEmail);
    if (user) {
      currentUser = user;
      updateDayStreak();
      showScreen('home');
      return;
    }
  }
  showScreen('landing');
});
