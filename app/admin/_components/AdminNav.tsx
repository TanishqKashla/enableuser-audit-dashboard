"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

interface Props {
  adminEmail: string;
}

export default function AdminNav({ adminEmail }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-6">
          <Link
            href="/admin/reports"
            className="flex items-center gap-3"
            aria-label="Enableuser admin home"
          >
            <Image
              src="/enableuser-logo.webp"
              alt="Enableuser"
              width={140}
              height={44}
              priority
              className="h-8 w-auto"
            />
            <span className="hidden rounded-full border border-brand-100 bg-brand-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-brand sm:inline">
              Admin
            </span>
          </Link>
          <Link
            href="/admin/reports"
            className={`text-sm ${
              pathname?.startsWith("/admin/reports")
                ? "font-medium text-brand"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Reports
          </Link>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-500">{adminEmail}</span>
          <button
            onClick={handleLogout}
            className="rounded-md border border-slate-300 px-3 py-1 text-slate-700 hover:bg-slate-50"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
