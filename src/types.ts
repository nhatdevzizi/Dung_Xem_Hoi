export type TruthStatus = 'verified' | 'false' | 'misleading' | 'insufficient'
export type Belief = 'believe' | 'unsure' | 'disbelieve'
export type ReasonChoice = 'enough' | 'missing' | 'unclear' | 'outdated'
export type ContactMethod = 'message' | 'call'
export type Stage = 'stop' | 'reason' | 'evidence' | 'conclude' | 'feedback'
export type SchoolLevel = 'primary' | 'middle' | 'high'
export type SourceType = 'official' | 'message' | 'image' | 'article' | 'schedule' | 'social' | 'video' | 'legal'
export type EvidenceRole = 'supports' | 'refutes' | 'context' | 'insufficient'

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
  schoolLevel: SchoolLevel
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
  feedback: {
    explanation: string
    questions: [string, string]
  }
}

export interface GameSession {
  scenarioId: string
  variantIndex: number
  stage: Stage
  initialBelief: Belief | null
  reasonChoice: ReasonChoice | null
  questionChoice: string | null
  contactMethod: ContactMethod | null
  revealedSourceIds: string[]
  finalBelief: Belief | null
  reflection: string
}
