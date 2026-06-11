import Navbar from '@/components/Navbar'
import Hero from '@/sections/Hero'

export default function App() {
  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      <Navbar />
      <Hero />

      {/* Placeholder sections — built next */}
      {(['about', 'gear', 'reels', 'gallery', 'contact'] as const).map(id => (
        <section
          key={id}
          id={id}
          className="min-h-screen flex items-center justify-center border-t border-[#1a1a1a]"
        >
          <p className="text-[#333333] text-sm uppercase tracking-widest">
            {id} — coming soon
          </p>
        </section>
      ))}
    </div>
  )
}
