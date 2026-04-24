"use client";

import { useEffect, useState } from "react";

interface Props {
  path: string;
  label?: string;
}

export default function CopyLinkButton({ path, label = "Copy link" }: Props) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  async function handleCopy() {
    setError(false);
    try {
      const url =
        typeof window !== "undefined"
          ? `${window.location.origin}${path}`
          : path;
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setError(true);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Link copied" : "Copy public link"}
      className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium transition ${
        copied
          ? "border-emerald-300 bg-emerald-50 text-emerald-800"
          : error
            ? "border-red-300 bg-red-50 text-red-700"
            : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {copied ? (
        <>
          <svg
            width="12"
            height="12"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden
          >
            <path
              d="M3 8.5l3.5 3.5L13 5"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Copied
        </>
      ) : error ? (
        <>Failed</>
      ) : (
        <>
          <svg
            width="12"
            height="12"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden
          >
            <rect
              x="4.5"
              y="4.5"
              width="8"
              height="9"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M6.5 3.5V3a1 1 0 011-1h3a1 1 0 011 1v.5"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}
