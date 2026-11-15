import type { CSSProperties } from 'react'
import { motion } from 'motion/react'

// Deterministic pseudo-random so the sky looks the same on every render.
const rand = (seed: number) => { const x = Math.sin(seed * 9301 + 49297) * 233280; return x - Math.floor(x) }
type Vars = CSSProperties & Record<`--${string}`, string>

const STARS = Array.from({ length: 70 }, (_, i) => ({
  '--x': `${(rand(i + 1) * 100).toFixed(2)}%`,
  '--y': `${(rand(i + 101) * 100).toFixed(2)}%`,
  '--s': `${(1 + rand(i + 201) * 2.2).toFixed(2)}px`,
  '--t': `${(2.6 + rand(i + 301) * 4).toFixed(2)}s`,
  '--d': `${(-rand(i + 401) * 6).toFixed(2)}s`,
}) as Vars)

const PETALS = Array.from({ length: 14 }, (_, i) => ({
  '--x': `${(rand(i + 501) * 100).toFixed(2)}%`,
  '--t': `${(13 + rand(i + 601) * 12).toFixed(2)}s`,
  '--d': `${(-rand(i + 701) * 24).toFixed(2)}s`,
  '--s': `${(0.6 + rand(i + 801) * 0.8).toFixed(2)}`,
  '--sway': `${(40 + rand(i + 901) * 90).toFixed(0)}px`,
}) as Vars)

/** Fixed night sky behind the whole site: twinkling stars, a soft moon glow and slowly falling rose petals. */
export function Sky() {
  return <div aria-hidden="true" className="sky">
    <div className="moon-glow" />
    <div className="stars">{STARS.map((style, i) => <i key={i} style={style} />)}</div>
    <div className="petals">{PETALS.map((style, i) => <i key={i} style={style} />)}</div>
  </div>
}

/** One-shot shower of petals that bursts from the top-center of its (positioned) parent. */
export function PetalShower({ count = 16, delay = 0 }: { count?: number; delay?: number }) {
  return <span aria-hidden="true" className="petal-shower">{Array.from({ length: count }, (_, i) => {
    const style = {
      '--dx': `${((rand(i + 31) - 0.5) * 340).toFixed(0)}px`,
      '--dy': `${(160 + rand(i + 61) * 200).toFixed(0)}px`,
      '--r': `${((rand(i + 91) - 0.5) * 720).toFixed(0)}deg`,
      '--d': `${(delay + rand(i + 121) * 0.5).toFixed(2)}s`,
      '--s': `${(0.7 + rand(i + 151) * 0.7).toFixed(2)}`,
    } as Vars
    return <i key={i} style={style} />
  })}</span>
}

/** Small ring of hearts radiating outward — for celebrating a finished game. */
export function HeartBurst({ count = 9 }: { count?: number }) {
  return <span aria-hidden="true" className="heart-burst">{Array.from({ length: count }, (_, i) =>
    <i key={i} style={{ '--a': `${(360 / count) * i}deg`, '--d': `${(i % 3) * 0.06}s` } as Vars}>♥</i>)}</span>
}

/** Reveals text sentence by sentence, like it is being written. Paragraphs are split on blank lines. */
export function RevealText({ text, className, start = 0.25, step = 0.45, play = true }: { text: string; className?: string; start?: number; step?: number; play?: boolean }) {
  let index = 0
  return <p className={className}>{text.split(/\n\s*\n/).map((paragraph, p) =>
    <span className="reveal-para" key={p}>{(paragraph.match(/[^.!؟]+[.!؟]*\s*/g) ?? [paragraph]).map(sentence => {
      const delay = start + step * index++
      return <motion.span key={delay} className="reveal-line" initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }} animate={play ? { opacity: 1, y: 0, filter: 'blur(0px)' } : undefined} transition={{ delay, duration: 0.7 }}>{sentence}</motion.span>
    })}</span>)}</p>
}
/** Seconds until a RevealText finishes, so a celebration can follow it. */
export const revealDuration = (text: string, start = 0.25, step = 0.45) =>
  start + step * text.split(/\n\s*\n/).reduce((sum, p) => sum + (p.match(/[^.!؟]+[.!؟]*\s*/g)?.length ?? 1), 0)
