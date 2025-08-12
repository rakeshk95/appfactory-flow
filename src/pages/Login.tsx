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

      <main className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden px-6 py-12">
        {/* Decorative gradients */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/25 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-secondary/25 blur-3xl" aria-hidden="true" />

        {/* Single-section login */}
        <section className="w-full max-w-lg animate-fade-in">
          <div className="bg-gradient-to-b from-primary/40 via-accent/30 to-secondary/40 p-[1px] rounded-2xl shadow-2xl">
            <div className="rounded-2xl bg-card/70 backdrop-blur-xl ring-1 ring-border/60 p-8 relative">
              {/* Brand */}
              <div className="mb-8 text-center">
                <img
                  src="/lovable-uploads/f870dc56-8509-4607-9017-bb0b424fe03e.png"
                  alt="Kedaara Performance Hub logo"
                  className="mx-auto h-14 w-auto"
                  loading="eager"
                />
                <h1 className="mt-4 text-3xl font-semibold text-foreground">Kedaara Performance Hub</h1>
                <p className="mt-2 text-muted-foreground">Elevating Excellence Together</p>
              </div>

              {/* Intro */}
              <header className="mb-6 text-center">
                <CardTitle className="text-xl">Welcome back</CardTitle>
                <CardDescription>Sign in to continue your review journey</CardDescription>
              </header>

              {/* Form */}
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
        </section>
      </main>
    </>
  );
}
