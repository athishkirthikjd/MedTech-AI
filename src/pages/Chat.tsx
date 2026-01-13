import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Send,
  Bot,
  User,
  Mic,
  Sparkles,
  ArrowRight,
  Calendar,
  Pill,
  Stethoscope,
  FlaskConical,
  ArrowLeft,
  MessageCircle,
  Zap,
  Shield,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  actions?: { label: string; icon: React.ElementType; href: string }[];
}

const suggestedQuestions = [
  { icon: Stethoscope, text: "What are common flu symptoms?" },
  { icon: Calendar, text: "How do I book an appointment?" },
  { icon: Pill, text: "Can you help with medication info?" },
  { icon: FlaskConical, text: "How do lab tests work here?" },
];

const features = [
  { icon: Zap, title: "Instant Responses", desc: "Get answers in seconds" },
  { icon: Shield, title: "Private & Secure", desc: "Your data stays safe" },
  { icon: Clock, title: "24/7 Available", desc: "Always here to help" },
];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your MedTech AI health assistant. I can help you with symptoms, appointments, medications, and general health questions. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getAIResponse = (query: string): { content: string; actions?: Message["actions"] } => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes("symptom") || lowerQuery.includes("flu") || lowerQuery.includes("sick") || lowerQuery.includes("fever")) {
      return {
        content: "Common flu symptoms include fever, body aches, fatigue, cough, and sore throat. If you're experiencing severe symptoms like difficulty breathing or chest pain, please seek immediate medical attention. Would you like to use our Symptom Checker for a more detailed analysis?",
        actions: [
          { label: "Check Symptoms", icon: Stethoscope, href: "/patient/symptoms" },
          { label: "Book Doctor", icon: Calendar, href: "/patient/appointments" },
        ],
      };
    }
    
    if (lowerQuery.includes("appointment") || lowerQuery.includes("book") || lowerQuery.includes("doctor")) {
      return {
        content: "I can help you book an appointment! We have specialists in Cardiology, Dermatology, Neurology, Pediatrics, and more. You can view available time slots and choose between in-person or video consultations.",
        actions: [
          { label: "Book Appointment", icon: Calendar, href: "/patient/appointments" },
        ],
      };
    }
    
    if (lowerQuery.includes("medication") || lowerQuery.includes("medicine") || lowerQuery.includes("prescription") || lowerQuery.includes("pharmacy")) {
      return {
        content: "Our online pharmacy offers a wide range of medications with prescription verification. You can refill existing prescriptions, order new medications, and get doorstep delivery. Always consult with your doctor before starting new medications.",
        actions: [
          { label: "Visit Pharmacy", icon: Pill, href: "/patient/pharmacy" },
        ],
      };
    }
    
    if (lowerQuery.includes("lab") || lowerQuery.includes("test") || lowerQuery.includes("blood")) {
      return {
        content: "We offer comprehensive lab testing services including blood work, hormone panels, allergy tests, and more. You can schedule home sample collection or visit our partner labs. Results are typically available within 24-48 hours.",
        actions: [
          { label: "Book Lab Test", icon: FlaskConical, href: "/patient/appointments" },
        ],
      };
    }
    
    return {
      content: "I'm here to help with your health-related questions! I can assist with symptom checking, booking appointments, medication information, lab tests, and general health guidance. What would you like to know more about?",
    };
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = getAIResponse(input);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.content,
        timestamp: new Date(),
        actions: response.actions,
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1200);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-0 -left-48 w-[500px] h-[500px] bg-primary/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 3 }}
          className="absolute bottom-0 -right-48 w-[500px] h-[500px] bg-secondary/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, -30, 0],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 8, repeat: Infinity, delay: 1 }}
          className="absolute top-1/2 left-1/4 w-72 h-72 bg-accent/20 rounded-full blur-3xl"
        />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 backdrop-blur-xl bg-background/80">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg hidden sm:inline">MedTech AI</span>
            </motion.div>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/register">
              <Button className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_300px] gap-6 h-[calc(100vh-8rem)]">
            {/* Chat Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl overflow-hidden"
            >
              {/* Chat Header */}
              <div className="p-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-secondary/5">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{
                      boxShadow: [
                        "0 0 20px hsl(var(--primary) / 0.3)",
                        "0 0 40px hsl(var(--primary) / 0.5)",
                        "0 0 20px hsl(var(--primary) / 0.3)",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="relative h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center"
                  >
                    <Bot className="h-6 w-6 text-white" />
                    <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-success border-2 border-card" />
                  </motion.div>
                  <div>
                    <h1 className="font-semibold text-lg flex items-center gap-2">
                      AI Health Assistant
                      <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Online
                      </Badge>
                    </h1>
                    <p className="text-sm text-muted-foreground">Ask me anything about your health</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`flex max-w-[85%] gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1 }}
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                              message.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-gradient-to-br from-primary to-secondary text-white"
                            }`}
                          >
                            {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                          </motion.div>
                          <div className="space-y-2">
                            <motion.div
                              initial={{ opacity: 0, x: message.role === "user" ? 20 : -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.15 }}
                              className={`rounded-2xl px-4 py-3 ${
                                message.role === "user"
                                  ? "bg-primary text-primary-foreground rounded-br-md"
                                  : "bg-muted rounded-bl-md"
                              }`}
                            >
                              <p className="text-sm leading-relaxed">{message.content}</p>
                            </motion.div>
                            {message.actions && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex flex-wrap gap-2"
                              >
                                {message.actions.map((action) => (
                                  <Link key={action.href} to={action.href}>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8 text-xs gap-1.5 hover:bg-primary hover:text-primary-foreground transition-all"
                                    >
                                      <action.icon className="h-3.5 w-3.5" />
                                      {action.label}
                                    </Button>
                                  </Link>
                                ))}
                              </motion.div>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Typing Indicator */}
                  <AnimatePresence>
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-3"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="rounded-2xl bg-muted px-4 py-3 rounded-bl-md">
                          <div className="flex gap-1.5">
                            {[0, 1, 2].map((i) => (
                              <motion.span
                                key={i}
                                animate={{ y: [0, -6, 0] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                                className="h-2 w-2 rounded-full bg-primary/60"
                              />
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="p-4 border-t border-border/50 bg-gradient-to-r from-background/80 to-background/80 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask me about symptoms, appointments, medications..."
                    className="flex-1 h-12 rounded-xl border-border/50 bg-muted/50 focus-visible:ring-primary"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-xl shrink-0 hover:bg-primary/10"
                  >
                    <Mic className="h-5 w-5" />
                  </Button>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={handleSend}
                      disabled={!input.trim()}
                      size="icon"
                      className="h-12 w-12 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 shrink-0"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="hidden lg:flex flex-col gap-4"
            >
              {/* Suggested Questions */}
              <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-primary" />
                  Try Asking
                </h3>
                <div className="space-y-2">
                  {suggestedQuestions.map((item, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      whileHover={{ x: 4, backgroundColor: "hsl(var(--muted))" }}
                      onClick={() => handleSuggestedQuestion(item.text)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors border border-transparent hover:border-border/50"
                    >
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <item.icon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm">{item.text}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-secondary" />
                  Why Use AI Assistant?
                </h3>
                <div className="space-y-3">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <div className="h-8 w-8 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                        <feature.icon className="h-4 w-4 text-secondary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{feature.title}</p>
                        <p className="text-xs text-muted-foreground">{feature.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="rounded-2xl bg-gradient-to-br from-primary to-secondary p-4 text-white"
              >
                <h3 className="font-semibold mb-2">Want Full Access?</h3>
                <p className="text-sm text-white/80 mb-3">
                  Sign up to book appointments, track vitals, and access your health records.
                </p>
                <Link to="/register">
                  <Button variant="secondary" className="w-full gap-2 bg-white text-primary hover:bg-white/90">
                    Create Free Account
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
