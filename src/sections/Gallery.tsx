import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, useInView, useAnimation } from 'framer-motion'
import { X, Upload, Camera, Lock, Trash2, CheckCircle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { COLORS } from '@/lib/colors'

/* ─── Types ───────────────────────────────────────────────────────────────── */
type GalleryCategory = 'live-gig' | 'photoshoot' | 'studio' | 'behind-scenes'
type GalleryFilter   = GalleryCategory | 'all'
type PinPhase        = 'idle' | 'checking' | 'success' | 'error' | 'locked'
type AdminTab        = 'upload' | 'manage'

type GalleryImage = {
  id:           string
  src?:         string
  caption:      string
  location?:    string
  category?:    GalleryCategory
  uploadedAt?:  string
  aspectRatio?: string
  accent?:      string
}

type Preview = { src: string; caption: string }

/* ─── Constants ───────────────────────────────────────────────────────────── */
const STORAGE_KEY  = 'malika_gallery_v1'
const CORRECT_PIN  = '1927'
const MAX_DIM      = 1200
const MAX_ATTEMPTS = 5
const LOCKOUT_SECS = 60

const GALLERY_CATS: { id: GalleryCategory; label: string; accent: string }[] = [
  { id: 'live-gig',      label: 'Live Gig',          accent: '#dc2626' },
  { id: 'photoshoot',    label: 'Photoshoot',         accent: '#7c3aed' },
  { id: 'studio',        label: 'Studio',             accent: COLORS.gold.DEFAULT },
  { id: 'behind-scenes', label: 'Behind the Scenes',  accent: '#0891b2' },
]

const FILTER_OPTS: { id: GalleryFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  ...GALLERY_CATS.map(c => ({ id: c.id as GalleryFilter, label: c.label })),
]

const catMeta = (id: GalleryCategory) => GALLERY_CATS.find(c => c.id === id)!

/* ─── Module-level security state ────────────────────────────────────────── */
let _failedAttempts = 0
let _lockedUntil: number | null = null

/* ─── Placeholders ────────────────────────────────────────────────────────── */
const PLACEHOLDERS: GalleryImage[] = [
  { id: 'ph1', caption: 'Gig at Colombo',          location: 'Colombo City',              aspectRatio: '3/4',  accent: COLORS.gold.DEFAULT },
  { id: 'ph2', caption: 'Studio Session',           location: 'Kaduwela Recording Studio', aspectRatio: '4/5',  accent: COLORS.accent },
  { id: 'ph3', caption: 'Rehearsal with Sacrement', location: 'Band Room, Colombo',        aspectRatio: '4/3',  accent: '#dc2626' },
  { id: 'ph4', caption: 'Soundcheck',               location: 'Live Venue, Kandy',         aspectRatio: '3/4',  accent: '#0891b2' },
  { id: 'ph5', caption: 'The Cosmos Live',          location: 'Colombo City Stage',        aspectRatio: '16/9', accent: '#7c3aed' },
  { id: 'ph6', caption: 'Post-show with the Band',  location: 'Backstage',                 aspectRatio: '4/3',  accent: COLORS.gold.DEFAULT },
  { id: 'ph7', caption: 'Recording Session',        location: 'Studio',                    aspectRatio: '3/4',  accent: '#ec4899' },
  { id: 'ph8', caption: 'Festival Stage',           location: 'Colombo International',     aspectRatio: '1/1',  accent: '#d97706' },
]

/* ─── Utilities ───────────────────────────────────────────────────────────── */
async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      let w = img.naturalWidth, h = img.naturalHeight
      if (w > MAX_DIM || h > MAX_DIM) {
        const s = Math.min(MAX_DIM / w, MAX_DIM / h)
        w = Math.round(w * s); h = Math.round(h * s)
      }
      const canvas = document.createElement('canvas')
      canvas.width = w; canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('canvas')); return }
      ctx.drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.82))
    }
    img.onerror = reject; img.src = url
  })
}

const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

/* ─── Spring presets ──────────────────────────────────────────────────────── */
const snap   = { type: 'spring', stiffness: 420, damping: 32 } as const
const gentle = { type: 'spring', stiffness: 240, damping: 22 } as const

/* ─── Shared variants ─────────────────────────────────────────────────────── */
const cardVariants = {
  idle:  { y: 0,  scale: 1,    boxShadow: '0 2px 8px rgba(0,0,0,0.32), 0 0 0 1px rgba(36,36,36,1)' },
  hover: { y: -5, scale: 1.02, boxShadow: '0 18px 38px rgba(0,0,0,0.58), 0 0 0 1px rgba(212,175,55,0.42)' },
} as const
const captionVariants = { idle: { opacity: 0 },               hover: { opacity: 1 } }
const deleteVariants  = { idle: { opacity: 0, scale: 0.72 },  hover: { opacity: 1, scale: 1 } }

/* ─── Filter pills ────────────────────────────────────────────────────────── */
function FilterPills({
  options,
  active,
  onChange,
  pillId,
}: {
  options:  { id: string; label: string }[]
  active:   string
  onChange: (id: string) => void
  pillId:   string
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {options.map(opt => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={cn(
            'relative shrink-0 px-4 py-2 rounded-full text-sm font-medium',
            'outline-none focus-visible:ring-2 focus-visible:ring-gold/60',
            active === opt.id
              ? 'text-surface-900'
              : 'bg-surface-700 text-foreground-dim hover:text-foreground transition-colors duration-150',
          )}
        >
          {active === opt.id && (
            <motion.span layoutId={pillId} className="absolute inset-0 rounded-full bg-gold" transition={snap} />
          )}
          <span className="relative z-10">{opt.label}</span>
        </button>
      ))}
    </div>
  )
}

/* ─── Gallery card (public view) ──────────────────────────────────────────── */
function GalleryCard({ image }: { image: GalleryImage }) {
  const isPlaceholder = !image.src
  const cat = image.category ? catMeta(image.category) : null

  return (
    <motion.div
      variants={cardVariants}
      initial="idle"
      whileHover="hover"
      transition={snap}
      className="relative overflow-hidden rounded-xl will-change-transform cursor-default"
    >
      {isPlaceholder ? (
        <div
          className="relative"
          style={{
            aspectRatio: image.aspectRatio ?? '4/3',
            background: `radial-gradient(ellipse at 38% 32%, ${image.accent ?? COLORS.gold.DEFAULT}2c 0%, transparent 64%),
                         linear-gradient(148deg, ${COLORS.surface['700']} 0%, ${COLORS.surface['900']} 100%)`,
          }}
        >
          <div
            className="absolute inset-0 opacity-[0.044]"
            style={{ backgroundImage: `radial-gradient(${COLORS.foreground.muted} 1px, transparent 1px)`, backgroundSize: '18px 18px' }}
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Camera size={28} style={{ color: image.accent ?? COLORS.gold.DEFAULT, opacity: 0.13 }} />
          </div>
        </div>
      ) : (
        <img src={image.src} alt={image.caption} className="w-full block" loading="lazy" draggable={false} />
      )}

      {/* Caption overlay */}
      <motion.div
        variants={captionVariants}
        transition={{ duration: 0.22 }}
        className="absolute inset-0 flex flex-col justify-end
                   bg-gradient-to-t from-black/75 via-black/18 to-transparent p-3"
      >
        {cat && (
          <div
            className="inline-flex self-start px-2 py-0.5 rounded-full mb-1.5
                       text-[0.52rem] font-semibold tracking-wide"
            style={{ background: `${cat.accent}25`, color: cat.accent, border: `1px solid ${cat.accent}35` }}
          >
            {cat.label}
          </div>
        )}
        <p className="text-white text-sm font-semibold leading-snug">{image.caption}</p>
        {image.location && <p className="text-white/50 text-[0.62rem] mt-0.5">{image.location}</p>}
      </motion.div>
    </motion.div>
  )
}

/* ─── Admin card (manage tab) ─────────────────────────────────────────────── */
function AdminCard({
  image,
  onDelete,
  deleting,
}: {
  image:    GalleryImage
  onDelete: () => void
  deleting: boolean
}) {
  const cat = image.category ? catMeta(image.category) : null

  return (
    <motion.div
      variants={!deleting ? cardVariants : undefined}
      initial="idle"
      whileHover={!deleting ? 'hover' : undefined}
      animate={deleting ? { opacity: 0, scale: 0.82 } : undefined}
      transition={deleting ? { duration: 0.22, ease: 'easeOut' as const } : snap}
      className="relative overflow-hidden rounded-xl will-change-transform cursor-default"
    >
      <img src={image.src!} alt={image.caption} className="w-full block" loading="lazy" draggable={false} />

      {/* Overlay */}
      <motion.div
        variants={captionVariants}
        transition={{ duration: 0.22 }}
        className="absolute inset-0 flex flex-col justify-end
                   bg-gradient-to-t from-black/85 via-black/25 to-transparent p-3"
      >
        {cat && (
          <div
            className="inline-flex self-start px-2 py-0.5 rounded-full mb-1.5
                       text-[0.52rem] font-semibold"
            style={{ background: `${cat.accent}28`, color: cat.accent, border: `1px solid ${cat.accent}38` }}
          >
            {cat.label}
          </div>
        )}

        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold leading-snug line-clamp-2">{image.caption}</p>
            {image.location && <p className="text-white/50 text-[0.58rem] mt-0.5">{image.location}</p>}
          </div>

          <motion.button
            variants={deleteVariants}
            transition={snap}
            onClick={e => { e.stopPropagation(); onDelete() }}
            aria-label={`Delete ${image.caption}`}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-full
                       bg-red-600/90 text-white text-[0.63rem] font-semibold
                       hover:bg-red-500 active:scale-95
                       transition-colors duration-150
                       outline-none focus-visible:ring-2 focus-visible:ring-red-400/70"
          >
            <Trash2 size={10} />
            Delete
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ─── Delete confirm modal ────────────────────────────────────────────────── */
function DeleteConfirmModal({
  image,
  onConfirm,
  onCancel,
}: {
  image:     GalleryImage | null
  onConfirm: () => void
  onCancel:  () => void
}) {
  useEffect(() => {
    if (!image) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [image, onCancel])

  return createPortal(
    <AnimatePresence>
      {image && (
        <>
          <motion.div
            key="dcm-bd"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onCancel}
            className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            key="dcm-sheet"
            initial={{ opacity: 0, scale: 0.88, y: 20 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{ opacity: 0,    scale: 0.88, y: 20 }}
            transition={snap}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              role="dialog" aria-modal="true" aria-label="Confirm delete"
              className="relative w-full max-w-[300px] rounded-2xl overflow-hidden pointer-events-auto
                         shadow-[0_32px_72px_rgba(0,0,0,0.88)]"
              style={{ background: COLORS.surface['800'], border: `1px solid ${COLORS.surface['600']}` }}
            >
              <div className="p-6 flex flex-col items-center text-center">
                {/* Thumbnail preview */}
                {image.src && (
                  <div className="w-20 h-20 rounded-xl overflow-hidden mb-4 shadow-lg ring-1 ring-white/10">
                    <img src={image.src} alt={image.caption} className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Trash icon pulse */}
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ ...snap, delay: 0.06 }}
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
                  style={{ background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.22)' }}
                >
                  <Trash2 size={16} className="text-red-400" />
                </motion.div>

                <p className="font-display font-bold text-base text-foreground">Delete photo?</p>
                <p className="text-foreground-muted text-xs mt-1.5 leading-relaxed line-clamp-2 max-w-[220px]">
                  "{image.caption}" will be permanently removed from your gallery.
                </p>

                <div className="flex gap-2.5 mt-5 w-full">
                  <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} transition={snap}
                    onClick={onCancel}
                    className="flex-1 py-2.5 rounded-xl text-sm text-foreground-muted
                               border border-surface-600 hover:border-surface-500 hover:text-foreground-dim
                               transition-colors duration-150
                               outline-none focus-visible:ring-2 focus-visible:ring-surface-500"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03, boxShadow: '0 4px 20px rgba(220,38,38,0.42)' }}
                    whileTap={{ scale: 0.96 }}
                    transition={snap}
                    onClick={onConfirm}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold
                               bg-red-600 text-white hover:bg-red-500
                               transition-colors duration-150
                               outline-none focus-visible:ring-2 focus-visible:ring-red-400/70"
                  >
                    Delete
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  )
}

/* ─── PIN modal ───────────────────────────────────────────────────────────── */
function PinModal({ open, onSuccess, onClose }: { open: boolean; onSuccess: () => void; onClose: () => void }) {
  const [digits,    setDigits]    = useState<string[]>(['', '', '', ''])
  const [phase,     setPhase]     = useState<PinPhase>('idle')
  const [countdown, setCountdown] = useState(0)
  const shake         = useAnimation()
  const submittingRef = useRef(false)

  const r0 = useRef<HTMLInputElement>(null)
  const r1 = useRef<HTMLInputElement>(null)
  const r2 = useRef<HTMLInputElement>(null)
  const r3 = useRef<HTMLInputElement>(null)
  const pinRefs = [r0, r1, r2, r3]

  useEffect(() => {
    if (!open) {
      setDigits(['', '', '', ''])
      setPhase(p => (p === 'locked' ? 'locked' : 'idle'))
      return
    }
    if (_lockedUntil !== null && Date.now() < _lockedUntil) {
      setPhase('locked'); setCountdown(Math.ceil((_lockedUntil - Date.now()) / 1000))
      return
    }
    setDigits(['', '', '', '']); setPhase('idle')
    const t = setTimeout(() => r0.current?.focus(), 90)
    return () => clearTimeout(t)
  }, [open])

  useEffect(() => {
    if (phase !== 'locked') return
    const tick = setInterval(() => {
      const rem = _lockedUntil ? Math.ceil((_lockedUntil - Date.now()) / 1000) : 0
      if (rem <= 0) {
        _lockedUntil = null; _failedAttempts = 0
        clearInterval(tick); setPhase('idle'); setCountdown(0)
        setTimeout(() => r0.current?.focus(), 30)
      } else { setCountdown(rem) }
    }, 1000)
    return () => clearInterval(tick)
  }, [phase])

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [open, onClose])

  const handleSubmit = useCallback(async (d: string[]) => {
    if (submittingRef.current) return
    if (_lockedUntil !== null && Date.now() < _lockedUntil) return
    submittingRef.current = true; setPhase('checking')
    await delay(340)
    if (d.join('') === CORRECT_PIN) {
      _failedAttempts = 0; setPhase('success')
      await delay(520); submittingRef.current = false; onSuccess()
    } else {
      _failedAttempts++
      if (_failedAttempts >= MAX_ATTEMPTS) {
        _lockedUntil = Date.now() + LOCKOUT_SECS * 1000
        setPhase('locked'); setCountdown(LOCKOUT_SECS); submittingRef.current = false
      } else {
        setPhase('error')
        await shake.start({ x: [-10, 10, -8, 8, -4, 4, 0] }, { duration: 0.42 })
        setDigits(['', '', '', '']); await delay(1100)
        setPhase('idle'); submittingRef.current = false
        setTimeout(() => r0.current?.focus(), 30)
      }
    }
  }, [onSuccess, shake])

  const handleChange = (i: number, val: string) => {
    if (phase !== 'idle' || submittingRef.current) return
    const char = val.replace(/\D/g, '').slice(-1)
    if (!char && val !== '') return
    const next = [...digits]; next[i] = char; setDigits(next)
    if (char && i < 3) pinRefs[i + 1].current?.focus()
    if (char && i === 3) handleSubmit(next)
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (phase !== 'idle') return
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      const next = [...digits]; next[i - 1] = ''; setDigits(next); pinRefs[i - 1].current?.focus()
    }
    if (e.key === 'Enter' && digits.every(Boolean)) handleSubmit(digits)
  }

  const remainingAttempts = MAX_ATTEMPTS - _failedAttempts

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="pin-bd"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[90] bg-black/85 backdrop-blur-md"
          />
          <motion.div
            key="pin-sheet"
            initial={{ opacity: 0, scale: 0.90, y: 28 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{ opacity: 0,    scale: 0.90, y: 28 }}
            transition={gentle}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              role="dialog" aria-modal="true" aria-label="Admin access PIN"
              className="relative w-full max-w-[340px] rounded-2xl overflow-hidden pointer-events-auto
                         shadow-[0_40px_80px_rgba(0,0,0,0.92)]"
              style={{ background: COLORS.surface['800'], border: `1px solid ${COLORS.surface['600']}` }}
            >
              <div className="px-6 pt-7 pb-5 text-center">
                <motion.div
                  animate={phase === 'success'
                    ? { scale: [1, 1.18, 1], backgroundColor: [`${COLORS.gold.DEFAULT}16`, `${COLORS.gold.DEFAULT}30`, `${COLORS.gold.DEFAULT}16`] }
                    : phase === 'error' ? { scale: [1, 0.88, 1] } : {}}
                  transition={{ duration: 0.45 }}
                  className="w-11 h-11 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: `${COLORS.gold.DEFAULT}16`, border: `1px solid ${COLORS.gold.DEFAULT}2e` }}
                >
                  {phase === 'success'
                    ? <CheckCircle size={18} style={{ color: COLORS.gold.DEFAULT }} />
                    : <Lock size={17} style={{ color: phase === 'error' ? '#f87171' : COLORS.gold.DEFAULT }} />
                  }
                </motion.div>
                <p className="font-display font-bold text-[1.1rem] text-foreground">
                  {phase === 'locked' ? 'Too Many Attempts' : 'Admin Access'}
                </p>
                <p className="text-foreground-muted text-[0.78rem] mt-1 leading-snug">
                  {phase === 'locked'
                    ? `Locked for ${countdown} second${countdown !== 1 ? 's' : ''}`
                    : 'Enter your 4-digit PIN to manage photos'}
                </p>
              </div>

              <div className="px-6 pb-6">
                {phase === 'locked' ? (
                  <div className="flex flex-col items-center gap-3 py-2 mb-4">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-surface-600"
                      style={{ background: COLORS.surface['700'] }}>
                      <motion.p
                        key={countdown}
                        initial={{ scale: 1.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={snap}
                        className="font-display font-bold text-2xl"
                        style={{ color: countdown <= 10 ? '#f87171' : COLORS.foreground.dim }}
                      >
                        {countdown}
                      </motion.p>
                    </div>
                    <p className="text-foreground-muted text-[0.72rem]">{MAX_ATTEMPTS} consecutive failures detected</p>
                  </div>
                ) : (
                  <>
                    <motion.div animate={shake} className="flex gap-3 justify-center mb-3">
                      {digits.map((d, i) => (
                        <input
                          key={i} ref={pinRefs[i]} type="tel" inputMode="numeric"
                          maxLength={2} value={d} disabled={phase !== 'idle'}
                          onChange={e => handleChange(i, e.target.value)}
                          onKeyDown={e => handleKeyDown(i, e)}
                          onFocus={e => e.target.select()}
                          aria-label={`PIN digit ${i + 1}`}
                          className={cn(
                            'w-14 h-16 text-center text-2xl font-bold rounded-xl outline-none border-2 transition-colors duration-200',
                            phase === 'checking' && 'bg-surface-700/60 border-gold/20 text-foreground-muted cursor-not-allowed',
                            phase === 'success'  && 'bg-surface-700 border-gold/55 text-gold cursor-not-allowed',
                            phase === 'error'    && 'bg-surface-700 border-red-500/55 text-red-400 cursor-not-allowed',
                            phase === 'idle'     && (d
                              ? 'bg-surface-700 border-gold/45 text-foreground focus:border-gold/75'
                              : 'bg-surface-700 border-surface-600 text-foreground focus:border-gold/60'),
                          )}
                        />
                      ))}
                    </motion.div>

                    <div className="min-h-[28px] flex items-center justify-center mb-3">
                      <AnimatePresence mode="wait">
                        {phase === 'checking' && (
                          <motion.div key="chk"
                            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            transition={{ duration: 0.18 }} className="flex items-center gap-2"
                          >
                            <motion.div animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' as const }}
                              className="w-3.5 h-3.5 border border-gold/35 border-t-gold rounded-full"
                            />
                            <p className="text-foreground-muted text-[0.72rem]">Verifying…</p>
                          </motion.div>
                        )}
                        {phase === 'success' && (
                          <motion.div key="ok"
                            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                            transition={snap} className="flex items-center gap-1.5"
                          >
                            <CheckCircle size={14} style={{ color: COLORS.gold.DEFAULT }} />
                            <p className="text-[0.72rem] font-semibold" style={{ color: COLORS.gold.DEFAULT }}>Access granted</p>
                          </motion.div>
                        )}
                        {phase === 'error' && (
                          <motion.p key="err"
                            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            transition={{ duration: 0.18 }} className="text-red-400 text-[0.72rem] text-center"
                          >
                            Incorrect PIN ·{' '}
                            <span className="font-semibold">{remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining</span>
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </>
                )}

                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl text-sm text-foreground-muted
                             border border-surface-600 hover:border-surface-500 hover:text-foreground-dim
                             transition-colors duration-150
                             outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
                >
                  Cancel
                </button>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} transition={snap}
                onClick={onClose} aria-label="Close"
                className="absolute top-3.5 right-3.5 p-1.5 rounded-full
                           bg-surface-700 border border-surface-600
                           text-foreground-muted hover:text-foreground transition-colors
                           outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
              >
                <X size={14} />
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  )
}

/* ─── Admin panel ─────────────────────────────────────────────────────────── */
function AdminPanel({
  open,
  uploaded,
  onAdd,
  onDelete,
  onReset,
  onClose,
}: {
  open:     boolean
  uploaded: GalleryImage[]
  onAdd:    (images: GalleryImage[]) => void
  onDelete: (id: string) => void
  onReset:  () => void
  onClose:  () => void
}) {
  const [activeTab,    setActiveTab]    = useState<AdminTab>('upload')
  const [previews,     setPreviews]     = useState<Preview[]>([])
  const [category,     setCategory]     = useState<GalleryCategory>('live-gig')
  const [processing,   setProcessing]   = useState(false)
  const [saveError,    setSaveError]    = useState(false)
  const [pendingDelete, setPendingDelete] = useState<GalleryImage | null>(null)
  const [deletingId,   setDeletingId]   = useState<string | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  // Reset local state on open; preserve tab on close
  useEffect(() => {
    if (!open) {
      setPreviews([]); setSaveError(false); setConfirmReset(false); setPendingDelete(null); setDeletingId(null)
      return
    }
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (pendingDelete) { setPendingDelete(null); return }
      onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [open, pendingDelete, onClose])

  // Re-register key handler when pendingDelete changes
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (pendingDelete) { setPendingDelete(null) } else { onClose() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, pendingDelete, onClose])

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setProcessing(true); setSaveError(false)
    try {
      const processed = await Promise.all(
        files.map(async f => ({ src: await compressImage(f), caption: f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ') })),
      )
      setPreviews(processed)
    } catch { /* ignore */ } finally { setProcessing(false); e.target.value = '' }
  }

  const handleSave = () => {
    const images: GalleryImage[] = previews.map((p, i) => ({
      id: `up-${Date.now()}-${i}`, src: p.src,
      caption: p.caption || 'Untitled', category, uploadedAt: new Date().toISOString(),
    }))
    try { onAdd(images); setPreviews([]); setCategory('live-gig'); setActiveTab('manage') }
    catch { setSaveError(true) }
  }

  const handleDeleteRequest = (image: GalleryImage) => setPendingDelete(image)

  const handleDeleteConfirm = useCallback(() => {
    if (!pendingDelete) return
    const id = pendingDelete.id
    setPendingDelete(null)
    setDeletingId(id)
    setTimeout(() => {
      setDeletingId(null)
      onDelete(id)
    }, 240)
  }, [pendingDelete, onDelete])

  const handleReset = () => {
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
    onReset(); onClose()
  }

  const tabs = [
    { id: 'upload' as const, label: 'Upload New' },
    { id: 'manage' as const, label: uploaded.length > 0 ? `Manage (${uploaded.length})` : 'Manage' },
  ]

  const canSave = previews.length > 0 && !processing

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="ap-bd"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            className="fixed inset-0 z-[90] bg-black/88 backdrop-blur-md"
          />

          <motion.div
            key="ap-sheet"
            initial={{ opacity: 0, scale: 0.92, y: 32 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{ opacity: 0,    scale: 0.92, y: 32 }}
            transition={gentle}
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto
                       py-6 px-4 pointer-events-none"
          >
            <div
              role="dialog" aria-modal="true" aria-label="Gallery Admin Panel"
              className="relative w-full max-w-[600px] my-auto rounded-2xl overflow-hidden pointer-events-auto
                         flex flex-col shadow-[0_48px_100px_rgba(0,0,0,0.94)] max-h-[88vh]"
              style={{ background: COLORS.surface['800'], border: `1px solid ${COLORS.surface['600']}` }}
            >
              {/* ── Header ──────────────────────────────────────────────── */}
              <div
                className="flex items-center gap-3 px-5 py-4 shrink-0"
                style={{ borderBottom: `1px solid ${COLORS.surface['700']}` }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: `${COLORS.gold.DEFAULT}16`, border: `1px solid ${COLORS.gold.DEFAULT}2e` }}
                >
                  <Lock size={14} style={{ color: COLORS.gold.DEFAULT }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-[1rem] text-foreground leading-none">Admin Panel</p>
                  <p className="text-foreground-muted text-[0.7rem] mt-0.5">
                    {uploaded.length} uploaded · {PLACEHOLDERS.length} placeholders
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} transition={snap}
                  onClick={onClose} aria-label="Close admin panel"
                  className="p-1.5 rounded-full bg-surface-700 border border-surface-600
                             text-foreground-muted hover:text-foreground transition-colors
                             outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
                >
                  <X size={14} />
                </motion.button>
              </div>

              {/* ── Tab bar ──────────────────────────────────────────────── */}
              <div
                className="px-4 pt-3 pb-3 shrink-0"
                style={{ borderBottom: `1px solid ${COLORS.surface['700']}` }}
              >
                <div
                  className="flex gap-1 p-1 rounded-xl"
                  style={{ background: COLORS.surface['900'] }}
                >
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        'relative flex-1 py-2 rounded-lg text-sm font-medium transition-colors duration-150',
                        'outline-none focus-visible:ring-2 focus-visible:ring-gold/50',
                        activeTab === tab.id ? 'text-foreground' : 'text-foreground-muted hover:text-foreground-dim',
                      )}
                    >
                      {activeTab === tab.id && (
                        <motion.span
                          layoutId="admin-tab-bg"
                          className="absolute inset-0 rounded-lg"
                          style={{ background: COLORS.surface['700'] }}
                          transition={snap}
                        />
                      )}
                      <span className="relative z-10">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Tab content ──────────────────────────────────────────── */}
              <div className="flex-1 overflow-y-auto min-h-0">
                <AnimatePresence mode="wait" initial={false}>

                  {/* Upload tab */}
                  {activeTab === 'upload' && (
                    <motion.div
                      key="upload-tab"
                      initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
                      transition={{ duration: 0.18 }}
                      className="p-5 space-y-4"
                    >
                      {/* Category */}
                      <div>
                        <p className="text-foreground-muted text-[0.65rem] font-semibold tracking-widest uppercase mb-2">
                          Category
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {GALLERY_CATS.map(cat => (
                            <button
                              key={cat.id}
                              onClick={() => setCategory(cat.id)}
                              className={cn(
                                'relative px-3.5 py-1.5 rounded-full text-xs font-semibold',
                                'transition-colors duration-150',
                                'outline-none focus-visible:ring-2 focus-visible:ring-gold/60',
                                category === cat.id ? 'text-white' : 'text-foreground-muted hover:text-foreground-dim',
                              )}
                              style={{ background: category === cat.id ? cat.accent : COLORS.surface['700'] }}
                            >
                              {category === cat.id && (
                                <motion.span
                                  layoutId="upload-cat-pill"
                                  className="absolute inset-0 rounded-full"
                                  style={{ background: cat.accent }}
                                  transition={snap}
                                />
                              )}
                              <span className="relative z-10">{cat.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Drop zone */}
                      <label className="block cursor-pointer">
                        <input type="file" accept="image/*" multiple onChange={handleFiles} className="sr-only" />
                        <div className={cn(
                          'rounded-xl border-2 border-dashed p-7 text-center transition-colors duration-150',
                          processing ? 'border-gold/30 bg-gold/[0.03]'
                                     : 'border-surface-600 hover:border-gold/40 hover:bg-gold/[0.02]',
                        )}>
                          {processing ? (
                            <div className="space-y-2">
                              <motion.div animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' as const }}
                                className="w-6 h-6 border-2 border-gold/35 border-t-gold rounded-full mx-auto"
                              />
                              <p className="text-foreground-muted text-sm">Compressing…</p>
                            </div>
                          ) : (
                            <>
                              <Upload size={22} style={{ color: COLORS.gold.DEFAULT }} className="mx-auto mb-2 opacity-70" />
                              <p className="text-foreground-dim text-sm font-medium">
                                {previews.length ? 'Click to change selection' : 'Click to select photos'}
                              </p>
                              <p className="text-foreground-muted text-[0.7rem] mt-1">JPG, PNG, HEIC · Multiple allowed</p>
                            </>
                          )}
                        </div>
                      </label>

                      {/* Previews */}
                      {previews.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-foreground-muted text-[0.65rem] font-semibold tracking-widest uppercase">
                            {previews.length} photo{previews.length !== 1 ? 's' : ''} · edit captions
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[220px] overflow-y-auto">
                            {previews.map((p, i) => (
                              <motion.div key={i}
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                transition={{ ...gentle, delay: i * 0.04 }}
                                className="space-y-1.5"
                              >
                                <div className="relative aspect-square rounded-lg overflow-hidden bg-surface-700">
                                  <img src={p.src} alt={p.caption} className="w-full h-full object-cover" />
                                </div>
                                <input
                                  value={p.caption}
                                  onChange={e => { const n = [...previews]; n[i] = { ...n[i], caption: e.target.value }; setPreviews(n) }}
                                  placeholder="Caption…"
                                  className="w-full text-[0.7rem] px-2 py-1.5 rounded-lg
                                             bg-surface-700 border border-surface-600 text-foreground
                                             placeholder:text-foreground-muted outline-none
                                             focus:border-gold/50 transition-colors duration-150"
                                />
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Error */}
                      <AnimatePresence>
                        {saveError && (
                          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="text-amber-400 text-xs text-center"
                          >
                            Storage full. Remove some photos first.
                          </motion.p>
                        )}
                      </AnimatePresence>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <button onClick={onClose}
                          className="flex-1 py-2.5 rounded-xl text-sm text-foreground-muted
                                     border border-surface-600 hover:border-surface-500 hover:text-foreground-dim
                                     transition-colors duration-150
                                     outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
                        >
                          Cancel
                        </button>
                        <motion.button onClick={handleSave} disabled={!canSave}
                          whileHover={canSave ? { scale: 1.02, boxShadow: `0 6px 22px ${COLORS.gold.DEFAULT}38` } : {}}
                          whileTap={canSave ? { scale: 0.97 } : {}}
                          transition={snap}
                          className={cn(
                            'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-150',
                            'outline-none focus-visible:ring-2 focus-visible:ring-gold/60',
                            canSave ? 'text-surface-900 cursor-pointer' : 'text-surface-600 cursor-not-allowed',
                          )}
                          style={{ background: canSave ? COLORS.gold.DEFAULT : COLORS.surface['700'] }}
                        >
                          Add to Gallery
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {/* Manage tab */}
                  {activeTab === 'manage' && (
                    <motion.div
                      key="manage-tab"
                      initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
                      transition={{ duration: 0.18 }}
                    >
                      {uploaded.length === 0 ? (
                        /* Empty state */
                        <div className="py-20 px-5 flex flex-col items-center text-center gap-3">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{ background: COLORS.surface['700'], border: `1px solid ${COLORS.surface['600']}` }}>
                            <Camera size={20} className="text-foreground-muted opacity-50" />
                          </div>
                          <div>
                            <p className="text-foreground-dim text-sm font-medium">No uploaded photos yet</p>
                            <p className="text-foreground-muted text-xs mt-1">Switch to Upload New to add your first photo</p>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={snap}
                            onClick={() => setActiveTab('upload')}
                            className="mt-1 px-4 py-2 rounded-full text-xs font-semibold
                                       text-surface-900 outline-none
                                       focus-visible:ring-2 focus-visible:ring-gold/60"
                            style={{ background: COLORS.gold.DEFAULT }}
                          >
                            Go to Upload →
                          </motion.button>
                        </div>
                      ) : (
                        <div className="p-4 space-y-4">
                          {/* Count */}
                          <p className="text-foreground-muted text-[0.65rem] font-semibold tracking-widest uppercase">
                            {uploaded.length} photo{uploaded.length !== 1 ? 's' : ''} — hover to reveal delete
                          </p>

                          {/* Masonry */}
                          <div className="columns-2 sm:columns-3 gap-3">
                            {uploaded.map(image => (
                              <div key={image.id} className="break-inside-avoid mb-3">
                                <AdminCard
                                  image={image}
                                  onDelete={() => handleDeleteRequest(image)}
                                  deleting={deletingId === image.id}
                                />
                              </div>
                            ))}
                          </div>

                          {/* Danger zone */}
                          <div
                            className="pt-4 mt-2"
                            style={{ borderTop: `1px solid ${COLORS.surface['700']}` }}
                          >
                            <p className="text-[0.6rem] font-bold tracking-[0.2em] uppercase text-red-500/60 mb-2">
                              Danger Zone
                            </p>
                            <AnimatePresence mode="wait">
                              {!confirmReset ? (
                                <motion.button
                                  key="reset-btn"
                                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                  transition={{ duration: 0.15 }}
                                  onClick={() => setConfirmReset(true)}
                                  className="flex items-center gap-1.5 text-[0.7rem] text-foreground-muted
                                             hover:text-red-400 transition-colors duration-150 outline-none"
                                >
                                  <RefreshCw size={11} />
                                  Reset gallery — remove all {uploaded.length} uploaded photos
                                </motion.button>
                              ) : (
                                <motion.div
                                  key="reset-confirm"
                                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                  transition={{ duration: 0.18 }}
                                  className="flex flex-wrap items-center gap-x-3 gap-y-1.5"
                                >
                                  <p className="text-[0.7rem] text-red-400">
                                    Permanently remove all {uploaded.length} photos?
                                  </p>
                                  <div className="flex gap-2">
                                    <button onClick={handleReset}
                                      className="text-[0.7rem] font-semibold text-red-400 hover:text-red-300
                                                 transition-colors underline underline-offset-2"
                                    >Yes, reset</button>
                                    <button onClick={() => setConfirmReset(false)}
                                      className="text-[0.7rem] text-foreground-muted hover:text-foreground-dim transition-colors"
                                    >Cancel</button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Delete confirmation — portalled above admin panel */}
          <DeleteConfirmModal
            image={pendingDelete}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setPendingDelete(null)}
          />
        </>
      )}
    </AnimatePresence>,
    document.body,
  )
}

/* ─── Success toast ───────────────────────────────────────────────────────── */
function Toast({ message }: { message: string | null }) {
  return createPortal(
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ y: 20, opacity: 0, scale: 0.95 }}
          animate={{ y: 0,  opacity: 1, scale: 1    }}
          exit={{ y: 20,    opacity: 0, scale: 0.95 }}
          transition={snap}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[80]
                     flex items-center gap-2.5 px-5 py-3 rounded-full
                     shadow-xl select-none pointer-events-none whitespace-nowrap"
          style={{
            background:  COLORS.surface['700'],
            border:      `1px solid ${COLORS.surface['500']}`,
            boxShadow:   `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${COLORS.surface['600']}`,
          }}
        >
          <CheckCircle size={15} style={{ color: COLORS.gold.DEFAULT }} />
          <p className="text-foreground text-sm font-medium">{message}</p>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}


/* ─── Section ─────────────────────────────────────────────────────────────── */
export default function Gallery() {
  const sectionRef  = useRef<HTMLElement>(null)
  const inView      = useInView(sectionRef, { once: true, margin: '-80px' })

  // Triple-click on heading → open admin PIN (invisible to visitors)
  const clickCount = useRef(0)
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleHeadingClick = useCallback(() => {
    clickCount.current += 1
    if (clickTimer.current) clearTimeout(clickTimer.current)
    clickTimer.current = setTimeout(() => { clickCount.current = 0 }, 600)
    if (clickCount.current >= 3) {
      clickCount.current = 0
      if (clickTimer.current) clearTimeout(clickTimer.current)
      setModal('pin')
    }
  }, [])

  const [modal,        setModal]        = useState<'none' | 'pin' | 'admin'>('none')
  const [activeFilter, setActiveFilter] = useState<GalleryFilter>('all')
  const [toast,        setToast]        = useState<string | null>(null)

  const [uploaded, setUploaded] = useState<GalleryImage[]>(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); return s ? (JSON.parse(s) as GalleryImage[]) : [] }
    catch { return [] }
  })

  const allImages = useMemo(() => [...uploaded, ...PLACEHOLDERS], [uploaded])

  const filteredImages = useMemo(
    () => activeFilter === 'all' ? allImages : uploaded.filter(img => img.category === activeFilter),
    [activeFilter, allImages, uploaded],
  )

  const showToast = useCallback((msg: string) => {
    setToast(msg); setTimeout(() => setToast(null), 3000)
  }, [])

  const addImages = useCallback((images: GalleryImage[]) => {
    const next = [...images, ...uploaded]
    setUploaded(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    showToast(`${images.length} photo${images.length !== 1 ? 's' : ''} added to gallery`)
  }, [uploaded, showToast])

  const handleDelete = useCallback((id: string) => {
    setUploaded(prev => {
      const next = prev.filter(img => img.id !== id)
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
    showToast('Photo removed from gallery')
  }, [showToast])

  const handleReset = useCallback(() => {
    setUploaded([]); setActiveFilter('all')
    showToast('Gallery reset')
  }, [showToast])

  return (
    <section
      id="gallery"
      ref={sectionRef}
      className="relative py-28 md:py-36 bg-surface-800 overflow-hidden"
    >
      {/* Edge rules */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/10 to-transparent" />

      {/* Ambient glows */}
      <div className="absolute -right-44 top-1/3 w-[480px] h-[480px] rounded-full blur-[140px] pointer-events-none"
        style={{ background: COLORS.gold.DEFAULT, opacity: 0.04 }} />
      <div className="absolute -left-36 bottom-1/4 w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none"
        style={{ background: COLORS.accent, opacity: 0.035 }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10">
          <motion.div
            initial={{ opacity: 0, x: -16 }} animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.35 }}
            className="flex items-center gap-3 mb-5"
          >
            <span className="h-px w-8 bg-gold" />
            <span className="text-gold text-[0.62rem] font-bold tracking-[0.28em] uppercase">Live Moments</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ ...gentle, delay: 0.08 }}
            onClick={handleHeadingClick}
            className="font-display font-bold text-[clamp(2rem,5vw,3.2rem)] text-foreground leading-tight select-none cursor-default"
          >
            Behind the <span className="text-gold-gradient">Kit</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ ...gentle, delay: 0.14 }}
            className="text-foreground-muted text-[0.93rem] mt-3 max-w-lg leading-relaxed"
          >
            Gigs, studio sessions, rehearsals and the in-between moments.
          </motion.p>
        </div>

        {/* Filter tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ ...gentle, delay: 0.2 }}
          className="mb-8"
        >
          <FilterPills
            options={FILTER_OPTS}
            active={activeFilter}
            onChange={id => setActiveFilter(id as GalleryFilter)}
            pillId="gallery-filter-pill"
          />
        </motion.div>

        {/* Masonry grid */}
        {filteredImages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
            className="py-24 flex flex-col items-center gap-3 text-center"
          >
            <Camera size={30} className="text-foreground-muted opacity-30" />
            <p className="text-foreground-muted text-sm">
              No {GALLERY_CATS.find(c => c.id === activeFilter)?.label.toLowerCase()} photos yet
            </p>
            <p className="text-foreground-muted/55 text-xs">Photos coming soon</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.22 }}
            className="columns-2 sm:columns-3 gap-3 sm:gap-4"
          >
            {filteredImages.map((image, i) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ ...gentle, delay: 0.18 + Math.min(i * 0.05, 0.38) }}
                className="break-inside-avoid mb-3 sm:mb-4"
              >
                <GalleryCard image={image} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="text-center text-foreground-muted text-[0.67rem] tracking-widest uppercase mt-12"
        >
          {uploaded.length > 0
            ? `${uploaded.length} personal upload${uploaded.length !== 1 ? 's' : ''} · more coming soon`
            : 'Real photos coming soon'}
        </motion.p>
      </div>

      {/* PIN → Admin Panel flow */}
      <PinModal
        open={modal === 'pin'}
        onSuccess={() => setModal('admin')}
        onClose={() => setModal('none')}
      />
      <AdminPanel
        open={modal === 'admin'}
        uploaded={uploaded}
        onAdd={addImages}
        onDelete={handleDelete}
        onReset={handleReset}
        onClose={() => setModal('none')}
      />

      {/* Toast */}
      <Toast message={toast} />
    </section>
  )
}
