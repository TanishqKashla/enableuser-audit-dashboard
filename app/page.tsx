import Link from "next/link";
import BrandHeader from "./_components/BrandHeader";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <BrandHeader size="lg" />
      <h1 className="mt-10 text-3xl font-semibold text-slate-900">
        Accessibility Reports
      </h1>
      <p className="mt-2 text-slate-600">
        Enterprise accessibility scan reports for clients. Admins create and
        manage reports; clients view them via shared links.
      </p>
      <div className="mt-8">
        <Link
          href="/admin"
          className="inline-block rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700"
        >
          Admin sign in
        </Link>
      </div>
    </main>
  );
}
