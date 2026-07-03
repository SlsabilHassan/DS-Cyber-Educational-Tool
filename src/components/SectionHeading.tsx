// Eyebrow pill + big heading + optional subtitle, used to open each section.
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  const centered = align === "center";
  return (
    <div className={centered ? "text-center" : ""}>
      {eyebrow && (
        <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          {eyebrow}
        </span>
      )}
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-3 text-muted ${
            centered ? "mx-auto max-w-2xl" : "max-w-2xl"
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
