import { useEffect, useMemo, useState } from 'react'
import scenarioData from './scenarios.json'
import { ACTION_LABELS, SOURCE_TYPE_LABELS, STATUS_LABELS, evaluate, newSession, validateScenario } from './logic'
import type { Answer, GameSession, InitialAction, Scenario, SourceType, TruthStatus } from './types'

const scenarios = scenarioData as Scenario[]
const STORAGE_KEY = 'dung-xem-hoi-demo-session-v1'
const STAGES = ['Dừng', 'Xem', 'Hỏi & kết luận', 'Phản hồi']
const STATUS_ORDER: TruthStatus[] = ['verified', 'false', 'misleading', 'insufficient']
const SOURCE_TYPES: SourceType[] = ['official', 'schedule', 'article', 'image', 'message', 'social']

function loadSession(): GameSession | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return null
    const parsed = JSON.parse(saved) as GameSession
    if (!scenarios.some(scenario => scenario.id === parsed.scenarioId)) return null
    if (!parsed.draft || !Array.isArray(parsed.viewedSourceIds) || !Array.isArray(parsed.notebookSourceIds)) return null
    return parsed
  } catch {
    return null
  }
}

function formattedDate(date: string): string {
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year}`
}

function App() {
  const [session, setSession] = useState<GameSession | null>(loadSession)
  const [page, setPage] = useState<'catalog' | 'game' | 'teacher'>(() => loadSession() ? 'game' : 'catalog')
  const [teacherScenarioId, setTeacherScenarioId] = useState(scenarios[0]?.id ?? '')
  const [openSourceId, setOpenSourceId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState<SourceType | 'all'>('all')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    try {
      if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
      else localStorage.removeItem(STORAGE_KEY)
    } catch {
      setNotice('Trình duyệt không lưu được phiên. Bạn vẫn có thể tiếp tục chơi ở tab này.')
    }
  }, [session])

  const scenario = session ? scenarios.find(item => item.id === session.scenarioId) ?? null : null
  const teacherScenario = scenarios.find(item => item.id === teacherScenarioId) ?? scenarios[0]
  const evaluation = scenario && session?.answer ? evaluate(scenario, session, session.answer) : null

  const filteredSources = useMemo(() => {
    if (!scenario) return []
    const query = search.trim().toLocaleLowerCase('vi')
    return scenario.sources.filter(source => {
      const typeMatches = sourceFilter === 'all' || source.type === sourceFilter
      const textMatches = !query || `${source.title} ${source.author} ${source.content}`.toLocaleLowerCase('vi').includes(query)
      return typeMatches && textMatches
    })
  }, [scenario, search, sourceFilter])

  function startScenario(id: string, variantIndex = -1) {
    setSession(newSession(id, variantIndex))
    setPage('game')
    setOpenSourceId(null)
    setSearch('')
    setSourceFilter('all')
    setNotice('')
    window.scrollTo(0, 0)
  }

  function resetSession() {
    setSession(null)
    setPage('catalog')
    setOpenSourceId(null)
    setNotice('Đã xóa phiên chơi trên trình duyệt này.')
  }

  function updateSession(patch: Partial<GameSession>) {
    setSession(previous => previous ? { ...previous, ...patch } : previous)
  }

  function openSource(id: string) {
    setOpenSourceId(id)
    setSession(previous => previous ? {
      ...previous,
      viewedSourceIds: previous.viewedSourceIds.includes(id)
        ? previous.viewedSourceIds
        : [...previous.viewedSourceIds, id],
    } : previous)
    setNotice('')
  }

  function toggleNotebook(id: string) {
    if (!session) return
    updateSession({
      notebookSourceIds: session.notebookSourceIds.includes(id)
        ? session.notebookSourceIds.filter(item => item !== id)
        : [...session.notebookSourceIds, id],
    })
  }

  function updateDraft(patch: Partial<GameSession['draft']>) {
    if (!session) return
    updateSession({ draft: { ...session.draft, ...patch } })
  }

  function submitAnswer() {
    if (!session || !scenario) return
    const { draft } = session
    if (!draft.status) {
      setNotice('Hãy chọn một trong bốn kết luận, kể cả “Chưa đủ bằng chứng”.')
      return
    }
    if (draft.sourceIds.length === 0) {
      setNotice('Hãy chọn ít nhất một nguồn bạn đã mở để giải thích kết luận.')
      return
    }
    if (draft.reasoning.trim().length < 15) {
      setNotice('Hãy viết ít nhất 15 ký tự để giải thích nguồn đã chọn cho biết điều gì.')
      return
    }
    const answer: Answer = {
      status: draft.status,
      sourceIds: draft.sourceIds,
      reasoning: draft.reasoning.trim(),
      limitation: draft.limitation.trim(),
      finalAction: draft.finalAction,
    }
    updateSession({ answer, stage: 'feedback' })
    setNotice('')
    window.scrollTo(0, 0)
  }

  const activeSource = scenario?.sources.find(source => source.id === openSourceId)
  const claim = scenario && session?.variantIndex !== undefined && session.variantIndex >= 0
    ? scenario.variantClaims[session.variantIndex] ?? scenario.claim
    : scenario?.claim

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <button className="brand" type="button" onClick={() => setPage('catalog')} aria-label="Về danh sách màn chơi">
            <span className="brand-symbol" aria-hidden="true">✳</span>
            <span>DỪNG <b>·</b> XEM <b>·</b> HỎI</span>
          </button>
          <nav className="top-nav" aria-label="Điều hướng chính">
            <button className={page === 'catalog' ? 'nav-active' : ''} type="button" onClick={() => setPage('catalog')}>Chọn màn</button>
            {session && <button className={page === 'game' ? 'nav-active' : ''} type="button" onClick={() => setPage('game')}>Phiên đang chơi</button>}
            <button className={page === 'teacher' ? 'nav-active' : ''} type="button" onClick={() => setPage('teacher')}>Góc giáo viên</button>
          </nav>
        </div>
      </header>

      <main id="main-content">
        <div className="mode-strip" aria-label="Trạng thái chế độ chơi">
          <span className="mode-pill"><span className="live-dot" />Chế độ mẫu có sẵn · không cần khóa API</span>
          <span className="mode-muted">AI tạo bản nháp: chưa cấu hình phía máy chủ</span>
        </div>
        {notice && <div className="notice" role="alert">{notice}</div>}

        {page === 'catalog' && (
          <>
            <section className="hero">
              <div>
                <p className="eyebrow">TRÒ CHƠI ĐIỀU TRA THÔNG TIN · DEMO</p>
                <h1>Đừng vội tin.<br /><em>Hãy tìm dấu vết.</em></h1>
                <p className="hero-copy">Một bài đăng có thể rất thuyết phục. Trong mỗi sandbox, bạn sẽ dừng lại, đọc tài liệu, hỏi đúng câu và tự đưa ra kết luận có căn cứ.</p>
                <div className="hero-badges"><span>04 tình huống</span><span>Chơi không cần tài khoản</span><span>Tiến trình lưu trên máy</span></div>
              </div>
              <div className="hero-art" aria-hidden="true">
                <div className="art-card art-card-back">TIN NÓNG <span>?</span></div>
                <div className="art-card art-card-front"><span className="art-glass">⌕</span><span>KIỂM CHỨNG<br />TRƯỚC KHI CHIA SẺ</span></div>
              </div>
            </section>
            <section className="section-heading">
              <div><p className="eyebrow">BẮT ĐẦU ĐIỀU TRA</p><h2>Chọn một tình huống</h2></div>
              <p>Mọi tin, nhân vật và tài liệu dưới đây đều là <strong>tình huống mô phỏng</strong>.</p>
            </section>
            <div className="scenario-grid">
              {scenarios.map((item, index) => (
                <article className="scenario-card" key={item.id}>
                  <div className="card-top"><span className="card-number">0{index + 1}</span><span className="tag">Tình huống mô phỏng</span></div>
                  <p className="card-topic">{item.topic} · {item.difficulty}</p>
                  <h3>{item.title}</h3>
                  <p>{item.learningGoal}</p>
                  <div className="card-actions">
                    <button className="primary-button" type="button" onClick={() => startScenario(item.id)}>Chơi màn này <span aria-hidden="true">↗</span></button>
                    <button className="text-button" type="button" onClick={() => startScenario(item.id, Math.floor(Math.random() * item.variantClaims.length))}>Thử biến thể mẫu</button>
                  </div>
                </article>
              ))}
            </div>
            {session && <div className="resume-panel"><span>Bạn có một phiên chưa xóa: <strong>{scenario?.title}</strong></span><button className="secondary-button" type="button" onClick={() => setPage('game')}>Tiếp tục phiên</button></div>}
          </>
        )}

        {page === 'game' && scenario && session && (
          <>
            <div className="game-heading">
              <div><p className="eyebrow">TÌNH HUỐNG MÔ PHỎNG / {scenario.topic.toLocaleUpperCase('vi')}</p><h1>{scenario.title}</h1></div>
              <button className="quiet-button" type="button" onClick={resetSession}>Xóa phiên</button>
            </div>
            {session.variantIndex >= 0 && <p className="variant-label">Biến thể mẫu · cùng hồ sơ bằng chứng</p>}
            <ol className="stepper" aria-label="Tiến trình lượt chơi">
              {STAGES.map((label, index) => {
                const current = ['stop', 'explore', 'conclude', 'feedback'].indexOf(session.stage)
                return <li className={index === current ? 'current' : index < current ? 'done' : ''} key={label}><span>{index + 1}</span>{label}</li>
              })}
            </ol>

            {session.stage === 'stop' && (
              <div className="game-layout">
                <section className="panel story-panel">
                  <p className="eyebrow">01 / DỪNG LẠI</p>
                  <div className="fake-post"><div className="post-author"><span className="avatar">?</span><div><strong>Bài đăng đang lan truyền</strong><small>Trong sandbox mô phỏng · chưa xác minh</small></div></div><p>{claim}</p><div className="post-footer">↗ Được chuyển tiếp nhiều lần <span>·</span> Nguồn gốc chưa rõ</div></div>
                </section>
                <section className="panel decision-panel">
                  <p className="eyebrow">QUYẾT ĐỊNH BAN ĐẦU</p>
                  <h2>Bạn sẽ làm gì trước?</h2>
                  <p>Chọn theo phản ứng hiện tại. Bạn có thể đổi quyết định sau khi xem nguồn.</p>
                  <div className="choice-stack" role="radiogroup" aria-label="Hành động ban đầu">
                    {(Object.keys(ACTION_LABELS) as InitialAction[]).map(action => <label className={`choice ${session.initialAction === action ? 'selected' : ''}`} key={action}><input type="radio" name="initial-action" checked={session.initialAction === action} onChange={() => updateSession({ initialAction: action })} /><span>{ACTION_LABELS[action]}</span></label>)}
                  </div>
                  <label className="field-label" htmlFor="initial-reason">Vì sao bạn chọn như vậy?</label>
                  <textarea id="initial-reason" rows={3} maxLength={400} value={session.initialReason} onChange={event => updateSession({ initialReason: event.target.value })} placeholder="Viết suy nghĩ ban đầu của bạn..." />
                  <button className="primary-button full-button" type="button" onClick={() => {
                    if (!session.initialAction || session.initialReason.trim().length < 8) {
                      setNotice('Hãy chọn một hành động và viết ít nhất 8 ký tự giải thích lý do ban đầu.')
                      return
                    }
                    updateSession({ stage: 'explore' }); setNotice(''); window.scrollTo(0, 0)
                  }}>Đi tìm bằng chứng <span aria-hidden="true">→</span></button>
                </section>
              </div>
            )}

            {session.stage === 'explore' && (
              <>
                <div className="explore-intro"><div><p className="eyebrow">02 / XEM NGUỒN</p><h2>Kho tư liệu</h2><p>Tìm, lọc và mở tài liệu. Ghi nguồn hữu ích vào sổ tay. Bạn không cần mở hết mọi nguồn.</p></div><div className="count-badge"><strong>{session.viewedSourceIds.length}/{scenario.sources.length}</strong><span>nguồn đã xem</span></div></div>
                <div className="research-layout">
                  <section className="panel source-library" aria-label="Danh sách nguồn">
                    <div className="filter-row"><label className="search-box"><span aria-hidden="true">⌕</span><span className="sr-only">Tìm nguồn theo từ khóa</span><input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Tìm theo từ khóa, tác giả..." /></label><label className="filter-box"><span className="sr-only">Lọc loại nguồn</span><select value={sourceFilter} onChange={event => setSourceFilter(event.target.value as SourceType | 'all')}><option value="all">Tất cả nguồn</option>{SOURCE_TYPES.map(type => <option value={type} key={type}>{SOURCE_TYPE_LABELS[type]}</option>)}</select></label></div>
                    <div className="source-list">{filteredSources.length === 0 && <p className="empty-state">Không tìm thấy nguồn phù hợp. Hãy thử từ khóa hoặc loại nguồn khác.</p>}{filteredSources.map(source => <button className={`source-row ${openSourceId === source.id ? 'active' : ''}`} type="button" key={source.id} onClick={() => openSource(source.id)}><span className="source-icon" aria-hidden="true">▤</span><span><span className="source-meta">{SOURCE_TYPE_LABELS[source.type]} · {formattedDate(source.publishedAt)}</span><strong>{source.title}</strong><small>{source.author}</small></span><span className="source-arrow" aria-hidden="true">↗</span></button>)}</div>
                  </section>
                  <div className="research-side">
                    <section className="panel document-panel" aria-live="polite">
                      {activeSource ? <><p className="eyebrow">TÀI LIỆU MÔ PHỎNG · {SOURCE_TYPE_LABELS[activeSource.type].toLocaleUpperCase('vi')}</p><h3>{activeSource.title}</h3><p className="document-byline">Người tạo: <strong>{activeSource.author}</strong><br />Đăng ngày: <strong>{formattedDate(activeSource.publishedAt)}</strong></p><div className="document-content">{activeSource.content}</div>{activeSource.citesSourceIds.length > 0 && <p className="citation-note">Nguồn này dẫn lại: {activeSource.citesSourceIds.map(id => scenario.sources.find(source => source.id === id)?.title ?? id).join(', ')}.</p>}<button className="secondary-button full-button" type="button" onClick={() => toggleNotebook(activeSource.id)}>{session.notebookSourceIds.includes(activeSource.id) ? '✓ Đã ghi vào sổ tay · Bỏ ghi' : '+ Ghi vào sổ tay bằng chứng'}</button></> : <div className="document-empty"><span aria-hidden="true">⌕</span><h3>Chọn một tài liệu</h3><p>Nội dung, tác giả và ngày đăng sẽ hiện ở đây.</p></div>}
                    </section>
                    <section className="panel notebook"><div className="notebook-title"><p className="eyebrow">SỔ TAY BẰNG CHỨNG</p><span>{session.notebookSourceIds.length} nguồn</span></div>{session.notebookSourceIds.length ? <ul>{session.notebookSourceIds.map(id => { const source = scenario.sources.find(item => item.id === id); return source && <li key={id}><button type="button" onClick={() => openSource(id)}>{source.title}</button></li> })}</ul> : <p>Chưa ghi nguồn nào. Mở tài liệu rồi chọn “Ghi vào sổ tay”.</p>}</section>
                    <section className="panel hint-panel"><p className="eyebrow">03 / HỎI</p><h3>Cần một gợi ý?</h3><p>Gợi ý chỉ hướng tới bước kiểm tra tiếp theo.</p>{session.hintCount > 0 && <ol>{scenario.hints.slice(0, session.hintCount).map((hint, index) => <li key={index}>{hint}</li>)}</ol>}<button className="text-button" type="button" disabled={session.hintCount >= scenario.hints.length} onClick={() => updateSession({ hintCount: session.hintCount + 1 })}>{session.hintCount >= scenario.hints.length ? 'Đã xem hết gợi ý' : `Xem gợi ý ${session.hintCount + 1}/${scenario.hints.length} →`}</button></section>
                  </div>
                </div>
                <div className="next-bar"><span>Bạn đã xem {session.viewedSourceIds.length} nguồn · dùng {session.hintCount} gợi ý</span><button className="primary-button" type="button" onClick={() => { updateSession({ stage: 'conclude' }); setNotice(''); window.scrollTo(0, 0) }}>Đưa ra kết luận <span aria-hidden="true">→</span></button></div>
              </>
            )}

            {session.stage === 'conclude' && (
              <div className="conclusion-layout">
                <section className="panel conclusion-panel"><p className="eyebrow">04 / KẾT LUẬN</p><h2>Bằng chứng nói gì?</h2><p className="claim-reminder"><strong>Tuyên bố cần kiểm tra</strong><br />{claim}</p>
                  <fieldset className="status-choices"><legend>Chọn trạng thái của tuyên bố</legend>{STATUS_ORDER.map(status => <label className={`status-choice ${session.draft.status === status ? 'selected' : ''}`} key={status}><input type="radio" name="truth-status" checked={session.draft.status === status} onChange={() => updateDraft({ status })} /><span>{STATUS_LABELS[status]}</span></label>)}</fieldset>
                  <fieldset className="source-choices"><legend>Chọn ít nhất một nguồn đã xem để viện dẫn</legend>{session.viewedSourceIds.length ? scenario.sources.filter(source => session.viewedSourceIds.includes(source.id)).map(source => <label className="source-checkbox" key={source.id}><input type="checkbox" checked={session.draft.sourceIds.includes(source.id)} onChange={() => updateDraft({ sourceIds: session.draft.sourceIds.includes(source.id) ? session.draft.sourceIds.filter(id => id !== source.id) : [...session.draft.sourceIds, source.id] })} /><span>{source.title}<small>{source.author} · {formattedDate(source.publishedAt)}</small></span></label>) : <p>Bạn chưa mở tài liệu nào. Quay lại kho tư liệu để xem nguồn.</p>}</fieldset>
                  <label className="field-label" htmlFor="reasoning">Nguồn đã chọn cho biết điều gì về tuyên bố?</label><textarea id="reasoning" rows={5} maxLength={1000} value={session.draft.reasoning} onChange={event => updateDraft({ reasoning: event.target.value })} placeholder="Viết lập luận bằng lời của bạn, nêu rõ chi tiết nào trong nguồn..." />
                  <label className="field-label" htmlFor="limitation">Giới hạn của bằng chứng (nếu có)</label><textarea id="limitation" rows={3} maxLength={500} value={session.draft.limitation} onChange={event => updateDraft({ limitation: event.target.value })} placeholder="Ví dụ: nguồn này chỉ nói về một khối lớp, một ngày hoặc dẫn lại lời kể..." />
                  <fieldset className="final-action"><legend>Sau khi xem nguồn, bạn sẽ làm gì?</legend>{(Object.keys(ACTION_LABELS) as InitialAction[]).map(action => <label key={action}><input type="radio" name="final-action" checked={session.draft.finalAction === action} onChange={() => updateDraft({ finalAction: action })} /> {ACTION_LABELS[action]}</label>)}</fieldset>
                  <div className="form-actions"><button className="secondary-button" type="button" onClick={() => { updateSession({ stage: 'explore' }); setNotice('') }}>← Xem thêm nguồn</button><button className="primary-button" type="button" onClick={submitAnswer}>Nhận phản hồi <span aria-hidden="true">→</span></button></div>
                </section>
                <aside className="panel rubric-panel"><p className="eyebrow">CÁCH CHẤM LẬP LUẬN</p><h3>Điểm 0–3</h3><ol><li><strong>0</strong> Phỏng đoán hoặc dựa vào lượt chia sẻ.</li><li><strong>1</strong> Có dấu hiệu nhưng chưa gắn với tuyên bố.</li><li><strong>2</strong> Viện dẫn nguồn liên quan và giải thích rõ.</li><li><strong>3</strong> Thêm đối chiếu nguồn độc lập, giới hạn bằng chứng hoặc sửa quyết định chia sẻ có căn cứ.</li></ol><p>Kết luận đúng và điểm lập luận được tính riêng. Thời gian chơi không tính điểm.</p></aside>
              </div>
            )}

            {session.stage === 'feedback' && session.answer && evaluation && (
              <div className="feedback-layout"><div className="feedback-main"><section className="panel result-panel"><p className="eyebrow">PHẢN HỒI / HỒ SƠ BẰNG CHỨNG</p><div className="result-head"><div><h2>{evaluation.correct ? 'Bạn đã xác định đúng.' : 'Hãy xem lại đường kiểm chứng.'}</h2><p>Kết luận chuẩn: <strong>{STATUS_LABELS[scenario.truthStatus]}</strong></p></div><div className="score-badge"><strong>{evaluation.score}<small>/3</small></strong><span>điểm lập luận</span></div></div><p className="score-explanation">{evaluation.scoreExplanation}</p><div className="comparison"><div><span>Ban đầu</span><strong>{session.initialAction ? ACTION_LABELS[session.initialAction] : '—'}</strong><p>{session.initialReason}</p></div><div><span>Sau khi xem nguồn</span><strong>{ACTION_LABELS[session.answer.finalAction]}</strong><p>Bạn kết luận: {STATUS_LABELS[session.answer.status]}</p></div></div>{session.initialAction !== session.answer.finalAction && <p className="changed-note">Bạn đã thay đổi quyết định sau khi xem nguồn.</p>}{scenario.truthStatus === 'insufficient' && <p className="safety-note">Chưa có đủ bằng chứng để khẳng định đúng hoặc sai. Không cung cấp thông tin cá nhân hay mở biểu mẫu đăng ký trước khi xác minh qua kênh tổ chức.</p>}</section>
                  <section className="panel evidence-profile"><p className="eyebrow">TỪNG NGUỒN NÓI GÌ?</p><h2>Hồ sơ bằng chứng</h2><div className="rule-list">{scenario.evidenceRules.map(rule => { const source = scenario.sources.find(item => item.id === rule.sourceId); if (!source) return null; return <article className="rule-card" key={rule.sourceId}><div className="rule-header"><strong>{source.title}</strong><span className={`role role-${rule.role}`}>{rule.role === 'supports' ? 'Hỗ trợ' : rule.role === 'refutes' ? 'Phản bác' : rule.role === 'context' ? 'Bổ sung bối cảnh' : 'Chưa đủ'}</span></div><p>{rule.explanation}</p><small>Giới hạn: {rule.limitation}</small>{session.answer?.sourceIds.includes(rule.sourceId) && <span className="used-label">Bạn đã viện dẫn</span>}</article> })}</div></section>
                </div><aside className="feedback-side"><section className="panel reflection-panel"><p className="eyebrow">LẬP LUẬN CỦA BẠN</p><blockquote>{session.answer.reasoning}</blockquote>{session.answer.limitation && <p><strong>Giới hạn bạn nêu:</strong> {session.answer.limitation}</p>}<p>Gợi ý đã dùng: {session.hintCount}/{scenario.hints.length}</p></section><section className="panel replay-panel"><h3>Điều tra tiếp?</h3><button className="primary-button full-button" type="button" onClick={() => startScenario(scenario.id, session.variantIndex)}>Thử lại màn này</button><button className="secondary-button full-button" type="button" onClick={() => { setPage('catalog'); window.scrollTo(0, 0) }}>Chọn màn khác</button><button className="text-button" type="button" onClick={() => startScenario(scenario.id, Math.floor(Math.random() * scenario.variantClaims.length))}>Thử biến thể mẫu →</button></section></aside></div>
            )}
          </>
        )}

        {page === 'teacher' && teacherScenario && (
          <div className="teacher-page"><div className="teacher-heading"><p className="eyebrow">DÀNH CHO GIÁO VIÊN</p><h1>Bản đồ kiểm chứng</h1><p>Xem mục tiêu, đáp án và vai trò của từng nguồn trước khi hướng dẫn học sinh.</p></div><label className="teacher-picker">Chọn tình huống<select value={teacherScenarioId} onChange={event => setTeacherScenarioId(event.target.value)}>{scenarios.map(item => <option value={item.id} key={item.id}>{item.title}</option>)}</select></label><div className="teacher-grid"><section className="panel"><p className="eyebrow">MỤC TIÊU & ĐÁP ÁN</p><h2>{teacherScenario.title}</h2><p className="tag">Tình huống mô phỏng</p><dl><dt>Độ tuổi</dt><dd>{teacherScenario.ageBand}</dd><dt>Mục tiêu</dt><dd>{teacherScenario.learningGoal}</dd><dt>Kết luận chuẩn</dt><dd><strong>{STATUS_LABELS[teacherScenario.truthStatus]}</strong></dd><dt>Đường kiểm chứng</dt><dd>{teacherScenario.teacherNotes}</dd></dl></section><section className="panel"><p className="eyebrow">VAI TRÒ CÁC NGUỒN</p><h2>Nguồn chính, nguồn nhiễu</h2><div className="teacher-rules">{teacherScenario.evidenceRules.map(rule => { const source = teacherScenario.sources.find(item => item.id === rule.sourceId); return source && <div key={rule.sourceId}><strong>{source.title}</strong><span>{rule.role === 'supports' ? 'Hỗ trợ' : rule.role === 'refutes' ? 'Phản bác' : rule.role === 'context' ? 'Bối cảnh' : 'Chưa đủ'}</span><p>{rule.explanation}</p><small>{source.relevanceNote} · Giới hạn: {rule.limitation}</small></div> })}</div></section></div><div className="teacher-validation">Kiểm tra dữ liệu: {validateScenario(teacherScenario).length === 0 ? '6 nguồn và các liên kết hợp lệ.' : validateScenario(teacherScenario).join(' ')}</div></div>
        )}
      </main>

      <footer className="site-footer"><span>DỪNG · XEM · HỎI</span><p>Demo giáo dục · Mọi tình huống và tài liệu đều mô phỏng. Không thu thập danh tính hoặc tin nhắn thật.</p></footer>
    </div>
  )
}

export default App
