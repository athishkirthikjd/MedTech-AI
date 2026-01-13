import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Bot, Calendar, Pill, TestTube, FileText, Video, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const floatingIcons = [
  { icon: Calendar, delay: 0, x: -120, y: -80 },
  { icon: Pill, delay: 0.2, x: 140, y: -60 },
  { icon: TestTube, delay: 0.4, x: -100, y: 60 },
  { icon: FileText, delay: 0.6, x: 130, y: 80 },
  { icon: Video, delay: 0.8, x: 0, y: -120 },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, delay: 2 }}
          className="absolute bottom-1/4 -right-32 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Healthcare Platform</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
            >
              <span className="text-foreground">AI-Powered</span>
              <br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Smart Hospital
              </span>
              <br />
              <span className="text-foreground">Assistant</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0"
            >
              Appointments, Consultations, Pharmacy, Labs & Records — all through AI. 
              Experience healthcare reimagined for the digital age.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-lg px-8 shadow-lg shadow-primary/25">
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/chat">
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 text-lg px-8">
                  <Bot className="w-5 h-5" />
                  Try AI Assistant
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-8 mt-12 justify-center lg:justify-start"
            >
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-foreground">15K+</div>
                <div className="text-sm text-muted-foreground">Active Patients</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-foreground">85+</div>
                <div className="text-sm text-muted-foreground">Expert Doctors</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-foreground">98%</div>
                <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - AI Bot Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex items-center justify-center"
          >
            {/* Central AI Bot */}
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-full blur-3xl opacity-20 scale-150" />
              
              {/* Main Circle */}
              <motion.div
                animate={{ 
                  boxShadow: [
                    "0 0 60px rgba(8, 145, 178, 0.3)",
                    "0 0 100px rgba(8, 145, 178, 0.5)",
                    "0 0 60px rgba(8, 145, 178, 0.3)",
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="relative w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-4 rounded-full border-2 border-white/20 border-dashed"
                />
                <Bot className="w-24 h-24 md:w-32 md:h-32 text-white" />
              </motion.div>

              {/* Floating Icons */}
              {floatingIcons.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    y: [0, -10, 0],
                  }}
                  transition={{
                    delay: item.delay + 0.5,
                    y: {
                      duration: 3,
                      repeat: Infinity,
                      delay: item.delay,
                    }
                  }}
                  style={{
                    position: "absolute",
                    left: `calc(50% + ${item.x}px)`,
                    top: `calc(50% + ${item.y}px)`,
                  }}
                  className="w-14 h-14 rounded-2xl bg-card shadow-lg border border-border flex items-center justify-center"
                >
                  <item.icon className="w-6 h-6 text-primary" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2"
        >
          <motion.div
            animate={{ opacity: [1, 0, 1], y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-2 bg-primary rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
