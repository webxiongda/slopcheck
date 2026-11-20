// 命中的类别：英文陈词、句式套路、中文黑话、Emoji 滥用、填充冗余
export type CategoryId = 'cliche' | 'pattern' | 'chinese' | 'emoji' | 'filler'

export interface CategoryMeta {
  id: CategoryId
  label: string
  color: string
  hint: string
}

// 单条命中结果
export interface Match {
  id: string
  category: CategoryId
  text: string
  start: number
  end: number
  reason: string
  suggestion: string
  replacement?: string
  weight: number
}

export type LevelId = 'severe' | 'medium' | 'mild' | 'clean'

export interface AnalysisResult {
  score: number
  level: LevelId
  matches: Match[]
  wordCount: number
  readability: number
  rewritten: string
}
