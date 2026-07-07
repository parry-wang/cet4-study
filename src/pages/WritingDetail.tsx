import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Timer, Eye, EyeOff, PenLine, Check, RotateCcw,
} from 'lucide-react';
import { writingTopics } from '@/data/writing';
import { clsx } from 'clsx';

export default function WritingDetail() {
  const { id } = useParams<{ id: string }>();
  const topic = writingTopics.find((t) => t.id === id);

  const [content, setContent] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [showSample, setShowSample] = useState(false);
  const [showTemplate, setShowTemplate] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!topic) {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <p className="font-serif text-ink-400">未找到该作文话题。</p>
        <Link to="/writing" className="font-mono text-wine-500 underline mt-4 inline-block">返回列表</Link>
      </div>
    );
  }

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const fmtTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };
  const overLimit = wordCount > topic.wordLimit;
  const reachedMin = wordCount >= 120;

  const handleReset = () => {
    setContent('');
    setSeconds(0);
    setShowSample(false);
    setShowTemplate(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  };

  return (
    <div className="container mx-auto px-6 lg:px-8 py-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <Link to="/writing" className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-400 hover:text-wine-500">
          <ArrowLeft size={14} /> 话题库
        </Link>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-wine-500">{topic.type}</span>
          <span className="flex items-center gap-1.5 font-mono text-xs text-ink-700">
            <Timer size={13} className="text-wine-500" /> {fmtTime(seconds)}
          </span>
        </div>
      </div>

      {/* Title + Requirement */}
      <header className="mb-8 pb-6 border-b border-ink-900/10">
        <h1 className="font-display text-3xl lg:text-4xl font-black tracking-tight text-ink-900 mb-3">
          {topic.topic}
        </h1>
        <p className="font-serif text-sm text-ink-700 leading-relaxed max-w-3xl">
          {topic.requirement}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Editor */}
        <section className="lg:col-span-7">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400">
              Your Essay
            </span>
            <div className="flex items-center gap-3 font-mono text-xs">
              <span className={clsx(
                'px-2 py-0.5 border rounded-sm',
                overLimit ? 'text-wine-600 border-wine-500/40 bg-wine-50' :
                reachedMin ? 'text-moss-500 border-moss-500/30' :
                'text-ink-700 border-ink-900/15',
              )}>
                {wordCount} / {topic.wordLimit} 词
              </span>
            </div>
          </div>
          {/* 仿真稿纸 */}
          <div className="relative bg-paper-50 border border-ink-900/12 rounded-sm p-6 min-h-[480px]"
            style={{
              backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, rgba(122,46,46,0.08) 31px, rgba(122,46,46,0.08) 32px)',
            }}
          >
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="在此开始你的写作..."
              className="w-full h-[440px] bg-transparent font-serif text-[15px] leading-8 text-ink-900 outline-none resize-none placeholder:text-ink-400/50"
              style={{ lineHeight: '32px' }}
            />
          </div>
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 border border-ink-900/20 text-ink-900 font-serif text-sm hover:border-wine-500 rounded-sm"
            >
              <RotateCcw size={13} /> 重写
            </button>
            <button
              onClick={() => setShowSample(true)}
              disabled={!content.trim()}
              className={clsx(
                'px-5 py-2 font-serif text-sm rounded-sm flex items-center gap-2 transition-colors',
                content.trim()
                  ? 'bg-wine-600 text-paper-50 hover:bg-wine-700'
                  : 'bg-ink-900/15 text-ink-400 cursor-not-allowed',
              )}
            >
              <Check size={14} /> 提交并查看范文
            </button>
          </div>
        </section>

        {/* Side: stats + template */}
        <aside className="lg:col-span-5 space-y-5">
          {/* Stats */}
          <div className="bg-ink-900 text-paper-100 p-6 rounded-sm grain-overlay">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="font-display text-3xl font-bold text-paper-50">{wordCount}</div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-paper-400 mt-1">已写</div>
              </div>
              <div>
                <div className={clsx('font-display text-3xl font-bold', reachedMin ? 'text-moss-100' : 'text-gold-400')}>
                  {Math.max(0, 120 - wordCount)}
                </div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-paper-400 mt-1">距下限</div>
              </div>
              <div>
                <div className={clsx('font-display text-3xl font-bold', overLimit ? 'text-wine-100' : 'text-paper-50')}>
                  {Math.max(0, topic.wordLimit - wordCount)}
                </div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-paper-400 mt-1">距上限</div>
              </div>
            </div>
          </div>

          {/* Template */}
          <div className="bg-paper-50 border border-ink-900/10 p-6 rounded-sm">
            <button
              onClick={() => setShowTemplate(!showTemplate)}
              className="flex items-center justify-between w-full mb-3"
            >
              <span className="font-display text-lg font-bold text-ink-900 flex items-center gap-2">
                <PenLine size={16} className="text-wine-500" /> 高分模板
              </span>
              {showTemplate ? <EyeOff size={16} className="text-ink-400" /> : <Eye size={16} className="text-ink-400" />}
            </button>
            {showTemplate && (
              <pre className="font-serif text-sm text-ink-700 whitespace-pre-wrap leading-relaxed">
                {topic.template}
              </pre>
            )}
            {!showTemplate && (
              <p className="font-serif text-sm text-ink-400">
                点击查看本文的高分写作模板与段落结构建议。
              </p>
            )}
          </div>
        </aside>
      </div>

      {/* Sample Essay Modal-like section */}
      {showSample && (
        <section className="mt-10 bg-paper-50 border-2 border-wine-500/30 p-8 rounded-sm">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-ink-900/10">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-wine-500">Sample Essay</span>
              <h2 className="font-display text-2xl font-bold text-ink-900 mt-1">参考范文</h2>
            </div>
            <button
              onClick={() => setShowSample(false)}
              className="font-mono text-[11px] uppercase tracking-wider text-ink-400 hover:text-wine-500"
            >
              收起
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-gold-600 mb-3">范文</p>
              <article className="font-serif text-[15px] leading-[1.9] text-ink-700 whitespace-pre-wrap">
                {topic.sampleEssay}
              </article>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-gold-600 mb-3">你的作文</p>
              <article className="font-serif text-[15px] leading-[1.9] text-ink-900 whitespace-pre-wrap bg-paper-100/50 p-4 rounded-sm border border-ink-900/8">
                {content || '（尚未写作）'}
              </article>
              <div className="mt-4 p-4 bg-wine-50 border border-wine-500/20 rounded-sm">
                <p className="font-serif text-sm text-ink-700">
                  对照范文，检查：1) 结构是否完整（开头-主体-结尾）；2) 是否用过渡词连接段落；3) 词汇与句式是否多样；4) 字数是否在 {topic.wordLimit} 词以内。
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
