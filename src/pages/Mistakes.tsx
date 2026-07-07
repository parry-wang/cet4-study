import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BookX, BookOpen, Headphones, RefreshCw, Check, X,
  ArrowRight, Trash2, AlertCircle,
} from 'lucide-react';
import { useProgressStore } from '@/store/useProgressStore';
import { vocabulary } from '@/data/vocabulary';
import { readingPassages } from '@/data/reading';
import { listeningMaterials } from '@/data/listening';
import type { Word } from '@/data/types';
import { clsx } from 'clsx';

type Tab = 'words' | 'reading' | 'listening';

export default function Mistakes() {
  const {
    vocabulary: vocabProgress,
    readingWrong,
    listeningWrong,
    reviewWrongWord,
    removeReadingWrong,
    removeListeningWrong,
    getDueWrongWords,
  } = useProgressStore();

  const [tab, setTab] = useState<Tab>('words');

  // 词错题列表（按错次降序）
  const wrongWords = useMemo(() => {
    return vocabProgress.wrong
      .map((w) => {
        const word = vocabulary.find((v) => v.id === w.wordId);
        return word ? { ...w, word } : null;
      })
      .filter((x): x is { wordId: string; wrongCount: number; lastReview: string; nextReview: string; mastery: 'new' | 'learning' | 'mastered'; word: Word } => x !== null)
      .sort((a, b) => b.wrongCount - a.wrongCount);
  }, [vocabProgress.wrong]);

  // 阅读错题（聚合到题目粒度）
  const readingWrongItems = useMemo(() => {
    const items: { passageId: string; passageTitle: string; questionId: string; stem: string; answer: string }[] = [];
    readingPassages.forEach((p) => {
      p.questions.forEach((q) => {
        if (readingWrong.includes(q.id)) {
          items.push({
            passageId: p.id,
            passageTitle: p.title,
            questionId: q.id,
            stem: q.stem,
            answer: q.answer,
          });
        }
      });
    });
    return items;
  }, [readingWrong]);

  // 听力错题
  const listeningWrongItems = useMemo(() => {
    const items: { materialId: string; materialTitle: string; questionId: string; stem: string; answer: string }[] = [];
    listeningMaterials.forEach((m) => {
      m.questions.forEach((q) => {
        if (listeningWrong.includes(q.id)) {
          items.push({
            materialId: m.id,
            materialTitle: m.title,
            questionId: q.id,
            stem: q.stem,
            answer: q.answer,
          });
        }
      });
    });
    return items;
  }, [listeningWrong]);

  // 复习模式：单题展示 + 判对错
  const [reviewIdx, setReviewIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [reviewStats, setReviewStats] = useState<{ correct: number; wrong: number }>({ correct: 0, wrong: 0 });

  const dueWords = getDueWrongWords();
  const reviewList = wrongWords; // 复习全部错词
  const current = reviewList[reviewIdx];

  const handleJudge = (correct: boolean) => {
    if (!current) return;
    reviewWrongWord(current.wordId, correct);
    setReviewStats((s) => ({
      correct: s.correct + (correct ? 1 : 0),
      wrong: s.wrong + (correct ? 0 : 1),
    }));
    setRevealed(false);
    setReviewIdx((i) => i + 1);
  };

  const resetReview = () => {
    setReviewIdx(0);
    setRevealed(false);
    setReviewStats({ correct: 0, wrong: 0 });
  };

  const tabs: { key: Tab; label: string; count: number; icon: typeof BookX }[] = [
    { key: 'words', label: '错词本', count: wrongWords.length, icon: BookX },
    { key: 'reading', label: '阅读错题', count: readingWrongItems.length, icon: BookOpen },
    { key: 'listening', label: '听力错题', count: listeningWrongItems.length, icon: Headphones },
  ];

  const totalCount = wrongWords.length + readingWrongItems.length + listeningWrongItems.length;
  const dueCount = dueWords.length;

  return (
    <div className="container mx-auto px-6 lg:px-8 py-10 max-w-6xl">
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <BookX size={16} className="text-wine-500" />
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-wine-500">
            § Mistakes · 错题本
          </span>
        </div>
        <h1 className="font-display text-4xl lg:text-5xl font-black tracking-tight text-ink-900 mb-2">
          错题汇总与复习
        </h1>
        <p className="font-serif text-ink-400">
          所有错题自动归集到此 · 单词错题按 1·2·4·7 日间隔重复出现，可反复考察直至掌握
        </p>
      </header>

      {/* 概览统计 */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-ink-900 text-paper-100 p-5 rounded-sm">
          <p className="font-mono text-[10px] uppercase tracking-wider text-gold-400 mb-1">错题总数</p>
          <p className="font-display text-3xl font-black">{totalCount}</p>
        </div>
        <div className="bg-paper-50 border border-ink-900/10 p-5 rounded-sm">
          <p className="font-mono text-[10px] uppercase tracking-wider text-wine-500 mb-1">错词</p>
          <p className="font-display text-3xl font-black text-ink-900">{wrongWords.length}</p>
        </div>
        <div className="bg-paper-50 border border-ink-900/10 p-5 rounded-sm">
          <p className="font-mono text-[10px] uppercase tracking-wider text-wine-500 mb-1">阅读错题</p>
          <p className="font-display text-3xl font-black text-ink-900">{readingWrongItems.length}</p>
        </div>
        <div className="bg-paper-50 border border-ink-900/10 p-5 rounded-sm">
          <p className="font-mono text-[10px] uppercase tracking-wider text-wine-500 mb-1">听力错题</p>
          <p className="font-display text-3xl font-black text-ink-900">{listeningWrongItems.length}</p>
        </div>
      </section>

      {/* Tab 切换 */}
      <div className="flex items-center gap-1 mb-8 border-b border-ink-900/10 overflow-x-auto">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={clsx(
                'flex items-center gap-2 px-5 py-3 font-serif text-sm border-b-2 transition-colors -mb-px whitespace-nowrap',
                active
                  ? 'border-wine-600 text-wine-600 font-bold'
                  : 'border-transparent text-ink-400 hover:text-ink-700',
              )}
            >
              <Icon size={15} />
              {t.label}
              <span className={clsx(
                'font-mono text-[10px] px-1.5 py-0.5 rounded-sm',
                active ? 'bg-wine-100 text-wine-600' : 'bg-ink-900/5 text-ink-400',
              )}>
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 错词本：复习模式 + 列表 */}
      {tab === 'words' && (
        <div className="space-y-8">
          {/* 今日到期复习提示 */}
          {dueCount > 0 && (
            <div className="bg-wine-50 border border-wine-500/30 p-4 rounded-sm flex items-center gap-3">
              <AlertCircle size={16} className="text-wine-600 shrink-0" />
              <p className="font-serif text-sm text-wine-700 flex-1">
                今日有 <strong className="font-bold">{dueCount}</strong> 个错词到期需要复习
              </p>
              <Link
                to="/vocabulary/review"
                className="font-mono text-[11px] uppercase tracking-wider text-wine-600 hover:text-wine-700 flex items-center gap-1"
              >
                去复习 <ArrowRight size={12} />
              </Link>
            </div>
          )}

          {/* 复习卡片 */}
          {reviewList.length > 0 ? (
            <section className="bg-paper-50 border border-ink-900/10 p-7 rounded-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-wine-500">
                    Spaced Repetition
                  </span>
                  <h3 className="font-display text-xl font-bold text-ink-900 mt-1">错词再测</h3>
                </div>
                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className="text-moss-600">对 {reviewStats.correct}</span>
                  <span className="text-wine-600">错 {reviewStats.wrong}</span>
                  <span className="text-ink-400">{Math.min(reviewIdx + 1, reviewList.length)}/{reviewList.length}</span>
                </div>
              </div>

              {current ? (
                <div>
                  <div className="bg-ink-900 text-paper-100 p-8 rounded-sm text-center min-h-[180px] flex flex-col items-center justify-center">
                    <p className="font-display text-4xl font-black tracking-tight mb-2">
                      {current.word.word}
                    </p>
                    <p className="font-mono text-sm text-gold-400">{current.word.phonetic}</p>
                    {revealed && (
                      <div className="mt-4 pt-4 border-t border-paper-400/30">
                        <p className="font-serif text-base text-paper-100">
                          <span className="text-gold-400 mr-2">{current.word.pos}</span>
                          {current.word.meaning}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between font-mono text-[10px] text-ink-400">
                    <span>错次 {current.wrongCount} · 上次 {current.lastReview} · 下次 {current.nextReview}</span>
                    <span className={clsx(
                      'px-2 py-0.5 rounded-sm uppercase tracking-wider',
                      current.mastery === 'new' && 'bg-wine-100 text-wine-600',
                      current.mastery === 'learning' && 'bg-gold-100 text-gold-600',
                      current.mastery === 'mastered' && 'bg-moss-100 text-moss-500',
                    )}>
                      {current.mastery === 'new' ? '新错' : current.mastery === 'learning' ? '复习中' : '已掌握'}
                    </span>
                  </div>

                  {!revealed ? (
                    <button
                      onClick={() => setRevealed(true)}
                      className="mt-4 w-full py-3 border border-ink-900/20 text-ink-900 font-serif text-sm hover:border-wine-500 hover:text-wine-600 rounded-sm transition-colors"
                    >
                      显示释义
                    </button>
                  ) : (
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleJudge(false)}
                        className="py-3 bg-wine-600 hover:bg-wine-700 text-paper-50 font-serif text-sm rounded-sm flex items-center justify-center gap-2"
                      >
                        <X size={14} /> 还是不会
                      </button>
                      <button
                        onClick={() => handleJudge(true)}
                        className="py-3 bg-moss-500 hover:bg-moss-600 text-paper-50 font-serif text-sm rounded-sm flex items-center justify-center gap-2"
                      >
                        <Check size={14} /> 我会了
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Check size={32} className="text-moss-500 mx-auto mb-3" />
                  <p className="font-display text-xl font-bold text-ink-900 mb-1">本轮复习完成</p>
                  <p className="font-serif text-sm text-ink-400 mb-5">
                    本轮对了 {reviewStats.correct} 个，错了 {reviewStats.wrong} 个
                  </p>
                  <button
                    onClick={resetReview}
                    className="inline-flex items-center gap-2 px-5 py-2 border border-ink-900/20 text-ink-900 font-serif text-sm hover:border-wine-500 rounded-sm"
                  >
                    <RefreshCw size={13} /> 再来一轮
                  </button>
                </div>
              )}
            </section>
          ) : (
            <div className="bg-paper-50 border border-ink-900/10 p-12 rounded-sm text-center">
              <Check size={32} className="text-moss-500 mx-auto mb-3" />
              <p className="font-display text-xl font-bold text-ink-900 mb-1">错题本为空</p>
              <p className="font-serif text-sm text-ink-400 mb-5">
                去单词测验中挑战自我，错词会自动收集到这里
              </p>
              <Link
                to="/vocabulary/quiz"
                className="inline-flex items-center gap-2 px-5 py-2 bg-wine-600 text-paper-50 font-serif text-sm hover:bg-wine-700 rounded-sm"
              >
                开始测验 <ArrowRight size={13} />
              </Link>
            </div>
          )}

          {/* 错词列表 */}
          {wrongWords.length > 0 && (
            <section>
              <h3 className="font-display text-lg font-bold text-ink-900 mb-4 flex items-center gap-2">
                <BookX size={16} className="text-wine-500" /> 全部错词
              </h3>
              <div className="bg-paper-50 border border-ink-900/10 rounded-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-ink-900/3 border-b border-ink-900/10">
                    <tr className="font-mono text-[10px] uppercase tracking-wider text-ink-400">
                      <th className="text-left p-3 pl-5">单词</th>
                      <th className="text-left p-3 hidden md:table-cell">释义</th>
                      <th className="text-center p-3">错次</th>
                      <th className="text-center p-3 hidden sm:table-cell">下次复习</th>
                      <th className="text-center p-3 pr-5">状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wrongWords.map((w) => (
                      <tr key={w.wordId} className="border-b border-ink-900/5 last:border-0 hover:bg-wine-50/30">
                        <td className="p-3 pl-5">
                          <p className="font-display font-bold text-ink-900">{w.word.word}</p>
                          <p className="font-mono text-[10px] text-ink-400">{w.word.phonetic}</p>
                        </td>
                        <td className="p-3 hidden md:table-cell font-serif text-sm text-ink-700">
                          {w.word.pos} {w.word.meaning}
                        </td>
                        <td className="p-3 text-center">
                          <span className="font-mono text-sm text-wine-600 font-bold">{w.wrongCount}</span>
                        </td>
                        <td className="p-3 text-center font-mono text-xs text-ink-400 hidden sm:table-cell">
                          {w.nextReview}
                        </td>
                        <td className="p-3 pr-5 text-center">
                          <span className={clsx(
                            'inline-block px-2 py-0.5 rounded-sm font-mono text-[10px] uppercase tracking-wider',
                            w.mastery === 'new' && 'bg-wine-100 text-wine-600',
                            w.mastery === 'learning' && 'bg-gold-100 text-gold-600',
                            w.mastery === 'mastered' && 'bg-moss-100 text-moss-500',
                          )}>
                            {w.mastery === 'new' ? '新' : w.mastery === 'learning' ? '复习中' : '掌握'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      )}

      {/* 阅读错题 */}
      {tab === 'reading' && (
        <div>
          {readingWrongItems.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="暂无阅读错题"
              desc="去阅读理解中练习，做错的题目会自动收集到这里"
              link="/reading"
              linkText="去阅读"
            />
          ) : (
            <div className="space-y-4">
              {readingWrongItems.map((item, i) => (
                <div key={item.questionId} className="bg-paper-50 border border-ink-900/10 p-5 rounded-sm">
                  <div className="flex items-start gap-3">
                    <span className="font-display text-lg font-black text-wine-600 shrink-0">{i + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/reading/${item.passageId}`}
                        className="font-mono text-[10px] uppercase tracking-wider text-wine-500 hover:text-wine-700"
                      >
                        {item.passageTitle}
                      </Link>
                      <p className="font-serif text-sm text-ink-900 mt-1 mb-2">{item.stem}</p>
                      <p className="font-serif text-xs text-moss-600">
                        正确答案：<span className="font-mono font-bold">{item.answer}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => removeReadingWrong(item.questionId)}
                      className="shrink-0 w-7 h-7 border border-ink-900/15 hover:border-wine-500 hover:text-wine-600 rounded-sm flex items-center justify-center"
                      title="已掌握，移出错题本"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 听力错题 */}
      {tab === 'listening' && (
        <div>
          {listeningWrongItems.length === 0 ? (
            <EmptyState
              icon={Headphones}
              title="暂无听力错题"
              desc="去听力播报中练习，做错的题目会自动收集到这里"
              link="/listening"
              linkText="去听力"
            />
          ) : (
            <div className="space-y-4">
              {listeningWrongItems.map((item, i) => (
                <div key={item.questionId} className="bg-paper-50 border border-ink-900/10 p-5 rounded-sm">
                  <div className="flex items-start gap-3">
                    <span className="font-display text-lg font-black text-wine-600 shrink-0">{i + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/listening/${item.materialId}`}
                        className="font-mono text-[10px] uppercase tracking-wider text-wine-500 hover:text-wine-700"
                      >
                        {item.materialTitle}
                      </Link>
                      <p className="font-serif text-sm text-ink-900 mt-1 mb-2">{item.stem}</p>
                      <p className="font-serif text-xs text-moss-600">
                        正确答案：<span className="font-mono font-bold">{item.answer}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => removeListeningWrong(item.questionId)}
                      className="shrink-0 w-7 h-7 border border-ink-900/15 hover:border-wine-500 hover:text-wine-600 rounded-sm flex items-center justify-center"
                      title="已掌握，移出错题本"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({
  icon: Icon, title, desc, link, linkText,
}: {
  icon: typeof BookOpen;
  title: string;
  desc: string;
  link: string;
  linkText: string;
}) {
  return (
    <div className="bg-paper-50 border border-ink-900/10 p-12 rounded-sm text-center">
      <Icon size={32} className="text-ink-400 mx-auto mb-3" />
      <p className="font-display text-xl font-bold text-ink-900 mb-1">{title}</p>
      <p className="font-serif text-sm text-ink-400 mb-5">{desc}</p>
      <Link
        to={link}
        className="inline-flex items-center gap-2 px-5 py-2 bg-wine-600 text-paper-50 font-serif text-sm hover:bg-wine-700 rounded-sm"
      >
        {linkText} <ArrowRight size={13} />
      </Link>
    </div>
  );
}
