import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth, Role } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";

type FormValues = {
  email: string;
  password: string;
};

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    defaultValues: { email: "", password: "" },
  });
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (values: FormValues) => {
    try {
      let role: Role = "Employee";
      
      if (values.email.includes("admin@")) {
        role = "System Administrator";
      } else if (values.email.includes("mentor@")) {
        role = "Mentor";
      } else if (values.email.includes("hr@")) {
        role = "HR Lead";
      } else if (values.email.includes("committee@")) {
        role = "People Committee";
      }

      await login(values.email, values.password, role);
      toast({ 
        title: "Welcome to KPH", 
        description: `Successfully logged in as ${role}`,
        variant: "default"
      });
      
      // Role-based redirection
      if (role === "System Administrator") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again.",
        variant: "destructive"
      });
    }
  };

  const canonical = typeof window !== "undefined" ? window.location.origin + "/login" : "/login";

  return (
    <>
      <Helmet>
        <title>KPH Login | Kedaara Performance Hub</title>
        <meta name="description" content="Login to Kedaara Performance Hub (KPH) – Elevating excellence together." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-teal-100 via-cyan-100 to-teal-200 relative overflow-hidden">
        {/* Unified Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/30 via-cyan-400/25 to-teal-600/20"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-400/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-500/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-teal-400/20 to-cyan-300/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-6xl flex items-center">
            {/* Left Side - Brand Section */}
            <div className="hidden lg:flex lg:w-1/2 pr-16">
              <div className="max-w-lg">
                {/* Kedaara Logo */}
                <div className="mb-12">
                  <div className="flex items-center gap-8 mb-12">
                    <img
                      src="/lovable-uploads/logo.png"
                      alt="Kedaara Logo"
                      className="w-40 h-40 object-contain"
                    />
                    <div>
                      <h1 className="text-6xl font-bold tracking-wider text-gray-900 drop-shadow-sm">KEDAARA</h1>
                      <p className="text-teal-700 text-2xl font-semibold">Performance Hub</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-4xl font-bold text-gray-800 leading-relaxed">
                      Elevating Excellence Together
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex justify-center lg:justify-end">
              <div className="w-full max-w-md">
                {/* Mobile Logo */}
                <div className="lg:hidden text-center mb-8">
                  <div className="inline-flex items-center gap-4 mb-6">
                    <img
                      src="/lovable-uploads/logo.png"
                      alt="Kedaara Logo"
                      className="w-24 h-24 object-contain"
                    />
                    <div className="text-left">
                      <h1 className="text-3xl font-bold text-gray-900 tracking-wider">KEDAARA Performance Hub</h1>
                    </div>
                  </div>
                </div>

                {/* Login Card */}
                <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
                  <CardContent className="p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                          Email address
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            className="pl-10 h-12 border-gray-200 focus:border-teal-500 focus:ring-teal-500 transition-colors"
                            {...register("email", {
                              required: "Email is required",
                              pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: "Please enter a valid email address"
                              }
                            })}
                          />
                        </div>
                        {errors.email && (
                          <p className="text-sm text-red-600">{errors.email.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                          Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className="pl-10 pr-10 h-12 border-gray-200 focus:border-teal-500 focus:ring-teal-500 transition-colors"
                            {...register("password", {
                              required: "Password is required",
                              minLength: {
                                value: 6,
                                message: "Password must be at least 6 characters"
                              }
                            })}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="text-sm text-red-600">{errors.password.message}</p>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm">
                          <Checkbox id="remember" className="border-gray-300" />
                          <span className="text-gray-600">Remember me</span>
                        </label>
                        <a 
                          href="#" 
                          className="text-sm text-teal-600 hover:text-teal-700 transition-colors font-medium"
                        >
                          Forgot password?
                        </a>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full h-12 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold transition-all shadow-lg hover:shadow-xl"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Signing in...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            Sign in
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
