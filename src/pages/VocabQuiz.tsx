import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Check, X, ArrowLeft, Volume2, RotateCw, Trophy } from 'lucide-react';
import { useProgressStore } from '@/store/useProgressStore';
import { vocabulary } from '@/data/vocabulary';
import { useTTS } from '@/hooks/useTTS';

type Mode = 'en2cn' | 'cn2en' | 'dictation';
type Status = 'answering' | 'correct' | 'wrong' | 'finished';

interface QuizItem {
  wordId: string;
  word: string;
  meaning: string;
  phonetic: string;
  options: string[];
  correct: string;
  mode: Mode;
}

// 打乱数组
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function VocabQuiz() {
  const { vocabulary: vocab, addWrongWord, markWordStudied } = useProgressStore();
  const { speak } = useTTS();

  const todayWords = useMemo(() => {
    const start = vocab.dayIndex * 50;
    return vocabulary.slice(start, start + 50);
  }, [vocab.dayIndex]);

  const [selectedMode, setSelectedMode] = useState<Mode | null>(null);
  const [quizItems, setQuizItems] = useState<QuizItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [status, setStatus] = useState<Status>('answering');
  const [selected, setSelected] = useState<string | null>(null);
  const [rightCount, setRightCount] = useState(0);
  const [wrongIds, setWrongIds] = useState<string[]>([]);

  const startQuiz = (mode: Mode) => {
    setSelectedMode(mode);
    // 取今日词库前 10 个作为考察（避免太长）
    const sample = shuffle(todayWords).slice(0, 10);
    const items: QuizItem[] = sample.map((w) => {
      // 干扰选项
      const distractors = shuffle(
        vocabulary.filter((v) => v.id !== w.id),
      ).slice(0, 3);
      let options: string[] = [];
      let correct = '';
      if (mode === 'en2cn') {
        // 题干英文，选项中文
        options = shuffle([w.meaning, ...distractors.map((d) => d.meaning)]);
        correct = w.meaning;
      } else if (mode === 'cn2en') {
        // 题干中文，选项英文
        options = shuffle([w.word, ...distractors.map((d) => d.word)]);
        correct = w.word;
      } else {
        // dictation 听写：题干音频，选项中文
        options = shuffle([w.meaning, ...distractors.map((d) => d.meaning)]);
        correct = w.meaning;
      }
      return {
        wordId: w.id,
        word: w.word,
        meaning: w.meaning,
        phonetic: w.phonetic,
        options,
        correct,
        mode,
      };
    });
    setQuizItems(items);
    setIdx(0);
    setStatus('answering');
    setSelected(null);
    setRightCount(0);
    setWrongIds([]);
  };

  const currentItem = quizItems[idx];

  // 听写模式自动播放
  useEffect(() => {
    if (selectedMode === 'dictation' && currentItem && status === 'answering') {
      const t = setTimeout(() => speak(currentItem.word), 400);
      return () => clearTimeout(t);
    }
  }, [currentItem, selectedMode, status, speak]);

  const handleSelect = (opt: string) => {
    if (status !== 'answering' || !currentItem) return;
    setSelected(opt);
    const isRight = opt === currentItem.correct;
    if (isRight) {
      setStatus('correct');
      setRightCount((c) => c + 1);
      markWordStudied(currentItem.wordId);
    } else {
      setStatus('wrong');
      addWrongWord(currentItem.wordId);
      setWrongIds((w) => [...w, currentItem.wordId]);
    }
  };

  const handleNext = () => {
    if (idx < quizItems.length - 1) {
      setIdx(idx + 1);
      setStatus('answering');
      setSelected(null);
    } else {
      setStatus('finished');
    }
  };

  // 模式选择
  if (!selectedMode) {
    const modes = [
      { key: 'en2cn' as Mode, title: '英译汉', desc: '看英文选中文释义' },
      { key: 'cn2en' as Mode, title: '汉译英', desc: '看中文选英文单词' },
      { key: 'dictation' as Mode, title: '听写', desc: '听发音选中文释义' },
    ];
    return (
      <div className="container mx-auto px-6 lg:px-8 py-10 max-w-3xl">
        <Link to="/vocabulary" className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-400 hover:text-wine-500 mb-6">
          <ArrowLeft size={14} /> 词库
        </Link>
        <div className="flex items-center gap-3 mb-3">
          <Brain size={18} className="text-wine-500" />
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-wine-500">§ Quiz</span>
        </div>
        <h1 className="font-display text-4xl font-black tracking-tight text-ink-900 mb-2">考察模式</h1>
        <p className="font-serif text-ink-400 mb-10">从今日词库随机抽取 10 词，错题自动入错题本。</p>
        <div className="grid gap-4">
          {modes.map((m) => (
            <button
              key={m.key}
              onClick={() => startQuiz(m.key)}
              className="group text-left p-7 bg-paper-50 border border-ink-900/10 hover:border-wine-500/40 hover:shadow-lift rounded-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-2xl font-bold text-ink-900 mb-1">{m.title}</h3>
                  <p className="font-serif text-sm text-ink-400">{m.desc}</p>
                </div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-wine-500 group-hover:translate-x-1 transition-transform">
                  开始 →
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 结果页
  if (status === 'finished') {
    const total = quizItems.length;
    const accuracy = Math.round((rightCount / total) * 100);
    return (
      <div className="container mx-auto px-6 lg:px-8 py-16 max-w-2xl text-center">
        <Trophy size={48} className="text-gold-500 mx-auto mb-6" strokeWidth={1.4} />
        <h1 className="font-display text-4xl font-black text-ink-900 mb-3">考察完成</h1>
        <p className="font-serif text-ink-400 mb-10">本次考察共 {total} 题</p>
        <div className="grid grid-cols-3 gap-px bg-ink-900/10 border border-ink-900/10 mb-10">
          <div className="bg-paper-50 py-6">
            <div className="font-display text-3xl font-bold text-moss-500">{rightCount}</div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-ink-400 mt-1">答对</div>
          </div>
          <div className="bg-paper-50 py-6">
            <div className="font-display text-3xl font-bold text-wine-600">{wrongIds.length}</div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-ink-400 mt-1">答错</div>
          </div>
          <div className="bg-paper-50 py-6">
            <div className="font-display text-3xl font-bold text-ink-900">{accuracy}%</div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-ink-400 mt-1">正确率</div>
          </div>
        </div>
        {wrongIds.length > 0 && (
          <p className="font-serif text-sm text-wine-600 mb-8">
            {wrongIds.length} 个错词已加入错题本，将在 1·2·4·7 日后反复复习。
          </p>
        )}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => { setSelectedMode(null); }}
            className="px-5 py-2.5 border border-ink-900/20 text-ink-900 font-serif text-sm hover:border-wine-500 rounded-sm flex items-center gap-2"
          >
            <RotateCw size={14} /> 再来一组
          </button>
          <Link to="/vocabulary/review" className="px-5 py-2.5 bg-wine-600 text-paper-50 font-serif text-sm hover:bg-wine-700 rounded-sm">
            去复习错词
          </Link>
        </div>
      </div>
    );
  }

  // 答题中
  if (!currentItem) return null;
  const isDictation = currentItem.mode === 'dictation';

  return (
    <div className="container mx-auto px-6 lg:px-8 py-8 max-w-3xl">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setSelectedMode(null)}
          className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-400 hover:text-wine-500"
        >
          <ArrowLeft size={14} /> 退出
        </button>
        <span className="font-mono text-xs text-ink-700">
          {idx + 1} / {quizItems.length} · 答对 {rightCount}
        </span>
      </div>

      {/* Progress */}
      <div className="h-px bg-ink-900/10 mb-10 relative">
        <div className="absolute top-0 left-0 h-px bg-wine-600 transition-all duration-300"
          style={{ width: `${((idx + 1) / quizItems.length) * 100}%` }} />
      </div>

      {/* Question */}
      <div className="bg-paper-50 border border-ink-900/10 p-10 rounded-sm mb-6 min-h-[200px] flex flex-col items-center justify-center text-center">
        {isDictation ? (
          <>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-400 mb-6">
              听发音选释义
            </span>
            <button
              onClick={() => speak(currentItem.word)}
              className="w-16 h-16 flex items-center justify-center bg-wine-600 text-paper-50 hover:bg-wine-700 rounded-full"
            >
              <Volume2 size={26} />
            </button>
            <p className="font-mono text-[10px] text-ink-400 mt-4">点击重听</p>
          </>
        ) : currentItem.mode === 'en2cn' ? (
          <>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-400 mb-4">
              选择正确释义
            </span>
            <h2 className="font-display text-5xl font-black tracking-tight text-ink-900 mb-2">
              {currentItem.word}
            </h2>
            <p className="font-mono text-sm text-ink-400">{currentItem.phonetic}</p>
            <button
              onClick={() => speak(currentItem.word)}
              className="mt-3 text-wine-500 hover:text-wine-600"
              aria-label="发音"
            >
              <Volume2 size={16} />
            </button>
          </>
        ) : (
          <>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-400 mb-4">
              选择对应英文
            </span>
            <h2 className="font-display text-4xl font-bold text-ink-900">
              {currentItem.meaning}
            </h2>
          </>
        )}
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {currentItem.options.map((opt) => {
          let cls = 'border-ink-900/15 bg-paper-50 hover:border-wine-500/50 hover:bg-wine-50/30';
          if (status !== 'answering') {
            if (opt === currentItem.correct) {
              cls = 'border-moss-500 bg-moss-100/60 text-moss-600';
            } else if (opt === selected) {
              cls = 'border-wine-600 bg-wine-50 text-wine-700';
            } else {
              cls = 'border-ink-900/8 bg-paper-50 opacity-50';
            }
          }
          return (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              disabled={status !== 'answering'}
              className={`flex items-center justify-between p-4 border rounded-sm font-serif text-base transition-all text-left ${cls}`}
            >
              <span>{opt}</span>
              {status !== 'answering' && opt === currentItem.correct && <Check size={16} className="text-moss-500" />}
              {status !== 'answering' && opt === selected && opt !== currentItem.correct && <X size={16} className="text-wine-600" />}
            </button>
          );
        })}
      </div>

      {/* Feedback + Next */}
      {status !== 'answering' && (
        <div className="mt-6 flex items-center justify-between">
          <div className={`flex items-center gap-2 font-serif text-sm ${status === 'correct' ? 'text-moss-500' : 'text-wine-600'}`}>
            {status === 'correct' ? (
              <><Check size={16} /> 答对了！</>
            ) : (
              <><X size={16} /> 正确答案：{currentItem.correct}</>
            )}
          </div>
          <button
            onClick={handleNext}
            className="px-5 py-2.5 bg-ink-900 text-paper-50 font-serif text-sm hover:bg-ink-950 rounded-sm"
          >
            {idx < quizItems.length - 1 ? '下一题' : '查看结果'}
          </button>
        </div>
      )}
    </div>
  );
}
