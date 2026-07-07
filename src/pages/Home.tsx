import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import {
  BookOpen, Headphones, BookText, PenLine, FileText, AlertCircle,
  ArrowRight, Flame, Quote,
} from 'lucide-react';
import { useProgressStore } from '@/store/useProgressStore';
import { vocabulary, TOTAL_DAYS } from '@/data/vocabulary';

const quotes = [
  { en: 'A little learning is a dangerous thing.', cn: '浅学误人。' },
  { en: 'Practice makes perfect.', cn: '熟能生巧。' },
  { en: 'Rome was not built in a day.', cn: '罗马非一日建成。' },
  { en: 'Well begun is half done.', cn: '良好的开端是成功的一半。' },
  { en: 'The early bird catches the worm.', cn: '早起的鸟儿有虫吃。' },
];

export default function Home() {
  const { vocabulary: vocab, calendar, stats } = useProgressStore();
  const todayWords = useMemo(() => {
    const start = vocab.dayIndex * 50;
    return vocabulary.slice(start, start + 50);
  }, [vocab.dayIndex]);

  const todayStudiedCount = todayWords.filter((w) =>
    vocab.studied.includes(w.id),
  ).length;
  const todayProgress = Math.round((todayStudiedCount / 50) * 100);

  // 近 30 天热力图数据
  const heatmap = useMemo(() => {
    const days: { date: string; count: number }[] = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${day}`;
      days.push({ date: dateStr, count: calendar[dateStr] || 0 });
    }
    return days;
  }, [calendar]);

  const today = new Date();
  const quoteIdx = today.getDate() % quotes.length;
  const quote = quotes[quoteIdx];

  const tasks = [
    {
      to: '/vocabulary',
      icon: BookOpen,
      title: '单词背诵',
      desc: `今日第 ${vocab.dayIndex + 1} 天 / 共 ${TOTAL_DAYS} 天`,
      stat: `${todayStudiedCount}/50 词`,
      progress: todayProgress,
    },
    {
      to: '/listening',
      icon: Headphones,
      title: '听力播报',
      desc: '短对话 · 长对话 · 短文 · 新闻',
      stat: '8 篇素材',
    },
    {
      to: '/reading',
      icon: BookText,
      title: '阅读理解',
      desc: '科普 · 社会 · 教育 · 经济',
      stat: '6 篇篇章',
    },
    {
      to: '/writing',
      icon: PenLine,
      title: '作文书写',
      desc: '议论 · 说明 · 应用 · 图表',
      stat: '6 个话题',
    },
    {
      to: '/papers',
      icon: FileText,
      title: '试卷生成',
      desc: '自定义题型与题量，在线作答',
      stat: `已练 ${stats.papersTaken} 套`,
    },
    {
      to: '/mistakes',
      icon: AlertCircle,
      title: '错题本',
      desc: '错词 · 阅读错题 · 听力错题',
      stat: `${vocab.wrong.length + stats.accuracy} 项待巩固`,
    },
  ];

  const circumference = 2 * Math.PI * 52;
  const dashOffset = circumference * (1 - todayProgress / 100);

  return (
    <div className="container mx-auto px-6 lg:px-8 py-10 lg:py-14">
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center mb-20">
        <div className="lg:col-span-7 animate-riseIn">
          <div className="flex items-center gap-3 mb-5">
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-wine-500">
              CET-4 Studio · 砚墨
            </span>
            <span className="h-px w-12 bg-ink-900/30" />
            <span className="font-mono text-[11px] text-ink-400">
              {today.getFullYear()}.{String(today.getMonth() + 1).padStart(2, '0')}.{String(today.getDate()).padStart(2, '0')}
            </span>
          </div>
          <h1 className="font-display text-5xl lg:text-7xl font-black tracking-tightest leading-[1.02] text-ink-900 mb-6">
            每日五十词，
            <br />
            <span className="text-wine-600">积墨成章</span>。
          </h1>
          <p className="font-serif text-lg text-ink-700 leading-relaxed max-w-xl mb-8">
            一座为大学英语四级而生的学习工作室。词卡翻飞间，听力播报里，
            阅读与写作的笔触慢慢成形——而每一道错题，都将反复归来，直至真正掌握。
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/vocabulary/study"
              className="inline-flex items-center gap-2 px-6 py-3 bg-wine-600 text-paper-50 font-serif text-sm tracking-wide hover:bg-wine-700 transition-colors rounded-sm shadow-lift"
            >
              开始今日学习
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/vocabulary/review"
              className="inline-flex items-center gap-2 px-6 py-3 border border-ink-900/20 text-ink-900 font-serif text-sm tracking-wide hover:border-wine-500 hover:text-wine-600 transition-colors rounded-sm"
            >
              <Flame size={15} />
              复习错词（{vocab.wrong.length}）
            </Link>
          </div>
        </div>

        {/* Progress Ring */}
        <div className="lg:col-span-5 flex justify-center animate-riseIn">
          <div className="relative">
            <svg width="240" height="240" viewBox="0 0 240 240" className="-rotate-90">
              <circle
                cx="120" cy="120" r="52"
                fill="none" stroke="rgba(26,26,26,0.08)" strokeWidth="6"
              />
              <circle
                cx="120" cy="120" r="52"
                fill="none" stroke="#7A2E2E" strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
              />
              <circle
                cx="120" cy="120" r="78"
                fill="none" stroke="rgba(184,134,11,0.18)" strokeWidth="1"
                strokeDasharray="2 4"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400 mb-1">
                Today
              </span>
              <span className="font-display text-5xl font-black text-ink-900">
                {todayProgress}<span className="text-2xl text-wine-500">%</span>
              </span>
              <span className="font-serif text-xs text-ink-700 mt-1">
                {todayStudiedCount} / 50 词
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-px bg-ink-900/10 border border-ink-900/10 mb-20">
        {[
          { label: '累计学习天数', value: stats.totalDays, suffix: '天' },
          { label: '已学单词', value: vocab.studied.length, suffix: '词' },
          { label: '已掌握', value: vocab.mastered.length, suffix: '词' },
          { label: '错词待复习', value: vocab.wrong.length, suffix: '词' },
        ].map((s) => (
          <div key={s.label} className="bg-paper-50 px-6 py-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400 mb-2">
              {s.label}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-3xl font-bold text-ink-900">
                {s.value}
              </span>
              <span className="font-serif text-sm text-ink-400">{s.suffix}</span>
            </div>
          </div>
        ))}
      </section>

      {/* Task Cards */}
      <section className="mb-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-ink-900">
              学习模块
            </h2>
            <p className="font-serif text-sm text-ink-400 mt-1">
              Five studios, one goal — passing CET-4 with grace.
            </p>
          </div>
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-400 hidden md:inline">
            § Modules
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tasks.map((task, idx) => {
            const Icon = task.icon;
            return (
              <Link
                key={task.to}
                to={task.to}
                className="group relative bg-paper-50 border border-ink-900/10 p-6 hover:border-wine-500/40 hover:shadow-lift transition-all duration-300 rounded-sm overflow-hidden"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="w-11 h-11 flex items-center justify-center bg-wine-50 text-wine-600 group-hover:bg-wine-600 group-hover:text-paper-50 transition-colors rounded-sm">
                    <Icon size={20} strokeWidth={1.6} />
                  </div>
                  <ArrowRight
                    size={16}
                    className="text-ink-400 group-hover:text-wine-500 group-hover:translate-x-1 transition-all"
                  />
                </div>
                <h3 className="font-display text-xl font-bold text-ink-900 mb-1">
                  {task.title}
                </h3>
                <p className="font-serif text-sm text-ink-400 mb-4">{task.desc}</p>
                <div className="flex items-center justify-between pt-4 border-t border-ink-900/8">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-ink-700">
                    {task.stat}
                  </span>
                  {task.progress !== undefined && (
                    <span className="font-mono text-[11px] text-wine-500">
                      {task.progress}%
                    </span>
                  )}
                </div>
                {task.progress !== undefined && (
                  <div className="absolute bottom-0 left-0 h-0.5 bg-wine-500 transition-all duration-700"
                    style={{ width: `${task.progress}%` }} />
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Heatmap + Quote */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Heatmap */}
        <div className="lg:col-span-7 bg-paper-50 border border-ink-900/10 p-7 rounded-sm">
          <div className="flex items-baseline justify-between mb-5">
            <h3 className="font-display text-xl font-bold text-ink-900">
              学习热力图
            </h3>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400">
              Last 30 days
            </span>
          </div>
          <div className="grid grid-cols-15 gap-1.5" style={{ gridTemplateColumns: 'repeat(30, minmax(0, 1fr))' }}>
            {heatmap.map((d) => {
              const intensity = d.count === 0 ? 0 : d.count < 20 ? 1 : d.count < 40 ? 2 : 3;
              const colors = [
                'bg-ink-900/8',
                'bg-gold-400/40',
                'bg-gold-500/70',
                'bg-wine-600',
              ];
              return (
                <div
                  key={d.date}
                  title={`${d.date}: ${d.count} 词`}
                  className={`aspect-square rounded-sm ${colors[intensity]} hover:ring-2 hover:ring-wine-400 transition-all cursor-default`}
                />
              );
            })}
          </div>
          <div className="flex items-center justify-end gap-2 mt-4">
            <span className="font-mono text-[10px] text-ink-400">少</span>
            <div className="w-3 h-3 rounded-sm bg-ink-900/8" />
            <div className="w-3 h-3 rounded-sm bg-gold-400/40" />
            <div className="w-3 h-3 rounded-sm bg-gold-500/70" />
            <div className="w-3 h-3 rounded-sm bg-wine-600" />
            <span className="font-mono text-[10px] text-ink-400">多</span>
          </div>
        </div>

        {/* Quote */}
        <div className="lg:col-span-5 bg-ink-900 text-paper-100 p-7 rounded-sm relative grain-overlay">
          <Quote size={32} className="text-wine-100/40 mb-4" />
          <p className="font-display text-2xl font-medium leading-snug mb-3">
            {quote.en}
          </p>
          <p className="font-serif text-sm text-paper-400">
            {quote.cn}
          </p>
          <span className="absolute bottom-5 right-6 font-mono text-[10px] uppercase tracking-[0.2em] text-paper-400/60">
            Daily Motto
          </span>
        </div>
      </section>
    </div>
  );
}
