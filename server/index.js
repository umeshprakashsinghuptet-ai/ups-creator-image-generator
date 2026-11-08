require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const multer = require('multer');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { MODULES, LOCKS, ENGINES } = require('./pipeline-config');

const app = express();
const PORT = process.env.PORT || 10000;
const MAX_MB = Number(process.env.MAX_UPLOAD_MB || 20);
const ROOT_DIR = path.join(__dirname, '..');

app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('tiny'));
app.use(express.json({ limit: '2mb' }));

// Serve only the intended frontend files from the repository root.
// This matches the current GitHub layout: index.html, styles.css, app.js.
app.get('/', (req, res) => res.sendFile(path.join(ROOT_DIR, 'index.html')));
app.get('/index.html', (req, res) => res.sendFile(path.join(ROOT_DIR, 'index.html')));
app.get('/styles.css', (req, res) => res.sendFile(path.join(ROOT_DIR, 'styles.css')));
app.get('/app.js', (req, res) => res.sendFile(path.join(ROOT_DIR, 'app.js')));

// Optional static assets folder, if one is added later.
app.use('/assets', express.static(path.join(ROOT_DIR, 'assets'), { fallthrough: true }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_MB * 1024 * 1024 }
});

const MODEL = process.env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash';

function model() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Server API key missing. Set GEMINI_API_KEY in Render Environment.');
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY).getGenerativeModel({ model: MODEL });
}

app.get('/api/health', (req, res) => res.json({
  ok: true,
  service: 'UPS Creator Studio',
  model: MODEL,
  keyConfigured: Boolean(process.env.GEMINI_API_KEY),
  modules: MODULES.length,
  locks: LOCKS.length,
  engines: ENGINES.length
}));

app.get('/api/config', (req, res) => res.json({
  modules: MODULES,
  locks: LOCKS,
  engines: ENGINES
}));

app.post('/api/generate', async (req, res) => {
  try {
    const { task = 'director', input = {}, mode = 'auto' } = req.body || {};
    const prompt = `You are ULTIMATE AUTO-PILOT FILMMAKER PRO MAX INFINITY for UPS Creator Studio, developed by Umesh Prakash Singh. Work in ${String(mode).toUpperCase()} mode. Create practical, production-ready outputs. Do not claim a media file was rendered; produce prompts, plans, scripts and structured data. Preserve facts; label uncertainty.
TASK: ${task}
USER INPUT JSON:
${JSON.stringify(input, null, 2)}

Apply these exact 8 engines: ${ENGINES.join(', ')}. Apply these 50 modules in sequence: ${MODULES.join('; ')}. Enforce these 15 locks: ${LOCKS.join(', ')}. Return: (1) concise creative direction, (2) script/dialogue, (3) scene list with timestamps, shot, camera, lens, lighting, action, expressions, wardrobe, environment, audio, dialogue, captions, transition, continuity notes, (4) one image prompt per keyframe, (5) one video prompt per clip, (6) voice direction and sound design, (7) subtitle text with approximate timestamps, (8) short-form and long-form adaptations, (9) final QA checklist. Use Hindi when user input is Hindi. Keep prompts copy-ready. Do not invent exact model capabilities or resolution. For any inaccessible URL, state that content access is not verified and request a transcript or uploaded media.`;
    const result = await model().generateContent(prompt);
    res.json({ ok: true, model: MODEL, text: result.response.text() });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message || 'Generation failed' });
  }
});

app.post('/api/analyze-media', upload.single('media'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, error: 'Choose a video or audio file first.' });
    }
    const mime = req.file.mimetype;
    if (!mime.startsWith('video/') && !mime.startsWith('audio/')) {
      return res.status(400).json({ ok: false, error: 'Only supported audio/video uploads are accepted.' });
    }
    const prompt = req.body.prompt || 'Analyze this uploaded media. Provide transcript/dialogue when intelligible, timestamps, scenes, shots, visual actions, expressions, camera, lighting, audio, captions, story structure, continuity, and frame-by-frame image/video prompts. Mark uncertain words and timestamps; do not guess.';
    const result = await model().generateContent([
      { inlineData: { data: req.file.buffer.toString('base64'), mimeType: mime } },
      { text: prompt }
    ]);
    res.json({
      ok: true,
      model: MODEL,
      fileName: req.file.originalname,
      text: result.response.text()
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message || 'Media analysis failed' });
  }
});

// Keep unknown API paths as JSON 404s; send the app shell for other browser routes.
app.use('/api', (req, res) => res.status(404).json({ ok: false, error: 'API route not found' }));
app.get('*', (req, res) => res.sendFile(path.join(ROOT_DIR, 'index.html')));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`UPS Creator Studio listening on ${PORT}`);
});
