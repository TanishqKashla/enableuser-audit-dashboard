import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Enableuser — Enterprise Accessibility Infrastructure",
    template: "%s — Enableuser",
  },
  description:
    "Enterprise accessibility reporting and remediation infrastructure by Enableuser.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
