export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
      <div className="max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center">
        <h1 className="text-lg font-semibold text-slate-900">Report not found</h1>
        <p className="mt-2 text-sm text-slate-600">
          This link may be incorrect or the report may have been removed.
        </p>
      </div>
    </main>
  );
}
