/* =============================================
   RADT Quest - Question Banks & Generators
   Grade 1-8 | UK National Curriculum /
   US Common Core aligned
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
  const offsets = [1, 2, 3, 5, 10, -1, -2, -3, -5, -10, 7, -7, 11, -11];
  let i = 0;
  while (opts.size < 4 && i < offsets.length) {
    const v = correct + offsets[i];
    if (v >= min) opts.add(v);
    i++;
  }
  while (opts.size < 4) opts.add(correct + randInt(1, 15));
  return shuffle([...opts].map(String));
}
function pick(arr) { return arr[randInt(0, arr.length - 1)]; }

// ─── GRADE → DIFFICULTY MAPPING ───────────────
// grade string '1'-'8' maps to math/english range
function gradeToMathDiff(grade) {
  const g = parseInt(grade);
  if (g <= 2) return 'easy';
  if (g <= 5) return 'medium';
  return 'hard';
}

// ═══════════════════════════════════════════════
//  MATHS GENERATORS  (grade-aware)
// ═══════════════════════════════════════════════

function genAddition(grade) {
  const g = parseInt(grade);
  let a, b;
  if (g === 1)      { a = randInt(1,10);   b = randInt(1,10); }
  else if (g === 2) { a = randInt(10,50);  b = randInt(1,20); }
  else if (g === 3) { a = randInt(20,99);  b = randInt(20,99); }
  else if (g === 4) { a = randInt(100,499); b = randInt(100,499); }
  else if (g === 5) { a = randInt(200,999); b = randInt(200,999); }
  else if (g === 6) { a = randInt(1000,4999); b = randInt(1000,4999); }
  else if (g === 7) { a = randInt(100,9999); b = randInt(100,9999); }
  else              { a = randInt(1000,99999); b = randInt(1000,99999); }
  const ans = a + b;
  return { subject:'math', type:'addition', question:`${a} + ${b} = ?`,
    answer:String(ans), options:generateNumberOptions(ans, 0, ans+50) };
}

function genSubtraction(grade) {
  const g = parseInt(grade);
  let a, b;
  if (g === 1)      { a = randInt(5,15);   b = randInt(1,a); }
  else if (g === 2) { a = randInt(15,50);  b = randInt(5,a); }
  else if (g === 3) { a = randInt(50,150); b = randInt(10,a); }
  else if (g === 4) { a = randInt(200,500); b = randInt(50,a); }
  else if (g === 5) { a = randInt(500,999); b = randInt(100,a); }
  else if (g === 6) { a = randInt(1000,5000); b = randInt(500,a); }
  else if (g === 7) { a = randInt(5000,9999); b = randInt(1000,a); }
  else              { a = randInt(10000,99999); b = randInt(5000,a); }
  const ans = a - b;
  return { subject:'math', type:'subtraction', question:`${a} − ${b} = ?`,
    answer:String(ans), options:generateNumberOptions(ans, 0, a+10) };
}

function genMultiplication(grade) {
  const g = parseInt(grade);
  let a, b;
  if (g <= 2)       { a = randInt(1,5);   b = randInt(1,5); }
  else if (g === 3) { a = randInt(2,10);  b = randInt(2,5); }
  else if (g === 4) { a = randInt(2,12);  b = randInt(2,12); }
  else if (g === 5) { a = randInt(7,15);  b = randInt(7,15); }
  else if (g === 6) { a = randInt(10,25); b = randInt(10,25); }
  else if (g === 7) { a = randInt(15,50); b = randInt(10,30); }
  else              { a = randInt(20,99); b = randInt(20,50); }
  const ans = a * b;
  return { subject:'math', type:'multiplication', question:`${a} × ${b} = ?`,
    answer:String(ans), options:generateNumberOptions(ans, 1, ans+50) };
}

function genDivision(grade) {
  const g = parseInt(grade);
  let divisor, quotient;
  if (g <= 2)       { divisor = randInt(2,5);  quotient = randInt(1,8); }
  else if (g === 3) { divisor = randInt(2,5);  quotient = randInt(2,12); }
  else if (g === 4) { divisor = randInt(2,12); quotient = randInt(2,12); }
  else if (g === 5) { divisor = randInt(3,12); quotient = randInt(5,20); }
  else if (g === 6) { divisor = randInt(5,15); quotient = randInt(5,25); }
  else if (g === 7) { divisor = randInt(7,20); quotient = randInt(10,50); }
  else              { divisor = randInt(10,25); quotient = randInt(20,100); }
  const dividend = divisor * quotient;
  return { subject:'math', type:'division', question:`${dividend} ÷ ${divisor} = ?`,
    answer:String(quotient), options:generateNumberOptions(quotient, 1, quotient+30) };
}

function genWordProblem(grade) {
  const g = parseInt(grade);
  const templates = {
    1: [
      () => { const a=randInt(1,9),b=randInt(1,9); return { q:`Sam has ${a} apples. He gets ${b} more. How many apples does Sam have now?`, a:a+b }; },
      () => { const a=randInt(5,10),b=randInt(1,a); return { q:`There are ${a} birds on a tree. ${b} fly away. How many birds are left?`, a:a-b }; },
      () => { const r=randInt(2,5),c=randInt(1,5); return { q:`There are ${r} bags. Each bag has ${c} sweets. How many sweets altogether?`, a:r*c }; },
    ],
    2: [
      () => { const a=randInt(10,30),b=randInt(10,30); return { q:`Mia has ${a} stickers and buys ${b} more. How many does she have in total?`, a:a+b }; },
      () => { const a=randInt(20,50),b=randInt(5,a); return { q:`A box had ${a} crayons. ${b} were taken out. How many crayons remain?`, a:a-b }; },
      () => { const p=randInt(2,5),c=randInt(2,8); return { q:`There are ${p} rows of ${c} chairs. How many chairs are there in total?`, a:p*c }; },
    ],
    3: [
      () => { const a=randInt(30,80),b=randInt(20,50); return { q:`A library has ${a} fiction books and ${b} non-fiction books. How many books altogether?`, a:a+b }; },
      () => { const p=randInt(3,8),c=randInt(3,9); return { q:`A baker makes ${p} trays with ${c} muffins each. How many muffins in total?`, a:p*c }; },
      () => { const t=randInt(20,60),g=randInt(2,5); const tt=t-(t%g); return { q:`${tt} pupils are split into ${g} equal groups. How many pupils in each group?`, a:tt/g }; },
    ],
    4: [
      () => { const a=randInt(100,300),b=randInt(100,300); return { q:`A school collected ${a} cans in January and ${b} cans in February. What is the total?`, a:a+b }; },
      () => { const u=randInt(4,12),c=randInt(15,30); return { q:`A cinema has ${u} rows with ${c} seats each. How many seats are there altogether?`, a:u*c }; },
      () => { const t=randInt(200,400),g=randInt(4,8); const tt=t-(t%g); return { q:`${tt} books are packed into ${g} equal boxes. How many books go in each box?`, a:tt/g }; },
    ],
    5: [
      () => { const d=randInt(10,30),h=randInt(4,10); return { q:`A car travels ${d} miles per hour. How far does it travel in ${h} hours?`, a:d*h }; },
      () => { const p=randInt(500,900),n=randInt(100,p); return { q:`A shop had ${p} items in stock. ${n} were sold. How many items are left?`, a:p-n }; },
      () => { const u=randInt(10,25),c=randInt(12,30); return { q:`A factory makes ${u} boxes per hour with ${c} items in each box. How many items in 1 hour?`, a:u*c }; },
    ],
    6: [
      () => { const t=randInt(600,1200),r=randInt(8,15); const tt=t-(t%r); return { q:`${tt} students are arranged in rows of ${r}. How many rows are there?`, a:tt/r }; },
      () => { const pct=pick([10,20,25,50]); const tot=randInt(4,12)*100; return { q:`A jacket costs £${tot}. It is on sale with ${pct}% off. How much is the discount?`, a:(tot*pct/100) }; },
      () => { const a=randInt(1000,4000),b=randInt(500,a); return { q:`A town has a population of ${a}. ${b} people move away. What is the new population?`, a:a-b }; },
    ],
    7: [
      () => { const x=randInt(3,15); return { q:`Solve: 3x + 5 = ${3*x+5}. What is x?`, a:x }; },
      () => { const x=randInt(2,12); return { q:`Solve: 2x − 4 = ${2*x-4}. What is x?`, a:x }; },
      () => { const b=randInt(5,20),h=randInt(4,16); return { q:`A triangle has a base of ${b} cm and height of ${h} cm. What is its area? (Area = ½ × base × height)`, a:(b*h)/2 }; },
    ],
    8: [
      () => { const x=randInt(3,15); return { q:`Solve: 4x − 7 = ${4*x-7}. What is x?`, a:x }; },
      () => { const a=randInt(3,12),b=randInt(4,12); const c=Math.round(Math.sqrt(a*a+b*b)*10)/10; return { q:`A right triangle has legs of ${a} cm and ${b} cm. What is the hypotenuse? (Use √${a*a+b*b})`, a:Math.sqrt(a*a+b*b).toFixed(1) }; },
      () => { const p=randInt(3,9),n=randInt(2,p-1); return { q:`In a class of ${p*10} students, ${n}/${p} passed their test. How many students passed?`, a:n*10 }; },
    ],
  };

  const tList = templates[Math.min(g,8)] || templates[5];
  const gen = pick(tList)();
  return {
    subject:'math', type:'word',
    question: gen.q,
    answer: String(gen.a),
    options: generateNumberOptions(typeof gen.a === 'number' ? gen.a : parseFloat(gen.a), 0, parseFloat(gen.a)+100)
  };
}

function genFractions(grade) {
  const g = parseInt(grade);
  if (g < 4) { return genAddition(grade); }

  if (g <= 5) {
    // Simple fraction identification
    const fracs = [
      { q:'What is half of 20?', a:'10', opts:['10','5','15','8'] },
      { q:'What is a quarter of 40?', a:'10', opts:['10','8','20','5'] },
      { q:'What is half of 36?', a:'18', opts:['18','12','24','9'] },
      { q:'What is a quarter of 100?', a:'25', opts:['25','20','50','10'] },
      { q:'Which fraction is equivalent to ½?', a:'4/8', opts:['4/8','3/8','2/6','4/6'] },
      { q:'Which fraction is equivalent to ¼?', a:'2/8', opts:['2/8','3/8','2/6','3/12'] },
      { q:'What is ½ + ¼?', a:'3/4', opts:['3/4','2/4','1/4','4/8'] },
      { q:'What is ¾ − ¼?', a:'2/4 = ½', opts:['2/4 = ½','3/8','1/4','3/4'] },
    ];
    const q = pick(fracs);
    return { subject:'math', type:'fractions', question:q.q, answer:q.a, options:shuffle([...q.opts]) };
  }
  if (g <= 7) {
    const fracs = [
      { q:'Convert ¾ to a decimal.', a:'0.75', opts:['0.75','0.34','0.70','0.25'] },
      { q:'Convert 0.5 to a fraction.', a:'½', opts:['½','¼','⅓','⅔'] },
      { q:'What is 20% of 80?', a:'16', opts:['16','8','20','12'] },
      { q:'What is 25% of 200?', a:'50', opts:['50','25','40','75'] },
      { q:'What is ⅓ of 90?', a:'30', opts:['30','45','20','60'] },
      { q:'Simplify 8/12.', a:'2/3', opts:['2/3','4/6','1/2','3/4'] },
      { q:'What is 50% of 130?', a:'65', opts:['65','50','75','60'] },
      { q:'What is ⅖ of 50?', a:'20', opts:['20','10','25','30'] },
    ];
    const q = pick(fracs);
    return { subject:'math', type:'fractions', question:q.q, answer:q.a, options:shuffle([...q.opts]) };
  }
  // Grade 8
  const fracs = [
    { q:'What is 15% of 360?', a:'54', opts:['54','36','48','60'] },
    { q:'Increase 200 by 15%.', a:'230', opts:['230','215','220','240'] },
    { q:'A price of £80 is reduced by 20%. What is the new price?', a:'£64', opts:['£64','£60','£68','£70'] },
    { q:'Convert 0.125 to a fraction in lowest terms.', a:'1/8', opts:['1/8','1/4','1/6','1/5'] },
    { q:'What is 12.5% of 400?', a:'50', opts:['50','40','60','48'] },
    { q:'A shop increases prices by 10% then 10% again. Total % increase on original?', a:'21%', opts:['21%','20%','22%','10%'] },
  ];
  const q = pick(fracs);
  return { subject:'math', type:'fractions', question:q.q, answer:q.a, options:shuffle([...q.opts]) };
}

// ═══════════════════════════════════════════════
//  ENGLISH QUESTION BANKS — GRADE 1–8
//  Based on UK National Curriculum & Oxford
//  Word List, plus US Common Core ELA standards
// ═══════════════════════════════════════════════

// ── Grade 1 English (Age 5-6) ─────────────────
const ENG_G1 = [
  // Phonics / Spelling
  { q:'Which word rhymes with "cat"?',       a:'hat',    opts:['hat','dog','pen','bus'] },
  { q:'Which word rhymes with "sun"?',       a:'run',    opts:['run','cat','dog','pen'] },
  { q:'Which word rhymes with "big"?',       a:'pig',    opts:['pig','cat','hen','top'] },
  { q:'Which word ends with the sound "sh"?',a:'fish',   opts:['fish','cat','dog','run'] },
  { q:'Which word starts with the letter "b"?', a:'ball',opts:['ball','cat','sun','dog'] },
  { q:'Which word starts with "ch"?',        a:'chin',   opts:['chin','ship','thin','ring'] },
  { q:'Which word starts with "sh"?',        a:'shop',   opts:['shop','chop','them','ring'] },
  { q:'Which word starts with "th"?',        a:'the',    opts:['the','she','chin','wing'] },
  { q:'How many letters are in the word "cat"?', a:'3',  opts:['3','2','4','5'] },
  { q:'How many letters are in "happy"?',    a:'5',      opts:['5','4','6','3'] },
  // Sight words
  { q:'Which is a real word?',               a:'and',    opts:['and','adn','nda','dan'] },
  { q:'Which word means "not big"?',         a:'small',  opts:['small','talls','bigs','shorts'] },
  { q:'Choose the correct word: "I ___ to school."', a:'go', opts:['go','goes','gone','went'] },
  { q:'What is the opposite of "up"?',       a:'down',   opts:['down','out','in','on'] },
  { q:'What is the opposite of "hot"?',      a:'cold',   opts:['cold','warm','cool','wet'] },
  { q:'What is the opposite of "day"?',      a:'night',  opts:['night','light','dark','dusk'] },
  { q:'Which word is a colour?',             a:'blue',   opts:['blue','jump','happy','run'] },
  { q:'Which word is an animal?',            a:'dog',    opts:['dog','run','big','jump'] },
  // Sentences
  { q:'Which sentence is correct?',          a:'The cat sat on the mat.', opts:['The cat sat on the mat.','the cat sat on the mat.','The cat sat on the Mat.','The Cat sat on the mat.'] },
  { q:'What goes at the end of a question?', a:'?',      opts:['?','.','!',','] },
  { q:'What goes at the end of a statement?',a:'.',      opts:['.','?','!',','] },
  { q:'Which word is a verb (action word)?', a:'jump',   opts:['jump','red','big','cat'] },
  { q:'Which word is a noun (naming word)?', a:'apple',  opts:['apple','run','fast','happy'] },
];

// ── Grade 2 English (Age 6-7) ─────────────────
const ENG_G2 = [
  // Spelling
  { q:'Which is spelled correctly?', ctx:'My ___ is coming to my party.', a:'friend',  opts:['friend','freind','frend','firend'] },
  { q:'Which is spelled correctly?', ctx:'I will see you ___.', a:'tomorrow', opts:['tomorrow','tommorow','tomoorrow','tomorow'] },
  { q:'Which is spelled correctly?', ctx:'We played ___ all day.', a:'together', opts:['together','togather','togeher','togeter'] },
  { q:'Which is spelled correctly?', ctx:'She is a ___ girl.', a:'happy',    opts:['happy','hapy','happpy','happi'] },
  { q:'Which is spelled correctly?', ctx:'I ___ to the park.',  a:'went',     opts:['went','wint','wnet','wennt'] },
  // Vocabulary
  { q:'What does "big" mean?',                a:'Large in size',   opts:['Large in size','Very small','Very fast','Very cold'] },
  { q:'What does "tiny" mean?',               a:'Very small',      opts:['Very small','Very large','Very fast','Very strong'] },
  { q:'What is the opposite of "open"?',      a:'closed',          opts:['closed','empty','broken','fixed'] },
  { q:'What is the opposite of "start"?',     a:'stop',            opts:['stop','begin','go','move'] },
  { q:'Which word means "to make a sound with your mouth"?', a:'speak', opts:['speak','look','walk','hold'] },
  // Grammar
  { q:'What is the plural of "dog"?',         a:'dogs',            opts:['dogs','dogz','doges','doge'] },
  { q:'What is the plural of "box"?',         a:'boxes',           opts:['boxes','boxs','boxen','boxies'] },
  { q:'What is the plural of "child"?',       a:'children',        opts:['children','childs','childes','child'] },
  { q:'Choose the correct word: "She ___ to school every day."', a:'goes', opts:['go','goes','gone','going'] },
  { q:'Choose the correct word: "They ___ playing."', a:'are',     opts:['is','are','was','am'] },
  { q:'Which sentence needs a capital letter?', a:'my name is Tom.', opts:['my name is Tom.','My name is Tom.','my Name is Tom.','my name is tom.'] },
  { q:'Which word is a describing word (adjective)?', a:'fluffy',  opts:['fluffy','run','slowly','jump'] },
  { q:'"Run" is a verb. Which is also a verb?', a:'jump',          opts:['jump','tall','happy','red'] },
  { q:'A sentence starts with a ___.',        a:'capital letter',  opts:['capital letter','full stop','comma','question mark'] },
  { q:'Which word is spelled correctly?',     a:'because',         opts:['because','becaus','becaues','becaase'] },
];

// ── Grade 3 English (Age 7-8) ─────────────────
const ENG_G3 = [
  // Spelling (UK KS2 Word List)
  { q:'Which is spelled correctly?', ctx:'She is a very ___ person.', a:'beautiful', opts:['beautiful','beutiful','beautifull','beatiful'] },
  { q:'Which is spelled correctly?', ctx:'That is a ___ idea!', a:'different', opts:['different','diferent','diffrent','diferrent'] },
  { q:'Which is spelled correctly?', ctx:'Can you ___ me why?', a:'explain',   opts:['explain','explaine','explane','explayn'] },
  { q:'Which is spelled correctly?', ctx:'We had a great ___.', a:'experience', opts:['experience','experiance','experiece','experence'] },
  { q:'Which is spelled correctly?', ctx:'I need to ___ more.', a:'practise',  opts:['practise','practize','practis','pracktise'] },
  // Vocabulary & Word Meanings
  { q:'What does "ancient" mean?',            a:'Very old',        opts:['Very old','Very new','Very big','Very small'] },
  { q:'What does "enormous" mean?',           a:'Very large',      opts:['Very large','Very tiny','Very fast','Very cold'] },
  { q:'What does "curious" mean?',            a:'Eager to learn or know', opts:['Eager to learn or know','Feeling sleepy','Feeling angry','Being very loud'] },
  { q:'What does "miserable" mean?',          a:'Very unhappy',    opts:['Very unhappy','Very excited','Very hungry','Very bored'] },
  { q:'What is the prefix "un-" used for?',   a:'To mean "not"',   opts:['To mean "not"','To mean "again"','To mean "before"','To mean "after"'] },
  { q:'What does "unhappy" mean?',            a:'Not happy',       opts:['Not happy','Very happy','Too happy','Quite happy'] },
  { q:'Which word has the prefix "re-" meaning "again"?', a:'rewrite', opts:['rewrite','receive','reach','ready'] },
  // Grammar
  { q:'What is the past tense of "run"?',     a:'ran',             opts:['ran','runned','ranned','runs'] },
  { q:'What is the past tense of "go"?',      a:'went',            opts:['went','goed','gone','goes'] },
  { q:'What is the past tense of "eat"?',     a:'ate',             opts:['ate','eated','eaten','eats'] },
  { q:'"The dog barked loudly." What is the verb?', a:'barked',     opts:['barked','dog','loudly','The'] },
  { q:'What punctuation goes inside speech marks?', a:'What the character says', opts:['What the character says','The full stop of every sentence','A new paragraph','The author\'s thoughts'] },
  { q:'What is the plural of "leaf"?',        a:'leaves',          opts:['leaves','leafs','leafes','leaf'] },
  { q:'What is the plural of "foot"?',        a:'feet',            opts:['feet','foots','footies','foot'] },
  { q:'"She quickly ran home." What type of word is "quickly"?', a:'adverb', opts:['adverb','adjective','noun','verb'] },
];

// ── Grade 4 English (Age 8-9) ─────────────────
const ENG_G4 = [
  // Spelling (Common Grade 4 words)
  { q:'Which is spelled correctly?', ctx:'The answer is ___ correct.', a:'definitely',  opts:['definitely','definately','definatley','definitly'] },
  { q:'Which is spelled correctly?', ctx:'It is ___ to be kind.',     a:'necessary',   opts:['necessary','nessesary','neccessary','necesary'] },
  { q:'Which is spelled correctly?', ctx:'The ___ was very funny.',   a:'occasion',    opts:['occasion','occassion','ocasion','occacion'] },
  { q:'Which is spelled correctly?', ctx:'I need to ___ more often.', a:'exercise',    opts:['exercise','excercise','exersize','exercize'] },
  { q:'Which is spelled correctly?', ctx:'She has great ___ in science.', a:'knowledge', opts:['knowledge','knowlege','knowledg','nowledge'] },
  // Vocabulary
  { q:'What does "reluctant" mean?',          a:'Unwilling to do something', opts:['Unwilling to do something','Very excited','Happy to help','Moving very fast'] },
  { q:'What does "persevere" mean?',          a:'To keep trying despite difficulty', opts:['To keep trying despite difficulty','To stop immediately','To move quickly','To sleep soundly'] },
  { q:'What does "ferocious" mean?',          a:'Extremely fierce',opts:['Extremely fierce','Very gentle','Quite sleepy','Extremely silly'] },
  { q:'What does "predict" mean?',            a:'To say what will happen before it does', opts:['To say what will happen before it does','To forget something','To make something appear','To draw a picture'] },
  { q:'What is a homophone?',                 a:'A word that sounds like another but has a different meaning', opts:['A word that sounds like another but has a different meaning','A very long word','A word with no vowels','A word that rhymes'] },
  { q:'Which pair are homophones?',           a:'there / their',  opts:['there / their','happy / sad','run / walk','big / large'] },
  { q:'Which word uses the suffix "-ful" correctly?', a:'careful', opts:['careful','carful','carefull','carfull'] },
  // Grammar
  { q:'Which sentence uses the apostrophe correctly?', a:"It's a lovely day.", opts:["It's a lovely day.","Its a lovely day.","Its' a lovely day.","It'is a lovely day."] },
  { q:'"The cat\'s bowl is empty." The apostrophe shows...', a:'Possession (it belongs to the cat)', opts:['Possession (it belongs to the cat)','A missing letter','Plural form','A question'] },
  { q:'Which word is a conjunction?',         a:'because',         opts:['because','happy','quickly','beautiful'] },
  { q:'"The cat sat on the mat." What is the subject?', a:'The cat', opts:['The cat','sat','on the mat','the mat'] },
  { q:'Which sentence is in the future tense?', a:'She will dance at the show.', opts:['She will dance at the show.','She danced at the show.','She dances at the show.','She is dancing.'] },
  { q:'What does a comma do in a list?',      a:'Separates items in a list', opts:['Separates items in a list','Ends a sentence','Shows surprise','Replaces a letter'] },
  { q:'Which is an example of a simile?',     a:'She ran as fast as a cheetah.', opts:['She ran as fast as a cheetah.','Time is a thief.','The sun smiled down.','The angry sea roared.'] },
  { q:'"Unhappy", "redo", "preview" — these words have...', a:'Prefixes', opts:['Prefixes','Suffixes','Root words','Homophones'] },
];

// ── Grade 5 English (Age 9-10) ─────────────────
const ENG_G5 = [
  // Spelling
  { q:'Which is spelled correctly?', ctx:'I felt ___ when I won.',    a:'embarrassed', opts:['embarrassed','embarased','embarrased','embarassed'] },
  { q:'Which is spelled correctly?', ctx:'The ___ is very cold.',     a:'temperature', opts:['temperature','tempature','temprature','temperaure'] },
  { q:'Which is spelled correctly?', ctx:'We need to protect the ___.', a:'environment', opts:['environment','enviroment','enviornment','environmint'] },
  { q:'Which is spelled correctly?', ctx:'I was ___ surprised.',      a:'especially',  opts:['especially','especialy','espesially','especiallly'] },
  { q:'Which is spelled correctly?', ctx:'The ___ was very long.',    a:'parliament',  opts:['parliament','parliment','parlamente','parlaiment'] },
  // Vocabulary
  { q:'What does "vivid" mean?',              a:'Very bright and clear', opts:['Very bright and clear','Extremely dark','Rather boring','Quite dull'] },
  { q:'What does "deduce" mean?',             a:'To work out using reasoning', opts:['To work out using reasoning','To make a mistake','To write quickly','To paint a picture'] },
  { q:'What does "accurate" mean?',           a:'Exactly correct and precise', opts:['Exactly correct and precise','Completely wrong','Very slow','Quite loud'] },
  { q:'What does "triumph" mean?',            a:'A great victory or success', opts:['A great victory or success','A big failure','A long journey','A quiet moment'] },
  { q:'Which word is a synonym of "huge"?',   a:'enormous',        opts:['enormous','tiny','quick','dull'] },
  { q:'Which word is an antonym of "ancient"?', a:'modern',        opts:['modern','old','historic','past'] },
  { q:'Which word is an antonym of "generous"?', a:'selfish',      opts:['selfish','giving','kind','caring'] },
  // Grammar
  { q:'Which sentence uses the past tense correctly?', a:'Yesterday, she baked a cake.', opts:['Yesterday, she baked a cake.','Yesterday, she bake a cake.','Yesterday, she bakes a cake.','Yesterday, she is baking a cake.'] },
  { q:'Which sentence is in passive voice?', a:'The cake was eaten by the children.', opts:['The cake was eaten by the children.','The children ate the cake.','The children are eating the cake.','The children will eat the cake.'] },
  { q:'What is a metaphor?',                  a:'Saying something IS something else to describe it', opts:['Saying something IS something else to describe it','Comparing two things using "like" or "as"','A sound word like "bang"','Exaggerating for effect'] },
  { q:'Which is a metaphor?',                 a:'Time is a thief.',opts:['Time is a thief.','She ran like the wind.','The wind howled.','He is as tall as a tree.'] },
  { q:'Which is personification?',            a:'The wind whispered through the trees.', opts:['The wind whispered through the trees.','She ran as fast as a cheetah.','Life is a rollercoaster.','He was extremely tall.'] },
  { q:'What is the purpose of a colon (:)?',  a:'To introduce a list or explanation', opts:['To introduce a list or explanation','To join two words','To show a question','To end a sentence'] },
  { q:'"Although it was raining, we went outside." The word "although" is a...', a:'subordinating conjunction', opts:['subordinating conjunction','preposition','adjective','noun'] },
];

// ── Grade 6 English (Age 10-11) ───────────────
const ENG_G6 = [
  // Spelling
  { q:'Which is spelled correctly?', ctx:'This is a ___ decision.', a:'conscientious', opts:['conscientious','consientious','conscienctious','consciencious'] },
  { q:'Which is spelled correctly?', ctx:'The word was hard to ___.', a:'pronunciation', opts:['pronunciation','pronounciation','prononciation','pronunceation'] },
  { q:'Which is spelled correctly?', ctx:'It was an ___ achievement.', a:'extraordinary', opts:['extraordinary','extrodinary','extraordinery','extraordanary'] },
  { q:'Which is spelled correctly?', ctx:'She spoke with great ___.', a:'eloquence',    opts:['eloquence','elequence','eloguence','eloquance'] },
  // Vocabulary
  { q:'What does "benevolent" mean?',         a:'Well-meaning and kind', opts:['Well-meaning and kind','Extremely cruel','Very confused','Quite boring'] },
  { q:'What does "diligent" mean?',           a:'Hardworking and careful', opts:['Hardworking and careful','Very lazy','Extremely loud','Rather clumsy'] },
  { q:'What does "ambiguous" mean?',          a:'Having more than one possible meaning', opts:['Having more than one possible meaning','Absolutely clear','Very simple','Extremely loud'] },
  { q:'What does "inevitable" mean?',         a:'Certain to happen; unavoidable', opts:['Certain to happen; unavoidable','Easily prevented','Very surprising','Quite unusual'] },
  { q:'What does "eloquent" mean?',           a:'Fluent and persuasive in speaking', opts:['Fluent and persuasive in speaking','Unable to speak clearly','Very loud','Extremely quiet'] },
  { q:'What is the opposite of "benevolent"?', a:'malevolent', opts:['malevolent','kind','generous','friendly'] },
  { q:'What is the root of "biography"?',     a:'"bio" (life) + "graphy" (writing)', opts:['"bio" (life) + "graphy" (writing)','"bio" (two) + "graphy" (picture)','"bi" (water) + "graphy" (story)','"bios" (time) + "graphy" (reading)'] },
  // Grammar
  { q:'Which sentence uses the subjunctive mood?', a:'I wish he were here.', opts:['I wish he were here.','I wish he was here.','I wish he is here.','I wish he will be here.'] },
  { q:'"Although it was raining, we went outside." The first clause is...', a:'A subordinate clause', opts:['A subordinate clause','A main clause','An independent clause','A relative clause'] },
  { q:'What is the passive voice of "The dog chased the cat"?', a:'The cat was chased by the dog.', opts:['The cat was chased by the dog.','The dog was chasing the cat.','The cat chased the dog.','The dog has chased the cat.'] },
  { q:'What is a relative clause introduced by?', a:'"who", "which", "that", or "whose"', opts:['"who", "which", "that", or "whose"','"and", "but", "or", "so"','"although", "because", "while"','"the", "a", "an"'] },
  { q:'Which is an example of hyperbole?',    a:'I have told you a million times!', opts:['I have told you a million times!','She ran as fast as a cheetah.','Life is a journey.','The stars winked at us.'] },
  { q:'What is the difference between formal and informal language?', a:'Formal uses proper grammar and is polite; informal is casual', opts:['Formal uses proper grammar and is polite; informal is casual','Formal is shorter; informal is longer','Formal has more adjectives; informal has fewer','There is no difference'] },
  { q:'What literary device is used in "Peter Piper picked a peck of pickled peppers"?', a:'Alliteration', opts:['Alliteration','Assonance','Onomatopoeia','Personification'] },
];

// ── Grade 7 English (Age 11-12) ───────────────
const ENG_G7 = [
  { q:'What is a "protagonist"?',             a:'The main character in a story', opts:['The main character in a story','The villain of a story','The narrator','A minor character'] },
  { q:'What is dramatic irony?',              a:'When the audience knows something characters do not', opts:['When the audience knows something characters do not','When a character says the opposite of what they mean','When events turn out opposite to expectations','When a story ends sadly'] },
  { q:'What is "diction" in writing?',        a:'The choice and use of words by a writer', opts:['The choice and use of words by a writer','The rhythm of sentences','The length of sentences','The use of punctuation'] },
  { q:'What is an "oxymoron"?',               a:'A figure of speech combining contradictory terms (e.g. "deafening silence")', opts:['A figure of speech combining contradictory terms (e.g. "deafening silence")','Exaggerating for effect','Comparing two things using "like"','A word that sounds like what it describes'] },
  { q:'What is "juxtaposition"?',             a:'Placing two contrasting ideas side by side', opts:['Placing two contrasting ideas side by side','Repeating the same consonant sound','Giving human qualities to objects','A type of metaphor'] },
  { q:'Which sentence contains a gerund?',    a:'Swimming is my favourite hobby.', opts:['Swimming is my favourite hobby.','She swam quickly.','She was swimming.','I will swim tomorrow.'] },
  { q:'What is a "clause"?',                  a:'A group of words with a subject and a verb', opts:['A group of words with a subject and a verb','A group of words without a verb','A word describing a noun','A word joining sentences'] },
  { q:'What is the difference between "affect" and "effect"?', a:'"Affect" is usually a verb; "effect" is usually a noun', opts:['"Affect" is usually a verb; "effect" is usually a noun','"Effect" is a verb; "affect" is a noun','They mean exactly the same thing','Both are only used as verbs'] },
  { q:'What is a "motif" in literature?',     a:'A recurring symbol, theme or idea throughout a text', opts:['A recurring symbol, theme or idea throughout a text','The climax of a story','A type of rhyme scheme','The setting of a story'] },
  { q:'Which of these is an example of sibilance?', a:'"Slowly and silently, the snake slithered."', opts:['"Slowly and silently, the snake slithered."','"The bomb exploded with a bang."','"Peter Piper picked peppers."','"I have told you a million times."'] },
  { q:'What does "omniscient narrator" mean?', a:'A narrator who knows the thoughts of all characters', opts:['A narrator who knows the thoughts of all characters','A narrator who is a character in the story','A narrator who only knows one character\'s thoughts','A narrator who only describes what is seen'] },
  { q:'In "Romeo and Juliet", what is the genre?', a:'Tragedy',   opts:['Tragedy','Comedy','Satire','Fairy tale'] },
  { q:'What is "allusion" in writing?',       a:'An indirect reference to a person, place, event or work', opts:['An indirect reference to a person, place, event or work','Repeating the same word for effect','Comparing unlike things','Describing something using all five senses'] },
  { q:'Which correctly uses a semicolon?',    a:'She was tired; she had not slept for two days.', opts:['She was tired; she had not slept for two days.','She was tired; and went to bed.','She was; very tired.','She; was tired.'] },
  { q:'What is the "denouement" of a story?', a:'The resolution after the climax', opts:['The resolution after the climax','The introduction of characters','The main conflict','The highest point of tension'] },
];

// ── Grade 8 English (Age 12-13) ───────────────
const ENG_G8 = [
  { q:'What is "pathetic fallacy"?',          a:'Using weather or nature to reflect a character\'s mood', opts:['Using weather or nature to reflect a character\'s mood','Giving human traits to animals only','An incorrect logical argument','Comparing two unlike things directly'] },
  { q:'What does "verisimilitude" mean?',     a:'The appearance of being true or real', opts:['The appearance of being true or real','An extremely complicated word','A form of satire','A type of verse'] },
  { q:'What is a "soliloquy"?',               a:'A speech where a character speaks their thoughts aloud alone on stage', opts:['A speech where a character speaks their thoughts aloud alone on stage','A conversation between two characters','A speech addressed directly to the audience','A long letter in a play'] },
  { q:'What is "syntax" in grammar?',         a:'The arrangement of words and phrases to create sentences', opts:['The arrangement of words and phrases to create sentences','The meaning of individual words','The study of sounds in language','The use of punctuation marks'] },
  { q:'What does "catharsis" mean in literature?', a:'The emotional release felt by an audience at the end of a tragedy', opts:['The emotional release felt by an audience at the end of a tragedy','The climax of a plot','A character\'s downfall','A moral lesson at the end of a fable'] },
  { q:'What is a "polysyllabic" word?',       a:'A word with more than one syllable', opts:['A word with more than one syllable','A word borrowed from another language','A word that sounds like what it means','A word with no vowels'] },
  { q:'Which sentence uses a dash correctly?', a:'She had one fear — failure.', opts:['She had one fear — failure.','She — had one fear failure.','She had — one — fear — failure.','She had one fear failure —.'] },
  { q:'What is "intertextuality"?',           a:'When one text makes reference to or is influenced by another text', opts:['When one text makes reference to or is influenced by another text','Writing between two books','A comparison of different authors','The study of very long texts'] },
  { q:'Which is an example of an "unreliable narrator"?',a:'A narrator who is biased or cannot be fully trusted', opts:['A narrator who is biased or cannot be fully trusted','A narrator who is omniscient','A third-person narrator','A first-person narrator who tells the truth'] },
  { q:'What is "iambic pentameter"?',         a:'A line of verse with 10 syllables in a da-DUM da-DUM pattern', opts:['A line of verse with 10 syllables in a da-DUM da-DUM pattern','A verse with 8 syllables per line','A type of rhyming couplet','Free verse with no rhythm'] },
  { q:'What is the function of a "foil" character?', a:'To highlight qualities of another character through contrast', opts:['To highlight qualities of another character through contrast','To provide comic relief','To summarise events at the end','To represent the author\'s views'] },
  { q:'What does "hubris" mean in Greek tragedy?', a:'Excessive pride leading to a character\'s downfall', opts:['Excessive pride leading to a character\'s downfall','Great courage in battle','A tragic flaw caused by fate','The hero\'s greatest achievement'] },
  { q:'Which is an example of "anachronism"?', a:'A character in Ancient Rome using a smartphone', opts:['A character in Ancient Rome using a smartphone','A modern character reading an old book','A historical novel written today','A story set in the future'] },
  { q:'What is "polyphony" in narrative?',    a:'Multiple voices or viewpoints within one text', opts:['Multiple voices or viewpoints within one text','A text written by multiple authors','A novel with many chapters','The use of dialect in writing'] },
  { q:'Which correctly identifies a "conditional sentence"?', a:'"If it rains, we will cancel the picnic."', opts:['"If it rains, we will cancel the picnic."','"It will rain tomorrow."','"It rained yesterday."','"We cancelled the picnic."'] },
];

// ── READING COMPREHENSION QUESTIONS ──────────────
// Short passages with MCQ — grades 3-8
const COMPREHENSION_BANK = [
  {
    grade: 3,
    context: 'Tom woke up early on Saturday. He looked outside and saw snow! He quickly put on his coat and boots and ran into the garden. He made a big snowman with a carrot nose.',
    questions: [
      { q:'What day did Tom wake up early?', a:'Saturday', opts:['Saturday','Sunday','Monday','Friday'] },
      { q:'What did Tom see when he looked outside?', a:'Snow', opts:['Snow','Rain','Sun','Wind'] },
      { q:'What did Tom make in the garden?', a:'A snowman', opts:['A snowman','A sandcastle','A fort','A snowball'] },
      { q:'What did Tom use for the snowman\'s nose?', a:'A carrot', opts:['A carrot','A button','A rock','A stick'] },
    ]
  },
  {
    grade: 4,
    context: 'The Amazon rainforest is the world\'s largest tropical rainforest. It covers most of northwestern Brazil. The forest is home to an amazing variety of plants and animals, including jaguars, anacondas, and thousands of species of birds.',
    questions: [
      { q:'Where is most of the Amazon rainforest located?', a:'Northwestern Brazil', opts:['Northwestern Brazil','Central Africa','Southeast Asia','Southern Australia'] },
      { q:'Which animal is mentioned as living in the Amazon?', a:'Jaguar', opts:['Jaguar','Polar bear','Elephant','Kangaroo'] },
      { q:'What type of rainforest is the Amazon?', a:'Tropical', opts:['Tropical','Temperate','Monsoon','Arctic'] },
    ]
  },
  {
    grade: 5,
    context: 'Marie Curie was a Polish-French scientist who conducted pioneering research on radioactivity. She was the first woman to win a Nobel Prize, and the only person to win Nobel Prizes in two different sciences — Physics in 1903 and Chemistry in 1911.',
    questions: [
      { q:'What subject did Marie Curie research?', a:'Radioactivity', opts:['Radioactivity','Gravity','Evolution','Electricity'] },
      { q:'How many Nobel Prizes did Marie Curie win?', a:'Two', opts:['Two','One','Three','Four'] },
      { q:'In which year did she win the Nobel Prize for Chemistry?', a:'1911', opts:['1911','1903','1921','1898'] },
      { q:'Marie Curie was the first woman to...', a:'Win a Nobel Prize', opts:['Win a Nobel Prize','Fly an aeroplane','Become a doctor','Climb Mount Everest'] },
    ]
  },
  {
    grade: 6,
    context: 'Climate change refers to long-term shifts in global temperatures and weather patterns. While some change is natural, since the mid-20th century human activities — particularly burning fossil fuels — have become the main driver of climate change.',
    questions: [
      { q:'What is the main human cause of climate change?', a:'Burning fossil fuels', opts:['Burning fossil fuels','Planting trees','Building cities','Farming animals'] },
      { q:'Since when have human activities been the main driver of climate change?', a:'Mid-20th century', opts:['Mid-20th century','Early 19th century','Late 18th century','21st century only'] },
      { q:'What does "climate change" refer to?', a:'Long-term shifts in global temperatures and weather', opts:['Long-term shifts in global temperatures and weather','Short daily weather changes','Seasonal rainfall patterns','Ocean currents only'] },
    ]
  },
  {
    grade: 7,
    context: '"To be, or not to be, that is the question: Whether \'tis nobler in the mind to suffer the slings and arrows of outrageous fortune, or to take arms against a sea of troubles." — Hamlet, William Shakespeare',
    questions: [
      { q:'Who wrote the play "Hamlet"?', a:'William Shakespeare', opts:['William Shakespeare','Charles Dickens','Jane Austen','Geoffrey Chaucer'] },
      { q:'What is Hamlet contemplating in this speech?', a:'Whether to endure life\'s struggles or fight back against them', opts:['Whether to endure life\'s struggles or fight back against them','Whether to go to war','Whether to marry Ophelia','Whether to leave Denmark'] },
      { q:'"Slings and arrows of outrageous fortune" is an example of...', a:'Metaphor', opts:['Metaphor','Simile','Alliteration','Onomatopoeia'] },
    ]
  },
  {
    grade: 8,
    context: 'George Orwell\'s "Animal Farm" (1945) is an allegorical novella in which farm animals overthrow their human farmer to establish an equal society. Over time, the pigs — particularly Napoleon — gradually take more power, eventually becoming indistinguishable from the humans they replaced. The famous line "All animals are equal, but some animals are more equal than others" encapsulates the novella\'s satirical critique of totalitarianism.',
    questions: [
      { q:'What is "Animal Farm" primarily an allegory of?', a:'The rise of totalitarianism and corruption of power', opts:['The rise of totalitarianism and corruption of power','Life on a real farm','World War II battles','Environmental destruction'] },
      { q:'What literary technique is "All animals are equal, but some animals are more equal" an example of?', a:'Irony/paradox', opts:['Irony/paradox','Simile','Alliteration','Onomatopoeia'] },
      { q:'What is a "novella"?', a:'A work of fiction longer than a short story but shorter than a novel', opts:['A work of fiction longer than a short story but shorter than a novel','A very long novel','A form of poetry','A non-fiction account'] },
    ]
  },
];

// ─── ENGLISH QUESTION SELECTOR ─────────────────

function getEnglishBankForGrade(grade) {
  const g = parseInt(grade);
  const banks = {
    1: ENG_G1,
    2: ENG_G2,
    3: ENG_G3,
    4: ENG_G4,
    5: ENG_G5,
    6: ENG_G6,
    7: ENG_G7,
    8: ENG_G8,
  };
  // Get questions for this grade + one grade below as buffer
  const primary = banks[g] || ENG_G5;
  const below   = g > 1 ? (banks[g - 1] || []) : [];
  return [...primary, ...below.slice(0, 5)];
}

function getComprehensionForGrade(grade) {
  const g = parseInt(grade);
  // Find comprehension passages at or near this grade
  const passages = COMPREHENSION_BANK.filter(p => Math.abs(p.grade - g) <= 1);
  if (!passages.length) return null;
  const passage = pick(passages);
  const question = pick(passage.questions);
  return {
    subject: 'english',
    type: 'comprehension',
    context: passage.context,
    question: question.q,
    answer: question.a,
    options: shuffle([...question.opts]),
  };
}

function generateEnglishQuestion(type, grade) {
  const g = parseInt(grade) || 3;

  // 20% chance of comprehension question for grades 3+
  if (g >= 3 && type !== 'spelling' && type !== 'vocabulary' && Math.random() < 0.2) {
    const comp = getComprehensionForGrade(grade);
    if (comp) return comp;
  }

  let pool = [];

  if (type === 'spelling') {
    // Filter from all grade banks for spelling-type questions
    pool = getEnglishBankForGrade(grade).filter(q => q.ctx);
    if (!pool.length) pool = getEnglishBankForGrade(grade);
  } else if (type === 'vocabulary') {
    pool = getEnglishBankForGrade(grade).filter(q =>
      q.q.includes('mean?') || q.q.includes('opposite') || q.q.includes('synonym') || q.q.includes('antonym')
    );
    if (!pool.length) pool = getEnglishBankForGrade(grade);
  } else if (type === 'grammar') {
    pool = getEnglishBankForGrade(grade).filter(q =>
      !q.q.includes('spelled') && !q.ctx && !q.q.includes('mean?')
    );
    if (!pool.length) pool = getEnglishBankForGrade(grade);
  } else {
    // mixed-english: use everything
    pool = getEnglishBankForGrade(grade);
  }

  if (!pool.length) pool = ENG_G4; // fallback

  const q = pick(pool);
  return {
    subject: 'english',
    type: q.type || type,
    context: q.ctx || null,
    question: q.q,
    answer: q.a,
    options: shuffle([...q.opts]),
  };
}

// Exported functions used by app.js (by name)
function genSpelling(grade)    { return generateEnglishQuestion('spelling',   grade); }
function genVocabulary(grade)  { return generateEnglishQuestion('vocabulary', grade); }
function genGrammar(grade)     { return generateEnglishQuestion('grammar',    grade); }

// ─── MATH QUESTION ROUTER ──────────────────────
function generateMathQuestion(topic, grade) {
  if (topic === 'mixed-math') {
    const g = parseInt(grade);
    const choices = g >= 5
      ? ['addition','subtraction','multiplication','division','fractions','word']
      : g >= 3
        ? ['addition','subtraction','multiplication','division','word']
        : ['addition','subtraction','multiplication'];
    topic = pick(choices);
  }
  switch (topic) {
    case 'addition':       return genAddition(grade);
    case 'subtraction':    return genSubtraction(grade);
    case 'multiplication': return genMultiplication(grade);
    case 'division':       return genDivision(grade);
    case 'fractions':      return genFractions(grade);
    case 'word':           return genWordProblem(grade);
    default:               return genAddition(grade);
  }
}

// ─── MAIN QUIZ BUILDER ─────────────────────────
function buildQuiz(subject, topic, grade, count = 20) {
  const questions = [];
  const seen = new Set();
  for (let i = 0; i < count; i++) {
    let q;
    let attempts = 0;
    do {
      if (subject === 'math') {
        q = generateMathQuestion(topic, grade);
      } else {
        q = generateEnglishQuestion(topic, grade);
      }
      attempts++;
    } while (seen.has(q.question) && attempts < 15);
    seen.add(q.question);
    q.id = i;
    questions.push(q);
  }
  return questions;
}
