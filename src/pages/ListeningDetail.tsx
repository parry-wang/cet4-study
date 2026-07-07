import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Play, Pause, ArrowLeft, ArrowRight, Volume2, BookOpen,
  Check, X, RotateCcw, Gauge,
} from 'lucide-react';
import { listeningMaterials } from '@/data/listening';
import { useTTS } from '@/hooks/useTTS';
import { useProgressStore } from '@/store/useProgressStore';
import { clsx } from 'clsx';

export default function ListeningDetail() {
  const { id } = useParams<{ id: string }>();
  const material = listeningMaterials.find((m) => m.id === id);
  const { speak, cancel, speaking } = useTTS();
  const { addListeningWrong, removeListeningWrong, listeningWrong } = useProgressStore();

  const [playing, setPlaying] = useState(false);
  const [playingParagraph, setPlayingParagraph] = useState<number | null>(null);
  const [rate, setRate] = useState(1);
  const [showText, setShowText] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  if (!material) {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <p className="font-serif text-ink-400">未找到该听力素材。</p>
        <Link to="/listening" className="font-mono text-wine-500 underline mt-4 inline-block">返回列表</Link>
      </div>
    );
  }

  // 播放控制
  const handlePlay = () => {
    if (speaking) {
      cancel();
      setPlaying(false);
      setPlayingParagraph(null);
    } else {
      speak(material.audioText, { rate });
      setPlaying(true);
    }
  };

  // 段落播放控制
  const handlePlayParagraph = (index: number) => {
    if (playingParagraph === index && speaking) {
      cancel();
      setPlayingParagraph(null);
    } else {
      cancel();
      speak(material.paragraphs[index].text, { rate });
      setPlayingParagraph(index);
    }
  };

  // 切换倍速时若正在播放则重启
  useEffect(() => {
    if (playing) {
      cancel();
      speak(material.audioText, { rate });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rate]);

  useEffect(() => {
    return () => cancel();
  }, [cancel]);

  const handleSelect = (qId: string, key: string) => {
    if (submitted) return;
    setAnswers({ ...answers, [qId]: key });
  };

  const handleSubmit = () => {
    setSubmitted(true);
    // 错题入库
    material.questions.forEach((q) => {
      if (answers[q.id] !== q.answer) {
        addListeningWrong(q.id);
      } else {
        // 答对的从错题本移除（如果之前错过）
        removeListeningWrong(q.id);
      }
    });
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  const correctCount = material.questions.filter((q) => answers[q.id] === q.answer).length;
  const accuracy = Math.round((correctCount / material.questions.length) * 100);

  return (
    <div className="container mx-auto px-6 lg:px-8 py-8 max-w-5xl">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <Link to="/listening" className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-400 hover:text-wine-500">
          <ArrowLeft size={14} /> 听力素材
        </Link>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-wine-500">
          {material.category}
        </span>
      </div>

      {/* Header */}
      <header className="mb-8 pb-6 border-b border-ink-900/10">
        <h1 className="font-display text-3xl lg:text-4xl font-black tracking-tight text-ink-900 mb-2">
          {material.title}
        </h1>
        <p className="font-mono text-xs text-ink-400">
          时长 {Math.floor(material.duration / 60)}'{String(material.duration % 60).padStart(2, '0')}" · {material.questions.length} 道题
        </p>
      </header>

      {/* Player */}
      <div className="bg-ink-900 text-paper-100 p-7 rounded-sm mb-8 grain-overlay">
        <div className="flex items-center gap-5">
          <button
            onClick={handlePlay}
            className="w-16 h-16 rounded-full bg-wine-600 hover:bg-wine-700 flex items-center justify-center text-paper-50 shrink-0 transition-colors"
          >
            {playing ? <Pause size={26} fill="currentColor" /> : <Play size={26} fill="currentColor" className="ml-1" />}
          </button>
          <div className="flex-1">
            {/* 波形可视化 */}
            <div className="flex items-end gap-0.5 h-10 mb-2">
              {Array.from({ length: 48 }).map((_, i) => (
                <div
                  key={i}
                  className={clsx(
                    'flex-1 bg-gold-400/60 rounded-sm origin-bottom',
                    playing && 'animate-barWave',
                  )}
                  style={{
                    height: `${30 + Math.sin(i * 0.6) * 30 + 30}%`,
                    animationDelay: `${i * 50}ms`,
                  }}
                />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider text-paper-400">
                {playing ? '正在播报...' : '点击播放按钮开始'}
              </span>
              <div className="flex items-center gap-2">
                <Gauge size={13} className="text-paper-400" />
                {[0.75, 1, 1.25].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRate(r)}
                    className={clsx(
                      'font-mono text-[10px] px-2 py-0.5 border rounded-sm transition-colors',
                      rate === r
                        ? 'bg-gold-400 text-ink-900 border-gold-400'
                        : 'border-paper-400/30 text-paper-400 hover:text-paper-100',
                    )}
                  >
                    {r}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 原文对照切换 */}
        <div className="mt-5 pt-5 border-t border-paper-400/20 flex items-center gap-3">
          <button
            onClick={() => setShowText(!showText)}
            className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-gold-400 hover:text-gold-500"
          >
            <BookOpen size={13} /> {showText ? '隐藏原文' : '显示原文对照'}
          </button>
          <button
            onClick={() => speak(material.audioText, { rate })}
            className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-paper-400 hover:text-paper-100"
          >
            <Volume2 size={13} /> 重新播放
          </button>
        </div>

        {showText && !submitted && (
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-gold-400 mb-2">English</p>
            <p className="font-serif leading-relaxed text-paper-100">{material.audioText}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-gold-400 mb-2">中文翻译</p>
            <p className="font-serif leading-relaxed text-paper-400">{material.audioTextCn}</p>
          </div>
        </div>
      )}

      {submitted && (
        <div className="mt-5">
          <p className="font-mono text-[10px] uppercase tracking-wider text-gold-400 mb-4">原文对照与段落音频</p>
          <div className="space-y-4">
            {material.paragraphs.map((para, index) => (
              <div key={index} className="bg-paper-900/50 rounded-sm p-4 border border-paper-400/10">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handlePlayParagraph(index)}
                    className={clsx(
                      'w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors',
                      playingParagraph === index
                        ? 'bg-wine-600 text-paper-50'
                        : 'bg-paper-400/20 text-paper-400 hover:bg-wine-600/50',
                    )}
                  >
                    {playingParagraph === index && speaking ? (
                      <Pause size={14} />
                    ) : (
                      <Play size={14} className="ml-0.5" />
                    )}
                  </button>
                  <div className="flex-1">
                    <p className="font-serif text-sm text-paper-100 leading-relaxed mb-1.5">
                      {para.text}
                    </p>
                    <p className="font-serif text-xs text-paper-500 leading-relaxed">
                      {para.textCn}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>

      {/* Questions */}
      <section>
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="font-display text-2xl font-bold text-ink-900">听力测验</h2>
          {submitted && (
            <span className="font-mono text-sm text-wine-600">
              正确率 {accuracy}% · {correctCount}/{material.questions.length}
            </span>
          )}
        </div>

        <div className="space-y-6">
          {material.questions.map((q, qi) => (
            <div key={q.id} className="bg-paper-50 border border-ink-900/10 p-6 rounded-sm">
              <p className="font-serif text-base text-ink-900 mb-4">
                <span className="font-mono text-xs text-wine-500 mr-2">{qi + 1}.</span>
                {q.stem}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {q.options.map((opt) => {
                  const isSelected = answers[q.id] === opt.key;
                  const isCorrect = opt.key === q.answer;
                  let cls = 'border-ink-900/15 hover:border-wine-500/50 hover:bg-wine-50/30';
                  if (submitted) {
                    if (isCorrect) cls = 'border-moss-500 bg-moss-100/60 text-moss-600';
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
                        'flex items-center justify-between p-3 border rounded-sm font-serif text-sm text-left transition-all',
                        cls,
                      )}
                    >
                      <span><span className="font-mono text-xs text-wine-500 mr-2">{opt.key}.</span>{opt.text}</span>
                      {submitted && isCorrect && <Check size={14} className="text-moss-500" />}
                      {submitted && isSelected && !isCorrect && <X size={14} className="text-wine-600" />}
                    </button>
                  );
                })}
              </div>
              {submitted && (
                <div className="mt-4 pt-4 border-t border-ink-900/8 flex items-start gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-gold-600 mt-0.5">解析</span>
                  <p className="font-serif text-sm text-ink-700 flex-1">{q.explanation}</p>
                  {listeningWrong.includes(q.id) && (
                    <span className="font-mono text-[10px] text-wine-600">已入错题本</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-between">
          {submitted ? (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-5 py-2.5 border border-ink-900/20 text-ink-900 font-serif text-sm hover:border-wine-500 rounded-sm"
            >
              <RotateCcw size={14} /> 重新作答
            </button>
          ) : (
            <p className="font-serif text-sm text-ink-400">
              已答 {Object.keys(answers).length} / {material.questions.length} 题
            </p>
          )}
          {!submitted && (
            <button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length < material.questions.length}
              className="px-6 py-2.5 bg-wine-600 text-paper-50 font-serif text-sm hover:bg-wine-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-sm flex items-center gap-2"
            >
              提交答案 <ArrowRight size={14} />
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
