import Image from "next/image";
import Link from "next/link";

interface Props {
  href?: string;
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  className?: string;
}

const SIZES: Record<"sm" | "md" | "lg", { w: number; h: number }> = {
  sm: { w: 120, h: 38 },
  md: { w: 180, h: 56 },
  lg: { w: 260, h: 80 },
};

export default function BrandHeader({
  href,
  size = "md",
  showTagline = false,
  className = "",
}: Props) {
  const { w, h } = SIZES[size];
  const logo = (
    <Image
      src="/enableuser-logo.webp"
      alt="Enableuser — Enterprise Accessibility Infrastructure"
      width={w}
      height={h}
      priority
      className="h-auto w-auto"
    />
  );

  const content = (
    <div className={`inline-flex flex-col ${className}`}>
      {href ? (
        <Link href={href} className="inline-block" aria-label="Enableuser home">
          {logo}
        </Link>
      ) : (
        logo
      )}
      {showTagline && (
        <span className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
          Enterprise Accessibility Infrastructure
        </span>
      )}
    </div>
  );

  return content;
}
