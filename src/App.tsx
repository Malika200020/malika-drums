import { MotionConfig } from 'framer-motion'
import Navbar from '@/components/Navbar'
import Hero from '@/sections/Hero'
import About from '@/sections/About'
import Gear from '@/sections/Gear'
import Reels from '@/sections/Reels'
import Gallery from '@/sections/Gallery'
import Contact from '@/sections/Contact'

export default function App() {
  return (
    // reducedMotion="user" respects prefers-reduced-motion OS setting globally
    <MotionConfig reducedMotion="user">
      <div className="bg-surface-900 min-h-screen">
        <Navbar />
        <Hero />
        <About />
        <Gear />
        <Reels />
        <Gallery />
        <Contact />
      </div>
    </MotionConfig>
  )
}
