import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Play, X, ExternalLink } from 'lucide-react'
import { VIDEOS, CATEGORY_META, type CategoryId, type Video } from '@/data/videos'
import { cn } from '@/lib/utils'
import { COLORS } from '@/lib/colors'

/* ─── Types ───────────────────────────────────────────────────────────────── */
type FilterId = CategoryId | 'all'

/* ─── Spring presets ──────────────────────────────────────────────────────── */
const snap   = { type: 'spring', stiffness: 420, damping: 32 } as const
const gentle = { type: 'spring', stiffness: 240, damping: 22 } as const

/* ─── Filter config ───────────────────────────────────────────────────────── */
const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all',              label: 'All' },
  { id: 'metal',            label: 'Metal' },
  { id: 'english',          label: 'English Pop & Rock' },
  { id: 'sinhala-modern',   label: 'Sri Lankan Modern Pop' },
  { id: 'baila',            label: 'Sri Lankan Baila' },
  { id: 'sinhala-classics', label: 'Sinhala Classics' },
  { id: 'hindi',            label: 'Hindi Covers' },
]

/* ─── Variants ────────────────────────────────────────────────────────────── */
const cardVariants = {
  idle:  {
    y: 0,  scale: 1,
    boxShadow: '0 2px 8px rgba(0,0,0,0.32), 0 0 0 1px rgba(36,36,36,1)',
  },
  hover: {
    y: -6, scale: 1.02,
    boxShadow: '0 20px 40px rgba(0,0,0,0.56), 0 0 0 1px rgba(212,175,55,0.44)',
  },
} as const

const playVariants = {
  idle:  { scale: 0.78, opacity: 0 },
  hover: { scale: 1,    opacity: 1 },
}

/* ─── Thumbnail ───────────────────────────────────────────────────────────── */
function VideoThumbnail({ video }: { video: Video }) {
  const meta = CATEGORY_META[video.category]

  return (
    <div
      className="relative aspect-[4/3] overflow-hidden"
      style={{
        background: `radial-gradient(ellipse at 35% 40%, ${meta.accent}2e 0%, transparent 58%),
                     linear-gradient(148deg, ${COLORS.surface['700']} 0%, ${COLORS.surface['900']} 100%)`,
      }}
    >
      {/* Decorative music glyph */}
      <span
        className="absolute inset-0 flex items-center justify-center
                   text-[5rem] leading-none select-none pointer-events-none"
        style={{ color: meta.accent, opacity: 0.06 }}
        aria-hidden
      >
        ♩
      </span>

      {/* Category pill */}
      <div
        className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full
                   text-[0.53rem] font-semibold tracking-wide"
        style={{
          background: `${meta.accent}20`,
          color: meta.accent,
          border: `1px solid ${meta.accent}3a`,
        }}
      >
        {meta.label}
      </div>

      {/* Play button — fades in via parent hover variant */}
      <motion.div
        variants={playVariants}
        transition={snap}
        className="absolute inset-0 flex items-center justify-center bg-black/20"
      >
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center shadow-xl"
          style={{ background: COLORS.gold.DEFAULT }}
        >
          <Play
            size={16}
            className="ml-0.5"
            fill={COLORS.surface['900']}
            color={COLORS.surface['900']}
          />
        </div>
      </motion.div>
    </div>
  )
}

/* ─── Video card ──────────────────────────────────────────────────────────── */
function VideoCard({ video, onClick }: { video: Video; onClick: (v: Video) => void }) {
  return (
    <motion.div
      variants={cardVariants}
      initial="idle"
      whileHover="hover"
      transition={snap}
      onClick={() => onClick(video)}
      className="rounded-xl overflow-hidden bg-surface-700 cursor-pointer will-change-transform"
    >
      <VideoThumbnail video={video} />

      <div className="px-3 py-2.5">
        <p className="text-foreground text-sm font-semibold leading-snug line-clamp-1">
          {video.title}
        </p>
        <p className="text-foreground-muted text-[0.7rem] mt-0.5 line-clamp-1">
          {video.artist}
        </p>
      </div>
    </motion.div>
  )
}

/* ─── Filter tabs ─────────────────────────────────────────────────────────── */
function FilterTabs({
  active,
  onChange,
}: {
  active: FilterId
  onChange: (id: FilterId) => void
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {FILTERS.map(f => (
        <button
          key={f.id}
          onClick={() => onChange(f.id)}
          className={cn(
            'relative shrink-0 px-4 py-2 rounded-full text-sm font-medium',
            'outline-none focus-visible:ring-2 focus-visible:ring-gold/60',
            active === f.id
              ? 'text-surface-900'
              : 'bg-surface-700 text-foreground-dim hover:text-foreground transition-colors duration-150',
          )}
        >
          {active === f.id && (
            <motion.span
              layoutId="reels-filter-pill"
              className="absolute inset-0 rounded-full bg-gold"
              transition={snap}
            />
          )}
          <span className="relative z-10">{f.label}</span>
        </button>
      ))}
    </div>
  )
}

/* ─── Modal (portalled to document.body) ─────────────────────────────────── */
function VideoModal({ video, onClose }: { video: Video | null; onClose: () => void }) {
  const meta = video ? CATEGORY_META[video.category] : null

  useEffect(() => {
    if (!video) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [video, onClose])

  return createPortal(
    <AnimatePresence>
      {video && meta && (
        <>
          {/* Backdrop */}
          <motion.div
            key="reel-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[90] bg-black/85 backdrop-blur-md"
          />

          {/* Sheet */}
          <motion.div
            key="reel-modal"
            initial={{ opacity: 0, scale: 0.90, y: 28 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{ opacity: 0,    scale: 0.90, y: 28 }}
            transition={gentle}
            className="fixed inset-0 z-[100] flex items-center justify-center
                       overflow-y-auto py-6 px-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-[340px] my-auto rounded-2xl overflow-hidden pointer-events-auto
                         shadow-[0_48px_100px_rgba(0,0,0,0.88)]"
              style={{
                background: COLORS.surface['800'],
                border: `1px solid ${meta.accent}28`,
              }}
            >
              {/* Header */}
              <div className="relative flex items-start px-4 pt-4 pb-3">
                <div className="flex-1 min-w-0 pr-10">
                  <div
                    className="inline-flex items-center px-2 py-0.5 rounded-full mb-1.5
                               text-[0.52rem] font-semibold tracking-wide"
                    style={{
                      background: `${meta.accent}18`,
                      color: meta.accent,
                      border: `1px solid ${meta.accent}30`,
                    }}
                  >
                    {meta.label}
                  </div>
                  <p className="font-display font-bold text-[1.05rem] leading-snug text-foreground">
                    {video.title}
                  </p>
                  <p className="text-foreground-muted text-xs mt-0.5 truncate">{video.artist}</p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.90 }}
                  transition={snap}
                  onClick={onClose}
                  aria-label="Close video"
                  className="absolute top-3.5 right-3.5 p-1.5 rounded-full
                             bg-surface-700 border border-surface-600
                             text-foreground-muted hover:text-foreground transition-colors
                             outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
                >
                  <X size={14} />
                </motion.button>
              </div>

              {/* TikTok embed — height responsive to viewport */}
              <div
                className="relative w-full overflow-hidden"
                style={{ height: 'min(560px, calc(70vh - 4rem))' }}
              >
                <iframe
                  src={`https://www.tiktok.com/embed/v2/${video.id}`}
                  className="absolute inset-0 w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  title={`${video.title} — ${video.artist}`}
                />
              </div>

              {/* Footer */}
              <div
                className="px-4 py-3"
                style={{ borderTop: `1px solid ${COLORS.surface['700']}` }}
              >
                <a
                  href={`https://www.tiktok.com/@malikadegaldoruwa/video/${video.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-foreground-muted text-[0.7rem]
                             hover:text-gold transition-colors duration-150"
                >
                  <ExternalLink size={10} />
                  View on TikTok
                </a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  )
}

/* ─── Section ─────────────────────────────────────────────────────────────── */
export default function Reels() {
  const ref    = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const [activeFilter, setActiveFilter] = useState<FilterId>('all')
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)

  const filtered =
    activeFilter === 'all'
      ? VIDEOS
      : VIDEOS.filter(v => v.category === activeFilter)

  return (
    <section
      id="reels"
      ref={ref}
      className="relative py-28 md:py-36 bg-surface-900 overflow-hidden"
    >
      {/* Edge rules */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/10 to-transparent" />

      {/* Ambient glows */}
      <div
        className="absolute -left-48 top-1/3 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none"
        style={{ background: COLORS.accent, opacity: 0.04 }}
      />
      <div
        className="absolute -right-40 bottom-1/4 w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none"
        style={{ background: COLORS.gold.DEFAULT, opacity: 0.035 }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="mb-10">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.35 }}
            className="flex items-center gap-3 mb-5"
          >
            <span className="h-px w-8 bg-gold" />
            <span className="text-gold text-[0.62rem] font-bold tracking-[0.28em] uppercase">
              Drum Covers
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ ...gentle, delay: 0.08 }}
            className="font-display font-bold text-[clamp(2rem,5vw,3.2rem)] text-foreground leading-tight"
          >
            Watch &amp;{' '}
            <span className="text-gold-gradient">Listen</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ ...gentle, delay: 0.14 }}
            className="text-foreground-muted text-[0.93rem] mt-3 max-w-lg leading-relaxed"
          >
            750K+ views across TikTok and YouTube — covers spanning metal,
            Sinhala classics, baila, modern pop, and everything in between.
          </motion.p>
        </div>

        {/* ── Filter tabs ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ ...gentle, delay: 0.2 }}
          className="mb-8"
        >
          <FilterTabs active={activeFilter} onChange={setActiveFilter} />
        </motion.div>

        {/* ── Grid ─────────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.14 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
          >
            {filtered.map((video, i) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 18, scale: 0.97 }}
                animate={{ opacity: 1, y: 0,  scale: 1    }}
                transition={{ ...gentle, delay: Math.min(i * 0.04, 0.3) }}
              >
                <VideoCard video={video} onClick={setSelectedVideo} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* ── Count ────────────────────────────────────────────────────── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.65 }}
          className="text-center text-foreground-muted text-[0.67rem] tracking-widest uppercase mt-12"
        >
          {filtered.length} cover{filtered.length !== 1 ? 's' : ''} · @MalikaDrums
        </motion.p>
      </div>

      {/* Modal */}
      <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
    </section>
  )
}
