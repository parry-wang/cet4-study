import { Link } from 'react-router-dom';
import { useState } from 'react';
import { PenLine, ArrowRight, FileText } from 'lucide-react';
import { writingTopics } from '@/data/writing';
import { clsx } from 'clsx';

const types = ['全部', '议论文', '说明文', '应用文', '图表作文'] as const;

export default function Writing() {
  const [type, setType] = useState<(typeof types)[number]>('全部');

  const filtered = type === '全部'
    ? writingTopics
    : writingTopics.filter((t) => t.type === type);

  return (
    <div className="container mx-auto px-6 lg:px-8 py-10">
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <PenLine size={16} className="text-wine-500" />
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-wine-500">
            § Writing · 作文书写
          </span>
        </div>
        <h1 className="font-display text-4xl lg:text-5xl font-black tracking-tight text-ink-900 mb-2">
          作文话题库
        </h1>
        <p className="font-serif text-ink-400">
          仿真稿纸编辑器 · 实时字数统计 · 提交后对照范文与高分模板
        </p>
      </header>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-2 mb-8 pb-6 border-b border-ink-900/10">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={clsx(
              'px-4 py-1.5 font-serif text-sm border rounded-sm transition-colors',
              type === t
                ? 'bg-ink-900 text-paper-50 border-ink-900'
                : 'bg-paper-50 text-ink-700 border-ink-900/15 hover:border-wine-500/50',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Topic List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((t, idx) => (
          <Link
            key={t.id}
            to={`/writing/${t.id}`}
            className="group bg-paper-50 border border-ink-900/10 p-7 hover:border-wine-500/40 hover:shadow-lift rounded-sm transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-wine-500 px-2 py-0.5 border border-wine-500/30 rounded-sm">
                {t.type}
              </span>
              <span className="font-display text-4xl font-black text-ink-900/10 group-hover:text-wine-500/20 transition-colors leading-none">
                {String(idx + 1).padStart(2, '0')}
              </span>
            </div>
            <h3 className="font-display text-xl font-bold text-ink-900 mb-3 leading-snug">
              {t.topic}
            </h3>
            <p className="font-serif text-sm text-ink-400 line-clamp-3 mb-5 leading-relaxed">
              {t.requirement}
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-ink-900/8 font-mono text-[11px] text-ink-700">
              <span className="flex items-center gap-1">
                <FileText size={12} /> 限 {t.wordLimit} 词
              </span>
              <span className="flex items-center gap-1 text-wine-500 group-hover:translate-x-1 transition-transform">
                开始写作 <ArrowRight size={12} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
