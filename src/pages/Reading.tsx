import { Link } from 'react-router-dom';
import { useState } from 'react';
import { BookText, ArrowRight, FileQuestion } from 'lucide-react';
import { readingPassages } from '@/data/reading';
import { useProgressStore } from '@/store/useProgressStore';
import { clsx } from 'clsx';

const categories = ['全部', '科普', '社会', '教育', '经济', '文化', '环境'] as const;
const difficultyMap = { 1: '基础', 2: '进阶', 3: '高阶' };

export default function Reading() {
  const [cat, setCat] = useState<(typeof categories)[number]>('全部');
  const { readingWrong } = useProgressStore();

  const filtered = cat === '全部'
    ? readingPassages
    : readingPassages.filter((p) => p.category === cat);

  return (
    <div className="container mx-auto px-6 lg:px-8 py-10">
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <BookText size={16} className="text-wine-500" />
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-wine-500">
            § Reading · 阅读理解
          </span>
        </div>
        <h1 className="font-display text-4xl lg:text-5xl font-black tracking-tight text-ink-900 mb-2">
          阅读篇章库
        </h1>
        <p className="font-serif text-ink-400">
          左文右题双栏布局 · 计时训练 · 提交即得解析与考点说明
        </p>
      </header>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-2 mb-8 pb-6 border-b border-ink-900/10">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={clsx(
              'px-4 py-1.5 font-serif text-sm border rounded-sm transition-colors',
              cat === c
                ? 'bg-ink-900 text-paper-50 border-ink-900'
                : 'bg-paper-50 text-ink-700 border-ink-900/15 hover:border-wine-500/50',
            )}
          >
            {c}
          </button>
        ))}
        <span className="ml-auto font-mono text-[11px] text-ink-400">
          阅读错题 {readingWrong.length} 项
        </span>
      </div>

      {/* Passage List */}
      <div className="space-y-4">
        {filtered.map((p, idx) => (
          <Link
            key={p.id}
            to={`/reading/${p.id}`}
            className="group block bg-paper-50 border border-ink-900/10 p-6 hover:border-wine-500/40 hover:shadow-lift rounded-sm transition-all"
          >
            <div className="flex items-start gap-5">
              <span className="font-display text-5xl font-black text-ink-900/10 group-hover:text-wine-500/20 transition-colors leading-none mt-1">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-wine-500">
                    {p.category}
                  </span>
                  <span className={clsx(
                    'font-mono text-[10px] px-1.5 py-0.5 border rounded-sm',
                    p.difficulty === 1 ? 'text-moss-500 border-moss-500/30' :
                    p.difficulty === 2 ? 'text-gold-600 border-gold-500/30' :
                    'text-wine-600 border-wine-500/30',
                  )}>
                    {difficultyMap[p.difficulty]}
                  </span>
                </div>
                <h3 className="font-display text-2xl font-bold text-ink-900 mb-2">{p.title}</h3>
                <p className="font-serif text-sm text-ink-400 line-clamp-2 leading-relaxed">
                  {p.passage.slice(0, 160)}...
                </p>
                <div className="flex items-center gap-4 mt-4 font-mono text-[11px] text-ink-700">
                  <span className="flex items-center gap-1">
                    <FileQuestion size={12} /> {p.questions.length} 题
                  </span>
                  <span>约 {p.passage.split(' ').length} 词</span>
                  <span className="ml-auto flex items-center gap-1 text-wine-500 group-hover:translate-x-1 transition-transform">
                    开始阅读 <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
