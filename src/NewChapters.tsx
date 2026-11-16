import { useState } from 'react'
import { motion } from 'motion/react'
import { Check, Copy, Heart, Lock, Mail, MessageCircle, RotateCcw } from 'lucide-react'
import { story } from './content'
import { HeartBurst, PetalShower } from './effects'

const unsent = [
  ['قبل ما أكلم عمو حسام', 'قبل المكالمة دي كنت مرتب الكلام كله في دماغي، وأول ما اتصلت نسيت كل حاجة كنت مرتبها من كتر التوتر 😅 بس الحمد لله، ربنا سترها، ومن ساعتها وأنا بحمد ربنا إني اتصلت.'],
  ['أول مرة دخلت بيتكم', 'كنت بحاول أركز في كلام العيلة وأبان هادي، بس عيني كانت كل شوية بتروح عندك. وأنا نازل من عندكم كنت مرتاح بطريقة ما عرفتش أشرحها لحد.'],
  ['حاجة بكسف أقولها', 'يا ننس، أنا مش شاطر في الكلام الحلو وش لوش، وساعات بقول «تمام» وجوايا كلام كتير. فخلّي الرسايل دي تقولك اللي بيقف عندي: إنك فرقتي معايا بجد.'],
  ['بعد مشوار الخميس', 'كل خميس بعد ما بوصلك وأرجع لوحدي، بفضل أفتكر كلامنا في الطريق وأبتسم زي العبيط 😄 عمري ما قلتلك إن الطريق ده أحلى حتة في أسبوعي.'],
]
const whoQs = [
  ['مين فينا هيصالح التاني الأول؟', 'أنا طبعًا… ما بعرفش أطول وأنا زعلان منك ❤️'],
  ['مين فينا هيحتفظ بكل الصور؟', 'إحنا الاتنين… كل صورة لينا هتبقى محفوظة عندي وعندك 📸'],
  ['مين فينا هيقترح خروجة في آخر لحظة؟', 'أنا غالبًا، وإنتي هتخلّيها أحلى خروجة.'],
  ['مين فينا بيضحك التاني أكتر؟', 'إحنا الاتنين… ودي أحلى إجابة.'],
  ['مين فينا قال «بحبك» الأول؟', 'أنا… وإنتي رديتي بـ«وأنا كمان» 🤭 ولسه بتفرّحني كل ما أفتكرها.'],
  ['مين فينا بيستنى يوم الخميس أكتر؟', 'أنا… من أول الأسبوع وأنا بعدّ الأيام لحد ما أجي آخدك.'],
  ['مين فينا هيخلّص الشوكولاتة الأول؟', 'إنتي طبعًا 😄 وأنا هفضل أجيبلك غيرها.'],
  ['مين فينا هيصحّي التاني على الفجر؟', 'إحنا الاتنين… اللي يصحى الأول يصحّي التاني 🤍'],
  ['مين فينا رأيه هيمشي في تجهيزات الشقة؟', 'إحنا الاتنين… هنختار سوا ونتفق على كل حاجة، عشان بيتنا يبقى شبهنا إحنا الاتنين 🏡'],
  ['مين فينا بيوحشه التاني أسرع؟', 'أنا… لسه بنقفل المكالمة وأنا عايز أكلمك تاني.'],
]
const imagineQs = [
  ['لو حكايتنا فيلم، اسمه هيكون إيه؟', ['حكاية بدأت بصدفة حلوة', 'لسه أول الحكاية', 'إنتي أجمل مشهد']],
  ['لو عندنا يوم كامل سوا، نبدأه بإيه؟', ['فطار طويل وحكاوي', 'نروح مكان جديد', 'نقضي اليوم على راحتنا']],
  ['لو نكرر ذكرى، تختاري إيه؟', ['يوم خطوبتنا', 'أول قعدة لينا في Cilantro', 'يوم أول «بحبك» ❤️']],
  ['لو سافرنا أول سفرية سوا، نروح فين؟', ['البحر والهدوء', 'مدينة جديدة نلفها', 'عمرة مع بعض 🤍']],
  ['لو قعدنا في Cilantro تاني، نطلب إيه؟', ['نفس اللاتيه بتاع أول مرة ☕', 'حاجة جديدة نجربها سوا', 'أي حاجة… المهم القعدة']],
  ['لو عملنا أول عزومة في بيتنا، نعزم مين؟', ['عيلتك وعيلتي سوا', 'صحابنا المقربين', 'إحنا الاتنين بس 😄']],
  ['لو خميس من غير شغل، نعمل إيه؟', ['نخرج نتمشى', 'نقعد في البلكونة بشاي', 'نتفرج على فيلم ومقرمشات']],
  ['لو بيتنا له ركن مفضل، يبقى فين؟', ['البلكونة', 'المطبخ وإحنا بنطبخ سوا', 'الكنبة وقت الحكاوي']],
]
const questionCards = [
  ['إيه لحظة بسيطة نفسك نكررها؟', 'أنا نفسي نكرر أي قعدة نحكي فيها من غير ما نبص للوقت.'],
  ['إيه عادة صغيرة نفسك تبقى بينا دايمًا؟', 'إننا نطمن على بعض دايمًا، ونصحّي بعض على صلاة الفجر، ونفضل عون لبعض في كل خير 🤍'],
  ['إيه حاجة بتخليكي تحسي إني قريب منك؟', 'أنا بحس إني قريب منك لما تحكيلي حاجة صغيرة من يومك… فاحكيلي دايمًا، وأنا هفضل أسمعك ❤️'],
  ['لو هتكتبيلي ورقة صغيرة أفتحها يوم كتب الكتاب، هتكتبي فيها إيه؟', 'أنا هكتبلك: «الحمد لله إن ربنا جمعني بيكي… ومن النهارده إنتي بيتي» ❤️'],
  ['إيه أصغر حاجة عملتيها وفرّحتني من غير ما تاخدي بالك؟', 'ضحكتك أول ما تشوفيني 😊… إنتي غالبًا مش واخدة بالك منها، بس هي بتفرّحني أكتر ما تتخيلي.'],
  ['لو شاي البلكونة بتاعنا ليه اسم، تسميه إيه؟', 'أنا هسميه «شاي أول زيارة» ☕… أحلى شاي شربته، عشان كان معاكي.'],
  ['لو بيتنا ليه ألبوم صور، أول صورة فيه تبقى إيه؟', 'صورة قراية الفاتحة 🤲… لإنها أول سطر رسمي في حكايتنا، واليوم اللي عيلتنا اتجمعت فيه على الخير.'],
  ['لو ليكي تختاري يوم في الأسبوع يبقى بتاعنا إحنا الاتنين بس، تختاري إيه؟', 'أنا هختار الخميس 🌃… من غير تفكير.'],
  ['لو بعد عشرين سنة عيالنا سألوكي عن باباهم، هتحكيلهم إيه الأول؟', 'نفسي تحكيلهم إن باباهم كان بيجيبلك مقرمشات وشوكولاتة كل خميس 😂🍫… والباقي سيبيه عليا.'],
]
type Station = { emoji: string; title: string; question: string; choices: string[]; answer?: number; reply: string; piece: string }
const stations: Station[] = [
  { emoji: '📞', title: 'أول محطة: المكالمة', question: 'لو التليفون اللي كلمت منه عمو حسام كان بيتكلم، كان هيقول عليا إيه؟', choices: ['«ده كان هادي وواثق جدًا» 😎', '«ده نسي كل اللي كان مرتبه» 😅', '«ده قرا الكلام من ورقة» 📝'], answer: 1, reply: 'نسيت كل الكلام اللي كنت مرتبه من التوتر… بس عمري ما نسيت أنا عايز مين.', piece: 'من أول مكالمة' },
  { emoji: '🚪', title: 'تاني محطة: أول نظرة', question: 'لو كاميرا صورت أول قعدة في بيتكم، هتلاقي عيني فين أغلب الوقت؟', choices: ['مع العيلة أغلب الوقت', 'عندك علطول', 'في الأرض 🙈'], answer: 0, reply: 'كنت ببص مع العيلة أغلب الوقت… عشان كنت خايف لو بصيتلك ما أعرفش أشيل عيني من عليكي 🙈', piece: 'لأول نظرة' },
  { emoji: '☕', title: 'تالت محطة: Cilantro', question: 'لو رفوف الكتب اللي كانت ورانا كتبت عن قعدتنا كتاب، تسميه إيه؟', choices: ['«لاتيه وضحكة»', '«الترابيزة الصغيرة»', '«قعدة ما كانش نفسنا تخلص»'], reply: 'أي اسم فيهم ينفع… بس أنا كنت هسميه «أول مرة لينا برّه» ☕ وكل ما أفتكرها بابتسم.', piece: 'لقعدة Cilantro' },
  { emoji: '🌃', title: 'رابع محطة: مشوار الخميس', question: 'لو الطريق من شغلك للبيت كان بيتكلم، كان هيقول عليا إيه؟', choices: ['«ده كان نفسه أطول شوية» 🛣️', '«ده بيعدّ الأيام لحد الخميس» 📅', '«ده بيجيب مقرمشات أكتر ما بيسوق» 😂'], reply: 'كلهم صح 😄 بس أصدقهم: الطريق معاكي كان بيعدّي كإنه ثانية، وكنت بتمنى يطول.', piece: 'لمشوار كل خميس' },
  { emoji: '🛋️', title: 'آخر محطة: بيتنا', question: 'لو المراية اللي اتصورنا فيها في مشوار التجهيزات اتكلمت، كانت هتقول إيه؟', choices: ['«دول شكلهم متجوزين من زمان» 😄', '«دول بيختاروا بيتهم سوا» 🏡', '«ده مش مركز في الحاجات… مركز معاها» 🙈'], reply: 'كلهم ينفعوا 😄 بس الحقيقة إني طول اليوم كنت متخيلنا مع بعض في بيتنا، وكنت في قمة سعادتي ❤️', piece: 'لحد بيتنا' },
]
const treasureFinale = 'قلبي كان رايحلك إنتي ❤️'

function Box({ children }: { children: React.ReactNode }) { return <div className="new-game">{children}</div> }
function Note({ children, celebrate }: { children: React.ReactNode; celebrate?: boolean }) { return <motion.p className="new-note" role="status" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>{celebrate && <HeartBurst />}{children}</motion.p> }

export function UnsentLetters() {
  const [open, setOpen] = useState<number | null>(null)
  return <Box><p className="new-intro">في كلام بيبقى جوا القلب… افتحي ظرف كل مرة عشان تلاقيه.</p><div className="new-grid">{unsent.map(([title], i) => <button className={`new-card ${open === i ? 'new-selected' : ''}`} key={title} onClick={() => setOpen(open === i ? null : i)}><span className="new-emoji">💌</span><strong>{title}</strong><small>{open === i ? 'اقفلي الظرف' : 'افتحي الظرف'}</small></button>)}</div>{open !== null && <article className="new-reveal"><Heart size={20} fill="currentColor"/><h2>{unsent[open][0]}</h2><p>{unsent[open][1]}</p><small>بحبك، {story.names.sender} ❤️</small></article>}</Box>
}
const whoOptions = ['أنا', 'إنتي', 'إحنا الاتنين']
export function WhoGame() {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const done = whoQs.every((_, i) => answers[i] !== undefined)
  const summary = whoQs.map(([q, a], i) => `${i + 1}. ${q}\nاختياري: ${whoOptions[answers[i]] ?? '—'}\nإجابتك: ${a}`).join('\n\n')
  return <Box><p className="new-intro">اختاري مين فينا… وبعدها شوفي إجابتي أنا.</p>{whoQs.map(([q, a], i) => <section className="new-question" key={q}><h2>{q}</h2><div className="new-options">{whoOptions.map((x, j) => <button className={answers[i] === j ? 'new-selected' : ''} key={x} onClick={() => setAnswers({ ...answers, [i]: j })}>{x}</button>)}</div>{answers[i] !== undefined && <Note>إجابتي: {a}</Note>}</section>)}
    {done && <ShareAnswers title="إجاباتي في «مين فينا؟»" body={summary} onReset={() => setAnswers({})} />}
  </Box>
}

function ShareAnswers({ title, body, onReset, heading = 'خلصتي كل الأسئلة 🎉' }: { title: string; body: string; onReset: () => void; heading?: string }) {
  const [copied, setCopied] = useState(false), [emailOpen, setEmailOpen] = useState(false)
  const text = `${title} ❤️\n\n${body}\n\n— ${story.names.recipient}`
  const whatsapp = `https://wa.me/${story.whatsappNumber ?? ''}?text=${encodeURIComponent(text)}`
  const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${story.quizAnswersEmail}&su=${encodeURIComponent(title)}&body=${encodeURIComponent(text)}`
  const email = `mailto:${story.quizAnswersEmail}?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text)}`
  const copy = async () => { try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { setCopied(false) } }
  // نسخة احتياطية: لو تطبيق الإيميل ما فتحش أو قص الرسالة، الإجابات تبقى منسوخة جاهزة للّزق.
  const copySilently = () => { navigator.clipboard?.writeText(text).catch(() => {}) }
  return <motion.div className="new-share" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
    <HeartBurst /><h2>{heading}</h2><p>ابعتيلي اختياراتك كلها مترتبة، بالطريقة اللي تريّحك:</p>
    <div className="new-share-actions">
      <a className="primary-button" href={whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={16} /> على الواتساب</a>
      <button className={`secondary-button ${emailOpen ? 'new-selected' : ''}`} onClick={() => setEmailOpen(!emailOpen)} aria-expanded={emailOpen}><Mail size={16} /> على الإيميل</button>
      <button className="secondary-button" onClick={copy}>{copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'اتنسخت' : 'انسخي الإجابات'}</button>
    </div>
    {emailOpen && <motion.div className="new-share-email" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
      <div className="new-share-actions">
        <a className="secondary-button" href={gmail} target="_blank" rel="noreferrer" onClick={copySilently}>من Gmail</a>
        <a className="secondary-button" href={email} onClick={copySilently}>من تطبيق البريد</a>
      </div>
      <small>الإجابات هتتنسخ كمان أول ما تدوسي… فلو الرسالة فتحت فاضية، الزقيها بس وابعتيها على {story.quizAnswersEmail}</small>
    </motion.div>}
    <button className="text-button new-share-reset" onClick={onReset}><RotateCcw size={14} /> نلعبها تاني</button>
  </motion.div>
}
export function ImagineGame(){const [answers,setAnswers]=useState<Record<number,string>>({});return <Box><p className="new-intro">اختاري إجابتك لكل سؤال، ومفيش اختيار غلط… المهم نتخيل سوا.</p>{imagineQs.map(([q,opts],i)=><section className="new-question" key={q as string}><h2>{q}</h2><div className="new-options">{(opts as string[]).map(o=><button className={answers[i]===o?'new-selected':''} key={o} onClick={()=>setAnswers({...answers,[i]:o})}>{o}</button>)}</div>{answers[i]&&<Note>اختيار جميل… يلا نخليه ذكرى حقيقية قريب ❤️</Note>}</section>)}</Box>}
const closerKey = 'love-story:closer-answers'
function loadCloser(): Record<number, string> { try { return JSON.parse(localStorage.getItem(closerKey) || '{}') } catch { return {} } }
export function CloserQuestions() {
  const [answers, setAnswersState] = useState<Record<number, string>>(loadCloser), [reveals, setReveals] = useState<number[]>([])
  // نحفظ الإجابات على الجهاز عشان ما تضيعش لو خرجت من الفصل ورجعت.
  const setAnswers = (next: Record<number, string>) => { setAnswersState(next); try { localStorage.setItem(closerKey, JSON.stringify(next)) } catch { /* مش مهم */ } }
  const written = questionCards.filter((_, i) => answers[i]?.trim()).length
  const body = questionCards.map(([q], i) => `${i + 1}. ${q}\nإجابتي: ${answers[i]?.trim() || '—'}`).join('\n\n')
  return <Box><p className="new-intro">جاوبي بينك وبين نفسك أو اكتبي إجابتك، وبعدها افتحي إجابتي.</p>{questionCards.map(([q, a], i) => <section className="new-question" key={q}><h2>{q}</h2><textarea value={answers[i] || ''} onChange={e => setAnswers({ ...answers, [i]: e.target.value })} placeholder="إجابتك هنا… (اختياري)" /><button className="secondary-button new-action" onClick={() => setReveals(reveals.includes(i) ? reveals.filter(x => x !== i) : [...reveals, i])}>{reveals.includes(i) ? 'خبّي إجابتي' : 'افتحي إجابتي'}</button>{reveals.includes(i) && <Note>{a}</Note>}</section>)}
    {written > 0 && <ShareAnswers heading={written === questionCards.length ? 'جاوبتي على كل الأسئلة 🫶' : `جاوبتي على ${written} من ${questionCards.length} 🫶`} title="إجاباتي في «سؤال مني وإجابة مني»" body={body} onReset={() => { setAnswers({}); setReveals([]) }} />}
  </Box>
}
export function TreasureMap() {
  const [picked, setPicked] = useState<Record<number, number>>({})
  const done = stations.filter((_, i) => picked[i] !== undefined).length
  const finished = done === stations.length
  return <Box>
    <p className="new-intro">كل محطة هنا مكان عدّينا بيه سوا… جاوبي على سؤالها عشان تاخدي حتة من الرسالة وتفتحي اللي بعدها.</p>
    <div className="treasure-message" aria-label="أجزاء الرسالة">{stations.map((st, i) => <span key={st.title} className={picked[i] !== undefined ? 'found' : ''}>{picked[i] !== undefined ? st.piece : '؟'}</span>)}</div>
    <div className="map-line">{stations.map((st, i) => {
      const locked = i > done, answered = picked[i] !== undefined, active = i === done
      const right = st.answer === undefined || picked[i] === st.answer
      return <section key={st.title} className={`map-stop ${answered ? 'new-selected' : ''} ${locked ? 'map-locked' : ''} ${active ? 'map-active' : ''}`}>
        <span className="map-pin">{answered ? <Check size={18} /> : locked ? <Lock size={15} /> : st.emoji}</span>
        <strong>{st.title}</strong>
        {locked && <em>خلّصي المحطة اللي قبلها الأول</em>}
        {!locked && <div className="map-body">
          <p>{st.question}</p>
          <div className="new-options">{st.choices.map((c, j) => <button key={c} disabled={answered} className={picked[i] === j ? 'new-selected' : ''} onClick={() => setPicked({ ...picked, [i]: j })}>{c}</button>)}</div>
          {answered && <motion.div className="map-reply" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            {!right && <b>قربتي 😄 </b>}{st.reply}
            <small>خدتي حتة من الرسالة: «{st.piece}»</small>
          </motion.div>}
        </div>}
      </section>
    })}</div>
    {finished && <Note celebrate>{stations.map(st => st.piece).join('، ')}… {treasureFinale}<br /><small className="map-sign">وصلتي لنهاية الخريطة يا نانوسة… بس حكايتنا لسه مكملة.</small></Note>}
    {finished && <ShareAnswers heading="وصلتي لآخر الرحلة 🗺️" title="إجاباتي في «رحلة لجوا قلبي»" body={stations.map((st, i) => `${i + 1}. ${st.title}\n${st.question}\nاختياري: ${st.choices[picked[i]]}`).join('\n\n')} onReset={() => setPicked({})} />}
    {done > 0 && !finished && <button className="secondary-button new-action" onClick={() => setPicked({})}><RotateCcw size={15} /> نمشيها من الأول</button>}
  </Box>
}

export function OurTimeline() {
  return <Box><p className="new-intro">كل محطة هنا خطوة قربتنا من بعض… انزلي براحتك واقري حكايتنا.</p>
    <ol className="timeline-list">
      <motion.span aria-hidden="true" className="timeline-thread" initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ duration: 1.8, ease: 'easeInOut' }} />
      {story.timeline.map((item, i) => {
        const linked = story.memories.find(m => m.id === item.memoryId && m.src)
        const memory = item.photo ?? (linked?.src ? { src: linked.src, thumbnailSrc: linked.thumbnailSrc, alt: linked.alt } : undefined)
        return <motion.li key={item.id} className="timeline-item" initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.7, delay: i * 0.08 }}>
          <span className="timeline-marker">{item.emoji}</span>
          <div className="timeline-card">
            <div className="timeline-topline"><span>المحطة {i + 1}</span>{item.date && <time>{item.date}</time>}</div>
            <h2>{item.title}</h2><p>{item.text}</p>
            {memory && <figure className="timeline-photo"><img src={memory.src} srcSet={memory.thumbnailSrc ? `${memory.thumbnailSrc} 1100w, ${memory.src} 2400w` : undefined} sizes="(max-width: 740px) 90vw, 560px" alt={memory.alt} loading="lazy" decoding="async" /></figure>}
          </div>
        </motion.li>
      })}
    </ol>
    <p className="timeline-end"><Heart size={16} fill="currentColor" /> والباقي… هنكتبه سوا يا حبيبتي</p>
  </Box>
}

export function Constellation() {
  const { stars, finale } = story.constellation
  const [lit, setLit] = useState(0)
  const [miss, setMiss] = useState(false)
  const done = lit === stars.length
  const tap = (i: number) => { if (i === lit) { setLit(lit + 1); setMiss(false) } else if (i >= lit) setMiss(true) }
  const heart = stars.map(s => `${s.x},${s.y}`).join(' ')
  return <Box><p className="new-intro">اضغطي على النجمة اللي بتلمع، واحدة ورا التانية… وشوفي النجوم هترسم إيه.</p>
    <div className={`sky-board ${done ? 'sky-done' : ''}`}><div className="sky-field">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <defs><linearGradient id="star-line" x1="0" x2="1"><stop offset="0" stopColor="#f6dfa6" /><stop offset="1" stopColor="#e88aa3" /></linearGradient></defs>
        {done && <motion.polygon points={heart} className="sky-heart-fill" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 0.5 }} />}
        {stars.slice(1, lit).map((s, i) => <motion.line key={i} x1={stars[i].x} y1={stars[i].y} x2={s.x} y2={s.y} stroke="url(#star-line)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />)}
        {done && <motion.line x1={stars[stars.length - 1].x} y1={stars[stars.length - 1].y} x2={stars[0].x} y2={stars[0].y} stroke="url(#star-line)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />}
      </svg>
      {stars.map((s, i) => <button key={i} className={`sky-star ${i < lit ? 'star-lit' : ''} ${i === lit ? 'star-next' : ''}`} style={{ left: `${s.x}%`, top: `${s.y}%` }} onClick={() => tap(i)} aria-label={i < lit ? `نجمة ${i + 1}: ${s.line}` : `نجمة ${i + 1}`} aria-pressed={i < lit}><span>✦</span></button>)}
      </div>{done && <PetalShower count={18} delay={0.6} />}
    </div>
    <div className="sky-caption" aria-live="polite">
      {done ? <Note celebrate>{finale}</Note>
        : lit > 0 ? <motion.p key={lit} className="sky-line" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>{stars[lit - 1].line}</motion.p>
        : <p className="sky-line sky-hint">النجمة اللي تحت خالص هي أول الحكاية ✨</p>}
      {miss && !done && <p className="sky-hint">مش دي… النجمة اللي بتلمع هي اللي عليها الدور ✨</p>}
    </div>
    {lit > 0 && <button className="secondary-button new-action" onClick={() => { setLit(0); setMiss(false) }}><RotateCcw size={15} /> نرسمها من جديد</button>}
  </Box>
}
