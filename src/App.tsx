import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowLeft, ArrowRight, ArrowUpLeft, Check, ChevronLeft, ChevronRight, Gift, Heart, Image as ImageIcon, LockKeyhole, RotateCcw, Send, Sparkles, Volume2, VolumeX, X } from 'lucide-react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { giftMeta, story, type GiftId } from './content'

type Progress = { version: 1; entered: boolean; gifts: string[]; letters: string[]; reason: number; answers: Record<string, number[]>; scratched: boolean; finalOpened: boolean }
const defaultProgress: Progress = { version: 1, entered: false, gifts: [], letters: [], reason: 0, answers: {}, scratched: false, finalOpened: false }
function readProgress(): Progress {
  try {
    const raw = localStorage.getItem('love-story:progress:v1')
    if (!raw) return defaultProgress
    const value = JSON.parse(raw) as Partial<Progress>
    const rawAnswers = value.answers && typeof value.answers === 'object' ? value.answers as Record<string, unknown> : {}
    const answers = Object.fromEntries(Object.entries(rawAnswers).flatMap(([id, selected]) => {
      const question = story.quiz.find(item => item.id === id)
      if (!question) return []
      const choices = Array.isArray(selected) ? selected : typeof selected === 'number' ? [selected] : []
      return [[id, [...new Set(choices.filter((choice): choice is number => Number.isInteger(choice) && choice >= 0 && choice < question.choices.length))]]]
    }))
    return { ...defaultProgress, entered: Boolean(value.entered), gifts: Array.isArray(value.gifts) ? value.gifts.filter(id => giftMeta.some(g => g.id === id)) : [], letters: Array.isArray(value.letters) ? value.letters.filter(id => story.letters.some(l => l.id === id)) : [], reason: Number.isInteger(value.reason) && value.reason! >= 0 && value.reason! < story.reasons.length ? value.reason! : 0, answers, scratched: Boolean(value.scratched), finalOpened: Boolean(value.finalOpened) }
  } catch { return defaultProgress }
}
type ProgressContextValue = { progress: Progress; update: (change: Partial<Progress>) => void; markGift: (id: GiftId) => void; reset: () => void }
const ProgressContext = createContext<ProgressContextValue | null>(null)
function useProgress() { const context = useContext(ProgressContext); if (!context) throw new Error('Progress provider missing'); return context }
function useProgressValue() {
  const [progress, setProgress] = useState(readProgress)
  useEffect(() => { try { localStorage.setItem('love-story:progress:v1', JSON.stringify(progress)) } catch { /* The experience still works for this visit. */ } }, [progress])
  const update = useCallback((change: Partial<Progress>) => setProgress(current => ({ ...current, ...change })), [])
  const markGift = useCallback((id: GiftId) => setProgress(current => current.gifts.includes(id) ? current : { ...current, gifts: [...current.gifts, id] }), [])
  const reset = useCallback(() => { setProgress(defaultProgress); try { localStorage.removeItem('love-story:progress:v1') } catch { /* Ignore unavailable storage. */ } }, [])
  return useMemo(() => ({ progress, update, markGift, reset }), [progress, update, markGift, reset])
}

function Page({ children }: { children: ReactNode }) {
  return <motion.main className="page-wrap" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }}><div className="paper-page">{children}</div></motion.main>
}
function Eyebrow({ children }: { children: ReactNode }) { return <span className="eyebrow"><span className="eyebrow-dot" />{children}</span> }
function BackHome() { const navigate = useNavigate(); return <button className="back-link" onClick={() => navigate('/world')}><ArrowLeft size={17} /> ارجعي لعالمنا الصغير</button> }
function ChapterHeading({ eyebrow, title, subtitle, icon }: { eyebrow: string; title: string; subtitle: string; icon: ReactNode }) {
  return <header className="chapter-heading"><div className="chapter-icon">{icon}</div><Eyebrow>{eyebrow}</Eyebrow><h1>{title}</h1><p>{subtitle}</p></header>
}
function Ambient() { return <div aria-hidden="true" className="ambient"><i>✦</i><i>♡</i><i>✧</i><i>·</i><i>♡</i><i>✦</i></div> }
function MusicToggle() {
  const audio = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState(false)
  useEffect(() => { if (audio.current) audio.current.volume = 0.3 }, [])
  if (!story.musicSrc) return null
  const toggle = async () => {
    const player = audio.current
    if (!player) return
    if (playing) { player.pause(); setPlaying(false); return }
    try { await player.play(); setPlaying(true); setError(false) } catch { setError(true) }
  }
  return <div className="sound-control"><audio ref={audio} src={story.musicSrc} loop preload="none" onPause={() => setPlaying(false)} onPlay={() => setPlaying(true)} /><button className="icon-button" onClick={toggle} aria-label={playing ? 'اقفلي الموسيقى' : 'شغّلي الموسيقى'} title={error ? 'اتأكدي إن ملف الموسيقى موجود في المكان المكتوب في الإعدادات.' : playing ? 'اقفلي الموسيقى' : 'شغّلي الموسيقى'}>{playing ? <Volume2 size={18} /> : <VolumeX size={18} />}</button></div>
}
function SiteHeader() {
  const [taps, setTaps] = useState(0)
  const [secret, setSecret] = useState(false)
  const [resetAsk, setResetAsk] = useState(false)
  const { reset, update } = useProgress()
  return <div className="site-header"><a href="#/world" className="brand" onClick={event => { event.preventDefault(); window.location.hash = '/world' }}><span className="brand-mark"><Heart size={17} fill="currentColor" /></span><span>حكايتنا<span className="brand-dot">.</span></span></a><div className="header-tools"><span className="header-note">هدية صغيرة من قلبي</span><MusicToggle /><button className="icon-button tiny-heart" aria-label="لمسة سرية" title="لمسة سرية" onClick={() => { const next = taps + 1; setTaps(next); if (next >= 5) { setSecret(true); setTaps(0) } }}><Heart size={16} /></button><button className="reset-button" onClick={() => setResetAsk(value => !value)}><RotateCcw size={14} /><span>ابدئي من الأول</span></button></div>{secret && <div className="secret-note" role="status">سر صغير: وجودك أحلى تفصيلة في حكايتي ❤️ <button onClick={() => setSecret(false)} aria-label="إغلاق"><X size={14} /></button></div>}{resetAsk && <div className="secret-note reset-note" role="group" aria-label="إعادة البداية"><span>هنبدأ من أول هدية؟</span><button className="reset-confirm" onClick={() => { reset(); update({ entered: true }); setResetAsk(false); window.location.hash = '/world' }}>آه، ابدئي من جديد</button><button onClick={() => setResetAsk(false)}>لأ</button></div>}</div>
}
function Shell({ children }: { children: ReactNode }) {
  const location = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }) }, [location.pathname])
  return <div className="app-shell"><Ambient />{children}<footer className="site-footer"><span>اتعملت بحب، مخصوص ليكي</span><Heart size={13} fill="currentColor" /><span>وباقي الحكاية لسه جاية</span></footer></div>
}
function Welcome() {
  const navigate = useNavigate(); const { update } = useProgress(); const reduce = useReducedMotion(); const [opening, setOpening] = useState(false)
  const start = () => { if (opening) return; setOpening(true); window.setTimeout(() => { update({ entered: true }); navigate('/world') }, reduce ? 180 : 1050) }
  return <div className="welcome-screen"><div className="welcome-top"><Eyebrow>رسالة صغيرة قبل ما نبدأ</Eyebrow></div><div className="welcome-copy"><motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>في حد غالي أوي على قلبي...</motion.p><motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduce ? 0 : 0.45, duration: 0.8 }}>وعشان إنتي أغلى حد عندي،<br /><em>عملتلك حاجة مخصوص.</em></motion.h1></div><button className={`gift-hero ${opening ? 'gift-opening' : ''}`} onClick={start} aria-label={opening ? 'الهدية بتتفتح' : 'افتحي هديتك يا روحي'} disabled={opening}><div className="hero-ribbon" /><div className="hero-bow">♡</div><span className="hero-lid" aria-hidden="true" /><Sparkles className="gift-spark spark-a" size={19} /><Sparkles className="gift-spark spark-b" size={14} /><Heart className="gift-spark spark-c" size={17} fill="currentColor" />{opening && <span className="gift-burst" aria-hidden="true">♡　✧　♡</span>}</button><div className="welcome-bottom"><button className="primary-button welcome-button" onClick={start} disabled={opening}>{opening ? 'الهدية بتتفتح…' : 'افتحي هديتك يا روحي'} {opening ? <Sparkles size={18} /> : <Gift size={19} />}</button><span>خدي وقتك… دي حكايتنا سوا <span>✧</span></span></div><div className="welcome-flower flower-one" aria-hidden="true">✿</div><div className="welcome-flower flower-two" aria-hidden="true">✿</div></div>
}
function GiftCard({ id, index, opening, onOpen }: { id: GiftId; index: number; opening: boolean; onOpen: () => void }) {
  const item = giftMeta.find(gift => gift.id === id)!; const { progress } = useProgress(); const opened = progress.gifts.includes(id)
  return <motion.button className={`gift-card gift-${id} ${opened ? 'is-opened' : ''} ${opening ? 'gift-card-opening' : ''}`} onClick={onOpen} disabled={opening} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.045 }} whileHover={{ y: -4 }} whileTap={{ scale: 0.985 }}>
    <span className="gift-ornament" aria-hidden="true">{item.emoji}</span><span className="gift-copy"><span className="gift-title">{item.title}</span><span className="gift-hint">{item.hint}</span></span><span className="card-corner">{opened ? <Check size={16} /> : <ArrowUpLeft size={16} />}</span><span className="gift-seal" aria-label={opened ? 'هدية مفتوحة' : 'هدية لسه متفتحتش'}>{opened ? '♥' : '✧'}</span>
  </motion.button>
}
function Dashboard() {
  const navigate = useNavigate(); const { progress } = useProgress(); const [openingGift, setOpeningGift] = useState<GiftId | null>(null); const allOpened = giftMeta.every(item => progress.gifts.includes(item.id)); const count = giftMeta.filter(item => progress.gifts.includes(item.id)).length
  const openGift = (id: GiftId) => { if (openingGift) return; setOpeningGift(id); window.setTimeout(() => navigate(`/gift/${id}`), 530) }
  return <><SiteHeader /><Page><div className="world-intro"><Eyebrow>لحظات صغيرة… من عالمنا</Eyebrow><div className="world-heading"><div><h1>كل هدية هنا<br /><em>حتة من قلبي ليكي.</em></h1><p>لفّي براحتك… كل حاجة هنا معمولة عشان تفتحيلك باب ذكرى حلوة.</p></div><div className="progress-seal"><span>{count}<i>/</i>{giftMeta.length}</span><span>هدايا فتحناها</span><div className="progress-track"><i style={{ width: `${count / giftMeta.length * 100}%` }} /></div></div></div></div>
    <div className="gift-grid" aria-label="الهدايا">{giftMeta.map((item, index) => <GiftCard key={item.id} id={item.id} index={index} opening={openingGift === item.id} onOpen={() => openGift(item.id)} />)}
      <motion.button className={`gift-card final-gift ${allOpened ? 'final-unlocked' : ''}`} onClick={() => allOpened && navigate('/final')} aria-disabled={!allOpened} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}><span className="gift-ornament"><span className="final-heart">{allOpened ? '♡' : <LockKeyhole size={25} />}</span></span><span className="gift-copy"><span className="gift-title">لسه في هدية أخيرة…</span><span className="gift-hint">{allOpened ? 'افتحي آخر رسالة من قلبي' : 'كل هدايانا بتوصّل لرسالة أخيرة'}</span></span><span className="card-corner">{allOpened ? <ArrowUpLeft size={16} /> : <LockKeyhole size={15} />}</span><span className="gift-seal">{allOpened ? '♥' : '✧'}</span></motion.button>
    </div><div className="world-note"><Sparkles size={15} />كل باب تقدري تفتحيه تاني وقت ما تحبي{!allOpened && <span> · {giftMeta.length - count} هدايا لسه مستنياكي</span>}</div>
    {allOpened && <motion.div className="unlock-banner" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><span>كل الحكايات اتفتحت… وآخر رسالة بقت مستنياكي ❤️</span><button onClick={() => navigate('/final')}>افتحيها <ChevronLeft size={16} /></button></motion.div>}
  </Page></>
}

function Chapter({ id, title, subtitle, icon, children }: { id: GiftId; title: string; subtitle: string; icon: ReactNode; children: ReactNode }) {
  const { markGift } = useProgress()
  useEffect(() => { markGift(id) }, [id, markGift])
  return <><SiteHeader /><Page><div className="chapter-top"><BackHome /><span className="chapter-counter">حكايتنا سوا <span>✧</span></span></div><ChapterHeading eyebrow="هدية صغيرة من عالمنا" title={title} subtitle={subtitle} icon={icon} /><div className="chapter-body">{children}</div></Page></>
}
function Dialog({ title, onClose, children, onArrowLeft, onArrowRight }: { title: string; onClose: () => void; children: ReactNode; onArrowLeft?: () => void; onArrowRight?: () => void }) {
  const panel = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null; const oldOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'; panel.current?.focus()
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft') onArrowLeft?.()
      if (event.key === 'ArrowRight') onArrowRight?.()
      if (event.key === 'Tab' && panel.current) {
        const focusable = [...panel.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex="0"]')]
        if (!focusable.length) { event.preventDefault(); return }
        const first = focusable[0], last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => { document.body.style.overflow = oldOverflow; window.removeEventListener('keydown', handleKey); previouslyFocused?.focus() }
  }, [onClose])
  return <motion.div className="dialog-backdrop" role="presentation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}><motion.section ref={panel} tabIndex={-1} className="dialog-panel" role="dialog" aria-modal="true" aria-label={title} initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.98 }}><button className="dialog-close icon-button" aria-label="إغلاق" onClick={onClose}><X size={20} /></button>{children}</motion.section></motion.div>
}
function Letters() {
  const [selected, setSelected] = useState<string | null>(null); const { progress, update } = useProgress(); const letter = story.letters.find(item => item.id === selected)
  const open = (id: string) => { setSelected(id); if (!progress.letters.includes(id)) update({ letters: [...progress.letters, id] }) }
  return <Chapter id="letters" title="افتحي لما…" subtitle="في رسالة صغيرة لكل إحساس… اختاري اللي شبه يومك دلوقتي." icon={<span>✉</span>}><div className="envelope-grid">{story.letters.map((item, index) => <motion.button key={item.id} className={`envelope-card ${progress.letters.includes(item.id) ? 'envelope-opened' : ''}`} onClick={() => open(item.id)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} whileHover={{ y: -3 }}><span className="envelope-art"><span className="envelope-paper" /><span className="envelope-heart">{item.emoji}</span><span className="envelope-fold" /></span><span className="envelope-name">{item.title}</span><span className="envelope-action">{progress.letters.includes(item.id) ? 'اقريها تاني' : 'افتحي الرسالة'} <ArrowLeft size={14} /></span></motion.button>)}</div><AnimatePresence>{letter && <Dialog title={letter.title} onClose={() => setSelected(null)}><div className="letter-sheet"><span className="letter-stamp">{letter.emoji}</span><p className="letter-to">يا أجمل حاجة في أيامي،</p><h2>{letter.title.replace(/\s*\p{Extended_Pictographic}.*/u, '')}</h2><p className="letter-body">{letter.body}</p><p className="letter-signature">بحبك دايمًا،<br /><span>{story.names.sender} ❤️</span></p></div></Dialog>}</AnimatePresence></Chapter>
}
function Memories() {
  const [selected, setSelected] = useState(0); const [startX, setStartX] = useState<number | null>(null); const [show, setShow] = useState(false)
  const item = story.memories[selected]; const prev = () => setSelected(index => (index - 1 + story.memories.length) % story.memories.length); const next = () => setSelected(index => (index + 1) % story.memories.length)
  return <Chapter id="memories" title="ألبوم حكايتنا" subtitle="بداية حكايتنا من يوم الخطوبة… وصور تانية على مهلك." icon={<ImageIcon size={24} />}><div className="memory-grid">{story.memories.map((memory, index) => <motion.button key={memory.id} onClick={() => { setSelected(index); setShow(true) }} className={`polaroid polaroid-${index % 4}`} whileHover={{ y: -5, rotate: 0 }}><span className="photo-window">{memory.src ? <img src={memory.thumbnailSrc || memory.src} alt={memory.alt} loading="lazy" decoding="async" /> : <span className={`photo-placeholder photo-${index % 6}`} role="img" aria-label={memory.alt}><span className="placeholder-sun" /><span className="placeholder-hill hill-one" /><span className="placeholder-hill hill-two" /><span className="photo-placeholder-label">مكان صورتنا</span></span>}<span className="photo-heart">♡</span></span><span className="polaroid-caption"><span className="polaroid-title">{memory.title}</span><span>{memory.caption}</span>{memory.date && <small>{memory.date}</small>}</span><span className="tape" aria-hidden="true" /></motion.button>)}</div><p className="memory-signature">كل ذكرى حلوة تستاهل نحتفظ بيها <span>♡</span></p><AnimatePresence>{show && item && <Dialog title={item.title} onClose={() => setShow(false)} onArrowLeft={next} onArrowRight={prev}><div className="lightbox"><div className="lightbox-toolbar"><button className="icon-button" onClick={prev} aria-label="الصورة السابقة"><ChevronRight /></button><span>{selected + 1} من {story.memories.length}</span><button className="icon-button" onClick={next} aria-label="الصورة التالية"><ChevronLeft /></button></div><div className="lightbox-image" onTouchStart={event => setStartX(event.touches[0]?.clientX ?? null)} onTouchEnd={event => { const x = event.changedTouches[0]?.clientX; if (startX !== null && x !== undefined && Math.abs(x - startX) > 38) x < startX ? next() : prev(); setStartX(null) }}>{item.src ? <img src={item.src} alt={item.alt} /> : <span className={`photo-placeholder lightbox-placeholder photo-${selected % 6}`} role="img" aria-label={item.alt}><span className="placeholder-sun" /><span className="placeholder-hill hill-one" /><span className="placeholder-hill hill-two" /><span className="photo-placeholder-label">مكان صورتنا</span></span>}</div><h2>{item.title}</h2><p>{item.caption}</p>{item.date && <small>{item.date}</small>}</div></Dialog>}</AnimatePresence></Chapter>
}
function Reasons() {
  const { progress, update } = useProgress(); const [count, setCount] = useState(0); const index = progress.reason % story.reasons.length
  const reveal = () => { const next = (progress.reason + 1) % story.reasons.length; update({ reason: next }); setCount(count => count + 1) }
  return <Chapter id="reasons" title="بحبك ليه؟" subtitle="مفيش إجابة واحدة… فخلّينا نقول سبب كل مرة." icon={<Heart size={24} fill="currentColor" />}><div className="reasons-stage"><div className="reason-orbit orbit-one" /><div className="reason-orbit orbit-two" /><motion.div className="reason-card" key={progress.reason} initial={{ opacity: 0, y: 12, rotate: -1 }} animate={{ opacity: 1, y: 0, rotate: 0 }}><span className="reason-spark">✧</span><Eyebrow>سبب من قلبي</Eyebrow><p>{story.reasons[index]}</p><span className="reason-counter">السبب <strong>{index + 1}</strong> من {story.reasons.length}</span></motion.div><motion.button className="heart-button" aria-label="قوليلي سبب تاني" onClick={reveal} whileTap={{ scale: 0.86 }} animate={{ scale: count % 2 ? [1, 1.12, 1] : 1 }}><Heart size={30} fill="currentColor" /><span>سبب كمان</span></motion.button></div><p className="reason-note">وكل ما تضغطي… هتلاقي سبب جديد ❤️</p></Chapter>
}
function Quiz() {
  const { progress, update } = useProgress()
  const [step, setStep] = useState(0)
  const current = story.quiz[step]
  const answer = progress.answers[current.id] ?? []
  const [finished, setFinished] = useState(false)
  const replay = () => { update({ answers: {} }); setStep(0); setFinished(false) }
  const toggleAnswer = (choiceIndex: number) => {
    const next = answer.includes(choiceIndex) ? answer.filter(index => index !== choiceIndex) : [...answer, choiceIndex]
    update({ answers: { ...progress.answers, [current.id]: next } })
  }
  const answersBody = story.quiz.map((question, index) => {
    const selected = progress.answers[question.id] ?? []
    const choices = question.choices.filter((_, choiceIndex) => selected.includes(choiceIndex)).map(choice => choice.label)
    return `${index + 1}. ${question.question}\nإجاباتي: ${choices.join('، ') || '—'}`
  }).join('\n\n')
  const emailLink = `mailto:${story.quizAnswersEmail}?subject=${encodeURIComponent('إجابات اختبار تعرفيني قد إيه؟')}&body=${encodeURIComponent(`دي إجاباتي على أسئلتك ❤️\n\n${answersBody}`)}`

  return <Chapter id="quiz" title="تعرفيني قد إيه؟" subtitle="اختاري كل الإجابات اللي شايفاها شبهنا… مفيش إجابة غلط." icon={<span>🎠</span>}>
    <div className="quiz-shell">
      {finished ? <motion.div className="quiz-finished" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1}}>
        <span>🎉</span><Eyebrow>مفيش إجابات غلط</Eyebrow><h2>كسبنا وقت حلو سوا.</h2><p>وده أحلى من أي درجات ❤️</p>
        <ol className="quiz-answer-summary">{story.quiz.map(question => {
          const selected = progress.answers[question.id] ?? []
          const labels = question.choices.filter((_, index) => selected.includes(index)).map(choice => choice.label)
          return <li key={question.id}><span>{question.question}</span><strong>{labels.join('، ') || '—'}</strong></li>
        })}</ol>
        <p className="quiz-email-note">هتتفتح رسالة بريد بإجاباتك جاهزة؛ اضغطي «إرسال» عشان توصلني.</p>
        <div className="quiz-finished-actions"><a className="primary-button" href={emailLink}><Send size={16} /> ابعتيلي إجاباتك</a><button className="secondary-button" onClick={replay}><RotateCcw size={15} /> نلعبها تاني</button></div>
      </motion.div> : <>
        <div className="quiz-progress"><span>اختاري إجابة أو أكتر</span><span>{step + 1} من {story.quiz.length}</span><div><i style={{ width: `${(step + 1) / story.quiz.length * 100}%` }} /></div></div>
        <AnimatePresence mode="wait"><motion.div key={current.id} className="quiz-question" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
          <span className="question-spark">✳</span><h2>{current.question}</h2>
          <div className="quiz-choices">{current.choices.map((choice, index) => {
            const selected = answer.includes(index)
            return <button key={choice.label} type="button" aria-pressed={selected} className={`quiz-choice ${selected ? 'choice-selected' : ''}`} onClick={() => toggleAnswer(index)}><span className="choice-index">{['أ', 'ب', 'ج'][index]}</span><span>{choice.label}</span>{selected && <Check size={17} />}</button>
          })}</div>
          {answer.length > 0 && <div className="quiz-replies" aria-live="polite">{answer.map(index => <motion.p key={index} className="quiz-reply" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>{current.choices[index].reply}</motion.p>)}</div>}
        </motion.div></AnimatePresence>
        <div className="quiz-nav"><button className="text-button" disabled={step === 0} onClick={() => setStep(Math.max(step - 1, 0))}><ArrowRight size={15} /> السؤال اللي فات</button>{step < story.quiz.length - 1 ? <button className="primary-button" disabled={answer.length === 0} onClick={() => setStep(step + 1)}>السؤال اللي بعده <ArrowLeft size={16} /></button> : <button className="primary-button" disabled={answer.length === 0} onClick={() => setFinished(true)}>نهاية لطيفة <Heart size={16} /></button>}</div>
      </>}
    </div><p className="quiz-reassure"><Heart size={14} />دي لعبة عشان نضحك سوا، مفيش امتحان.</p>
  </Chapter>
}
function ScratchCard() {
  const { progress, update } = useProgress(); const canvas = useRef<HTMLCanvasElement>(null); const box = useRef<HTMLDivElement>(null); const drawing = useRef(false); const lastSample = useRef(0); const [localReveal, setLocalReveal] = useState(false); const revealed = progress.scratched || localReveal
  const paint = useCallback(() => { const element = canvas.current; const wrapper = box.current; if (!element || !wrapper || revealed) return; const rect = wrapper.getBoundingClientRect(); const dpr = Math.min(window.devicePixelRatio || 1, 2); element.width = Math.round(rect.width * dpr); element.height = Math.round(rect.height * dpr); const context = element.getContext('2d'); if (!context) return; context.scale(dpr, dpr); context.globalCompositeOperation = 'source-over'; context.fillStyle = '#c6a878'; context.fillRect(0, 0, rect.width, rect.height); context.strokeStyle = 'rgba(255,255,255,.22)'; context.lineWidth = 1; for (let x = -rect.height; x < rect.width; x += 17) { context.beginPath(); context.moveTo(x, 0); context.lineTo(x + rect.height, rect.height); context.stroke() } context.fillStyle = '#fff9ed'; context.textAlign = 'center'; context.font = '600 14px Cairo, sans-serif'; context.fillText('اكشفي المفاجأة من هنا ✧', rect.width / 2, rect.height / 2 + 5) }, [revealed])
  useEffect(() => { paint(); window.addEventListener('resize', paint); return () => window.removeEventListener('resize', paint) }, [paint])
  const position = (event: ReactPointerEvent<HTMLCanvasElement>) => { const rect = event.currentTarget.getBoundingClientRect(); return { x: event.clientX - rect.left, y: event.clientY - rect.top } }
  const scratch = (event: ReactPointerEvent<HTMLCanvasElement>) => { if (!drawing.current) return; const canvasEl = event.currentTarget; const context = canvasEl.getContext('2d'); if (!context) return; const point = position(event); context.globalCompositeOperation = 'destination-out'; context.beginPath(); context.arc(point.x, point.y, 20, 0, Math.PI * 2); context.fill(); const now = performance.now(); if (now - lastSample.current > 240) { lastSample.current = now; const pixels = context.getImageData(0, 0, canvasEl.width, canvasEl.height).data; let transparent = 0; const stride = 20; let count = 0; for (let i = 3; i < pixels.length; i += stride * 4) { count++; if (pixels[i] < 128) transparent++ } if (count && transparent / count > 0.4) { drawing.current = false; setLocalReveal(true); update({ scratched: true }) } } }
  return <Chapter id="scratch" title="مفاجأة مستخبية" subtitle="في حاجة عايز أقولهالك… بس سيبتلك تكتشفيها بنفسك 🤭" icon={<Sparkles size={24} />}><div className="scratch-intro"><span>خدي نفس صغير… واكتشفي اللي تحت ✧</span></div><div className="scratch-wrap" ref={box}><div className="scratch-message" aria-live="polite"><span className="scratch-message-heart">♡</span><p>لو رجع بيا الزمن ألف مرة،<br />هختارك إنتي كل مرة. ❤️</p><span className="scratch-message-signature">من قلب حبيبك</span></div>{!revealed && <canvas ref={canvas} className="scratch-canvas" aria-hidden="true" onPointerDown={event => { drawing.current = true; event.currentTarget.setPointerCapture(event.pointerId); scratch(event) }} onPointerMove={scratch} onPointerUp={event => { drawing.current = false; try { event.currentTarget.releasePointerCapture(event.pointerId) } catch { /* Pointer may already be released. */ } }} onPointerCancel={() => { drawing.current = false }} />}{revealed && <motion.div className="scratch-celebration" aria-hidden="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>✧　♡　✧</motion.div>}</div>{!revealed && <button className="secondary-button scratch-reveal" onClick={() => { setLocalReveal(true); update({ scratched: true }) }}><Sparkles size={16} /> اكشفي الرسالة</button>}{revealed && <motion.p className="scratch-congrats" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>كل مرة هختارك ❤️</motion.p>}</Chapter>
}
function PromiseChapter() {
  return <Chapter id="promise" title="وعدنا لبعض" subtitle="وعد من قلبي، نفضل فاكرينه وإحنا بنكمّل سوا." icon={<Heart size={24} />}><motion.article className="promise-note" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}><span className="promise-mark">♡</span><Eyebrow>وعد مني ليكي</Eyebrow><p>{story.promise}</p><span className="promise-signoff">بحبك، {story.names.sender} <Heart size={15} fill="currentColor" /></span></motion.article></Chapter>
}
function FinalLetter() {
  const { update } = useProgress(); const [seal, setSeal] = useState(0); const [easterEgg, setEasterEgg] = useState(false)
  useEffect(() => { update({ finalOpened: true }) }, [update])
  return <><SiteHeader /><Page><div className="chapter-top"><BackHome /><span className="final-chapter-label"><Sparkles size={14} />آخر هدية من قلبي</span></div><motion.section className="final-letter" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}><div className="final-glow" aria-hidden="true" /><div className="final-petals" aria-hidden="true">✧　♡　✧</div><span className="final-eyebrow">لما كل الهدايا تبقى ذكرى…</span><div className="final-heart-mark"><Heart size={34} fill="currentColor" /></div><h1>لسه في هدية أخيرة…</h1><div className="final-letter-rule"><i /><span>✧</span><i /></div><article className="final-paper"><p className="final-greeting">يا أحلى هدية في حياتي،</p><p className="final-body">{story.finalLetter}</p><p className="final-signature">بحبك أوي،<br /><span>{story.names.sender}</span><Heart size={17} fill="currentColor" /></p><button className="wax-seal" aria-label="ختم الرسالة" onClick={() => { const next = seal + 1; setSeal(next); if (next >= 3) { setEasterEgg(true); setSeal(0) } }}>♡</button>{easterEgg && <motion.p className="seal-secret" role="status" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>والسر الصغير؟ إنتي أحلى من كل الهدايا ❤️</motion.p>}</article><p className="final-ending">ودي مش نهاية الحكاية…<br /><em>دي لسه أولها.</em> ❤️</p><button className="secondary-button final-return" onClick={() => window.location.hash = '/world'}><ArrowLeft size={16} /> نرجع لعالمنا الصغير</button></motion.section></Page></>
}
function GiftRoute() {
  const { giftId } = useParams(); const known = giftMeta.some(gift => gift.id === giftId)
  if (!known) return <Navigate to="/world" replace />
  switch (giftId as GiftId) {
    case 'letters': return <Letters />
    case 'memories': return <Memories />
    case 'reasons': return <Reasons />
    case 'quiz': return <Quiz />
    case 'scratch': return <ScratchCard />
    case 'promise': return <PromiseChapter />
  }
}
function useParams() { const location = useLocation(); return { giftId: location.pathname.split('/')[2] } }
export function App() {
  const state = useProgressValue(); const location = useLocation()
  const notEntered = !state.progress.entered && location.pathname !== '/'
  const unlocked = giftMeta.every(gift => state.progress.gifts.includes(gift.id))
  return <ProgressContext.Provider value={state}><Shell>{notEntered ? <Navigate to="/" replace /> : <AnimatePresence mode="wait"><Routes location={location} key={location.pathname}><Route path="/" element={state.progress.entered ? <Navigate to="/world" replace /> : <Welcome />} /><Route path="/world" element={<Dashboard />} /><Route path="/gift/:giftId" element={<GiftRoute />} /><Route path="/final" element={unlocked ? <FinalLetter /> : <Navigate to="/world" replace />} /><Route path="*" element={<Navigate to={state.progress.entered ? '/world' : '/'} replace />} /></Routes></AnimatePresence>}</Shell></ProgressContext.Provider>
}
