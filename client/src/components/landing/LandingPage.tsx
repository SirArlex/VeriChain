import HeroSection from './HeroSection';
import ProblemSection from './ProblemSection';
import HowItWorksSection from './HowItWorksSection';
import AgentsSection from './AgentsSection';
import OnChainSection from './OnChainSection';
import WhyVeriChainSection from './WhyVeriChainSection';
import CTASection from './CTASection';

/**
 * LandingPage assembles all 7 sections in order.
 * Each section handles its own scroll animation via AnimatedSection.
 */
export default function LandingPage() {
  return (
    <div className="overflow-x-hidden">
      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <AgentsSection />
      <OnChainSection />
      <WhyVeriChainSection />
      <CTASection />
    </div>
  );
}
