import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react'
import { ArrowLeft, ArrowRight, ArrowUpLeft, Check, ChevronLeft, ChevronRight, Gift, Heart, Image as ImageIcon, LockKeyhole, RotateCcw, Send, Sparkles, Volume2, VolumeX, X } from 'lucide-react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { giftMeta, story, type GiftId } from './content'
import { BranchingStory, CloserQuestions, Constellation, ImagineGame, OurTimeline, SecretCode, TreasureMap, UnsentLetters, WhoGame, WordPuzzle } from './NewChapters'
import { HeartBurst, PetalShower, RevealText, Sky, revealDuration } from './effects'

type Progress = { version: 1; entered: boolean; gifts: string[]; letters: string[]; reason: number; answers: Record<string, number[]>; scratched: boolean; finalOpened: boolean }
// The original chapters she already opened before the update; they always show as opened.
const alreadyOpened: GiftId[] = ['letters', 'memories', 'reasons', 'quiz', 'scratch', 'promise']
const defaultProgress: Progress = { version: 1, entered: false, gifts: [...alreadyOpened], letters: [], reason: 0, answers: {}, scratched: false, finalOpened: false }
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
    return { ...defaultProgress, entered: Boolean(value.entered), gifts: [...new Set([...alreadyOpened, ...(Array.isArray(value.gifts) ? value.gifts.filter(id => giftMeta.some(g => g.id === id)) : [])])], letters: Array.isArray(value.letters) ? value.letters.filter(id => story.letters.some(l => l.id === id)) : [], reason: Number.isInteger(value.reason) && value.reason! >= 0 && value.reason! < story.reasons.length ? value.reason! : 0, answers, scratched: Boolean(value.scratched), finalOpened: Boolean(value.finalOpened) }
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
function Ambient() { return <Sky /> }
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
  return <div className="site-header"><a href="#/world" className="brand" onClick={event => { event.preventDefault(); window.location.hash = '/world' }}><span className="brand-mark"><Heart size={17} fill="currentColor" /></span><span>حكايتنا<span className="brand-dot">.</span></span></a><div className="header-tools"><span className="header-note">هدية صغيرة من قلبي</span><MusicToggle /><button className="icon-button tiny-heart" aria-label="لمسة سرية" title="لمسة سرية" onClick={() => { const next = taps + 1; setTaps(next); if (next >= 5) { setSecret(true); setTaps(0) } }}><Heart size={16} /></button><button className="reset-button" onClick={() => setResetAsk(value => !value)}><RotateCcw size={14} /><span>ابدئي من الأول</span></button></div>{secret && <div className="secret-note" role="status">سر صغير يا ننس: وجودك أحلى تفصيلة في حكايتي ❤️ <button onClick={() => setSecret(false)} aria-label="إغلاق"><X size={14} /></button></div>}{resetAsk && <div className="secret-note reset-note" role="group" aria-label="إعادة البداية"><span>هنبدأ من أول هدية؟</span><button className="reset-confirm" onClick={() => { reset(); update({ entered: true }); setResetAsk(false); window.location.hash = '/world' }}>آه، ابدئي من جديد</button><button onClick={() => setResetAsk(false)}>لأ</button></div>}</div>
}
function Shell({ children }: { children: ReactNode }) {
  const location = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }) }, [location.pathname])
  return <div className="app-shell"><Ambient />{children}<footer className="site-footer"><span>اتعملت بحب، مخصوص لنانوسة</span><Heart size={13} fill="currentColor" /><span>وباقي الحكاية لسه جاية</span></footer></div>
}
function Welcome() {
  const navigate = useNavigate(); const { update } = useProgress(); const reduce = useReducedMotion(); const [opening, setOpening] = useState(false)
  const start = () => { if (opening) return; setOpening(true); window.setTimeout(() => { update({ entered: true }); navigate('/world') }, reduce ? 180 : 1050) }
  return <div className="welcome-screen"><div className="welcome-top"><Eyebrow>رسالة صغيرة قبل ما نبدأ</Eyebrow></div><div className="welcome-copy"><motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>في ليلة هادية… والنجوم شاهدة،</motion.p><motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduce ? 0 : 0.45, duration: 0.8 }}>وعشانك يا قلبي، يا أغلى حد عندي،<br /><em>عملتلك حاجة مخصوص.</em></motion.h1></div><button className={`envelope-hero ${opening ? 'is-opening' : ''}`} onClick={start} aria-label={opening ? 'الجواب بيتفتح' : 'افتحي جوابك يا روحي'} disabled={opening}><span className="env-back" aria-hidden="true" /><span className="env-letter" aria-hidden="true"><span>إلى {story.names.recipient}</span><span className="env-letter-heart">♥</span></span><span className="env-front" aria-hidden="true" /><span className="env-flap" aria-hidden="true" /><span className="env-seal" aria-hidden="true">♥</span><Sparkles className="gift-spark spark-a" size={19} /><Sparkles className="gift-spark spark-b" size={14} /><Heart className="gift-spark spark-c" size={17} fill="currentColor" />{opening && <PetalShower count={22} delay={0.35} />}</button><div className="welcome-bottom"><button className="primary-button welcome-button" onClick={start} disabled={opening}>{opening ? 'الجواب بيتفتح…' : 'افتحي جوابك يا روحي'} {opening ? <Sparkles size={18} /> : <Gift size={19} />}</button><span>خدي وقتك… دي حكايتنا سوا <span>✧</span></span></div><div className="welcome-moon" aria-hidden="true" /></div>
}
function GiftCard({ id, index, opening, onOpen }: { id: GiftId; index: number; opening: boolean; onOpen: () => void }) {
  const item = giftMeta.find(gift => gift.id === id)!; const { progress } = useProgress(); const opened = progress.gifts.includes(id); const isNew = !opened && !alreadyOpened.includes(id)
  return <motion.button className={`gift-card gift-${id} ${opened ? 'is-opened' : ''} ${opening ? 'gift-card-opening' : ''}`} onClick={onOpen} disabled={opening} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.045 }} whileHover={{ y: -4 }} whileTap={{ scale: 0.985 }}>
    <span className="gift-ornament" aria-hidden="true">{item.emoji}</span><span className="gift-copy"><span className="gift-title">{item.title}{isNew && <span className="new-badge">جديد ✨</span>}</span><span className="gift-hint">{item.hint}</span></span><span className="card-corner">{opened ? <Check size={16} /> : <ArrowUpLeft size={16} />}</span><span className="gift-seal" aria-label={opened ? 'هدية مفتوحة' : 'هدية لسه متفتحتش'}>{opened ? '♥' : '✧'}</span>
  </motion.button>
}
const HEART_PATH = 'M16 28.5C16 28.5 1 19.5 1 9.6 1 4.6 4.9 1 9.4 1c2.9 0 5.3 1.6 6.6 4 1.3-2.4 3.7-4 6.6-4C27.1 1 31 4.6 31 9.6c0 9.9-15 18.9-15 18.9Z'
function ProgressHeart({ ratio }: { ratio: number }) {
  return <svg className="progress-heart" viewBox="0 0 32 30" aria-hidden="true"><defs><linearGradient id="heart-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f1a1b6" /><stop offset="1" stopColor="#b8304f" /></linearGradient><clipPath id="heart-level"><motion.rect x="0" width="32" height="30" initial={{ y: 30 }} animate={{ y: 30 - 30 * ratio }} transition={{ duration: 1.1, ease: 'easeOut' }} /></clipPath></defs><path d={HEART_PATH} className="heart-empty" /><path d={HEART_PATH} fill="url(#heart-gold)" clipPath="url(#heart-level)" /><path d={HEART_PATH} className="heart-outline" /></svg>
}
function Dashboard() {
  const navigate = useNavigate(); const { progress } = useProgress(); const [openingGift, setOpeningGift] = useState<GiftId | null>(null); const allOpened = giftMeta.every(item => progress.gifts.includes(item.id)); const count = giftMeta.filter(item => progress.gifts.includes(item.id)).length
  const openGift = (id: GiftId) => { if (openingGift) return; setOpeningGift(id); window.setTimeout(() => navigate(`/gift/${id}`), 530) }
  return <><SiteHeader /><Page><div className="world-intro"><Eyebrow>لحظات صغيرة… من عالمنا</Eyebrow><div className="world-heading"><div><h1>كل جواب هنا<br /><em>حتة من قلبي ليكي.</em></h1><p>خدي وقتك تحت النجوم… كل باب هنا بيفتحلك ذكرى حلوة، وكل ما تفتحي واحد القلب بيتملي أكتر.</p></div><div className="progress-seal"><ProgressHeart ratio={count / giftMeta.length} /><span>{count}<i>/</i>{giftMeta.length}</span><span>هدايا فتحناها</span></div></div></div>
    <div className="gift-grid" aria-label="الهدايا">{giftMeta.map((item, index) => <GiftCard key={item.id} id={item.id} index={index} opening={openingGift === item.id} onOpen={() => openGift(item.id)} />)}
      <motion.button className={`gift-card final-gift ${allOpened ? 'final-unlocked' : ''}`} onClick={() => allOpened && navigate('/final')} aria-disabled={!allOpened} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}><span className="gift-ornament"><span className="final-heart">{allOpened ? '♡' : <LockKeyhole size={25} />}</span></span><span className="gift-copy"><span className="gift-title">{allOpened ? 'حكايتنا خطوة بخطوة 🕰️' : 'لسه في هدية أخيرة…'}</span><span className="gift-hint">{allOpened ? 'آخر هدية… حكايتنا من أول مكالمة لحد النهارده' : 'افتحي كل الهدايا عشان توصلي لأحلى هدية'}</span></span><span className="card-corner">{allOpened ? <ArrowUpLeft size={16} /> : <LockKeyhole size={15} />}</span><span className="gift-seal">{allOpened ? '♥' : '✧'}</span></motion.button>
    </div><div className="world-note"><Sparkles size={15} />كل باب تقدري تفتحيه تاني وقت ما تحبي{!allOpened && <span> · {giftMeta.length - count} هدايا لسه مستنياكي</span>}</div>
    {allOpened && <motion.div className="unlock-banner" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><span>كل الهدايا اتفتحت… وآخر هدية «حكايتنا خطوة بخطوة» بقت مستنياكي ❤️</span><button onClick={() => navigate('/final')}>افتحيها <ChevronLeft size={16} /></button></motion.div>}
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
  return <Chapter id="letters" title="افتحي لما…" subtitle="لكل إحساس جواب مقفول بختم… اختاري اللي شبه قلبك دلوقتي." icon={<span>✉</span>}><div className="envelope-grid">{story.letters.map((item, index) => <motion.button key={item.id} className={`envelope-card ${progress.letters.includes(item.id) ? 'envelope-opened' : ''}`} onClick={() => open(item.id)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} whileHover={{ y: -3 }}><span className="envelope-art"><span className="envelope-paper" /><span className="envelope-heart">{item.emoji}</span><span className="envelope-fold" /></span><span className="envelope-name">{item.title}</span><span className="envelope-action">{progress.letters.includes(item.id) ? 'اقريها تاني' : 'افتحي الرسالة'} <ArrowLeft size={14} /></span></motion.button>)}</div><AnimatePresence>{letter && <Dialog title={letter.title} onClose={() => setSelected(null)}><div className="letter-open"><motion.span className="letter-flap" aria-hidden="true" initial={{ rotateX: 0, opacity: 1 }} animate={{ rotateX: 180, opacity: 0 }} transition={{ duration: 0.75, ease: 'easeInOut' }} /><motion.div className="letter-sheet" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.65 }}><span className="letter-stamp">{letter.emoji}</span><p className="letter-to">{letter.greeting ?? `يا ${story.names.recipient}، يا أجمل حاجة في أيامي،`}</p><h2>{letter.title.replace(/\s*\p{Extended_Pictographic}.*/u, '')}</h2><p className="letter-body">{letter.body}</p><p className="letter-signature">بحبك دايمًا،<br /><span>{story.names.sender} ❤️</span></p></motion.div></div></Dialog>}</AnimatePresence></Chapter>
}
function Memories() {
  const [selected, setSelected] = useState(0); const [startX, setStartX] = useState<number | null>(null); const [show, setShow] = useState(false)
  const item = story.memories[selected]; const prev = () => setSelected(index => (index - 1 + story.memories.length) % story.memories.length); const next = () => setSelected(index => (index + 1) % story.memories.length)
  return <Chapter id="memories" title="ألبوم حكايتنا" subtitle="صور صغيرة… شايلة أيام كبيرة في قلبي." icon={<ImageIcon size={24} />}><div className="memory-grid">{story.memories.map((memory, index) => <motion.button key={memory.id} onClick={() => { setSelected(index); setShow(true) }} className={`polaroid polaroid-${index % 4}`} whileHover={{ y: -5, rotate: 0 }}><span className="photo-window">{memory.src ? <img src={memory.thumbnailSrc || memory.src} alt={memory.alt} loading="lazy" decoding="async" /> : <span className={`photo-placeholder photo-${index % 6}`} role="img" aria-label={memory.alt}><span className="placeholder-sun" /><span className="placeholder-hill hill-one" /><span className="placeholder-hill hill-two" /><span className="photo-placeholder-label">مكان صورتنا</span></span>}<span className="photo-heart">♡</span></span><span className="polaroid-caption"><span className="polaroid-title">{memory.title}</span><span>{memory.caption}</span>{memory.date && <small>{memory.date}</small>}</span><span className="tape" aria-hidden="true" /></motion.button>)}</div><p className="memory-signature">كل ذكرى حلوة تستاهل نحتفظ بيها <span>♡</span></p><AnimatePresence>{show && item && <Dialog title={item.title} onClose={() => setShow(false)} onArrowLeft={next} onArrowRight={prev}><div className="lightbox"><div className="lightbox-toolbar"><button className="icon-button" onClick={prev} aria-label="الصورة السابقة"><ChevronRight /></button><span>{selected + 1} من {story.memories.length}</span><button className="icon-button" onClick={next} aria-label="الصورة التالية"><ChevronLeft /></button></div><div className="lightbox-image" onTouchStart={event => setStartX(event.touches[0]?.clientX ?? null)} onTouchEnd={event => { const x = event.changedTouches[0]?.clientX; if (startX !== null && x !== undefined && Math.abs(x - startX) > 38) x < startX ? next() : prev(); setStartX(null) }}>{item.src ? <img src={item.src} alt={item.alt} /> : <span className={`photo-placeholder lightbox-placeholder photo-${selected % 6}`} role="img" aria-label={item.alt}><span className="placeholder-sun" /><span className="placeholder-hill hill-one" /><span className="placeholder-hill hill-two" /><span className="photo-placeholder-label">مكان صورتنا</span></span>}</div><h2>{item.title}</h2><p>{item.caption}</p>{item.date && <small>{item.date}</small>}</div></Dialog>}</AnimatePresence></Chapter>
}
function Reasons() {
  const { progress, update } = useProgress(); const [count, setCount] = useState(0); const index = progress.reason % story.reasons.length
  const reveal = () => { const next = (progress.reason + 1) % story.reasons.length; update({ reason: next }); setCount(count => count + 1) }
  return <Chapter id="reasons" title="بحبك ليه؟" subtitle="مفيش إجابة واحدة… فخلّينا نقول سبب كل مرة." icon={<Heart size={24} fill="currentColor" />}><div className="reasons-stage"><div className="reason-orbit orbit-one" /><div className="reason-orbit orbit-two" /><motion.div className="reason-card" key={progress.reason} initial={{ opacity: 0, y: 24, scale: 0.96, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }} transition={{ duration: 0.7 }}><span className="reason-spark">✧</span><Eyebrow>سبب من قلبي</Eyebrow><p>{story.reasons[index]}</p><span className="reason-counter">السبب <strong>{index + 1}</strong> من {story.reasons.length}</span></motion.div><motion.button className="heart-button" aria-label="قوليلي سبب تاني" onClick={reveal} whileTap={{ scale: 0.86 }} animate={{ scale: count % 2 ? [1, 1.12, 1] : 1 }}>{count > 0 && <HeartBurst key={count} />}<Heart size={30} fill="currentColor" /><span>سبب كمان</span></motion.button></div><p className="reason-note">وكل ما تضغطي يا حبيبتي… هتلاقي سبب جديد ❤️</p></Chapter>
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
        <span>🎉</span><Eyebrow>مفيش إجابات غلط</Eyebrow><h2>برافو يا نانوسة… كسبنا وقت حلو سوا.</h2><p>وده أحلى من أي درجات ❤️</p>
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
  const paint = useCallback(() => { const element = canvas.current; const wrapper = box.current; if (!element || !wrapper || revealed) return; const rect = wrapper.getBoundingClientRect(); const dpr = Math.min(window.devicePixelRatio || 1, 2); element.width = Math.round(rect.width * dpr); element.height = Math.round(rect.height * dpr); const context = element.getContext('2d'); if (!context) return; context.scale(dpr, dpr); context.globalCompositeOperation = 'source-over'; const foil = context.createLinearGradient(0, 0, rect.width, rect.height); foil.addColorStop(0, '#8a6427'); foil.addColorStop(0.3, '#e9c77d'); foil.addColorStop(0.5, '#fff1c4'); foil.addColorStop(0.7, '#d4a650'); foil.addColorStop(1, '#7a5520'); context.fillStyle = foil; context.fillRect(0, 0, rect.width, rect.height); context.fillStyle = 'rgba(255,250,230,.55)'; for (let i = 0; i < 90; i++) { context.beginPath(); context.arc(Math.random() * rect.width, Math.random() * rect.height, Math.random() * 1.4, 0, Math.PI * 2); context.fill() } context.fillStyle = '#3d1424'; context.textAlign = 'center'; context.font = '600 14px Cairo, sans-serif'; context.fillText('اكشفي المفاجأة من هنا ✧', rect.width / 2, rect.height / 2 + 5) }, [revealed])
  useEffect(() => { paint(); window.addEventListener('resize', paint); return () => window.removeEventListener('resize', paint) }, [paint])
  const position = (event: ReactPointerEvent<HTMLCanvasElement>) => { const rect = event.currentTarget.getBoundingClientRect(); return { x: event.clientX - rect.left, y: event.clientY - rect.top } }
  const scratch = (event: ReactPointerEvent<HTMLCanvasElement>) => { if (!drawing.current) return; const canvasEl = event.currentTarget; const context = canvasEl.getContext('2d'); if (!context) return; const point = position(event); context.globalCompositeOperation = 'destination-out'; context.beginPath(); context.arc(point.x, point.y, 20, 0, Math.PI * 2); context.fill(); const now = performance.now(); if (now - lastSample.current > 240) { lastSample.current = now; const pixels = context.getImageData(0, 0, canvasEl.width, canvasEl.height).data; let transparent = 0; const stride = 20; let count = 0; for (let i = 3; i < pixels.length; i += stride * 4) { count++; if (pixels[i] < 128) transparent++ } if (count && transparent / count > 0.4) { drawing.current = false; setLocalReveal(true); update({ scratched: true }) } } }
  return <Chapter id="scratch" title="مفاجأة مستخبية" subtitle="تحت طبقة الدهب دي سر صغير… سيبتلك تكتشفيه بإيدك 🤭" icon={<Sparkles size={24} />}><div className="scratch-intro"><span>خدي نفس صغير… واكتشفي اللي تحت ✧</span></div><div className="scratch-wrap" ref={box}><div className="scratch-message" aria-live="polite"><span className="scratch-message-heart">♡</span><p>لو رجع بيا الزمن ألف مرة،<br />هختارك إنتي كل مرة. ❤️</p><span className="scratch-message-signature">من قلب {story.names.sender} حبيبك</span></div>{!revealed && <canvas ref={canvas} className="scratch-canvas" aria-hidden="true" onPointerDown={event => { drawing.current = true; event.currentTarget.setPointerCapture(event.pointerId); scratch(event) }} onPointerMove={scratch} onPointerUp={event => { drawing.current = false; try { event.currentTarget.releasePointerCapture(event.pointerId) } catch { /* Pointer may already be released. */ } }} onPointerCancel={() => { drawing.current = false }} />}{revealed && <><PetalShower count={18} /><motion.div className="scratch-celebration" aria-hidden="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>✧　♡　✧</motion.div></>}</div>{!revealed && <button className="secondary-button scratch-reveal" onClick={() => { setLocalReveal(true); update({ scratched: true }) }}><Sparkles size={16} /> اكشفي الرسالة</button>}{revealed && <motion.p className="scratch-congrats" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>كل مرة هختارك ❤️</motion.p>}</Chapter>
}
function PromiseChapter() {
  const done = revealDuration(story.promise)
  return <Chapter id="promise" title="وعدنا لبعض" subtitle="وعد مكتوب بقلبي، نفضل فاكرينه وإحنا بنكمّل سوا." icon={<Heart size={24} />}><motion.article className="promise-note" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}><PetalShower count={16} delay={done} /><span className="promise-mark">♡</span><Eyebrow>وعد مني ليكي</Eyebrow><RevealText text={story.promise} /><motion.span className="promise-signoff" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: done }}>بحبك، {story.names.sender} <Heart size={15} fill="currentColor" /></motion.span></motion.article></Chapter>
}
function FinalLetter() {
  const { update } = useProgress(); const [seal, setSeal] = useState(0); const [easterEgg, setEasterEgg] = useState(false)
  const letterRef = useRef<HTMLElement>(null); const letterSeen = useInView(letterRef, { once: true, margin: '0px 0px -25% 0px' })
  useEffect(() => { update({ finalOpened: true }) }, [update])
  return <><SiteHeader /><Page><div className="chapter-top"><BackHome /><span className="final-chapter-label"><Sparkles size={14} />آخر هدية من قلبي</span></div><motion.section className="final-letter" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}><div className="final-glow" aria-hidden="true" /><div className="final-petals" aria-hidden="true">✦ ♥ ✦</div><span className="final-eyebrow">لما كل الهدايا تبقى ذكرى يا قلبي…</span><div className="final-heart-mark"><span className="final-heart-emoji">🕰️</span></div><h1>حكايتنا خطوة بخطوة</h1><p className="final-lead">آخر هدية مش حاجة جديدة… دي إحنا. من أول مكالمة لحد النهارده، خطوة ورا خطوة.</p><div className="final-letter-rule"><i /><span>✧</span><i /></div></motion.section>
    <OurTimeline />
    <section className="final-letter final-closing"><div className="final-letter-rule"><i /><span>♥</span><i /></div><span className="final-eyebrow">ولسه في كلمة أخيرة…</span><article className="final-paper" ref={letterRef}><p className="final-greeting">يا {story.names.recipient}، يا أحلى هدية في حياتي،</p><RevealText className="final-body" text={story.finalLetter} start={0.5} step={0.7} play={letterSeen} />{letterSeen && <PetalShower count={26} delay={revealDuration(story.finalLetter, 0.5, 0.7)} />}<p className="final-signature">بحبك أوي،<br /><span>{story.names.sender}</span><Heart size={17} fill="currentColor" /></p><button className="wax-seal" aria-label="ختم الرسالة" onClick={() => { const next = seal + 1; setSeal(next); if (next >= 3) { setEasterEgg(true); setSeal(0) } }}>♡</button>{easterEgg && <motion.p className="seal-secret" role="status" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>والسر الصغير يا ننس؟ إنتي أحلى من كل الهدايا ❤️</motion.p>}</article><p className="final-ending">ودي مش نهاية الحكاية…<br /><em>دي لسه أولها.</em> ❤️</p><button className="secondary-button final-return" onClick={() => window.location.hash = '/world'}><ArrowLeft size={16} /> نرجع لعالمنا الصغير</button></section></Page></>
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
    case 'unsent': return <Chapter id="unsent" title="رسايل ما بعتهاش" subtitle="كلام فضل جوا قلبي… ودلوقتي بقى بتاعك." icon={<span>💌</span>}><UnsentLetters /></Chapter>
    case 'puzzle': return <Chapter id="puzzle" title="لمّي كلام قلبي" subtitle="الكلمات اتلخبطت من كتر الحب… رتبيها." icon={<span>🧩</span>}><WordPuzzle /></Chapter>
    case 'who': return <Chapter id="who" title="مين فينا؟" subtitle="اختاري إجابتك وشوفي أنا كنت هختار مين." icon={<span>🤭</span>}><WhoGame /></Chapter>
    case 'code': return <Chapter id="code" title="شفرة بينا" subtitle="حلي الألغاز وافتحي الرسالة السرية." icon={<span>🔐</span>}><SecretCode /></Chapter>
    case 'imagine': return <Chapter id="imagine" title="لو كنا…" subtitle="اختيارات صغيرة لحكايتنا الكبيرة." icon={<span>💭</span>}><ImagineGame /></Chapter>
    case 'story': return <Chapter id="story" title="حكاية قبل النوم" subtitle="اختاري طريق حكايتنا، وكل اختيار له نهاية حلوة." icon={<span>🌙</span>}><BranchingStory /></Chapter>
    case 'questions': return <Chapter id="questions" title="سؤال مني وإجابة مني" subtitle="جاوبي براحتك، وبعدها افتحي إجابتي." icon={<span>🫶</span>}><CloserQuestions /></Chapter>
    case 'stars': return <Chapter id="stars" title="سما بتاعتنا" subtitle="كل نجمة ذكرى… ولما يتوصلوا، يبان سرّهم." icon={<span>🌌</span>}><Constellation /></Chapter>
    case 'treasure': return <Chapter id="treasure" title="رحلة لجوا قلبي" subtitle="اتبعي المحطات واجمعي أجزاء الرسالة." icon={<span>🗺️</span>}><TreasureMap /></Chapter>
  }
}
function useParams() { const location = useLocation(); return { giftId: location.pathname.split('/')[2] } }
export function App() {
  const state = useProgressValue(); const location = useLocation()
  const notEntered = !state.progress.entered && location.pathname !== '/'
  const unlocked = giftMeta.every(gift => state.progress.gifts.includes(gift.id))
  return <ProgressContext.Provider value={state}><Shell>{notEntered ? <Navigate to="/" replace /> : <AnimatePresence mode="wait"><Routes location={location} key={location.pathname}><Route path="/" element={state.progress.entered ? <Navigate to="/world" replace /> : <Welcome />} /><Route path="/world" element={<Dashboard />} /><Route path="/gift/:giftId" element={<GiftRoute />} /><Route path="/final" element={unlocked ? <FinalLetter /> : <Navigate to="/world" replace />} /><Route path="*" element={<Navigate to={state.progress.entered ? '/world' : '/'} replace />} /></Routes></AnimatePresence>}</Shell></ProgressContext.Provider>
}
