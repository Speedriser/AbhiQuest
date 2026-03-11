/* =============================================
   AbhiQuest - Main Application Logic
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
    { id:'pu_hint',   icon:'💡', name:'Hint Pack',  price:75,   type:'powerup', desc:'Show a hint on 5 hard questions!' },
    { id:'pu_shield', icon:'🛡️', name:'Shield',    price:100,  type:'powerup', desc:'Wrong answers don\'t lose streak!' },
  ]
};

// ─── ACHIEVEMENTS ─────────────────────────────
const ACHIEVEMENTS_LIST = [
  { id:'first_quiz',   icon:'🎓', name:'First Steps',    desc:'Complete your first quiz', check: s => s.quizCount >= 1 },
  { id:'quiz_5',       icon:'📚', name:'Bookworm',        desc:'Complete 5 quizzes',       check: s => s.quizCount >= 5 },
  { id:'quiz_20',      icon:'🎯', name:'Dedicated',       desc:'Complete 20 quizzes',      check: s => s.quizCount >= 20 },
  { id:'quiz_50',      icon:'🏆', name:'Champion',        desc:'Complete 50 quizzes',      check: s => s.quizCount >= 50 },
  { id:'perfect',      icon:'⭐', name:'Perfectionist',   desc:'Get a perfect 20/20 score', check: s => s.perfectCount >= 1 },
  { id:'perfect_5',    icon:'🌟', name:'Star Player',     desc:'Get 5 perfect scores',     check: s => s.perfectCount >= 5 },
  { id:'streak_3',     icon:'🔥', name:'On Fire',         desc:'3 day learning streak',    check: s => s.streak >= 3 },
  { id:'streak_7',     icon:'🌈', name:'Week Warrior',    desc:'7 day learning streak',    check: s => s.streak >= 7 },
  { id:'coins_500',    icon:'🪙', name:'Coin Collector',  desc:'Earn 500 coins total',     check: s => s.totalCoinsEarned >= 500 },
  { id:'coins_2000',   icon:'💰', name:'Rich Scholar',    desc:'Earn 2000 coins total',    check: s => s.totalCoinsEarned >= 2000 },
  { id:'maths_master', icon:'🧮', name:'Maths Master',    desc:'Complete 10 maths quizzes', check: s => s.mathQuizCount >= 10 },
  { id:'word_wizard',  icon:'📖', name:'Word Wizard',     desc:'Complete 10 English quizzes', check: s => s.engQuizCount >= 10 },
];

// ─── DEFAULT STATE ─────────────────────────────
function defaultState() {
  return {
    name: 'Player',
    email: '',
    avatar: '🐶',
    avatarId: 'av_dog',
    coins: 50,              // start with 50 coins
    totalPoints: 0,
    weeklyPoints: 0,
    quizCount: 0,
    mathQuizCount: 0,
    engQuizCount: 0,
    perfectCount: 0,
    bestScore: 0,
    streak: 0,
    lastPlayDate: null,
    inventory: ['av_dog','th_default'],
    equippedTheme: 'th_default',
    activePowerup: null,
    totalCoinsEarned: 50,
    achievements: [],
    isGuest: false,
    weekStart: getWeekStart()
  };
}

// ─── APP STATE ────────────────────────────────
let AppState = {
  user: defaultState(),
  currentScreen: 'landing',
  currentSubject: null,
  currentTopic: null,
  currentDifficulty: null,
  quiz: null,
  leaderboardTab: 'all-time',
  shopTab: 'avatars',
  timerInterval: null
};

// ─── STORAGE ──────────────────────────────────
function saveUser() {
  localStorage.setItem('abhiquest_user', JSON.stringify(AppState.user));
}

function loadUser() {
  try {
    const raw = localStorage.getItem('abhiquest_user');
    if (raw) {
      const u = JSON.parse(raw);
      AppState.user = { ...defaultState(), ...u };
    }
  } catch (e) {}
}

function saveLeaderboard(entry) {
  try {
    const lb = getLeaderboardData();
    const idx = lb.findIndex(e => e.id === entry.id);
    if (idx >= 0) lb[idx] = entry;
    else lb.push(entry);
    localStorage.setItem('abhiquest_leaderboard', JSON.stringify(lb));
  } catch (e) {}
}

function getLeaderboardData() {
  try {
    return JSON.parse(localStorage.getItem('abhiquest_leaderboard') || '[]');
  } catch (e) { return []; }
}

// ─── HELPERS ──────────────────────────────────
function getWeekStart() {
  const d = new Date();
  d.setHours(0,0,0,0);
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString();
}

function updateStreak() {
  const today = new Date().toDateString();
  const last = AppState.user.lastPlayDate;
  if (!last) {
    AppState.user.streak = 1;
  } else {
    const lastDate = new Date(last).toDateString();
    const diff = (new Date(today) - new Date(lastDate)) / 86400000;
    if (diff === 0) { /* same day, no change */ }
    else if (diff === 1) { AppState.user.streak++; }
    else { AppState.user.streak = 1; }
  }
  AppState.user.lastPlayDate = new Date().toISOString();
}

function getRank(points) {
  if (points >= 5000) return '👑 Grand Master';
  if (points >= 2000) return '💎 Expert';
  if (points >= 1000) return '🥇 Advanced';
  if (points >= 500)  return '🥈 Intermediate';
  if (points >= 200)  return '🥉 Learner';
  return '🎓 Beginner';
}

function getGrade(score) {
  if (score === 100) return { letter: 'A+', label: 'Perfect!', class: 'grade-a' };
  if (score >= 90)   return { letter: 'A',  label: 'Excellent!', class: 'grade-a' };
  if (score >= 80)   return { letter: 'B',  label: 'Great job!', class: 'grade-b' };
  if (score >= 70)   return { letter: 'C',  label: 'Good work!', class: 'grade-c' };
  if (score >= 60)   return { letter: 'D',  label: 'Keep going!', class: 'grade-d' };
  return { letter: 'F', label: 'Try again!', class: 'grade-d' };
}

function calcCoins(correct, total, hasPowerup) {
  const baseCoins = correct * 10;
  const bonusCoins = correct === total ? 50 : correct >= total * 0.8 ? 25 : 0;
  const streakBonus = AppState.quiz.maxStreak >= 5 ? 20 : AppState.quiz.maxStreak >= 3 ? 10 : 0;
  return Math.floor((baseCoins + bonusCoins + streakBonus) * (hasPowerup ? 2 : 1));
}

// ─── SCREEN NAVIGATION ────────────────────────
function showScreen(screenId) {
  const current = document.querySelector('.screen.active');
  if (current) {
    current.classList.remove('active');
    current.classList.add('slide-out');
    setTimeout(() => current.classList.remove('slide-out'), 300);
  }
  const next = document.getElementById('screen-' + screenId);
  if (!next) return;
  next.classList.add('active');
  AppState.currentScreen = screenId;

  // Screen-specific init
  if (screenId === 'home') updateHomeScreen();
  if (screenId === 'shop') renderShop();
  if (screenId === 'leaderboard') renderLeaderboard();
  if (screenId === 'profile') renderProfile();
}

// ─── AUTH FUNCTIONS ───────────────────────────
function showAuth(mode) {
  showScreen('auth');
  toggleAuthMode(mode);
}

function toggleAuthMode(mode) {
  document.getElementById('auth-login').style.display    = mode === 'login'    ? 'block' : 'none';
  document.getElementById('auth-register').style.display = mode === 'register' ? 'block' : 'none';
  document.getElementById('auth-error').style.display = 'none';
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-password').value;

  // Try loading from localStorage by email
  const allUsers = getAllUsers();
  const found = allUsers.find(u => u.email === email);
  if (!found) { showAuthError('No account found with this email.'); return; }
  if (found.password !== hashPass(pass)) { showAuthError('Incorrect password.'); return; }

  AppState.user = { ...defaultState(), ...found };
  AppState.user.password = undefined;
  delete AppState.user.password;
  saveUser();
  postLogin();
}

function handleRegister(e) {
  e.preventDefault();
  const name  = document.getElementById('register-name').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const pass  = document.getElementById('register-password').value;

  const allUsers = getAllUsers();
  if (allUsers.find(u => u.email === email)) { showAuthError('An account with this email already exists.'); return; }

  const newUser = {
    ...defaultState(),
    id: 'u_' + Date.now(),
    name,
    email,
    isGuest: false
  };

  // Save to all-users store
  allUsers.push({ ...newUser, password: hashPass(pass) });
  localStorage.setItem('abhiquest_all_users', JSON.stringify(allUsers));

  AppState.user = newUser;
  saveUser();
  postLogin();
}

function getAllUsers() {
  try { return JSON.parse(localStorage.getItem('abhiquest_all_users') || '[]'); } catch(e) { return []; }
}

function hashPass(pass) {
  // Simple hash for demo (not for production)
  let h = 0;
  for (let i = 0; i < pass.length; i++) h = (Math.imul(31, h) + pass.charCodeAt(i)) | 0;
  return String(h);
}

function showAuthError(msg) {
  const el = document.getElementById('auth-error');
  el.textContent = '⚠️ ' + msg;
  el.style.display = 'block';
}

function playAsGuest() {
  AppState.user = { ...defaultState(), id: 'guest_' + Date.now(), name: 'Guest', isGuest: true };
  saveUser();
  postLogin();
}

function postLogin() {
  updateStreak();
  applyTheme();
  showScreen('home');
  showToast('Welcome back, ' + AppState.user.name + '! 👋', 'success');
}

function handleLogout() {
  saveUser();
  AppState.user = defaultState();
  showScreen('landing');
  showToast('See you next time! 👋');
}

// ─── HOME SCREEN ──────────────────────────────
function updateHomeScreen() {
  const u = AppState.user;
  document.getElementById('home-avatar').textContent   = u.avatar;
  document.getElementById('home-username').textContent = u.name;
  document.getElementById('home-coins').textContent    = u.coins;
  document.getElementById('nav-streak').textContent    = u.streak;

  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  document.getElementById('home-greeting-text').textContent = greet + ', ' + u.name.split(' ')[0] + '! 🎯';

  document.getElementById('stat-total-points').textContent = u.totalPoints;
  document.getElementById('stat-quizzes').textContent      = u.quizCount;
  document.getElementById('stat-best').textContent         = u.bestScore + '%';

  const mathPct = Math.min(100, u.mathQuizCount * 5);
  const engPct  = Math.min(100, u.engQuizCount * 5);
  document.getElementById('math-progress-bar').style.width  = mathPct + '%';
  document.getElementById('english-progress-bar').style.width = engPct + '%';
  document.getElementById('math-progress-text').textContent  = u.mathQuizCount + ' quizzes';
  document.getElementById('english-progress-text').textContent = u.engQuizCount + ' quizzes';
}

// ─── QUIZ SETUP ───────────────────────────────
function showQuizSetup(subject) {
  AppState.currentSubject = subject;
  AppState.currentTopic = null;
  AppState.currentDifficulty = null;
  document.getElementById('setup-title').textContent = subject === 'math' ? '🧮 Maths Quiz' : '📖 English Quiz';
  document.getElementById('math-setup').style.display    = subject === 'math'    ? 'block' : 'none';
  document.getElementById('english-setup').style.display = subject === 'english' ? 'block' : 'none';

  document.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
  document.querySelectorAll('.difficulty-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('start-quiz-btn').disabled = true;

  showScreen('quiz-setup');
}

function selectTopic(topic, el) {
  document.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  AppState.currentTopic = topic;
  checkSetupReady();
}

function selectDifficulty(diff, el) {
  document.querySelectorAll('.difficulty-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  AppState.currentDifficulty = diff;
  checkSetupReady();
}

function checkSetupReady() {
  const ready = AppState.currentTopic && AppState.currentDifficulty;
  document.getElementById('start-quiz-btn').disabled = !ready;
}

// ─── QUIZ ENGINE ──────────────────────────────
function startQuiz() {
  const { currentSubject: subj, currentTopic: topic, currentDifficulty: diff } = AppState;
  const questions = buildQuiz(subj, topic, diff, 20);

  AppState.quiz = {
    questions,
    currentIndex: 0,
    correct: 0,
    wrong: 0,
    coinsEarned: 0,
    currentStreak: 0,
    maxStreak: 0,
    answered: false,
    hasPowerup: AppState.user.activePowerup === 'pu_2x'
  };

  showScreen('quiz');
  renderQuestion();
}

function renderQuestion() {
  const q = AppState.quiz;
  if (q.currentIndex >= q.questions.length) { finishQuiz(); return; }

  const current = q.questions[q.currentIndex];
  const num = q.currentIndex + 1;

  // Header
  const pct = (num - 1) / q.questions.length * 100;
  document.getElementById('quiz-progress-fill').style.width = pct + '%';
  document.getElementById('quiz-q-count').textContent = num + ' / ' + q.questions.length;
  document.getElementById('quiz-coins').textContent = q.coinsEarned;

  // Streak badge
  const badge = document.getElementById('streak-badge');
  if (q.currentStreak >= 3) {
    badge.style.display = 'block';
    document.getElementById('quiz-streak').textContent = q.currentStreak;
  } else {
    badge.style.display = 'none';
  }

  // Question
  document.getElementById('question-subject-tag').textContent = current.subject === 'math' ? '🧮 Maths' : '📖 English';
  document.getElementById('question-number').textContent = 'Q' + num;
  document.getElementById('question-text').textContent = current.question;

  const ctxEl = document.getElementById('question-context');
  if (current.context) {
    ctxEl.textContent = current.context;
    ctxEl.style.display = 'block';
  } else {
    ctxEl.style.display = 'none';
  }

  // Reset card
  const card = document.getElementById('question-card');
  card.classList.remove('correct-flash', 'wrong-flash');

  // Answer buttons
  const grid = document.getElementById('answer-grid');
  grid.innerHTML = '';
  current.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.textContent = opt;
    btn.onclick = () => checkAnswer(opt, btn, current);
    grid.appendChild(btn);
  });

  // Feedback
  document.getElementById('feedback-panel').style.display = 'none';
  q.answered = false;

  // Timer
  resetTimer();
}

function checkAnswer(selected, btn, question) {
  if (AppState.quiz.answered) return;
  AppState.quiz.answered = true;

  clearInterval(AppState.timerInterval);

  const correct = selected === question.answer;
  const card = document.getElementById('question-card');

  // Disable all buttons
  document.querySelectorAll('.answer-btn').forEach(b => {
    b.disabled = true;
    if (b.textContent === question.answer) b.classList.add(correct ? 'correct' : 'reveal-correct');
  });

  if (correct) {
    btn.classList.add('correct');
    card.classList.add('correct-flash');
    AppState.quiz.correct++;
    AppState.quiz.currentStreak++;
    if (AppState.quiz.currentStreak > AppState.quiz.maxStreak) AppState.quiz.maxStreak = AppState.quiz.currentStreak;

    const coins = 10 + (AppState.quiz.currentStreak >= 3 ? 5 : 0);
    AppState.quiz.coinsEarned += coins;
    document.getElementById('quiz-coins').textContent = AppState.quiz.coinsEarned;

    showFeedback(true, question.explanation);
  } else {
    btn.classList.add('wrong');
    card.classList.add('wrong-flash');
    AppState.quiz.wrong++;
    AppState.quiz.currentStreak = 0;
    showFeedback(false, question.explanation, question.answer);
  }
}

function showFeedback(correct, explanation, correctAnswer) {
  const panel = document.getElementById('feedback-panel');
  const icon  = document.getElementById('feedback-icon');
  const msg   = document.getElementById('feedback-message');

  if (correct) {
    icon.textContent = ['✅','🎉','⭐','💪','🏆'][Math.floor(Math.random()*5)];
    msg.innerHTML = '<strong style="color:var(--green)">Correct!</strong>' + (explanation ? ' ' + explanation : '');
    msg.style.color = 'var(--green-dark)';
  } else {
    icon.textContent = ['❌','😅','🤔','💭','📚'][Math.floor(Math.random()*5)];
    msg.innerHTML = '<strong style="color:var(--red)">Not quite!</strong>' + (correctAnswer ? ' The answer is: <strong>' + correctAnswer + '</strong>' : '') + (explanation ? '. ' + explanation : '');
    msg.style.color = 'var(--dark-gray)';
  }

  panel.style.display = 'flex';
}

function nextQuestion() {
  AppState.quiz.currentIndex++;
  renderQuestion();
}

function quitQuiz() {
  if (confirm('Are you sure you want to quit? Your progress will be lost.')) {
    clearInterval(AppState.timerInterval);
    showScreen('home');
  }
}

function resetTimer() {
  clearInterval(AppState.timerInterval);
  const fill = document.getElementById('timer-fill');
  fill.style.transition = 'none';
  fill.style.width = '100%';
  setTimeout(() => {
    fill.style.transition = 'width 30s linear';
    fill.style.width = '0%';
  }, 50);

  let t = 30;
  AppState.timerInterval = setInterval(() => {
    t--;
    if (t <= 0) {
      clearInterval(AppState.timerInterval);
      if (!AppState.quiz.answered) {
        const card = document.getElementById('question-card');
        card.classList.add('wrong-flash');
        AppState.quiz.answered = true;
        AppState.quiz.wrong++;
        AppState.quiz.currentStreak = 0;
        // Reveal answer
        const current = AppState.quiz.questions[AppState.quiz.currentIndex];
        document.querySelectorAll('.answer-btn').forEach(b => {
          b.disabled = true;
          if (b.textContent === current.answer) b.classList.add('reveal-correct');
        });
        showFeedback(false, current.explanation, current.answer);
      }
    }
  }, 1000);
}

// ─── RESULTS ──────────────────────────────────
function finishQuiz() {
  clearInterval(AppState.timerInterval);
  const q = AppState.quiz;
  const u = AppState.user;
  const total = q.questions.length;
  const scorePct = Math.round((q.correct / total) * 100);
  const grade = getGrade(scorePct);

  // Apply powerup
  const coins = calcCoins(q.correct, total, q.hasPowerup);
  if (q.hasPowerup) u.activePowerup = null;

  // Update user stats
  u.coins += coins;
  u.totalCoinsEarned = (u.totalCoinsEarned || 0) + coins;
  u.totalPoints += q.correct * 5;
  u.weeklyPoints = (u.weeklyPoints || 0) + q.correct * 5;
  u.quizCount++;
  if (AppState.currentSubject === 'math') u.mathQuizCount = (u.mathQuizCount || 0) + 1;
  else u.engQuizCount = (u.engQuizCount || 0) + 1;
  if (scorePct === 100) u.perfectCount = (u.perfectCount || 0) + 1;
  if (scorePct > u.bestScore) u.bestScore = scorePct;
  updateStreak();
  checkAchievements();
  saveUser();
  saveLeaderboard({ id: u.id || 'guest', name: u.name, avatar: u.avatar, totalPoints: u.totalPoints, weeklyPoints: u.weeklyPoints });

  // Render results
  const gradeRing = document.getElementById('grade-ring');
  gradeRing.className = 'grade-ring ' + grade.class;
  document.getElementById('grade-letter').textContent   = grade.letter;
  document.getElementById('results-title').textContent  = grade.label;
  document.getElementById('result-correct').textContent = q.correct;
  document.getElementById('result-wrong').textContent   = q.wrong;
  document.getElementById('result-score').textContent   = scorePct + '%';
  document.getElementById('coins-earned').textContent   = coins;

  // Bonus badges
  const badgesEl = document.getElementById('bonus-badges');
  badgesEl.innerHTML = '';
  if (q.hasPowerup) badgesEl.innerHTML += '<div class="bonus-badge">⚡ Double XP Applied!</div>';
  if (scorePct === 100) badgesEl.innerHTML += '<div class="bonus-badge">🌟 Perfect Score!</div>';
  if (q.maxStreak >= 5) badgesEl.innerHTML += '<div class="bonus-badge">🔥 ' + q.maxStreak + ' Streak Bonus!</div>';

  showScreen('results');
  if (scorePct >= 80) launchConfetti();
}

function replayQuiz() {
  showQuizSetup(AppState.currentSubject);
}

// ─── SHOP ─────────────────────────────────────
function renderShop() {
  document.getElementById('shop-coins').textContent = AppState.user.coins;
  renderShopSection('avatars');
}

function switchShopTab(tab, el) {
  document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  ['avatars','themes','powerups'].forEach(t => {
    document.getElementById('shop-' + t).style.display = t === tab ? 'grid' : 'none';
  });
  AppState.shopTab = tab;
  renderShopSection(tab);
}

function renderShopSection(tab) {
  const el = document.getElementById('shop-' + tab);
  if (!el) return;
  const items = SHOP_CATALOG[tab];
  const u = AppState.user;

  el.innerHTML = items.map(item => {
    const owned    = u.inventory.includes(item.id);
    const equipped = item.type === 'avatar' ? u.avatarId === item.id : u.equippedTheme === item.id;
    const canAfford = u.coins >= item.price;
    const hasPowerup = item.type === 'powerup' && u.activePowerup === item.id;

    let badge = '', cls = '', priceHtml = '';

    if (equipped) { badge = '<span class="shop-item-badge badge-equipped">Equipped</span>'; cls = 'equipped'; }
    else if (hasPowerup) { badge = '<span class="shop-item-badge badge-owned">Active</span>'; cls = 'owned'; }
    else if (owned)  { badge = '<span class="shop-item-badge badge-owned">Owned</span>'; cls = 'owned'; }
    else if (item.price === 0) { badge = '<span class="shop-item-badge badge-free">Free</span>'; }
    else { cls = canAfford ? '' : 'cant-afford'; }

    if (!owned && !hasPowerup) {
      priceHtml = `<div class="shop-item-price">🪙 ${item.price}</div>`;
    }

    const desc = item.desc ? `<div style="font-size:11px;color:var(--mid-gray);text-align:center">${item.desc}</div>` : '';

    return `<div class="shop-item ${cls}" onclick="handleShopPurchase('${item.id}','${tab}')">
      <div class="shop-item-icon">${item.icon}</div>
      <div class="shop-item-name">${item.name}</div>
      ${desc}
      ${priceHtml}
      ${badge}
    </div>`;
  }).join('');
}

function handleShopPurchase(itemId, tab) {
  const item = SHOP_CATALOG[tab].find(i => i.id === itemId);
  if (!item) return;
  const u = AppState.user;
  const owned = u.inventory.includes(itemId);

  if (item.type === 'avatar') {
    if (owned) {
      // Equip
      u.avatar = item.icon;
      u.avatarId = itemId;
      saveUser();
      renderShopSection(tab);
      document.getElementById('shop-coins').textContent = u.coins;
      showToast(item.name + ' equipped! ' + item.icon, 'success');
    } else {
      openModal(item.icon, 'Buy ' + item.name + '?', `Costs 🪙 ${item.price} coins`, () => {
        if (u.coins < item.price) { showToast('Not enough coins! 😅', 'error'); return; }
        u.coins -= item.price;
        u.inventory.push(itemId);
        u.avatar = item.icon;
        u.avatarId = itemId;
        saveUser();
        renderShopSection(tab);
        document.getElementById('shop-coins').textContent = u.coins;
        showToast(item.name + ' bought & equipped! ' + item.icon, 'success');
      });
    }
  } else if (item.type === 'theme') {
    if (owned) {
      u.equippedTheme = itemId;
      applyTheme();
      saveUser();
      renderShopSection(tab);
      showToast(item.name + ' theme applied! ' + item.icon, 'success');
    } else {
      openModal(item.icon, 'Buy ' + item.name + ' Theme?', `Costs 🪙 ${item.price} coins`, () => {
        if (u.coins < item.price) { showToast('Not enough coins! 😅', 'error'); return; }
        u.coins -= item.price;
        u.inventory.push(itemId);
        u.equippedTheme = itemId;
        applyTheme();
        saveUser();
        renderShopSection(tab);
        document.getElementById('shop-coins').textContent = u.coins;
        showToast(item.name + ' theme unlocked! ' + item.icon, 'success');
      });
    }
  } else if (item.type === 'powerup') {
    if (u.activePowerup === itemId) { showToast('Already active! ⚡', 'info'); return; }
    openModal(item.icon, 'Buy ' + item.name + '?', item.desc + ` Costs 🪙 ${item.price} coins`, () => {
      if (u.coins < item.price) { showToast('Not enough coins! 😅', 'error'); return; }
      u.coins -= item.price;
      u.activePowerup = itemId;
      saveUser();
      renderShopSection(tab);
      document.getElementById('shop-coins').textContent = u.coins;
      showToast(item.name + ' activated! ' + item.icon, 'success');
    });
  }
}

function applyTheme() {
  const themeId = AppState.user.equippedTheme;
  const theme = SHOP_CATALOG.themes.find(t => t.id === themeId);
  document.body.className = theme ? theme.class : '';
}

// ─── MODAL ────────────────────────────────────
let modalCallback = null;

function openModal(icon, title, body, onConfirm) {
  document.getElementById('modal-icon').textContent  = icon;
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').textContent  = body;
  document.getElementById('modal-confirm').onclick   = () => { closeModal(); onConfirm(); };
  document.getElementById('modal-overlay').style.display = 'flex';
}

function closeModal() {
  document.getElementById('modal-overlay').style.display = 'none';
}

// ─── LEADERBOARD ──────────────────────────────
function renderLeaderboard() {
  const tab = AppState.leaderboardTab;
  const raw = getLeaderboardData();

  // Add some demo players if leaderboard is empty
  const demoPlayers = [
    { id:'demo1', name:'Zara',   avatar:'🦊', totalPoints:1250, weeklyPoints:320 },
    { id:'demo2', name:'Liam',   avatar:'🦁', totalPoints:980,  weeklyPoints:280 },
    { id:'demo3', name:'Emma',   avatar:'🐨', totalPoints:870,  weeklyPoints:210 },
    { id:'demo4', name:'Noah',   avatar:'🐉', totalPoints:650,  weeklyPoints:180 },
    { id:'demo5', name:'Olivia', avatar:'🐧', totalPoints:540,  weeklyPoints:150 },
  ];

  const myEntry = {
    id: AppState.user.id || 'me',
    name: AppState.user.name,
    avatar: AppState.user.avatar,
    totalPoints: AppState.user.totalPoints,
    weeklyPoints: AppState.user.weeklyPoints || 0
  };

  const allEntries = [...demoPlayers, myEntry, ...raw.filter(e => e.id !== myEntry.id)];

  const sorted = [...allEntries].sort((a, b) => {
    return tab === 'weekly'
      ? (b.weeklyPoints || 0) - (a.weeklyPoints || 0)
      : (b.totalPoints || 0) - (a.totalPoints || 0);
  });

  // Podium (top 3)
  const podium = document.getElementById('leaderboard-podium');
  const top3 = sorted.slice(0, 3);
  const pos = ['second','first','third'];
  const reorder = [top3[1], top3[0], top3[2]].filter(Boolean);

  podium.innerHTML = reorder.map((p, i) => {
    const rank = p === top3[0] ? 1 : p === top3[1] ? 2 : 3;
    const cls  = pos[rank - 1];
    const pts  = tab === 'weekly' ? (p.weeklyPoints || 0) : (p.totalPoints || 0);
    return `<div class="podium-item ${cls}">
      <div class="podium-avatar">${p.avatar}</div>
      <div class="podium-name">${p.name}</div>
      <div class="podium-pts">${pts} pts</div>
      <div class="podium-stand">${rank}</div>
    </div>`;
  }).join('');

  // List (4+)
  const list = document.getElementById('leaderboard-list');
  list.innerHTML = sorted.slice(3).map((p, i) => {
    const rank = i + 4;
    const pts  = tab === 'weekly' ? (p.weeklyPoints || 0) : (p.totalPoints || 0);
    const isMe = p.id === (AppState.user.id || 'me') || p.name === AppState.user.name;
    return `<div class="lb-entry ${isMe ? 'is-me' : ''}">
      <span class="lb-rank">${rank}</span>
      <span class="lb-avatar">${p.avatar}</span>
      <div class="lb-info">
        <div class="lb-name">${p.name}${isMe ? ' (You)' : ''}</div>
        <div class="lb-sub">${getRank(p.totalPoints)}</div>
      </div>
      <span class="lb-points">${pts}</span>
    </div>`;
  }).join('');
}

function switchLbTab(tab, el) {
  document.querySelectorAll('.lb-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  AppState.leaderboardTab = tab;
  renderLeaderboard();
}

function generateChallengeCode() {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  document.getElementById('challenge-code').textContent = code;
  localStorage.setItem('abhiquest_challenge_' + code, JSON.stringify({
    creator: AppState.user.name,
    subject: AppState.currentSubject || 'math',
    topic: AppState.currentTopic || 'mixed-math',
    difficulty: AppState.currentDifficulty || 'medium',
    score: AppState.user.bestScore,
    ts: Date.now()
  }));
  showToast('Challenge code generated! Share it with friends! 🎉', 'success');
}

function joinChallenge() {
  const code = document.getElementById('join-code-input').value.trim().toUpperCase();
  if (!code || code.length < 4) { showToast('Enter a valid code!', 'error'); return; }

  const data = localStorage.getItem('abhiquest_challenge_' + code);
  if (!data) {
    showToast('Code not found. Ask your friend to generate one! 🤔', 'error');
    return;
  }

  const challenge = JSON.parse(data);
  showToast('Challenge accepted! Beat ' + challenge.creator + '\'s score of ' + challenge.score + '%! 🎯', 'info');
  AppState.currentSubject = challenge.subject;
  AppState.currentTopic   = challenge.topic;
  AppState.currentDifficulty = challenge.difficulty;
  setTimeout(() => startQuiz(), 1000);
}

// ─── PROFILE ──────────────────────────────────
function renderProfile() {
  const u = AppState.user;
  document.getElementById('profile-avatar').textContent     = u.avatar;
  document.getElementById('profile-name').textContent       = u.name;
  document.getElementById('profile-email').textContent      = u.isGuest ? '(Playing as Guest)' : u.email;
  document.getElementById('profile-rank').textContent       = getRank(u.totalPoints);
  document.getElementById('profile-total-points').textContent = u.totalPoints;
  document.getElementById('profile-coins').textContent      = u.coins;
  document.getElementById('profile-quizzes').textContent    = u.quizCount;
  document.getElementById('profile-streak').textContent     = u.streak;

  // Achievements
  const grid = document.getElementById('achievements-grid');
  grid.innerHTML = ACHIEVEMENTS_LIST.map(a => {
    const unlocked = a.check(u);
    return `<div class="achievement-card ${unlocked ? 'unlocked' : 'locked'}" title="${a.desc}">
      <div class="achievement-icon">${a.icon}</div>
      <div class="achievement-name">${a.name}</div>
    </div>`;
  }).join('');
}

function checkAchievements() {
  const u = AppState.user;
  const prev = u.achievements || [];
  ACHIEVEMENTS_LIST.forEach(a => {
    if (!prev.includes(a.id) && a.check(u)) {
      prev.push(a.id);
      setTimeout(() => showToast('🏅 Achievement Unlocked: ' + a.name + '!', 'success'), 500);
    }
  });
  u.achievements = prev;
}

// ─── CONFETTI ─────────────────────────────────
function launchConfetti() {
  const container = document.getElementById('confetti-container');
  container.innerHTML = '';
  const colors = ['#58CC02','#1cb0f6','#FFD700','#ff9600','#ce82ff','#ff4b4b'];

  for (let i = 0; i < 80; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.cssText = `
      left: ${Math.random() * 100}%;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      width: ${Math.random() * 10 + 5}px;
      height: ${Math.random() * 10 + 5}px;
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      animation-duration: ${Math.random() * 2 + 1.5}s;
      animation-delay: ${Math.random() * 0.5}s;
    `;
    container.appendChild(piece);
  }

  setTimeout(() => { container.innerHTML = ''; }, 4000);
}

// ─── TOAST ────────────────────────────────────
let toastTimer = null;

function showToast(msg, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = 'toast ' + (type || '');
  clearTimeout(toastTimer);
  // Force reflow
  void toast.offsetHeight;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ─── INIT ─────────────────────────────────────
(function init() {
  loadUser();
  applyTheme();

  // If user was logged in before, go to home
  if (AppState.user.name !== 'Player' || AppState.user.quizCount > 0) {
    postLogin();
  }
})();
