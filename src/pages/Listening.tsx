import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Headphones, Clock, ArrowRight, BookOpen } from 'lucide-react';
import { listeningMaterials } from '@/data/listening';
import { useProgressStore } from '@/store/useProgressStore';
import { clsx } from 'clsx';

const categories = ['全部', '短对话', '长对话', '短文理解', '新闻报道'] as const;
const difficultyMap = { 1: '基础', 2: '进阶', 3: '高阶' };

export default function Listening() {
  const [cat, setCat] = useState<(typeof categories)[number]>('全部');
  const { listeningWrong } = useProgressStore();

  const filtered = cat === '全部'
    ? listeningMaterials
    : listeningMaterials.filter((m) => m.category === cat);

  const fmtDuration = (s: number) => `${Math.floor(s / 60)}'${String(s % 60).padStart(2, '0')}"`;

  return (
    <div className="container mx-auto px-6 lg:px-8 py-10">
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <Headphones size={16} className="text-wine-500" />
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-wine-500">
            § Listening · 听力播报
          </span>
        </div>
        <h1 className="font-display text-4xl lg:text-5xl font-black tracking-tight text-ink-900 mb-2">
          听力素材库
        </h1>
        <p className="font-serif text-ink-400">
          短对话 · 长对话 · 短文理解 · 新闻报道 — 浏览器语音合成播报，支持倍速与原文对照
        </p>
      </header>

      {/* Category Filter */}
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
          听力错题 {listeningWrong.length} 项
        </span>
      </div>

      {/* Material List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((m, idx) => (
          <Link
            key={m.id}
            to={`/listening/${m.id}`}
            className="group bg-paper-50 border border-ink-900/10 p-6 hover:border-wine-500/40 hover:shadow-lift rounded-sm transition-all relative overflow-hidden"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="font-display text-3xl font-black text-ink-900/15 group-hover:text-wine-500/30 transition-colors">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-wine-500">
                    {m.category}
                  </span>
                  <h3 className="font-display text-xl font-bold text-ink-900 mt-0.5">{m.title}</h3>
                </div>
              </div>
              <ArrowRight size={16} className="text-ink-400 group-hover:text-wine-500 group-hover:translate-x-1 transition-all shrink-0" />
            </div>
            <p className="font-serif text-sm text-ink-400 line-clamp-2 mb-4">
              {m.audioText.slice(0, 90)}...
            </p>
            <div className="flex items-center gap-4 pt-4 border-t border-ink-900/8 font-mono text-[11px] text-ink-700">
              <span className="flex items-center gap-1">
                <Clock size={12} /> {fmtDuration(m.duration)}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen size={12} /> {m.questions.length} 题
              </span>
              <span className={clsx(
                'ml-auto px-1.5 py-0.5 border rounded-sm',
                m.difficulty === 1 ? 'text-moss-500 border-moss-500/30' :
                m.difficulty === 2 ? 'text-gold-600 border-gold-500/30' :
                'text-wine-600 border-wine-500/30',
              )}>
                {difficultyMap[m.difficulty]}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
