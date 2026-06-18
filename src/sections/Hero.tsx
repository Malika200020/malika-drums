import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown, Play, MessageCircle } from "lucide-react";
import { COLORS } from "@/lib/colors";

/* ─── Spring presets ──────────────────────────────────────────────────────── */
const snap = { type: "spring", stiffness: 380, damping: 28 } as const;
const gentle = { type: "spring", stiffness: 240, damping: 22 } as const;

/* ─── Entry variants — spring-based, snappy ──────────────────────────────── */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
};

const riseUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { ...gentle } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6 } },
};

/* ─── Pulse rings — 3 rings, very restrained ─────────────────────────────── */
function PulseRings() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute rounded-full border border-gold/[0.12]"
          style={{ width: 240 + i * 180, height: 240 + i * 180 }}
          animate={{ scale: [1, 1.14, 1], opacity: [0.5, 0, 0.5] }}
          transition={{
            duration: 4,
            ease: "easeInOut",
            repeat: Infinity,
            delay: i * 0.9,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Minimal accent sparks — 3 only, very subtle ────────────────────────── */
const SPARKS = [
  { top: "22%", left: "10%", size: 3, delay: 0 },
  { top: "65%", right: "9%", size: 2, delay: 1.3 },
  { top: "40%", right: "22%", size: 3, delay: 0.7 },
] as const;

function AccentSparks() {
  return (
    <>
      {SPARKS.map((s, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-gold/70"
          style={{
            top: s.top,
            left: "left" in s ? s.left : undefined,
            right: "right" in s ? s.right : undefined,
            width: s.size,
            height: s.size,
          }}
          animate={{ opacity: [0, 0.8, 0], y: [0, -16, 0] }}
          transition={{
            duration: 3.5,
            ease: "easeInOut",
            repeat: Infinity,
            delay: s.delay,
          }}
        />
      ))}
    </>
  );
}

/* ─── Hero ────────────────────────────────────────────────────────────────── */
export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Subtle parallax — background 25%, text 10%
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

  const scrollTo = (href: string) =>
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section
      id="hero"
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-surface-900"
    >
      {/* ── Background ────────────────────────────────────────────────────── */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 will-change-transform"
      >
        {/* Warm gold centre glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_65%,rgba(212,175,55,0.10)_0%,transparent_70%)]" />
        {/* Violet shoulder */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_35%_at_78%_28%,rgba(139,92,246,0.10)_0%,transparent_65%)]" />
        {/* Fine grid — very subtle */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(${COLORS.gold.DEFAULT} 1px, transparent 1px),
                              linear-gradient(90deg, ${COLORS.gold.DEFAULT} 1px, transparent 1px)`,
            backgroundSize: "56px 56px",
          }}
        />
      </motion.div>

      <PulseRings />
      <AccentSparks />

      {/* Grain film grain — depth without kitsch */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ── Content ───────────────────────────────────────────────────────── */}
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
          {/* Eyebrow pill */}
          <motion.div variants={fadeIn} className="flex justify-center">
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                             border border-gold/25 bg-gold/[0.06]
                             text-gold text-[0.7rem] font-semibold tracking-[0.2em] uppercase"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              TikTok · @MalikaDrums
            </span>
          </motion.div>

          {/* Name — two-line Oswald display */}
          <motion.h1
            variants={riseUp}
            className="font-display font-black tracking-tight leading-[0.9]
                       text-[clamp(3rem,10vw,6.5rem)]"
          >
            <span className="text-foreground block">MALIKA</span>
            <span className="text-gold-gradient block">DEGALDORUWA</span>
          </motion.h1>

          {/* Divider */}
          <motion.div
            variants={fadeIn}
            className="flex items-center justify-center gap-3"
          >
            <span className="h-px w-12 bg-gold/35" />
            <span className="text-gold/70 text-base" aria-hidden>
              ♩
            </span>
            <span className="h-px w-12 bg-gold/35" />
          </motion.div>

          {/* Tagline */}
          <motion.p
            variants={riseUp}
            className="text-foreground-dim text-base sm:text-xl md:text-2xl
                       font-light tracking-wide max-w-xl mx-auto leading-relaxed"
          >
            Professional Drummer&nbsp;·&nbsp;Metal &amp; Pop Specialist
            <br className="hidden sm:block" />
            Versatile Grooves &amp; Powerful Beats
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={riseUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2"
          >
            <motion.a
              href="#reels"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("#reels");
              }}
              whileHover={{
                scale: 1.03,
                boxShadow: "0 6px 28px rgba(249,115,22,0.42)",
              }}
              whileTap={{ scale: 0.96 }}
              transition={snap}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full
                         font-bold text-sm sm:text-base
                         bg-accent text-white
                         outline-none focus-visible:ring-2 focus-visible:ring-accent/60
                         focus-visible:ring-offset-2 focus-visible:ring-offset-surface-900"
            >
              <Play size={16} fill="currentColor" />
              Watch Reels
            </motion.a>

            <motion.a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("#contact");
              }}
              whileHover={{
                scale: 1.03,
                boxShadow: "0 4px 24px rgba(139,92,246,0.30)",
              }}
              whileTap={{ scale: 0.96 }}
              transition={snap}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full
                         font-bold text-sm sm:text-base
                         border border-gold/55 text-gold
                         hover:bg-gold/[0.08] transition-colors duration-150
                         outline-none focus-visible:ring-2 focus-visible:ring-gold/60
                         focus-visible:ring-offset-2 focus-visible:ring-offset-surface-900"
            >
              <MessageCircle size={16} strokeWidth={2} />
              Get In Touch
            </motion.a>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            variants={fadeIn}
            className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 pt-6"
          >
            {[
              { value: "15+", label: "Years Playing" },
              { value: "2", label: "Active Bands" },
              { value: "750K+", label: "Views on TikTok & YouTube" },
            ].map((stat, i) => (
              <div key={stat.label} className="text-center">
                {i > 0 && (
                  <span className="hidden sm:block absolute -left-4 top-1/2 -translate-y-1/2 w-px h-6 bg-surface-600" />
                )}
                <p className="text-[1.75rem] sm:text-3xl font-black text-gold-gradient leading-none">
                  {stat.value}
                </p>
                <p className="text-[0.65rem] text-foreground-muted tracking-[0.18em] uppercase mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll cue — appears after 2.2s, bounces gently */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.5 }}
        className="absolute bottom-7 left-1/2 -translate-x-1/2
                   flex flex-col items-center gap-1 text-foreground-muted"
      >
        <span className="text-[0.6rem] tracking-[0.22em] uppercase">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={16} />
        </motion.div>
      </motion.div>
    </section>
  );
}
