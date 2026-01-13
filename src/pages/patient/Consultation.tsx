import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Video, VideoOff, Mic, MicOff, Phone, Monitor, MessageSquare,
  MoreVertical, Maximize2, Settings, FileText, Send, Paperclip,
  Clock, User, Calendar
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageTransition } from '@/components/ui/page-transition';

const mockConsultation = {
  doctor: {
    name: 'Dr. Sarah Johnson',
    specialty: 'Cardiologist',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop',
  },
  scheduledTime: '10:00 AM - 10:30 AM',
  date: 'Today',
  status: 'In Progress',
};

const chatMessages = [
  { id: 1, role: 'doctor', content: 'Good morning! How are you feeling today?', time: '10:02 AM' },
  { id: 2, role: 'patient', content: 'Good morning, Doctor. I have been experiencing some chest discomfort lately.', time: '10:03 AM' },
  { id: 3, role: 'doctor', content: 'I see. Can you describe the discomfort? Is it a sharp pain or more of a dull ache?', time: '10:04 AM' },
  { id: 4, role: 'patient', content: 'It is more of a dull ache, especially after physical activity.', time: '10:05 AM' },
  { id: 5, role: 'doctor', content: 'Based on your symptoms and your recent ECG results, I would like to prescribe some medication and schedule a follow-up test.', time: '10:08 AM' },
];

const prescriptionPreview = {
  medications: [
    { name: 'Aspirin 75mg', dosage: 'Once daily after breakfast', duration: '30 days' },
    { name: 'Atorvastatin 10mg', dosage: 'Once daily at bedtime', duration: '30 days' },
  ],
  notes: 'Continue regular exercise with moderate intensity. Avoid strenuous activities until follow-up.',
  followUp: '2 weeks',
};

export default function Consultation() {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState(chatMessages);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    setMessages([
      ...messages,
      {
        id: messages.length + 1,
        role: 'patient',
        content: chatInput,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setChatInput('');
  };

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="flex h-[calc(100vh-8rem)] flex-col gap-4 lg:flex-row">
          {/* Video Section */}
          <div className="flex flex-1 flex-col">
            {/* Main Video */}
            <GlassCard className="relative flex-1 overflow-hidden p-0">
              {/* Doctor Video (Main) */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900">
                <img
                  src={mockConsultation.doctor.image}
                  alt={mockConsultation.doctor.name}
                  className="h-full w-full object-cover opacity-90"
                />
                {/* Doctor Info Overlay */}
                <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-lg bg-black/50 px-3 py-2 backdrop-blur-sm">
                  <div className="h-10 w-10 rounded-full bg-primary/20" />
                  <div>
                    <p className="font-medium text-white">{mockConsultation.doctor.name}</p>
                    <p className="text-xs text-white/70">{mockConsultation.doctor.specialty}</p>
                  </div>
                </div>
              </div>

              {/* Self Video (PIP) */}
              <motion.div
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                className="absolute bottom-4 right-4 h-32 w-44 cursor-move overflow-hidden rounded-xl border-2 border-white/20 bg-slate-700 shadow-lg"
              >
                <div className="flex h-full w-full items-center justify-center">
                  {isVideoOn ? (
                    <User className="h-12 w-12 text-white/50" />
                  ) : (
                    <VideoOff className="h-8 w-8 text-white/50" />
                  )}
                </div>
                <div className="absolute bottom-2 left-2 text-xs text-white/70">You</div>
              </motion.div>

              {/* Status Badge */}
              <div className="absolute left-4 top-4">
                <Badge className="bg-emerald-500/90 text-white">
                  <span className="mr-1.5 h-2 w-2 animate-pulse rounded-full bg-white" />
                  Live
                </Badge>
              </div>

              {/* Duration */}
              <div className="absolute right-4 top-4 flex items-center gap-2 rounded-lg bg-black/50 px-3 py-1.5 text-sm text-white backdrop-blur-sm">
                <Clock className="h-4 w-4" />
                <span>12:34</span>
              </div>

              {/* Fullscreen Button */}
              <button className="absolute right-4 top-14 rounded-lg bg-black/50 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/70">
                <Maximize2 className="h-4 w-4" />
              </button>
            </GlassCard>

            {/* Video Controls */}
            <div className="mt-4 flex items-center justify-center gap-3">
              <Button
                variant={isMicOn ? 'secondary' : 'destructive'}
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={() => setIsMicOn(!isMicOn)}
              >
                {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </Button>
              <Button
                variant={isVideoOn ? 'secondary' : 'destructive'}
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={() => setIsVideoOn(!isVideoOn)}
              >
                {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </Button>
              <Button variant="secondary" size="icon" className="h-12 w-12 rounded-full">
                <Monitor className="h-5 w-5" />
              </Button>
              <Button variant="destructive" size="icon" className="h-14 w-14 rounded-full">
                <Phone className="h-6 w-6 rotate-[135deg]" />
              </Button>
              <Button variant="secondary" size="icon" className="h-12 w-12 rounded-full">
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="secondary" size="icon" className="h-12 w-12 rounded-full">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Side Panel */}
          <div className="w-full lg:w-96">
            <GlassCard className="flex h-full flex-col p-0">
              <Tabs defaultValue="chat" className="flex h-full flex-col">
                <TabsList className="w-full rounded-none border-b">
                  <TabsTrigger value="chat" className="flex-1 gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Chat
                  </TabsTrigger>
                  <TabsTrigger value="prescription" className="flex-1 gap-2">
                    <FileText className="h-4 w-4" />
                    Prescription
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="chat" className="flex flex-1 flex-col p-0">
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.role === 'patient' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[80%] ${message.role === 'patient' ? 'order-2' : ''}`}>
                            <div className={`rounded-2xl px-4 py-2 ${
                              message.role === 'patient'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}>
                              <p className="text-sm">{message.content}</p>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">{message.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Type a message..."
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                      <Button size="icon" onClick={handleSendMessage}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="prescription" className="flex-1 p-4">
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-3 font-semibold">Digital Prescription Preview</h3>
                      <div className="rounded-lg border bg-card p-4">
                        <div className="mb-4 flex items-center justify-between border-b pb-4">
                          <div>
                            <p className="font-medium">{mockConsultation.doctor.name}</p>
                            <p className="text-sm text-muted-foreground">{mockConsultation.doctor.specialty}</p>
                          </div>
                          <Badge variant="secondary">
                            <Calendar className="mr-1 h-3 w-3" />
                            {new Date().toLocaleDateString()}
                          </Badge>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <h4 className="mb-2 text-sm font-medium">Medications</h4>
                            {prescriptionPreview.medications.map((med, index) => (
                              <div key={index} className="mb-2 rounded-lg bg-muted p-3">
                                <p className="font-medium">{med.name}</p>
                                <p className="text-sm text-muted-foreground">{med.dosage}</p>
                                <p className="text-xs text-muted-foreground">Duration: {med.duration}</p>
                              </div>
                            ))}
                          </div>

                          <div>
                            <h4 className="mb-2 text-sm font-medium">Doctor's Notes</h4>
                            <p className="text-sm text-muted-foreground">{prescriptionPreview.notes}</p>
                          </div>

                          <div>
                            <h4 className="mb-2 text-sm font-medium">Follow-up</h4>
                            <p className="text-sm text-muted-foreground">Recommended in {prescriptionPreview.followUp}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button className="w-full">
                      <FileText className="mr-2 h-4 w-4" />
                      Download Prescription
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </GlassCard>
          </div>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
