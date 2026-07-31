import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { cet4Words } from './words.js';
import {
  askTask,
  buildDefinitionPrompt,
  buildExamplePrompt,
  buildPathPrompt,
  createAnalysisTask,
  getTaskInfo,
  getTaskMessages,
  hasInfiniConfig
} from './infini.js';

const runtimeDataDir = process.env.VERCEL ? '/tmp/cet4-vocab-lab' : join(process.cwd(), 'data');
const dbDir = runtimeDataDir;
const dbPath = join(dbDir, 'progress.json');

function ensureDb() {
  if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true });
  if (!existsSync(dbPath)) {
    writeFileSync(dbPath, JSON.stringify({ reviews: [], generated: {}, paths: [] }, null, 2));
  }
}

function readDb() {
  ensureDb();
  return JSON.parse(readFileSync(dbPath, 'utf-8'));
}

function writeDb(data) {
  ensureDb();
  writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

function statsFromReviews(reviews) {
  const byWord = new Map();
  for (const review of reviews) {
    const current = byWord.get(review.word) || { word: review.word, attempts: 0, correct: 0, lastRating: 0, lastSeen: '' };
    current.attempts += 1;
    current.correct += review.correct ? 1 : 0;
    current.lastRating = review.rating;
    current.lastSeen = review.createdAt;
    byWord.set(review.word, current);
  }
  const rows = [...byWord.values()].map((item) => ({
    ...item,
    accuracy: item.attempts ? Math.round((item.correct / item.attempts) * 100) : 0
  }));
  const total = reviews.length;
  const correct = reviews.filter((item) => item.correct).length;
  return {
    totalReviews: total,
    accuracy: total ? Math.round((correct / total) * 100) : 0,
    mastered: rows.filter((item) => item.accuracy >= 80 && item.lastRating >= 4).length,
    weak: rows.filter((item) => item.accuracy < 60 || item.lastRating <= 2).length,
    byWord: rows.sort((a, b) => a.accuracy - b.accuracy || b.attempts - a.attempts)
  };
}

function fallbackDefinition(word) {
  const item = cet4Words.find((entry) => entry.word.toLowerCase() === word.toLowerCase());
  if (!item) {
    return {
      word,
      phonetic: '',
      cefr: 'B1',
      cet4Frequency: 3,
      meanings: [{ pos: 'unknown', zh: '待 AI 生成', en: 'Pending AI generation' }],
      memoryHook: '点击 AI 生成获取释义、例句和测验。',
      collocations: [],
      examples: [],
      pitfalls: [],
      quiz: []
    };
  }
  return {
    word: item.word,
    phonetic: item.phonetic,
    cefr: item.level <= 2 ? 'A2-B1' : 'B1-B2',
    cet4Frequency: Math.max(1, 6 - item.level),
    meanings: [{ pos: item.pos, zh: item.meaning, en: item.meaning }],
    memoryHook: `${item.word} 属于${item.tag}词，先记核心含义，再用例句巩固。`,
    collocations: item.family,
    examples: [{ en: item.example, zh: '例句见英文，可自行翻译复述。', scene: item.tag }],
    pitfalls: item.tag === '易混' ? ['注意 affect 常作动词，effect 常作名词。'] : [],
    quiz: [{
      question: `Which meaning best matches "${item.word}"?`,
      options: [item.meaning, '完全相反的含义', '人名或地名', '无固定含义'],
      answer: item.meaning,
      explanation: `"${item.word}" 的四级核心含义是：${item.meaning}。`
    }]
  };
}

function recommendWords(stats, count = 10) {
  const weakSet = new Set(stats.byWord.filter((item) => item.accuracy < 70 || item.lastRating <= 2).map((item) => item.word));
  const unseen = cet4Words.filter((item) => !stats.byWord.some((row) => row.word === item.word));
  const weak = cet4Words.filter((item) => weakSet.has(item.word));
  return [...weak, ...unseen].slice(0, count);
}

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function getRequestUrl(req) {
  if (req.url) return new URL(req.url, 'http://localhost');
  return new URL(req.originalUrl || '/', 'http://localhost');
}

async function readBody(req) {
  if (typeof req.body !== 'undefined') return req.body;
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

export function createApiHandler() {
  return async function handle(req, res) {
    const method = (req.method || 'GET').toUpperCase();
    const url = getRequestUrl(req);
    const path = url.pathname.replace(/^\/api/, '') || '/';
    const send = (status, payload) => json(res, status, payload);

    try {
      if (method === 'GET' && path === '/health') {
        return send(200, { ok: true, infinisynapseConfigured: hasInfiniConfig(), wordCount: cet4Words.length });
      }

      if (method === 'GET' && path === '/words') {
        const q = String(url.searchParams.get('q') || '').trim().toLowerCase();
        const tag = String(url.searchParams.get('tag') || '').trim();
        const words = cet4Words.filter((item) => {
          const matchesQ = !q || item.word.includes(q) || item.meaning.includes(q);
          const matchesTag = !tag || item.tag === tag;
          return matchesQ && matchesTag;
        });
        return send(200, { words, tags: [...new Set(cet4Words.map((item) => item.tag))] });
      }

      if (method === 'GET' && path === '/progress') {
        const db = readDb();
        const stats = statsFromReviews(db.reviews);
        return send(200, { stats, reviews: db.reviews.slice(-30).reverse(), recommendations: recommendWords(stats) });
      }

      if (method === 'POST' && path === '/review') {
        const body = await readBody(req);
        const { word, correct, rating, mode } = body;
        if (!word || typeof correct !== 'boolean' || !Number.isFinite(Number(rating))) {
          return send(400, { error: 'word, correct and rating are required.' });
        }
        const db = readDb();
        db.reviews.push({ word, correct, rating: Number(rating), mode: mode || 'card', createdAt: new Date().toISOString() });
        writeDb(db);
        const stats = statsFromReviews(db.reviews);
        return send(200, { ok: true, stats, recommendations: recommendWords(stats) });
      }

      if (method === 'POST' && path === '/ai/definition') {
        const body = await readBody(req);
        const word = String(body.word || '').trim();
        if (!word) return send(400, { error: 'word is required.' });
        const db = readDb();
        try {
          const result = await createAnalysisTask(buildDefinitionPrompt(word), `CET-4 definition: ${word}`);
          db.generated[word] = { type: 'definition', word, prompt: buildDefinitionPrompt(word), result, createdAt: new Date().toISOString() };
          writeDb(db);
          return send(200, { mode: 'infinisynapse-task', task: result, fallback: fallbackDefinition(word) });
        } catch (error) {
          return send(200, { mode: 'local-fallback', warning: error.message, fallback: fallbackDefinition(word) });
        }
      }

      if (method === 'POST' && path === '/ai/examples') {
        const body = await readBody(req);
        const word = String(body.word || '').trim();
        const scene = String(body.scene || '校园学习').trim();
        const difficulty = String(body.difficulty || '中等').trim();
        if (!word) return send(400, { error: 'word is required.' });
        try {
          const result = await createAnalysisTask(buildExamplePrompt(word, scene, difficulty), `CET-4 examples: ${word}`);
          return send(200, { mode: 'infinisynapse-task', task: result });
        } catch (error) {
          const item = fallbackDefinition(word);
          return send(200, { mode: 'local-fallback', warning: error.message, fallback: { word, scene, examples: item.examples } });
        }
      }

      if (method === 'POST' && path === '/ai/path') {
        const body = await readBody(req);
        const profile = body.profile || { examDate: '30天后', dailyMinutes: 30, target: '四级通过' };
        const db = readDb();
        const stats = statsFromReviews(db.reviews);
        const weakWords = recommendWords(stats, 12).map((item) => item.word);
        try {
          const result = await createAnalysisTask(buildPathPrompt(profile, stats, weakWords), 'CET-4 adaptive vocabulary path');
          db.paths.push({ profile, stats, weakWords, result, createdAt: new Date().toISOString() });
          writeDb(db);
          return send(200, { mode: 'infinisynapse-task', task: result, weakWords, stats });
        } catch (error) {
          return send(200, {
            mode: 'local-fallback',
            warning: error.message,
            weakWords,
            stats,
            plan: weakWords.slice(0, 7).map((word, index) => ({
              day: index + 1,
              focus: index < 3 ? '高频弱词修复' : '阅读语境巩固',
              newWords: cet4Words.slice(index * 3, index * 3 + 3).map((item) => item.word),
              reviewWords: weakWords.slice(Math.max(0, index - 2), index + 1),
              task: '15分钟新词卡片 + 10分钟例句复述 + 5分钟自测',
              checkPoint: '正确率达到80%后进入下一组'
            }))
          });
        }
      }

      if (method === 'POST' && path === '/ai/ask') {
        const body = await readBody(req);
        const { taskId, text } = body;
        if (!taskId || !text) return send(400, { error: 'taskId and text are required.' });
        const result = await askTask(taskId, text);
        return send(200, { result });
      }

      if (method === 'GET' && path.startsWith('/ai/task/')) {
        const taskId = path.replace('/ai/task/', '');
        const [info, messages] = await Promise.all([getTaskInfo(taskId), getTaskMessages(taskId)]);
        return send(200, { info, messages });
      }

      return send(404, { error: 'Not found' });
    } catch (error) {
      return send(500, { error: error.message });
    }
  };
}

export function createAppContext() {
  return {
    cet4Words,
    hasInfiniConfig,
    readDb,
    writeDb,
    statsFromReviews,
    fallbackDefinition,
    recommendWords,
    createAnalysisTask,
    askTask,
    buildDefinitionPrompt,
    buildExamplePrompt,
    buildPathPrompt,
    getTaskInfo,
    getTaskMessages
  };
}
