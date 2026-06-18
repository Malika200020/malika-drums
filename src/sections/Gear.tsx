import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Drum, Zap, Disc3, PenLine, CircleDot, Mic2, Headphones } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { COLORS } from '@/lib/colors'

/* ─── Image imports ───────────────────────────────────────────────────────── */
import drumKitImg    from '@/assets/DrumKit.jpg'
import speedCobraImg from '@/assets/SpeedCobra.jpg'
import zildjianImg   from '@/assets/ZildjianS.jpg'
import vaterImg      from '@/assets/VaterSticks.jpg'
import evansImg      from '@/assets/Evans.jpg'
import yamahaImg     from '@/assets/YamahaMG12XU.jpg'
import shureImg      from '@/assets/ShureSE215.jpg'

/* ─── Spring presets ──────────────────────────────────────────────────────── */
const snap   = { type: 'spring', stiffness: 420, damping: 32 } as const
const gentle = { type: 'spring', stiffness: 240, damping: 22 } as const

/* ─── Variants — hover state propagates from card article → icon badge ───── */
const cardVariants = {
  idle: {
    y: 0,
    scale: 1,
    boxShadow: '0 2px 10px rgba(0,0,0,0.35), 0 0 0 1px rgba(36,36,36,1)',
  },
  hover: {
    y: -8,
    scale: 1.018,
    boxShadow: '0 24px 48px rgba(0,0,0,0.58), 0 0 0 1px rgba(212,175,55,0.42)',
  },
} as const

const iconVariants = {
  idle:  { scale: 1,    rotate: 0  },
  hover: { scale: 1.22, rotate: 14 },
}

/* ─── Data ────────────────────────────────────────────────────────────────── */
type GearItem = {
  id: string
  category: string
  name: string
  brand: string
  description: string
  tags: string[]
  icon: LucideIcon
  accent: string
  image?: string
  imageHeight: number  // explicit control — not column-span based
}

/*
  Grid: 1 col → md: 2 cols → lg: 3 cols
  All cards are equal width. The Kit stands out via a taller image area.
  The Mixer is compact (low image height) since photo quality is modest.

  lg layout:
    Row 1: [1970s Yamaha Kit] [Speed Cobra 910] [Zildjian S Series]
    Row 2: [Vater 5B]         [Evans Heads]     [Yamaha MG12XU]
*/
const GEAR: GearItem[] = [
  {
    id: 'kit',
    category: 'Full Kit',
    name: '1970s Yamaha 5 Piece',
    brand: 'Yamaha',
    description:
      'A mid-1970s Yamaha 5-piece with aged shells that deliver warm, resonant character modern kits simply can\'t replicate. Rich fundamentals and natural sustain — the soul of every live show and studio session.',
    tags: ['Vintage', '5 Piece', 'Live', 'Studio'],
    icon: Drum,
    accent: COLORS.gold.DEFAULT,
    image: drumKitImg,
    imageHeight: 210,
  },
  {
    id: 'pedals',
    category: 'Bass Pedals',
    name: 'Speed Cobra 910 Twin',
    brand: 'TAMA',
    description:
      'TAMA\'s flagship twin pedal built for elite double bass performance. The Power Glide cam delivers explosive speed with a smooth, consistent stroke — the engine behind every metal groove.',
    tags: ['Twin Pedal', 'Double Bass', 'Metal'],
    icon: Zap,
    accent: COLORS.accent,
    image: speedCobraImg,
    imageHeight: 160,
  },
  {
    id: 'cymbals',
    category: 'Cymbals',
    name: 'S Series Complete Pack',
    brand: 'Zildjian',
    description:
      'Brilliant-finish bronze with a cutting attack and rich sustain. The full S Series covers every voice — punchy hi-hats, stacking crashes, and a smooth ride that slices through the heaviest mix.',
    tags: ['Hi-Hats', 'Crash', 'Ride', 'China'],
    icon: Disc3,
    accent: COLORS.gold.light,
    image: zildjianImg,
    imageHeight: 160,
  },
  {
    id: 'sticks',
    category: 'Drumsticks',
    name: 'Vater 5B Super',
    brand: 'Vater',
    description:
      'Thicker gauge for serious power and projection. The 5B Super delivers an authoritative attack for metal\'s heaviest grooves while staying responsive enough for pop\'s most dynamic moments.',
    tags: ['5B', 'Power', 'All Genres'],
    icon: PenLine,
    accent: '#c2854a',
    image: vaterImg,
    imageHeight: 160,
  },
  {
    id: 'heads',
    category: 'Drumheads',
    name: 'Evans Drumheads',
    brand: 'Evans',
    description:
      'Level 360 technology ensures a perfect, wrinkle-free fit every time. Evans heads deliver a controlled, musical tone that records beautifully and holds up under the most relentless play.',
    tags: ['Level 360', 'Live', 'Studio'],
    icon: CircleDot,
    accent: '#7a9acd',
    image: evansImg,
    imageHeight: 160,
  },
  {
    id: 'mixer',
    category: 'Mixer',
    name: 'MG12XU',
    brand: 'Yamaha',
    description:
      'Yamaha\'s D-PRE preamps with built-in SPX effects and USB audio for sessions. Clean, dependable 12-channel mixing that bridges stage and studio.',
    tags: ['12 Channel', 'D-PRE', 'USB Audio'],
    icon: Mic2,
    accent: '#3b82f6',
    image: yamahaImg,
    imageHeight: 112,  // compact — modest photo quality
  },
  {
    id: 'iem',
    category: 'In-Ear Monitors',
    name: 'SE215 Pro IEMs',
    brand: 'Shure',
    description:
      'Single dynamic driver in-ears with sound-isolating fit that blocks up to 37 dB of ambient noise. Warm, detailed monitoring on stage — essential for locking in a clean mix when the kit is at full volume.',
    tags: ['IEM', 'Stage Monitor', '37dB Isolation', 'Detachable Cable'],
    icon: Headphones,
    accent: '#e22843',
    image: shureImg,
    imageHeight: 160,
  },
]

/* ─── Card visual area ────────────────────────────────────────────────────── */
function GearVisual({ item }: { item: GearItem }) {
  const Icon = item.icon

  return (
    <div
      className="relative flex-shrink-0 overflow-hidden"
      style={{ height: item.imageHeight }}
    >
      {item.image ? (
        <>
          <img
            src={item.image}
            alt={item.name}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            draggable={false}
          />
          {/* Readability scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-surface-900/75 via-surface-900/10 to-black/25" />
          {/* Accent tint — brand colour bleed */}
          <div
            className="absolute inset-0 opacity-[0.18] pointer-events-none mix-blend-soft-light"
            style={{
              background: `radial-gradient(ellipse at 30% 70%, ${item.accent} 0%, transparent 65%)`,
            }}
          />
        </>
      ) : (
        <>
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at 50% 60%, ${item.accent}18 0%, ${item.accent}06 55%, transparent 80%)`,
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon size={52} style={{ color: item.accent, opacity: 0.15 }} />
          </div>
        </>
      )}

      {/* Category pill */}
      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-white/10">
        <span className="text-[0.56rem] text-white/70 tracking-[0.18em] uppercase font-semibold">
          {item.category}
        </span>
      </div>

      {/* Icon badge — animates via parent variant */}
      <motion.div
        variants={iconVariants}
        transition={snap}
        className="absolute bottom-3 right-3 p-2 rounded-xl bg-black/50 backdrop-blur-sm border border-white/10"
      >
        <Icon size={16} style={{ color: item.accent }} />
      </motion.div>
    </div>
  )
}

/* ─── Card ────────────────────────────────────────────────────────────────── */
function GearCard({ item }: { item: GearItem }) {
  return (
    <motion.article
      variants={cardVariants}
      initial="idle"
      whileHover="hover"
      transition={snap}
      className="relative flex flex-col rounded-2xl overflow-hidden cursor-default bg-surface-700 will-change-transform h-full"
    >
      <GearVisual item={item} />

      <div className="flex flex-col flex-1 p-5">
        {/* Brand */}
        <p
          className="text-[0.56rem] font-bold tracking-[0.22em] uppercase mb-1.5"
          style={{ color: item.accent }}
        >
          {item.brand}
        </p>

        {/* Name */}
        <h3 className="font-display font-bold text-[1.02rem] leading-snug text-foreground mb-2">
          {item.name}
        </h3>

        {/* Description */}
        <p className="text-foreground-muted text-[0.78rem] leading-[1.75] flex-1 mb-4">
          {item.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {item.tags.map(tag => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-md bg-surface-800 border border-surface-600/70
                         text-[0.56rem] text-foreground-muted tracking-wide"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  )
}

/* ─── Section ─────────────────────────────────────────────────────────────── */
export default function Gear() {
  const ref    = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      id="gear"
      ref={ref}
      className="relative py-28 md:py-36 bg-surface-900 overflow-hidden"
    >
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/10 to-transparent" />

      <div
        className="absolute -left-48 top-1/3 w-[420px] h-[420px] rounded-full blur-[130px] pointer-events-none"
        style={{ background: COLORS.gold.DEFAULT, opacity: 0.04 }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="mb-14">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.35 }}
            className="flex items-center gap-3 mb-5"
          >
            <span className="h-px w-8 bg-gold" />
            <span className="text-gold text-[0.62rem] font-bold tracking-[0.28em] uppercase">
              The Arsenal
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ ...gentle, delay: 0.08 }}
            className="font-display font-bold text-[clamp(2rem,5vw,3.2rem)] text-foreground leading-tight"
          >
            Gear That{' '}
            <span className="text-gold-gradient">Performs</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ ...gentle, delay: 0.14 }}
            className="text-foreground-muted text-[0.93rem] mt-3 max-w-lg leading-relaxed"
          >
            Every piece chosen for a reason — vintage warmth, explosive speed,
            and clarity from rehearsal room to recording booth.
          </motion.p>
        </div>

        {/* ── Grid: 1 → 2 → 3 cols, clean 2-row layout on desktop ─────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {GEAR.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ ...gentle, delay: 0.1 + i * 0.07 }}
            >
              <GearCard item={item} />
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center text-foreground-muted text-[0.68rem] tracking-widest uppercase mt-12"
        >
          Gear subject to change · Always evolving
        </motion.p>
      </div>
    </section>
  )
}
