import { nanoid } from 'nanoid';

const SERVER_URL = process.env.INFINISYNAPSE_SERVER_URL || 'https://app.infinisynapse.cn';
const API_KEY = process.env.INFINISYNAPSE_API_KEY || '';

export function hasInfiniConfig() {
  return Boolean(API_KEY && API_KEY.startsWith('sk-'));
}

function authHeaders(extra = {}) {
  return {
    Authorization: `Bearer ${API_KEY}`,
    'x-lang': 'zh_CN',
    ...extra
  };
}

export async function postAiMessage(payload) {
  if (!hasInfiniConfig()) {
    throw new Error('INFINISYNAPSE_API_KEY is not configured.');
  }

  const response = await fetch(`${SERVER_URL}/api/ai/message`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { raw: text };
  }

  if (!response.ok || (body.code && body.code !== 200)) {
    const message = body.message || body.raw || `InfiniSynapse request failed with HTTP ${response.status}`;
    throw new Error(message);
  }

  return body;
}

export async function createAnalysisTask(prompt, taskName = 'CET-4 Vocab Coach') {
  const connId = nanoid(20);
  const payload = {
    type: 'newTask',
    text: prompt,
    connId,
    taskName,
    chatSettings: { mode: 'act' },
    autoApprovalSettings: {
      enabled: true,
      actions: ['read_file', 'write_file', 'execute_command']
    }
  };
  const data = await postAiMessage(payload);
  return { connId, platformResponse: data };
}

export async function askTask(taskId, text) {
  return postAiMessage({
    type: 'askResponse',
    taskId,
    askResponse: 'messageResponse',
    text
  });
}

export async function getTaskInfo(taskId) {
  if (!hasInfiniConfig()) throw new Error('INFINISYNAPSE_API_KEY is not configured.');
  const response = await fetch(`${SERVER_URL}/api/ai_task/getTaskInfo/${encodeURIComponent(taskId)}`, {
    headers: authHeaders()
  });
  const body = await response.json();
  if (!response.ok || (body.code && body.code !== 200)) {
    throw new Error(body.message || `Failed to load task ${taskId}`);
  }
  return body.data || body;
}

export async function getTaskMessages(taskId) {
  if (!hasInfiniConfig()) throw new Error('INFINISYNAPSE_API_KEY is not configured.');
  const response = await fetch(`${SERVER_URL}/api/ai_task/getUiMessageById?id=${encodeURIComponent(taskId)}`, {
    headers: authHeaders()
  });
  const body = await response.json();
  if (!response.ok || (body.code && body.code !== 200)) {
    throw new Error(body.message || `Failed to load messages for ${taskId}`);
  }
  return body.data || body;
}

export function buildDefinitionPrompt(word) {
  return `你是英语四级词汇教练。请围绕单词 "${word}" 生成适合中国大学生的学习卡片，必须输出 JSON，不要 Markdown。字段：word, phonetic, cefr, cet4Frequency(1-5), meanings[{pos, zh, en}], memoryHook, collocations[3], examples[{en, zh, scene}], pitfalls[2], quiz[{question, options[4], answer, explanation}]。例句要贴近四级阅读、听力、校园或社会生活。`;
}

export function buildPathPrompt(profile, stats, weakWords) {
  return `你是四级备考学习路径规划师。请根据学习者画像和答题数据生成 7 天单词学习路径，必须输出 JSON，不要 Markdown。
学习者画像：${JSON.stringify(profile)}
统计数据：${JSON.stringify(stats)}
薄弱词：${weakWords.join(', ')}
JSON 字段：diagnosis, targetScore, dailyPlan[{day, focus, newWords, reviewWords, task, checkPoint}], strategyTips[4], riskWarnings[3]。要求具体、半小时内可执行，优先安排薄弱词和高频词。`;
}

export function buildExamplePrompt(word, scene, difficulty) {
  return `请为四级单词 "${word}" 创作 3 个 ${difficulty || '中等'} 难度例句，场景为 ${scene || '校园学习'}。必须输出 JSON：{word, scene, examples:[{en, zh, highlight, writingTip}]}。例句自然，不要生硬堆词。`;
}
