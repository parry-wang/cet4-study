import type { PaperQuestion, PaperQuestionType } from '@/data/types';
import { paperQuestionBank } from '@/data/papers';

export interface GeneratedPaper {
  id: string;
  createdAt: string;
  config: {
    types: PaperQuestionType[];
    countPerType: Record<PaperQuestionType, number>;
    difficulty: number; // 1易 2中 3难 0混合
    duration: number; // 分钟
  };
  questions: PaperQuestion[];
}

const STORAGE_KEY = 'yanmo-cet4-papers';

// 生成试卷：从题库按题型、难度抽取
export function generatePaper(config: GeneratedPaper['config']): GeneratedPaper {
  const questions: PaperQuestion[] = [];
  config.types.forEach((type) => {
    const pool = paperQuestionBank.filter((q) => q.type === type);
    const filtered = config.difficulty === 0
      ? pool
      : pool.filter((q) => q.difficulty === config.difficulty);
    const source = filtered.length > 0 ? filtered : pool;
    // 简单打乱取前 N 个
    const shuffled = [...source].sort(() => Math.random() - 0.5);
    const count = Math.min(config.countPerType[type] || 0, shuffled.length);
    questions.push(...shuffled.slice(0, count));
  });

  return {
    id: `paper_${Date.now()}`,
    createdAt: new Date().toISOString(),
    config,
    questions,
  };
}

// 存储到 sessionStorage（试卷为临时数据）
export function savePaper(paper: GeneratedPaper): void {
  const all = getAllPapers();
  all[paper.id] = paper;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function getPaper(id: string): GeneratedPaper | null {
  const all = getAllPapers();
  return all[id] || null;
}

export function getAllPapers(): Record<string, GeneratedPaper> {
  if (typeof sessionStorage === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
