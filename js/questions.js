/* =============================================
   AbhiQuest - Question Banks & Generators
   ============================================= */

// ─── HELPERS ───────────────────────────────────
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateNumberOptions(correct, min, max) {
  const opts = new Set([correct]);
  const offsets = [1, 2, 3, 5, 10, 11, -1, -2, -3, -5, -10, -11, 9, -9];
  let i = 0;
  while (opts.size < 4 && i < offsets.length) {
    const v = correct + offsets[i];
    if (v >= min && v !== correct) opts.add(v);
    i++;
  }
  while (opts.size < 4) opts.add(correct + randInt(1, 20));
  return shuffle([...opts].map(String));
}

// ─── MATH GENERATORS ──────────────────────────

function genAddition(diff) {
  let a, b;
  if (diff === 'easy')   { a = randInt(1, 20);  b = randInt(1, 20); }
  else if (diff === 'medium') { a = randInt(15, 99); b = randInt(15, 99); }
  else                   { a = randInt(99, 999); b = randInt(99, 500); }
  const ans = a + b;
  return {
    subject: 'math',
    type: 'addition',
    question: `${a} + ${b} = ?`,
    answer: String(ans),
    options: generateNumberOptions(ans, 0, 2000),
    explanation: `${a} + ${b} = ${ans}`
  };
}

function genSubtraction(diff) {
  let a, b;
  if (diff === 'easy')   { a = randInt(5, 30);  b = randInt(1, a); }
  else if (diff === 'medium') { a = randInt(30, 150); b = randInt(10, a); }
  else                   { a = randInt(200, 999); b = randInt(50, a); }
  const ans = a - b;
  return {
    subject: 'math',
    type: 'subtraction',
    question: `${a} − ${b} = ?`,
    answer: String(ans),
    options: generateNumberOptions(ans, 0, 1000),
    explanation: `${a} − ${b} = ${ans}`
  };
}

function genMultiplication(diff) {
  let a, b;
  if (diff === 'easy')   { a = randInt(1, 5);  b = randInt(1, 10); }
  else if (diff === 'medium') { a = randInt(3, 10); b = randInt(3, 12); }
  else                   { a = randInt(7, 15); b = randInt(7, 15); }
  const ans = a * b;
  return {
    subject: 'math',
    type: 'multiplication',
    question: `${a} × ${b} = ?`,
    answer: String(ans),
    options: generateNumberOptions(ans, 1, 300),
    explanation: `${a} × ${b} = ${ans}`
  };
}

function genDivision(diff) {
  let b, ans;
  if (diff === 'easy')   { b = randInt(2, 5);  ans = randInt(1, 10); }
  else if (diff === 'medium') { b = randInt(2, 10); ans = randInt(2, 12); }
  else                   { b = randInt(3, 12); ans = randInt(5, 15); }
  const a = b * ans;
  return {
    subject: 'math',
    type: 'division',
    question: `${a} ÷ ${b} = ?`,
    answer: String(ans),
    options: generateNumberOptions(ans, 1, 200),
    explanation: `${a} ÷ ${b} = ${ans}`
  };
}

function genWordProblem(diff) {
  const problems = {
    easy: [
      () => { const a=randInt(2,10),b=randInt(2,10); return { q:`If you have ${a} apples and find ${b} more, how many do you have?`, a:a+b, e:`${a} + ${b} = ${a+b}` }; },
      () => { const a=randInt(5,15),b=randInt(1,a-1); return { q:`You had ${a} sweets and ate ${b}. How many are left?`, a:a-b, e:`${a} - ${b} = ${a-b}` }; },
      () => { const p=randInt(2,5),c=randInt(2,8); return { q:`There are ${p} bags with ${c} oranges each. How many oranges total?`, a:p*c, e:`${p} × ${c} = ${p*c}` }; },
    ],
    medium: [
      () => { const p=randInt(3,8),c=randInt(5,12); return { q:`A baker makes ${p} trays of ${c} cookies each. How many cookies in total?`, a:p*c, e:`${p} × ${c} = ${p*c}` }; },
      () => { const t=randInt(40,100),s=randInt(5,10); return { q:`${t} children are split equally into ${s} teams. How many children per team?`, a:Math.floor(t/s)*(s===Math.floor(t/s)*s?1:null), ...( t%s===0 ? {} : { q:`${Math.floor(t/s)*s} children are split equally into ${s} teams. How many children per team?`, t:Math.floor(t/s)*s } ), e:'' }; },
      () => { const a=randInt(15,50),b=randInt(15,50); return { q:`A shop has ${a} red pens and ${b} blue pens. How many pens altogether?`, a:a+b, e:`${a} + ${b} = ${a+b}` }; },
    ],
    hard: [
      () => { const d=randInt(5,15),h=randInt(3,8); return { q:`A train travels ${d} km every hour. How far does it travel in ${h} hours?`, a:d*h, e:`${d} × ${h} = ${d*h}` }; },
      () => { const t=randInt(200,500),g=randInt(4,10); return { q:`${t} people attend a concert. ${g} sit in each row. How many rows are needed?`, a:Math.ceil(t/g), e:`${t} ÷ ${g} = ${Math.ceil(t/g)}` }; },
    ]
  };

  const level = diff === 'easy' ? problems.easy : diff === 'medium' ? problems.medium : problems.hard;
  const gen = level[randInt(0, level.length - 1)]();
  const ans = gen.a;
  return {
    subject: 'math',
    type: 'word',
    question: gen.q,
    answer: String(ans),
    options: generateNumberOptions(ans, 0, 1000),
    explanation: gen.e || `Answer: ${ans}`
  };
}

function generateMathQuestion(topic, diff) {
  if (topic === 'mixed-math') {
    const types = ['addition', 'subtraction', 'multiplication', 'division'];
    topic = types[randInt(0, types.length - 1)];
  }
  switch (topic) {
    case 'addition':       return genAddition(diff);
    case 'subtraction':    return genSubtraction(diff);
    case 'multiplication': return genMultiplication(diff);
    case 'division':       return genDivision(diff);
    default:               return genAddition(diff);
  }
}

// ─── ENGLISH QUESTION BANKS ────────────────────

const SPELLING_QUESTIONS = [
  // Easy
  { level:'easy', question:'Which is spelled correctly?', context:'My best ___ is coming to my party.', answer:'friend', options:['friend','freind','frend','firend'] },
  { level:'easy', question:'Which is spelled correctly?', context:'She is a very ___ person.', answer:'beautiful', options:['beautiful','beutiful','beautifull','beatiful'] },
  { level:'easy', question:'Which is spelled correctly?', context:'Can you come ___?', answer:'because', options:['because','becaues','becaus','becaase'] },
  { level:'easy', question:'Which is spelled correctly?', context:'That is a ___ idea!', answer:'different', options:['different','diferent','diffrent','diferrent'] },
  { level:'easy', question:'Which is spelled correctly?', context:'She ___ she can fly.', answer:'believes', options:['believes','beleives','beleves','beleaves'] },
  { level:'easy', question:'Which is spelled correctly?', context:'The film was very ___.', answer:'exciting', options:['exciting','exiting','excitting','exsiting'] },
  { level:'easy', question:'Which is spelled correctly?', context:'I need to ___ my homework.', answer:'finish', options:['finish','finnsh','finsh','finnish'] },
  { level:'easy', question:'Which is spelled correctly?', context:'We played ___ all afternoon.', answer:'together', options:['together','togather','togeher','togeter'] },
  { level:'easy', question:'Which is spelled correctly?', context:'___ is my favourite day.', answer:'Saturday', options:['Saturday','Saterday','Saterady','Saturady'] },
  { level:'easy', question:'Which is spelled correctly?', context:'I will see you ___.', answer:'tomorrow', options:['tomorrow','tommorow','tomoorrow','tomorow'] },
  // Medium
  { level:'medium', question:'Which is spelled correctly?', context:'The answer is ___ correct.', answer:'definitely', options:['definitely','definately','definatley','definitly'] },
  { level:'medium', question:'Which is spelled correctly?', context:'It is ___ to be kind.', answer:'necessary', options:['necessary','nessesary','neccessary','necesary'] },
  { level:'medium', question:'Which is spelled correctly?', context:'I felt ___ when I won.', answer:'embarrassed', options:['embarrassed','embarased','embarrased','embarassed'] },
  { level:'medium', question:'Which is spelled correctly?', context:'The ___ is very cold today.', answer:'temperature', options:['temperature','tempature','temprature','temperaure'] },
  { level:'medium', question:'Which is spelled correctly?', context:'We need to ___ the planet.', answer:'environment', options:['environment','enviroment','enviornment','environmint'] },
  { level:'medium', question:'Which is spelled correctly?', context:'The ___ was very funny.', answer:'occasion', options:['occasion','occassion','ocasion','occacion'] },
  { level:'medium', question:'Which is spelled correctly?', context:'I need to ___ more often.', answer:'exercise', options:['exercise','excercise','exersize','exercize'] },
  { level:'medium', question:'Which is spelled correctly?', context:'She has a ___ in science.', answer:'knowledge', options:['knowledge','knowlege','knowledg','nowledge'] },
  { level:'medium', question:'Which is spelled correctly?', context:'The ___ was very interesting.', answer:'parliament', options:['parliament','parliment','parlamente','parlaiment'] },
  { level:'medium', question:'Which is spelled correctly?', context:'I was ___ surprised.', answer:'especially', options:['especially','especialy','espesially','especiallly'] },
  // Hard
  { level:'hard', question:'Which is spelled correctly?', context:'This is a very ___ decision.', answer:'conscientious', options:['conscientious','consientious','conscienctious','consciencious'] },
  { level:'hard', question:'Which is spelled correctly?', context:'The word was difficult to ___.', answer:'pronunciation', options:['pronunciation','pronounciation','prononciation','pronunceation'] },
  { level:'hard', question:'Which is spelled correctly?', context:'There was a ___ between them.', answer:'miscommunication', options:['miscommunication','miscomunication','miscomunacation','miscommunacation'] },
  { level:'hard', question:'Which is spelled correctly?', context:'It was an ___ achievement.', answer:'extraordinary', options:['extraordinary','extrodinary','extraordinery','extraordanary'] },
  { level:'hard', question:'Which is spelled correctly?', context:'The ___ was very long.', answer:'Mediterranean', options:['Mediterranean','Meditteranean','Mediteranean','Mediterrranean'] },
  { level:'hard', question:'Which is spelled correctly?', context:'She spoke with great ___.', answer:'eloquence', options:['eloquence','elequence','eloguence','eloquance'] },
];

const VOCAB_QUESTIONS = [
  // Easy
  { level:'easy', question:'What does "ancient" mean?', answer:'Very old', options:['Very old','Very new','Very big','Very small'], explanation:'"Ancient" describes something that existed a very long time ago.' },
  { level:'easy', question:'What does "enormous" mean?', answer:'Very large', options:['Very large','Very tiny','Very fast','Very cold'], explanation:'"Enormous" means extremely large in size.' },
  { level:'easy', question:'What does "brave" mean?', answer:'Courageous and not afraid', options:['Courageous and not afraid','Silly and funny','Sad and lonely','Tired and sleepy'], explanation:'"Brave" means showing courage and not being afraid.' },
  { level:'easy', question:'What does "swift" mean?', answer:'Very fast', options:['Very fast','Very quiet','Very tall','Very strong'], explanation:'"Swift" means moving very quickly.' },
  { level:'easy', question:'What does "curious" mean?', answer:'Eager to learn or know', options:['Eager to learn or know','Feeling sleepy','Feeling angry','Being very loud'], explanation:'"Curious" means wanting to find out about something.' },
  { level:'easy', question:'What does "miserable" mean?', answer:'Very unhappy', options:['Very unhappy','Very excited','Very hungry','Very bored'], explanation:'"Miserable" means extremely unhappy or uncomfortable.' },
  { level:'easy', question:'What does "generous" mean?', answer:'Willing to give and share', options:['Willing to give and share','Being very greedy','Feeling confused','Acting silly'], explanation:'"Generous" means giving freely and happily.' },
  { level:'easy', question:'What does "peculiar" mean?', answer:'Strange or unusual', options:['Strange or unusual','Very normal','Quite boring','Really pretty'], explanation:'"Peculiar" means different from what is usual or expected.' },
  // Medium
  { level:'medium', question:'What does "reluctant" mean?', answer:'Unwilling; not wanting to do something', options:['Unwilling; not wanting to do something','Very excited to do something','Happy to help','Being very fast'], explanation:'"Reluctant" means being hesitant or unwilling to do something.' },
  { level:'medium', question:'What does "vivid" mean?', answer:'Very bright and clear', options:['Very bright and clear','Extremely dark','Rather boring','Quite dull'], explanation:'"Vivid" describes something that is bright, clear, and full of life.' },
  { level:'medium', question:'What does "deduce" mean?', answer:'To work out using reasoning', options:['To work out using reasoning','To make a mistake','To write quickly','To paint a picture'], explanation:'"Deduce" means to reach a conclusion through logical thinking.' },
  { level:'medium', question:'What does "persevere" mean?', answer:'To keep trying despite difficulty', options:['To keep trying despite difficulty','To stop immediately','To move very quickly','To sleep soundly'], explanation:'"Persevere" means to continue steadfastly in spite of challenges.' },
  { level:'medium', question:'What does "ferocious" mean?', answer:'Extremely fierce and violent', options:['Extremely fierce and violent','Very gentle and kind','Quite sleepy','Extremely silly'], explanation:'"Ferocious" means savagely fierce, cruel, and violent.' },
  { level:'medium', question:'What does "accurate" mean?', answer:'Exactly correct and precise', options:['Exactly correct and precise','Completely wrong','Very slow','Quite loud'], explanation:'"Accurate" means free from mistakes and errors.' },
  { level:'medium', question:'What does "triumph" mean?', answer:'A great victory or success', options:['A great victory or success','A big failure','A long journey','A quiet moment'], explanation:'"Triumph" means a great achievement or winning success.' },
  { level:'medium', question:'What does "predict" mean?', answer:'To say what will happen before it does', options:['To say what will happen before it does','To forget something important','To make something appear','To draw a picture'], explanation:'"Predict" means to say or estimate what will happen in the future.' },
  // Hard
  { level:'hard', question:'What does "benevolent" mean?', answer:'Well-meaning and kindly', options:['Well-meaning and kindly','Extremely cruel','Very confused','Quite boring'], explanation:'"Benevolent" means well-intentioned and kind towards others.' },
  { level:'hard', question:'What does "diligent" mean?', answer:'Hardworking and careful', options:['Hardworking and careful','Very lazy','Extremely loud','Rather clumsy'], explanation:'"Diligent" means showing steady effort and care in work.' },
  { level:'hard', question:'What does "ambiguous" mean?', answer:'Having more than one possible meaning', options:['Having more than one possible meaning','Absolutely clear','Very simple','Extremely loud'], explanation:'"Ambiguous" means open to more than one interpretation.' },
  { level:'hard', question:'What does "inevitable" mean?', answer:'Certain to happen; unavoidable', options:['Certain to happen; unavoidable','Easily prevented','Very surprising','Quite unusual'], explanation:'"Inevitable" describes something that is certain to happen.' },
  { level:'hard', question:'What does "eloquent" mean?', answer:'Fluent and persuasive in speaking', options:['Fluent and persuasive in speaking','Unable to speak clearly','Very loud and noisy','Extremely quiet'], explanation:'"Eloquent" means speaking in a persuasive and expressive way.' },
];

const GRAMMAR_QUESTIONS = [
  // Easy
  { level:'easy', question:'Choose the correct word: "She ___ to school every day."', answer:'goes', options:['go','goes','gone','going'], explanation:'"She" is singular, so we use "goes" (third person singular).' },
  { level:'easy', question:'Choose the correct word: "They ___ playing in the garden."', answer:'are', options:['is','are','was','am'], explanation:'"They" uses "are" as the helping verb.' },
  { level:'easy', question:'Which sentence is correct?', answer:'The dog ran quickly.', options:['The dog ran quickly.','The dog runned quickly.','The dog run quickly.','The dog running quickly.'], explanation:'The past tense of "run" is "ran".' },
  { level:'easy', question:'What is the plural of "child"?', answer:'children', options:['children','childs','childes','child'], explanation:'"Child" has an irregular plural: "children".' },
  { level:'easy', question:'What is the plural of "tooth"?', answer:'teeth', options:['teeth','tooths','toothes','tooth'], explanation:'"Tooth" has an irregular plural: "teeth".' },
  { level:'easy', question:'Choose the correct punctuation: "What is your name ___"', answer:'?', options:['?','.',',','!'], explanation:'Questions end with a question mark (?).' },
  { level:'easy', question:'"Happy" is an adjective. What is the adverb?', answer:'happily', options:['happily','happly','happily','happiness'], explanation:'Adverbs describing how often end in "-ly". Happy → happily.' },
  { level:'easy', question:'Choose the correct word: "I have ___ idea."', answer:'an', options:['a','an','the','some'], explanation:'We use "an" before words starting with a vowel sound.' },
  // Medium
  { level:'medium', question:'Which sentence uses the past tense correctly?', answer:'Yesterday, she baked a cake.', options:['Yesterday, she baked a cake.','Yesterday, she bake a cake.','Yesterday, she bakes a cake.','Yesterday, she is baking a cake.'], explanation:'"Baked" is the correct past tense of "bake".' },
  { level:'medium', question:'Which sentence has a correct apostrophe?', answer:"It's a lovely day.", options:["It's a lovely day.","Its a lovely day.","Its' a lovely day.","It'is a lovely day."], explanation:'"It\'s" is a contraction for "it is". The apostrophe replaces the missing letter.' },
  { level:'medium', question:'Choose the correct word: "Neither the boys nor the girl ___ ready."', answer:'was', options:['was','were','are','is'], explanation:'When "neither...nor" is used, the verb agrees with the nearest subject ("girl" = singular = "was").' },
  { level:'medium', question:'Which word is a conjunction?', answer:'because', options:['because','happy','quickly','beautiful'], explanation:'A conjunction joins clauses or sentences. "Because" explains a reason.' },
  { level:'medium', question:'"The cat sat on the mat." What is the subject?', answer:'The cat', options:['The cat','sat','on the mat','the mat'], explanation:'The subject is who or what the sentence is about.' },
  { level:'medium', question:'Which sentence is in the future tense?', answer:'She will dance at the show.', options:['She will dance at the show.','She danced at the show.','She dances at the show.','She is dancing at the show.'], explanation:'Future tense uses "will" + verb.' },
  { level:'medium', question:'What does a comma do in a list?', answer:'Separates items in a list', options:['Separates items in a list','Ends a sentence','Shows surprise','Replaces a letter'], explanation:'Commas separate items in a list, e.g., "I bought bread, milk, and eggs."' },
  // Hard
  { level:'hard', question:'Which sentence uses the subjunctive mood?', answer:'I wish he were here.', options:['I wish he were here.','I wish he was here.','I wish he is here.','I wish he will be here.'], explanation:'The subjunctive mood uses "were" for wishes and hypotheticals.' },
  { level:'hard', question:'Identify the clause: "Although it was raining, we went outside."', answer:'"Although it was raining" is a subordinate clause.', options:['"Although it was raining" is a subordinate clause.','"we went outside" is a subordinate clause.','Both clauses are main clauses.','There are no clauses.'], explanation:'A subordinate clause cannot stand alone and depends on the main clause.' },
  { level:'hard', question:'Which is an example of a metaphor?', answer:'Time is a thief.', options:['Time is a thief.','She ran as fast as a cheetah.','The wind whispered.','It was as quiet as a mouse.'], explanation:'A metaphor describes something as being something else directly.' },
  { level:'hard', question:'What is the passive voice of "The dog chased the cat"?', answer:'The cat was chased by the dog.', options:['The cat was chased by the dog.','The dog was chasing the cat.','The cat chased the dog.','The dog has chased the cat.'], explanation:'In passive voice, the object becomes the subject.' },
];

const ANTONYM_QUESTIONS = [
  { level:'easy', question:'What is the OPPOSITE of "happy"?', answer:'sad', options:['sad','joyful','excited','glad'] },
  { level:'easy', question:'What is the OPPOSITE of "hot"?', answer:'cold', options:['cold','warm','cool','chilly'] },
  { level:'easy', question:'What is the OPPOSITE of "big"?', answer:'small', options:['small','large','tall','wide'] },
  { level:'easy', question:'What is the OPPOSITE of "fast"?', answer:'slow', options:['slow','quick','swift','rapid'] },
  { level:'easy', question:'What is the OPPOSITE of "dark"?', answer:'light', options:['light','dim','gloomy','shadow'] },
  { level:'medium', question:'What is the OPPOSITE of "courageous"?', answer:'cowardly', options:['cowardly','brave','bold','daring'] },
  { level:'medium', question:'What is the OPPOSITE of "generous"?', answer:'selfish', options:['selfish','giving','kind','caring'] },
  { level:'medium', question:'What is the OPPOSITE of "ancient"?', answer:'modern', options:['modern','old','historic','past'] },
  { level:'medium', question:'What is the OPPOSITE of "expand"?', answer:'shrink', options:['shrink','grow','enlarge','widen'] },
  { level:'hard', question:'What is the OPPOSITE of "benevolent"?', answer:'malevolent', options:['malevolent','kind','generous','friendly'] },
  { level:'hard', question:'What is the OPPOSITE of "eloquent"?', answer:'inarticulate', options:['inarticulate','persuasive','fluent','expressive'] },
  { level:'hard', question:'What is the OPPOSITE of "diligent"?', answer:'indolent', options:['indolent','hardworking','careful','thorough'] },
];

// ─── ENGLISH QUESTION SELECTOR ─────────────────

function getEnglishPool(type, diff) {
  let pool = [];
  if (type === 'spelling' || type === 'mixed-english') {
    pool.push(...SPELLING_QUESTIONS.filter(q => diff === 'mixed' || q.level === diff || type === 'mixed-english'));
  }
  if (type === 'vocabulary' || type === 'mixed-english') {
    pool.push(...VOCAB_QUESTIONS.filter(q => diff === 'mixed' || q.level === diff || type === 'mixed-english'));
  }
  if (type === 'grammar' || type === 'mixed-english') {
    pool.push(...GRAMMAR_QUESTIONS.filter(q => diff === 'mixed' || q.level === diff || type === 'mixed-english'));
    pool.push(...ANTONYM_QUESTIONS.filter(q => diff === 'mixed' || q.level === diff || type === 'mixed-english'));
  }

  // Fallback: if no diff match, use all
  if (pool.length < 5) {
    if (type === 'spelling')    pool = [...SPELLING_QUESTIONS];
    else if (type === 'vocabulary') pool = [...VOCAB_QUESTIONS];
    else if (type === 'grammar')    pool = [...GRAMMAR_QUESTIONS, ...ANTONYM_QUESTIONS];
    else pool = [...SPELLING_QUESTIONS, ...VOCAB_QUESTIONS, ...GRAMMAR_QUESTIONS, ...ANTONYM_QUESTIONS];
  }

  return pool;
}

function generateEnglishQuestion(type, diff) {
  const pool = getEnglishPool(type, diff);
  const q = pool[randInt(0, pool.length - 1)];
  return {
    subject: 'english',
    type: q.type || type,
    question: q.question,
    context: q.context || null,
    answer: q.answer,
    options: shuffle([...q.options]),
    explanation: q.explanation || ''
  };
}

// ─── MAIN QUIZ BUILDER ─────────────────────────

function buildQuiz(subject, topic, difficulty, count = 20) {
  const questions = [];
  const seen = new Set();

  for (let i = 0; i < count; i++) {
    let q;
    let attempts = 0;
    do {
      if (subject === 'math') {
        q = generateMathQuestion(topic, difficulty);
      } else {
        q = generateEnglishQuestion(topic, difficulty);
      }
      attempts++;
    } while (seen.has(q.question) && attempts < 10);

    seen.add(q.question);
    q.id = i;
    questions.push(q);
  }

  return questions;
}
