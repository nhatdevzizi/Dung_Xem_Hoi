import type { Answer, EvidenceRule, GameSession, InitialAction, Scenario, TruthStatus } from './types'

export const STATUS_LABELS: Record<TruthStatus, string> = {
  verified: 'Đã xác thực',
  false: 'Sai sự thật',
  misleading: 'Gây hiểu lầm',
  insufficient: 'Chưa đủ bằng chứng',
}

export const ACTION_LABELS: Record<InitialAction, string> = {
  share: 'Chia sẻ ngay',
  wait: 'Chờ xác minh',
  ask: 'Hỏi người đáng tin',
}

export const SOURCE_TYPE_LABELS = {
  official: 'Thông báo',
  message: 'Tin nhắn',
  image: 'Hình ảnh',
  article: 'Bài viết',
  schedule: 'Lịch',
  social: 'Mạng xã hội',
} as const

export function newSession(scenarioId: string, variantIndex = -1): GameSession {
  return {
    scenarioId,
    variantIndex,
    stage: 'stop',
    initialAction: null,
    initialReason: '',
    viewedSourceIds: [],
    notebookSourceIds: [],
    hintCount: 0,
    draft: { status: null, sourceIds: [], reasoning: '', limitation: '', finalAction: 'wait' },
    answer: null,
  }
}

export function independentSources(scenario: Scenario, selectedIds: string[]): boolean {
  const selected = scenario.sources.filter(source => selectedIds.includes(source.id))
  for (let i = 0; i < selected.length; i++) {
    for (let j = i + 1; j < selected.length; j++) {
      const a = selected[i]
      const b = selected[j]
      const sharedOrigin = a.citesSourceIds.some(id => b.citesSourceIds.includes(id))
      if (!a.citesSourceIds.includes(b.id) && !b.citesSourceIds.includes(a.id) && !sharedOrigin) {
        return true
      }
    }
  }
  return false
}

export interface Evaluation {
  correct: boolean
  score: 0 | 1 | 2 | 3
  selectedRules: EvidenceRule[]
  scoreExplanation: string
}

export function evaluate(scenario: Scenario, session: GameSession, answer: Answer): Evaluation {
  const selectedRules = scenario.evidenceRules.filter(rule => answer.sourceIds.includes(rule.sourceId))
  const relevant = selectedRules.filter(rule => rule.role !== 'insufficient' || answer.status === 'insufficient')
  const meaningfulReason = answer.reasoning.trim().length >= 30
  const sourceBased = relevant.length > 0 && meaningfulReason
  const hasIndependentPair = independentSources(scenario, relevant.map(rule => rule.sourceId))
  const namesLimit = answer.limitation.trim().length >= 18
  const revisedShare = session.initialAction === 'share' && answer.finalAction !== 'share'

  let score: 0 | 1 | 2 | 3 = 0
  let scoreExplanation = 'Lý do chưa gắn được với một nguồn phù hợp; lượt chia sẻ hoặc phỏng đoán không phải bằng chứng.'
  if (meaningfulReason || relevant.length > 0) {
    score = 1
    scoreExplanation = 'Bạn đã nêu dấu hiệu hoặc chọn nguồn, nhưng cần giải thích nguồn đó liên quan thế nào tới tuyên bố.'
  }
  if (sourceBased) {
    score = 2
    scoreExplanation = 'Bạn đã dùng nguồn liên quan và giải thích bằng lời của mình.'
  }
  if (sourceBased && (hasIndependentPair || namesLimit || revisedShare)) {
    score = 3
    scoreExplanation = hasIndependentPair
      ? 'Bạn đã đối chiếu ít nhất hai nguồn không dẫn lại nhau và giải thích bằng chứng.'
      : namesLimit
        ? 'Bạn đã dùng nguồn liên quan và nêu giới hạn của bằng chứng.'
        : 'Bạn đã thay đổi quyết định chia sẻ sau khi xem bằng chứng và giải thích lý do.'
  }

  return {
    correct: answer.status === scenario.truthStatus,
    score,
    selectedRules,
    scoreExplanation,
  }
}

export function validateScenario(scenario: Scenario): string[] {
  const errors: string[] = []
  const ids = new Set(scenario.sources.map(source => source.id))
  if (scenario.sources.length < 5 || scenario.sources.length > 8) errors.push('Số nguồn phải từ 5 đến 8.')
  if (ids.size !== scenario.sources.length) errors.push('ID nguồn bị trùng.')
  for (const source of scenario.sources) {
    if (!source.author || !source.publishedAt || !source.content) errors.push(`Nguồn ${source.id} thiếu thông tin.`)
    for (const cited of source.citesSourceIds) {
      if (!ids.has(cited)) errors.push(`Nguồn ${source.id} dẫn đến ID không tồn tại: ${cited}.`)
    }
  }
  for (const rule of scenario.evidenceRules) {
    if (!ids.has(rule.sourceId)) errors.push(`Quy tắc tham chiếu ID không tồn tại: ${rule.sourceId}.`)
  }
  if (scenario.evidenceRules.length !== scenario.sources.length) errors.push('Mỗi nguồn phải có một quy tắc bằng chứng.')
  if (scenario.hints.length < 3) errors.push('Cần ít nhất ba gợi ý.')
  return errors
}
