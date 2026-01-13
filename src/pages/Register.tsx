import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, Mail, Lock, Eye, EyeOff, ArrowRight, User, Stethoscope, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const roles = [
  { id: "patient" as UserRole, icon: User, title: "Patient", description: "Book appointments & manage health" },
  { id: "doctor" as UserRole, icon: Stethoscope, title: "Doctor", description: "Manage practice & patients" },
  { id: "admin" as UserRole, icon: BarChart3, title: "Admin", description: "Hospital management & analytics" },
];

export default function Register() {
  const [searchParams] = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>((searchParams.get("role") as UserRole) || "patient");
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const getPasswordStrength = () => {
    if (password.length === 0) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const strengthColors = ["bg-destructive", "bg-warning", "bg-warning", "bg-success"];
  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await register(name, email, password, selectedRole);
    if (success) {
      toast({ title: "Account created!", description: "Welcome to MedTech AI." });
      const routes = { patient: "/dashboard", doctor: "/doctor/dashboard", admin: "/admin/dashboard" };
      navigate(routes[selectedRole]);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary to-secondary items-center justify-center p-12">
        <div className="text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Join MedTech AI Today</h2>
          <p className="text-white/80 text-lg max-w-md">Experience the future of healthcare with AI-powered assistance.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">MedTech AI</span>
          </Link>

          <h1 className="text-3xl font-bold mb-2">Create an account</h1>
          <p className="text-muted-foreground mb-6">Choose your role and get started</p>

          {/* Role Selection */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`p-4 rounded-xl border-2 transition-all text-center ${
                  selectedRole === role.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
              >
                <role.icon className={`w-6 h-6 mx-auto mb-2 ${selectedRole === role.id ? "text-primary" : "text-muted-foreground"}`} />
                <p className="font-medium text-sm">{role.title}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input id="email" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {password && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full ${i < getPasswordStrength() ? strengthColors[getPasswordStrength() - 1] : "bg-muted"}`} />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">{strengthLabels[getPasswordStrength() - 1] || "Enter a password"}</p>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full gap-2 bg-gradient-to-r from-primary to-secondary" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create Account"} <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <p className="text-center text-muted-foreground mt-6">
            Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
