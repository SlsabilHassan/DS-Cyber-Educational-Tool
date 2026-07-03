import type { Metadata } from "next";
import { getOrderedModules } from "@/lib/modules";
import { ModuleCard } from "@/components/ModuleCard";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "Modules",
};

export default function ModulesPage() {
  const modules = getOrderedModules();

  return (
    <div className="mx-auto max-w-6xl px-4 py-20">
      <SectionHeading
        align="left"
        eyebrow="Curriculum"
        title="Modules"
        subtitle="Each module pairs a core data structure with the security concepts it unlocks. Work through them in order, or jump to what you need."
      />

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => (
          <ModuleCard key={module.slug} module={module} />
        ))}
      </div>
    </div>
  );
}
