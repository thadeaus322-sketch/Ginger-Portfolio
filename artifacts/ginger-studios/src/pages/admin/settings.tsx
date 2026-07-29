import { useState } from "react";
import { useGetMe, useUpdateAdminSettings } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, KeyRound, Mail, ShieldCheck } from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: me } = useGetMe({ query: { retry: false } as any });
  const updateSettings = useUpdateAdminSettings();

  // Email form
  const [emailForm, setEmailForm] = useState({ currentPassword: "", newEmail: "" });
  const [emailLoading, setEmailLoading] = useState(false);

  // Password form
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwLoading, setPwLoading] = useState(false);

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailForm.newEmail.trim() || !emailForm.currentPassword) return;
    setEmailLoading(true);
    try {
      await updateSettings.mutateAsync({
        data: { currentPassword: emailForm.currentPassword, newEmail: emailForm.newEmail.trim() },
      });
      toast({ title: "Email updated", description: "Your login email has been changed. Log in again to see it reflected." });
      setEmailForm({ currentPassword: "", newEmail: "" });
    } catch (err: unknown) {
      const apiErr = err as { data?: { error?: string }; message?: string };
      const msg = apiErr?.data?.error ?? apiErr?.message ?? "Failed to update email";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwForm.currentPassword || !pwForm.newPassword) return;
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast({ title: "Passwords don't match", description: "New password and confirmation must be identical.", variant: "destructive" });
      return;
    }
    if (pwForm.newPassword.length < 8) {
      toast({ title: "Too short", description: "Password must be at least 8 characters.", variant: "destructive" });
      return;
    }
    setPwLoading(true);
    try {
      await updateSettings.mutateAsync({
        data: { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword },
      });
      toast({ title: "Password updated", description: "Your password has been changed successfully." });
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: unknown) {
      const apiErr = err as { data?: { error?: string }; message?: string };
      const msg = apiErr?.data?.error ?? apiErr?.message ?? "Failed to update password";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-serif font-semibold text-foreground">Account Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage your admin login credentials.</p>
      </div>

      {/* Default credentials warning */}
      {me?.usingDefaults && (
        <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="shrink-0 text-amber-500 mt-0.5" size={18} />
          <div>
            <p className="font-medium text-amber-800 text-sm">You're using default credentials</p>
            <p className="text-amber-700 text-sm mt-0.5">
              Change your email and password below before sharing the site publicly.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* ── Change Email ── */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Mail size={15} className="text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground text-sm">Change Email</h2>
              <p className="text-xs text-muted-foreground">Current: {me?.email}</p>
            </div>
          </div>

          <form onSubmit={handleEmailChange} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">New Email</label>
              <input
                type="email"
                required
                value={emailForm.newEmail}
                onChange={e => setEmailForm(f => ({ ...f, newEmail: e.target.value }))}
                placeholder="new@example.com"
                className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Current Password</label>
              <input
                type="password"
                required
                value={emailForm.currentPassword}
                onChange={e => setEmailForm(f => ({ ...f, currentPassword: e.target.value }))}
                placeholder="Confirm your password"
                className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <button
              type="submit"
              disabled={emailLoading || !emailForm.newEmail || !emailForm.currentPassword}
              className="w-full py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {emailLoading ? "Saving…" : "Update Email"}
            </button>
          </form>
        </div>

        {/* ── Change Password ── */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <KeyRound size={15} className="text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground text-sm">Change Password</h2>
              <p className="text-xs text-muted-foreground">Min. 8 characters</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Current Password</label>
              <input
                type="password"
                required
                value={pwForm.currentPassword}
                onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
                placeholder="Your current password"
                className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">New Password</label>
              <input
                type="password"
                required
                value={pwForm.newPassword}
                onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                placeholder="At least 8 characters"
                className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Confirm New Password</label>
              <input
                type="password"
                required
                value={pwForm.confirmPassword}
                onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))}
                placeholder="Repeat new password"
                className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <button
              type="submit"
              disabled={pwLoading || !pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword}
              className="w-full py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pwLoading ? "Saving…" : "Update Password"}
            </button>
          </form>
        </div>
      </div>

      {/* Security note */}
      <div className="flex gap-3 p-4 bg-muted/40 border border-border rounded-lg">
        <ShieldCheck className="shrink-0 text-muted-foreground mt-0.5" size={16} />
        <p className="text-sm text-muted-foreground">
          Changes take effect immediately. If you change your email, log out and log back in with your new email.
          Keep your credentials safe — there is no password recovery once the defaults are replaced.
        </p>
      </div>
    </div>
  );
}
