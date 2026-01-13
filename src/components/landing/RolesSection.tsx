import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { User, Stethoscope, BarChart3, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";

const roles = [
  {
    icon: User,
    title: "For Patients",
    description: "Access your health records, book appointments, order medicines, and chat with our AI assistant — all from one dashboard.",
    features: [
      "AI Symptom Checker",
      "Online Consultations",
      "Digital Prescriptions",
      "Health Vitals Tracking",
    ],
    color: "from-blue-500 to-cyan-500",
    link: "/register?role=patient",
  },
  {
    icon: Stethoscope,
    title: "For Doctors",
    description: "Manage your practice efficiently with smart scheduling, digital prescriptions, and comprehensive patient management tools.",
    features: [
      "Schedule Management",
      "Patient Records Access",
      "Digital Prescriptions",
      "Video Consultations",
    ],
    color: "from-emerald-500 to-teal-500",
    link: "/register?role=doctor",
  },
  {
    icon: BarChart3,
    title: "For Administrators",
    description: "Get complete visibility into hospital operations with powerful analytics, staff management, and real-time insights.",
    features: [
      "Real-time Analytics",
      "Staff Management",
      "Revenue Tracking",
      "Audit Logs",
    ],
    color: "from-purple-500 to-pink-500",
    link: "/register?role=admin",
  },
];

export function RolesSection() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Built for
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"> Everyone</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you're a patient, doctor, or administrator, MedTech AI has the tools you need to succeed.
          </p>
        </motion.div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {roles.map((role, index) => (
            <motion.div
              key={role.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              <GlassCard className="p-8 h-full flex flex-col">
                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center mb-6 shadow-lg`}>
                  <role.icon className="w-8 h-8 text-white" />
                </div>

                {/* Title & Description */}
                <h3 className="text-2xl font-bold mb-3 text-foreground">
                  {role.title}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {role.description}
                </p>

                {/* Features List */}
                <ul className="space-y-3 mb-8 flex-1">
                  {role.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${role.color} flex items-center justify-center`}>
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Link to={role.link}>
                  <Button className={`w-full gap-2 bg-gradient-to-r ${role.color} hover:opacity-90`}>
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
