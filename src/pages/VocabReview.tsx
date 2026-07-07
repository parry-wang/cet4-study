import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Check, X, ArrowLeft, Volume2, Trophy, Inbox } from 'lucide-react';
import { useProgressStore } from '@/store/useProgressStore';
import { vocabulary } from '@/data/vocabulary';
import { useTTS } from '@/hooks/useTTS';
import type { WrongWord } from '@/data/types';

type Status = 'answering' | 'correct' | 'wrong' | 'finished';

export default function VocabReview() {
  const { vocabulary: vocab, reviewWrongWord, getDueWrongWords } = useProgressStore();
  const { speak } = useTTS();

  const dueWords = useMemo(() => getDueWrongWords(), [getDueWrongWords, vocab.wrong]);

  // 全部错词（含未到期）用于展示
  const allWrong = vocab.wrong;

  const [reviewing, setReviewing] = useState(false);
  const [queue, setQueue] = useState<WrongWord[]>([]);
  const [idx, setIdx] = useState(0);
  const [status, setStatus] = useState<Status>('answering');
  const [revealed, setRevealed] = useState(false);
  const [rightCount, setRightCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  const startReview = () => {
    const q = [...dueWords].sort(() => Math.random() - 0.5);
    setQueue(q);
    setIdx(0);
    setStatus('answering');
    setRevealed(false);
    setRightCount(0);
    setWrongCount(0);
    setReviewing(true);
  };

  const current = queue[idx];
  const currentWord = current ? vocabulary.find((w) => w.id === current.wordId) : null;

  const judge = (correct: boolean) => {
    if (!current) return;
    reviewWrongWord(current.wordId, correct);
    if (correct) {
      setStatus('correct');
      setRightCount((c) => c + 1);
    } else {
      setStatus('wrong');
      setWrongCount((c) => c + 1);
    }
  };

  const next = () => {
    if (idx < queue.length - 1) {
      setIdx(idx + 1);
      setStatus('answering');
      setRevealed(false);
    } else {
      setStatus('finished');
    }
  };

  // 空状态
  if (!reviewing && dueWords.length === 0) {
    return (
      <div className="container mx-auto px-6 lg:px-8 py-10 max-w-3xl">
        <Link to="/vocabulary" className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-400 hover:text-wine-500 mb-6">
          <ArrowLeft size={14} /> 词库
        </Link>
        <div className="flex items-center gap-3 mb-3">
          <RefreshCw size={18} className="text-wine-500" />
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-wine-500">§ Review</span>
        </div>
        <h1 className="font-display text-4xl font-black tracking-tight text-ink-900 mb-2">错词复习</h1>
        <div className="mt-10 bg-paper-50 border border-ink-900/10 p-12 rounded-sm text-center">
          <Inbox size={40} className="text-moss-500 mx-auto mb-4" strokeWidth={1.3} />
          <p className="font-display text-2xl font-bold text-ink-900 mb-2">今日无到期错词</p>
          <p className="font-serif text-sm text-ink-400">
            错词按 1·2·4·7 日间隔重复。继续学习新词，错词会在到期日再次出现。
          </p>
        </div>

        {allWrong.length > 0 && (
          <div className="mt-10">
            <h2 className="font-display text-lg font-bold text-ink-900 mb-4">全部错词（{allWrong.length}）</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {allWrong.map((w) => {
                const word = vocabulary.find((v) => v.id === w.wordId);
                if (!word) return null;
                return (
                  <div key={w.wordId} className="flex items-center justify-between p-3 bg-paper-50 border border-ink-900/8 rounded-sm">
                    <div>
                      <span className="font-display font-semibold text-ink-900">{word.word}</span>
                      <span className="font-serif text-xs text-ink-400 ml-2">{word.meaning}</span>
                    </div>
                    <span className="font-mono text-[10px] text-ink-400">下次 {w.nextReview}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 开始复习前确认页
  if (!reviewing) {
    return (
      <div className="container mx-auto px-6 lg:px-8 py-10 max-w-3xl">
        <Link to="/vocabulary" className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-400 hover:text-wine-500 mb-6">
          <ArrowLeft size={14} /> 词库
        </Link>
        <div className="flex items-center gap-3 mb-3">
          <RefreshCw size={18} className="text-wine-500" />
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-wine-500">§ Review</span>
        </div>
        <h1 className="font-display text-4xl font-black tracking-tight text-ink-900 mb-2">错词复习</h1>
        <p className="font-serif text-ink-400 mb-8">
          今日到期 {dueWords.length} 词需要复习，全部错词 {allWrong.length} 词。
        </p>
        <button
          onClick={startReview}
          className="px-6 py-3 bg-wine-600 text-paper-50 font-serif text-sm hover:bg-wine-700 rounded-sm flex items-center gap-2"
        >
          <RefreshCw size={15} /> 开始复习 {dueWords.length} 词
        </button>
      </div>
    );
  }

  // 结果页
  if (status === 'finished') {
    return (
      <div className="container mx-auto px-6 lg:px-8 py-16 max-w-2xl text-center">
        <Trophy size={48} className="text-gold-500 mx-auto mb-6" strokeWidth={1.4} />
        <h1 className="font-display text-4xl font-black text-ink-900 mb-3">复习完成</h1>
        <p className="font-serif text-ink-400 mb-10">本次复习共 {queue.length} 词</p>
        <div className="grid grid-cols-2 gap-px bg-ink-900/10 border border-ink-900/10 mb-10">
          <div className="bg-paper-50 py-6">
            <div className="font-display text-3xl font-bold text-moss-500">{rightCount}</div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-ink-400 mt-1">答对晋级</div>
          </div>
          <div className="bg-paper-50 py-6">
            <div className="font-display text-3xl font-bold text-wine-600">{wrongCount}</div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-ink-400 mt-1">仍需复习</div>
          </div>
        </div>
        <button
          onClick={() => setReviewing(false)}
          className="px-5 py-2.5 bg-ink-900 text-paper-50 font-serif text-sm hover:bg-ink-950 rounded-sm"
        >
          返回
        </button>
      </div>
    );
  }

  // 复习中
  if (!current || !currentWord) return null;

  return (
    <div className="container mx-auto px-6 lg:px-8 py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setReviewing(false)}
          className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-400 hover:text-wine-500"
        >
          <ArrowLeft size={14} /> 退出
        </button>
        <span className="font-mono text-xs text-ink-700">
          {idx + 1} / {queue.length} · 错次 {current.wrongCount}
        </span>
      </div>

      <div className="h-px bg-ink-900/10 mb-10 relative">
        <div className="absolute top-0 left-0 h-px bg-wine-600 transition-all duration-300"
          style={{ width: `${((idx + 1) / queue.length) * 100}%` }} />
      </div>

      <div className="bg-ink-900 text-paper-100 border border-ink-900 p-12 rounded-sm mb-6 min-h-[260px] flex flex-col items-center justify-center text-center grain-overlay">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-gold-400 mb-6">
          你是否还记得这个词？
        </span>
        {!revealed ? (
          <>
            <h2 className="font-display text-6xl font-black tracking-tightest text-paper-50 mb-4">
              {currentWord.word}
            </h2>
            <p className="font-mono text-sm text-paper-400 mb-6">{currentWord.phonetic}</p>
            <button
              onClick={() => speak(currentWord.word)}
              className="flex items-center gap-2 px-4 py-2 border border-paper-400/30 text-paper-100 text-xs font-mono uppercase tracking-wider hover:bg-paper-400/10 rounded-sm"
            >
              <Volume2 size={14} /> 发音
            </button>
            <button
              onClick={() => setRevealed(true)}
              className="mt-8 font-mono text-[10px] uppercase tracking-wider text-gold-400 hover:text-gold-500 underline underline-offset-4"
            >
              点击查看释义
            </button>
          </>
        ) : (
          <>
            <p className="font-display text-3xl font-semibold text-paper-50 mb-4">
              {currentWord.meaning}
            </p>
            <p className="font-serif italic text-paper-400 max-w-lg">
              "{currentWord.example}"
            </p>
            <p className="font-serif text-sm text-paper-400/70 mt-2">{currentWord.exampleCn}</p>
          </>
        )}
      </div>

      {revealed && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => judge(false)}
            className="flex items-center justify-center gap-2 py-4 border border-wine-500/40 text-wine-600 font-serif text-base hover:bg-wine-50 rounded-sm transition-colors"
          >
            <X size={18} /> 没记住
          </button>
          <button
            onClick={() => judge(true)}
            className="flex items-center justify-center gap-2 py-4 border border-moss-500/40 text-moss-500 font-serif text-base hover:bg-moss-100/60 rounded-sm transition-colors"
          >
            <Check size={18} /> 记住了
          </button>
        </div>
      )}

      {status !== 'answering' && (
        <div className="mt-6 flex items-center justify-between">
          <div className={`flex items-center gap-2 font-serif text-sm ${status === 'correct' ? 'text-moss-500' : 'text-wine-600'}`}>
            {status === 'correct' ? (
              <><Check size={16} /> 答对了，复习间隔晋级</>
            ) : (
              <><X size={16} /> 仍需努力，间隔重置</>
            )}
          </div>
          <button
            onClick={next}
            className="px-5 py-2.5 bg-ink-900 text-paper-50 font-serif text-sm hover:bg-ink-950 rounded-sm"
          >
            下一词
          </button>
        </div>
      )}
    </div>
  );
}
