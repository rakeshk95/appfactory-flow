import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth, Role } from "@/context/AuthContext";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const roles: Role[] = [
  "Employee",
  "Mentor",
  "HR Lead",
  "People Committee",
  "System Administrator",
];

type FormValues = {
  email: string;
  password: string;
  role: Role;
};

export default function Login() {
  const { register, handleSubmit, setValue, watch } = useForm<FormValues>({
    defaultValues: { email: "", password: "", role: "Employee" },
  });
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (values: FormValues) => {
    await login(values.email, values.password, values.role);
    toast({ title: "Welcome to KPH", description: `Logged in as ${values.role}` });
    navigate("/dashboard", { replace: true });
  };

  const canonical = typeof window !== "undefined" ? window.location.origin + "/login" : "/login";

  return (
    <>
      <Helmet>
        <title>KPH Login | Kedaara Performance Hub</title>
        <meta name="description" content="Login to Kedaara Performance Hub (KPH) – Elevating excellence together." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <h1 className="sr-only">Kedaara Performance Hub Login</h1>
      <main className="relative min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-background overflow-hidden">
        {/* Decorative gradients */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/25 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-secondary/25 blur-3xl" aria-hidden="true" />

        {/* Brand hero */}
        <section className="hidden lg:flex lg:col-span-7 items-center justify-center p-16 relative">
          <div className="max-w-xl animate-fade-in">
            <div className="bg-card/60 backdrop-blur-lg ring-1 ring-border/50 rounded-2xl p-8 inline-flex items-center gap-4">
              <img
                src="/lovable-uploads/f870dc56-8509-4607-9017-bb0b424fe03e.png"
                alt="Kedaara Performance Hub logo"
                className="h-12 w-auto"
                loading="lazy"
              />
              <div>
                <p className="text-sm text-muted-foreground">Kedaara Performance Hub</p>
                <h2 className="text-3xl font-semibold text-foreground">Elevating Excellence Together</h2>
              </div>
            </div>

            <p className="mt-8 text-lg text-muted-foreground">
              Drive growth with structured, transparent and role-aware reviews designed for Kedaara.
            </p>

            <ul className="mt-8 space-y-4 text-foreground">
              <li className="flex items-center gap-3">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary" /> Smart reviewer selection
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary" /> Guided mentor approvals
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary" /> Insightful feedback summaries
              </li>
            </ul>
          </div>
        </section>

        {/* Sign-in panel */}
        <section className="lg:col-span-5 flex items-center justify-center p-6 lg:p-10">
          <div className="w-full max-w-md animate-fade-in">
            <div className="bg-gradient-to-b from-primary/40 via-accent/30 to-secondary/40 p-[1px] rounded-2xl shadow-2xl">
              <div className="rounded-2xl bg-card/70 backdrop-blur-xl ring-1 ring-border/60 p-8 relative">
                <div className="mb-6 flex items-center gap-2">
                  <img
                    src="/lovable-uploads/f870dc56-8509-4607-9017-bb0b424fe03e.png"
                    alt="KPH logo"
                    className="h-7 w-auto"
                    loading="eager"
                  />
                  <span className="text-sm text-muted-foreground">Kedaara Performance Hub</span>
                </div>

                <header className="mb-6">
                  <CardTitle className="text-2xl">Welcome back</CardTitle>
                  <CardDescription>Sign in to continue your review journey</CardDescription>
                </header>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email">Work Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      <Input id="email" type="email" required placeholder="you@company.com" className="pl-9" {...register("email")} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        className="pl-9 pr-10"
                        {...register("password")}
                      />
                      <button
                        type="button"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-foreground" htmlFor="remember">
                      <Checkbox id="remember" />
                      <span>Remember me</span>
                    </label>
                    <a href="#" className="text-sm story-link text-primary">Forgot password?</a>
                  </div>

                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select
                      onValueChange={(val) => setValue("role", val as Role)}
                      defaultValue={watch("role")}
                    >
                      <SelectTrigger aria-label="Select role">
                        <SelectValue placeholder="Choose your role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full">Sign in</Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
