import { useRef, type ReactNode } from "react";
import { motion, useInView } from "framer-motion";
import { Mail, ExternalLink, ArrowRight, MessageCircle } from "lucide-react";

/* ─── Social brand SVGs ───────────────────────────────────────────────────── */
function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.22 8.22 0 0 0 4.81 1.53V6.77a4.85 4.85 0 0 1-1.04-.08z" />
    </svg>
  );
}

function YouTubeIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.7 12 3.7 12 3.7s-7.5 0-9.4.4a3 3 0 0 0-2.1 2.1A31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8zM9.7 15.5V8.5L15.8 12l-6.1 3.5z" />
    </svg>
  );
}

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

/* ─── Spring presets ──────────────────────────────────────────────────────── */
const snap = { type: "spring", stiffness: 420, damping: 32 } as const;
const gentle = { type: "spring", stiffness: 240, damping: 22 } as const;

/* ─── Social data ─────────────────────────────────────────────────────────── */
const SOCIALS = [
  {
    label: "TikTok",
    handle: "@MalikaDrums",
    href: "https://www.tiktok.com/@malikadegaldoruwa",
    Icon: TikTokIcon,
    accent: "#fe2c55",
  },
  {
    label: "YouTube",
    handle: "MalikaDrums",
    href: "https://youtube.com/@malikadegaldoruwa4839",
    Icon: YouTubeIcon,
    accent: "#ff4040",
  },
  {
    label: "Instagram",
    handle: "@malika.drums",
    href: "https://www.instagram.com/malika.drums",
    Icon: InstagramIcon,
    accent: "#e1306c",
  },
];

/* ─── Contact card ────────────────────────────────────────────────────────── */
type ContactCardProps = {
  href: string;
  accent: string;
  icon: ReactNode;
  label: string;
  sublabel: string;
  detail: string;
};

function ContactCard({
  href,
  accent,
  icon,
  label,
  sublabel,
  detail,
}: ContactCardProps) {
  const cardV = {
    idle: {
      y: 0,
      scale: 1,
      boxShadow: `0 4px 24px rgba(0,0,0,0.36), 0 0 0 1px rgba(36,36,36,1)`,
    },
    hover: {
      y: -8,
      scale: 1.02,
      boxShadow: `0 32px 64px ${accent}2e, 0 0 0 1px ${accent}55`,
    },
    tap: {
      y: -2,
      scale: 0.99,
      boxShadow: `0 8px 24px ${accent}18, 0 0 0 1px ${accent}38`,
    },
  };
  const iconV = {
    idle: { scale: 1, y: 0 },
    hover: { scale: 1.12, y: -3 },
    tap: { scale: 0.9, y: 0 },
  };
  const arrowV = {
    idle: { x: 0, y: 0, opacity: 0.38 },
    hover: { x: 4, y: -4, opacity: 1 },
    tap: { x: 2, y: -2, opacity: 0.7 },
  };

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      variants={cardV}
      initial="idle"
      whileHover="hover"
      whileTap="tap"
      transition={snap}
      className="relative flex flex-col p-7 rounded-2xl will-change-transform
                 min-h-[210px] outline-none bg-surface-700
                 focus-visible:ring-2 focus-visible:ring-gold/60
                 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-900"
    >
      {/* Top row: icon + external link indicator */}
      <div className="flex items-start justify-between mb-5">
        <motion.div
          variants={iconV}
          transition={gentle}
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
          style={{
            background: `${accent}14`,
            border: `1px solid ${accent}2a`,
            color: accent,
          }}
        >
          {icon}
        </motion.div>

        <motion.div variants={arrowV} transition={gentle} className="mt-0.5">
          <ExternalLink size={15} style={{ color: accent }} />
        </motion.div>
      </div>

      {/* Label + subtitle */}
      <div className="flex-1">
        <p className="font-display font-bold text-[1.3rem] leading-tight text-foreground">
          {label}
        </p>
        <p className="text-foreground-muted text-sm mt-1.5 leading-snug">
          {sublabel}
        </p>
      </div>

      {/* Detail row */}
      <div className="flex items-center gap-1.5 mt-5 min-w-0">
        <p className="text-[0.8rem] font-medium truncate text-foreground-dim">
          {detail}
        </p>
        <motion.div variants={arrowV} transition={gentle} className="shrink-0">
          <ArrowRight size={13} style={{ color: accent }} />
        </motion.div>
      </div>
    </motion.a>
  );
}

/* ─── Section ─────────────────────────────────────────────────────────────── */
export default function Contact() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const whatsappHref = `https://wa.me/94719352662?text=${encodeURIComponent(
    "Hi Malika! I'd like to discuss a gig / collaboration. Could we connect?",
  )}`;

  const emailHref = `mailto:malikadegaldoruwa@gmail.com?subject=${encodeURIComponent(
    "Booking Inquiry — Malika Degaldoruwa",
  )}&body=${encodeURIComponent(
    "Hi Malika,\n\nI'd like to discuss a gig / collaboration.\n\nDetails:\n",
  )}`;

  return (
    <section
      id="contact"
      ref={ref}
      className="relative py-28 md:py-36 bg-surface-900 overflow-hidden"
    >
      {/* Edge rule */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

      {/* Ambient glows */}
      <div
        className="absolute left-1/2 -translate-x-1/2 top-1/4 w-[640px] h-[640px]
                   rounded-full blur-[160px] pointer-events-none"
        style={{ background: "#8b5cf6", opacity: 0.05 }}
      />
      <div
        className="absolute -right-48 bottom-1/3 w-[440px] h-[440px]
                   rounded-full blur-[130px] pointer-events-none"
        style={{ background: "#25D366", opacity: 0.028 }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-[660px] mx-auto">
          {/* ── Header ──────────────────────────────────────────────────── */}
          <div className="text-center mb-12">
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.35 }}
              className="flex items-center justify-center gap-3 mb-6"
            >
              <span className="h-px w-8 bg-gold" />
              <span className="text-gold text-[0.62rem] font-bold tracking-[0.28em] uppercase">
                Bookings & Collabs
              </span>
              <span className="h-px w-8 bg-gold" />
            </motion.div>

            {/* Availability badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.88 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ ...gentle, delay: 0.07 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6"
              style={{
                background: "rgba(34,197,94,0.07)",
                border: "1px solid rgba(34,197,94,0.15)",
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.55, 1], opacity: [1, 0.35, 1] }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  ease: "easeInOut" as const,
                }}
                className="w-2 h-2 rounded-full bg-green-500"
              />
              <span className="text-green-400 text-[0.68rem] font-semibold tracking-wide">
                Currently accepting bookings
              </span>
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ ...gentle, delay: 0.1 }}
              className="font-display font-bold
                         text-[clamp(2.2rem,5.5vw,3.6rem)]
                         text-foreground leading-tight"
            >
              Get In <span className="text-gold-gradient">Touch</span>
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ ...gentle, delay: 0.16 }}
              className="text-foreground-muted text-[0.95rem] mt-4 leading-relaxed
                         max-w-[460px] mx-auto"
            >
              Available for live performances, recording sessions, and creative
              collaborations — across Sri Lanka and internationally. Whether
              it's a gig or a collab, reach out and let's make it happen.
            </motion.p>
          </div>

          {/* ── Contact cards ───────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ ...gentle, delay: 0.22 }}
            >
              <ContactCard
                href={whatsappHref}
                accent="#25D366"
                icon={<MessageCircle size={22} strokeWidth={1.75} />}
                label="WhatsApp"
                sublabel="Quickest way to reach me"
                detail="+94 71 935 2662"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ ...gentle, delay: 0.3 }}
            >
              <ContactCard
                href={emailHref}
                accent="#8b5cf6"
                icon={<Mail size={22} strokeWidth={1.75} />}
                label="Email"
                sublabel="Detailed inquiries & bookings"
                detail="malikadegaldoruwa@gmail.com"
              />
            </motion.div>
          </div>

          {/* ── Location / response note ─────────────────────────────────── */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.45, delay: 0.46 }}
            className="text-center text-foreground-muted text-[0.74rem]
                       tracking-wide mt-5"
          >
            Based in Colombo, Sri Lanka · Response within 24 hours
          </motion.p>

          {/* ── Social divider ───────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.45, delay: 0.52 }}
            className="flex items-center gap-5 mt-16 mb-8"
          >
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-surface-600" />
            <span className="text-foreground-muted text-[0.65rem] font-semibold tracking-[0.22em] uppercase shrink-0">
              Find me on
            </span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-surface-600" />
          </motion.div>

          {/* ── Social pills ─────────────────────────────────────────────── */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {SOCIALS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ ...gentle, delay: 0.56 + i * 0.07 }}
              >
                <motion.a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{
                    y: -4,
                    boxShadow: `0 10px 28px ${s.accent}28, 0 0 0 1px ${s.accent}45`,
                  }}
                  whileTap={{ scale: 0.95, y: 0 }}
                  transition={snap}
                  aria-label={`${s.label} — ${s.handle}`}
                  className="flex items-center gap-2.5 px-5 py-2.5 rounded-full
                             bg-surface-700 border border-surface-600
                             text-foreground-dim hover:text-foreground
                             transition-colors duration-200
                             outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
                >
                  <span style={{ color: s.accent }}>
                    <s.Icon size={17} />
                  </span>
                  <span className="text-sm font-medium">{s.handle}</span>
                </motion.a>
              </motion.div>
            ))}
          </div>

          {/* ── Bottom note ──────────────────────────────────────────────── */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.45, delay: 0.78 }}
            className="text-center text-foreground-muted text-[0.67rem]
                       tracking-widest uppercase mt-14"
          >
            Malika Degaldoruwa · Professional Drummer · Colombo, Sri Lanka
          </motion.p>
        </div>
      </div>
    </section>
  );
}
