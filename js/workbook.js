/* =============================================
   RADT Quest - Printable Workbook Generator
   Uses jsPDF (loaded from CDN)
   NOTE: NO emoji characters in PDF text - jsPDF
   built-in Helvetica does not support them.
   All PDF text uses plain ASCII / Latin-1 only.
   ============================================= */

// ---- COLOUR PALETTE --------------------------
const WB = {
  purple : [108,  92, 231],
  green  : [ 88, 204,   2],
  blue   : [ 28, 176, 246],
  orange : [255, 150,   0],
  red    : [231,  76,  60],
  dark   : [ 30,  30,  45],
  mid    : [ 99, 110, 130],
  light  : [245, 246, 250],
  white  : [255, 255, 255],
  line   : [220, 224, 235],
};

// Letter badge colours per option A/B/C/D
const WB_OPT_COLORS = [
  [108,  92, 231],  // A - purple
  [ 28, 176, 246],  // B - blue
  [255, 150,   0],  // C - orange
  [ 88, 204,   2],  // D - green
];

// ---- HELPERS ---------------------------------
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
// Remove any character outside Latin-1 range so jsPDF does not render black boxes
function wb_safe(str) {
  return String(str).replace(/[^\u0000-\u00FF]/g, '?');
}

// ---- MATH GENERATORS -------------------------
function wb_addition(g) {
  const max = g <= 1 ? 10 : g <= 2 ? 20 : g <= 3 ? 100 : g <= 5 ? 999 : 9999;
  const a = wb_rand(1, max), b = wb_rand(1, max);
  const ans = a + b;
  return { type:'addition', q:`${a} + ${b} = ?`, answer: String(ans),
    options: wb_makeOpts(ans, ans+1, ans-1, ans+10) };
}

function wb_subtraction(g) {
  const max = g <= 1 ? 10 : g <= 2 ? 20 : g <= 3 ? 100 : g <= 5 ? 999 : 9999;
  const b = wb_rand(1, max), a = b + wb_rand(1, max);
  const ans = a - b;
  return { type:'subtraction', q:`${a} - ${b} = ?`, answer: String(ans),
    options: wb_makeOpts(ans, ans+1, ans-1, ans+2) };
}

function wb_multiplication(g) {
  const [lo, hi] = g <= 3 ? [2,5] : g <= 5 ? [2,10] : [2,12];
  const a = wb_rand(lo, hi), b = wb_rand(lo, hi), ans = a * b;
  return { type:'multiplication', q:`${a} x ${b} = ?`, answer: String(ans),
    options: wb_makeOpts(ans, ans+a, ans-b, ans+(a+1)) };
}

function wb_division(g) {
  const max = g <= 4 ? 5 : g <= 6 ? 10 : 12;
  const b = wb_rand(2, max), ans = wb_rand(2, max), a = b * ans;
  return { type:'division', q:`${a} / ${b} = ?`, answer: String(ans),
    options: wb_makeOpts(ans, ans+1, ans-1, ans+2) };
}

function wb_wordProblem(g) {
  const names  = ['Liam','Amara','Noah','Sofia','Ben','Priya','Oliver','Chloe'];
  const things = ['apples','stickers','books','marbles','coins','pencils','sweets','cards'];
  const n1 = names[wb_rand(0, names.length-1)];
  const n2 = names.filter(n => n !== n1)[wb_rand(0, names.length-2)];
  const th = things[wb_rand(0, things.length-1)];
  if (g <= 4) {
    const a = wb_rand(5,30), b = wb_rand(1,20);
    return { type:'word-problems',
      q:`${n1} has ${a} ${th}. ${n2} gives them ${b} more. How many ${th} does ${n1} have now?`,
      answer: String(a+b), options: wb_makeOpts(a+b, a+b+1, a+b-1, a+b+2) };
  } else if (g <= 6) {
    const packs = wb_rand(3,8), each = wb_rand(4,9), total = packs * each;
    return { type:'word-problems',
      q:`${n1} buys ${packs} packs of ${th}. Each pack has ${each} ${th}. How many ${th} in total?`,
      answer: String(total), options: wb_makeOpts(total, total+each, total-packs, total+packs) };
  } else {
    const x = wb_rand(3,12), coeff = wb_rand(2,5), extra = wb_rand(1,10);
    const ans = coeff * x + extra;
    return { type:'word-problems',
      q:`If ${coeff}x + ${extra} = ${ans}, what is x?`,
      answer: String(x), options: wb_makeOpts(x, x+1, x-1, x+2) };
  }
}

function wb_mathQuestion(grade, topic) {
  const g = parseInt(grade);
  if (topic === 'addition')       return wb_addition(g);
  if (topic === 'subtraction')    return wb_subtraction(g);
  if (topic === 'multiplication') return wb_multiplication(g);
  if (topic === 'division')       return wb_division(g);
  if (topic === 'word-problems')  return wb_wordProblem(g);
  // mixed-math: grade-appropriate mix
  const pool = g <= 2
    ? [wb_addition, wb_subtraction]
    : g <= 4
    ? [wb_addition, wb_subtraction, wb_multiplication, wb_division]
    : [wb_addition, wb_subtraction, wb_multiplication, wb_division, wb_wordProblem];
  return pool[wb_rand(0, pool.length-1)](g);
}

// ---- ENGLISH BANKS ---------------------------
// Each question tagged with type: spelling | vocabulary | grammar
const WB_ENG = {
  '1': [
    { type:'spelling',    q:'Which word is spelled correctly for a pet that barks?', answer:'dog',     options:['dog','dogg','doge','dg'] },
    { type:'spelling',    q:'Which word is spelled correctly for a furry pet?',      answer:'cat',     options:['cat','catt','kat','cet'] },
    { type:'vocabulary',  q:'Which word rhymes with "cat"?',                         answer:'bat',     options:['bat','dog','sun','cup'] },
    { type:'vocabulary',  q:'Which word is a colour?',                               answer:'red',     options:['red','run','sad','big'] },
    { type:'vocabulary',  q:'Which word is an animal?',                              answer:'frog',    options:['frog','fast','soft','blue'] },
    { type:'grammar',     q:'"The sun ___ brightly." Which word fits?',              answer:'shines',  options:['shines','shine','shined','shining'] },
    { type:'grammar',     q:'"She ___ to school." Which fits?',                     answer:'goes',    options:['goes','go','going','gone'] },
    { type:'grammar',     q:'What is the plural of "cat"?',                         answer:'cats',    options:['cats','cates','catts','cat'] },
    { type:'spelling',    q:'Which word rhymes with "hat"?',                        answer:'mat',     options:['mat','bag','pin','cup'] },
    { type:'grammar',     q:'Which letter does "apple" start with?',                answer:'A',       options:['A','B','C','D'] },
  ],
  '2': [
    { type:'spelling',    q:'Correct spelling of a close companion:',               answer:'friend',   options:['friend','freind','frend','frriend'] },
    { type:'spelling',    q:'Correct spelling for "see you ___":',                  answer:'tomorrow', options:['tomorrow','tommorow','tomorow','tommorrow'] },
    { type:'grammar',     q:'Plural of "child":',                                   answer:'children', options:['children','childs','childes','child'] },
    { type:'grammar',     q:'"She ___ very fast." Correct verb:',                   answer:'runs',     options:['runs','run','running','ran'] },
    { type:'spelling',    q:'Correct spelling - happening once a year:',            answer:'birthday', options:['birthday','birthsday','birtday','birthdai'] },
    { type:'grammar',     q:'Which is the correct sentence?',                       answer:'I am happy.', options:['I am happy.','i am happy.','I Am Happy.','i Am happy.'] },
    { type:'grammar',     q:'Plural of "box":',                                     answer:'boxes',   options:['boxes','boxs','boxies','box'] },
    { type:'spelling',    q:'Correct spelling of a large grey animal:',             answer:'elephant', options:['elephant','elefant','elephent','eliphant'] },
    { type:'grammar',     q:'"They ___ playing outside." Correct verb:',            answer:'are',     options:['are','is','am','be'] },
    { type:'vocabulary',  q:'Which word means the opposite of sad?',                answer:'happy',   options:['happy','angry','tired','cold'] },
  ],
  '3': [
    { type:'spelling',    q:'Correct spelling - very pretty:',                      answer:'beautiful',  options:['beautiful','beautifull','beutiful','beautful'] },
    { type:'spelling',    q:'Correct spelling - not the same:',                     answer:'different',  options:['different','diferent','diffrent','differnt'] },
    { type:'vocabulary',  q:'What does the prefix "un-" mean?',                     answer:'not',        options:['not','again','before','after'] },
    { type:'grammar',     q:'Past tense of "go":',                                  answer:'went',       options:['went','goed','gone','go'] },
    { type:'spelling',    q:'Correct spelling of the number after seven:',          answer:'eight',      options:['eight','eit','eigh','eiht'] },
    { type:'vocabulary',  q:'What does the prefix "re-" mean?',                     answer:'again',      options:['again','not','before','under'] },
    { type:'spelling',    q:'Correct spelling - second month of the year:',         answer:'February',   options:['February','Febuary','Februry','Feburary'] },
    { type:'grammar',     q:'Past tense of "come":',                                answer:'came',       options:['came','comed','come','coming'] },
    { type:'vocabulary',  q:'What is a synonym of "big"?',                          answer:'large',      options:['large','tiny','cold','slow'] },
    { type:'spelling',    q:'Correct spelling - meaning fast:',                     answer:'quick',      options:['quick','quik','qwick','quic'] },
  ],
  '4': [
    { type:'spelling',    q:'Correct spelling - 100% certain:',                     answer:'definitely', options:['definitely','definately','definitly','definiteley'] },
    { type:'spelling',    q:'Correct spelling - something essential:',              answer:'necessary',  options:['necessary','neccessary','necesary','neccesary'] },
    { type:'vocabulary',  q:'"I ___ you at the park." Which homophone is correct?', answer:'saw',        options:['saw','soar','sore','sow'] },
    { type:'grammar',     q:'Where does the apostrophe go in "The girls ___ book"?',answer:"girl's book",options:["girl's book","girls book","girls' book","girl book"] },
    { type:'vocabulary',  q:'Which conjunction shows contrast?',                    answer:'although',   options:['although','and','because','so'] },
    { type:'vocabulary',  q:'What is a simile?',                                    answer:'A comparison using "like" or "as"', options:['A comparison using "like" or "as"','A word that sounds like what it means','Giving objects human qualities','An exaggerated statement'] },
    { type:'spelling',    q:'Correct spelling - to get or obtain:',                 answer:'receive',    options:['receive','recieve','receve','reciave'] },
    { type:'grammar',     q:'Which word is an adverb?',                             answer:'quickly',    options:['quickly','quick','quicker','quicken'] },
    { type:'grammar',     q:'Which is a compound sentence?',                        answer:'I like cats, and she likes dogs.', options:['I like cats, and she likes dogs.','Because I was tired.','Running fast.','The cat.'] },
    { type:'spelling',    q:'Correct spelling - to make sure something happens:',   answer:'ensure',     options:['ensure','insure','inshure','ensurr'] },
  ],
  '5': [
    { type:'grammar',     q:'Which sentence is in the passive voice?',              answer:'The ball was kicked by Tom.', options:['The ball was kicked by Tom.','Tom kicked the ball.','Tom is kicking the ball.','Tom will kick the ball.'] },
    { type:'vocabulary',  q:'What is a metaphor?',                                  answer:'A direct comparison without "like" or "as"', options:['A direct comparison without "like" or "as"','A comparison using "like" or "as"','Giving objects human qualities','Repeating consonant sounds'] },
    { type:'vocabulary',  q:'What is personification?',                             answer:'Giving human qualities to non-human things', options:['Giving human qualities to non-human things','A very large exaggeration','Comparing two things directly','A word that imitates a sound'] },
    { type:'grammar',     q:'Correct use of a colon:',                              answer:'I need three things: flour, eggs, and butter.', options:['I need three things: flour, eggs, and butter.','I need: three, things.','I: need three things.','I need three things flour eggs and butter.'] },
    { type:'grammar',     q:'Which word is a subordinating conjunction?',           answer:'although',   options:['although','and','but','or'] },
    { type:'spelling',    q:'Correct spelling - the air surrounding the Earth:',    answer:'atmosphere', options:['atmosphere','atmosfere','atmospher','atmospere'] },
    { type:'vocabulary',  q:'What does "imply" mean?',                              answer:'To suggest something indirectly', options:['To suggest something indirectly','To state something directly','To ask a question','To describe an action'] },
    { type:'grammar',     q:'Which sentence contains a relative clause?',           answer:'The book, which I borrowed, was great.', options:['The book, which I borrowed, was great.','I read a book.','She runs fast.','He is tall.'] },
    { type:'vocabulary',  q:'What is alliteration?',                                answer:'Repeating the same starting consonant sound', options:['Repeating the same starting consonant sound','Words that rhyme','A word that sounds like what it means','A long description'] },
    { type:'spelling',    q:'Correct spelling - not relying on others:',            answer:'independent',options:['independent','independant','indipendent','independant'] },
  ],
  '6': [
    { type:'grammar',     q:'What is the subjunctive mood used for?',               answer:'Expressing wishes, hypotheticals or demands', options:['Expressing wishes, hypotheticals or demands','Describing past actions','Asking direct questions','Listing items'] },
    { type:'grammar',     q:'Identify the relative clause: "The girl who won the race is my sister."', answer:'"who won the race"', options:['"who won the race"','"The girl"','"is my sister"','"my sister"'] },
    { type:'vocabulary',  q:'What is hyperbole?',                                   answer:'Deliberate and obvious exaggeration', options:['Deliberate and obvious exaggeration','A comparison using "like"','Giving objects human qualities','Repeating consonant sounds'] },
    { type:'vocabulary',  q:'Which register is formal?',                            answer:'I would be grateful if you could attend.', options:['I would be grateful if you could attend.','Can u come pls?','Hey, wanna come?','Drop by if u want.'] },
    { type:'spelling',    q:'Correct spelling - very careful and thorough:',        answer:'conscientious', options:['conscientious','consientious','consciencious','conscientous'] },
    { type:'vocabulary',  q:'What is the effect of a rhetorical question?',         answer:'To engage the reader and make them think', options:['To engage the reader and make them think','To provide a direct answer','To list facts','To describe a setting'] },
    { type:'grammar',     q:'Which correctly uses a semicolon?',                    answer:'I love reading; my sister prefers sport.', options:['I love reading; my sister prefers sport.','I love; reading my sister prefers sport.','I love reading my; sister prefers sport.','I love reading, my sister; prefers sport.'] },
    { type:'vocabulary',  q:'What does "omniscient narrator" mean?',                answer:'A narrator who knows everything about all characters', options:['A narrator who knows everything about all characters','A narrator who is also a character','A narrator who only describes actions','A narrator with limited knowledge'] },
    { type:'spelling',    q:'Correct spelling - extremely hungry:',                 answer:'famished',   options:['famished','fammished','famised','famisched'] },
    { type:'vocabulary',  q:'What is juxtaposition?',                               answer:'Placing contrasting ideas side by side', options:['Placing contrasting ideas side by side','Repeating a word for effect','A very obvious exaggeration','Comparing two different things'] },
  ],
  '7': [
    { type:'vocabulary',  q:'What is dramatic irony?',                              answer:'When the audience knows something a character does not', options:['When the audience knows something a character does not','When a character says the opposite of what they mean','When events turn out opposite to expectations','When a narrator describes ironic events'] },
    { type:'vocabulary',  q:'What is an oxymoron?',                                 answer:'A phrase with two contradictory terms', options:['A phrase with two contradictory terms','An extreme exaggeration','A comparison using "like"','A narrator who knows everything'] },
    { type:'vocabulary',  q:'What is a soliloquy?',                                 answer:'A speech revealing a character\'s inner thoughts', options:['A speech revealing a character\'s inner thoughts','A conversation between two characters','A description of a setting','A speech made to another character'] },
    { type:'grammar',     q:'Which word is a gerund?',                              answer:'swimming',   options:['swimming','swam','swum','swim'] },
    { type:'spelling',    q:'Correct spelling - the main character in a story:',    answer:'protagonist',options:['protagonist','protaganist','protagonest','protaginist'] },
    { type:'vocabulary',  q:'What does "foreshadowing" mean?',                      answer:'Hints about events that will happen later', options:['Hints about events that will happen later','Describing a character\'s appearance','Repeating a phrase for effect','A very descriptive passage'] },
    { type:'grammar',     q:'Which correctly uses a dash for emphasis?',            answer:'She had one goal - to win.', options:['She had one goal - to win.','She - had one goal to win.','She had - one goal to win.','She had one - goal to win.'] },
    { type:'vocabulary',  q:'What is the effect of short sentences in tense writing?', answer:'They create pace and urgency', options:['They create pace and urgency','They slow the reader down','They give more description','They explain complex ideas'] },
    { type:'spelling',    q:'Correct spelling - to accept something reluctantly:',  answer:'acquiesce',  options:['acquiesce','acquiesse','aqueisce','acquiessce'] },
    { type:'vocabulary',  q:'What is "stream of consciousness" writing?',           answer:'Narrating a character\'s thoughts directly and freely', options:['Narrating a character\'s thoughts directly and freely','A formal essay style','A description using all five senses','A factual recount'] },
  ],
  '8': [
    { type:'vocabulary',  q:'What is "pathetic fallacy"?',                          answer:'Using weather or nature to reflect a character\'s mood', options:['Using weather or nature to reflect a character\'s mood','Exaggerating a character\'s emotions','A false belief held by a character','Comparing a character to nature'] },
    { type:'vocabulary',  q:'What is "catharsis" in drama?',                        answer:'The audience\'s emotional release at the climax or end', options:['The audience\'s emotional release at the climax or end','The hero\'s tragic flaw','The turning point of a play','A speech given by the villain'] },
    { type:'vocabulary',  q:'What is "hubris"?',                                    answer:'Excessive pride that leads to a character\'s downfall', options:['Excessive pride that leads to a character\'s downfall','A character\'s moment of realisation','A contrast between two characters','The resolution of a conflict'] },
    { type:'vocabulary',  q:'What is iambic pentameter?',                           answer:'10-syllable lines with alternating unstressed/stressed beats', options:['10-syllable lines with alternating unstressed/stressed beats','Lines that rhyme at the end','8-syllable lines with no set pattern','A form of free verse poetry'] },
    { type:'vocabulary',  q:'What is an "anachronism"?',                            answer:'Something placed in the wrong historical period', options:['Something placed in the wrong historical period','A character who acts against type','A form of irony','An error in spelling'] },
    { type:'vocabulary',  q:'What does "verisimilitude" mean?',                     answer:'The appearance of being true or real', options:['The appearance of being true or real','An exaggerated description','A symbolic object','A character\'s inner conflict'] },
    { type:'vocabulary',  q:'Which best describes a Byronic hero?',                 answer:'A brooding, rebellious, flawed but attractive figure', options:['A brooding, rebellious, flawed but attractive figure','An entirely virtuous knight','A comic sidekick','A naive protagonist'] },
    { type:'grammar',     q:'What is the difference between "theme" and "motif"?',  answer:'Theme is the central idea; motif is a recurring symbol', options:['Theme is the central idea; motif is a recurring symbol','Theme is a character trait; motif is the plot','Both mean the same thing','Theme is in poetry; motif is in prose'] },
    { type:'spelling',    q:'Correct spelling - open to more than one interpretation:', answer:'ambiguous', options:['ambiguous','ambigious','ambigous','ambigiuos'] },
    { type:'vocabulary',  q:'What is "free indirect discourse"?',                   answer:'Narrating a character\'s thoughts in third person', options:['Narrating a character\'s thoughts in third person','Dialogue with no speech marks','A first-person narrator','Stage directions in a play'] },
  ]
};

function wb_englishQuestion(grade, topic) {
  const bank = WB_ENG[String(grade)] || WB_ENG['4'];
  const filtered = topic && topic !== 'mixed-english'
    ? bank.filter(q => q.type === topic)
    : bank;
  const pool = filtered.length ? filtered : bank;
  return pool[wb_rand(0, pool.length - 1)];
}

// ---- BUILD QUESTION SET ----------------------
function wb_buildQuestions(subject, topic, grade, n) {
  const qs = [], seen = new Set();
  let attempts = 0;
  while (qs.length < n && attempts < n * 15) {
    attempts++;
    const q = subject === 'math'
      ? wb_mathQuestion(parseInt(grade), topic)
      : wb_englishQuestion(grade, topic);
    if (!seen.has(q.q)) {
      seen.add(q.q);
      qs.push(q);
    }
  }
  while (qs.length < n) {
    qs.push(subject === 'math'
      ? wb_mathQuestion(parseInt(grade), topic)
      : wb_englishQuestion(grade, topic));
  }
  return qs;
}

// ---- PDF GENERATION --------------------------
function generateWorkbookPDF(subject, topic, grade) {
  if (typeof window.jspdf === 'undefined' && typeof jsPDF === 'undefined') {
    alert('PDF library is still loading. Please wait a moment and try again.');
    return;
  }

  const { jsPDF } = window.jspdf || window;
  const doc  = new jsPDF({ unit: 'mm', format: 'a4' });
  const W    = 210, H = 297;
  const ML   = 16, MR = 16;      // margins left/right
  const CW   = W - ML - MR;       // content width
  const LETTERS = ['A', 'B', 'C', 'D'];

  const subjectLabel = subject === 'math' ? 'Mathematics' : 'English';
  const topicLabels  = {
    'mixed-math'    : 'Mixed Topics',
    'addition'      : 'Addition',
    'subtraction'   : 'Subtraction',
    'multiplication': 'Multiplication',
    'division'      : 'Division',
    'word-problems' : 'Word Problems',
    'mixed-english' : 'Mixed English',
    'spelling'      : 'Spelling',
    'vocabulary'    : 'Vocabulary',
    'grammar'       : 'Grammar',
  };
  const topicLabel = topicLabels[topic] || topic;
  const questions  = wb_buildQuestions(subject, topic, grade, 20);
  const today      = new Date().toLocaleDateString('en-GB',
    { day: 'numeric', month: 'long', year: 'numeric' });

  // ---- PDF draw helpers ----------------------
  function sf(style, size, rgb) {
    doc.setFont('helvetica', style || 'normal');
    doc.setFontSize(size || 11);
    doc.setTextColor(...(rgb || WB.dark));
  }
  function fillRR(x, y, w, h, rgb, rx) {
    doc.setFillColor(...rgb);
    doc.roundedRect(x, y, w, h, rx || 2, rx || 2, 'F');
  }
  function hLine(x1, y, x2, rgb, lw) {
    doc.setDrawColor(...(rgb || WB.line));
    doc.setLineWidth(lw || 0.25);
    doc.line(x1, y, x2, y);
  }

  // ================================================
  // PAGE 1 - COVER
  // ================================================
  // Header band
  doc.setFillColor(...WB.purple);
  doc.rect(0, 0, W, 72, 'F');

  // Accent stripe
  doc.setFillColor(...WB.green);
  doc.rect(0, 68, W, 5, 'F');

  // Brand name - ASCII only, no emoji
  sf('bold', 30, WB.white);
  doc.text('RADT', ML, 28);
  sf('bold', 30, WB.green);
  doc.text('Quest', ML + 32, 28);
  sf('normal', 10, [210, 210, 255]);
  doc.text('Learn  Play  Win', ML, 37);

  // Subject pill
  fillRR(ML, 46, 54, 13, WB.green, 3);
  sf('bold', 11, WB.white);
  doc.text(subjectLabel.toUpperCase(), ML + 4, 54.5);

  // Grade pill
  fillRR(ML + 59, 46, 36, 13, WB.orange, 3);
  sf('bold', 11, WB.white);
  doc.text('GRADE ' + grade, ML + 63, 54.5);

  // Topic pill
  fillRR(ML + 100, 46, 60, 13, [80, 60, 180], 3);
  sf('bold', 10, WB.white);
  doc.text(topicLabel.toUpperCase(), ML + 104, 54.5);

  // ---- Main cover body -----------------------
  let cy = 86;

  sf('bold', 20, WB.dark);
  doc.text(subjectLabel + ' Workbook', ML, cy);
  cy += 7;

  sf('normal', 11, WB.mid);
  doc.text('Grade ' + grade + '  |  ' + topicLabel + '  |  20 Questions', ML, cy);
  cy += 14;

  // Info boxes - plain text, no emoji
  const BOX_W = 43, BOX_H = 26, BOX_GAP = 4;
  const infoBoxes = [
    { top: '20',       bot1: 'Questions',   bot2: 'Multiple choice'  , col: WB.purple },
    { top: '30 min',   bot1: 'Time',        bot2: 'Suggested limit'   , col: WB.blue   },
    { top: 'Grade '+grade, bot1: 'Level',   bot2: 'Curriculum aligned', col: WB.orange },
    { top: 'A4',       bot1: 'Print Ready', bot2: 'Answer key inside' , col: WB.green  },
  ];
  infoBoxes.forEach((box, i) => {
    const bx = ML + i * (BOX_W + BOX_GAP);
    doc.setFillColor(...WB.light);
    doc.roundedRect(bx, cy, BOX_W, BOX_H, 3, 3, 'F');
    // Coloured top stripe
    doc.setFillColor(...box.col);
    doc.roundedRect(bx, cy, BOX_W, 8, 3, 3, 'F');
    doc.rect(bx, cy + 3, BOX_W, 5, 'F'); // fill bottom of stripe to make it flat-bottomed
    sf('bold', 9, WB.white);
    doc.text(box.top, bx + 4, cy + 6);
    sf('bold', 8, WB.dark);
    doc.text(box.bot1, bx + 4, cy + 15);
    sf('normal', 7, WB.mid);
    doc.text(box.bot2, bx + 4, cy + 21);
  });
  cy += BOX_H + 14;

  // Student details form
  fillRR(ML, cy, CW, 7, WB.purple, 2);
  sf('bold', 9, WB.white);
  doc.text('STUDENT DETAILS', ML + 4, cy + 5);
  cy += 12;

  const fieldPairs = [['Name', 'Class / Year'], ['Date', 'Score       /20']];
  fieldPairs.forEach(pair => {
    pair.forEach((label, col) => {
      const fx = ML + col * (CW / 2 + 4);
      sf('bold', 8, WB.mid);
      doc.text(label + ':', fx, cy);
      hLine(fx, cy + 3, fx + CW / 2 - 6, WB.purple, 0.4);
    });
    cy += 16;
  });
  cy += 4;

  // Instructions
  fillRR(ML, cy, CW, 36, WB.light, 3);
  sf('bold', 9, WB.purple);
  doc.text('Instructions', ML + 5, cy + 8);
  sf('normal', 8.5, WB.dark);
  [
    '1. Read each question carefully before choosing your answer.',
    '2. Circle the letter (A, B, C or D) of the correct answer.',
    '3. Work through all 20 questions - do not skip any.',
    '4. Check your answers using the Answer Key on the last page.',
  ].forEach((line, i) => doc.text(line, ML + 5, cy + 16 + i * 6));
  cy += 46;

  // Footer
  hLine(ML, cy, W - MR, WB.line, 0.4);
  cy += 5;
  sf('normal', 7.5, WB.mid);
  doc.text('Generated on ' + today + '  |  RADT Quest', ML, cy);
  sf('normal', 7.5, WB.mid);
  doc.text('Page 1', W - MR, cy, { align: 'right' });

  // ================================================
  // QUESTION PAGES (pages 2-3)
  // ================================================
  function addPageHeader(pageNum) {
    doc.addPage();
    doc.setFillColor(...WB.purple);
    doc.rect(0, 0, W, 12, 'F');
    sf('bold', 9, WB.white);
    doc.text('RADT Quest  |  ' + subjectLabel + ' Grade ' + grade + '  |  ' + topicLabel, ML, 8);
    sf('normal', 7.5, [200, 200, 255]);
    doc.text('Page ' + pageNum, W - MR, 8, { align: 'right' });
    return 18;
  }

  // Draw one question; returns new y position
  function drawQ(qNum, q, qx, qy, colW) {
    const headerCol = qNum % 2 === 1 ? WB.purple : WB.blue;

    // ── Banner (8 mm tall) ──────────────────────
    const BANNER_H = 8;
    fillRR(qx, qy, colW, BANNER_H, headerCol, 2);
    sf('bold', 10, WB.white);
    doc.text('Q' + qNum, qx + 4, qy + 5.8);   // baseline centred inside banner

    // ── Gap explanation ─────────────────────────
    // banner ends at qy + 8 mm
    // qy moves to qy + 8 + 9.5 = qy + 17.5
    // 10 pt cap-height ≈ 3.5 mm  →  text TOP = 9.5 - 3.5 = 6 mm below banner ✓
    qy += BANNER_H + 9.5;

    // ── Question text (10 pt, left-padded) ──────
    sf('normal', 10, WB.dark);
    const safeQ   = wb_safe(q.q);
    const wrapped = doc.splitTextToSize(safeQ, colW - 6);
    doc.text(wrapped, qx + 4, qy);
    qy += wrapped.length * 5 + 3;

    // ── Options A – D ────────────────────────────
    q.options.slice(0, 4).forEach((opt, i) => {
      const safeOpt = wb_safe(opt);

      // Letter badge
      doc.setFillColor(...WB_OPT_COLORS[i]);
      doc.roundedRect(qx + 4, qy - 4.8, 7, 6, 1.5, 1.5, 'F');
      sf('bold', 8.5, WB.white);
      doc.text(LETTERS[i], qx + 6.3, qy + 0.2);

      // Option text (9.5 pt)
      sf('normal', 9.5, WB.dark);
      const optLines = doc.splitTextToSize(safeOpt, colW - 16);
      doc.text(optLines, qx + 14, qy + 0.2);
      qy += optLines.length * 4.5 + 2;
    });

    // ── Separator ───────────────────────────────
    qy += 2;
    hLine(qx, qy, qx + colW, WB.line, 0.3);
    return qy + 4;
  }

  const COL_W   = (CW - 6) / 2;  // two columns per page
  let colY = [0, 0];              // independent y tracker per column

  function renderQPage(pageNum, startIdx, endIdx) {
    const startY = addPageHeader(pageNum);
    colY[0] = startY;
    colY[1] = startY;
    const perCol = 4;  // 4 questions per column keeps all content within 264 mm page height
    for (let i = startIdx; i < endIdx; i++) {
      const col  = i < startIdx + perCol ? 0 : 1;
      const colX = ML + col * (COL_W + 6);
      colY[col] = drawQ(i + 1, questions[i], colX, colY[col], COL_W);
    }
  }

  renderQPage(2,  0,  8);  // Q1-8   (4 per column)
  renderQPage(3,  8, 16);  // Q9-16  (4 per column)
  renderQPage(4, 16, 20);  // Q17-20 (4 in left column only)

  // ================================================
  // PAGE 5 - ANSWER KEY
  // ================================================
  doc.addPage();

  // Header
  doc.setFillColor(...WB.green);
  doc.rect(0, 0, W, 12, 'F');
  sf('bold', 10, WB.white);
  doc.text('Answer Key  |  ' + subjectLabel + ' Grade ' + grade + '  |  ' + topicLabel, ML, 8);
  sf('normal', 7.5, [200, 255, 200]);
  doc.text('Page 5', W - MR, 8, { align: 'right' });

  let ay = 22;
  sf('bold', 13, WB.dark);
  doc.text('Answers', ML, ay);
  ay += 4;
  hLine(ML, ay, W - MR, WB.purple, 0.5);
  ay += 8;

  // 4-column grid of answers
  const ACOLS = 4, APER = 5;
  const ACW = CW / ACOLS;

  for (let c = 0; c < ACOLS; c++) {
    let ry = ay;
    for (let r = 0; r < APER; r++) {
      const idx = c * APER + r;
      if (idx >= questions.length) break;
      const q      = questions[idx];
      const letter = LETTERS[q.options.slice(0,4).indexOf(q.answer)];
      const ax     = ML + c * ACW;

      // Question number circle
      fillRR(ax, ry - 5, 8, 7, WB.purple, 1.5);
      sf('bold', 8, WB.white);
      doc.text(String(idx + 1), ax + (idx + 1 >= 10 ? 1.5 : 2.8), ry + 0.2);

      // Answer letter badge
      fillRR(ax + 11, ry - 5, 9, 7, WB.green, 1.5);
      sf('bold', 9, WB.white);
      doc.text(letter || '?', ax + 14, ry + 0.2);

      // Answer text (truncated to fit)
      const safeAns = wb_safe(q.answer);
      const shortAns = safeAns.length > 26 ? safeAns.substring(0, 24) + '...' : safeAns;
      sf('normal', 7.5, WB.dark);
      doc.text(shortAns, ax + 23, ry + 0.2);

      ry += 13;
    }
  }

  ay += APER * 13 + 10;

  // Score guide
  fillRR(ML, ay, CW, 38, WB.light, 3);
  sf('bold', 10, WB.purple);
  doc.text('Score Guide', ML + 5, ay + 8);

  const scoreGuide = [
    { range:'18-20', grade:'A+', desc:'Outstanding!',    col: WB.green  },
    { range:'15-17', grade:'A',  desc:'Excellent!',      col: WB.blue   },
    { range:'12-14', grade:'B',  desc:'Great Work!',     col: WB.purple },
    { range:'8-11',  grade:'C',  desc:'Good Try!',       col: WB.orange },
    { range:'0-7',   grade:'D',  desc:'Keep Practising!',col: WB.red    },
  ];
  const sgW = CW / scoreGuide.length;
  scoreGuide.forEach((sg, i) => {
    const sx = ML + i * sgW;
    fillRR(sx + 2, ay + 14, sgW - 4, 18, sg.col, 2);
    sf('bold', 10, WB.white);
    doc.text(sg.grade, sx + sgW / 2 - 4, ay + 22);
    sf('normal', 7, WB.white);
    doc.text(sg.range, sx + sgW / 2 - 5, ay + 28);
  });

  // Footer branding band
  doc.setFillColor(...WB.purple);
  doc.rect(0, H - 18, W, 18, 'F');
  sf('bold', 11, WB.white);
  doc.text('RADT', ML, H - 8);
  sf('bold', 11, WB.green);
  doc.text('Quest', ML + 18, H - 8);
  sf('normal', 8, [180, 180, 230]);
  doc.text('Learn  Play  Win  |  Free printable workbooks at radtquest.com', ML + 40, H - 8);
  sf('normal', 7.5, [180, 180, 230]);
  doc.text('Generated ' + today, W - MR, H - 8, { align: 'right' });

  // ---- Save file ----------------------------
  const filename = 'RADTQuest_' + subjectLabel + '_' + topicLabel.replace(/ /g,'') + '_Grade' + grade + '.pdf';
  doc.save(filename);
}

// ---- UI STATE --------------------------------
let wb_selectedSubject = null;
let wb_selectedTopic   = null;
let wb_selectedGrade   = null;

function wbSelectSubject(subj, el) {
  wb_selectedSubject = subj;
  wb_selectedTopic   = null;
  wb_selectedGrade   = null;

  document.querySelectorAll('.wb-subj-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.wb-grade-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.wb-topic-btn').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');

  // Show relevant topic row, hide the other
  document.getElementById('wb-topic-step').style.display = 'block';
  document.getElementById('wb-math-topics').style.display    = subj === 'math'    ? 'flex' : 'none';
  document.getElementById('wb-english-topics').style.display = subj === 'english' ? 'flex' : 'none';

  // Hide grade until topic chosen
  document.getElementById('wb-grade-step').style.display = 'none';

  wbCheckReady();
}

function wbSelectTopic(topic, el) {
  wb_selectedTopic = topic;
  document.querySelectorAll('.wb-topic-btn').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');

  // Reveal grade selector
  document.getElementById('wb-grade-step').style.display = 'block';
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
  const ready = wb_selectedSubject && wb_selectedTopic && wb_selectedGrade;
  btn.disabled = !ready;
  if (ready) {
    const subLabel   = wb_selectedSubject === 'math' ? 'Maths' : 'English';
    const topicLabels = {
      'mixed-math':'Mixed','addition':'Addition','subtraction':'Subtraction',
      'multiplication':'Multiplication','division':'Division','word-problems':'Word Problems',
      'mixed-english':'Mixed','spelling':'Spelling','vocabulary':'Vocabulary','grammar':'Grammar'
    };
    btn.innerHTML = '<i class="fas fa-file-pdf"></i> Download: Grade ' + wb_selectedGrade + ' ' + subLabel + ' - ' + (topicLabels[wb_selectedTopic] || wb_selectedTopic);
    document.getElementById('wb-download-step').style.display = 'block';
  } else {
    btn.innerHTML = '<i class="fas fa-file-pdf"></i> Choose Subject, Topic &amp; Grade to Download';
  }
}

function wbDownload() {
  if (!wb_selectedSubject || !wb_selectedTopic || !wb_selectedGrade) return;
  const btn  = document.getElementById('wb-download-btn');
  const orig = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
  btn.disabled  = true;
  setTimeout(() => {
    try {
      generateWorkbookPDF(wb_selectedSubject, wb_selectedTopic, wb_selectedGrade);
    } catch (e) {
      console.error(e);
      alert('PDF generation failed: ' + e.message);
    }
    btn.innerHTML = orig;
    btn.disabled  = false;
  }, 50);
}
