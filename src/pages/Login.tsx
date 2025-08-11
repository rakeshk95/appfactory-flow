import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth, Role } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

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

      <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gradient-to-br from-primary/5 via-accent/5 to-background">
        <section className="w-full max-w-md mx-auto p-6 lg:p-8 flex items-center">
          <Card className="w-full border border-border/60 shadow-xl bg-card/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <img
                src="/lovable-uploads/f870dc56-8509-4607-9017-bb0b424fe03e.png"
                alt="Kedaara Performance Hub logo"
                className="mx-auto h-14 w-auto"
                loading="eager"
              />
              <CardTitle className="text-2xl font-bold">Kedaara Performance Hub</CardTitle>
              <CardDescription>Elevating Excellence Together</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Work Email</Label>
                  <Input id="email" type="email" required placeholder="you@company.com" {...register("email")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" required placeholder="••••••••" {...register("password")} />
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
            </CardContent>
          </Card>
        </section>

        <aside className="hidden lg:flex relative items-center justify-center p-10">
          <div className="absolute inset-0 rounded-none bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20" aria-hidden="true" />
          <div className="relative z-10 max-w-xl">
            <article className="bg-card/60 backdrop-blur-md rounded-2xl p-10 border border-border/60 shadow-lg">
              <header className="mb-4 flex items-center gap-3">
                <img src="/lovable-uploads/f870dc56-8509-4607-9017-bb0b424fe03e.png" alt="KPH brand mark" className="h-8 w-auto" loading="lazy" />
                <h2 className="text-3xl font-semibold text-foreground">Elevating Excellence Together</h2>
              </header>
              <p className="text-muted-foreground">Role-based performance reviews tailored for Kedaara.</p>
              <ul className="mt-6 space-y-3 text-foreground">
                <li className="flex items-start gap-2"><span className="mt-2 inline-block h-2.5 w-2.5 rounded-full bg-primary" /> Select Reviewers</li>
                <li className="flex items-start gap-2"><span className="mt-2 inline-block h-2.5 w-2.5 rounded-full bg-primary" /> Mentor Approval</li>
                <li className="flex items-start gap-2"><span className="mt-2 inline-block h-2.5 w-2.5 rounded-full bg-primary" /> Reviewer Feedback</li>
                <li className="flex items-start gap-2"><span className="mt-2 inline-block h-2.5 w-2.5 rounded-full bg-primary" /> Finalize Ratings</li>
                <li className="flex items-start gap-2"><span className="mt-2 inline-block h-2.5 w-2.5 rounded-full bg-primary" /> Appraisal Discussions</li>
                <li className="flex items-start gap-2"><span className="mt-2 inline-block h-2.5 w-2.5 rounded-full bg-primary" /> Post-Appraisal Reflections</li>
              </ul>
            </article>
          </div>
        </aside>
      </main>
    </>
  );
}
