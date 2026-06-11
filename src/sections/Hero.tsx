import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ChevronDown, Play, CalendarDays } from 'lucide-react'

/* ─── animation variants ──────────────────────────────────────────────────── */
const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.15, delayChildren: 0.4 },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } },
}

const fadeIn = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.8 } },
}

/* ─── pulse rings (backdrop visual) ──────────────────────────────────────── */
function PulseRings() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      {[0, 1, 2, 3].map(i => (
        <motion.span
          key={i}
          className="absolute rounded-full border border-[#d4af37]/20"
          style={{ width: 200 + i * 160, height: 200 + i * 160 }}
          animate={{ scale: [1, 1.18, 1], opacity: [0.4, 0, 0.4] }}
          transition={{
            duration: 3.2,
            ease: 'easeInOut',
            repeat: Infinity,
            delay: i * 0.6,
          }}
        />
      ))}
    </div>
  )
}

/* ─── floating sparks ─────────────────────────────────────────────────────── */
function Sparks() {
  const sparks = [
    { top: '18%', left: '12%',  size: 4,  delay: 0 },
    { top: '70%', left: '8%',   size: 3,  delay: 1.1 },
    { top: '30%', right: '10%', size: 5,  delay: 0.4 },
    { top: '80%', right: '15%', size: 3,  delay: 1.8 },
    { top: '55%', left: '22%',  size: 2,  delay: 0.9 },
    { top: '25%', right: '25%', size: 4,  delay: 2.1 },
  ]

  return (
    <>
      {sparks.map((s, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-[#d4af37]"
          style={{
            top: s.top,
            left: 'left' in s ? s.left : undefined,
            right: 'right' in s ? s.right : undefined,
            width: s.size,
            height: s.size,
          }}
          animate={{ opacity: [0, 1, 0], y: [0, -20, 0] }}
          transition={{
            duration: 2.8,
            ease: 'easeInOut',
            repeat: Infinity,
            delay: s.delay,
          }}
        />
      ))}
    </>
  )
}

/* ─── Hero ────────────────────────────────────────────────────────────────── */
export default function Hero() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })

  /* parallax: background moves slower than scroll */
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '15%'])

  const handleScroll = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      id="hero"
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0a]"
    >
      {/* ── Background layers ─────────────────────────────────────────────── */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 will-change-transform"
      >
        {/* Deep radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_60%,rgba(212,175,55,0.12)_0%,transparent_70%)]" />
        {/* Purple depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_75%_30%,rgba(124,58,237,0.10)_0%,transparent_65%)]" />
        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(212,175,55,0.8) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(212,175,55,0.8) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </motion.div>

      {/* Pulse rings */}
      <PulseRings />

      {/* Floating sparks */}
      <Sparks />

      {/* Grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <motion.div
        style={{ y: textY }}
        className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto"
      >
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {/* Eyebrow label */}
          <motion.div variants={fadeIn} className="flex justify-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/5 text-[#d4af37] text-xs font-semibold tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-pulse" />
              TikTok @MalikaDrums
            </span>
          </motion.div>

          {/* Name */}
          <motion.h1
            variants={fadeUp}
            className="text-5xl sm:text-7xl md:text-8xl lg:text-[6rem] font-black tracking-tight leading-none"
            style={{ fontFamily: "'Oswald', 'Inter', sans-serif" }}
          >
            <span className="text-white">MALIKA</span>
            <br />
            <span className="text-gold-gradient">DEGADORUWA</span>
          </motion.h1>

          {/* Divider */}
          <motion.div variants={fadeIn} className="flex items-center justify-center gap-4">
            <span className="h-px w-16 bg-[#d4af37]/40" />
            <span className="text-[#d4af37] text-lg" aria-hidden>♩</span>
            <span className="h-px w-16 bg-[#d4af37]/40" />
          </motion.div>

          {/* Tagline */}
          <motion.p
            variants={fadeUp}
            className="text-[#a1a1aa] text-base sm:text-xl md:text-2xl font-light tracking-wide max-w-2xl mx-auto leading-relaxed"
          >
            Professional Drummer&nbsp;&nbsp;·&nbsp;&nbsp;Versatile Grooves
            <br className="hidden sm:block" />
            &amp;&nbsp; Powerful Beats
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            {/* Primary: Watch Reels */}
            <motion.a
              href="#reels"
              onClick={e => { e.preventDefault(); handleScroll('#reels') }}
              whileHover={{ scale: 1.05, boxShadow: '0 0 32px rgba(212,175,55,0.35)' }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-bold text-sm sm:text-base bg-[#d4af37] text-[#0a0a0a] hover:bg-[#f5d76e] transition-colors duration-200 shadow-lg shadow-[#d4af37]/20"
            >
              <Play size={18} fill="currentColor" />
              Watch Reels
            </motion.a>

            {/* Secondary: Book Me */}
            <motion.a
              href="#contact"
              onClick={e => { e.preventDefault(); handleScroll('#contact') }}
              whileHover={{ scale: 1.05, borderColor: '#d4af37', color: '#d4af37' }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-bold text-sm sm:text-base border border-[#333333] text-[#a1a1aa] hover:border-[#d4af37] hover:text-[#d4af37] transition-all duration-200"
            >
              <CalendarDays size={18} />
              Book Me
            </motion.a>
          </motion.div>

          {/* Stats row */}
          <motion.div
            variants={fadeIn}
            className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 pt-8"
          >
            {[
              { value: '10+', label: 'Years Playing' },
              { value: '500+', label: 'Performances' },
              { value: '50K+', label: 'TikTok Followers' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-black text-gold-gradient">{stat.value}</p>
                <p className="text-xs text-[#71717a] tracking-widest uppercase mt-0.5">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* ── Scroll indicator ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[#71717a]"
      >
        <span className="text-[10px] tracking-[0.2em] uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown size={18} />
        </motion.div>
      </motion.div>
    </section>
  )
}
