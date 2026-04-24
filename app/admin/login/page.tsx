import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/session";
import BrandHeader from "@/app/_components/BrandHeader";
import LoginForm from "../_components/LoginForm";

interface Props {
  searchParams: { from?: string };
}

export default async function LoginPage({ searchParams }: Props) {
  const admin = await getCurrentAdmin();
  if (admin) redirect(searchParams.from || "/admin/reports");

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <BrandHeader size="sm" />
        </div>
        <h1 className="text-center text-lg font-semibold text-slate-900">
          Admin sign in
        </h1>
        <p className="mt-1 text-center text-sm text-slate-600">
          Sign in to manage accessibility reports.
        </p>
        <div className="mt-6">
          <LoginForm redirectTo={searchParams.from} />
        </div>
      </div>
    </main>
  );
}
