import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Drum, Users, TrendingUp } from 'lucide-react'
import { COLORS } from '@/lib/colors'
import malikaImg from '@/assets/Malika_pic.png'

/* ─── Spring presets ──────────────────────────────────────────────────────── */
const gentle = { type: 'spring', stiffness: 240, damping: 22 } as const
const snap   = { type: 'spring', stiffness: 400, damping: 30 } as const

/* ─── Content data ────────────────────────────────────────────────────────── */
const BANDS = [
  { name: 'Sacrement',  genre: 'Metal',  description: 'Heavy-hitting Sri Lankan metal outfit' },
  { name: 'The Cosmos', genre: 'Pop',    description: 'Vibrant pop ensemble' },
]

const INFLUENCES = [
  { name: 'The Rev',       band: 'Avenged Sevenfold' },
  { name: 'Jay Weinberg',  band: 'Slipknot' },
  { name: 'Joey Jordison', band: 'Slipknot' },
  { name: 'Mike Portnoy',  band: 'Dream Theater' },
  { name: 'Jeremy Spencer',band: 'FFDP' },
]

const STATS = [
  { icon: Drum,       value: '15+',  label: 'Years Behind the Kit' },
  { icon: Users,      value: '2',    label: 'Active Bands' },
  { icon: TrendingUp, value: '750K+', label: 'Views on TikTok & YouTube' },
]

const GENRES = [
  'Metal', 'Heavy Metal', 'Pop', 'Alternative', 'Rock',
  'Sinhala Pop', 'Sinhala Classics', 'Sri Lankan Baila', 'Hindi',
  'Double Bass', 'Groove', 'Progressive',
]

/* ─── Variants ────────────────────────────────────────────────────────────── */
const slideLeft = {
  hidden: { opacity: 0, x: -40 },
  show:   { opacity: 1, x: 0, transition: { ...gentle } },
}

const slideRight = {
  hidden: { opacity: 0, x: 40 },
  show:   { opacity: 1, x: 0, transition: { ...gentle } },
}

const staggerList = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

const popIn = {
  hidden: { opacity: 0, scale: 0.85 },
  show:   {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 320, damping: 22 },
  },
}

/* ─── Profile image placeholder ──────────────────────────────────────────── */
function ProfileImage() {
  return (
    <div className="relative w-full max-w-[360px] mx-auto md:mx-0">
      {/* Corner accent marks — refined single-px lines */}
      <span className="absolute -top-3 -left-3 w-10 h-10 border-t border-l border-gold/70" />
      <span className="absolute -bottom-3 -right-3 w-10 h-10 border-b border-r border-gold/70" />

      {/* Image frame */}
      <div
        className="relative aspect-[3/4] rounded-sm overflow-hidden"
        style={{ background: `linear-gradient(145deg, ${COLORS.surface['700']} 0%, ${COLORS.surface['900']} 100%)` }}
      >
        {/* Background glow layers */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 35% 25%, ${COLORS.gold.DEFAULT}14 0%, transparent 55%),
                         radial-gradient(ellipse at 70% 75%, ${COLORS.accent}12 0%, transparent 50%)`,
          }}
        />

        <img
          src={malikaImg}
          alt="Malika Degadoruwa"
          className="absolute inset-0 w-full h-full object-cover object-top"
          draggable={false}
        />

        {/* Vignette bottom */}
        <div className="absolute bottom-0 inset-x-0 h-2/5 bg-gradient-to-t from-surface-900/70 to-transparent" />

        {/* "Available" badge */}
        <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 px-2.5 py-1
                        rounded-full bg-surface-900/80 backdrop-blur-sm border border-gold/20">
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
          <span className="text-gold text-[0.6rem] font-semibold tracking-[0.18em] uppercase">
            Available
          </span>
        </div>
      </div>

      {/* Floating stat card — bottom left, lifts on hover */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ ...gentle, delay: 0.45 }}
        whileHover={{ y: -2, boxShadow: '0 12px 32px rgba(0,0,0,0.5)' }}
        className="absolute -bottom-4 -left-4 sm:-left-6
                   flex items-center gap-2.5 px-3.5 py-2.5
                   rounded-xl bg-surface-700 border border-surface-600
                   shadow-lg shadow-black/40 cursor-default"
      >
        <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
          <Drum size={15} className="text-gold" />
        </div>
        <div className="leading-tight">
          <p className="text-foreground font-bold text-sm">15+ Years</p>
          <p className="text-foreground-muted text-[0.65rem]">Behind the Kit</p>
        </div>
      </motion.div>
    </div>
  )
}

/* ─── About ───────────────────────────────────────────────────────────────── */
export default function About() {
  const ref    = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      id="about"
      ref={ref}
      className="relative py-28 md:py-36 bg-surface-800 overflow-hidden"
    >
      {/* Edge accents */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/10 to-transparent" />

      {/* Ambient accent glow (right side) */}
      <div
        className="absolute -right-40 top-1/2 -translate-y-1/2 w-[480px] h-[480px]
                   rounded-full blur-[120px] pointer-events-none opacity-[0.06]"
        style={{ background: COLORS.accent }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3 mb-16"
        >
          <span className="h-px w-8 bg-gold" />
          <span className="text-gold text-[0.65rem] font-bold tracking-[0.28em] uppercase">About Me</span>
        </motion.div>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-14 md:gap-20 items-start">

          {/* ── Image (left, 2/5) ──────────────────────────────────────────── */}
          <motion.div
            variants={slideLeft}
            initial="hidden"
            animate={inView ? 'show' : 'hidden'}
            className="md:col-span-2"
          >
            <ProfileImage />
          </motion.div>

          {/* ── Content (right, 3/5) ───────────────────────────────────────── */}
          <motion.div
            variants={slideRight}
            initial="hidden"
            animate={inView ? 'show' : 'hidden'}
            className="md:col-span-3 space-y-7"
          >
            {/* Headline */}
            <div className="space-y-3">
              <h2 className="font-display font-bold leading-tight
                             text-[clamp(1.9rem,4vw,2.8rem)] text-foreground">
                Sri Lanka's Premier<br />
                <span className="text-gold-gradient">Metal, Pop &amp; Versatile Drummer</span>
              </h2>
            </div>

            {/* Bio paragraphs */}
            <div className="space-y-4 text-foreground-dim text-[0.975rem] sm:text-base leading-[1.8]">
              <p>
                Malika Degadoruwa is a passionate and dynamic professional drummer from Sri Lanka.
                He discovered his love for rhythm at the age of&nbsp;10, beginning his journey with
                2000s pop music before diving headfirst into the world of metal. Inspired by bands
                such as Breaking Benjamin, Five Finger Death Punch, Avenged Sevenfold, and Slipknot,
                he relentlessly practiced double bass techniques every day — transforming raw passion
                into technical precision and power.
              </p>
              <p>
                Now&nbsp;25, Malika is an active member of two prominent Sri Lankan bands: the
                heavy-hitting metal outfit <span className="text-foreground font-medium">Sacrement</span>{' '}
                and the vibrant pop ensemble{' '}
                <span className="text-foreground font-medium">The Cosmos</span>. He also maintains a
                thriving freelance career, delivering powerful performances and studio recordings
                across a wide range of genres — from Sinhala pop and classic hits performed with
                a unique personal touch, to the infectious rhythms of Sri Lankan baila, and
                energetic Hindi covers.
              </p>
              <p>
                When he's not behind the kit, Malika creates high-energy drumming content for
                TikTok&nbsp;(@MalikaDrums) and YouTube, inspiring a new generation of musicians.
              </p>
            </div>

            {/* Bands */}
            <div>
              <p className="text-[0.65rem] font-bold tracking-[0.22em] uppercase text-foreground-muted mb-3">
                Active Bands
              </p>
              <div className="flex flex-wrap gap-3">
                {BANDS.map(band => (
                  <motion.div
                    key={band.name}
                    whileHover={{ y: -2, boxShadow: `0 8px 24px rgba(0,0,0,0.4)` }}
                    transition={snap}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl
                               bg-surface-700 border border-surface-600 cursor-default"
                  >
                    <div className="w-1.5 h-6 rounded-full bg-gold/60" />
                    <div className="leading-tight">
                      <p className="text-foreground font-semibold text-sm">{band.name}</p>
                      <p className="text-foreground-muted text-[0.65rem] tracking-wide">{band.genre}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Genre tags */}
            <div>
              <p className="text-[0.65rem] font-bold tracking-[0.22em] uppercase text-foreground-muted mb-3">
                Genres &amp; Styles
              </p>
              <motion.div
                variants={staggerList}
                initial="hidden"
                animate={inView ? 'show' : 'hidden'}
                className="flex flex-wrap gap-2"
              >
                {GENRES.map(genre => (
                  <motion.span
                    key={genre}
                    variants={popIn}
                    whileHover={{
                      scale: 1.05,
                      borderColor: COLORS.gold.DEFAULT,
                      color: COLORS.gold.DEFAULT,
                    }}
                    transition={snap}
                    className="px-3 py-1.5 rounded-full text-xs font-medium
                               border border-surface-500 text-foreground-dim
                               cursor-default transition-colors duration-150"
                  >
                    {genre}
                  </motion.span>
                ))}
              </motion.div>
            </div>

            {/* Drumming influences */}
            <div>
              <p className="text-[0.65rem] font-bold tracking-[0.22em] uppercase text-foreground-muted mb-3">
                Drumming Influences
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {INFLUENCES.map(({ name, band }) => (
                  <div key={name} className="flex items-baseline gap-1.5">
                    <span className="text-sm font-medium text-foreground">{name}</span>
                    <span className="text-[0.65rem] text-foreground-muted">· {band}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              {STATS.map(({ icon: Icon, value, label }) => (
                <motion.div
                  key={label}
                  whileHover={{ y: -3, boxShadow: '0 10px 28px rgba(0,0,0,0.45)' }}
                  transition={snap}
                  className="flex flex-col gap-2.5 p-4 rounded-xl
                             bg-surface-700 border border-surface-600 cursor-default"
                >
                  <div className="w-7 h-7 rounded-lg bg-gold/[0.12] flex items-center justify-center">
                    <Icon size={14} className="text-gold" />
                  </div>
                  <p className="font-display font-bold text-2xl text-foreground leading-none">{value}</p>
                  <p className="text-foreground-muted text-[0.65rem] leading-tight">{label}</p>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <div className="pt-1">
              <motion.a
                href="#contact"
                onClick={e => { e.preventDefault(); document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' }) }}
                whileHover={{ scale: 1.03, boxShadow: '0 6px 24px rgba(249,115,22,0.40)' }}
                whileTap={{ scale: 0.96 }}
                transition={snap}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5
                           rounded-full font-semibold text-sm
                           bg-accent text-white
                           outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
              >
                Get In Touch
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
