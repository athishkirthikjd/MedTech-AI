import { motion } from "framer-motion";
import { Bot, Calendar, Pill, TestTube, FileText, Video, Shield, Clock } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

const features = [
  {
    icon: Bot,
    title: "AI-Powered Assistant",
    description: "Get instant guidance for symptoms, appointments, and medications through our intelligent chatbot.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "Book appointments with the right specialists based on your symptoms and preferences.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Pill,
    title: "Digital Pharmacy",
    description: "Order medicines online with prescription verification and doorstep delivery.",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: TestTube,
    title: "Lab Test Booking",
    description: "Schedule lab tests, track results, and get home sample collection services.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: FileText,
    title: "Health Records",
    description: "Access your complete medical history, prescriptions, and reports in one secure place.",
    color: "from-amber-500 to-yellow-500",
  },
  {
    icon: Video,
    title: "Video Consultations",
    description: "Connect with doctors remotely through secure, high-quality video calls.",
    color: "from-teal-500 to-cyan-500",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your health data is protected with enterprise-grade encryption and HIPAA compliance.",
    color: "from-indigo-500 to-purple-500",
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description: "Access healthcare services anytime, anywhere. Our AI assistant never sleeps.",
    color: "from-rose-500 to-pink-500",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-muted/30">
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
            Everything You Need for
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"> Better Healthcare</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our comprehensive platform brings together all aspects of healthcare management, powered by cutting-edge AI technology.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <GlassCard className="p-6 h-full group">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
