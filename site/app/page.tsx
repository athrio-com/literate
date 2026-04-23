import { Hero } from '@/components/landing/hero'
import { Manifesto } from '@/components/landing/manifesto'
import { Algebra } from '@/components/landing/algebra'
import { Parallel } from '@/components/landing/parallel'
import { Install } from '@/components/landing/install'
import { Decisions } from '@/components/landing/decisions'
import { ForWhom } from '@/components/landing/for-whom'
import { Faq } from '@/components/landing/faq'
import { LandingFooter } from '@/components/landing/footer'
import { TropeRegion } from '@/components/dev'

export const metadata = {
  title: 'Literate Framework — prose-first software authoring',
}

export default function HomePage() {
  return (
    <div className="lx-landing">
      <main className="lx-scroll">
        <TropeRegion idx="hero" label="Hero">
          <Hero />
        </TropeRegion>
        <TropeRegion idx="manifesto" label="Manifesto" core>
          <Manifesto />
        </TropeRegion>
        <TropeRegion idx="algebra" label="Three-level algebra" core>
          <Algebra />
        </TropeRegion>
        <TropeRegion idx="parallel" label="Prose becomes code" core>
          <Parallel />
        </TropeRegion>
        <TropeRegion idx="install" label="Install">
          <Install />
        </TropeRegion>
        <TropeRegion idx="decisions" label="Recent decisions">
          <Decisions />
        </TropeRegion>
        <TropeRegion idx="for-whom" label="For whom">
          <ForWhom />
        </TropeRegion>
        <TropeRegion idx="faq" label="FAQ">
          <Faq />
        </TropeRegion>
        <TropeRegion idx="footer" label="Footer">
          <LandingFooter />
        </TropeRegion>
      </main>
    </div>
  )
}
