import scenarioData from './scenarios.json' with { type: 'json' }
import { additionalScenarios } from './scenarios-extra.ts'
import { primaryScenarios, highScenarios } from './level-scenarios.ts'
import type { Scenario, SchoolLevel } from './types'

export const SCHOOL_LEVELS: Array<{ id: SchoolLevel; label: string; grades: string; description: string }> = [
  { id: 'primary', label: 'Tiểu học', grades: 'Lớp 3–5', description: 'Tin ngắn về trường lớp, bạn bè; bằng chứng dễ kiểm tra.' },
  { id: 'middle', label: 'THCS', grades: 'Lớp 6–9', description: 'Tin trong nhóm lớp, hoạt động ở trường và nguồn cần đối chiếu.' },
  { id: 'high', label: 'THPT', grades: 'Lớp 10–12', description: 'Thông tin công, tuyển sinh và truyền thông với nhiều loại nguồn.' },
]

const middleScenarios: Scenario[] = [
  ...(scenarioData as Omit<Scenario, 'schoolLevel'>[]).map(item => ({ ...item, schoolLevel: 'middle' as const, ageBand: 'Lớp 6–9' })),
  ...additionalScenarios,
]

export const scenarios: Scenario[] = [...primaryScenarios, ...middleScenarios, ...highScenarios]

export function scenariosForLevel(level: SchoolLevel): Scenario[] {
  return scenarios.filter(scenario => scenario.schoolLevel === level)
}

export function levelForScenario(id: string): SchoolLevel | null {
  return scenarios.find(scenario => scenario.id === id)?.schoolLevel ?? null
}

export function chooseCatalogLevel(savedLevel: string | null, sessionScenarioId: string | null): SchoolLevel {
  if (SCHOOL_LEVELS.some(level => level.id === savedLevel)) return savedLevel as SchoolLevel
  return sessionScenarioId ? levelForScenario(sessionScenarioId) ?? 'middle' : 'middle'
}
