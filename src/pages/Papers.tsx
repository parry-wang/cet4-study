import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Sparkles, Clock, Layers, Minus, Plus, ArrowRight } from 'lucide-react';
import { generatePaper, savePaper } from '@/utils/paperGenerator';
import type { PaperQuestionType } from '@/data/types';
import { paperQuestionBank } from '@/data/papers';
import { useProgressStore } from '@/store/useProgressStore';
import { clsx } from 'clsx';

const allTypes: { key: PaperQuestionType; label: string; desc: string; max: number }[] = [
  { key: '词汇', label: '词汇', desc: '单选词汇与短语', max: 8 },
  { key: '阅读', label: '阅读', desc: '阅读理解选择', max: 4 },
  { key: '听力', label: '听力', desc: '听力选择', max: 3 },
  { key: '写作', label: '写作', desc: '短文写作', max: 2 },
  { key: '翻译', label: '翻译', desc: '中译英', max: 3 },
];

const difficulties = [
  { value: 0, label: '混合' },
  { value: 1, label: '基础' },
  { value: 2, label: '进阶' },
  { value: 3, label: '高阶' },
];

export default function Papers() {
  const navigate = useNavigate();
  const { stats, recordPaperTaken } = useProgressStore();
  const [selectedTypes, setSelectedTypes] = useState<Set<PaperQuestionType>>(
    new Set(['词汇', '阅读', '听力']),
  );
  const [counts, setCounts] = useState<Record<PaperQuestionType, number>>({
    词汇: 5, 阅读: 3, 听力: 2, 写作: 1, 翻译: 2,
  });
  const [difficulty, setDifficulty] = useState(0);
  const [duration, setDuration] = useState(30);

  const toggleType = (t: PaperQuestionType) => {
    const next = new Set(selectedTypes);
    if (next.has(t)) next.delete(t);
    else next.add(t);
    setSelectedTypes(next);
  };

  const adjustCount = (t: PaperQuestionType, delta: number) => {
    const max = allTypes.find((x) => x.key === t)?.max || 5;
    setCounts((c) => ({
      ...c,
      [t]: Math.max(1, Math.min(max, c[t] + delta)),
    }));
  };

  const totalQuestions = Array.from(selectedTypes).reduce(
    (sum, t) => sum + counts[t], 0,
  );

  const handleGenerate = () => {
    if (selectedTypes.size === 0) return;
    const config = {
      types: Array.from(selectedTypes),
      countPerType: counts,
      difficulty,
      duration,
    };
    const paper = generatePaper(config);
    savePaper(paper);
    recordPaperTaken();
    navigate(`/papers/exam/${paper.id}`);
  };

  return (
    <div className="container mx-auto px-6 lg:px-8 py-10 max-w-5xl">
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <FileText size={16} className="text-wine-500" />
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-wine-500">
            § Papers · 试卷生成
          </span>
        </div>
        <h1 className="font-display text-4xl lg:text-5xl font-black tracking-tight text-ink-900 mb-2">
          组卷配置台
        </h1>
        <p className="font-serif text-ink-400">
          自定义题型与题量，自动组卷，在线作答，客观题自动批改 · 已累计练习 {stats.papersTaken} 套
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Config Form */}
        <div className="lg:col-span-8 space-y-8">
          {/* 题型选择 */}
          <section className="bg-paper-50 border border-ink-900/10 p-7 rounded-sm">
            <div className="flex items-center gap-2 mb-5">
              <Layers size={16} className="text-wine-500" />
              <h2 className="font-display text-xl font-bold text-ink-900">选择题型</h2>
            </div>
            <div className="space-y-3">
              {allTypes.map((t) => {
                const active = selectedTypes.has(t.key);
                const available = paperQuestionBank.filter((q) => q.type === t.key).length;
                return (
                  <div
                    key={t.key}
                    className={clsx(
                      'flex items-center gap-4 p-4 border rounded-sm transition-all',
                      active ? 'border-wine-500/40 bg-wine-50/30' : 'border-ink-900/10 bg-paper-100/40',
                    )}
                  >
                    <button
                      onClick={() => toggleType(t.key)}
                      className={clsx(
                        'w-5 h-5 border-2 rounded-sm flex items-center justify-center shrink-0 transition-colors',
                        active ? 'bg-wine-600 border-wine-600' : 'border-ink-900/30',
                      )}
                    >
                      {active && <span className="text-paper-50 text-xs">✓</span>}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-display font-bold text-ink-900">{t.label}</span>
                        <span className="font-mono text-[10px] text-ink-400">题库 {available} 题</span>
                      </div>
                      <p className="font-serif text-xs text-ink-400">{t.desc}</p>
                    </div>
                    {active && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => adjustCount(t.key, -1)}
                          className="w-7 h-7 border border-ink-900/20 hover:border-wine-500 hover:text-wine-600 rounded-sm flex items-center justify-center"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="font-mono text-sm text-ink-900 w-6 text-center">{counts[t.key]}</span>
                        <button
                          onClick={() => adjustCount(t.key, 1)}
                          className="w-7 h-7 border border-ink-900/20 hover:border-wine-500 hover:text-wine-600 rounded-sm flex items-center justify-center"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* 难度与时长 */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-paper-50 border border-ink-900/10 p-6 rounded-sm">
              <h3 className="font-display text-lg font-bold text-ink-900 mb-4">难度</h3>
              <div className="grid grid-cols-2 gap-2">
                {difficulties.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDifficulty(d.value)}
                    className={clsx(
                      'py-2.5 font-serif text-sm border rounded-sm transition-colors',
                      difficulty === d.value
                        ? 'bg-ink-900 text-paper-50 border-ink-900'
                        : 'bg-paper-100 text-ink-700 border-ink-900/15 hover:border-wine-500/50',
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-paper-50 border border-ink-900/10 p-6 rounded-sm">
              <h3 className="font-display text-lg font-bold text-ink-900 mb-4 flex items-center gap-2">
                <Clock size={15} className="text-wine-500" /> 考试时长
              </h3>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={15}
                  max={90}
                  step={5}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="flex-1 accent-wine-600"
                />
                <span className="font-display text-2xl font-bold text-ink-900 w-16 text-right">
                  {duration}<span className="text-sm text-ink-400"> 分</span>
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Summary */}
        <aside className="lg:col-span-4">
          <div className="sticky top-20 bg-ink-900 text-paper-100 p-7 rounded-sm grain-overlay">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles size={16} className="text-gold-400" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold-400">
                Paper Summary
              </span>
            </div>
            <div className="space-y-4 mb-6">
              <div className="flex items-baseline justify-between pb-3 border-b border-paper-400/20">
                <span className="font-serif text-sm text-paper-400">题型</span>
                <span className="font-display font-bold">{selectedTypes.size} 种</span>
              </div>
              <div className="flex items-baseline justify-between pb-3 border-b border-paper-400/20">
                <span className="font-serif text-sm text-paper-400">总题数</span>
                <span className="font-display text-2xl font-bold text-gold-400">{totalQuestions}</span>
              </div>
              <div className="flex items-baseline justify-between pb-3 border-b border-paper-400/20">
                <span className="font-serif text-sm text-paper-400">难度</span>
                <span className="font-display font-bold">
                  {difficulties.find((d) => d.value === difficulty)?.label}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="font-serif text-sm text-paper-400">时长</span>
                <span className="font-display font-bold">{duration} 分钟</span>
              </div>
            </div>
            <button
              onClick={handleGenerate}
              disabled={selectedTypes.size === 0}
              className="w-full py-3 bg-wine-600 hover:bg-wine-700 text-paper-50 font-serif text-sm rounded-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              生成试卷 <ArrowRight size={15} />
            </button>
            {selectedTypes.size === 0 && (
              <p className="font-mono text-[10px] text-paper-400 mt-3 text-center">
                请至少选择一种题型
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
