import assert from 'node:assert/strict'
import { SCHOOL_LEVELS, chooseCatalogLevel, scenarios as allScenarios, scenariosForLevel, levelForScenario } from '../src/catalog.ts'
import {
  SCHEDULE_SCENARIO_ID, QUESTION_OPTIONS, canAdvance, evaluate, evidenceOptions,
  expectedBelief, independentSources, newSession, requestEvidence, validateScenario,
  reasonOptions, chooseInitialBelief,
} from '../src/logic.ts'

const scenarios = scenariosForLevel('middle')
assert.equal(scenarios.length, 12, 'The demo should contain twelve playable scenarios')
assert.deepEqual(SCHOOL_LEVELS.map(level => level.id), ['primary', 'middle', 'high'])
assert.equal(allScenarios.length, 36, 'The demo should contain thirty-six scenarios')
assert.equal(chooseCatalogLevel('high', scenariosForLevel('middle')[0].id), 'high', 'Chosen catalog level should survive another level\'s saved session')
assert.equal(chooseCatalogLevel(null, scenariosForLevel('primary')[0].id), 'primary', 'Saved session should set initial level')
assert.equal(chooseCatalogLevel('unknown', null), 'middle')
for (const level of SCHOOL_LEVELS) {
  assert.equal(scenariosForLevel(level.id).length, 12, `Expected twelve scenarios for ${level.id}`)
}
const globalIds = new Set()
const globalSourceIds = new Set()
for (const scenario of allScenarios) {
  assert.equal(levelForScenario(scenario.id), scenario.schoolLevel)
  assert.ok(!globalIds.has(scenario.id), `Duplicate scenario: ${scenario.id}`)
  globalIds.add(scenario.id)
  assert.deepEqual(validateScenario(scenario), [], `Invalid scenario: ${scenario.id}`)
  assert.equal(scenario.feedback.questions.length, 2)
  assert.ok(scenario.feedback.questions.every(question => question.endsWith('?')))
  assert.match(scenario.feedback.questions[1], /^Nếu\b/i)
  const decisiveRole = scenario.truthStatus === 'verified' ? 'supports' : scenario.truthStatus === 'insufficient' ? 'insufficient' : 'refutes'
  assert.ok(scenario.evidenceRules.some(rule => rule.role === decisiveRole), `Missing decisive source: ${scenario.id}`)
  const sourceId = scenario.evidenceRules.find(rule => rule.role === decisiveRole).sourceId
  const finalBelief = expectedBelief(scenario.truthStatus)
  const session = { ...newSession(scenario.id), finalBelief, revealedSourceIds: [sourceId], reflection: 'Em đã kiểm tra đúng ngày và người tạo nguồn.' }
  assert.equal(evaluate(scenario, session).correct, true, `Correct answer rejected: ${scenario.id}`)
  assert.equal(evaluate(scenario, { ...session, finalBelief: finalBelief === 'believe' ? 'disbelieve' : 'believe' }).correct, false)
  assert.equal(evidenceOptions(scenario).length, scenario.sources.length)
  for (const source of scenario.sources) {
    assert.ok(!globalSourceIds.has(source.id), `Duplicate source: ${source.id}`)
    globalSourceIds.add(source.id)
  }
}
for (const scenario of scenariosForLevel('primary')) {
  assert.equal(scenario.ageBand, 'Lớp 3–5')
  assert.equal(scenario.sources.length, 3, `Primary content should be concise: ${scenario.id}`)
  assert.ok(scenario.claim.split(/\s+/).length <= 32, `Long primary claim: ${scenario.id}`)
  for (const source of scenario.sources) {
    assert.ok(['message', 'image', 'official'].includes(source.type), `Complex primary source: ${source.id}`)
    assert.ok(source.content.split(/\s+/).length <= 45, `Long primary source: ${source.id}`)
  }
  const example = { ...newSession(scenario.id), finalBelief: expectedBelief(scenario.truthStatus), revealedSourceIds: [scenario.sources[1].id], reflection: 'Em hỏi cô về ngày mở cửa.' }
  assert.match(evaluate(scenario, example).scoreExplanation, /^Em /)
}
const highSourceTypes = new Set()
for (const scenario of scenariosForLevel('high')) {
  assert.equal(scenario.ageBand, 'Lớp 10–12')
  assert.equal(scenario.sources.length, 4)
  for (const source of scenario.sources) highSourceTypes.add(source.type)
}
for (const type of ['image', 'video', 'legal', 'article', 'social']) {
  assert.ok(highSourceTypes.has(type), `Missing high-school evidence type: ${type}`)
}
assert.ok(scenariosForLevel('high').every(item => !/Bộ Giáo dục|Chính phủ|nghệ sĩ thật/i.test(item.claim)))
assert.deepEqual(new Set(scenarios.map(item => item.truthStatus)), new Set(['verified', 'false', 'misleading', 'insufficient']))
const expectedNewCases = new Map([
  ['can-tin-tang-gia', 'misleading'],
  ['clb-lap-trinh', 'verified'],
  ['giai-bong-ro', 'false'],
  ['xe-dua-don', 'verified'],
  ['do-that-lac', 'false'],
  ['ngay-hoi-khoa-hoc', 'misleading'],
  ['trong-cay-hoan', 'insufficient'],
])
for (const [id, status] of expectedNewCases) {
  assert.equal(scenarios.find(item => item.id === id)?.truthStatus, status, 'New scenario missing or has wrong status: ' + id)
}

const allIds = new Set()
for (const scenario of scenarios) {
  assert.deepEqual(validateScenario(scenario), [], 'Invalid scenario ' + scenario.id)
  assert.equal(scenario.sources.length, 6, scenario.id)
  assert.equal(scenario.evidenceRules.length, 6, scenario.id)
  assert.equal(scenario.variantClaims.length, 2, scenario.id)
  assert.equal(evidenceOptions(scenario).length, 6, scenario.id)
  assert.ok(scenario.teacherNotes.length > 80, scenario.id)
  assert.ok(scenario.feedback.explanation.length >= 50, 'Missing student-friendly explanation: ' + scenario.id)
  assert.equal(scenario.feedback.questions.length, 2, 'Each scenario needs two reflection questions: ' + scenario.id)
  assert.ok(scenario.feedback.questions.every(question => question.endsWith('?')), 'Reflection prompts must be questions: ' + scenario.id)
  assert.match(scenario.feedback.questions[1], /^Nếu\b/i, 'Second reflection question should change a premise: ' + scenario.id)
  const decisiveRole = scenario.truthStatus === 'verified' ? 'supports' : scenario.truthStatus === 'insufficient' ? 'insufficient' : 'refutes'
  assert.ok(scenario.evidenceRules.some(rule => rule.role === decisiveRole), 'No decisive evidence role: ' + scenario.id)
  const decisiveSourceId = scenario.evidenceRules.find(rule => rule.role === decisiveRole).sourceId
  const correctBelief = expectedBelief(scenario.truthStatus)
  const answered = {
    ...newSession(scenario.id), stage: 'feedback', revealedSourceIds: [decisiveSourceId],
    finalBelief: correctBelief, reflection: 'Em dựa vào nguồn có ngày và phạm vi rõ ràng.',
  }
  assert.equal(evaluate(scenario, answered).correct, true, 'Correct verdict rejected: ' + scenario.id)
  const wrongBelief = correctBelief === 'believe' ? 'disbelieve' : 'believe'
  assert.equal(evaluate(scenario, { ...answered, finalBelief: wrongBelief }).correct, false, 'Incorrect verdict accepted: ' + scenario.id)
  for (const source of scenario.sources) {
    assert.ok(!allIds.has(source.id), 'Duplicate global source ID: ' + source.id)
    allIds.add(source.id)
    assert.ok(source.content.split(/\s+/).length >= 25, 'Short source: ' + source.id)
    assert.match(source.publishedAt, /^\d{4}-\d{2}-\d{2}$/, source.id)
    assert.ok(!/https?:\/\//i.test(source.content), 'External link in ' + source.id)
  }
}

const generic = scenarios[0]
let game = newSession(generic.id)
assert.equal(canAdvance(game), false, 'Initial belief is required')
const believeReasons = reasonOptions('believe')
const unsureReasons = reasonOptions('unsure')
const disbelieveReasons = reasonOptions('disbelieve')
assert.equal(believeReasons.length, 4)
assert.equal(unsureReasons.length, 4)
assert.equal(disbelieveReasons.length, 4)
assert.notDeepEqual(believeReasons.map(item => item.label), unsureReasons.map(item => item.label))
assert.notDeepEqual(unsureReasons.map(item => item.label), disbelieveReasons.map(item => item.label))
assert.match(believeReasons[0].label, /đáng tin/i)
assert.match(unsureReasons[1].label, /bằng chứng/i)
assert.match(disbelieveReasons[2].label, /nguồn|dẫn lại/i)
for (const belief of ['believe', 'unsure', 'disbelieve']) {
  const primaryReasons = reasonOptions(belief, 'primary')
  const highReasons = reasonOptions(belief, 'high')
  assert.equal(primaryReasons.length, 4)
  assert.equal(highReasons.length, 4)
  assert.notDeepEqual(primaryReasons.map(item => item.label), reasonOptions(belief, 'middle').map(item => item.label))
  assert.notDeepEqual(highReasons.map(item => item.label), primaryReasons.map(item => item.label))
  assert.ok(primaryReasons.every(item => item.label.split(/\s+/).length <= 10), 'Primary reasons should stay short')
}
game = chooseInitialBelief(game, 'unsure')
assert.equal(canAdvance(game), true)
const revisedInitialBelief = chooseInitialBelief({
  ...game, reasonChoice: 'unclear', stage: 'stop', revealedSourceIds: [generic.sources[0].id],
  finalBelief: 'believe', reflection: 'Tôi đã xem một nguồn.'
}, 'believe')
assert.equal(revisedInitialBelief.reasonChoice, null, 'Changing belief should clear the old reason')
assert.deepEqual(revisedInitialBelief.revealedSourceIds, [], 'Changing belief should clear later evidence')
assert.equal(revisedInitialBelief.finalBelief, null, 'Changing belief should clear the final answer')
game = { ...game, stage: 'reason' }
assert.equal(canAdvance(game), false, 'Reason choice is required')
game = { ...game, reasonChoice: 'unclear', stage: 'evidence' }
assert.equal(canAdvance(game), false, 'Evidence is required')
const genericOption = evidenceOptions(generic)[0]
game = requestEvidence(game, generic, genericOption.id)
assert.deepEqual(game.revealedSourceIds, [genericOption.sourceId], 'Only the requested source should be revealed')
game = requestEvidence(game, generic, genericOption.id)
assert.equal(game.revealedSourceIds.length, 1, 'Repeated requests should not duplicate a source')
assert.equal(canAdvance(game), true)
game = { ...game, stage: 'conclude', finalBelief: 'disbelieve' }
assert.equal(canAdvance(game), false, 'The one final reflection is required')
game = { ...game, reflection: 'Nguồn này chưa ghi rõ ngày và người nói.' }
assert.equal(canAdvance(game), true)

assert.equal(expectedBelief('verified'), 'believe')
assert.equal(expectedBelief('insufficient'), 'unsure')
assert.equal(expectedBelief('false'), 'disbelieve')
assert.equal(expectedBelief('misleading'), 'disbelieve')

const schedule = scenarios.find(item => item.id === SCHEDULE_SCENARIO_ID)
assert.ok(schedule, 'Missing new schedule scenario')
assert.match(schedule.claim, /mang vở Văn/i)
assert.match(schedule.claim, /chưa có thông báo chính thức/i)
assert.equal(schedule.truthStatus, 'verified')
assert.equal(QUESTION_OPTIONS.length, 3)
const messageOption = evidenceOptions(schedule).find(item => item.contactMethod === 'message')
const callOption = evidenceOptions(schedule).find(item => item.contactMethod === 'call')
assert.equal(messageOption?.label, 'Nhắn tin hỏi cô')
assert.equal(callOption?.label, 'Gọi điện hỏi cô')
assert.match(schedule.sources.find(item => item.id === messageOption.sourceId).content, /05\/10/)
assert.match(schedule.sources.find(item => item.id === callOption.sourceId).content, /05\/10/)

const beforeQuestion = newSession(schedule.id)
assert.equal(requestEvidence(beforeQuestion, schedule, messageOption.id), beforeQuestion, 'Contact requires a chosen question')
const withQuestion = { ...beforeQuestion, stage: 'evidence', questionChoice: QUESTION_OPTIONS[0] }
const groupOnly = requestEvidence(withQuestion, schedule, 'tkb-nhom-lop')
assert.deepEqual(groupOnly.revealedSourceIds, ['tkb-nhom-lop'])
assert.equal(canAdvance(groupOnly), false, 'Group silence alone must not complete the schedule investigation')
assert.equal(requestEvidence(groupOnly, schedule, 'tkb-nhom-cap-nhat'), groupOnly, 'Later notice cannot appear before contact')
const falseClaimFromSilence = evaluate(schedule, { ...groupOnly, finalBelief: 'disbelieve', reflection: 'Nhóm chưa đăng nên em nghĩ lời bạn chắc chắn sai.' })
assert.equal(falseClaimFromSilence.correct, false, 'No announcement must not imply the friend is wrong')
assert.equal(falseClaimFromSilence.score, 1, 'Group silence is not positive evidence')

for (const option of [messageOption, callOption]) {
  const afterContact = requestEvidence(withQuestion, schedule, option.id)
  assert.deepEqual(afterContact.revealedSourceIds, [option.sourceId])
  assert.equal(afterContact.contactMethod, option.contactMethod)
  assert.equal(canAdvance(afterContact), true)
  const afterUpdate = requestEvidence(afterContact, schedule, 'tkb-nhom-cap-nhat')
  assert.deepEqual(afterUpdate.revealedSourceIds, [option.sourceId, 'tkb-nhom-cap-nhat'])
  const result = evaluate(schedule, { ...afterContact, finalBelief: 'believe', reflection: 'Em hỏi trực tiếp cô về lịch thứ Hai nên đã rõ.' })
  assert.equal(result.correct, true)
  assert.ok(result.score >= 2)
}
assert.equal(independentSources(schedule, ['tkb-co-nhan', 'tkb-co-goi']), false, 'Two responses from the same teacher are not independent')
assert.equal(independentSources(schedule, ['tkb-co-nhan', 'tkb-nhom-cap-nhat']), false, 'Teacher reply and teacher announcement share an origin')

console.log('All 36 scenarios, age levels, choice gates, evidence reveals, schedule contact paths, and scoring checks passed.')
