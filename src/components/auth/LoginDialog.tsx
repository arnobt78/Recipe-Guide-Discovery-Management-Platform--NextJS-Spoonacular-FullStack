/**
 * Login Dialog Component
 *
 * Custom NextAuth login dialog with account dropdown helper and Google OAuth
 * Features:
 * - ShadCN UI Dialog component
 * - Account dropdown helper (auto-fills email/password for convenience)
 * - Email/password authentication (Credentials provider - database-backed)
 * - Google OAuth sign-in
 * - Dark theme compatible
 * - No page refresh - UI updates automatically
 *
 * Following DEVELOPMENT_RULES.md: Reusable component, ShadCN UI, TypeScript
 */

"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface LoginDialogProps {
  /** Whether dialog is open */
  open: boolean;
  /** Callback when dialog should close */
  onOpenChange: (open: boolean) => void;
  /** Callback to switch to register dialog */
  onSwitchToRegister?: () => void;
}

/**
 * Account helper credentials (for convenience - auto-fills form fields)
 * These are just helpers to quickly fill the form - authentication still requires
 * the user to exist in the database with matching credentials
 */
const accountHelpers: Record<string, { email: string; password: string }> = {
  "test-user": {
    email: "test@user.com",
    password: "12345678",
  },
};

/**
 * Form validation schema
 */
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Login Dialog Component
 * Displays test account dropdown, email/password form, and Google OAuth button
 */
export function LoginDialog({
  open,
  onOpenChange,
  onSwitchToRegister,
}: LoginDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<string>("");

  /**
   * Form setup with react-hook-form
   */
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  /**
   * Handle account helper selection from dropdown
   * Auto-fills email and password fields for convenience
   * Note: User must still exist in database with these credentials
   */
  const handleRoleSelect = useCallback(
    (value: string) => {
      if (value === "clear") {
        setSelectedRole("");
        setValue("email", "");
        setValue("password", "");
        reset();
      } else {
        setSelectedRole(value);
        const account = accountHelpers[value];
        if (account) {
          setValue("email", account.email);
          setValue("password", account.password);
        }
      }
    },
    [setValue, reset],
  );

  /**
   * Handle email/password sign-in (Credentials provider)
   */
  const handleCredentialsSignIn = useCallback(
    async (data: LoginFormData) => {
      setIsLoading(true);
      try {
        const result = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });

        if (result?.error) {
          toast.error("Invalid email or password. Please try again.");
          setIsLoading(false);
        } else if (result?.ok) {
          // Success - close dialog and refresh session
          toast.success("Signed in successfully!");
          onOpenChange(false);

          // Refresh router to update session
          router.refresh();

          // Small delay to ensure session is propagated and localStorage is updated
          // This ensures API calls have the userId available
          setTimeout(() => {
            setIsLoading(false);
          }, 100);
        }
      } catch (error) {
        console.error("Credentials sign-in error:", error);
        toast.error("Failed to sign in. Please try again.");
        setIsLoading(false);
      }
    },
    [router, onOpenChange],
  );

  /**
   * Handle Google OAuth sign-in
   */
  const handleGoogleSignIn = useCallback(async () => {
    setIsLoading(true);
    try {
      await signIn("google", {
        callbackUrl: window.location.origin,
        redirect: true,
      });
      // Note: signIn will redirect, so we won't reach here on success
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error("Failed to sign in with Google. Please try again.");
      setIsLoading(false);
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-slate-900/95 backdrop-blur-md border-emerald-500/50 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            Welcome Back
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Sign in to your account to continue
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleCredentialsSignIn)}
          className="space-y-6 mt-4"
        >
          {/* Account Helper Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="test-account-select" className="text-white">
              Quick Fill (Account Helper)
            </Label>
            <Select
              key={`select-${selectedRole || "empty"}`}
              value={selectedRole || undefined}
              onValueChange={handleRoleSelect}
            >
              <SelectTrigger
                id="test-account-select"
                className="border-emerald-500/50 bg-slate-800/50 text-white focus:ring-emerald-500/50 focus:border-emerald-500 rounded-lg"
              >
                <SelectValue placeholder="Select to auto-fill credentials" />
              </SelectTrigger>
              <SelectContent className="border-gray-600 bg-gray-800">
                <SelectItem
                  value="test-user"
                  className="cursor-pointer text-white focus:bg-gray-700 focus:text-white"
                >
                  Test User (test@user.com)
                </SelectItem>
                {selectedRole && (
                  <SelectItem
                    value="clear"
                    className="cursor-pointer text-gray-400 opacity-60 focus:bg-gray-700 focus:text-gray-400"
                  >
                    Clear Selection
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              This helper auto-fills the form. User must exist in database.
            </p>
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="border-emerald-500/50 bg-slate-800/50 text-white placeholder:text-gray-500 focus:ring-emerald-500/50 focus:border-emerald-500 rounded-lg"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="border-emerald-500/50 bg-slate-800/50 text-white placeholder:text-gray-500 focus:ring-emerald-500/50 focus:border-emerald-500 rounded-lg"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-red-400">{errors.password.message}</p>
            )}
          </div>

          {/* Sign In Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-lg shadow-emerald-500/30 disabled:opacity-50 transition-all duration-200"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>

          {/* Separator */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-transparent px-2 text-white/60">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google OAuth Button */}
          <Button
            type="button"
            disabled={isLoading}
            onClick={handleGoogleSignIn}
            className="w-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-lg disabled:opacity-50 transition-all duration-200"
          >
            <svg
              className="mr-2 h-4 w-4"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {isLoading ? "Signing in..." : "Continue with Google"}
          </Button>

          {/* Sign Up Link */}
          <div className="text-center text-sm text-gray-400">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                if (onSwitchToRegister) {
                  onSwitchToRegister();
                }
              }}
              className="text-emerald-400 hover:text-emerald-300 underline transition-colors"
            >
              Sign up
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
