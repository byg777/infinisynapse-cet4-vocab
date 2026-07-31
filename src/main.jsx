import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BarChart3, BookOpen, Brain, Check, ChevronRight, Clock, RefreshCcw, Search, Sparkles, Target, X } from 'lucide-react';
import './styles.css';

const API_BASE = import.meta.env.VITE_API_BASE || '';

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function Pill({ children, tone = 'neutral' }) {
  return <span className={`pill pill-${tone}`}>{children}</span>;
}

function Metric({ icon, label, value, hint }) {
  return (
    <div className="metric">
      <div className="metric-icon">{icon}</div>
      <div>
        <div className="metric-label">{label}</div>
        <div className="metric-value">{value}</div>
        {hint && <div className="metric-hint">{hint}</div>}
      </div>
    </div>
  );
}

function WordCard({ word, onReview, onGenerate, aiCard, busy }) {
  const [revealed, setRevealed] = useState(false);
  const [selected, setSelected] = useState(null);
  const quiz = aiCard?.fallback?.quiz?.[0] || aiCard?.quiz?.[0];
  const options = quiz?.options || [word.meaning, '提高；增长', '拒绝；下降', '证据；证明'];
  const answer = quiz?.answer || word.meaning;

  function submit(correct, rating) {
    onReview(word.word, correct, rating);
    setSelected(null);
    setRevealed(false);
  }

  return (
    <section className="study-card">
      <div className="card-topline">
        <Pill tone="blue">{word.tag}</Pill>
        <span>难度 {word.level}/4</span>
      </div>
      <div className="word-row">
        <div>
          <h2>{word.word}</h2>
          <p className="phonetic">{word.phonetic}</p>
        </div>
        <button className="icon-button" title="AI 生成释义卡" onClick={() => onGenerate(word.word)} disabled={busy}>
          {busy ? <RefreshCcw className="spin" /> : <Sparkles />}
        </button>
      </div>
      <div className={`meaning-box ${revealed ? 'is-open' : ''}`}>
        {revealed ? (
          <>
            <strong>{word.pos} {word.meaning}</strong>
            <p>{word.example}</p>
            {word.family?.length > 0 && <p className="muted">词族/搭配：{word.family.join(' · ')}</p>}
          </>
        ) : (
          <button className="ghost-button" onClick={() => setRevealed(true)}>显示释义与例句</button>
        )}
      </div>
      {aiCard && (
        <div className="ai-result">
          <div className="ai-title"><Sparkles size={16} /> AI 卡片状态：{aiCard.mode}</div>
          {aiCard.task?.connId && <p>已创建 InfiniSynapse 连接：<code>{aiCard.task.connId}</code></p>}
          {aiCard.warning && <p className="warning">平台调用未完成，已显示本地回退：{aiCard.warning}</p>}
          {aiCard.fallback?.memoryHook && <p>{aiCard.fallback.memoryHook}</p>}
        </div>
      )}
      <div className="quiz">
        <div className="quiz-question">快速自测：{quiz?.question || `"${word.word}" 的四级核心含义是？`}</div>
        <div className="option-grid">
          {options.map((option) => (
            <button key={option} className={selected === option ? 'option selected' : 'option'} onClick={() => setSelected(option)}>{option}</button>
          ))}
        </div>
      </div>
      <div className="review-actions">
        <button className="danger" disabled={!selected} onClick={() => submit(selected === answer, 2)}><X size={16} /> 不熟</button>
        <button className="secondary" disabled={!selected} onClick={() => submit(selected === answer, 3)}><Clock size={16} /> 模糊</button>
        <button className="primary" disabled={!selected} onClick={() => submit(selected === answer, 5)}><Check size={16} /> 掌握</button>
      </div>
    </section>
  );
}

function PlanPanel({ profile, setProfile, plan, onGenerate, busy }) {
  const days = plan?.plan || [];
  return (
    <section className="panel plan-panel">
      <div className="panel-heading">
        <div>
          <h3>AI 学习路径</h3>
          <p>用学习记录和薄弱词生成 7 天四级单词安排。</p>
        </div>
        <button className="primary" onClick={onGenerate} disabled={busy}>{busy ? <RefreshCcw className="spin" size={16} /> : <Sparkles size={16} />} 生成路径</button>
      </div>
      <div className="profile-grid">
        <label>考试时间<input value={profile.examDate} onChange={(e) => setProfile({ ...profile, examDate: e.target.value })} /></label>
        <label>每天时长<input value={profile.dailyMinutes} onChange={(e) => setProfile({ ...profile, dailyMinutes: e.target.value })} /></label>
        <label>目标<input value={profile.target} onChange={(e) => setProfile({ ...profile, target: e.target.value })} /></label>
      </div>
      {plan?.mode === 'infinisynapse-task' && <div className="task-box">InfiniSynapse 任务已创建，连接 ID：<code>{plan.task.connId}</code>。可在平台后台查看执行日志和产物。</div>}
      {plan?.warning && <div className="task-box warning">平台调用回退：{plan.warning}</div>}
      <div className="timeline">
        {(days.length ? days : defaultDays).map((day) => (
          <div className="day" key={day.day}>
            <span className="day-index">D{day.day}</span>
            <div>
              <strong>{day.focus}</strong>
              <p>{day.task}</p>
              <small>新词：{day.newWords?.join('、') || '按推荐词'} · 复习：{day.reviewWords?.join('、') || '错题词'}</small>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const defaultDays = [
  { day: 1, focus: '先诊断', task: '完成10个高频词自测，建立第一批弱词。', newWords: ['ability', 'achieve', 'benefit'], reviewWords: ['错题词'] },
  { day: 2, focus: '语境记忆', task: '对昨天错词生成 AI 例句并复述。', newWords: ['approach', 'essential'], reviewWords: ['D1错词'] }
];

function App() {
  const [health, setHealth] = useState({ loading: true, infinisynapseConfigured: null, wordCount: 0 });
  const [words, setWords] = useState([]);
  const [tags, setTags] = useState([]);
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState('');
  const [progress, setProgress] = useState(null);
  const [index, setIndex] = useState(0);
  const [aiCards, setAiCards] = useState({});
  const [busyWord, setBusyWord] = useState('');
  const [planBusy, setPlanBusy] = useState(false);
  const [plan, setPlan] = useState(null);
  const [profile, setProfile] = useState({ examDate: '30天后', dailyMinutes: '30', target: '四级阅读提分' });

  async function loadAll() {
    setHealth((prev) => ({ ...prev, loading: true, error: '' }));
    const cacheBust = Date.now();
    const [healthData, wordsData, progressData] = await Promise.all([
      api(`/api/health?t=${cacheBust}`),
      api(`/api/words?q=${encodeURIComponent(query)}&tag=${encodeURIComponent(tag)}&t=${cacheBust}`),
      api(`/api/progress?t=${cacheBust}`)
    ]);
    setHealth({ ...healthData, loading: false, error: '' });
    setWords(wordsData.words);
    setTags(wordsData.tags);
    setProgress(progressData);
    setIndex(0);
  }

  useEffect(() => {
    loadAll().catch((error) => {
      console.error(error);
      setHealth({ loading: false, infinisynapseConfigured: null, wordCount: 0, error: error.message || '连接检查失败' });
    });
  }, [query, tag]);

  const current = words[index] || words[0];
  const stats = progress?.stats || { totalReviews: 0, accuracy: 0, mastered: 0, weak: 0, byWord: [] };
  const recommended = progress?.recommendations || [];
  const deck = useMemo(() => recommended.length ? recommended : words.slice(0, 10), [recommended, words]);

  async function review(word, correct, rating) {
    const data = await api('/api/review', { method: 'POST', body: JSON.stringify({ word, correct, rating }) });
    setProgress({ ...progress, stats: data.stats, recommendations: data.recommendations });
    setIndex((value) => (value + 1) % Math.max(words.length, 1));
  }

  async function generateDefinition(word) {
    setBusyWord(word);
    try {
      const data = await api('/api/ai/definition', { method: 'POST', body: JSON.stringify({ word }) });
      setAiCards((prev) => ({ ...prev, [word]: data }));
    } finally {
      setBusyWord('');
    }
  }

  async function generatePlan() {
    setPlanBusy(true);
    try {
      const data = await api('/api/ai/path', { method: 'POST', body: JSON.stringify({ profile }) });
      setPlan(data);
    } finally {
      setPlanBusy(false);
    }
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><Brain /> <span>CET-4 Vocab Lab</span></div>
        <p className="side-copy">面向四级冲刺的 AI 单词诊断、自适应路径和语境例句工作台。</p>
        <div className="status-card">
          <span className={health.infinisynapseConfigured === true ? 'dot ok' : health.error ? 'dot warn' : 'dot pending'}></span>
          InfiniSynapse {health.loading ? '检查中' : health.error ? '连接检查失败' : health.infinisynapseConfigured === true ? '已配置' : '未配置'}
        </div>
        <nav>
          <a href="#study"><BookOpen size={16} /> 背词</a>
          <a href="#diagnosis"><BarChart3 size={16} /> 诊断</a>
          <a href="#plan"><Target size={16} /> 路径</a>
        </nav>
      </aside>

      <section className="content">
        <header className="hero">
          <div>
            <Pill tone="green">InfiniSynapse Vibe Coding</Pill>
            <h1>四级单词学习舱</h1>
            <p>先用本地词库完成闭环，再通过 InfiniSynapse 生成释义、例句和学习路径，适合半天内开发并上线参赛。</p>
          </div>
          <button className="primary large" onClick={() => current && generateDefinition(current.word)}><Sparkles size={18} /> 生成当前词 AI 卡</button>
        </header>

        <section className="metrics" id="diagnosis">
          <Metric icon={<BookOpen />} label="词库规模" value={health?.wordCount || words.length} hint="内置四级核心词" />
          <Metric icon={<Check />} label="练习次数" value={stats.totalReviews} hint="本地持久化记录" />
          <Metric icon={<BarChart3 />} label="正确率" value={`${stats.accuracy}%`} hint="按所有自测计算" />
          <Metric icon={<Target />} label="薄弱词" value={stats.weak} hint="低正确率或低熟悉度" />
        </section>

        <section className="toolbar">
          <div className="search-box"><Search size={16} /><input placeholder="搜索单词或中文释义" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
          <div className="tag-row">
            <button className={!tag ? 'tag active' : 'tag'} onClick={() => setTag('')}>全部</button>
            {tags.map((item) => <button className={tag === item ? 'tag active' : 'tag'} key={item} onClick={() => setTag(item)}>{item}</button>)}
          </div>
        </section>

        <div className="main-grid" id="study">
          {current && <WordCard word={current} onReview={review} onGenerate={generateDefinition} aiCard={aiCards[current.word]} busy={busyWord === current.word} />}
          <section className="panel">
            <div className="panel-heading"><h3>今日推荐</h3><button className="ghost-button" onClick={() => setIndex((index + 1) % Math.max(words.length, 1))}>换一个 <ChevronRight size={16} /></button></div>
            <div className="word-list">
              {deck.slice(0, 10).map((item, i) => (
                <button key={item.word} onClick={() => setIndex(words.findIndex((word) => word.word === item.word))} className="word-item">
                  <span>{i + 1}. {item.word}</span><small>{item.meaning}</small>
                </button>
              ))}
            </div>
          </section>
        </div>

        <PlanPanel profile={profile} setProfile={setProfile} plan={plan} onGenerate={generatePlan} busy={planBusy} />
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
