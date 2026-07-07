import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WrongWord, UserProgress } from '@/data/types';
import { vocabulary, TOTAL_DAYS } from '@/data/vocabulary';

// 间隔重复间隔天数（简化 SM-2）：错词在第 1、2、4、7 天重复
const REVIEW_INTERVALS = [1, 2, 4, 7];

// 工具：获取今日日期 YYYY-MM-DD
function todayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// 工具：日期加 n 天
function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// 计算两个日期相差天数
function daysBetween(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00').getTime();
  const db = new Date(b + 'T00:00:00').getTime();
  return Math.round((db - da) / (1000 * 60 * 60 * 24));
}

interface ProgressState extends UserProgress {
  // 单词相关
  ensureDailyUpdate: () => void;            // 检查并定点更新当日词库
  markWordStudied: (wordId: string) => void; // 标记单词已学
  markWordMastered: (wordId: string) => void; // 标记单词已掌握
  addWrongWord: (wordId: string) => void;     // 加入错词本
  reviewWrongWord: (wordId: string, correct: boolean) => void; // 复习错词
  getCurrentDayWords: () => typeof vocabulary; // 获取当日词库
  getDueWrongWords: () => WrongWord[];        // 获取今日到期需复习的错词
  // 错题本相关
  addReadingWrong: (questionId: string) => void;
  addListeningWrong: (questionId: string) => void;
  removeReadingWrong: (questionId: string) => void;
  removeListeningWrong: (questionId: string) => void;
  // 统计
  recordPaperTaken: () => void;
  resetProgress: () => void;
}

const initialProgress: UserProgress = {
  vocabulary: {
    currentDate: todayStr(),
    dayIndex: 0,
    studied: [],
    mastered: [],
    wrong: [],
  },
  calendar: {},
  readingWrong: [],
  listeningWrong: [],
  stats: {
    totalDays: 1,
    totalWords: 0,
    accuracy: 0,
    papersTaken: 0,
  },
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      ...initialProgress,

      ensureDailyUpdate: () => {
        const today = todayStr();
        const { vocabulary: vocab } = get();
        if (vocab.currentDate !== today) {
          // 计算经过的天数，更新 dayIndex（不超总天数）
          const passed = daysBetween(vocab.currentDate, today);
          let newDayIndex = vocab.dayIndex + Math.max(1, passed);
          if (newDayIndex >= TOTAL_DAYS) newDayIndex = TOTAL_DAYS - 1;
          set((state) => ({
            vocabulary: {
              ...state.vocabulary,
              currentDate: today,
              dayIndex: newDayIndex,
            },
            stats: {
              ...state.stats,
              totalDays: state.stats.totalDays + Math.max(1, passed),
            },
          }));
        }
      },

      markWordStudied: (wordId) => {
        set((state) => {
          if (state.vocabulary.studied.includes(wordId)) return state;
          const studied = [...state.vocabulary.studied, wordId];
          const today = todayStr();
          const calendar = { ...state.calendar };
          calendar[today] = (calendar[today] || 0) + 1;
          return {
            vocabulary: { ...state.vocabulary, studied },
            calendar,
            stats: {
              ...state.stats,
              totalWords: state.stats.totalWords + 1,
            },
          };
        });
      },

      markWordMastered: (wordId) => {
        set((state) => {
          const mastered = state.vocabulary.mastered.includes(wordId)
            ? state.vocabulary.mastered
            : [...state.vocabulary.mastered, wordId];
          // 如果该词在错词本中，标记为 mastered 并移出复习队列
          const wrong = state.vocabulary.wrong.filter((w) => w.wordId !== wordId);
          return {
            vocabulary: { ...state.vocabulary, mastered, wrong },
          };
        });
      },

      addWrongWord: (wordId) => {
        set((state) => {
          const existing = state.vocabulary.wrong.find((w) => w.wordId === wordId);
          const today = todayStr();
          if (existing) {
            // 已存在，错次 +1，重置复习间隔
            const wrong = state.vocabulary.wrong.map((w) =>
              w.wordId === wordId
                ? {
                    ...w,
                    wrongCount: w.wrongCount + 1,
                    lastReview: today,
                    nextReview: addDays(today, REVIEW_INTERVALS[0]),
                    mastery: 'learning' as const,
                  }
                : w,
            );
            return { vocabulary: { ...state.vocabulary, wrong } };
          }
          const newWrong: WrongWord = {
            wordId,
            wrongCount: 1,
            lastReview: today,
            nextReview: addDays(today, REVIEW_INTERVALS[0]),
            mastery: 'new',
          };
          return {
            vocabulary: {
              ...state.vocabulary,
              wrong: [...state.vocabulary.wrong, newWrong],
            },
          };
        });
      },

      reviewWrongWord: (wordId, correct) => {
        set((state) => {
          const today = todayStr();
          const wrong = state.vocabulary.wrong
            .map((w) => {
              if (w.wordId !== wordId) return w;
              if (!correct) {
                // 答错：重置间隔
                return {
                  ...w,
                  wrongCount: w.wrongCount + 1,
                  lastReview: today,
                  nextReview: addDays(today, REVIEW_INTERVALS[0]),
                  mastery: 'learning' as const,
                };
              }
              // 答对：晋级间隔
              const currentInterval = daysBetween(w.lastReview, w.nextReview);
              const idx = REVIEW_INTERVALS.indexOf(currentInterval);
              const nextIdx = Math.min(idx + 1, REVIEW_INTERVALS.length - 1);
              // 如果已到最后间隔，标记为 mastered
              if (idx === REVIEW_INTERVALS.length - 1) {
                return {
                  ...w,
                  lastReview: today,
                  nextReview: addDays(today, REVIEW_INTERVALS[idx]),
                  mastery: 'mastered' as const,
                };
              }
              return {
                ...w,
                lastReview: today,
                nextReview: addDays(today, REVIEW_INTERVALS[nextIdx]),
                mastery: 'learning' as const,
              };
            })
            // 移除已掌握的（标记 mastered 后转入 mastered 列表）
          const stillWrong = wrong.filter((w) => w.mastery !== 'mastered');
          const mastered = wrong
            .filter((w) => w.mastery === 'mastered')
            .map((w) => w.wordId);
          const masteredSet = mastered.length
            ? [...new Set([...state.vocabulary.mastered, ...mastered])]
            : state.vocabulary.mastered;
          return {
            vocabulary: {
              ...state.vocabulary,
              wrong: stillWrong,
              mastered: masteredSet,
            },
          };
        });
      },

      getCurrentDayWords: () => {
        const { vocabulary: vocab } = get();
        const start = vocab.dayIndex * 50;
        return vocabulary.slice(start, start + 50);
      },

      getDueWrongWords: () => {
        const today = todayStr();
        return get().vocabulary.wrong.filter((w) => w.nextReview <= today);
      },

      addReadingWrong: (questionId) => {
        set((state) => {
          if (state.readingWrong.includes(questionId)) return state;
          return { readingWrong: [...state.readingWrong, questionId] };
        });
      },

      addListeningWrong: (questionId) => {
        set((state) => {
          if (state.listeningWrong.includes(questionId)) return state;
          return { listeningWrong: [...state.listeningWrong, questionId] };
        });
      },

      removeReadingWrong: (questionId) => {
        set((state) => ({
          readingWrong: state.readingWrong.filter((id) => id !== questionId),
        }));
      },

      removeListeningWrong: (questionId) => {
        set((state) => ({
          listeningWrong: state.listeningWrong.filter((id) => id !== questionId),
        }));
      },

      recordPaperTaken: () => {
        set((state) => ({
          stats: { ...state.stats, papersTaken: state.stats.papersTaken + 1 },
        }));
      },

      resetProgress: () => {
        set({ ...initialProgress, vocabulary: { ...initialProgress.vocabulary, currentDate: todayStr() } });
      },
    }),
    {
      name: 'yanmo-cet4-progress',
      version: 1,
    },
  ),
);

export { todayStr, addDays, REVIEW_INTERVALS };
