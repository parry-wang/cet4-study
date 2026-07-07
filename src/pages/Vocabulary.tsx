import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { BookOpen, Layers, Brain, RefreshCw, Check, AlertTriangle } from 'lucide-react';
import { useProgressStore } from '@/store/useProgressStore';
import { vocabulary, TOTAL_DAYS } from '@/data/vocabulary';

const difficultyMap = { 1: '基础', 2: '进阶', 3: '高阶' };
const difficultyColor = {
  1: 'text-moss-500 border-moss-500/30 bg-moss-100/50',
  2: 'text-gold-600 border-gold-500/30 bg-gold-100/40',
  3: 'text-wine-600 border-wine-500/30 bg-wine-50',
};

export default function Vocabulary() {
  const { vocabulary: vocab, ensureDailyUpdate } = useProgressStore();
  // 触发定点更新检查
  ensureDailyUpdate();

  const todayWords = useMemo(() => {
    const start = vocab.dayIndex * 50;
    return vocabulary.slice(start, start + 50);
  }, [vocab.dayIndex]);

  const studiedCount = todayWords.filter((w) => vocab.studied.includes(w.id)).length;
  const masteredCount = todayWords.filter((w) => vocab.mastered.includes(w.id)).length;
  const wrongInDay = vocab.wrong.filter((w) =>
    todayWords.some((tw) => tw.id === w.wordId),
  ).length;

  const circumference = 2 * Math.PI * 40;
  const progress = Math.round((studiedCount / 50) * 100);

  const modes = [
    {
      to: '/vocabulary/study',
      icon: Layers,
      title: '词卡学习',
      desc: '翻转卡片，正面单词背面释义，听音跟读',
      cta: '开始学习',
      primary: true,
    },
    {
      to: '/vocabulary/quiz',
      icon: Brain,
      title: '考察模式',
      desc: '英译汉 / 汉译英 / 听写，错题自动入错题本',
      cta: '开始考察',
      primary: false,
    },
    {
      to: '/vocabulary/review',
      icon: RefreshCw,
      title: '错词复习',
      desc: '间隔重复算法，错词按 1·2·4·7 日反复出现',
      cta: `复习 ${vocab.wrong.length} 词`,
      primary: false,
    },
  ];

  return (
    <div className="container mx-auto px-6 lg:px-8 py-10">
      {/* Header */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <BookOpen size={16} className="text-wine-500" />
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-wine-500">
            § Vocabulary · 单词背诵
          </span>
        </div>
        <h1 className="font-display text-4xl lg:text-5xl font-black tracking-tight text-ink-900 mb-2">
          每日词库
        </h1>
        <p className="font-serif text-ink-400">
          第 {vocab.dayIndex + 1} 天 / 共 {TOTAL_DAYS} 天 · CET-4 高频词表 · 每日 50 词定点更新
        </p>
      </header>

      {/* Progress Overview */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
        <div className="lg:col-span-4 bg-paper-50 border border-ink-900/10 p-7 rounded-sm flex items-center gap-6">
          <div className="relative shrink-0">
            <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(26,26,26,0.08)" strokeWidth="5" />
              <circle
                cx="50" cy="50" r="40" fill="none" stroke="#7A2E2E" strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress / 100)}
                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-xl font-bold text-ink-900">{progress}%</span>
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400 mb-1">
              今日进度
            </div>
            <div className="font-display text-2xl font-bold text-ink-900">
              {studiedCount}<span className="text-ink-400 text-base">/50</span>
            </div>
            <div className="font-serif text-xs text-ink-400 mt-1">已学单词</div>
          </div>
        </div>

        <div className="lg:col-span-8 grid grid-cols-3 gap-px bg-ink-900/10 border border-ink-900/10 rounded-sm overflow-hidden">
          {[
            { label: '已学', value: studiedCount, icon: Check, color: 'text-ink-900' },
            { label: '已掌握', value: masteredCount, icon: Check, color: 'text-moss-500' },
            { label: '本日错词', value: wrongInDay, icon: AlertTriangle, color: 'text-wine-600' },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-paper-50 px-5 py-6">
                <Icon size={16} className={`${s.color} mb-3`} strokeWidth={1.8} />
                <div className="font-display text-3xl font-bold text-ink-900">{s.value}</div>
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400 mt-1">
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Modes */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
        {modes.map((m) => {
          const Icon = m.icon;
          return (
            <Link
              key={m.to}
              to={m.to}
              className={`group p-6 border rounded-sm transition-all hover:shadow-lift ${
                m.primary
                  ? 'bg-ink-900 text-paper-100 border-ink-900 hover:bg-ink-950'
                  : 'bg-paper-50 text-ink-900 border-ink-900/10 hover:border-wine-500/40'
              }`}
            >
              <Icon size={22} strokeWidth={1.6} className="mb-4 opacity-80" />
              <h3 className="font-display text-xl font-bold mb-2">{m.title}</h3>
              <p className={`font-serif text-sm mb-5 ${m.primary ? 'text-paper-400' : 'text-ink-400'}`}>
                {m.desc}
              </p>
              <span className={`font-mono text-[11px] uppercase tracking-wider ${
                m.primary ? 'text-gold-400' : 'text-wine-500'
              }`}>
                {m.cta} →
              </span>
            </Link>
          );
        })}
      </section>

      {/* Word List */}
      <section>
        <div className="flex items-baseline justify-between mb-5 pb-3 border-b border-ink-900/15">
          <h2 className="font-display text-2xl font-bold text-ink-900">今日词表</h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400">
            Day {vocab.dayIndex + 1} · 50 words
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
          {todayWords.map((w, idx) => {
            const isStudied = vocab.studied.includes(w.id);
            const isMastered = vocab.mastered.includes(w.id);
            const isWrong = vocab.wrong.some((ww) => ww.wordId === w.id);
            return (
              <div
                key={w.id}
                className="flex items-center gap-3 py-2.5 border-b border-ink-900/5 group hover:bg-paper-50 px-2 -mx-2 transition-colors"
              >
                <span className="font-mono text-[10px] text-ink-400 w-6 shrink-0">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className={`font-display font-semibold ${
                      isMastered ? 'text-moss-500' : isWrong ? 'text-wine-600' : 'text-ink-900'
                    }`}>
                      {w.word}
                    </span>
                    <span className="font-mono text-[10px] text-ink-400 truncate">{w.phonetic}</span>
                  </div>
                  <div className="font-serif text-xs text-ink-700 truncate">
                    <span className="text-wine-500/80">{w.pos}</span> {w.meaning}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 border rounded-sm ${difficultyColor[w.difficulty]}`}>
                    {difficultyMap[w.difficulty]}
                  </span>
                  {isMastered && <Check size={13} className="text-moss-500" />}
                  {isWrong && <AlertTriangle size={12} className="text-wine-500" />}
                  {!isStudied && !isMastered && !isWrong && (
                    <span className="w-2 h-2 rounded-full bg-ink-900/15" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
