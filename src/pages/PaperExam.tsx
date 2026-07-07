import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Clock, Send, Check, X, Volume2, Square,
  AlertTriangle, Award, FileText,
} from 'lucide-react';
import { getPaper } from '@/utils/paperGenerator';
import type { PaperQuestion, PaperQuestionType } from '@/data/types';
import { useTTS } from '@/hooks/useTTS';
import { clsx } from 'clsx';

const TYPE_ORDER: PaperQuestionType[] = ['词汇', '阅读', '听力', '翻译', '写作'];

const TYPE_LABEL: Record<PaperQuestionType, string> = {
  词汇: 'Vocabulary',
  阅读: 'Reading',
  听力: 'Listening',
  翻译: 'Translation',
  写作: 'Writing',
};

const TYPE_DESC: Record<PaperQuestionType, string> = {
  词汇: '词汇与短语选择',
  阅读: '阅读理解选择',
  听力: '听力理解选择',
  翻译: '中译英',
  写作: '短文写作',
};

// 从听力题干中提取 "You hear:" 之后的英文文本
function extractAudioText(stem: string): string {
  const m = stem.match(/You hear:\s*"([^"]+)"/i);
  if (m) return m[1];
  const idx = stem.toLowerCase().indexOf('you hear:');
  if (idx >= 0) return stem.slice(idx + 'you hear:'.length).trim();
  return stem;
}

// 去掉 "You hear: ..." 前缀，仅显示问题部分
function extractQuestionPart(stem: string): { audio?: string; question: string } {
  const m = stem.match(/You hear:\s*"([^"]+)"\s*(.*)/i);
  if (m) return { audio: m[1], question: m[2].trim() };
  const idx = stem.toLowerCase().indexOf('you hear:');
  if (idx >= 0) {
    const after = stem.slice(idx + 'you hear:'.length);
    // 取引号内为听力原文，剩余为问题
    const q = after.replace(/^[^a-zA-Z]*"?[^"]*"?\s*/, '').trim();
    return { audio: after.replace(/^[^a-zA-Z]*"?([^"]*)"?\s*.*$/, '$1'), question: q || after };
  }
  return { question: stem };
}

export default function PaperExam() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const paper = useMemo(() => (id ? getPaper(id) : null), [id]);
  const { speak, cancel, speaking, supported } = useTTS();

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [remaining, setRemaining] = useState<number>((paper?.config.duration ?? 30) * 60);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  // 倒计时
  useEffect(() => {
    if (submitted || !paper) return;
    timerRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setAutoSubmitted(true);
          setSubmitted(true);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [submitted, paper]);

  // 按题型分组（必须在所有 early return 之前调用，遵循 Rules of Hooks）
  const grouped = useMemo(() => {
    const map: Record<PaperQuestionType, PaperQuestion[]> = {
      词汇: [], 阅读: [], 听力: [], 写作: [], 翻译: [],
    };
    if (paper) {
      paper.questions.forEach((q) => {
        map[q.type].push(q);
      });
    }
    return map;
  }, [paper]);

  if (!paper) {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <AlertTriangle size={32} className="text-wine-500 mx-auto mb-3" />
        <p className="font-serif text-ink-700 mb-1">未找到试卷或试卷已过期。</p>
        <p className="font-mono text-xs text-ink-400 mb-6">试卷数据保存在会话存储中，关闭浏览器后将清除。</p>
        <Link to="/papers" className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-wine-500 hover:text-wine-700">
          <ArrowLeft size={13} /> 返回组卷
        </Link>
      </div>
    );
  }

  const activeTypes = TYPE_ORDER.filter((t) => grouped[t].length > 0);

  // 客观题总数（用于评分）
  const objectiveQuestions = paper.questions.filter((q) => q.options);
  const subjectiveQuestions = paper.questions.filter((q) => !q.options);

  const fmtTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const handleSelect = (qId: string, key: string) => {
    if (submitted) return;
    setAnswers((a) => ({ ...a, [qId]: key }));
  };

  const handleText = (qId: string, val: string) => {
    if (submitted) return;
    setTexts((t) => ({ ...t, [qId]: val }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    if (timerRef.current) clearInterval(timerRef.current);
    cancel();
  };

  const handlePlay = (q: PaperQuestion) => {
    if (!supported) return;
    if (playingId === q.id && speaking) {
      cancel();
      setPlayingId(null);
      return;
    }
    const { audio } = extractQuestionPart(q.stem);
    const text = audio || extractAudioText(q.stem);
    setPlayingId(q.id);
    speak(text, {
      onEnd: () => setPlayingId(null),
    });
  };

  // 评分（仅客观题）
  const correctCount = objectiveQuestions.filter((q) => answers[q.id] === q.answer).length;
  const wrongCount = objectiveQuestions.length - correctCount;
  const accuracy = objectiveQuestions.length > 0
    ? Math.round((correctCount / objectiveQuestions.length) * 100)
    : 0;
  const answeredObjective = objectiveQuestions.filter((q) => answers[q.id]).length;
  const answeredSubjective = subjectiveQuestions.filter((q) => (texts[q.id] || '').trim().length > 0).length;

  // 试题序号（全局连续编号）
  let globalIndex = 0;
  const nextIndex = () => ++globalIndex;

  return (
    <div className="container mx-auto px-6 lg:px-8 py-8 max-w-6xl">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <Link to="/papers" className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-400 hover:text-wine-500">
          <ArrowLeft size={14} /> 组卷台
        </Link>
        <div className="flex items-center gap-4">
          {!submitted && (
            <span
              className={clsx(
                'flex items-center gap-1.5 font-mono text-sm px-3 py-1 rounded-sm border',
                remaining < 60
                  ? 'border-wine-500 text-wine-600 bg-wine-50'
                  : 'border-ink-900/15 text-ink-700',
              )}
            >
              <Clock size={13} /> {fmtTime(remaining)}
            </span>
          )}
          {!submitted ? (
            <button
              onClick={handleSubmit}
              className="px-5 py-2 bg-wine-600 text-paper-50 font-serif text-sm hover:bg-wine-700 rounded-sm flex items-center gap-2"
            >
              <Send size={13} /> 交卷
            </button>
          ) : (
            <button
              onClick={() => navigate('/papers')}
              className="px-4 py-2 border border-ink-900/20 text-ink-900 font-serif text-sm hover:border-wine-500 rounded-sm flex items-center gap-2"
            >
              <FileText size={13} /> 再来一套
            </button>
          )}
        </div>
      </div>

      {/* Title */}
      <header className="mb-8 pb-6 border-b border-ink-900/10">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-wine-500">
          Mock Paper · {new Date(paper.createdAt).toLocaleString('zh-CN')}
        </span>
        <h1 className="font-display text-3xl lg:text-4xl font-black tracking-tight text-ink-900 mt-2 mb-2">
          英语四级模拟试卷
        </h1>
        <div className="flex items-center gap-4 font-mono text-xs text-ink-400">
          <span>共 {paper.questions.length} 题</span>
          <span>·</span>
          <span>客观题 {objectiveQuestions.length}</span>
          <span>·</span>
          <span>主观题 {subjectiveQuestions.length}</span>
          <span>·</span>
          <span>时长 {paper.config.duration} 分钟</span>
        </div>
        {autoSubmitted && (
          <p className="font-mono text-xs text-wine-600 mt-3 flex items-center gap-1.5">
            <AlertTriangle size={12} /> 考试时间已到，已自动交卷
          </p>
        )}
      </header>

      {/* Result Banner */}
      {submitted && (
        <section className="mb-8 bg-ink-900 text-paper-100 p-7 rounded-sm grain-overlay">
          <div className="flex items-center gap-2 mb-4">
            <Award size={16} className="text-gold-400" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold-400">
              Result · 成绩单
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-paper-400 mb-1">客观题正确率</p>
              <p className="font-display text-4xl font-black text-gold-400">{accuracy}<span className="text-lg">%</span></p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-paper-400 mb-1">答对</p>
              <p className="font-display text-4xl font-black">{correctCount}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-paper-400 mb-1">答错</p>
              <p className="font-display text-4xl font-black text-wine-100">{wrongCount}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-paper-400 mb-1">未答</p>
              <p className="font-display text-4xl font-black text-paper-400">
                {objectiveQuestions.length - answeredObjective}
              </p>
            </div>
          </div>
          {subjectiveQuestions.length > 0 && (
            <p className="font-serif text-xs text-paper-400 mt-5 pt-4 border-t border-paper-400/20">
              主观题（写作/翻译）共 {subjectiveQuestions.length} 题，已作答 {answeredSubjective} 题；请对照参考答案与评分要点自评。
            </p>
          )}
        </section>
      )}

      {/* Progress hint */}
      {!submitted && (
        <div className="mb-6 flex items-center gap-4 font-mono text-xs text-ink-400">
          <span>客观题 {answeredObjective}/{objectiveQuestions.length}</span>
          {subjectiveQuestions.length > 0 && (
            <span>主观题 {answeredSubjective}/{subjectiveQuestions.length}</span>
          )}
        </div>
      )}

      {/* Questions by type */}
      <div className="space-y-10">
        {activeTypes.map((type) => (
          <section key={type}>
            <div className="flex items-baseline gap-3 mb-5 pb-3 border-b border-ink-900/15">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-wine-500">
                Part · {TYPE_LABEL[type]}
              </span>
              <h2 className="font-display text-2xl font-black text-ink-900">{type}</h2>
              <span className="font-serif text-xs text-ink-400">{TYPE_DESC[type]} · {grouped[type].length} 题</span>
            </div>

            <div className="space-y-5">
              {grouped[type].map((q) => {
                const idx = nextIndex();
                const isObjective = !!q.options;
                const userAns = answers[q.id];
                const userText = texts[q.id] || '';
                const isCorrect = userAns === q.answer;
                const { audio, question } = isObjective ? extractQuestionPart(q.stem) : { audio: undefined, question: q.stem };

                return (
                  <div
                    key={q.id}
                    className={clsx(
                      'bg-paper-50 border p-6 rounded-sm transition-colors',
                      submitted && isObjective
                        ? isCorrect
                          ? 'border-moss-500/40'
                          : 'border-wine-500/40'
                        : 'border-ink-900/10',
                    )}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <span className="font-display text-lg font-black text-wine-600 shrink-0 mt-0.5">
                        {idx}.
                      </span>
                      <div className="flex-1 min-w-0">
                        {type === '听力' && audio && (
                          <div className="mb-2">
                            <button
                              onClick={() => handlePlay(q)}
                              disabled={!supported || submitted}
                              className={clsx(
                                'inline-flex items-center gap-2 px-3 py-1.5 border rounded-sm font-mono text-[11px] uppercase tracking-wider transition-colors',
                                playingId === q.id && speaking
                                  ? 'bg-wine-600 text-paper-50 border-wine-600'
                                  : 'border-wine-500/40 text-wine-600 hover:bg-wine-50',
                              )}
                            >
                              {playingId === q.id && speaking ? (
                                <><Square size={11} /> 停止</>
                              ) : (
                                <><Volume2 size={11} /> 播放听力</>
                              )}
                            </button>
                            {submitted && (
                              <p className="font-serif text-xs text-ink-400 italic mt-2">
                                "{audio}"
                              </p>
                            )}
                          </div>
                        )}
                        <p className="font-serif text-[15px] text-ink-900 leading-relaxed">
                          {question || q.stem}
                        </p>
                      </div>
                      {submitted && isObjective && (
                        <span className={clsx(
                          'shrink-0 w-6 h-6 rounded-full flex items-center justify-center',
                          isCorrect ? 'bg-moss-500 text-paper-50' : 'bg-wine-600 text-paper-50',
                        )}>
                          {isCorrect ? <Check size={13} /> : <X size={13} />}
                        </span>
                      )}
                    </div>

                    {/* 客观题选项 */}
                    {isObjective && q.options && (
                      <div className="space-y-2 pl-8">
                        {q.options.map((opt) => {
                          const isSelected = userAns === opt.key;
                          const isRightOpt = opt.key === q.answer;
                          let cls = 'border-ink-900/12 hover:border-wine-500/40 hover:bg-wine-50/20';
                          if (submitted) {
                            if (isRightOpt) cls = 'border-moss-500 bg-moss-100/50 text-moss-600';
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
                                'w-full flex items-center gap-2.5 p-3 border rounded-sm font-serif text-sm text-left transition-all',
                                cls,
                              )}
                            >
                              <span className="font-mono text-xs text-wine-500 shrink-0">{opt.key}.</span>
                              <span className="flex-1">{opt.text}</span>
                              {submitted && isRightOpt && <Check size={13} className="text-moss-500 shrink-0" />}
                              {submitted && isSelected && !isRightOpt && <X size={13} className="text-wine-600 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* 主观题输入 */}
                    {!isObjective && (
                      <div className="pl-8">
                        {!submitted ? (
                          <textarea
                            value={userText}
                            onChange={(e) => handleText(q.id, e.target.value)}
                            rows={type === '写作' ? 10 : 4}
                            placeholder={type === '写作' ? '在此输入你的作文…' : '在此输入你的译文…'}
                            className="w-full p-4 bg-paper-100 border border-ink-900/15 rounded-sm font-serif text-sm text-ink-900 leading-relaxed focus:outline-none focus:border-wine-500 resize-y"
                          />
                        ) : (
                          <>
                            <div className="mb-4">
                              <span className="font-mono text-[10px] uppercase tracking-wider text-ink-400 block mb-2">你的作答</span>
                              <p className="font-serif text-sm text-ink-700 whitespace-pre-wrap p-3 bg-paper-100 border border-ink-900/10 rounded-sm min-h-[60px]">
                                {userText || <span className="text-ink-400 italic">（未作答）</span>}
                              </p>
                            </div>
                            <div>
                              <span className="font-mono text-[10px] uppercase tracking-wider text-moss-500 block mb-2">参考答案</span>
                              <p className="font-serif text-sm text-moss-600 whitespace-pre-wrap p-3 bg-moss-100/40 border border-moss-500/30 rounded-sm">
                                {q.answer}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* 解析 */}
                    {submitted && (
                      <div className="mt-4 pt-3 border-t border-ink-900/8 pl-8 flex items-start gap-2">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-gold-600 mt-0.5 shrink-0">解析</span>
                        <p className="font-serif text-xs text-ink-700 flex-1">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Bottom Actions */}
      {!submitted && (
        <div className="mt-10 flex items-center justify-between pt-6 border-t border-ink-900/10">
          <p className="font-serif text-xs text-ink-400">
            已答 {answeredObjective + answeredSubjective}/{paper.questions.length} 题
          </p>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-wine-600 text-paper-50 font-serif text-sm hover:bg-wine-700 rounded-sm flex items-center gap-2"
          >
            <Send size={13} /> 交卷
          </button>
        </div>
      )}
      {submitted && (
        <div className="mt-10 flex items-center justify-center gap-3">
          <Link
            to="/mistakes"
            className="px-5 py-2 border border-ink-900/20 text-ink-900 font-serif text-sm hover:border-wine-500 rounded-sm flex items-center gap-2"
          >
            <AlertTriangle size={13} /> 查看错题本
          </Link>
          <button
            onClick={() => navigate('/papers')}
            className="px-5 py-2 bg-wine-600 text-paper-50 font-serif text-sm hover:bg-wine-700 rounded-sm flex items-center gap-2"
          >
            <FileText size={13} /> 再组一套
          </button>
        </div>
      )}
    </div>
  );
}
