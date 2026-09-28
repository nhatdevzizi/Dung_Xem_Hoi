export type TruthStatus = 'verified' | 'false' | 'misleading' | 'insufficient'
export type SourceType = 'official' | 'message' | 'image' | 'article' | 'schedule' | 'social'
export type EvidenceRole = 'supports' | 'refutes' | 'context' | 'insufficient'
export type InitialAction = 'share' | 'wait' | 'ask'
export type Stage = 'stop' | 'explore' | 'conclude' | 'feedback'

export interface Source {
  id: string
  type: SourceType
  title: string
  author: string
  publishedAt: string
  content: string
  citesSourceIds: string[]
  relevanceNote: string
}

export interface EvidenceRule {
  sourceId: string
  role: EvidenceRole
  limitation: string
  explanation: string
}

export interface Scenario {
  id: string
  title: string
  ageBand: string
  learningGoal: string
  claim: string
  truthStatus: TruthStatus
  topic: string
  difficulty: string
  sources: Source[]
  evidenceRules: EvidenceRule[]
  hints: string[]
  teacherNotes: string
  variantClaims: string[]
}

export interface Answer {
  status: TruthStatus
  sourceIds: string[]
  reasoning: string
  limitation: string
  finalAction: InitialAction
}

export interface GameSession {
  scenarioId: string
  variantIndex: number
  stage: Stage
  initialAction: InitialAction | null
  initialReason: string
  viewedSourceIds: string[]
  notebookSourceIds: string[]
  hintCount: number
  draft: {
    status: TruthStatus | null
    sourceIds: string[]
    reasoning: string
    limitation: string
    finalAction: InitialAction
  }
  answer: Answer | null
}
