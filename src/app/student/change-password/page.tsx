import { ChangePasswordForm } from "@/components/shared/change-password-form";

export default function StudentChangePasswordPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B]">Account Security</h1>
        <p className="text-sm text-[#64748B]">Update your Student portal password.</p>
      </div>
      <ChangePasswordForm />
    </div>
  );
}
