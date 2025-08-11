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

      <main className="min-h-screen grid place-items-center bg-background">
        <section className="w-full max-w-md p-4">
          <Card className="border border-border shadow-sm">
            <CardHeader className="text-center">
              <img
                src="/lovable-uploads/f870dc56-8509-4607-9017-bb0b424fe03e.png"
                alt="Kedaara Performance Hub logo"
                className="mx-auto h-14 w-auto"
                loading="eager"
              />
              <CardTitle asChild>
                <h1 className="text-2xl font-bold">Kedaara Performance Hub</h1>
              </CardTitle>
              <CardDescription>Elevating Excellence Together</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          <p className="mt-6 text-center text-sm text-muted-foreground">
            KPH is a role-based performance review portal. Dummy login enabled for now.
          </p>
        </section>
      </main>
      <link rel="canonical" href={canonical} />
    </>
  );
}
