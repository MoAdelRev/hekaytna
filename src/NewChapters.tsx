import { useState } from 'react'
import { motion } from 'motion/react'
import { Check, Heart, RotateCcw, Sparkles } from 'lucide-react'
import { story } from './content'
import { HeartBurst, PetalShower } from './effects'

const unsent = [
  ['أول مرة حسيت إنك مختلفة', 'من أول كلام بينا حسيت إن فيكي راحة وصدق. ماكنتش أعرف إن التفاصيل الصغيرة دي هتبقى من أجمل تفاصيل حياتي.'],
  ['حاجة بكسف أقولها', 'بصي يا ننس، يمكن ما بقولهاش كل يوم، بس وجودك في حياتي بيخليني أهدى وأفرح. بحبك أكتر من الكلام اللي بعرف أقوله.'],
  ['تفصيلة لسه فاكرها', 'فاكر أول مرة ضحكتي فيها من قلبك على حاجة قلتها… حسيت ساعتها إن الدنيا كلها هديت. ومن يومها وأنا بدوّر على أي سبب يخليكي تضحكي تاني.'],
  ['رسالة من بعد سنين', 'يا حبيبتي، أتمنى تكوني لسه بتضحكي من قلبك، ولسه بنحكي لبعض تفاصيل يومنا. بحبك النهارده، وهفضل أختارك كل يوم.'],
]
const whoQs = [
  ['مين فينا هيصالح التاني الأول؟', 'أنا طبعًا… ما بعرفش أطول وأنا زعلان منك ❤️'],
  ['مين فينا هيحتفظ بكل الصور؟', 'إنتي، وبعدين هتبعتيهالي عشان أحتفظ بيها أنا كمان 😄'],
  ['مين فينا هيقترح خروجة في آخر لحظة؟', 'أنا غالبًا، وإنتي هتخلّيها أحلى خروجة.'],
  ['مين فينا بيضحك التاني أكتر؟', 'إحنا الاتنين… ودي أحلى إجابة.'],
]
const imagineQs = [
  ['لو حكايتنا فيلم، اسمه هيكون إيه؟', ['حكاية بدأت بصدفة حلوة', 'لسه أول الحكاية', 'إنتي أجمل مشهد']],
  ['لو عندنا يوم كامل سوا، نبدأه بإيه؟', ['فطار طويل وحكاوي', 'نروح مكان جديد', 'نقضي اليوم على راحتنا']],
  ['لو نكرر ذكرى، تختاري إيه؟', ['يوم خطوبتنا', 'أول مرة ضحكنا من قلبنا', 'أول مرة حسينا إننا لبعض']],
]
const questionCards = [
  ['إيه لحظة بسيطة نفسك نكررها؟', 'أنا نفسي نكرر أي قعدة نحكي فيها من غير ما نبص للوقت.'],
  ['إيه حاجة نفسك أفهمها عنك أكتر؟', 'نفسي أفضل أسألك وأسمعك براحتك، من غير ما أحكم أو أستعجل الرد.'],
  ['إيه عادة صغيرة نفسك تبقى بينا دايمًا؟', 'إننا نطمن على بعض كل يوم، حتى لو بكلمة واحدة.'],
  ['إيه حاجة بتخليكي تحسي إني قريب منك؟', 'أنا بحس إني قريب منك لما تحكيلي حاجة صغيرة من يومك… فاحكيلي دايمًا، وأنا هفضل أسمعك ❤️'],
]
const places = [
  ['أول محطة: بيت الضحكة', 'فكري في موقف ضحكنا فيه سوا… أول جزء من الرسالة هو: «وجودك»'],
  ['تاني محطة: ركن الحكاوي', 'إيه أكتر حاجة بحب أسمعها منك؟ الجزء التاني: «بيخلّي أيامي»'],
  ['آخر محطة: قلب الحكاية', 'كمّليها من قلبك… والرسالة كلها: «وجودك بيخلّي أيامي أحلى» ❤️'],
]
const shuffledWords = ['أحلى', 'وجودك', 'في', 'حياتي']

function Box({ children }: { children: React.ReactNode }) { return <div className="new-game">{children}</div> }
function Note({ children, celebrate }: { children: React.ReactNode; celebrate?: boolean }) { return <motion.p className="new-note" role="status" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>{celebrate && <HeartBurst />}{children}</motion.p> }

export function UnsentLetters() {
  const [open, setOpen] = useState<number | null>(null)
  return <Box><p className="new-intro">في كلام بيبقى جوا القلب… افتحي ظرف كل مرة عشان تلاقيه.</p><div className="new-grid">{unsent.map(([title], i) => <button className={`new-card ${open === i ? 'new-selected' : ''}`} key={title} onClick={() => setOpen(open === i ? null : i)}><span className="new-emoji">💌</span><strong>{title}</strong><small>{open === i ? 'اقفلي الظرف' : 'افتحي الظرف'}</small></button>)}</div>{open !== null && <article className="new-reveal"><Heart size={20} fill="currentColor"/><h2>{unsent[open][0]}</h2><p>{unsent[open][1]}</p><small>بحبك، {story.names.sender} ❤️</small></article>}</Box>
}
export function WordPuzzle() {
  const [words, setWords] = useState(shuffledWords)
  const [done, setDone] = useState(false)
  const move = (i: number) => { const copy = [...words]; [copy[i], copy[i + 1]] = [copy[i + 1], copy[i]]; setWords(copy); setDone(copy.join(' ') === 'وجودك في حياتي أحلى') }
  return <Box><p className="new-intro">اضغطي على كلمة عشان تبدّلي مكانها مع اللي بعدها، ورتّبي الجملة الحلوة.</p><div className="word-row" dir="rtl">{words.map((word, i) => <button key={`${word}-${i}`} className="word-tile" disabled={i === words.length - 1} onClick={() => move(i)} aria-label={`بدلي ${word} مع الكلمة التالية`}>{word}</button>)}</div>{done ? <Note celebrate>«وجودك في حياتي أحلى»… ودي الحقيقة كلها ❤️</Note> : <button className="secondary-button new-action" onClick={() => {setWords(shuffledWords);setDone(false)}}><RotateCcw size={15}/> ابدئي الترتيب من جديد</button>}</Box>
}
export function WhoGame() {
 const [answers,setAnswers]=useState<Record<number,number>>({}); return <Box><p className="new-intro">اختاري مين فينا… وبعدها شوفي إجابتي أنا.</p>{whoQs.map(([q,a],i)=><section className="new-question" key={q}><h2>{q}</h2><div className="new-options">{['أنا','إنتي','إحنا الاتنين'].map((x,j)=><button className={answers[i]===j?'new-selected':''} key={x} onClick={()=>setAnswers({...answers,[i]:j})}>{x}</button>)}</div>{answers[i]!==undefined&&<Note>إجابتي: {a}</Note>}</section>)}</Box>
}
export function SecretCode() {
 const riddles=[['إيه الحاجة اللي بتكبر لما نتشاركها؟','الحب'],['إيه اللي بيخلّي يوم عادي يبقى أحلى؟','كلمة منك'],['إيه أحلى حاجة مستنياني في بكرة؟','نكمل سوا']]
 const [step,setStep]=useState(0),[solved,setSolved]=useState(false),[answer,setAnswer]=useState(''),[hint,setHint]=useState(false),[wrong,setWrong]=useState(false)
 const submit=()=>{if(answer.trim().toLocaleLowerCase()===riddles[step][1].toLocaleLowerCase()){setWrong(false);setAnswer('');setHint(false);if(step+1===riddles.length)setSolved(true);else setStep(step+1)}else setWrong(true)}
 return <Box><p className="new-intro">كل إجابة تقربك من الشفرة. اكتبي اللي في بالك، ولو احتجتي افتحي التلميح.</p>{!solved?<section className="new-reveal"><span className="new-emoji">🔐</span><h2>اللغز {step+1} من {riddles.length}</h2><p>{riddles[step][0]}</p><input className="code-input" value={answer} onChange={e=>{setAnswer(e.target.value);setWrong(false)}} onKeyDown={e=>e.key==='Enter'&&submit()} placeholder="اكتبي إجابتك هنا…" aria-label="إجابة اللغز"/>{wrong&&<Note>قريبة! جربي تاني أو افتحي التلميح ❤️</Note>}<div className="new-options"><button onClick={submit}>جرّبي الإجابة ✨</button><button onClick={()=>setHint(!hint)}>{hint?'خبّي التلميح':'محتاجة تلميح؟'}</button></div>{hint&&<small>تلميح: {riddles[step][1]}</small>}</section>:<article className="new-reveal"><PetalShower count={14}/><Sparkles/><h2>الشفرة اتفتحت!</h2><p>سرّي الصغير: كل الطرق الحلوة في حياتي بتوصل ليكي. بحبك ❤️</p></article>}</Box>
}
export function ImagineGame(){const [answers,setAnswers]=useState<Record<number,string>>({});return <Box><p className="new-intro">اختاري إجابتك لكل سؤال، ومفيش اختيار غلط… المهم نتخيل سوا.</p>{imagineQs.map(([q,opts],i)=><section className="new-question" key={q as string}><h2>{q}</h2><div className="new-options">{(opts as string[]).map(o=><button className={answers[i]===o?'new-selected':''} key={o} onClick={()=>setAnswers({...answers,[i]:o})}>{o}</button>)}</div>{answers[i]&&<Note>اختيار جميل… يلا نخليه ذكرى حقيقية قريب ❤️</Note>}</section>)}</Box>}
export function BranchingStory(){const [scene,setScene]=useState(0),[ending,setEnding]=useState('');const options=[['مشينا جنب البحر','دخلنا مكتبة صغيرة','اشترينا حاجة سخنة وقعدنا نحكي'],['لقينا مكان هادي نكمّل فيه الكلام','ضحكنا على حكاية قديمة','قررنا نرجع تاني يوم']];return <Box><p className="new-intro">اختاري اللي يحصل بعد كده… دي حكايتنا وإحنا بنكتبها سوا.</p>{ending?<article className="new-reveal"><PetalShower count={12}/><span className="new-emoji">🌙</span><h2>نهاية حلوة لبداية أجمل</h2><p>{ending}… وفي الآخر، أحلى حاجة إننا سوا ❤️</p><button className="secondary-button new-action" onClick={()=>{setScene(0);setEnding('')}}>نعيش الحكاية تاني</button></article>:<section className="new-reveal"><small>المشهد {scene+1} من 2</small><h2>{scene===0?'خلص يومنا ولقينا نفسنا سوا…':'الوقت جري وإحنا بنحكي…'}</h2><div className="new-options">{options[scene].map(option=><button key={option} onClick={()=>scene===0?setScene(1):setEnding(option)}>{option}</button>)}</div></section>}</Box>}
export function CloserQuestions(){const [answers,setAnswers]=useState<Record<number,string>>({}),[reveals,setReveals]=useState<number[]>([]);return <Box><p className="new-intro">جاوبي بينك وبين نفسك أو اكتبي إجابتك، وبعدها افتحي إجابتي.</p>{questionCards.map(([q,a],i)=><section className="new-question" key={q}><h2>{q}</h2><textarea value={answers[i]||''} onChange={e=>setAnswers({...answers,[i]:e.target.value})} placeholder="إجابتك هنا… (اختياري)"/><button className="secondary-button new-action" onClick={()=>setReveals(reveals.includes(i)?reveals.filter(x=>x!==i):[...reveals,i])}>{reveals.includes(i)?'خبّي إجابتي':'افتحي إجابتي'}</button>{reveals.includes(i)&&<Note>{a}</Note>}</section>)}</Box>}
export function TreasureMap(){const [visited,setVisited]=useState<number[]>([]);return <Box><p className="new-intro">اتبعي المحطات واحدة واحدة، وكل مكان فيه حتة من الرسالة.</p><div className="map-line">{places.map(([title,clue],i)=><button key={title} className={`map-stop ${visited.includes(i)?'new-selected':''}`} onClick={()=>setVisited([...new Set([...visited,i])])}><span className="map-pin">{visited.includes(i)?<Check size={18}/>:i+1}</span><strong>{title}</strong>{visited.includes(i)&&<small>{clue}</small>}<em>{visited.includes(i)?'اتفتحت':'اضغطي عشان تكتشفي'}</em></button>)}</div>{visited.length===places.length&&<Note celebrate>وصلتي لنهاية الخريطة يا نانوسة… بس حكايتنا لسه مكملة ❤️</Note>}</Box>}

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
