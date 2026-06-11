import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Drum } from 'lucide-react'
import { useScrolled } from '@/hooks/useScrolled'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { label: 'About',   href: '#about' },
  { label: 'Gear',    href: '#gear' },
  { label: 'Reels',   href: '#reels' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Contact', href: '#contact' },
]

const menuVariants = {
  closed: { opacity: 0, height: 0 },
  open:   { opacity: 1, height: 'auto' },
}

const itemVariants = {
  closed: { opacity: 0, x: -16 },
  open:   (i: number) => ({ opacity: 1, x: 0, transition: { delay: i * 0.07 } }),
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const scrolled = useScrolled(60)

  const handleNavClick = (href: string) => {
    setMenuOpen(false)
    const el = document.querySelector(href)
    el?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-[#0a0a0a]/90 backdrop-blur-md border-b border-[#d4af37]/10 shadow-lg shadow-black/40'
          : 'bg-transparent'
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <a
            href="#hero"
            onClick={e => { e.preventDefault(); handleNavClick('#hero') }}
            className="flex items-center gap-2 group"
          >
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="text-[#d4af37]"
            >
              <Drum size={28} strokeWidth={1.5} />
            </motion.div>
            <span className="font-bold text-xl tracking-wide">
              <span className="text-[#d4af37]">Malika</span>
              <span className="text-white ml-1">Drums</span>
            </span>
          </a>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(link => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={e => { e.preventDefault(); handleNavClick(link.href) }}
                  className="relative text-sm font-medium text-[#a1a1aa] hover:text-[#d4af37] transition-colors duration-200 group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#d4af37] transition-all duration-300 group-hover:w-full" />
                </a>
              </li>
            ))}
          </ul>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <motion.a
              href="#contact"
              onClick={e => { e.preventDefault(); handleNavClick('#contact') }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="px-5 py-2 rounded-full text-sm font-semibold bg-[#d4af37] text-[#0a0a0a] hover:bg-[#f5d76e] transition-colors duration-200"
            >
              Book Me
            </motion.a>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="md:hidden text-white hover:text-[#d4af37] transition-colors p-1"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={menuOpen ? 'close' : 'menu'}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="md:hidden overflow-hidden bg-[#111111]/95 backdrop-blur-md border-b border-[#d4af37]/10"
          >
            <ul className="px-4 py-4 space-y-1">
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
                    onClick={e => { e.preventDefault(); handleNavClick(link.href) }}
                    className="block py-3 px-2 text-base font-medium text-[#a1a1aa] hover:text-[#d4af37] border-b border-[#242424] transition-colors duration-200"
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
                className="pt-3"
              >
                <a
                  href="#contact"
                  onClick={e => { e.preventDefault(); handleNavClick('#contact') }}
                  className="block w-full text-center py-3 rounded-full font-semibold bg-[#d4af37] text-[#0a0a0a] hover:bg-[#f5d76e] transition-colors duration-200"
                >
                  Book Me
                </a>
              </motion.li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
