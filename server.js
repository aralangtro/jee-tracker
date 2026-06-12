require('dotenv').config();
const express  = require('express');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const https    = require('https');

const app    = express();
const PORT   = 5714;
const upload = multer({ dest: 'uploads/', limits: { fileSize: 25 * 1024 * 1024 } });

app.use(express.json({ limit: '10mb' }));
app.get('/favicon.ico', (req, res) => res.status(204).end());
app.use(express.static(path.join(__dirname, 'public')));

// ── AI Model & API Configuration ─────────────────────────────────
const NIM_TEXT_MODEL   = process.env.TEXT_MODEL || 'meta/llama-3.3-70b-instruct';
const NIM_VISION_MODEL = process.env.VISION_MODEL || 'meta/llama-3.2-90b-vision-instruct';
const NIM_BASE_URL     = process.env.API_BASE_URL || 'integrate.api.nvidia.com';
const API_PATH         = process.env.API_PATH || '/v1/chat/completions';

// ── Default server-side keys (user can override via browser) ─────
const DEFAULT_REASON_KEY = process.env.NVIDIA_REASON_KEY || '';
const DEFAULT_VISION_KEY = process.env.NVIDIA_VISION_KEY || '';

// ── Key helpers ──────────────────────────────────────────────────
function getVisionKey(req) {
  return req.headers['x-vision-key'] || req.headers['x-reason-key'] ||
         req.headers['x-api-key'] || DEFAULT_VISION_KEY || DEFAULT_REASON_KEY;
}
function getReasonKey(req) {
  return req.headers['x-reason-key'] || req.headers['x-vision-key'] ||
         req.headers['x-api-key'] || DEFAULT_REASON_KEY;
}

// ── Generic AI API call (OpenAI/NIM/Gemini + Anthropic adapter) ──
function nimFetch(apiKey, payload) {
  return new Promise((resolve, reject) => {
    const isAnthropic = NIM_BASE_URL.includes('anthropic');
    
    let bodyObj = payload;
    let path = API_PATH;
    let headers = {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${apiKey}`
    };

    if (isAnthropic) {
      path = '/v1/messages';
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
      delete headers['Authorization'];
      
      let anthropicMessages = [];
      let systemPrompt = '';
      
      payload.messages.forEach(msg => {
        if (msg.role === 'system') systemPrompt += msg.content + '\n';
        else {
           let content = msg.content;
           if (Array.isArray(content)) {
             content = content.map(part => {
               if (part.type === 'image_url') {
                 const url = part.image_url.url;
                 const commaIdx = url.indexOf(',');
                 const mime = url.substring(5, url.indexOf(';'));
                 const b64 = url.substring(commaIdx + 1);
                 return { type: 'image', source: { type: 'base64', media_type: mime, data: b64 } };
               }
               return part;
             });
           }
           anthropicMessages.push({ role: msg.role, content });
        }
      });
      
      bodyObj = {
         model: payload.model,
         max_tokens: payload.max_tokens || 1024,
         messages: anthropicMessages
      };
      if (systemPrompt) bodyObj.system = systemPrompt.trim();
    }

    const body = JSON.stringify(bodyObj);
    headers['Content-Length'] = Buffer.byteLength(body);

    const opts = {
      hostname: NIM_BASE_URL,
      path:     path,
      method:   'POST',
      timeout:  45000,
      headers:  headers
    };

    const req = https.request(opts, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) reject(new Error(json.error.message || JSON.stringify(json.error)));
          else {
            if (isAnthropic && json.content && json.content.length > 0) {
              json.choices = [{ message: { content: json.content[0].text } }];
            }
            resolve(json);
          }
        } catch(e) { reject(new Error('Invalid JSON from AI API: ' + data.slice(0,200))); }
      });
    });
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('AI API timed out after 45 seconds. Please try again.'));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function extractText(nimResponse) {
  return nimResponse?.choices?.[0]?.message?.content || '';
}

// ─────────────────────────────────────────────────────────────────
// GET /api/ping  — quick key validity test
// ─────────────────────────────────────────────────────────────────
app.get('/api/ping', async (req, res) => {
  try {
    const vk = req.headers['x-vision-key'] || req.headers['x-api-key'] || '';
    const rk = req.headers['x-reason-key'] || req.headers['x-api-key'] || '';
    const results = {};

    // Test reasoning key
    if (rk) {
      try {
        const t0 = Date.now();
        const r = await nimFetch(rk, {
          model: NIM_TEXT_MODEL,
          messages: [{ role:'user', content:'Reply with only the word PONG' }],
          max_tokens: 5, temperature: 0
        });
        results.reason = { ok: true, ms: Date.now()-t0, model: NIM_TEXT_MODEL, reply: extractText(r).trim() };
      } catch(e) { results.reason = { ok: false, error: e.message }; }
    } else { results.reason = { ok: false, error: 'No reasoning key sent' }; }

    // Test vision key
    if (vk) {
      try {
        const t0 = Date.now();
        const r = await nimFetch(vk, {
          model: NIM_VISION_MODEL,
          messages: [{ role:'user', content:'Say PONG' }],
          max_tokens: 5, temperature: 0
        });
        results.vision = { ok: true, ms: Date.now()-t0, model: NIM_VISION_MODEL, reply: extractText(r).trim() };
      } catch(e) { results.vision = { ok: false, error: e.message }; }
    } else { results.vision = { ok: false, error: 'No vision key sent' }; }

    res.json(results);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ─────────────────────────────────────────────────────────────────
// POST /api/analyze-syllabus — vision key for files, reason key for text
app.post('/api/analyze-syllabus', upload.single('file'), async (req, res) => {
  try {
    const apiKey = req.file ? getVisionKey(req) : getReasonKey(req);
    const testType = req.body.testType || 'jee';
    const subjects = testType === 'jee'
      ? 'physics, chemistry, mathematics'
      : 'physics, chemistry, mathematics, english, physical_education';

    const jsonSchema = testType === 'jee'
      ? `{"physics":["topic1"],"chemistry":["topic1"],"mathematics":["topic1"],"summary":"..."}`
      : `{"physics":["topic1"],"chemistry":["topic1"],"mathematics":["topic1"],"english":["topic1"],"physical_education":["topic1"],"summary":"..."}`;

    const promptText = `You are a JEE/CBSE syllabus expert. Extract and categorize ALL topics from the provided syllabus into: ${subjects}.
Return ONLY valid JSON (no markdown, no explanation):
${jsonSchema}`;

    let nimResponse;

    if (req.file) {
      // ── VISION path ──────────────────────────────────────────
      const fileData = fs.readFileSync(req.file.path);
      const b64      = fileData.toString('base64');
      const mime     = req.file.mimetype;
      fs.unlinkSync(req.file.path);

      // NIM vision uses image_url with data URI
      const dataUri = `data:${mime};base64,${b64}`;

      nimResponse = await nimFetch(apiKey, {
        model: NIM_VISION_MODEL,
        messages: [{
          role: 'user',
          content: [
            { type: 'text',      text: promptText },
            { type: 'image_url', image_url: { url: dataUri } }
          ]
        }],
        max_tokens:  1024,
        temperature: 0.2,
      });

    } else {
      // ── TEXT path ────────────────────────────────────────────
      const syllabus = req.body.text || '';
      nimResponse = await nimFetch(apiKey, {
        model: NIM_TEXT_MODEL,
        messages: [
          { role: 'system', content: 'You are a JEE/CBSE syllabus expert. Always respond with valid JSON only.' },
          { role: 'user',   content: `${promptText}\n\nSyllabus:\n${syllabus}` }
        ],
        max_tokens:  1024,
        temperature: 0.2,
      });
    }

    const raw  = extractText(nimResponse).replace(/```json|```/g, '').trim();
    const json = JSON.parse(raw.match(/\{[\s\S]*\}/)[0]);
    res.json(json);

  } catch (e) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────
// POST /api/analyze-momentum
// ─────────────────────────────────────────────────────────────────
app.post('/api/analyze-momentum', async (req, res) => {
  try {
    const apiKey = getReasonKey(req);
    const { studyLogs, mockScores } = req.body;

    const prompt = `You are a brutally honest JEE preparation coach. Analyze this 30-day study data.

Study Logs (date → hours per subject):
${JSON.stringify(studyLogs, null, 1)}

Mock Test Scores:
${JSON.stringify(mockScores, null, 1)}

JEE Standards: 8-10h/day ideal. Physics 2.5h, Chemistry 2.5h, Math 3h minimum.
Consistency > sporadic marathon sessions. Score thresholds: 200+ excellent, 150-199 good, 100-149 average, <100 poor for JEE Advanced.

Return ONLY valid JSON (no markdown):
{
  "score": <1-10 strict integer>,
  "grade": "<A+/A/B+/B/C/D/F>",
  "momentum": "<Excellent/Good/Average/Poor/Critical>",
  "analysis": "<2-3 sentence brutally honest analysis>",
  "strengths": ["<s1>","<s2>"],
  "weaknesses": ["<w1>","<w2>"],
  "recommendation": "<specific actionable advice>",
  "prediction": "<realistic JEE outcome prediction>"
}`;

    const nimResponse = await nimFetch(apiKey, {
      model: NIM_TEXT_MODEL,
      messages: [
        { role: 'system', content: 'You are a strict JEE coach. Always respond with valid JSON only.' },
        { role: 'user',   content: prompt }
      ],
      max_tokens:  800,
      temperature: 0.3,
    });

    const raw  = extractText(nimResponse).replace(/```json|```/g, '').trim();
    const json = JSON.parse(raw.match(/\{[\s\S]*\}/)[0]);
    res.json(json);

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Deterministic rating calculator — shared with test suite ──────
const { computeRating, ratingToGrade, ratingToVerdict } = require('./lib/rating');


// ─────────────────────────────────────────────────────────────────
// POST /api/analyze-daily-log  — AI review of a single study session
// ─────────────────────────────────────────────────────────────────
app.post('/api/analyze-daily-log', async (req, res) => {
  try {
    const apiKey = getReasonKey(req);
    const { date, sessions, subjects, description, recentLogs } = req.body;

    // sessions: [{types:['pyq','video',...], subject:'phy'|'chem'|'math', hours:2}, ...]
    // subjects: [{key, hours}], description: free-text
    // recentLogs: last 7 days summary

    const subjectNames = { phy:'Physics', chem:'Chemistry', math:'Mathematics', eng:'English', pe:'Physical Education' };
    const sessionTypeNames = {
      pyq:'PYQ Practice', theory:'Theory Study', video:'Video Lecture',
      revision:'Revision', mock:'Mock Test',
      sample:'Sample Questions/Practice Problems', module:'Module/DPP'
    };

    // Each session block may have MULTIPLE types selected
    const sessionsSummary = (sessions||[]).map(s => {
      const typesArr = Array.isArray(s.types) ? s.types : (s.type ? [s.type] : []);
      const typeLabels = typesArr.map(t => sessionTypeNames[t] || t).join(' + ');
      return `${typeLabels || 'Unspecified'} — ${subjectNames[s.subject]||s.subject} — ${s.hours}h`;
    }).join('\n');

    const totalHours = (subjects||[]).reduce((s,x)=>s+(+x.hours||0),0);
    const subjectsSummary = (subjects||[]).map(s =>
      `${subjectNames[s.key]||s.key}: ${s.hours}h`
    ).join(', ');

    const recentSummary = (recentLogs||[]).slice(-7).map(l =>
      `${l.date}: ${(l.total||0).toFixed(1)}h total`
    ).join(', ');

    // Compute base rating from structured data
    const baseRating     = computeRating(sessions, totalHours);
    const minRating      = Math.max(0,   baseRating - 15);
    const maxRating      = Math.min(100, baseRating + 15);

    const prompt = `You are a JEE preparation analyst. Review this student's study session and provide a rating.

SESSION DATA:
Date: ${date}
Sessions: ${sessionsSummary || 'Not specified'}
Subject hours: ${subjectsSummary || 'Not specified'}
Total hours: ${totalHours}h
Recent 7-day pattern: ${recentSummary || 'No history'}

STUDENT'S DESCRIPTION OF WHAT THEY ACTUALLY DID:
"${description || 'No description provided.'}"

BASE RATING (from session structure): ${baseRating}/100
Your job: Read the student's description carefully. If they describe deep, focused, high-quality work (e.g. solved 50 PYQs, covered specific chapters thoroughly, got good accuracy), you may INCREASE the rating by up to 15 points above the base.
If they describe poor quality, distraction, or superficial work, you may DECREASE by up to 15 points.
If description is vague or absent, use the base rating as-is.
Final "rating" MUST be between ${minRating} and ${maxRating}.

Important context:
- Total study time of ${totalHours}h is ${totalHours < 4 ? 'well below' : totalHours < 6 ? 'below' : totalHours < 8 ? 'approaching' : 'close to'} the 8-10h/day needed for 99-percentile JEE.
- Be honest but fair. Reward genuine depth and effort in the description.
- Reference specific topics/subjects from the description in your assessment text.

Return ONLY this JSON (no text before or after):
{
  "rating": <integer between ${minRating} and ${maxRating}>,
  "grade": "<A+|A|B+|B|C|D|F>",
  "verdict": "<Excellent|Good|Above Average|Average|Below Average|Poor|Critical>",
  "studyTimeAssessment": "<2 sentences on whether ${totalHours}h was adequate for a 99-percentile JEE aspirant>",
  "topicCoverageAssessment": "<2 sentences on which subjects/topics were covered and what is critically missing>",
  "sessionQualityAssessment": "<2 sentences on the depth and effectiveness of what the student actually did>",
  "strengths": ["<specific strength 1>", "<specific strength 2>"],
  "gaps": ["<gap 1>", "<gap 2>", "<gap 3>"],
  "tomorrowPlan": "<3 specific action items for tomorrow addressing today's gaps>",
  "strictVerdict": "<1 honest, direct sentence a serious JEE mentor would say to this student>"
}`;


    // First attempt
    let nimResponse = await nimFetch(apiKey, {
      model: NIM_TEXT_MODEL,
      messages: [
        { role: 'system', content: 'You are a JEE study analyst. Respond with JSON only.' },
        { role: 'user',   content: prompt }
      ],
      max_tokens:  1200,
      temperature: 0.2,
    });

    console.log('[analyze-daily-log] NIM response:', JSON.stringify(nimResponse).slice(0, 500));

    let raw = extractText(nimResponse).replace(/```json|```/g, '').trim();

    // If empty, retry with a much shorter prompt
    if (!raw || raw.length < 10) {
      console.log('[analyze-daily-log] Empty response, retrying with short prompt...');
      const shortPrompt = `Rate this JEE study session out of 100. Sessions: ${sessionsSummary}. Total: ${totalHours}h. Description: "${(description||'').slice(0,200)}". Use: RATING = (Quality 0-75 + SubjectBalance 0-25) x TimeMultiplier. TimeMultiplier: 2h=0.26, 4h=0.50, 6h=0.72, 8h=0.89, 10h=1.00. PYQ=75pts, Theory=25pts, Video=14pts. All 3 subjects=25pts, 2 subjects=12pts, 1 subject=3pts. Return JSON: {"rating":N,"grade":"X","verdict":"X","studyTimeAssessment":"...","topicCoverageAssessment":"...","sessionQualityAssessment":"...","strengths":["..."],"gaps":["..."],"tomorrowPlan":"...","strictVerdict":"..."}`;

      nimResponse = await nimFetch(apiKey, {
        model: NIM_TEXT_MODEL,
        messages: [
          { role: 'system', content: 'Return only valid JSON.' },
          { role: 'user',   content: shortPrompt }
        ],
        max_tokens: 800,
        temperature: 0.3,
      });

      console.log('[analyze-daily-log] Retry response:', JSON.stringify(nimResponse).slice(0, 500));
      raw = extractText(nimResponse).replace(/```json|```/g, '').trim();
    }

    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('AI returned no valid JSON. Raw: ' + raw.slice(0, 300));
    const json = JSON.parse(match[0]);

    // Clamp AI's rating to the allowed window — it cannot exceed base±15
    const clampedRating  = Math.min(maxRating, Math.max(minRating, Math.round(+json.rating || baseRating)));
    json.rating  = clampedRating;
    json.grade   = ratingToGrade(clampedRating);
    json.verdict = ratingToVerdict(clampedRating);

    res.json(json);

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────
// POST /api/chat
// ─────────────────────────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  try {
    const apiKey = getReasonKey(req);
    const { message, testType, syllabusContext, history } = req.body;

    const systemPrompt = `You are a friendly AI study assistant for a student preparing for JEE and CBSE exams. You can help with study questions, derivations, formulas, topic explanations, exam strategy, and general conversation.

Respond naturally to what the user says. If they greet you, greet them back simply. Only provide study tips or subject info when they actually ask for it — don't proactively dump exam content unprompted.

When they do ask study questions, be concise, clear, and specific. Use bullet points for lists. Context: ${testType === 'cbse' ? 'CBSE preparation' : 'JEE preparation'}.${syllabusContext ? ` Current syllabus: ${syllabusContext}` : ''}`;

    // Limit history to last 6 messages (3 exchanges) to prevent payload bloat
    const recentHistory = (history || []).slice(-6);

    // Build message history for NIM (OpenAI format)
    const messages = [
      { role: 'system', content: systemPrompt },
      ...recentHistory.map(h => ({ role: h.role === 'model' ? 'assistant' : 'user', content: h.text })),
      { role: 'user', content: message }
    ];

    const nimResponse = await nimFetch(apiKey, {
      model:       NIM_TEXT_MODEL,
      messages,
      max_tokens:  800,
      temperature: 0.7,
    });

    res.json({ response: extractText(nimResponse) });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────
// POST /api/parse-allen-result — extract test data from Allen screenshots
// Accepts up to 5 images via multipart/form-data (field: "files")
// ─────────────────────────────────────────────────────────────────
app.post('/api/parse-allen-result', upload.array('files', 5), async (req, res) => {
  const uploadedFiles = req.files || [];
  try {
    const apiKey = getVisionKey(req);
    if (!apiKey) throw new Error('No vision API key provided');
    if (!uploadedFiles.length) throw new Error('No screenshots uploaded');

    // Build content array: text prompt + all images
    const content = [
      {
        type: 'text',
        text: `You are extracting JEE test result data from Allen Institute result screenshots.
Look at ALL the screenshots carefully and extract EVERY number you can see.

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "testName": "<test name from top e.g. MINOR TEST - Paper 1>",
  "testDate": "<date in YYYY-MM-DD format>",
  "testType": "<main or advanced>",
  "totalScore": <number>,
  "maxScore": <number e.g. 300>,
  "overall": {
    "correct": <number>,
    "incorrect": <number>,
    "unattempted": <number>,
    "classAverage": <number or null>
  },
  "ranks": {
    "centerRank": "<e.g. 227/763>",
    "centerPercentile": "<e.g. 70.38>",
    "campusRank": "<e.g. 68/197>",
    "campusPercentile": "<e.g. 65.99>",
    "batchRank": "<e.g. 18/56>",
    "batchPercentile": "<e.g. 69.64>"
  },
  "subjects": {
    "physics":   { "score": <number>, "correct": <number>, "incorrect": <number>, "unattempted": <number> },
    "chemistry": { "score": <number>, "correct": <number>, "incorrect": <number>, "unattempted": <number> },
    "mathematics": { "score": <number>, "correct": <number>, "incorrect": <number>, "unattempted": <number> }
  },
  "topics": [
    { "subject": "<physics|chemistry|mathematics>", "name": "<topic name>", "score": <number>, "maxScore": <number>, "correct": <number>, "incorrect": <number>, "unattempted": <number> }
  ],
  "improvements": [
    { "subject": "<physics|chemistry|mathematics>", "type": "<Easy Q missed|Medium Q errors|Hard Q missed>", "count": <number>, "gainableMarks": <number> }
  ],
  "weakAreas": "<comma-separated list of topics where incorrect > 0>",
  "errorSummary": "<one paragraph describing the key mistakes visible in the screenshots>"
}`
      }
    ];

    // Add each screenshot as an image_url
    for (const file of uploadedFiles) {
      const fileData = fs.readFileSync(file.path);
      const b64      = fileData.toString('base64');
      const mime     = file.mimetype;
      fs.unlinkSync(file.path);
      content.push({
        type: 'image_url',
        image_url: { url: `data:${mime};base64,${b64}` }
      });
    }

    const nimResponse = await nimFetch(apiKey, {
      model: NIM_VISION_MODEL,
      messages: [{ role: 'user', content }],
      max_tokens:  2000,
      temperature: 0.1,
    });

    const raw   = extractText(nimResponse).replace(/```json|```/g, '').trim();
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('AI returned no valid JSON. Raw: ' + raw.slice(0, 300));
    const json  = JSON.parse(match[0]);
    res.json(json);

  } catch (e) {
    // Cleanup any leftover temp files
    for (const file of uploadedFiles) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    }
    console.error('[parse-allen-result] Error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────
// POST /api/import-allen  — receives scraped text from bookmarklet
// CORS open: runs from allen.in → localhost
// ─────────────────────────────────────────────────────────────────
const ALLEN_PENDING_PATH = path.join(__dirname, 'data', 'allen-import-pending.json');

function allenCors(res) {
  res.header('Access-Control-Allow-Origin',  '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
}

app.options('/api/import-allen',         (req, res) => { allenCors(res); res.end(); });
app.options('/api/import-allen/pending', (req, res) => { allenCors(res); res.end(); });

app.post('/api/import-allen', async (req, res) => {
  allenCors(res);
  try {
    const apiKey = getReasonKey(req) || DEFAULT_REASON_KEY;
    if (!apiKey) throw new Error('No AI key configured on server. Add NVIDIA_REASON_KEY to .env');

    const { url = '', allText = '' } = req.body;
    if (!allText || allText.length < 30) throw new Error('No page text received — bookmarklet may not have collected any content');

    // DEBUG: Save exactly what the bookmarklet saw so we can figure out why questions are missing
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
    fs.writeFileSync(path.join(dataDir, 'last_scrape.txt'), allText);

    const prompt = `You are extracting JEE test result data from Allen Institute's Results page.
Extract ONLY what you can clearly see. Do NOT guess or fabricate numbers.

CRITICAL: The subject table has this column order:
SUBJECT | SCORE | ✓Qs (CORRECT count) | ✗Qs (INCORRECT/WRONG count)
The first number after score is CORRECT questions, the second is INCORRECT/WRONG questions.
Example: "PHYSICS 64 17 4" means Physics scored 64, 17 correct, 4 wrong.

Also look for:
- Total score (e.g. "160" out of "300")
- Class average
- Center/Campus/Batch Rank with percentile
- Overall Correct/Incorrect/Unattempted counts

SCRAPED TEXT:
${allText.slice(0, 30000)}

Return ONLY valid JSON. Omit any key not clearly in the text.
{
  "testName": "<test name>",
  "testDate": "<YYYY-MM-DD>",
  "testType": "<main or advanced>",
  "totalScore": <number>,
  "maxScore": <number>,
  "overall": { "correct": <n>, "incorrect": <n>, "unattempted": <n>, "classAverage": <n> },
  "ranks": { "centerRank": "<rank/total>", "centerPercentile": <n>, "campusRank": "<rank/total>", "campusPercentile": <n>, "batchRank": "<rank/total>", "batchPercentile": <n> },
  "subjects": {
    "physics": { "score": <n>, "correct": <n>, "incorrect": <n> },
    "chemistry": { "score": <n>, "correct": <n>, "incorrect": <n> },
    "mathematics": { "score": <n>, "correct": <n>, "incorrect": <n> }
  }
}`;

    const nimResponse = await nimFetch(apiKey, {
      model: NIM_TEXT_MODEL,
      messages: [
        { role: 'system', content: 'You are a data extraction engine. Return only valid JSON. Omit keys if data is missing.' },
        { role: 'user',   content: prompt }
      ],
      max_tokens:  1500,
      temperature: 0.1,
    });

    const raw   = extractText(nimResponse).replace(/```json|```/g, '').trim();
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('AI returned no parseable JSON. Raw: ' + raw.slice(0, 200));
    
    const parsed = JSON.parse(match[0]);
    parsed._importedAt = new Date().toISOString();
    parsed._sourceUrl  = url;

    // Write directly — single scan, no merge needed
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
    fs.writeFileSync(ALLEN_PENDING_PATH, JSON.stringify(parsed, null, 2));

    console.log(`[import-allen] Parsed & Merged. URL: ${url}`);
    res.json({ ok: true });

  } catch (e) {
    console.error('[import-allen] Error:', e.message);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// GET — check for pending import
app.get('/api/import-allen/pending', (req, res) => {
  allenCors(res);
  try {
    if (!fs.existsSync(ALLEN_PENDING_PATH)) return res.json({ pending: false });
    const data = JSON.parse(fs.readFileSync(ALLEN_PENDING_PATH, 'utf-8'));
    res.json({ pending: true, data });
  } catch(e) {
    res.json({ pending: false });
  }
});

// DELETE — consume (clear) the pending import after user saves it
app.delete('/api/import-allen/pending', (req, res) => {
  allenCors(res);
  try {
    if (fs.existsSync(ALLEN_PENDING_PATH)) fs.unlinkSync(ALLEN_PENDING_PATH);
    res.json({ ok: true });
  } catch(e) { res.json({ ok: false }); }
});

// ─────────────────────────────────────────────────────────────────
// POST /api/backup - Auto-save user local storage


// ─────────────────────────────────────────────────────────────────
app.post('/api/backup', (req, res) => {
  try {
    const backupDir = path.join(__dirname, 'data');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }
    const backupPath = path.join(backupDir, 'backup.json');
    fs.writeFileSync(backupPath, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (e) {
    console.error('Backup error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/backup - Serve the last auto-saved backup for restore
// ─────────────────────────────────────────────────────────────────
app.get('/api/backup', (req, res) => {
  try {
    const backupPath = path.join(__dirname, 'data', 'backup.json');
    if (!fs.existsSync(backupPath)) {
      return res.status(404).json({ error: 'No backup file found on server.' });
    }
    const data = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
    res.json(data);
  } catch (e) {
    console.error('Backup read error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║   🚀 JEE TRACKER v3.0 — NVIDIA NIM        ║');
  console.log(`║   http://localhost:${PORT}                ║`);
  console.log('║   Vision:  Llama-3.2-90B-Vision           ║');
  console.log('║   Text:    Llama-3.3-70B-Instruct         ║');
  console.log('║   Storage: IndexedDB + localStorage       ║');
  console.log('╚════════════════════════════════════════════╝\n');
});

