import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Sun, Moon } from 'lucide-react'
import { useScrolled } from '@/hooks/useScrolled'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { label: 'About',   href: '#about' },
  { label: 'Gear',    href: '#gear' },
  { label: 'Reels',   href: '#reels' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Contact', href: '#contact' },
]

/* Spring presets ─────────────────────────────────────────────────────────── */
const snap   = { type: 'spring', stiffness: 400, damping: 30 } as const
const gentle = { type: 'spring', stiffness: 260, damping: 24 } as const

/* Mobile menu ────────────────────────────────────────────────────────────── */
const drawerVariants = {
  closed: { opacity: 0, height: 0,      transition: { duration: 0.2,  ease: 'easeIn'  as const } },
  open:   { opacity: 1, height: 'auto', transition: { duration: 0.25, ease: 'easeOut' as const } },
}

const itemVariants = {
  closed: { opacity: 0, x: -12 },
  open: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { ...gentle, delay: i * 0.05 },
  }),
}

/* Theme toggle button ────────────────────────────────────────────────────── */
function ThemeToggle({ isDark, toggle }: { isDark: boolean; toggle: () => void }) {
  return (
    <motion.button
      onClick={toggle}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.88 }}
      transition={snap}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="text-foreground-dim hover:text-foreground transition-colors p-1.5
                 outline-none focus-visible:ring-2 focus-visible:ring-gold/60 rounded-full"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? 'moon' : 'sun'}
          initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
          animate={{ rotate: 0,   opacity: 1, scale: 1   }}
          exit={{    rotate:  90, opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.18 }}
          className="block"
        >
          {isDark
            ? <Sun  size={17} strokeWidth={1.75} />
            : <Moon size={17} strokeWidth={1.75} />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const scrolled = useScrolled(60)
  const { isDark, toggle } = useTheme()

  const scrollTo = (href: string) => {
    setMenuOpen(false)
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <motion.header
      initial={{ y: -72, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ ...gentle, delay: 0.1 }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-[background,border-color,box-shadow] duration-300',
        scrolled
          ? 'bg-surface-900/92 backdrop-blur-md border-b border-gold/10 shadow-[0_1px_20px_rgba(0,0,0,0.4)]'
          : 'bg-transparent'
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-[4.5rem]">

          {/* ── Logo ──────────────────────────────────────────────────────── */}
          <a
            href="#hero"
            onClick={e => { e.preventDefault(); scrollTo('#hero') }}
            className="flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-gold/60 rounded-sm"
          >
            <motion.div
              whileHover={{ rotate: 12, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={snap}
            >
              <img src="/logoGold.svg" alt="" aria-hidden="true" className="h-7 w-7" />
            </motion.div>
            <span className="font-bold text-[1.1rem] tracking-wide select-none">
              <span className="text-gold">Malika</span>
              <span className="text-foreground ml-1">Drums</span>
            </span>
          </a>

          {/* ── Desktop links ─────────────────────────────────────────────── */}
          <ul className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(link => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={e => { e.preventDefault(); scrollTo(link.href) }}
                  className="relative text-sm font-medium text-foreground-dim hover:text-foreground
                             outline-none focus-visible:text-gold transition-colors duration-150 group"
                >
                  {link.label}
                  <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gold rounded-full
                                   transition-all duration-200 group-hover:w-full" />
                </a>
              </li>
            ))}
          </ul>

          {/* ── Desktop right: theme toggle + CTA ────────────────────────── */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle isDark={isDark} toggle={toggle} />
            <motion.a
              href="#contact"
              onClick={e => { e.preventDefault(); scrollTo('#contact') }}
              whileHover={{ scale: 1.03, boxShadow: '0 4px 20px rgba(249,115,22,0.38)' }}
              whileTap={{ scale: 0.96 }}
              transition={snap}
              className="inline-block px-5 py-[0.45rem] rounded-full text-sm font-semibold
                         bg-accent text-white outline-none
                         focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2
                         focus-visible:ring-offset-surface-900"
            >
              Get In Touch
            </motion.a>
          </div>

          {/* ── Mobile: theme toggle + hamburger ─────────────────────────── */}
          <div className="md:hidden flex items-center gap-1">
            <ThemeToggle isDark={isDark} toggle={toggle} />
            <motion.button
              onClick={() => setMenuOpen(v => !v)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.88 }}
              transition={snap}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="text-foreground-dim hover:text-foreground transition-colors p-1
                         outline-none focus-visible:ring-2 focus-visible:ring-gold/60 rounded-sm"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={menuOpen ? 'x' : 'menu'}
                  initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
                  animate={{ rotate: 0,   opacity: 1, scale: 1 }}
                  exit={{    rotate:  90, opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  className="block"
                >
                  {menuOpen ? <X size={22} /> : <Menu size={22} />}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </nav>

      {/* ── Mobile drawer ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="drawer"
            variants={drawerVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="md:hidden overflow-hidden bg-surface-800/96 backdrop-blur-md border-b border-gold/10"
          >
            <ul className="px-4 pb-5 pt-2 space-y-0.5">
              {NAV_LINKS.map((link, i) => (
                <motion.li
                  key={link.href}
                  custom={i}
                  variants={itemVariants}
                  initial="closed"
                  animate="open"
                >
                  <a
                    href={link.href}
                    onClick={e => { e.preventDefault(); scrollTo(link.href) }}
                    className="flex items-center py-3 px-2 text-[0.95rem] font-medium
                               text-foreground-dim hover:text-gold border-b border-surface-700
                               transition-colors duration-150 outline-none focus-visible:text-gold"
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}

              <motion.li
                custom={NAV_LINKS.length}
                variants={itemVariants}
                initial="closed"
                animate="open"
                className="pt-4"
              >
                <a
                  href="#contact"
                  onClick={e => { e.preventDefault(); scrollTo('#contact') }}
                  className="block w-full text-center py-3 rounded-full font-semibold text-sm
                             bg-accent text-white hover:opacity-90
                             transition-opacity duration-150 outline-none
                             focus-visible:ring-2 focus-visible:ring-accent/60"
                >
                  Get In Touch
                </a>
              </motion.li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
