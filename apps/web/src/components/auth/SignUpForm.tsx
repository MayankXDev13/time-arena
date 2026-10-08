
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/useAuth";
import { SocialAuthButtons } from "./SocialAuthButtons";
import { Loader2, Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react";

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignUpFormData = z.infer<typeof signUpSchema>;

const inputCls =
  "h-11 w-full rounded-[10px] border border-white/10 bg-[#1d232e] pl-10 pr-11 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-[#f0642b]/60 focus:ring-2 focus:ring-[#f0642b]/25";

const inputClsNoEye =
  "h-11 w-full rounded-[10px] border border-white/10 bg-[#1d232e] pl-10 pr-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-[#f0642b]/60 focus:ring-2 focus:ring-[#f0642b]/25";

export function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    setError(null);

    const result = await signUp(data.name, data.email, data.password);

    if (result.error) {
      setError(result.error.message);
      setIsLoading(false);
    } else {
      navigate("/signin?message=Account created successfully! Please sign in.");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-semibold text-white">
            Full Name
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/40" />
            <input
              id="name"
              type="text"
              placeholder="Enter your full name"
              {...register("name")}
              disabled={isLoading}
              className={inputClsNoEye}
            />
          </div>
          {errors.name && <p className="text-sm text-red-400">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-semibold text-white">
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/40" />
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...register("email")}
              disabled={isLoading}
              className={inputClsNoEye}
            />
          </div>
          {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-semibold text-white">
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/40" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              {...register("password")}
              disabled={isLoading}
              className={inputCls}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/45 transition hover:text-white"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.password && <p className="text-sm text-red-400">{errors.password.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="text-sm font-semibold text-white">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/40" />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              {...register("confirmPassword")}
              disabled={isLoading}
              className={inputCls}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/45 transition hover:text-white"
            >
              {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-400">{errors.confirmPassword.message}</p>
          )}
        </div>

        {error && (
          <div className="rounded-[10px] border border-red-500/25 bg-red-500/10 px-3 py-2.5 text-center text-sm text-red-300">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-[#f0642b] text-[15px] font-semibold text-black transition hover:bg-[#f0713a] disabled:opacity-70"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              Create Account
              <ArrowRight className="size-4" strokeWidth={2.5} />
            </>
          )}
        </button>
      </form>

      <SocialAuthButtons mode="signup" />
    </div>
  );
}
