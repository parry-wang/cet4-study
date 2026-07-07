import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Check, X, RotateCcw, Timer, Send, BookOpen,
} from 'lucide-react';
import { readingPassages } from '@/data/reading';
import { useProgressStore } from '@/store/useProgressStore';
import { clsx } from 'clsx';

export default function ReadingDetail() {
  const { id } = useParams<{ id: string }>();
  const passage = readingPassages.find((p) => p.id === id);
  const { addReadingWrong, removeReadingWrong, readingWrong } = useProgressStore();

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!passage) {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <p className="font-serif text-ink-400">未找到该阅读篇章。</p>
        <Link to="/reading" className="font-mono text-wine-500 underline mt-4 inline-block">返回列表</Link>
      </div>
    );
  }

  const fmtTime = (s: number) => `${Math.floor(s / 60)}'${String(s % 60).padStart(2, '0')}"`;

  const handleSelect = (qId: string, key: string) => {
    if (submitted) return;
    setAnswers({ ...answers, [qId]: key });
  };

  const handleSubmit = () => {
    setSubmitted(true);
    if (timerRef.current) clearInterval(timerRef.current);
    passage.questions.forEach((q) => {
      if (answers[q.id] !== q.answer) {
        addReadingWrong(q.id);
      } else {
        removeReadingWrong(q.id);
      }
    });
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    setSeconds(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  };

  const correctCount = passage.questions.filter((q) => answers[q.id] === q.answer).length;
  const accuracy = Math.round((correctCount / passage.questions.length) * 100);

  return (
    <div className="container mx-auto px-6 lg:px-8 py-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <Link to="/reading" className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-400 hover:text-wine-500">
          <ArrowLeft size={14} /> 篇章库
        </Link>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-mono text-xs text-ink-700">
            <Timer size={13} className="text-wine-500" /> {fmtTime(seconds)}
          </span>
        </div>
      </div>

      {/* Title */}
      <header className="mb-8 pb-6 border-b border-ink-900/10">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-wine-500">
          {passage.category} · {passage.questions.length} 题
        </span>
        <h1 className="font-display text-3xl lg:text-4xl font-black tracking-tight text-ink-900 mt-2 mb-2">
          {passage.title}
        </h1>
        {submitted && (
          <p className="font-mono text-sm text-wine-600">
            正确率 {accuracy}% · 答对 {correctCount}/{passage.questions.length} · 用时 {fmtTime(seconds)}
          </p>
        )}
      </header>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Passage */}
        <article className="lg:col-span-7 space-y-6">
          <div className="bg-paper-50 border border-ink-900/10 p-8 rounded-sm">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400 mb-4 block">
              Passage
            </span>
            <div className="font-serif text-[15px] leading-[1.85] text-ink-700 first-letter:font-display first-letter:text-5xl first-letter:font-black first-letter:text-wine-600 first-letter:mr-2 first-letter:float-left first-letter:leading-none first-letter:mt-1">
              {passage.passage}
            </div>
          </div>

          {submitted && (
            <div className="bg-wine-50/30 border border-wine-500/20 p-8 rounded-sm">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen size={14} className="text-wine-600" />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-wine-600">
                  中文翻译
                </span>
              </div>
              <div className="font-serif text-[15px] leading-[1.85] text-ink-700">
                {passage.passageCn}
              </div>
            </div>
          )}
        </article>

        {/* Questions */}
        <section className="lg:col-span-5">
          <div className="lg:sticky lg:top-20">
            <h2 className="font-display text-xl font-bold text-ink-900 mb-4">题目</h2>
            <div className="space-y-5">
              {passage.questions.map((q, qi) => (
                <div key={q.id} className="bg-paper-50 border border-ink-900/10 p-5 rounded-sm">
                  <p className="font-serif text-sm text-ink-900 mb-3">
                    <span className="font-mono text-xs text-wine-500 mr-1.5">{qi + 1}.</span>
                    {q.stem}
                  </p>
                  <div className="space-y-1.5">
                    {q.options.map((opt) => {
                      const isSelected = answers[q.id] === opt.key;
                      const isCorrect = opt.key === q.answer;
                      let cls = 'border-ink-900/12 hover:border-wine-500/40 hover:bg-wine-50/20';
                      if (submitted) {
                        if (isCorrect) cls = 'border-moss-500 bg-moss-100/50 text-moss-600';
                        else if (isSelected) cls = 'border-wine-600 bg-wine-50 text-wine-700';
                        else cls = 'border-ink-900/8 opacity-60';
                      } else if (isSelected) {
                        cls = 'border-wine-600 bg-wine-50';
                      }
                      return (
                        <button
                          key={opt.key}
                          onClick={() => handleSelect(q.id, opt.key)}
                          disabled={submitted}
                          className={clsx(
                            'w-full flex items-center gap-2 p-2.5 border rounded-sm font-serif text-sm text-left transition-all',
                            cls,
                          )}
                        >
                          <span className="font-mono text-xs text-wine-500 shrink-0">{opt.key}.</span>
                          <span className="flex-1">{opt.text}</span>
                          {submitted && isCorrect && <Check size={13} className="text-moss-500 shrink-0" />}
                          {submitted && isSelected && !isCorrect && <X size={13} className="text-wine-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                  {submitted && (
                    <div className="mt-3 pt-3 border-t border-ink-900/8 flex items-start gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-gold-600 mt-0.5 shrink-0">解析</span>
                      <p className="font-serif text-xs text-ink-700 flex-1">{q.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-between">
              {submitted ? (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 border border-ink-900/20 text-ink-900 font-serif text-sm hover:border-wine-500 rounded-sm"
                >
                  <RotateCcw size={13} /> 重做
                </button>
              ) : (
                <p className="font-serif text-xs text-ink-400">
                  已答 {Object.keys(answers).length}/{passage.questions.length}
                </p>
              )}
              {!submitted && (
                <button
                  onClick={handleSubmit}
                  disabled={Object.keys(answers).length < passage.questions.length}
                  className="px-5 py-2 bg-wine-600 text-paper-50 font-serif text-sm hover:bg-wine-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-sm flex items-center gap-2"
                >
                  <Send size={13} /> 提交
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
