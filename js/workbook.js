/* =============================================
   RADT Quest – Printable Workbook Generator
   Uses jsPDF (loaded from CDN) to produce a
   nicely-formatted PDF workbook in the browser.
   ============================================= */

// ─── COLOUR PALETTE ───────────────────────────
const WB = {
  purple : [108,  92, 231],
  green  : [ 88, 204,   2],
  blue   : [ 28, 176, 246],
  orange : [255, 150,   0],
  dark   : [ 30,  30,  45],
  mid    : [ 99, 110, 130],
  light  : [245, 246, 250],
  white  : [255, 255, 255],
  line   : [220, 224, 235],
};

// ─── QUESTION BANK (self-contained, no dependency on questions.js)
// Math generators mirror questions.js logic so this file is standalone
// ──────────────────────────────────────────────────────────────────

function wb_rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function wb_shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function wb_makeOpts(correct, ...wrongs) {
  return wb_shuffle([String(correct), ...wrongs.map(String)]);
}

// ── MATH ──────────────────────────────────────
function wb_mathQuestion(grade) {
  const g = parseInt(grade);
  const topic = g <= 2
    ? wb_rand(0,1)   // add/sub only
    : g <= 4
    ? wb_rand(0,3)   // add/sub/mul/div
    : wb_rand(0,4);  // + fractions/word

  if (topic === 0) return wb_addition(g);
  if (topic === 1) return wb_subtraction(g);
  if (topic === 2) return wb_multiplication(g);
  if (topic === 3) return wb_division(g);
  return wb_wordProblem(g);
}

function wb_addition(g) {
  const max = g <= 1 ? 10 : g <= 2 ? 20 : g <= 3 ? 100 : g <= 5 ? 999 : 9999;
  const a = wb_rand(1, max), b = wb_rand(1, max);
  const ans = a + b;
  return {
    q: `${a} + ${b} = ?`,
    answer: String(ans),
    options: wb_makeOpts(ans, ans+1, ans-1, ans+10)
  };
}

function wb_subtraction(g) {
  const max = g <= 1 ? 10 : g <= 2 ? 20 : g <= 3 ? 100 : g <= 5 ? 999 : 9999;
  const b = wb_rand(1, max), a = b + wb_rand(1, max);
  const ans = a - b;
  return {
    q: `${a} − ${b} = ?`,
    answer: String(ans),
    options: wb_makeOpts(ans, ans+1, ans-1, ans+2)
  };
}

function wb_multiplication(g) {
  const [lo, hi] = g <= 3 ? [2,5] : g <= 5 ? [2,10] : [2,12];
  const a = wb_rand(lo, hi), b = wb_rand(lo, hi);
  const ans = a * b;
  return {
    q: `${a} × ${b} = ?`,
    answer: String(ans),
    options: wb_makeOpts(ans, ans+a, ans-b, ans+(a+1))
  };
}

function wb_division(g) {
  const max = g <= 4 ? 5 : g <= 6 ? 10 : 12;
  const b = wb_rand(2, max), ans = wb_rand(2, max);
  const a = b * ans;
  return {
    q: `${a} ÷ ${b} = ?`,
    answer: String(ans),
    options: wb_makeOpts(ans, ans+1, ans-1, ans+2)
  };
}

function wb_wordProblem(g) {
  const names   = ['Liam','Amara','Noah','Sofia','Ben','Priya','Oliver','Chloe'];
  const things  = ['apples','stickers','books','marbles','coins','pencils','sweets','cards'];
  const name1   = names[wb_rand(0, names.length-1)];
  const name2   = names.filter(n => n !== name1)[wb_rand(0, names.length-2)];
  const thing   = things[wb_rand(0, things.length-1)];

  if (g <= 4) {
    const a = wb_rand(5,30), b = wb_rand(1,20);
    return {
      q: `${name1} has ${a} ${thing}. ${name2} gives them ${b} more. How many ${thing} does ${name1} have now?`,
      answer: String(a + b),
      options: wb_makeOpts(a+b, a+b+1, a+b-1, a+b+2)
    };
  } else if (g <= 6) {
    const packs = wb_rand(3,8), each = wb_rand(4,9);
    const total = packs * each;
    return {
      q: `${name1} buys ${packs} packs of ${thing}. Each pack has ${each} ${thing}. How many ${thing} in total?`,
      answer: String(total),
      options: wb_makeOpts(total, total+each, total-packs, total+packs)
    };
  } else {
    const x = wb_rand(3, 12), coeff = wb_rand(2, 5), extra = wb_rand(1, 10);
    const ans = coeff * x + extra;
    return {
      q: `If ${coeff}x + ${extra} = ${ans}, what is x?`,
      answer: String(x),
      options: wb_makeOpts(x, x+1, x-1, x+2)
    };
  }
}

// ── ENGLISH ───────────────────────────────────
const WB_ENG = {
  '1': [
    { q:'Which word rhymes with "cat"?',            answer:'bat',        options:['bat','dog','sun','cup'] },
    { q:'What is the plural of "cat"?',             answer:'cats',       options:['cats','cates','catts','cat'] },
    { q:'Pick the correct spelling:',               answer:'dog',        options:['dog','dogg','doge','dg'] },
    { q:'Which word is a colour?',                  answer:'red',        options:['red','run','sad','big'] },
    { q:'"The sun ___ brightly." Which word fits?', answer:'shines',     options:['shines','shine','shined','shining'] },
    { q:'Which word rhymes with "hat"?',            answer:'mat',        options:['mat','bag','pin','cup'] },
    { q:'What is the plural of "dog"?',             answer:'dogs',       options:['dogs','dogges','doges','dog'] },
    { q:'Which letter does "apple" start with?',   answer:'A',          options:['A','B','C','D'] },
    { q:'Which word is an animal?',                 answer:'frog',       options:['frog','fast','soft','blue'] },
    { q:'"She ___ to school." Which fits?',         answer:'goes',       options:['goes','go','going','gone'] },
  ],
  '2': [
    { q:'Correct spelling of a close companion:',  answer:'friend',     options:['friend','freind','frend','frriend'] },
    { q:'Correct spelling: "see you ___"',          answer:'tomorrow',   options:['tomorrow','tommorow','tomorow','tommorrow'] },
    { q:'Plural of "child":',                       answer:'children',   options:['children','childs','childes','child'] },
    { q:'"She ___ very fast." Correct verb:',       answer:'runs',       options:['runs','run','running','ran'] },
    { q:'Correct spelling – happening once a year:',answer:'birthday',   options:['birthday','birthsday','birtday','birthdai'] },
    { q:'Which is the correct sentence?',          answer:'I am happy.', options:['I am happy.','i am happy.','I Am Happy.','i Am happy.'] },
    { q:'Plural of "box":',                         answer:'boxes',      options:['boxes','boxs','boxies','box'] },
    { q:'Correct spelling of a large grey animal:', answer:'elephant',   options:['elephant','elefant','elephent','eliphant'] },
    { q:'"They ___ playing outside." Correct verb:',answer:'are',        options:['are','is','am','be'] },
    { q:'Correct spelling – opposite of sad:',      answer:'happy',      options:['happy','happi','hapey','hapy'] },
  ],
  '3': [
    { q:'Correct spelling – very pretty:',          answer:'beautiful',  options:['beautiful','beautifull','beutiful','beautful'] },
    { q:'Correct spelling – not the same:',         answer:'different',  options:['different','diferent','diffrent','differnt'] },
    { q:'What does the prefix "un-" mean?',         answer:'not',        options:['not','again','before','after'] },
    { q:'Past tense of "go":',                      answer:'went',       options:['went','goed','gone','go'] },
    { q:'Correct spelling – a common number:',      answer:'eight',      options:['eight','eit','eigh','eiht'] },
    { q:'What does the prefix "re-" mean?',         answer:'again',      options:['again','not','before','under'] },
    { q:'Correct spelling – month after January:',  answer:'February',   options:['February','Febuary','Februry','Feburary'] },
    { q:'Past tense of "come":',                    answer:'came',       options:['came','comed','come','coming'] },
    { q:'What is a synonym of "big"?',              answer:'large',      options:['large','tiny','cold','slow'] },
    { q:'Correct spelling – fast speed:',           answer:'quick',      options:['quick','quik','qwick','quic'] },
  ],
  '4': [
    { q:'Correct spelling – 100% certain:',         answer:'definitely', options:['definitely','definately','definitly','definiteley'] },
    { q:'Correct spelling – something essential:',  answer:'necessary',  options:['necessary','neccessary','necesary','neccesary'] },
    { q:'Which is the correct homophone? "I ___ you at the park."', answer:'saw', options:['saw','soar','sore','sow'] },
    { q:'Where does the apostrophe go? "The girls ___ book":', answer:"girl's book", options:["girl's book","girls book","girls' book","girl book"] },
    { q:'Which conjunction shows contrast?',        answer:'although',   options:['although','and','because','so'] },
    { q:'What is a simile?',                        answer:'A comparison using "like" or "as"', options:['A comparison using "like" or "as"','A word that sounds like what it means','Giving objects human qualities','An exaggerated statement'] },
    { q:'Correct spelling – to obtain something:',  answer:'receive',    options:['receive','recieve','receve','reciave'] },
    { q:'Which word is an adverb?',                 answer:'quickly',    options:['quickly','quick','quicker','quicken'] },
    { q:'Which is a compound sentence?',            answer:'I like cats, and she likes dogs.', options:['I like cats, and she likes dogs.','Because I was tired.','Running fast.','The cat.'] },
    { q:'Correct spelling – to make sure:',         answer:'ensure',     options:['ensure','insure','inshure','ensurr'] },
  ],
  '5': [
    { q:'Which sentence is in the passive voice?',  answer:'The ball was kicked by Tom.', options:['The ball was kicked by Tom.','Tom kicked the ball.','Tom is kicking the ball.','Tom will kick the ball.'] },
    { q:'What is a metaphor?',                      answer:'A direct comparison without "like" or "as"', options:['A direct comparison without "like" or "as"','A comparison using "like" or "as"','Giving objects human qualities','Repeating consonant sounds'] },
    { q:'What is personification?',                 answer:'Giving human qualities to non-human things', options:['Giving human qualities to non-human things','A very large exaggeration','Comparing two things directly','A word that imitates a sound'] },
    { q:'Correct use of a colon:',                  answer:'I need three things: flour, eggs, and butter.', options:['I need three things: flour, eggs, and butter.','I need: three, things.','I: need three things.','I need three things flour eggs and butter.'] },
    { q:'Which word is a subordinating conjunction?', answer:'although', options:['although','and','but','or'] },
    { q:'Correct spelling – describing atmosphere:', answer:'atmosphere', options:['atmosphere','atmosfere','atmospher','atmospere'] },
    { q:'What does "imply" mean?',                  answer:'To suggest something indirectly', options:['To suggest something indirectly','To state something directly','To ask a question','To describe an action'] },
    { q:'Which sentence contains a relative clause?', answer:'The book, which I borrowed, was great.', options:['The book, which I borrowed, was great.','I read a book.','She runs fast.','He is tall.'] },
    { q:'What is alliteration?',                    answer:'Repeating the same starting consonant sound', options:['Repeating the same starting consonant sound','Words that rhyme','A word that sounds like what it means','A long description'] },
    { q:'Correct spelling – completely separate:',  answer:'independent', options:['independent','independant','independant','indipendent'] },
  ],
  '6': [
    { q:'What is the subjunctive mood used for?',   answer:'Expressing wishes, hypotheticals or demands', options:['Expressing wishes, hypotheticals or demands','Describing past actions','Asking direct questions','Listing items'] },
    { q:'Identify the relative clause: "The girl who won the race is my sister."', answer:'"who won the race"', options:['"who won the race"','"The girl"','"is my sister"','"my sister"'] },
    { q:'What is hyperbole?',                       answer:'Deliberate and obvious exaggeration', options:['Deliberate and obvious exaggeration','A comparison using "like"','Giving objects human qualities','Repeating consonant sounds'] },
    { q:'Which register is formal?',                answer:'I would be grateful if you could attend.', options:['I would be grateful if you could attend.','Can u come pls?','Hey, wanna come?','Drop by if u want.'] },
    { q:'Correct spelling – scientifically aware:',answer:'conscientious', options:['conscientious','consientious','consciencious','conscientous'] },
    { q:'What is the effect of a rhetorical question?', answer:'To engage the reader and make them think', options:['To engage the reader and make them think','To provide a direct answer','To list facts','To describe a setting'] },
    { q:'Which correctly uses a semicolon?',        answer:'I love reading; my sister prefers sport.', options:['I love reading; my sister prefers sport.','I love; reading my sister prefers sport.','I love reading my; sister prefers sport.','I love reading, my sister; prefers sport.'] },
    { q:'What does "omniscient narrator" mean?',    answer:'A narrator who knows everything about all characters', options:['A narrator who knows everything about all characters','A narrator who is also a character','A narrator who only describes actions','A narrator with limited knowledge'] },
    { q:'Correct spelling – very hungry:',          answer:'famished',   options:['famished','fammished','famised','famisched'] },
    { q:'What is juxtaposition?',                   answer:'Placing contrasting ideas side by side', options:['Placing contrasting ideas side by side','Repeating a word for effect','A very obvious exaggeration','Comparing two different things'] },
  ],
  '7': [
    { q:'What is dramatic irony?',                  answer:'When the audience knows something the character does not', options:['When the audience knows something the character does not','When a character says the opposite of what they mean','When events turn out opposite to expectations','When a narrator describes ironic events'] },
    { q:'What is an oxymoron?',                     answer:'A phrase with two contradictory terms', options:['A phrase with two contradictory terms','An extreme exaggeration','A comparison using "like"','A narrator who knows everything'] },
    { q:'What is a soliloquy?',                     answer:'A speech revealing a character\'s inner thoughts', options:['A speech revealing a character\'s inner thoughts','A conversation between two characters','A description of a setting','A speech made to another character'] },
    { q:'Which word is a gerund?',                  answer:'swimming',   options:['swimming','swam','swum','swim'] },
    { q:'Correct spelling – the main character:',  answer:'protagonist', options:['protagonist','protaganist','protagonest','protaginist'] },
    { q:'What does "foreshadowing" mean?',          answer:'Hints about events that will happen later', options:['Hints about events that will happen later','Describing a character\'s appearance','Repeating a phrase for effect','A very descriptive passage'] },
    { q:'Which correctly uses a dash for emphasis?', answer:'She had one goal — to win.', options:['She had one goal — to win.','She — had one goal to win.','She had — one goal to win.','She had one — goal to win.'] },
    { q:'What is the effect of short sentences in tense writing?', answer:'They create pace and urgency', options:['They create pace and urgency','They slow the reader down','They give more description','They explain complex ideas'] },
    { q:'Correct spelling – to accept reluctantly:', answer:'acquiesce', options:['acquiesce','acquiesse','aqueisce','acquiessce'] },
    { q:'What is "stream of consciousness" writing?', answer:'Unstructured narration reflecting a character\'s thoughts', options:['Unstructured narration reflecting a character\'s thoughts','A formal essay style','A description using all five senses','A factual recount'] },
  ],
  '8': [
    { q:'What is "pathetic fallacy"?',              answer:'Using weather/nature to reflect a character\'s mood', options:['Using weather/nature to reflect a character\'s mood','Exaggerating a character\'s emotions','A false belief held by a character','Comparing a character to nature'] },
    { q:'What is "catharsis" in drama?',            answer:'The audience\'s emotional release at the end', options:['The audience\'s emotional release at the end','The hero\'s tragic flaw','The turning point of a play','A speech given by the villain'] },
    { q:'What is "hubris"?',                        answer:'Excessive pride that leads to a character\'s downfall', options:['Excessive pride that leads to a character\'s downfall','A character\'s moment of realisation','A contrast between two characters','The resolution of a conflict'] },
    { q:'What is iambic pentameter?',               answer:'10-syllable lines with alternating unstressed/stressed beats', options:['10-syllable lines with alternating unstressed/stressed beats','Lines that rhyme at the end','8-syllable lines with no set pattern','A form of free verse poetry'] },
    { q:'What is "anachronism"?',                   answer:'Something placed in the wrong historical period', options:['Something placed in the wrong historical period','A character who acts against type','A form of irony','An error in spelling'] },
    { q:'What does "verisimilitude" mean?',         answer:'The appearance of being true or real', options:['The appearance of being true or real','An exaggerated description','A symbolic object','A character\'s inner conflict'] },
    { q:'Which is an example of a Byronic hero?',  answer:'A brooding, rebellious, flawed but attractive figure', options:['A brooding, rebellious, flawed but attractive figure','An entirely virtuous knight','A comic sidekick','A naive protagonist'] },
    { q:'What is the difference between "theme" and "motif"?', answer:'Theme is the central idea; motif is a recurring symbol', options:['Theme is the central idea; motif is a recurring symbol','Theme is a character trait; motif is the plot','Both mean the same thing','Theme is in poetry; motif is in prose'] },
    { q:'Correct spelling – opposite of certain:',  answer:'ambiguous',  options:['ambiguous','ambigious','ambigous','ambigiuos'] },
    { q:'What is "free indirect discourse"?',       answer:'Narrating a character\'s thoughts in third person', options:['Narrating a character\'s thoughts in third person','Dialogue with no speech marks','A first-person narrator','Stage directions in a play'] },
  ]
};

function wb_englishQuestion(grade) {
  const bank = WB_ENG[String(grade)] || WB_ENG['4'];
  return bank[wb_rand(0, bank.length - 1)];
}

// ─── BUILD QUESTION SET ───────────────────────
function wb_buildQuestions(subject, grade, n = 20) {
  const qs = [];
  const seen = new Set();
  let attempts = 0;
  while (qs.length < n && attempts < n * 10) {
    attempts++;
    const q = subject === 'math'
      ? wb_mathQuestion(grade)
      : wb_englishQuestion(grade);
    if (!seen.has(q.q)) {
      seen.add(q.q);
      qs.push(q);
    }
  }
  // If not enough unique English, allow repeats
  while (qs.length < n) {
    qs.push(subject === 'math' ? wb_mathQuestion(grade) : wb_englishQuestion(grade));
  }
  return qs;
}

// ─── PDF GENERATION ───────────────────────────
function generateWorkbookPDF(subject, grade) {
  if (typeof window.jspdf === 'undefined' && typeof jsPDF === 'undefined') {
    alert('PDF library is still loading. Please try again in a moment!');
    return;
  }

  const { jsPDF } = window.jspdf || window;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210, H = 297;
  const MARGIN = 18;
  const CONTENT_W = W - MARGIN * 2;

  const subjectLabel = subject === 'math' ? 'Mathematics' : 'English';
  const subjectEmoji = subject === 'math' ? '🧮' : '📖';
  const questions = wb_buildQuestions(subject, grade, 20);
  const today = new Date().toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' });

  // ─── HELPER FUNCTIONS ────────────────────────
  function hex(rgb) {
    return '#' + rgb.map(v => v.toString(16).padStart(2,'0')).join('');
  }
  function setFont(style, size, color) {
    doc.setFont('helvetica', style || 'normal');
    doc.setFontSize(size || 11);
    doc.setTextColor(...(color || WB.dark));
  }
  function fillRect(x, y, w, h, color) {
    doc.setFillColor(...color);
    doc.roundedRect(x, y, w, h, 2, 2, 'F');
  }
  function line(x1, y1, x2, y2, color, lw) {
    doc.setDrawColor(...(color || WB.line));
    doc.setLineWidth(lw || 0.3);
    doc.line(x1, y1, x2, y2);
  }

  // ─────────────────────────────────────────────
  // PAGE 1 – COVER
  // ─────────────────────────────────────────────
  // Purple gradient-style header block
  doc.setFillColor(...WB.purple);
  doc.rect(0, 0, W, 80, 'F');

  // Decorative accent bar
  doc.setFillColor(...WB.green);
  doc.rect(0, 76, W, 6, 'F');

  // Brand logo area
  setFont('bold', 28, WB.white);
  doc.text('RADT', MARGIN, 32);
  setFont('bold', 28, WB.green);
  doc.text('Quest', MARGIN + 28, 32);

  // Tagline
  setFont('normal', 11, [200, 200, 255]);
  doc.text('Learn · Play · Win!', MARGIN, 41);

  // Subject badge
  doc.setFillColor(...WB.green);
  doc.roundedRect(MARGIN, 51, 50, 14, 3, 3, 'F');
  setFont('bold', 12, WB.white);
  doc.text(subjectLabel.toUpperCase(), MARGIN + 4, 60);

  // Grade badge
  doc.setFillColor(...WB.orange);
  doc.roundedRect(MARGIN + 55, 51, 38, 14, 3, 3, 'F');
  setFont('bold', 12, WB.white);
  doc.text(`GRADE ${grade}`, MARGIN + 59, 60);

  // ── Main cover content ──
  let cy = 100;

  setFont('bold', 22, WB.dark);
  doc.text(`${subjectLabel} Workbook`, MARGIN, cy);
  cy += 8;

  setFont('normal', 13, WB.mid);
  doc.text(`Grade ${grade} Practice Pack  ·  20 Questions`, MARGIN, cy);
  cy += 14;

  // Info boxes row
  const boxW = 50, boxH = 28, boxGap = 8;
  const infos = [
    { icon: '📋', label: '20 Questions', sub: 'Multiple choice' },
    { icon: '⏱', label: '30 Minutes',   sub: 'Suggested time'  },
    { icon: '🎯', label: `Grade ${grade}`,  sub: 'Curriculum level'},
    { icon: '✏️', label: 'Print & Use',  sub: 'Answer key inside'},
  ];
  infos.forEach((info, i) => {
    const bx = MARGIN + i * (boxW + boxGap);
    fillRect(bx, cy, boxW, boxH, WB.light);
    setFont('bold', 14, WB.purple);
    doc.text(info.icon, bx + 5, cy + 9);
    setFont('bold', 9, WB.dark);
    doc.text(info.label, bx + 5, cy + 17);
    setFont('normal', 8, WB.mid);
    doc.text(info.sub, bx + 5, cy + 23);
  });
  cy += boxH + 14;

  // Student info form
  doc.setFillColor(...WB.purple);
  doc.roundedRect(MARGIN, cy, CONTENT_W, 7, 2, 2, 'F');
  setFont('bold', 10, WB.white);
  doc.text('STUDENT DETAILS', MARGIN + 4, cy + 5);
  cy += 13;

  const fields = ['Name', 'Class / Year', 'Date', 'Score          /20'];
  fields.forEach((f, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const fx = MARGIN + col * (CONTENT_W / 2 + 5);
    const fy = cy + row * 18;
    setFont('bold', 9, WB.mid);
    doc.text(f + ':', fx, fy);
    line(fx, fy + 3, fx + CONTENT_W / 2 - 8, fy + 3, WB.purple, 0.5);
  });
  cy += 42;

  // Instructions box
  fillRect(MARGIN, cy, CONTENT_W, 38, WB.light);
  setFont('bold', 10, WB.purple);
  doc.text('📌 Instructions', MARGIN + 5, cy + 8);
  setFont('normal', 9, WB.dark);
  const instructions = [
    '• Read each question carefully before choosing your answer.',
    '• Circle the letter (A, B, C or D) of the correct answer.',
    '• Work through all 20 questions — do not skip any.',
    '• Check your answers using the Answer Key on the last page.',
  ];
  instructions.forEach((ins, i) => doc.text(ins, MARGIN + 5, cy + 16 + i * 6));
  cy += 48;

  // Footer note
  setFont('italic', 8, WB.mid);
  doc.text(`Generated on ${today}  ·  RADT Quest  ·  radtquest.com`, MARGIN, cy);
  doc.text('Page 1 of 3', W - MARGIN, cy, { align: 'right' });

  // ─────────────────────────────────────────────
  // PAGES 2-3 – QUESTIONS
  // ─────────────────────────────────────────────
  const LETTERS = ['A', 'B', 'C', 'D'];

  function pageHeader(pageNum) {
    doc.addPage();
    doc.setFillColor(...WB.purple);
    doc.rect(0, 0, W, 14, 'F');
    setFont('bold', 10, WB.white);
    doc.text(`RADT Quest  ·  ${subjectLabel} Grade ${grade}  ·  Questions`, MARGIN, 9);
    setFont('normal', 8, [200,200,255]);
    doc.text(`Page ${pageNum} of 3`, W - MARGIN, 9, { align: 'right' });
    return 22; // return starting y
  }

  function drawQuestion(doc, qNum, q, x, y, colW) {
    // Question box header
    const qLabel = `Q${qNum}`;
    doc.setFillColor(...(qNum % 2 === 1 ? WB.purple : WB.blue));
    doc.roundedRect(x, y, colW, 7, 2, 2, 'F');
    setFont('bold', 9, WB.white);
    doc.text(qLabel, x + 3, y + 5);

    // Question text
    y += 9;
    setFont('normal', 9, WB.dark);
    const wrapped = doc.splitTextToSize(q.q, colW - 4);
    doc.text(wrapped, x + 2, y);
    y += wrapped.length * 5 + 2;

    // Options A–D
    q.options.slice(0, 4).forEach((opt, i) => {
      // Circle
      doc.setDrawColor(...WB.purple);
      doc.setLineWidth(0.4);
      doc.circle(x + 5, y - 1.5, 3, 'S');
      setFont('bold', 8, WB.purple);
      doc.text(LETTERS[i], x + 3.6, y - 0.5);

      // Option text
      setFont('normal', 8.5, WB.dark);
      const optWrapped = doc.splitTextToSize(opt, colW - 14);
      doc.text(optWrapped, x + 11, y);
      y += optWrapped.length * 4.5 + 2;
    });

    // Thin separator
    y += 2;
    line(x, y, x + colW, y, WB.line, 0.2);
    return y + 4;
  }

  // Page 2: Q1–Q10
  let py = pageHeader(2);
  const colW = (CONTENT_W - 8) / 2;

  for (let i = 0; i < 10; i++) {
    const col = i < 5 ? 0 : 1;
    const qx  = MARGIN + col * (colW + 8);
    if (i === 0 || i === 5) py = 22;
    py = drawQuestion(doc, i + 1, questions[i], qx, py, colW);
  }

  // Page 3: Q11–Q20
  py = pageHeader(3);
  for (let i = 10; i < 20; i++) {
    const col = i < 15 ? 0 : 1;
    const qx  = MARGIN + col * (colW + 8);
    if (i === 10 || i === 15) py = 22;
    py = drawQuestion(doc, i + 1, questions[i], qx, py, colW);
  }

  // ─────────────────────────────────────────────
  // PAGE 4 – ANSWER KEY
  // ─────────────────────────────────────────────
  doc.addPage();

  // Header
  doc.setFillColor(...WB.green);
  doc.rect(0, 0, W, 14, 'F');
  setFont('bold', 11, WB.white);
  doc.text('✅  Answer Key', MARGIN, 9);
  setFont('normal', 8, [200, 255, 200]);
  doc.text(`${subjectLabel} – Grade ${grade}  ·  Page 4 of 3`, W - MARGIN, 9, { align: 'right' });

  let ay = 26;
  setFont('bold', 13, WB.dark);
  doc.text('Answers', MARGIN, ay);
  ay += 4;
  line(MARGIN, ay, W - MARGIN, ay, WB.purple, 0.6);
  ay += 8;

  // Answer grid – 4 columns of 5
  const cols = 4, perCol = 5;
  const aColW = CONTENT_W / cols;

  for (let c = 0; c < cols; c++) {
    let ay2 = ay;
    for (let r = 0; r < perCol; r++) {
      const idx = c * perCol + r;
      if (idx >= questions.length) break;
      const q   = questions[idx];
      const ans = q.answer;
      const letter = LETTERS[q.options.slice(0,4).indexOf(ans)];
      const ax  = MARGIN + c * aColW;

      // Number circle
      doc.setFillColor(...WB.purple);
      doc.circle(ax + 5, ay2 - 1.5, 4, 'F');
      setFont('bold', 9, WB.white);
      doc.text(String(idx + 1), ax + 3.5, ay2 - 0.5);

      // Letter badge
      doc.setFillColor(...WB.green);
      doc.roundedRect(ax + 12, ay2 - 5, 10, 7, 1, 1, 'F');
      setFont('bold', 9, WB.white);
      doc.text(letter || '?', ax + 15, ay2 - 0.5);

      // Answer text (truncated)
      setFont('normal', 8, WB.dark);
      const shortAns = ans.length > 22 ? ans.substring(0, 20) + '…' : ans;
      doc.text(shortAns, ax + 25, ay2 - 0.5);

      ay2 += 14;
    }
  }

  ay += perCol * 14 + 8;

  // Score box
  fillRect(MARGIN, ay, CONTENT_W, 36, WB.light);
  setFont('bold', 11, WB.purple);
  doc.text('📊 Score Guide', MARGIN + 5, ay + 8);

  const grades2 = [
    { range: '18–20', grade: 'A+', desc: 'Outstanding!' , color: WB.green  },
    { range: '16–17', grade: 'A',  desc: 'Excellent!'   , color: WB.blue   },
    { range: '14–15', grade: 'B',  desc: 'Great Work!'  , color: WB.purple },
    { range: '11–13', grade: 'C',  desc: 'Good Try!'    , color: WB.orange },
    { range: '0–10',  grade: 'D',  desc: 'Keep Practising!', color: [200,80,80] },
  ];
  const sgW = CONTENT_W / grades2.length;
  grades2.forEach((sg, i) => {
    const sx = MARGIN + i * sgW;
    doc.setFillColor(...sg.color);
    doc.roundedRect(sx + 2, ay + 14, sgW - 4, 16, 2, 2, 'F');
    setFont('bold', 10, WB.white);
    doc.text(sg.grade, sx + sgW / 2 - 3, ay + 22);
    setFont('normal', 7, WB.white);
    doc.text(sg.range, sx + sgW / 2 - 5, ay + 27);
  });

  ay += 50;

  // Footer branding
  doc.setFillColor(...WB.purple);
  doc.rect(0, H - 20, W, 20, 'F');
  setFont('bold', 11, WB.white);
  doc.text('RADT', MARGIN, H - 10);
  setFont('bold', 11, WB.green);
  doc.text('Quest', MARGIN + 18, H - 10);
  setFont('normal', 8, [180, 180, 220]);
  doc.text('Learn · Play · Win!  ·  Free printable workbooks at radtquest.com', MARGIN + 42, H - 10);
  setFont('normal', 8, [180, 180, 220]);
  doc.text(`Generated ${today}`, W - MARGIN, H - 10, { align: 'right' });

  // ─── SAVE ─────────────────────────────────────
  const filename = `RADTQuest_${subjectLabel}_Grade${grade}_Workbook.pdf`;
  doc.save(filename);
}

// ─── UI CONTROLLER ────────────────────────────
let wb_selectedSubject = null;
let wb_selectedGrade   = null;

function wbSelectSubject(subj, el) {
  wb_selectedSubject = subj;
  document.querySelectorAll('.wb-subj-btn').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  wbCheckReady();
}

function wbSelectGrade(grade, el) {
  wb_selectedGrade = grade;
  document.querySelectorAll('.wb-grade-btn').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  wbCheckReady();
}

function wbCheckReady() {
  const btn = document.getElementById('wb-download-btn');
  if (!btn) return;
  if (wb_selectedSubject && wb_selectedGrade) {
    btn.disabled = false;
    btn.innerHTML = `<i class="fas fa-file-pdf"></i> Download Grade ${wb_selectedGrade} ${wb_selectedSubject === 'math' ? 'Maths' : 'English'} Workbook`;
  } else {
    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-file-pdf"></i> Choose Subject &amp; Grade to Download`;
  }
}

function wbDownload() {
  if (!wb_selectedSubject || !wb_selectedGrade) return;
  const btn = document.getElementById('wb-download-btn');
  const orig = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF…';
  btn.disabled = true;
  setTimeout(() => {
    try {
      generateWorkbookPDF(wb_selectedSubject, wb_selectedGrade);
    } catch (e) {
      console.error(e);
      alert('PDF generation failed: ' + e.message);
    }
    btn.innerHTML = orig;
    btn.disabled = false;
  }, 50);
}
