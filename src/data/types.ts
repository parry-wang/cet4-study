// 通用数据类型定义

export interface Word {
  id: string;
  word: string;
  phonetic: string;
  pos: string;          // 词性
  meaning: string;      // 中文释义
  example: string;
  exampleCn: string;
  difficulty: 1 | 2 | 3; // 1基础 2进阶 3高阶
}

export interface QuestionOption {
  key: string;   // A B C D
  text: string;
}

export interface ChoiceQuestion {
  id: string;
  stem: string;
  options: QuestionOption[];
  answer: string;        // 正确选项 key
  explanation: string;
}

export interface ListeningMaterial {
  id: string;
  title: string;
  category: '短对话' | '长对话' | '短文理解' | '新闻报道';
  duration: number;      // 秒
  difficulty: 1 | 2 | 3;
  audioText: string;     // 英文原文
  audioTextCn: string;   // 中文翻译
  paragraphs: { text: string; textCn: string }[]; // 段落级原文和翻译
  questions: ChoiceQuestion[];
}

export interface ReadingPassage {
  id: string;
  title: string;
  category: '科普' | '社会' | '教育' | '经济' | '文化' | '环境';
  difficulty: 1 | 2 | 3;
  passage: string;
  passageCn: string;     // 中文翻译
  questions: ChoiceQuestion[];
}

export interface WritingTopic {
  id: string;
  topic: string;
  type: '议论文' | '说明文' | '应用文' | '图表作文';
  requirement: string;
  wordLimit: number;
  sampleEssay: string;
  template: string;      // 高分模板
}

export type PaperQuestionType = '词汇' | '阅读' | '听力' | '写作' | '翻译';

export interface PaperQuestion {
  id: string;
  type: PaperQuestionType;
  difficulty: 1 | 2 | 3;
  stem: string;
  options?: QuestionOption[];
  answer: string;
  explanation: string;
}

export interface WrongWord {
  wordId: string;
  wrongCount: number;
  lastReview: string;       // YYYY-MM-DD
  nextReview: string;       // 下次复习日期
  mastery: 'new' | 'learning' | 'mastered';
}

export interface VocabularyProgress {
  currentDate: string;       // 当日词库日期
  dayIndex: number;           // 第几天词库
  studied: string[];          // 已学单词 id
  mastered: string[];         // 已掌握单词 id
  wrong: WrongWord[];         // 错词本
}

export interface UserProgress {
  vocabulary: VocabularyProgress;
  calendar: Record<string, number>;  // 日期 -> 学习单词数
  readingWrong: string[];     // 阅读错题 id
  listeningWrong: string[];   // 听力错题 id
  stats: {
    totalDays: number;
    totalWords: number;
    accuracy: number;
    papersTaken: number;
  };
}
