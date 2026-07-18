import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getModule, getAllModuleSlugs } from "@/lib/modules";
import { getModuleAssessment } from "@/lib/module-assessments";
import { ModuleAssessmentRunner } from "@/components/assessment/ModuleAssessmentRunner";

export function generateStaticParams() {
  return getAllModuleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const module = getModule(slug);
  return { title: module ? `${module.title} — Pre-test` : "Pre-test" };
}

export default async function PretestPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const module = getModule(slug);
  if (!module || !getModuleAssessment(slug)) notFound();
  return <ModuleAssessmentRunner slug={slug} phase="pre" moduleTitle={module.title} />;
}
