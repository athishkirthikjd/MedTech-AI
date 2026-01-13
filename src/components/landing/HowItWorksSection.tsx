import { motion } from "framer-motion";
import { MessageSquare, Brain, CalendarCheck, HeartPulse } from "lucide-react";

const steps = [
  {
    step: 1,
    icon: MessageSquare,
    title: "Describe Your Symptoms",
    description: "Use our AI assistant to describe how you're feeling or what health concern you have.",
    color: "bg-blue-500",
  },
  {
    step: 2,
    icon: Brain,
    title: "Get Smart Recommendations",
    description: "Our AI analyzes your input and suggests the best course of action — see a specialist, order tests, or get general guidance.",
    color: "bg-purple-500",
  },
  {
    step: 3,
    icon: CalendarCheck,
    title: "Book & Manage Care",
    description: "Seamlessly book appointments, order medications, or schedule lab tests all in one place.",
    color: "bg-emerald-500",
  },
  {
    step: 4,
    icon: HeartPulse,
    title: "Track Your Health",
    description: "Monitor your vitals, view results, and maintain your complete health record digitally.",
    color: "bg-rose-500",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24">
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
            How
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"> It Works</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Getting started with MedTech AI is simple. Follow these four easy steps to take control of your healthcare journey.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative max-w-4xl mx-auto">
          {/* Connection Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-secondary to-accent hidden lg:block" />

          {/* Steps */}
          <div className="space-y-12 lg:space-y-24">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative flex flex-col lg:flex-row items-center gap-8 ${
                  index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                }`}
              >
                {/* Content */}
                <div className={`flex-1 text-center ${index % 2 === 0 ? "lg:text-right" : "lg:text-left"}`}>
                  <span className="inline-block text-sm font-medium text-primary mb-2">
                    Step {step.step}
                  </span>
                  <h3 className="text-2xl font-bold mb-3 text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto lg:mx-0">
                    {step.description}
                  </p>
                </div>

                {/* Icon Circle */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`relative z-10 w-20 h-20 rounded-full ${step.color} flex items-center justify-center shadow-xl`}
                >
                  <step.icon className="w-10 h-10 text-white" />
                  {/* Pulse effect */}
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`absolute inset-0 rounded-full ${step.color}`}
                  />
                </motion.div>

                {/* Empty space for alignment */}
                <div className="flex-1 hidden lg:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
