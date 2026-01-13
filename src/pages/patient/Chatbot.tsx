import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Send, Bot, User, Mic, Paperclip, MoreVertical,
  Stethoscope, Calendar, Pill, FlaskConical, AlertCircle,
  Sparkles, ChevronRight
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PageTransition } from '@/components/ui/page-transition';
import { chatMessages } from '@/lib/mock-data';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: { label: string; href: string }[];
}

const quickActions = [
  { icon: Stethoscope, label: 'Check Symptoms', href: '/patient/symptom-checker' },
  { icon: Calendar, label: 'Book Appointment', href: '/patient/appointments' },
  { icon: Pill, label: 'Refill Prescription', href: '/patient/pharmacy' },
  { icon: FlaskConical, label: 'View Lab Results', href: '/patient/lab-tests' },
];

const suggestedQuestions = [
  "What are the symptoms of the flu?",
  "How can I manage my blood pressure?",
  "When should I see a doctor for a headache?",
  "What medications interact with ibuprofen?",
];

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>(chatMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getAIResponse(input),
        timestamp: new Date(),
        actions: getResponseActions(input),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const getAIResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('headache') || lowerQuery.includes('pain')) {
      return "I understand you're experiencing discomfort. Headaches can have many causes including stress, dehydration, or lack of sleep. For mild headaches, rest and hydration often help. However, if your headache is severe, sudden, or accompanied by other symptoms like vision changes or fever, I recommend consulting with a doctor. Would you like me to help you check your symptoms or book an appointment?";
    }
    if (lowerQuery.includes('appointment') || lowerQuery.includes('book')) {
      return "I can help you book an appointment! We have several specialists available this week. You can choose from General Medicine, Cardiology, Neurology, and more. Would you like me to show you available slots?";
    }
    if (lowerQuery.includes('prescription') || lowerQuery.includes('medication')) {
      return "I can help you with your prescriptions. You have 3 active prescriptions that can be refilled. Would you like me to process a refill or connect you with your doctor about medication changes?";
    }
    return "I'm here to help with your health-related questions. I can assist you with checking symptoms, booking appointments, understanding medications, or viewing your health records. What would you like to know more about?";
  };

  const getResponseActions = (query: string): { label: string; href: string }[] | undefined => {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('headache') || lowerQuery.includes('symptom') || lowerQuery.includes('pain')) {
      return [
        { label: 'Check Symptoms', href: '/patient/symptom-checker' },
        { label: 'Book Appointment', href: '/patient/appointments' },
      ];
    }
    if (lowerQuery.includes('appointment')) {
      return [{ label: 'View Available Slots', href: '/patient/appointments' }];
    }
    return undefined;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="flex h-[calc(100vh-8rem)] flex-col">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white">
                  <Bot className="h-6 w-6" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-background">
                  <span className="h-2 w-2 rounded-full bg-white" />
                </span>
              </div>
              <div>
                <h1 className="text-xl font-semibold">MedTech AI Assistant</h1>
                <p className="text-sm text-muted-foreground">Online • Ready to help</p>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>

          {/* Disclaimer */}
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-900/20">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-xs text-amber-800 dark:text-amber-200">
              This AI assistant provides general health information only. For medical emergencies, please call emergency services or visit your nearest hospital.
            </p>
          </div>

          <div className="flex flex-1 gap-4 overflow-hidden">
            {/* Chat Area */}
            <GlassCard className="flex flex-1 flex-col overflow-hidden p-0">
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex max-w-[80%] gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                            message.role === 'user' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-gradient-to-br from-primary to-secondary text-white'
                          }`}>
                            {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                          </div>
                          <div>
                            <div className={`rounded-2xl px-4 py-3 ${
                              message.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}>
                              <p className="text-sm leading-relaxed">{message.content}</p>
                            </div>
                            {message.actions && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {message.actions.map((action) => (
                                  <Link key={action.href} to={action.href}>
                                    <Button size="sm" variant="outline" className="h-8 text-xs">
                                      {action.label}
                                      <ChevronRight className="ml-1 h-3 w-3" />
                                    </Button>
                                  </Link>
                                ))}
                              </div>
                            )}
                            <p className="mt-1 text-xs text-muted-foreground">
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-3"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="rounded-2xl bg-muted px-4 py-3">
                          <div className="flex gap-1">
                            <motion.span
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                              className="h-2 w-2 rounded-full bg-muted-foreground"
                            />
                            <motion.span
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                              className="h-2 w-2 rounded-full bg-muted-foreground"
                            />
                            <motion.span
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                              className="h-2 w-2 rounded-full bg-muted-foreground"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="border-t border-border p-4">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your health question..."
                    className="flex-1"
                  />
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <Mic className="h-5 w-5" />
                  </Button>
                  <Button onClick={handleSend} disabled={!input.trim()} className="shrink-0">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </GlassCard>

            {/* Sidebar */}
            <div className="hidden w-72 shrink-0 space-y-4 lg:block">
              {/* Quick Actions */}
              <GlassCard className="p-4">
                <h3 className="mb-3 flex items-center gap-2 font-semibold">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  {quickActions.map((action) => (
                    <Link key={action.href} to={action.href}>
                      <motion.div
                        whileHover={{ x: 4 }}
                        className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
                      >
                        <div className="rounded-lg bg-primary/10 p-2">
                          <action.icon className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm">{action.label}</span>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </GlassCard>

              {/* Suggested Questions */}
              <GlassCard className="p-4">
                <h3 className="mb-3 font-semibold">Suggested Questions</h3>
                <div className="space-y-2">
                  {suggestedQuestions.map((question, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setInput(question)}
                      className="w-full rounded-lg border border-border p-2 text-left text-sm transition-colors hover:bg-muted"
                    >
                      {question}
                    </motion.button>
                  ))}
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
