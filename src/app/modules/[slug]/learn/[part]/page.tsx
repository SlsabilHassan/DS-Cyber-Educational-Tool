import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getModule, getAllModuleSlugs } from "@/lib/modules";
import {
  LESSON_PARTS,
  LESSON_PART_LABELS,
  isLessonPart,
} from "@/lib/lesson-parts";
import { PartPlayer } from "@/components/lessons/players/PartPlayer";

// Pre-render every module × part combination at build time.
export function generateStaticParams() {
  return getAllModuleSlugs().flatMap((slug) =>
    LESSON_PARTS.map((part) => ({ slug, part })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; part: string }>;
}): Promise<Metadata> {
  const { slug, part } = await params;
  const module = getModule(slug);
  return {
    title:
      module && isLessonPart(part)
        ? `${module.title} — ${LESSON_PART_LABELS[part]}`
        : "Lesson",
  };
}

export default async function LearnPartPage({
  params,
}: {
  params: Promise<{ slug: string; part: string }>;
}) {
  const { slug, part } = await params;
  const module = getModule(slug);
  if (!module || !isLessonPart(part)) notFound();

  return <PartPlayer slug={slug} part={part} />;
}
