import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAdminLogin, useGetMe } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
const logoIcon = "/images/logo-icon.png";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Check if already logged in
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: user, isLoading: checkingAuth } = useGetMe({ query: { retry: false } as any });

  // Must be in useEffect — calling setLocation during render causes infinite crash loop
  useEffect(() => {
    if (!checkingAuth && user) {
      setLocation("/admin/dashboard");
    }
  }, [checkingAuth, user, setLocation]);

  const loginMutation = useAdminLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate({ data }, {
      onSuccess: () => {
        setLocation("/admin/dashboard");
      },
      onError: (err: any) => {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: err?.error || "Please check your credentials and try again.",
        });
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full bg-card border border-border shadow-xl p-8 rounded-sm">
        <div className="text-center mb-8">
          <img src={logoIcon} alt="Ginger Studios" className="w-12 h-12 mx-auto mb-6" />
          <h1 className="font-serif text-3xl text-foreground">Admin Portal</h1>
          <p className="text-muted-foreground mt-2 text-sm">Sign in to manage client galleries</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              {...form.register("email")}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              placeholder="admin@gingerstudios.com"
            />
            {form.formState.errors.email && (
              <p className="text-destructive text-xs mt-1">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Password</label>
            <input
              type="password"
              {...form.register("password")}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              placeholder="••••••••"
            />
            {form.formState.errors.password && (
              <p className="text-destructive text-xs mt-1">{form.formState.errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full bg-primary text-primary-foreground py-3 rounded-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {loginMutation.isPending ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
