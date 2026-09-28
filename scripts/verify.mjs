import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { evaluate, newSession, validateScenario } from '../src/logic.ts'

const scenarios = JSON.parse(readFileSync(new URL('../src/scenarios.json', import.meta.url), 'utf8'))
const expected = new Map([
  ['nghi-hoc-ngay-mai', { status: 'false', sources: ['nghi-hoc-3', 'nghi-hoc-4'] }],
  ['thu-vien-thu-bay', { status: 'verified', sources: ['src1', 'src6'] }],
  ['doi-gio-hoc', { status: 'misleading', sources: ['source-1', 'source-6'] }],
  ['hoc-bong-chua-ro', { status: 'insufficient', sources: ['src-001', 'src-002'] }],
])

assert.equal(scenarios.length, 4)
assert.deepEqual(new Set(scenarios.map(item => item.truthStatus)), new Set(['verified', 'false', 'misleading', 'insufficient']))

const globalSourceIds = new Set()
for (const scenario of scenarios) {
  const caseExpected = expected.get(scenario.id)
  assert.ok(caseExpected, `Unexpected scenario ${scenario.id}`)
  assert.equal(scenario.truthStatus, caseExpected.status)
  assert.deepEqual(validateScenario(scenario), [], `Invalid scenario ${scenario.id}`)
  assert.equal(scenario.sources.length, 6)
  assert.equal(scenario.evidenceRules.length, 6)
  assert.equal(scenario.variantClaims.length, 2)
  assert.ok(scenario.teacherNotes.length > 80)
  for (const source of scenario.sources) {
    assert.ok(!globalSourceIds.has(source.id), `Duplicate source ID ${source.id}`)
    globalSourceIds.add(source.id)
    assert.ok(source.content.split(/\s+/).length >= 25, `Short source ${source.id}`)
    assert.match(source.publishedAt, /^\d{4}-\d{2}-\d{2}$/)
    assert.ok(!/https?:\/\//i.test(source.content), `External link in ${source.id}`)
  }

  const session = newSession(scenario.id)
  session.initialAction = 'wait'
  const answer = {
    status: caseExpected.status,
    sourceIds: caseExpected.sources,
    reasoning: 'Hai tài liệu được chọn cho biết phạm vi và thời điểm cụ thể; tôi đối chiếu với tuyên bố để tránh suy luận quá mức.',
    limitation: 'Mỗi nguồn chỉ nói về phạm vi và thời điểm đã ghi; cần kiểm tra bản cập nhật mới hơn nếu có.',
    finalAction: 'wait',
  }
  const result = evaluate(scenario, session, answer)
  assert.equal(result.correct, true, `${scenario.id} should accept its standard status`)
  assert.ok(result.score >= 2, `${scenario.id} should reward a sourced explanation`)
  assert.equal(result.selectedRules.length, 2)
  console.log(`${scenario.id}: ${scenario.truthStatus}, ${scenario.sources.length} sources, score ${result.score}/3`)
}

const scholarship = scenarios.find(item => item.id === 'hoc-bong-chua-ro')
const incorrect = evaluate(scholarship, newSession(scholarship.id), {
  status: 'false', sourceIds: ['src-002'], reasoning: 'Không thấy thông báo nên chắc chắn tin này là sai hoàn toàn.', limitation: '', finalAction: 'wait',
})
assert.equal(incorrect.correct, false, 'No announcement must not imply the scholarship claim is false')

const lowScore = evaluate(scenarios[0], newSession(scenarios[0].id), {
  status: 'verified', sourceIds: ['nghi-hoc-2'], reasoning: 'Nhiều người chia sẻ tin này.', limitation: '', finalAction: 'share',
})
assert.equal(lowScore.score, 0, 'Rumor-only guess should score zero')
console.log('All scenario, reference, and scoring checks passed.')
