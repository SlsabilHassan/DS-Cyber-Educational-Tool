import { getOrderedModules } from "@/lib/modules";
import { SITE } from "@/lib/site";
import { ModuleCard } from "@/components/ModuleCard";
import { StatsSection } from "@/components/StatsSection";
import { FeaturePillars } from "@/components/FeaturePillars";
import { FAQ } from "@/components/FAQ";
import { SectionHeading } from "@/components/SectionHeading";
import { HeroGlow } from "@/components/HeroGlow";
import { Button } from "@/components/Button";

export default function Home() {
  const modules = getOrderedModules();

  return (
    <div className="space-y-24 pb-4">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-28 pb-4 text-center">
        <HeroGlow />
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Interactive cybersecurity dojo
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight text-fg sm:text-6xl">
          Master data structures
          <br />
          by breaking them.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted">
          {SITE.tagline} Work through hands-on modules that pair each structure
          with the attacks and defenses it unlocks.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button href="/modules">Start hacking</Button>
          <Button href="/help" variant="ghost">
            How it works
          </Button>
        </div>
        <p className="mt-5 text-xs text-muted">
          No setup required · Runs in your browser
        </p>
      </section>

      {/* Feature pillars */}
      <FeaturePillars />

      {/* Stats */}
      <StatsSection />

      {/* Modules */}
      <section className="mx-auto max-w-6xl px-4">
        <SectionHeading
          eyebrow="Curriculum"
          title="Explore the modules"
          subtitle="Each module pairs a core data structure with the security concepts it unlocks."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {modules.map((module) => (
            <ModuleCard key={module.slug} module={module} />
          ))}
        </div>
      </section>

      {/* FAQ */}
      <FAQ />
    </div>
  );
}
