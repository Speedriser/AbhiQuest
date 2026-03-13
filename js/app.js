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
let currentDiff    = null;   // kept for backward-compat
let currentGrade   = null;   // '1' through '8'
let currentScreen  = 'landing';
let challengeQuestions = null;

// ─── SUBJECT CONFIGURATION (extensible) ────────
// To add a new subject: add an entry here with label, icon, topics, hasDynamicGenerator.
// The admin Question Manager and quiz system both read from this config.
const BUILTIN_SUBJECT_CONFIG = {
  math: {
    label: 'Maths',
    icon: '🧮',
    hasDynamicGenerator: true,   // questions generated procedurally — no static bank to browse
    topics: {
      'addition':       'Addition',
      'subtraction':    'Subtraction',
      'multiplication': 'Multiplication',
      'division':       'Division',
      'fractions':      'Fractions',
      'word-problems':  'Word Problems',
      'mixed-math':     'Mixed Maths'
    }
  },
  english: {
    label: 'English',
    icon: '📖',
    hasDynamicGenerator: false,   // questions come from static banks in questions.js
    topics: {
      'spelling':       'Spelling',
      'vocabulary':     'Vocabulary',
      'grammar':        'Grammar',
      'mixed-english':  'Mixed English'
    }
  }
};

function getSubjectConfig() {
  // Returns the subject config. In future this can merge in localStorage-stored custom subjects.
  return BUILTIN_SUBJECT_CONFIG;
}

// ─── STORAGE HELPERS ───────────────────────────
const USERS_KEY              = 'radtquest_users';
const SESSION_KEY            = 'radtquest_session';
const CUSTOM_QUESTIONS_KEY   = 'radtquest_custom_questions';

// ─── CUSTOM QUESTION STORAGE ───────────────────
function getCustomQuestions() {
  try { return JSON.parse(localStorage.getItem(CUSTOM_QUESTIONS_KEY) || '[]'); }
  catch(e) { return []; }
}
function saveCustomQuestions(arr) {
  localStorage.setItem(CUSTOM_QUESTIONS_KEY, JSON.stringify(arr));
}

/** Returns custom questions that match a quiz request. */
function getCustomQuestionsForQuiz(subj, topic, grade) {
  const isMixed = (topic === 'mixed-math' || topic === 'mixed-english');
  return getCustomQuestions().filter(cq =>
    cq.subject === subj &&
    cq.grade   === String(grade) &&
    (isMixed || cq.topic === topic)
  );
}

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
    if (loggedIn && name !== 'landing' && name !== 'auth' && name !== 'admin') {
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
  if (name === 'admin')       { renderAdminOverview(); renderAdminUsers(); renderAdminActivity(); renderAdminQuestions(); switchAdminTab('overview'); }
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
        <div class="ri-title">${cap(h.topic)} – Grade ${h.difficulty || h.grade || '?'}</div>
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
  currentGrade   = null;
  currentDiff    = null;
  showScreen('quiz-setup');

  // Reset selections
  document.querySelectorAll('.option-card').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.grade-card').forEach(c => c.classList.remove('active'));
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

function selectGrade(grade, el) {
  currentGrade = grade;
  currentDiff  = grade; // backward-compat for challenge/history
  document.querySelectorAll('.grade-card').forEach(c => c.classList.remove('active'));
  if (el) el.classList.add('active');
  checkStartReady();
}

function checkStartReady() {
  document.getElementById('start-quiz-btn').disabled = !(currentTopic && currentGrade);
}

// ─── QUIZ LOGIC ────────────────────────────────
function startQuiz() {
  if (!currentTopic || !currentGrade) return;

  // Power-up: Double XP active?
  const doubleXp = currentUser && (currentUser.activePowerup === 'pu_2x');
  const noTimer  = currentUser && (currentUser.activePowerup === 'pu_shield');

  const questions = challengeQuestions || generateQuestions(currentSubject, currentTopic, currentGrade, 20);
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
    wrongQuestions: [],   // full question objects answered incorrectly
    subject: currentSubject,
    topic: currentTopic,
    difficulty: currentGrade,
    grade: currentGrade,
    qStartTime: 0,
    isReviewRound: false
  };

  showScreen('quiz');
  renderQuestion();
}

function generateQuestions(subj, topic, grade, n) {
  const qs   = [];
  const seen = new Set();

  // 1. Include custom questions first (always appear for their grade/topic)
  const customPool = getCustomQuestionsForQuiz(subj, topic, grade);
  const shuffledCustom = [...customPool].sort(() => Math.random() - 0.5);
  for (const cq of shuffledCustom) {
    if (qs.length >= n) break;
    if (!seen.has(cq.question)) {
      seen.add(cq.question);
      qs.push({
        subject:  cq.subject,
        type:     cq.topic,
        context:  cq.context || null,
        question: cq.question,
        answer:   cq.answer,
        options:  [...cq.options].sort(() => Math.random() - 0.5)
      });
    }
  }

  // 2. Fill remainder with dynamically-generated / bank questions (deduped)
  let attempts = 0;
  while (qs.length < n && attempts < n * 25) {
    attempts++;
    const q = generateOneQuestion(subj, topic, grade);
    if (!seen.has(q.question)) {
      seen.add(q.question);
      qs.push(q);
    }
  }
  // Safety fallback: pool exhausted — allow repeats to fill remaining slots
  while (qs.length < n) {
    qs.push(generateOneQuestion(subj, topic, grade));
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
    // Track wrong question for review round (avoid duplicates)
    if (!s.isReviewRound) {
      const alreadyTracked = s.wrongQuestions.some(wq => wq.question === q.question);
      if (!alreadyTracked) s.wrongQuestions.push(q);
    }
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

  // Show / hide "Review Wrong Answers" button
  const reviewBtn = document.getElementById('btn-review-wrong');
  if (reviewBtn) {
    if (!s.isReviewRound && s.wrongQuestions.length > 0) {
      reviewBtn.style.display = '';
      reviewBtn.textContent = '🔁 Review ' + s.wrongQuestions.length + ' Wrong Answer' + (s.wrongQuestions.length > 1 ? 's' : '');
    } else {
      reviewBtn.style.display = 'none';
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
  const savedGrade = quizState.grade || quizState.difficulty;
  showScreen('quiz-setup');
  // Re-select the same options
  selectSubject(quizState.subject, true);
  setTimeout(() => {
    const topicEl = document.querySelector(`[data-topic="${quizState.topic}"]`);
    if (topicEl) topicEl.click();
    const gradeEl = document.querySelector(`.grade-card[data-grade="${savedGrade}"]`);
    if (gradeEl)  selectGrade(savedGrade, gradeEl);
  }, 100);
}

function reviewWrongAnswers() {
  if (!quizState || !quizState.wrongQuestions || quizState.wrongQuestions.length === 0) return;
  const wrongQs = quizState.wrongQuestions;

  // Shuffle the review questions so they appear in a different order
  const shuffled = [...wrongQs].sort(() => Math.random() - 0.5);

  const doubleXp = currentUser && (currentUser.activePowerup === 'pu_2x');
  const noTimer  = currentUser && (currentUser.activePowerup === 'pu_shield');

  quizState = {
    questions: shuffled,
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
    wrongQuestions: [],
    subject: currentSubject,
    topic: currentTopic,
    difficulty: currentGrade,
    grade: currentGrade,
    qStartTime: 0,
    isReviewRound: true
  };

  showScreen('quiz');
  renderQuestion();
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
  if (!currentSubject || !currentGrade) {
    currentSubject = 'math';
    currentTopic   = 'mixed-math';
    currentGrade   = '4';
    currentDiff    = '4';
  }
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  const challengeData = {
    code,
    subject: currentSubject,
    topic: currentTopic || 'mixed-math',
    grade: currentGrade || '4',
    difficulty: currentGrade || '4',
    createdBy: currentUser ? currentUser.name : 'Guest',
    questions: generateQuestions(currentSubject, currentTopic || 'mixed-math', currentGrade || '4', 20),
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
  currentGrade   = data.grade || data.difficulty || '4';
  currentDiff    = currentGrade;
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
          <div class="qh-title">${cap(h.topic)} – Grade ${h.difficulty || h.grade || '?'}</div>
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
function generateOneQuestion(subj, topic, grade) {
  if (subj === 'math') {
    if (topic === 'addition')       return genAddition(grade);
    if (topic === 'subtraction')    return genSubtraction(grade);
    if (topic === 'multiplication') return genMultiplication(grade);
    if (topic === 'division')       return genDivision(grade);
    if (topic === 'fractions')      return genFractions(grade);
    if (topic === 'word-problems')  return genWordProblem(grade);
    if (topic === 'mixed-math') {
      const fns = [genAddition, genSubtraction, genMultiplication, genDivision, genWordProblem];
      return fns[Math.floor(Math.random() * fns.length)](grade);
    }
  } else {
    if (topic === 'spelling')       return genSpelling(grade);
    if (topic === 'vocabulary')     return genVocabulary(grade);
    if (topic === 'grammar')        return genGrammar(grade);
    if (topic === 'mixed-english') {
      const fns = [genSpelling, genVocabulary, genGrammar];
      return fns[Math.floor(Math.random() * fns.length)](grade);
    }
  }
  return genAddition(grade);
}

// ─── ADMIN PANEL ───────────────────────────────
const ADMIN_KEY = 'radtquest_admin';

function getAdminCreds() {
  const stored = localStorage.getItem(ADMIN_KEY);
  if (stored) { try { return JSON.parse(stored); } catch(e) {} }
  return { username: 'admin', password: 'admin' };
}

function saveAdminCreds(creds) {
  localStorage.setItem(ADMIN_KEY, JSON.stringify(creds));
}

function showAdminLogin() {
  const modal = document.getElementById('admin-login-modal');
  modal.style.display = 'flex';
  document.getElementById('admin-username-input').value = '';
  document.getElementById('admin-password-input').value = '';
  document.getElementById('admin-login-error').style.display = 'none';
  setTimeout(() => document.getElementById('admin-username-input').focus(), 100);
}

function closeAdminLogin() {
  document.getElementById('admin-login-modal').style.display = 'none';
}

function handleAdminLogin() {
  const creds    = getAdminCreds();
  const username = document.getElementById('admin-username-input').value.trim();
  const password = document.getElementById('admin-password-input').value;
  const errEl    = document.getElementById('admin-login-error');
  if (username !== creds.username || password !== creds.password) {
    errEl.textContent   = 'Invalid username or password.';
    errEl.style.display = 'flex';
    return;
  }
  closeAdminLogin();
  showScreen('admin');
}

function adminLogout() {
  // Close mobile sidebar if open before leaving
  const layout = document.getElementById('admin-layout');
  if (layout) layout.classList.remove('sidebar-open');
  showScreen('landing');
}

function toggleAdminSidebar() {
  const layout = document.getElementById('admin-layout');
  if (layout) layout.classList.toggle('sidebar-open');
}

function switchAdminTab(tab) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.admin-nav-btn').forEach(b => b.classList.remove('active'));
  const tabEl = document.getElementById('admin-tab-' + tab);
  if (tabEl) tabEl.classList.add('active');
  const navEl = document.getElementById('anav-' + tab);
  if (navEl) navEl.classList.add('active');

  // Close sidebar on mobile when a tab is tapped
  const layout = document.getElementById('admin-layout');
  if (layout && window.innerWidth <= 768) layout.classList.remove('sidebar-open');

  // Lazy-render on first visit to each tab
  if (tab === 'users')     renderAdminUsers();
  if (tab === 'activity')  renderAdminActivity();
  if (tab === 'overview')  renderAdminOverview();
  if (tab === 'questions') renderAdminQuestions();
}

function renderAdminOverview() {
  const allUsers    = Object.values(getAllUsers()).filter(u => !u.isGuest);
  const totalQuizzes = allUsers.reduce((s, u) => s + (u.quizzesCompleted || 0), 0);
  const scored       = allUsers.filter(u => u.quizzesCompleted > 0).map(u => u.bestScore || 0);
  const avgScore     = scored.length ? Math.round(scored.reduce((a,b) => a+b, 0) / scored.length) : 0;
  const topPlayer    = [...allUsers].sort((a,b) => (b.points||0) - (a.points||0))[0];
  const totalMath    = allUsers.reduce((s,u) => s + (u.mathQuizzes    || 0), 0);
  const totalEng     = allUsers.reduce((s,u) => s + (u.englishQuizzes || 0), 0);
  const totalPts     = totalMath + totalEng;

  // Stat cards
  const statsGrid = document.getElementById('admin-stats-grid');
  if (!statsGrid) return;
  statsGrid.innerHTML = [
    { icon:'fas fa-users',  label:'Total Users',    value: allUsers.length,                        color:'#1cb0f6' },
    { icon:'fas fa-tasks',  label:'Total Quizzes',  value: totalQuizzes,                           color:'#58CC02' },
    { icon:'fas fa-trophy', label:'Top Player',     value: topPlayer ? topPlayer.name : '—',       color:'#FFD700' },
    { icon:'fas fa-star',   label:'Avg Best Score', value: avgScore + '%',                         color:'#ce82ff' },
  ].map(s => `<div class="admin-stat-card">
    <div class="admin-stat-icon" style="color:${s.color}"><i class="${s.icon}"></i></div>
    <div class="admin-stat-value">${s.value}</div>
    <div class="admin-stat-label">${s.label}</div>
  </div>`).join('');

  // Subject breakdown
  const sbEl = document.getElementById('admin-subject-breakdown');
  if (sbEl) {
    const mp = totalPts > 0 ? Math.round(totalMath / totalPts * 100) : 0;
    const ep = totalPts > 0 ? Math.round(totalEng  / totalPts * 100) : 0;
    sbEl.innerHTML = `
      <div class="admin-subject-bar">
        <div class="asb-label"><span>&#129518; Maths</span><span>${totalMath} quizzes</span></div>
        <div class="asb-track"><div class="asb-fill math" style="width:${mp}%"></div></div>
      </div>
      <div class="admin-subject-bar">
        <div class="asb-label"><span>&#128214; English</span><span>${totalEng} quizzes</span></div>
        <div class="asb-track"><div class="asb-fill eng" style="width:${ep}%"></div></div>
      </div>`;
  }

  // Recent activity (latest 8 sessions across all users)
  const allHistory = [];
  allUsers.forEach(u => (u.quizHistory||[]).forEach(h => allHistory.push({...h, userName: u.name})));
  allHistory.sort((a,b) => b.date - a.date);
  const raEl = document.getElementById('admin-recent-activity');
  if (raEl) {
    if (!allHistory.length) {
      raEl.innerHTML = '<p class="empty-state">No quiz activity yet.</p>';
    } else {
      raEl.innerHTML = allHistory.slice(0, 8).map(h => {
        const cls = h.score >= 80 ? 'good' : h.score >= 50 ? 'ok' : 'bad';
        const ico = h.subject === 'math' ? '&#129518;' : '&#128214;';
        return `<div class="admin-activity-item">
          <span class="aai-icon">${ico}</span>
          <div class="aai-info">
            <div class="aai-name">${h.userName}</div>
            <div class="aai-meta">${cap(h.topic)} &middot; Grade ${h.difficulty || h.grade || '?'}</div>
          </div>
          <span class="aai-score ${cls}">${h.score}%</span>
          <span class="aai-date">${new Date(h.date).toLocaleDateString()}</span>
        </div>`;
      }).join('');
    }
  }
}

function renderAdminUsers() {
  const allUsers = Object.values(getAllUsers()).filter(u => !u.isGuest);
  const countEl = document.getElementById('admin-user-count');
  if (countEl) countEl.textContent = allUsers.length + ' user' + (allUsers.length !== 1 ? 's' : '');
  _renderAdminUsersTable(allUsers);
}

function _renderAdminUsersTable(users) {
  const tbody = document.getElementById('admin-users-table-body');
  if (!tbody) return;
  if (!users.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:24px;color:#9ca3af;">No users found.</td></tr>';
    return;
  }
  tbody.innerHTML = users.map(u => {
    const avatar = getAvatarIcon(u.avatar);
    const joined = u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—';
    return `<tr>
      <td><div class="admin-user-cell"><span class="admin-user-avatar">${avatar}</span><strong>${u.name}</strong></div></td>
      <td style="font-size:13px;color:#6b7280">${u.email}</td>
      <td>${u.quizzesCompleted || 0}</td>
      <td>${u.bestScore || 0}%</td>
      <td>${u.points || 0}</td>
      <td>${u.coins || 0}</td>
      <td style="font-size:12px">${joined}</td>
      <td><button class="admin-delete-btn" onclick="deleteUserAsAdmin('${u.email.replace(/'/g,"\\'")}')"><i class="fas fa-trash"></i></button></td>
    </tr>`;
  }).join('');
}

function filterAdminUsers() {
  const query    = (document.getElementById('admin-user-search').value || '').toLowerCase().trim();
  const allUsers = Object.values(getAllUsers()).filter(u => !u.isGuest);
  const filtered = query
    ? allUsers.filter(u => u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query))
    : allUsers;
  _renderAdminUsersTable(filtered);
}

function deleteUserAsAdmin(email) {
  const allUsers = getAllUsers();
  const user = allUsers[email.toLowerCase()];
  if (!user) return;
  showModal('&#128465;', 'Delete User?',
    'Permanently delete ' + user.name + "'s account. This cannot be undone.",
    () => {
      const updated = getAllUsers();
      delete updated[email.toLowerCase()];
      saveAllUsers(updated);
      renderAdminUsers();
      showToast('Deleted: ' + user.name);
    });
}

function renderAdminActivity() {
  const allUsers   = Object.values(getAllUsers()).filter(u => !u.isGuest);
  const allHistory = [];
  allUsers.forEach(u => (u.quizHistory||[]).forEach(h => allHistory.push({...h, userName: u.name})));
  allHistory.sort((a,b) => b.date - a.date);

  const logEl = document.getElementById('admin-activity-log');
  if (!logEl) return;
  if (!allHistory.length) {
    logEl.innerHTML = '<p class="empty-state">No quiz activity yet.</p>';
    return;
  }
  logEl.innerHTML = `<table class="admin-table">
    <thead><tr>
      <th>User</th><th>Subject</th><th>Topic</th><th>Grade</th>
      <th>Score</th><th>Correct</th><th>Coins</th><th>Date</th>
    </tr></thead>
    <tbody>${allHistory.map(h => {
      const cls = h.score >= 80 ? 'good' : h.score >= 50 ? 'ok' : 'bad';
      return `<tr>
        <td><strong>${h.userName}</strong></td>
        <td>${h.subject === 'math' ? '&#129518; Maths' : '&#128214; English'}</td>
        <td>${cap(h.topic)}</td>
        <td>Grade ${h.difficulty || h.grade || '?'}</td>
        <td><span class="aai-score ${cls}">${h.score}%</span></td>
        <td>${h.correct || '?'}/20</td>
        <td>&#129689; ${h.coins || 0}</td>
        <td style="font-size:12px;white-space:nowrap">${new Date(h.date).toLocaleDateString()}</td>
      </tr>`;
    }).join('')}</tbody>
  </table>`;
}

function changeAdminPassword() {
  const curPwd  = document.getElementById('admin-cur-pwd').value;
  const newPwd  = document.getElementById('admin-new-pwd').value;
  const confPwd = document.getElementById('admin-confirm-pwd').value;
  const msgEl   = document.getElementById('admin-pwd-msg');
  const creds   = getAdminCreds();

  function pwdMsg(txt, ok) {
    msgEl.textContent   = txt;
    msgEl.style.color   = ok ? '#58CC02' : '#ff4b4b';
    msgEl.style.display = 'block';
  }

  if (curPwd !== creds.password) return pwdMsg('Current password is incorrect.', false);
  if (newPwd.length < 4)         return pwdMsg('New password must be at least 4 characters.', false);
  if (newPwd !== confPwd)        return pwdMsg('Passwords do not match.', false);

  saveAdminCreds({ username: creds.username, password: newPwd });
  document.getElementById('admin-cur-pwd').value   = '';
  document.getElementById('admin-new-pwd').value   = '';
  document.getElementById('admin-confirm-pwd').value = '';
  pwdMsg('Password updated successfully!', true);
  showToast('Admin password updated!');
}

function adminResetLeaderboard() {
  showModal('&#9888;', 'Reset Leaderboard?',
    'This will set ALL user points to 0. Quiz history is preserved. This cannot be undone.',
    () => {
      const all = getAllUsers();
      Object.keys(all).forEach(k => { all[k].points = 0; });
      saveAllUsers(all);
      showToast('Leaderboard reset — all points set to 0.');
      renderAdminOverview();
    });
}

function adminDeleteAllUsers() {
  showModal('&#128680;', 'Delete ALL Users?',
    'This permanently removes every registered account. It absolutely cannot be undone.',
    () => {
      saveAllUsers({});
      clearSession();
      renderAdminUsers();
      renderAdminOverview();
      showToast('All user accounts deleted.');
    });
}

// ─── ADMIN: QUESTION MANAGER ───────────────────
const Q_PAGE_SIZE = 25;
let _qPage = 1;          // current page in admin question list

/**
 * Renders the Questions tab content (filters + empty list placeholder).
 * The actual list is populated by _rebuildQuestionList().
 */
function renderAdminQuestions() {
  const container = document.getElementById('admin-tab-questions');
  if (!container) return;

  const cfg = getSubjectConfig();

  // Build subject options for filter
  const subjectOpts = Object.entries(cfg).map(([k, v]) =>
    `<option value="${k}">${v.icon} ${v.label}</option>`
  ).join('');

  container.innerHTML = `
    <div class="admin-page-header">
      <div>
        <h1>&#10067; Question Manager</h1>
        <span class="admin-badge" id="admin-q-count">Loading…</span>
      </div>
      <button class="btn btn-primary" onclick="openQuestionModal(null)">
        <i class="fas fa-plus"></i> Add Question
      </button>
    </div>

    <div class="admin-card admin-q-filters">
      <div class="aq-filter-row">
        <div class="aq-filter-group">
          <label>Subject</label>
          <select id="aq-f-subject" onchange="aqSubjectChanged()">
            <option value="">All Subjects</option>
            ${subjectOpts}
          </select>
        </div>
        <div class="aq-filter-group">
          <label>Grade</label>
          <select id="aq-f-grade" onchange="filterAdminQuestions()">
            <option value="">All Grades</option>
            ${[1,2,3,4,5,6,7,8].map(g=>`<option value="${g}">Grade ${g}</option>`).join('')}
          </select>
        </div>
        <div class="aq-filter-group">
          <label>Topic</label>
          <select id="aq-f-topic" onchange="filterAdminQuestions()">
            <option value="">All Topics</option>
          </select>
        </div>
        <div class="aq-filter-group">
          <label>Source</label>
          <select id="aq-f-source" onchange="filterAdminQuestions()">
            <option value="">All</option>
            <option value="custom">Custom only</option>
            <option value="builtin">Built-in only</option>
          </select>
        </div>
        <div class="aq-filter-group aq-search-group">
          <label>Search</label>
          <div class="aq-search-wrap">
            <i class="fas fa-search"></i>
            <input type="text" id="aq-search" placeholder="Search question text…" oninput="filterAdminQuestions()">
          </div>
        </div>
      </div>
    </div>

    <div id="aq-list-container"></div>
  `;

  _rebuildQuestionList();
}

/** Called when the subject filter changes — repopulates the topic dropdown then re-filters. */
function aqSubjectChanged() {
  const subj = document.getElementById('aq-f-subject').value;
  const topicSel = document.getElementById('aq-f-topic');
  _syncTopicSelectEl(subj, topicSel, '');
  filterAdminQuestions();
}

/** Repopulates a <select> element with topics for the given subject.
 *  Pass subject='' to show all topics across all subjects.  */
function _syncTopicSelectEl(subj, selectEl, selectedTopic) {
  const cfg = getSubjectConfig();
  let options = '<option value="">All Topics</option>';
  if (subj && cfg[subj]) {
    options += Object.entries(cfg[subj].topics).map(([k, v]) =>
      `<option value="${k}" ${k === selectedTopic ? 'selected' : ''}>${v}</option>`
    ).join('');
  } else {
    // Show all topics across all subjects
    Object.entries(cfg).forEach(([sk, sv]) => {
      options += `<optgroup label="${sv.icon} ${sv.label}">`;
      options += Object.entries(sv.topics).map(([k, v]) =>
        `<option value="${k}" ${k === selectedTopic ? 'selected' : ''}>${v}</option>`
      ).join('');
      options += '</optgroup>';
    });
  }
  selectEl.innerHTML = options;
}

/** Resets to page 1 and rebuilds the question list. */
function filterAdminQuestions() {
  _qPage = 1;
  _rebuildQuestionList();
}

function adminQPage(dir) {
  _qPage += dir;
  _rebuildQuestionList();
}

/** Core render: merges built-in + custom questions, applies filters, paginates, renders cards. */
function _rebuildQuestionList() {
  const container = document.getElementById('aq-list-container');
  if (!container) return;

  const fSubj   = (document.getElementById('aq-f-subject')?.value || '').trim();
  const fGrade  = (document.getElementById('aq-f-grade')?.value   || '').trim();
  const fTopic  = (document.getElementById('aq-f-topic')?.value   || '').trim();
  const fSource = (document.getElementById('aq-f-source')?.value  || '').trim();
  const fSearch = (document.getElementById('aq-search')?.value    || '').toLowerCase().trim();

  const cfg = getSubjectConfig();

  // ── Collect built-in English questions ──────────────────────────
  const BUILTIN_BANKS = {
    english: { 1: ENG_G1, 2: ENG_G2, 3: ENG_G3, 4: ENG_G4,
               5: ENG_G5, 6: ENG_G6, 7: ENG_G7, 8: ENG_G8 }
  };

  let builtinItems = [];
  // Only show built-in for subjects without dynamic generators
  Object.entries(cfg).forEach(([subj, scfg]) => {
    if (scfg.hasDynamicGenerator) return;  // math: skip built-in (procedural)
    if (fSubj && fSubj !== subj) return;
    const grades = fGrade ? [parseInt(fGrade)] : [1,2,3,4,5,6,7,8];
    grades.forEach(g => {
      const bank = (BUILTIN_BANKS[subj] || {})[g] || [];
      bank.forEach((bq, idx) => {
        builtinItems.push({
          _source: 'builtin',
          _subj: subj,
          _grade: String(g),
          _idx: idx,
          subject: subj,
          grade: String(g),
          topic: _guessBuiltinTopic(bq),
          question: bq.q,
          answer: bq.a,
          options: bq.opts,
          context: bq.ctx || null
        });
      });
    });
  });

  // ── Collect custom questions ─────────────────────────────────────
  let customItems = getCustomQuestions().map(cq => ({ ...cq, _source: 'custom' }));

  // ── Merge and filter ─────────────────────────────────────────────
  let all = [];
  if (fSource !== 'builtin') all = all.concat(customItems);
  if (fSource !== 'custom')  all = all.concat(builtinItems);

  if (fSubj)   all = all.filter(q => q.subject === fSubj);
  if (fGrade)  all = all.filter(q => String(q.grade) === fGrade);
  if (fTopic)  all = all.filter(q => q.topic === fTopic);
  if (fSearch) all = all.filter(q =>
    (q.question||'').toLowerCase().includes(fSearch) ||
    (q.answer  ||'').toLowerCase().includes(fSearch) ||
    (q.context ||'').toLowerCase().includes(fSearch)
  );

  // Custom first, then built-in; custom sorted newest first
  customItems  = all.filter(q => q._source === 'custom').sort((a,b) => (b.createdAt||0)-(a.createdAt||0));
  builtinItems = all.filter(q => q._source === 'builtin');
  all = [...customItems, ...builtinItems];

  // ── Update count badge ───────────────────────────────────────────
  const totalCustom  = getCustomQuestions().length;
  const totalBuiltin = builtinItems.length + (fSource === 'custom' ? 0 : 0);
  const countEl = document.getElementById('admin-q-count');
  if (countEl) {
    const bc = Object.values(BUILTIN_BANKS).reduce((s, grades) =>
      s + Object.values(grades).reduce((gs, bank) => gs + bank.length, 0), 0);
    countEl.textContent = `${bc} built-in • ${totalCustom} custom`;
  }

  if (!all.length) {
    container.innerHTML = `<div class="admin-card"><p class="empty-state" style="padding:24px;text-align:center">
      No questions match the selected filters.<br>
      <button class="btn btn-primary" style="margin-top:12px" onclick="openQuestionModal(null)">
        <i class="fas fa-plus"></i> Add Question
      </button>
    </p></div>`;
    return;
  }

  // ── Pagination ───────────────────────────────────────────────────
  const totalPages = Math.ceil(all.length / Q_PAGE_SIZE);
  _qPage = Math.max(1, Math.min(_qPage, totalPages));
  const paged = all.slice((_qPage - 1) * Q_PAGE_SIZE, _qPage * Q_PAGE_SIZE);

  const topicLabel = (subj, topic) => {
    const t = (cfg[subj]||{}).topics || {};
    return t[topic] || cap(topic) || '—';
  };

  const cards = paged.map(q => {
    const isCustom  = q._source === 'custom';
    const gradeStr  = `Grade ${q.grade}`;
    const topicStr  = topicLabel(q.subject, q.topic);
    const subjStr   = (cfg[q.subject]||{}).label || cap(q.subject);
    const ctx       = q.context ? `<div class="admin-q-ctx">📄 ${q.context.slice(0,80)}${q.context.length>80?'…':''}</div>` : '';

    if (isCustom) {
      return `<div class="admin-q-item custom">
        <div class="admin-q-header">
          <span class="admin-q-badge custom">CUSTOM</span>
          <span class="admin-q-meta">${gradeStr} · ${subjStr} · ${topicStr}</span>
        </div>
        ${ctx}
        <div class="admin-q-body">${q.question}</div>
        <div class="admin-q-answer">✓ ${q.answer}</div>
        <div class="admin-q-actions">
          <button class="btn btn-sm btn-outline" onclick="editAdminQuestion('${q.id}')">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="btn btn-sm admin-danger-btn" onclick="deleteAdminQuestion('${q.id}')">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
      </div>`;
    } else {
      const enc = JSON.stringify({subj:q._subj, grade:q._grade, idx:q._idx}).replace(/"/g,'&quot;');
      return `<div class="admin-q-item builtin">
        <div class="admin-q-header">
          <span class="admin-q-badge builtin">BUILT-IN</span>
          <span class="admin-q-meta">${gradeStr} · ${subjStr} · ${topicStr}</span>
        </div>
        ${ctx}
        <div class="admin-q-body">${q.question}</div>
        <div class="admin-q-answer">✓ ${q.answer}</div>
        <div class="admin-q-actions">
          <button class="btn btn-sm btn-outline" onclick="duplicateBuiltinQuestion('${q._subj}','${q._grade}',${q._idx})">
            <i class="fas fa-copy"></i> Duplicate &amp; Edit
          </button>
        </div>
      </div>`;
    }
  }).join('');

  const pager = totalPages > 1 ? `
    <div class="admin-q-pagination">
      <button class="btn btn-sm btn-outline" onclick="adminQPage(-1)" ${_qPage <= 1 ? 'disabled' : ''}>
        <i class="fas fa-chevron-left"></i> Prev
      </button>
      <span>Page ${_qPage} of ${totalPages} &nbsp;·&nbsp; ${all.length} question${all.length!==1?'s':''}</span>
      <button class="btn btn-sm btn-outline" onclick="adminQPage(1)" ${_qPage >= totalPages ? 'disabled' : ''}>
        Next <i class="fas fa-chevron-right"></i>
      </button>
    </div>` : `<p class="admin-q-total">${all.length} question${all.length!==1?'s':''} found</p>`;

  container.innerHTML = `<div class="admin-q-list">${cards}</div>${pager}`;
}

/** Heuristic: guess the topic of a built-in question based on its text. */
function _guessBuiltinTopic(bq) {
  const q = (bq.q || '').toLowerCase();
  const c = (bq.ctx || '').toLowerCase();
  if (bq.ctx || q.includes('spelled'))         return 'spelling';
  if (q.includes('mean?') || q.includes('synonym') || q.includes('antonym') || q.includes('opposite')) return 'vocabulary';
  return 'grammar';
}

// ── Question Modal ──────────────────────────────

let _qModalEditId = null;   // null = adding new, string = editing custom question

function openQuestionModal(id) {
  _qModalEditId = id;
  const modal = document.getElementById('question-modal');
  if (!modal) return;

  const cfg  = getSubjectConfig();
  const isEdit = !!id;

  // Prefill values
  let prefill = { subject:'english', grade:'3', topic:'spelling',
                  context:'', question:'', answer:'', options:['','','',''] };
  if (isEdit) {
    const cq = getCustomQuestions().find(q => q.id === id);
    if (cq) {
      prefill = {
        subject:  cq.subject,
        grade:    cq.grade,
        topic:    cq.topic,
        context:  cq.context || '',
        question: cq.question,
        answer:   cq.answer,
        options:  [...cq.options]
      };
    }
  }

  // Ensure 4 options
  while (prefill.options.length < 4) prefill.options.push('');
  const opts = prefill.options.slice(0,4);

  // Build subject options
  const subjOpts = Object.entries(cfg).map(([k,v]) =>
    `<option value="${k}" ${k===prefill.subject?'selected':''}>${v.icon} ${v.label}</option>`
  ).join('');

  // Build topic options for prefilled subject
  const topicHtml = Object.entries((cfg[prefill.subject]||{}).topics||{}).map(([k,v]) =>
    `<option value="${k}" ${k===prefill.topic?'selected':''}>${v}</option>`
  ).join('');

  // Build option rows (radio marks correct answer) — with letter badge A/B/C/D
  const optRows = opts.map((o, i) => {
    const isCorrect = (o === prefill.answer) || (i===0 && !prefill.answer);
    const letter = String.fromCharCode(65 + i);
    return `<div class="q-option-row">
      <input type="radio" name="q-correct" id="q-opt-radio-${i}" value="${i}" ${isCorrect?'checked':''}>
      <span class="q-opt-letter">${letter}</span>
      <input type="text" class="q-opt-input auth-input" id="q-opt-${i}"
        value="${o.replace(/"/g,'&quot;')}" placeholder="Option ${letter}">
    </div>`;
  }).join('');

  document.getElementById('question-modal-inner').innerHTML = `
    <div class="q-modal-header">
      <div>
        <div class="q-modal-header-title">${isEdit ? '✏️ Edit Question' : '➕ Add Question'}</div>
        <div class="q-modal-header-sub">${isEdit ? 'Update the question details below' : 'Add a new question to the quiz bank'}</div>
      </div>
      <button class="modal-close-x" onclick="closeQuestionModal()">✕</button>
    </div>
    <div class="q-modal-body">
      <div class="q-modal-row">
        <div class="q-modal-field">
          <label>Subject <span class="q-required">*</span></label>
          <select id="qm-subject" onchange="qmSubjectChanged()">
            ${subjOpts}
          </select>
        </div>
        <div class="q-modal-field">
          <label>Grade <span class="q-required">*</span></label>
          <select id="qm-grade">
            ${[1,2,3,4,5,6,7,8].map(g=>`<option value="${g}" ${String(g)===String(prefill.grade)?'selected':''}>Grade ${g}</option>`).join('')}
          </select>
        </div>
        <div class="q-modal-field">
          <label>Topic <span class="q-required">*</span></label>
          <select id="qm-topic">
            ${topicHtml}
          </select>
        </div>
      </div>
      <div class="q-modal-field">
        <label>Context <span class="q-optional">(optional — passage shown above question)</span></label>
        <input type="text" id="qm-context" class="auth-input"
          placeholder='e.g. "My ___ is coming to visit."'
          value="${prefill.context.replace(/"/g,'&quot;')}">
      </div>
      <div class="q-modal-field">
        <label>Question <span class="q-required">*</span></label>
        <input type="text" id="qm-question" class="auth-input"
          placeholder='e.g. "Which word is spelled correctly?"'
          value="${prefill.question.replace(/"/g,'&quot;')}">
      </div>
      <div class="q-modal-field">
        <div class="q-options-label">
          <i class="fas fa-list-ul"></i>
          Options &amp; Answer
          <span class="q-optional">(● = correct answer)</span>
        </div>
        <div id="qm-options">${optRows}</div>
      </div>
      <div id="qm-error" class="q-modal-error" style="display:none"></div>
    </div>
    <div class="q-modal-actions">
      <button class="btn btn-ghost" onclick="closeQuestionModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveQuestionFromModal()">
        <i class="fas fa-save"></i> Save Question
      </button>
    </div>
  `;

  modal.style.display = 'flex';
}

function closeQuestionModal() {
  const modal = document.getElementById('question-modal');
  if (modal) modal.style.display = 'none';
  _qModalEditId = null;
}

/** When subject changes inside the modal, repopulate the topic dropdown. */
function qmSubjectChanged() {
  const subj = document.getElementById('qm-subject').value;
  const topicSel = document.getElementById('qm-topic');
  if (!topicSel) return;
  const cfg = getSubjectConfig();
  topicSel.innerHTML = Object.entries((cfg[subj]||{}).topics||{}).map(([k,v]) =>
    `<option value="${k}">${v}</option>`
  ).join('');
}

function saveQuestionFromModal() {
  const errEl = document.getElementById('qm-error');
  function showErr(msg) {
    errEl.textContent = msg;
    errEl.style.display = 'flex';
  }
  errEl.style.display = 'none';

  const subject  = document.getElementById('qm-subject').value.trim();
  const grade    = document.getElementById('qm-grade').value.trim();
  const topic    = document.getElementById('qm-topic').value.trim();
  const context  = document.getElementById('qm-context').value.trim();
  const question = document.getElementById('qm-question').value.trim();

  const options  = [0,1,2,3].map(i => (document.getElementById('q-opt-'+i)?.value||'').trim());
  const correctRadio = document.querySelector('input[name="q-correct"]:checked');
  const correctIdx   = correctRadio ? parseInt(correctRadio.value) : -1;
  const answer       = correctIdx >= 0 ? options[correctIdx] : '';

  // Validate
  if (!question) return showErr('Question text is required.');
  if (options.some(o => !o)) return showErr('All four options must be filled in.');
  if (new Set(options).size < 4) return showErr('All four options must be different.');
  if (correctIdx < 0)  return showErr('Please select the correct answer (click the radio button next to it).');
  if (!answer)         return showErr('The correct answer option cannot be blank.');

  const all = getCustomQuestions();
  const now = Date.now();

  if (_qModalEditId) {
    // Update existing
    const idx = all.findIndex(q => q.id === _qModalEditId);
    if (idx >= 0) {
      all[idx] = { ...all[idx], subject, grade, topic, context: context || null,
                   question, answer, options, updatedAt: now };
    }
    showToast('Question updated!');
  } else {
    // Add new
    const id = 'cq_' + now + '_' + Math.random().toString(36).slice(2,7);
    all.push({ id, subject, grade, topic, context: context || null,
               question, answer, options, createdAt: now });
    showToast('Question added!');
  }

  saveCustomQuestions(all);
  closeQuestionModal();
  _qPage = 1;
  _rebuildQuestionList();
}

function editAdminQuestion(id) {
  openQuestionModal(id);
}

function deleteAdminQuestion(id) {
  const all = getCustomQuestions();
  const q   = all.find(cq => cq.id === id);
  if (!q) return;
  showModal('🗑️', 'Delete Question?',
    `Delete: "${q.question.slice(0, 80)}${q.question.length > 80 ? '…' : ''}"? This cannot be undone.`,
    () => {
      saveCustomQuestions(getCustomQuestions().filter(cq => cq.id !== id));
      showToast('Question deleted.');
      _rebuildQuestionList();
    });
}

function duplicateBuiltinQuestion(subj, grade, qIdx) {
  const BUILTIN_BANKS = {
    english: { 1: ENG_G1, 2: ENG_G2, 3: ENG_G3, 4: ENG_G4,
               5: ENG_G5, 6: ENG_G6, 7: ENG_G7, 8: ENG_G8 }
  };
  const bank = (BUILTIN_BANKS[subj] || {})[parseInt(grade)] || [];
  const bq   = bank[qIdx];
  if (!bq) return;

  // Save a copy as a custom question, then open it in the edit modal
  const now = Date.now();
  const id  = 'cq_' + now + '_' + Math.random().toString(36).slice(2,7);
  const copy = {
    id,
    subject:   subj,
    grade:     String(grade),
    topic:     _guessBuiltinTopic(bq),
    context:   bq.ctx || null,
    question:  bq.q,
    answer:    bq.a,
    options:   [...bq.opts],
    createdAt: now
  };
  const all = getCustomQuestions();
  all.push(copy);
  saveCustomQuestions(all);

  openQuestionModal(id);  // open edit modal prefilled with the copy
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
