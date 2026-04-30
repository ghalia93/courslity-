import Link from "next/link";
import { KeyRound, ShieldCheck } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div>
        <h1 className="text-2xl font-semibold text-black">Settings</h1>
        <p className="text-sm text-gray-500">
          Manage admin security and account access.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-[#6155F5]" />
            <h2 className="text-base font-semibold text-gray-900">
              Password Reset
            </h2>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Admins use the secure password reset flow with email reset tokens.
          </p>
          <Link
            href="/forgot-password"
            className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-[#6155F5] px-4 text-sm font-medium text-white transition hover:bg-[#4f45d4]"
          >
            Open Reset Flow
          </Link>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <h2 className="text-base font-semibold text-gray-900">
              Account Verification
            </h2>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            User verification, activation, and deactivation are managed from the
            Users page.
          </p>
          <Link
            href="/admin/users"
            className="mt-4 inline-flex h-10 items-center justify-center rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Manage Users
          </Link>
        </section>
      </div>
    </div>
  );
}
