import type { Belief, ContactMethod, EvidenceRole, GameSession, ReasonChoice, Scenario, SchoolLevel, Source, TruthStatus } from './types'

export const SCHEDULE_SCENARIO_ID = 'doi-vo-van-tuan-sau'
export const BELIEF_LABELS: Record<Belief, string> = {
  believe: 'Tin',
  unsure: 'Chưa chắc',
  disbelieve: 'Không tin',
}
export const REASON_LABELS: Record<Belief, Record<ReasonChoice, string>> = {
  believe: {
    enough: 'Người gửi hoặc kênh đăng có vẻ đáng tin',
    missing: 'Tin có ngày giờ và chi tiết nghe hợp lý',
    unclear: 'Tin khớp với điều mình từng biết',
    outdated: 'Nhiều người cùng nhắc đến thông tin này',
  },
  unsure: {
    enough: 'Có dấu hiệu đáng tin nhưng chưa thể kết luận',
    missing: 'Mình chưa thấy bằng chứng gốc',
    unclear: 'Chưa rõ ai là người xác nhận',
    outdated: 'Chưa rõ thời điểm hoặc phạm vi áp dụng',
  },
  disbelieve: {
    enough: 'Một chi tiết mâu thuẫn với điều mình đã biết',
    missing: 'Tin chỉ là lời kể, chưa có bằng chứng',
    unclear: 'Nguồn gửi không rõ hoặc chỉ dẫn lại',
    outdated: 'Ảnh hay tài liệu có thể cũ hoặc thiếu bối cảnh',
  },
}
const PRIMARY_REASON_LABELS: typeof REASON_LABELS = {
  believe: {
    enough: 'Bạn mình nói nên em nghĩ là đúng',
    missing: 'Em thấy ảnh hoặc lời cô dặn',
    unclear: 'Tin giống điều em đã biết',
    outdated: 'Nhiều bạn cũng nói thế',
  },
  unsure: {
    enough: 'Em mới nghe kể, chưa nhìn thấy',
    missing: 'Em chưa xem ảnh hay lời cô',
    unclear: 'Em chưa biết ai báo tin',
    outdated: 'Em chưa rõ tin nói về ngày nào',
  },
  disbelieve: {
    enough: 'Em thấy có điều không khớp',
    missing: 'Bạn nói nhưng chưa có bằng chứng',
    unclear: 'Em không biết ai gửi tin',
    outdated: 'Ảnh có thể là ảnh cũ',
  },
}
const HIGH_REASON_LABELS: typeof REASON_LABELS = {
  believe: {
    enough: 'Nguồn gốc có vẻ là văn bản chính thức',
    missing: 'Có ngày và phạm vi áp dụng rõ ràng',
    unclear: 'Thông tin khớp với nguồn mình từng đọc',
    outdated: 'Nhiều nguồn có vẻ độc lập cùng đưa tin',
  },
  unsure: {
    enough: 'Mới thấy ảnh cắt hoặc bản dự thảo',
    missing: 'Chưa tìm được tài liệu gốc',
    unclear: 'Chưa xác định được tác giả hoặc cơ quan',
    outdated: 'Chưa rõ ngày hiệu lực và phạm vi áp dụng',
  },
  disbelieve: {
    enough: 'Phát biểu đi xa hơn điều nguồn gốc nêu',
    missing: 'Bài đăng thiếu nguồn có thể kiểm tra',
    unclear: 'Trích dẫn có dấu hiệu bị cắt ngữ cảnh',
    outdated: 'Tài liệu có thể cũ hoặc chưa có hiệu lực',
  },
}
const REASON_ORDER: ReasonChoice[] = ['enough', 'missing', 'unclear', 'outdated']

export function reasonOptions(belief: Belief, level: SchoolLevel = 'middle'): Array<{ id: ReasonChoice; label: string }> {
  const labels = level === 'primary' ? PRIMARY_REASON_LABELS : level === 'high' ? HIGH_REASON_LABELS : REASON_LABELS
  return REASON_ORDER.map(id => ({ id, label: labels[belief][id] }))
}

export function chooseInitialBelief(session: GameSession, belief: Belief): GameSession {
  if (session.initialBelief === belief) return session
  return {
    ...session,
    initialBelief: belief,
    reasonChoice: null,
    questionChoice: null,
    contactMethod: null,
    revealedSourceIds: [],
    finalBelief: null,
    reflection: '',
  }
}
export const STATUS_LABELS: Record<TruthStatus, string> = {
  verified: 'Đã xác thực',
  false: 'Sai sự thật',
  misleading: 'Gây hiểu lầm',
  insufficient: 'Chưa đủ bằng chứng',
}
export const SOURCE_TYPE_LABELS: Record<Source['type'], string> = {
  official: 'Thông báo',
  message: 'Tin nhắn',
  image: 'Hình ảnh',
  article: 'Bài viết',
  schedule: 'Thời khóa biểu',
  social: 'Bài đăng',
  video: 'Video mô phỏng',
  legal: 'Điều khoản mô phỏng',
}
export const QUESTION_OPTIONS = [
  'Cô có đổi thời khóa biểu và yêu cầu lớp mình mang vở Văn từ thứ Hai tuần sau không ạ?',
  'Cô có thể xác nhận thời khóa biểu mới cho lớp không ạ?',
  'Thay đổi này bắt đầu từ ngày nào và áp dụng cho lớp nào ạ?',
] as const

export function newSession(scenarioId: string, variantIndex = -1): GameSession {
  return {
    scenarioId, variantIndex, stage: 'stop', initialBelief: null, reasonChoice: null,
    questionChoice: null, contactMethod: null, revealedSourceIds: [],
    finalBelief: null, reflection: '',
  }
}

/** Clear the current learning step and answers that depend on it. */
export function resetStage(session: GameSession): GameSession {
  if (session.stage === 'stop') return newSession(session.scenarioId, session.variantIndex)
  if (session.stage === 'reason') return {
    ...session, reasonChoice: null, questionChoice: null, contactMethod: null,
    revealedSourceIds: [], finalBelief: null, reflection: '',
  }
  if (session.stage === 'evidence') return {
    ...session, questionChoice: null, contactMethod: null,
    revealedSourceIds: [], finalBelief: null, reflection: '',
  }
  if (session.stage === 'conclude') return { ...session, finalBelief: null, reflection: '' }
  return session
}

export function expectedBelief(status: TruthStatus): Belief {
  if (status === 'verified') return 'believe'
  if (status === 'insufficient') return 'unsure'
  return 'disbelieve'
}

export interface EvidenceOption {
  id: string
  label: string
  sourceId: string
  contactMethod?: ContactMethod
}

export function evidenceOptions(scenario: Scenario): EvidenceOption[] {
  return scenario.sources.map(source => {
    if (scenario.id === SCHEDULE_SCENARIO_ID && source.id === 'tkb-co-nhan') {
      return { id: source.id, sourceId: source.id, label: 'Nhắn tin hỏi cô', contactMethod: 'message' }
    }
    if (scenario.id === SCHEDULE_SCENARIO_ID && source.id === 'tkb-co-goi') {
      return { id: source.id, sourceId: source.id, label: 'Gọi điện hỏi cô', contactMethod: 'call' }
    }
    const verb: Record<Source['type'], string> = {
      image: 'Xem hình ảnh', official: 'Xem nguồn chính thức', schedule: 'Xem thời khóa biểu',
      message: 'Xem ai đã nói', article: 'Xem nguồn bài viết', social: 'Xem bài đăng',
      video: 'Xem video và bản chép lời', legal: 'Đọc điều khoản mô phỏng',
    }
    return { id: source.id, sourceId: source.id, label: verb[source.type] + ': ' + source.title }
  })
}

export function requestEvidence(session: GameSession, scenario: Scenario, optionId: string): GameSession {
  const option = evidenceOptions(scenario).find(item => item.id === optionId)
  if (!option || (option.contactMethod && !session.questionChoice)) return session
  if (scenario.id === SCHEDULE_SCENARIO_ID && optionId === 'tkb-nhom-cap-nhat' && !session.contactMethod) return session
  return {
    ...session,
    contactMethod: option.contactMethod ?? session.contactMethod,
    revealedSourceIds: session.revealedSourceIds.includes(option.sourceId)
      ? session.revealedSourceIds
      : [...session.revealedSourceIds, option.sourceId],
  }
}

export function canAdvance(session: GameSession): boolean {
  if (session.stage === 'stop') return session.initialBelief !== null
  if (session.stage === 'reason') return session.reasonChoice !== null
  if (session.stage === 'evidence') {
    return session.revealedSourceIds.length > 0 &&
      (session.scenarioId !== SCHEDULE_SCENARIO_ID || session.contactMethod !== null)
  }
  if (session.stage === 'conclude') return session.finalBelief !== null && session.reflection.trim().length >= 10
  return false
}

export function independentSources(scenario: Scenario, selectedIds: string[]): boolean {
  const selected = scenario.sources.filter(source => selectedIds.includes(source.id))
  for (let i = 0; i < selected.length; i++) {
    for (let j = i + 1; j < selected.length; j++) {
      const a = selected[i]
      const b = selected[j]
      const sharedOrigin = a.citesSourceIds.some(id => b.citesSourceIds.includes(id))
      const sameAuthor = a.author === b.author
      if (!a.citesSourceIds.includes(b.id) && !b.citesSourceIds.includes(a.id) && !sharedOrigin && !sameAuthor) return true
    }
  }
  return false
}

export interface Evaluation {
  correct: boolean
  score: 0 | 1 | 2 | 3
  scoreExplanation: string
  revealedRules: Array<{ source: Source; role: EvidenceRole; explanation: string; limitation: string }>
}

export function evaluate(scenario: Scenario, session: GameSession): Evaluation {
  const revealedRules = scenario.evidenceRules
    .filter(rule => session.revealedSourceIds.includes(rule.sourceId))
    .map(rule => ({ ...rule, source: scenario.sources.find(source => source.id === rule.sourceId)! }))
  const relevant = revealedRules.filter(rule => rule.role !== 'insufficient')
  const explained = session.reflection.trim().length >= 10
  let score: 0 | 1 | 2 | 3 = 0
  let scoreExplanation = 'Hãy xem bằng chứng và nói điều gì khiến bạn đổi hoặc giữ lựa chọn.'
  if (revealedRules.length > 0) {
    score = 1
    scoreExplanation = 'Bạn đã tìm thêm một nguồn trước khi quyết định.'
  }
  if (relevant.length > 0 && explained) {
    score = 2
    scoreExplanation = 'Bạn đã xem nguồn có liên quan và giải thích quyết định bằng lời của mình.'
  }
  if (relevant.length >= 2 && explained && independentSources(scenario, relevant.map(rule => rule.source.id))) {
    score = 3
    scoreExplanation = 'Bạn đã đối chiếu các nguồn độc lập và giải thích quyết định.'
  }
  if (scenario.schoolLevel === 'primary') {
    scoreExplanation = [
      'Hãy xem một nguồn rồi nói vì sao em chọn vậy.',
      'Em đã xem thêm một nguồn.',
      'Em đã xem nguồn và viết lý do.',
      'Em đã so hai nguồn và viết lý do.',
    ][score]
  }
  return { correct: session.finalBelief === expectedBelief(scenario.truthStatus), score, scoreExplanation, revealedRules }
}

export function validateScenario(scenario: Scenario): string[] {
  const errors: string[] = []
  const ids = new Set(scenario.sources.map(source => source.id))
  const [minimumSources, maximumSources] = scenario.schoolLevel === 'primary' ? [3, 5]
    : scenario.schoolLevel === 'high' ? [4, 8] : [5, 8]
  if (scenario.sources.length < minimumSources || scenario.sources.length > maximumSources) {
    errors.push(`Số nguồn của cấp học này phải từ ${minimumSources} đến ${maximumSources}.`)
  }
  if (ids.size !== scenario.sources.length) errors.push('ID nguồn bị trùng.')
  for (const source of scenario.sources) {
    if (!source.author || !source.publishedAt || !source.content) errors.push('Nguồn ' + source.id + ' thiếu thông tin.')
    for (const cited of source.citesSourceIds) if (!ids.has(cited)) errors.push('Nguồn ' + source.id + ' dẫn đến ID không tồn tại: ' + cited + '.')
  }
  for (const rule of scenario.evidenceRules) if (!ids.has(rule.sourceId)) errors.push('Quy tắc tham chiếu ID không tồn tại: ' + rule.sourceId + '.')
  if (scenario.evidenceRules.length !== scenario.sources.length) errors.push('Mỗi nguồn phải có một quy tắc bằng chứng.')
  if (scenario.hints.length < 3) errors.push('Cần ít nhất ba gợi ý.')
  if (!scenario.feedback?.explanation || scenario.feedback.questions?.length !== 2) errors.push('Cần lời giải thích và hai câu hỏi gợi mở.')
  return errors
}
