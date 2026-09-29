import { useEffect, useState } from 'react'
import { SCHOOL_LEVELS, chooseCatalogLevel, levelForScenario, scenarios, scenariosForLevel } from './catalog'
import {
  BELIEF_LABELS, QUESTION_OPTIONS, SCHEDULE_SCENARIO_ID,
  SOURCE_TYPE_LABELS, STATUS_LABELS, canAdvance, chooseInitialBelief, evaluate, evidenceOptions,
  expectedBelief, newSession, reasonOptions, requestEvidence, validateScenario,
} from './logic'
import type { Belief, GameSession, ReasonChoice, SchoolLevel, Stage } from './types'

const STORAGE_KEY = 'dung-xem-hoi-demo-session-v2'
const LEVEL_STORAGE_KEY = 'dung-xem-hoi-demo-school-level-v1'
const LEGACY_STORAGE_KEY = 'dung-xem-hoi-demo-session-v1'
const STAGES: Stage[] = ['stop', 'reason', 'evidence', 'conclude', 'feedback']
const STAGE_LABELS = ['Dừng', 'Vì sao?', 'Tìm bằng chứng', 'Quyết định lại', 'Phản hồi']
const BELIEF_ORDER: Belief[] = ['believe', 'unsure', 'disbelieve']
const REASON_ORDER: ReasonChoice[] = ['enough', 'missing', 'unclear', 'outdated']

function loadSession(): GameSession | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return null
    const value = JSON.parse(saved) as GameSession
    if (!scenarios.some(item => item.id === value.scenarioId)) return null
    if (!STAGES.includes(value.stage) || !Array.isArray(value.revealedSourceIds)) return null
    if (typeof value.reflection !== 'string') return null
    if (value.initialBelief !== null && !BELIEF_ORDER.includes(value.initialBelief)) return null
    if (value.finalBelief !== null && !BELIEF_ORDER.includes(value.finalBelief)) return null
    if (value.reasonChoice !== null && !REASON_ORDER.includes(value.reasonChoice)) return null
    if (value.questionChoice !== null && !QUESTION_OPTIONS.includes(value.questionChoice as typeof QUESTION_OPTIONS[number])) return null
    if (value.contactMethod !== null && value.contactMethod !== 'message' && value.contactMethod !== 'call') return null
    const scenario = scenarios.find(item => item.id === value.scenarioId)!
    if (value.revealedSourceIds.some(id => !scenario.sources.some(source => source.id === id))) return null
    if (!Number.isInteger(value.variantIndex) || value.variantIndex < -1 || value.variantIndex >= scenario.variantClaims.length) return null
    return value
  } catch {
    return null
  }
}

function loadSelectedLevel(): SchoolLevel {
  try {
    return chooseCatalogLevel(localStorage.getItem(LEVEL_STORAGE_KEY), loadSession()?.scenarioId ?? null)
  } catch { /* Storage may be unavailable in private mode. */ }
  return chooseCatalogLevel(null, loadSession()?.scenarioId ?? null)
}

function formattedDate(date: string): string {
  const [year, month, day] = date.split('-')
  return day + '/' + month + '/' + year
}

function BeliefChoices({ value, onChange, name }: {
  value: Belief | null
  onChange: (belief: Belief) => void
  name: string
}) {
  return <div className="belief-choices" role="radiogroup" aria-label={name}>
    {BELIEF_ORDER.map(belief => <label className={'choice ' + (value === belief ? 'selected' : '')} key={belief}>
      <input type="radio" name={name} checked={value === belief} onChange={() => onChange(belief)} />
      <span>{BELIEF_LABELS[belief]}</span>
    </label>)}
  </div>
}

function App() {
  const [session, setSession] = useState<GameSession | null>(loadSession)
  const [page, setPage] = useState<'catalog' | 'game' | 'teacher'>(() => loadSession() ? 'game' : 'catalog')
  const [selectedLevel, setSelectedLevel] = useState<SchoolLevel>(loadSelectedLevel)
  const [teacherScenarioId, setTeacherScenarioId] = useState(scenariosForLevel('middle')[0]?.id ?? '')
  const [activeSourceId, setActiveSourceId] = useState<string | null>(null)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    try {
      localStorage.removeItem(LEGACY_STORAGE_KEY)
      if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
      else localStorage.removeItem(STORAGE_KEY)
    } catch {
      setNotice('Trình duyệt không lưu được phiên. Bạn vẫn có thể chơi trong tab này.')
    }
  }, [session])

  useEffect(() => {
    try { localStorage.setItem(LEVEL_STORAGE_KEY, selectedLevel) } catch { /* Playing still works without storage. */ }
  }, [selectedLevel])

  const scenario = session ? scenarios.find(item => item.id === session.scenarioId) ?? null : null
  const displayedScenarios = scenariosForLevel(selectedLevel)
  const levelInfo = SCHOOL_LEVELS.find(level => level.id === selectedLevel)!
  const teacherScenario = scenarios.find(item => item.id === teacherScenarioId) ?? scenarios[0]
  const claim = scenario && session && session.variantIndex >= 0
    ? scenario.variantClaims[session.variantIndex] : scenario?.claim
  const activeSource = scenario && session
    ? scenario.sources.find(source => source.id === (activeSourceId ?? session.revealedSourceIds.at(-1))) : null
  const evaluation = scenario && session?.stage === 'feedback' ? evaluate(scenario, session) : null

  function update(patch: Partial<GameSession>) {
    setSession(previous => previous ? { ...previous, ...patch } : null)
  }

  function startScenario(id: string, variantIndex = -1) {
    const level = levelForScenario(id)
    if (level) setSelectedLevel(level)
    setSession(newSession(id, variantIndex))
    setPage('game')
    setActiveSourceId(null)
    setNotice('')
    window.scrollTo(0, 0)
  }

  function resetSession() {
    setSession(null)
    setPage('catalog')
    setActiveSourceId(null)
    setNotice('Đã xóa phiên chơi trong trình duyệt này.')
  }

  function advance() {
    if (!session || !canAdvance(session)) {
      setNotice(session?.stage === 'evidence' && scenario?.id === SCHEDULE_SCENARIO_ID
        ? 'Hãy chọn câu hỏi, rồi nhắn tin hoặc gọi điện hỏi cô để kiểm chứng.'
        : session?.stage === 'conclude'
          ? 'Hãy chọn lại Tin / Chưa chắc / Không tin và viết ít nhất 10 ký tự giải thích.'
          : 'Hãy chọn một phương án trước khi đi tiếp.')
      return
    }
    const next = STAGES[STAGES.indexOf(session.stage) + 1]
    if (next) update({ stage: next })
    setNotice('')
    window.scrollTo(0, 0)
  }

  function reveal(optionId: string) {
    if (!session || !scenario) return
    const option = evidenceOptions(scenario).find(item => item.id === optionId)
    if (!option) return
    if (option.contactMethod && !session.questionChoice) {
      setNotice('Trước tiên hãy chọn câu bạn muốn hỏi cô.')
      return
    }
    if (scenario.id === SCHEDULE_SCENARIO_ID && optionId === 'tkb-nhom-cap-nhat' && !session.contactMethod) {
      setNotice('Thông báo này được đăng sau khi cô trả lời. Hãy hỏi cô trước.')
      return
    }
    setSession(previous => previous ? requestEvidence(previous, scenario, optionId) : null)
    setActiveSourceId(option.sourceId)
    setNotice('')
  }

  return <div className="app-shell">
    <header className="site-header"><div className="header-inner">
      <button className="brand" type="button" onClick={() => setPage('catalog')} aria-label="Về danh sách màn chơi">
        <span className="brand-symbol" aria-hidden="true">✳</span><span>DỪNG <b>·</b> XEM <b>·</b> HỎI</span>
      </button>
      <nav className="top-nav" aria-label="Điều hướng chính">
        <button className={page === 'catalog' ? 'nav-active' : ''} type="button" onClick={() => setPage('catalog')}>Chọn màn</button>
        {session && <button className={page === 'game' ? 'nav-active' : ''} type="button" onClick={() => setPage('game')}>Phiên đang chơi</button>}
        <button className={page === 'teacher' ? 'nav-active' : ''} type="button" onClick={() => setPage('teacher')}>Góc giáo viên</button>
      </nav>
    </div></header>

    <main id="main-content">
      <div className="mode-strip"><span className="mode-pill"><span className="live-dot" />Tình huống mô phỏng · chơi bằng lựa chọn</span><span className="mode-muted">Không cần tài khoản hoặc khóa API</span></div>
      {notice && <div className="notice" role="alert">{notice}</div>}

      {page === 'catalog' && <>
        <section className="hero"><div><p className="eyebrow">TRÒ CHƠI KIỂM CHỨNG THÔNG TIN</p>
          <h1>Dừng lại.<br /><em>Hỏi cho rõ.</em></h1>
          <p className="hero-copy">Một tin nhắn nghe rất thật. Bạn sẽ tin, chưa chắc hay không tin? Chọn điều cần hỏi, xem bằng chứng rồi quyết định lại.</p>
          <div className="hero-badges"><span>12 màn mỗi cấp học</span><span>Chỉ viết một câu ở cuối</span><span>Tiến trình lưu trên máy</span></div>
        </div><div className="hero-art" aria-hidden="true"><div className="art-card art-card-back">TIN NHẮN <span>?</span></div><div className="art-card art-card-front"><span className="art-glass">⌕</span><span>HỎI TRƯỚC<br />KHI TIN</span></div></div></section>
        <section className="section-heading level-heading"><div><p className="eyebrow">BẮT ĐẦU</p><h2>Chọn cấp học</h2></div><p>Mỗi cấp có 12 tình huống riêng. Mọi nhân vật và tài liệu đều được mô phỏng.</p></section>
        <fieldset className="school-levels"><legend className="sr-only">Chọn cấp học</legend>{SCHOOL_LEVELS.map(level => <label
          className={'school-level ' + (selectedLevel === level.id ? 'selected' : '')} key={level.id}>
          <input className="level-radio" type="radio" name="school-level" value={level.id}
            checked={selectedLevel === level.id} onChange={() => setSelectedLevel(level.id)} />
          <span className="level-name">{level.label}</span><strong>{level.grades}</strong><span className="level-description">{level.description}</span>
          <span className="level-count">12 phần chơi <span aria-hidden="true">↗</span></span>
        </label>)}</fieldset>
        <section className="section-heading scenario-section-heading"><div><p className="eyebrow">{levelInfo.grades.toLocaleUpperCase('vi')}</p><h2>12 tình huống {levelInfo.label}</h2></div><p>{selectedLevel === 'high' ? 'Cơ quan, chính sách, điều khoản, báo và nghệ sĩ trong các màn THPT đều hư cấu.' : levelInfo.description}</p></section>
        <div className="scenario-grid">{displayedScenarios.map((item, index) => <article className="scenario-card" key={item.id}>
          <div className="card-top"><span className="card-number">{String(index + 1).padStart(2, '0')}</span><span className="tag">{levelInfo.grades}</span></div>
          <p className="card-topic">{item.topic} · {item.difficulty}</p><h3>{item.title}</h3><p>{item.learningGoal}</p>
          <div className="card-actions"><button className="primary-button" type="button" onClick={() => startScenario(item.id)}>Chơi màn này ↗</button>
            <button className="text-button" type="button" onClick={() => startScenario(item.id, Math.floor(Math.random() * item.variantClaims.length))}>Thử biến thể mẫu</button></div>
        </article>)}</div>
        {session && <div className="resume-panel"><span>Phiên đang chơi: <strong>{scenario?.title}</strong> · {scenario?.ageBand}</span><button className="secondary-button" type="button" onClick={() => setPage('game')}>Tiếp tục</button></div>}
      </>}

      {page === 'game' && scenario && session && <>
        <div className="game-heading"><div><p className="eyebrow">{scenario.ageBand.toLocaleUpperCase('vi')} / {scenario.topic.toLocaleUpperCase('vi')}</p><h1>{scenario.title}</h1></div><button className="quiet-button" type="button" onClick={resetSession}>Xóa phiên</button></div>
        {scenario.schoolLevel === 'high' && <p className="simulation-note">Chính sách, điều khoản, tổ chức, báo và nhân vật ở màn này đều là mô phỏng. Video và ảnh được trình bày bằng mô tả hoặc bản chép lời.</p>}
        {session.variantIndex >= 0 && <p className="variant-label">Biến thể mẫu · cùng bộ bằng chứng</p>}
        <ol className="stepper">{STAGES.map((stage, index) => <li className={index === STAGES.indexOf(session.stage) ? 'current' : index < STAGES.indexOf(session.stage) ? 'done' : ''} key={stage}><span>{index + 1}</span>{STAGE_LABELS[index]}</li>)}</ol>

        {session.stage === 'stop' && <div className="game-layout">
          <section className="panel story-panel"><p className="eyebrow">01 / DỪNG</p><div className="fake-post"><div className="post-author"><span className="avatar">?</span><div><strong>{scenario.id === SCHEDULE_SCENARIO_ID ? 'Tin nhắn từ một người bạn' : 'Thông tin bạn vừa nhận'}</strong><small>Trong tình huống mô phỏng · chưa kiểm chứng</small></div></div><p>{claim}</p></div>
            {scenario.id === SCHEDULE_SCENARIO_ID && <p className="context-note">Trên nhóm lớp chưa có thông báo chính thức từ cô giáo về việc đổi thời khóa biểu.</p>}</section>
          <section className="panel decision-panel"><p className="eyebrow">QUYẾT ĐỊNH BAN ĐẦU</p><h2>Bạn nghĩ sao?</h2><p>Chọn cảm nhận lúc mới đọc tin. Bạn được đổi ý sau khi xem bằng chứng.</p>
            <BeliefChoices name="initial-belief" value={session.initialBelief} onChange={initialBelief => setSession(previous => previous ? chooseInitialBelief(previous, initialBelief) : null)} />
            <button className="primary-button full-button" type="button" onClick={advance}>Tiếp tục →</button></section>
        </div>}

        {session.stage === 'reason' && <div className="single-step"><section className="panel">
          <p className="eyebrow">02 / VÌ SAO?</p><h2>Điều gì khiến bạn chọn “{session.initialBelief ? BELIEF_LABELS[session.initialBelief] : ''}”?</h2>
          <p>Chọn lý do gần với suy nghĩ của bạn nhất.</p>
          <div className="choice-stack" role="radiogroup" aria-label="Lý do ban đầu">{(session.initialBelief ? reasonOptions(session.initialBelief, scenario.schoolLevel) : []).map(reason => <label className={'choice ' + (session.reasonChoice === reason.id ? 'selected' : '')} key={reason.id}>
            <input type="radio" name="reason" checked={session.reasonChoice === reason.id} onChange={() => update({ reasonChoice: reason.id })} /><span>{reason.label}</span>
          </label>)}</div>
          <div className="step-actions"><button className="secondary-button" type="button" onClick={() => update({ stage: 'stop' })}>← Quay lại</button><button className="primary-button" type="button" onClick={advance}>Chọn bằng chứng →</button></div>
        </section></div>}

        {session.stage === 'evidence' && <div className="evidence-layout">
          <section className="panel"><p className="eyebrow">03 / TÌM BẰNG CHỨNG</p><h2>Bạn muốn kiểm tra điều gì?</h2><p>Chọn một nguồn để xem. Bạn có thể hỏi thêm trước khi quyết định lại.</p>
            {scenario.id === SCHEDULE_SCENARIO_ID && <fieldset className="question-field"><legend>Bạn sẽ hỏi cô câu gì?</legend><div className="choice-stack">
              {QUESTION_OPTIONS.map(question => <label className={'choice ' + (session.questionChoice === question ? 'selected' : '')} key={question}><input type="radio" name="teacher-question" checked={session.questionChoice === question} disabled={session.contactMethod !== null} onChange={() => update({ questionChoice: question })} /><span>{question}</span></label>)}
            </div></fieldset>}
            <div className="evidence-options">{evidenceOptions(scenario).map(option => <button
              className={'evidence-option ' + (session.revealedSourceIds.includes(option.sourceId) ? 'opened' : '')}
              type="button" key={option.id} onClick={() => reveal(option.id)}>
              <span>{option.label}</span><small>{session.revealedSourceIds.includes(option.sourceId) ? '✓ Đã xem' : option.contactMethod ? 'Hành động mô phỏng' : 'Xem bằng chứng'}</small>
            </button>)}</div>
            <div className="step-actions"><button className="secondary-button" type="button" onClick={() => update({ stage: 'reason' })}>← Quay lại</button><button className="primary-button" type="button" onClick={advance}>Quyết định lại →</button></div>
          </section>
          <aside className="panel revealed-panel" aria-live="polite">
            {activeSource && session.revealedSourceIds.includes(activeSource.id) ? <>
              <p className="eyebrow">BẰNG CHỨNG MÔ PHỎNG · {SOURCE_TYPE_LABELS[activeSource.type].toLocaleUpperCase('vi')}</p><h3>{activeSource.title}</h3>
              <p className="document-byline">Người tạo: <strong>{activeSource.author}</strong><br />Ngày: <strong>{formattedDate(activeSource.publishedAt)}</strong></p>
              {scenario.id === SCHEDULE_SCENARIO_ID && (activeSource.id === 'tkb-co-nhan' || activeSource.id === 'tkb-co-goi') && <p className="asked-question"><strong>Bạn hỏi:</strong> {session.questionChoice}</p>}
              {activeSource.type === 'image' || activeSource.type === 'video' || activeSource.type === 'legal'
                ? <div className={'source-artifact artifact-' + activeSource.type}>
                  <div className="artifact-kicker"><span aria-hidden="true">{activeSource.type === 'video' ? '▶' : activeSource.type === 'image' ? '▣' : '§'}</span>
                    {activeSource.type === 'video' ? 'Bản chép lời video mô phỏng' : activeSource.type === 'image' ? 'Mô tả ảnh mô phỏng' : 'Trích điều khoản giả định'}
                  </div>
                  <p className="document-content">{activeSource.content}</p>
                </div>
                : <p className="document-content">{activeSource.content}</p>}
              {activeSource.citesSourceIds.length > 0 && <p className="citation-note">Nguồn này dẫn lại: {activeSource.citesSourceIds.map(id => scenario.sources.find(source => source.id === id)?.title ?? id).join(', ')}.</p>}
              <p className="source-note">{activeSource.relevanceNote}</p>
            </> : <div className="document-empty"><span aria-hidden="true">⌕</span><h3>Chưa mở bằng chứng</h3><p>Chọn một điều bạn muốn kiểm tra ở bên trái.</p></div>}
            {session.revealedSourceIds.length > 1 && <div className="seen-sources"><strong>Xem lại nguồn đã mở</strong>{session.revealedSourceIds.map(id => {
              const source = scenario.sources.find(item => item.id === id)
              return source && <button type="button" key={id} onClick={() => setActiveSourceId(id)}>{source.title}</button>
            })}</div>}
          </aside>
        </div>}

        {session.stage === 'conclude' && <div className="single-step"><section className="panel conclusion-panel">
          <p className="eyebrow">04 / QUYẾT ĐỊNH LẠI</p><h2>Sau khi xem bằng chứng, bạn nghĩ sao?</h2><p className="claim-reminder">{claim}</p>
          <BeliefChoices name="final-belief" value={session.finalBelief} onChange={finalBelief => update({ finalBelief })} />
          <label className="field-label" htmlFor="reflection">{scenario.schoolLevel === 'primary' ? 'Vì sao em chọn như vậy?' : 'Điều gì khiến bạn giữ hoặc đổi lựa chọn?'}</label>
          <textarea id="reflection" rows={3} maxLength={300} value={session.reflection} onChange={event => update({ reflection: event.target.value })} placeholder={scenario.schoolLevel === 'primary' ? 'Ví dụ: Em đã hỏi cô…' : 'Viết ngắn bằng lời của bạn…'} />
          <p className="input-hint">{scenario.schoolLevel === 'primary' ? 'Em chỉ cần viết một câu ngắn, ví dụ: “Em hỏi cô.”' : 'Đây là phần duy nhất cần viết. Ít nhất 10 ký tự.'}</p>
          <div className="step-actions"><button className="secondary-button" type="button" onClick={() => update({ stage: 'evidence' })}>← Xem thêm bằng chứng</button><button className="primary-button" type="button" onClick={advance}>Nhận phản hồi →</button></div>
        </section></div>}

        {session.stage === 'feedback' && evaluation && <div className="feedback-layout"><div className="feedback-main">
          <section className={'panel result-panel ' + (evaluation.correct ? 'result-correct' : 'result-incorrect')}><p className="eyebrow">05 / PHẢN HỒI</p><div className="result-head"><div>
            <h2>{scenario.schoolLevel === 'primary' ? evaluation.correct ? 'Em chọn đúng.' : 'Em chọn sai.' : evaluation.correct ? 'Lựa chọn cuối của bạn đúng.' : 'Lựa chọn cuối của bạn sai.'}</h2>
            <p className={'verdict-line ' + (evaluation.correct ? 'verdict-correct' : 'verdict-incorrect')}>{scenario.schoolLevel === 'primary' ? 'Em chọn' : 'Bạn chọn'} <strong>{session.finalBelief ? BELIEF_LABELS[session.finalBelief] : '—'}</strong><span>{evaluation.correct ? 'ĐÚNG' : 'SAI'}</span></p>
            <p>{scenario.schoolLevel === 'primary' ? 'Câu trả lời nên chọn' : 'Đáp án phù hợp'}: <strong>{BELIEF_LABELS[expectedBelief(scenario.truthStatus)]} · {STATUS_LABELS[scenario.truthStatus]}</strong></p></div><div className="score-badge"><strong>{evaluation.score}<small>/3</small></strong><span>{scenario.schoolLevel === 'primary' ? 'điểm tìm hiểu' : 'điểm kiểm chứng'}</span></div></div>
            <p className="score-explanation">{evaluation.scoreExplanation}</p>
            <div className="comparison"><div><span>Ban đầu</span><strong>{session.initialBelief ? BELIEF_LABELS[session.initialBelief] : '—'}</strong><p>{session.initialBelief && session.reasonChoice ? reasonOptions(session.initialBelief, scenario.schoolLevel).find(option => option.id === session.reasonChoice)?.label : ''}</p></div>
              <div><span>Sau bằng chứng</span><strong>{session.finalBelief ? BELIEF_LABELS[session.finalBelief] : '—'}</strong><p>{session.reflection}</p></div></div>
            {session.initialBelief !== session.finalBelief && <p className="changed-note">{scenario.schoolLevel === 'primary' ? 'Em đã đổi ý sau khi xem nguồn.' : 'Bạn đã thay đổi lựa chọn sau khi xem bằng chứng.'}</p>}
            {scenario.id === SCHEDULE_SCENARIO_ID && <p className="safety-note">Chưa thấy thông báo trên nhóm lớp không chứng minh tin sai. Hỏi trực tiếp cô rồi xem thông báo cập nhật giúp xác nhận điều cần mang từ thứ Hai.</p>}
            {scenario.truthStatus === 'insufficient' && <p className="safety-note">Nếu vẫn chưa đủ bằng chứng, hãy chờ xác nhận từ nguồn gốc trước khi chia sẻ hoặc gửi thông tin cá nhân.</p>}
          </section>
          <section className="panel challenge-panel"><p className="eyebrow">XEM LẠI VÀ THỬ NGHĨ KHÁC</p><h2>{scenario.schoolLevel === 'primary' ? 'Điều gì có thể làm em đổi ý?' : 'Điều gì có thể làm bạn đổi ý?'}</h2>
            <p>{scenario.feedback.explanation}</p>
            <ol>{scenario.feedback.questions.map(question => <li key={question}>{question}</li>)}</ol>
          </section>
          <section className="panel evidence-profile"><p className="eyebrow">{scenario.schoolLevel === 'primary' ? 'NHỮNG ĐIỀU EM ĐÃ XEM' : 'NHỮNG NGUỒN BẠN ĐÃ XEM'}</p><h2>{scenario.schoolLevel === 'primary' ? 'Nguồn em đã xem' : 'Hồ sơ bằng chứng'}</h2><div className="rule-list">{evaluation.revealedRules.map(rule => <article className="rule-card" key={rule.source.id}><div className="rule-header"><strong>{rule.source.title}</strong><span className={'role role-' + rule.role}>{rule.role === 'supports' ? 'Ủng hộ' : rule.role === 'refutes' ? 'Phản bác' : rule.role === 'context' ? 'Bối cảnh' : 'Chưa đủ'}</span></div><p>{rule.explanation}</p><small>{scenario.schoolLevel === 'primary' ? 'Lưu ý' : 'Giới hạn'}: {rule.limitation}</small></article>)}</div></section>
        </div><aside className="feedback-side"><section className="panel reflection-panel"><p className="eyebrow">{scenario.schoolLevel === 'primary' ? 'EM ĐÃ VIẾT' : 'BẠN ĐÃ VIẾT'}</p><blockquote>{session.reflection}</blockquote><p>{scenario.schoolLevel === 'primary' ? 'Điểm tìm hiểu được tính riêng. Em có thể nói thêm với cô về lý do mình chọn.' : 'Chọn đúng/sai và điểm kiểm chứng được tính riêng. Giáo viên có thể trao đổi thêm về lập luận của bạn.'}</p></section>
          <section className="panel replay-panel"><h3>Chơi tiếp?</h3><button className="primary-button full-button" type="button" onClick={() => startScenario(scenario.id, session.variantIndex)}>Thử lại màn này</button><button className="secondary-button full-button" type="button" onClick={() => setPage('catalog')}>Chọn màn khác</button></section></aside></div>}
      </>}

      {page === 'teacher' && teacherScenario && <div className="teacher-page"><div className="teacher-heading"><p className="eyebrow">DÀNH CHO GIÁO VIÊN</p><h1>Bản đồ kiểm chứng</h1><p>Mục tiêu, đáp án và giới hạn của từng nguồn trong tình huống mô phỏng.</p></div>
        <label className="teacher-picker">Chọn tình huống<select value={teacherScenarioId} onChange={event => setTeacherScenarioId(event.target.value)}>{SCHOOL_LEVELS.map(level => <optgroup key={level.id} label={`${level.label} · ${level.grades}`}>{scenariosForLevel(level.id).map(item => <option value={item.id} key={item.id}>{item.title}</option>)}</optgroup>)}</select></label>
        <div className="teacher-grid"><section className="panel"><p className="eyebrow">MỤC TIÊU & ĐÁP ÁN</p><h2>{teacherScenario.title}</h2><dl><dt>Độ tuổi</dt><dd>{teacherScenario.ageBand}</dd><dt>Mục tiêu</dt><dd>{teacherScenario.learningGoal}</dd><dt>Kết luận chuẩn</dt><dd>{STATUS_LABELS[teacherScenario.truthStatus]} · {BELIEF_LABELS[expectedBelief(teacherScenario.truthStatus)]}</dd><dt>Đường kiểm chứng</dt><dd>{teacherScenario.teacherNotes}</dd></dl></section>
          <section className="panel"><p className="eyebrow">VAI TRÒ CÁC NGUỒN</p><h2>Nguồn chính và giới hạn</h2><div className="teacher-rules">{teacherScenario.evidenceRules.map(rule => {
            const source = teacherScenario.sources.find(item => item.id === rule.sourceId)
            return source && <div key={rule.sourceId}><strong>{source.title}</strong><span>{rule.role}</span><p>{rule.explanation}</p><small>{rule.limitation}</small></div>
          })}</div></section></div>
        <div className="teacher-validation">Kiểm tra dữ liệu: {validateScenario(teacherScenario).length === 0 ? 'Nguồn và liên kết hợp lệ.' : validateScenario(teacherScenario).join(' ')}</div>
      </div>}
    </main>
    <footer className="site-footer"><span>DỪNG · XEM · HỎI</span><p>Demo giáo dục · Mọi nhân vật và tài liệu đều mô phỏng. Không thu thập tin nhắn thật.</p></footer>
  </div>
}

export default App
