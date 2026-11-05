import {AfterAction} from './_components/AfterAction';
import {FinalCta} from './_components/FinalCta';
import {Hero} from './_components/Hero';
import {Impact} from './_components/Impact';
import {LiveSimulation} from './_components/LiveSimulation';
import {Modules} from './_components/Modules';
import {Newsroom} from './_components/Newsroom';
import {ReadinessAnalytics} from './_components/ReadinessAnalytics';
import {ReadinessSignals} from './_components/ReadinessSignals';
import {SiteHeader} from './_components/SiteHeader';

export default function MarketingPage() {
  return (
    <div className="ms-shell">
      <SiteHeader />
      <main>
        <Hero />
        <AfterAction />
        <LiveSimulation />
        <ReadinessAnalytics />
        <Modules />
        <ReadinessSignals />
        <Impact />
        <Newsroom />
        <FinalCta />
      </main>
    </div>
  );
}
