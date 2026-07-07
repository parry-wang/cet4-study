import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Volume2, RotateCcw, Check, Brain, ArrowLeft } from 'lucide-react';
import { useProgressStore } from '@/store/useProgressStore';
import { vocabulary } from '@/data/vocabulary';
import { useTTS } from '@/hooks/useTTS';

export default function VocabStudy() {
  const { vocabulary: vocab, markWordStudied, markWordMastered } = useProgressStore();
  const { speak } = useTTS();

  const todayWords = (() => {
    const start = vocab.dayIndex * 50;
    return vocabulary.slice(start, start + 50);
  })();

  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [knownIds, setKnownIds] = useState<Set<string>>(new Set());

  const word = todayWords[idx];

  useEffect(() => {
    setFlipped(false);
  }, [idx]);

  // 标记当前词已学
  useEffect(() => {
    if (word) markWordStudied(word.id);
  }, [word, markWordStudied]);

  if (!word) {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <p className="font-serif text-ink-400">今日词库已全部学完。</p>
        <Link to="/vocabulary" className="font-mono text-wine-500 underline mt-4 inline-block">返回</Link>
      </div>
    );
  }

  const next = () => {
    if (idx < todayWords.length - 1) {
      setIdx(idx + 1);
    }
  };
  const prev = () => {
    if (idx > 0) setIdx(idx - 1);
  };

  const handleKnown = () => {
    markWordMastered(word.id);
    setKnownIds(new Set([...knownIds, word.id]));
    next();
  };

  const handleFlip = () => setFlipped(!flipped);

  const progress = ((idx + 1) / todayWords.length) * 100;

  return (
    <div className="container mx-auto px-6 lg:px-8 py-8 max-w-5xl">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <Link to="/vocabulary" className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-400 hover:text-wine-500">
          <ArrowLeft size={14} /> 词库
        </Link>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-ink-700">
            {String(idx + 1).padStart(2, '0')} / {String(todayWords.length).padStart(2, '0')}
          </span>
          <Link
            to="/vocabulary/quiz"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-wine-600 text-paper-50 text-xs font-mono uppercase tracking-wider hover:bg-wine-700 rounded-sm"
          >
            <Brain size={13} /> 去考察
          </Link>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-px bg-ink-900/10 mb-10 relative">
        <div className="absolute top-0 left-0 h-px bg-wine-600 transition-all duration-500"
          style={{ width: `${progress}%` }} />
      </div>

      {/* Flip Card */}
      <div className="flex flex-col items-center">
        <div
          className="flip-card w-full max-w-2xl cursor-pointer"
          onClick={handleFlip}
        >
          <div className={`flip-inner relative h-[420px] ${flipped ? 'is-flipped' : ''}`}>
            {/* Front */}
            <div className="flip-face absolute inset-0 bg-paper-50 border border-ink-900/12 rounded-sm p-10 flex flex-col items-center justify-center grain-overlay">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-400 mb-6">
                Day {vocab.dayIndex + 1} · No.{String(idx + 1).padStart(2, '0')}
              </span>
              <h2 className="font-display text-6xl lg:text-7xl font-black tracking-tightest text-ink-900 mb-3 text-center">
                {word.word}
              </h2>
              <p className="font-mono text-base text-ink-400 mb-8">{word.phonetic}</p>
              <button
                onClick={(e) => { e.stopPropagation(); speak(word.word); }}
                className="flex items-center gap-2 px-4 py-2 border border-wine-500/40 text-wine-600 text-xs font-mono uppercase tracking-wider hover:bg-wine-50 rounded-sm"
              >
                <Volume2 size={14} /> 发音
              </button>
              <span className="absolute bottom-6 font-mono text-[10px] text-ink-400/70 uppercase tracking-wider">
                点击卡片查看释义
              </span>
            </div>
            {/* Back */}
            <div className="flip-face flip-back absolute inset-0 bg-ink-900 text-paper-100 border border-ink-900 rounded-sm p-10 flex flex-col justify-center grain-overlay">
              <div className="mb-5">
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-gold-400">
                  {word.pos} · {word.word}
                </span>
              </div>
              <p className="font-display text-3xl font-semibold mb-6 text-paper-50">
                {word.meaning}
              </p>
              <div className="border-t border-paper-400/20 pt-5">
                <p className="font-serif italic text-paper-100 leading-relaxed mb-2">
                  "{word.example}"
                </p>
                <p className="font-serif text-sm text-paper-400">{word.exampleCn}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); speak(word.example); }}
                className="absolute bottom-6 right-6 flex items-center gap-1.5 text-paper-400 hover:text-gold-400 text-xs font-mono"
              >
                <Volume2 size={12} /> 例句
              </button>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mt-8">
          <button
            onClick={prev}
            disabled={idx === 0}
            className="p-3 border border-ink-900/15 text-ink-700 hover:border-wine-500 hover:text-wine-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-sm transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={handleFlip}
            className="px-5 py-3 border border-ink-900/15 text-ink-900 font-serif text-sm hover:bg-paper-50 rounded-sm flex items-center gap-2"
          >
            <RotateCcw size={14} /> 翻转
          </button>
          <button
            onClick={handleKnown}
            className="px-6 py-3 bg-moss-500 text-paper-50 font-serif text-sm hover:bg-moss-600 rounded-sm flex items-center gap-2"
          >
            <Check size={14} /> 已掌握
          </button>
          <button
            onClick={next}
            disabled={idx === todayWords.length - 1}
            className="p-3 border border-ink-900/15 text-ink-700 hover:border-wine-500 hover:text-wine-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-sm transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <p className="font-mono text-[10px] text-ink-400 mt-6 uppercase tracking-wider">
          已掌握本批 {knownIds.size} 词
        </p>
      </div>
    </div>
  );
}
