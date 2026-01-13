import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Calendar,
  Clock,
  DollarSign,
  UserCheck,
  UserX,
  FileText,
  Plus,
  ChevronRight,
  Video,
  Phone,
  MessageSquare,
  Search,
  Filter,
  MoreVertical,
  Stethoscope,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { dashboardStats, doctorSchedule, medicines } from "@/lib/mock-data";
import { toast } from "@/hooks/use-toast";

// Mock patient queue
const patientQueue = [
  { id: 1, name: "Sarah Johnson", age: 34, reason: "Follow-up consultation", time: "10:00 AM", status: "waiting", priority: "normal", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" },
  { id: 2, name: "Michael Brown", age: 45, reason: "Chest pain evaluation", time: "10:30 AM", status: "in-progress", priority: "urgent", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
  { id: 3, name: "Emily Davis", age: 28, reason: "Annual checkup", time: "11:00 AM", status: "waiting", priority: "normal", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150" },
  { id: 4, name: "James Wilson", age: 52, reason: "Blood pressure monitoring", time: "11:30 AM", status: "waiting", priority: "normal", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" },
  { id: 5, name: "Lisa Anderson", age: 39, reason: "Medication review", time: "2:00 PM", status: "scheduled", priority: "normal", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150" },
];

const weekDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export default function DoctorDashboard() {
  const [selectedPatient, setSelectedPatient] = useState<typeof patientQueue[0] | null>(null);
  const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);
  const [schedule, setSchedule] = useState(doctorSchedule);
  const [prescription, setPrescription] = useState({
    diagnosis: "",
    medications: [{ name: "", dosage: "", frequency: "", duration: "" }],
    notes: "",
  });

  const stats = dashboardStats.doctor;

  const handleToggleDay = (day: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day as keyof typeof prev], available: !prev[day as keyof typeof prev].available }
    }));
    toast({
      title: "Schedule Updated",
      description: `${day.charAt(0).toUpperCase() + day.slice(1)} availability has been updated.`,
    });
  };

  const handleAddSlot = (day: string, slot: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { 
        ...prev[day as keyof typeof prev], 
        slots: [...prev[day as keyof typeof prev].slots, slot].sort() 
      }
    }));
  };

  const handleRemoveSlot = (day: string, slot: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { 
        ...prev[day as keyof typeof prev], 
        slots: prev[day as keyof typeof prev].slots.filter(s => s !== slot) 
      }
    }));
  };

  const handleAddMedication = () => {
    setPrescription(prev => ({
      ...prev,
      medications: [...prev.medications, { name: "", dosage: "", frequency: "", duration: "" }]
    }));
  };

  const handlePrescriptionSubmit = () => {
    toast({
      title: "Prescription Created",
      description: `Prescription has been sent to ${selectedPatient?.name}.`,
    });
    setIsPrescriptionOpen(false);
    setPrescription({
      diagnosis: "",
      medications: [{ name: "", dosage: "", frequency: "", duration: "" }],
      notes: "",
    });
  };

  const handlePatientAction = (patientId: number, action: string) => {
    toast({
      title: `Patient ${action}`,
      description: `Action completed successfully.`,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Doctor Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, Dr. James Wilson</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Video className="h-4 w-4" />
              Start Consultation
            </Button>
            <Dialog open={isPrescriptionOpen} onOpenChange={setIsPrescriptionOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <FileText className="h-4 w-4" />
                  Write Prescription
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Digital Prescription</DialogTitle>
                  <DialogDescription>
                    {selectedPatient ? `Creating prescription for ${selectedPatient.name}` : "Select a patient first"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  {/* Patient Selection */}
                  <div className="space-y-2">
                    <Label>Patient</Label>
                    <Select 
                      value={selectedPatient?.id.toString() || ""} 
                      onValueChange={(val) => setSelectedPatient(patientQueue.find(p => p.id === parseInt(val)) || null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patientQueue.map(patient => (
                          <SelectItem key={patient.id} value={patient.id.toString()}>
                            {patient.name} - {patient.reason}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Diagnosis */}
                  <div className="space-y-2">
                    <Label>Diagnosis</Label>
                    <Textarea
                      placeholder="Enter diagnosis..."
                      value={prescription.diagnosis}
                      onChange={(e) => setPrescription({ ...prescription, diagnosis: e.target.value })}
                    />
                  </div>

                  {/* Medications */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Medications</Label>
                      <Button variant="outline" size="sm" onClick={handleAddMedication}>
                        <Plus className="h-4 w-4 mr-1" /> Add Medication
                      </Button>
                    </div>
                    {prescription.medications.map((med, index) => (
                      <div key={index} className="grid grid-cols-4 gap-3 p-4 border rounded-lg">
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Medicine" />
                          </SelectTrigger>
                          <SelectContent>
                            {medicines.map(m => (
                              <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input placeholder="Dosage" />
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="once">Once daily</SelectItem>
                            <SelectItem value="twice">Twice daily</SelectItem>
                            <SelectItem value="thrice">Three times daily</SelectItem>
                            <SelectItem value="asneeded">As needed</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input placeholder="Duration" />
                      </div>
                    ))}
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label>Additional Notes</Label>
                    <Textarea
                      placeholder="Any special instructions or notes..."
                      value={prescription.notes}
                      onChange={(e) => setPrescription({ ...prescription, notes: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsPrescriptionOpen(false)}>Cancel</Button>
                  <Button onClick={handlePrescriptionSubmit}>Create Prescription</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Today's Appointments", value: stats.todayAppointments, icon: Calendar, color: "text-primary", bgColor: "bg-primary/10" },
            { title: "Total Patients", value: stats.totalPatients.toLocaleString(), icon: Users, color: "text-secondary", bgColor: "bg-secondary/10" },
            { title: "Pending Reviews", value: stats.pendingReviews, icon: FileText, color: "text-warning", bgColor: "bg-warning/10" },
            { title: "Monthly Earnings", value: `$${stats.monthlyEarnings.toLocaleString()}`, icon: DollarSign, color: "text-success", bgColor: "bg-success/10" },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="premium-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                        <Icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="queue" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="queue" className="gap-2">
              <Users className="h-4 w-4" />
              Patient Queue
            </TabsTrigger>
            <TabsTrigger value="schedule" className="gap-2">
              <Calendar className="h-4 w-4" />
              Schedule Management
            </TabsTrigger>
          </TabsList>

          {/* Patient Queue Tab */}
          <TabsContent value="queue" className="space-y-4">
            <Card className="premium-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Today's Patient Queue</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search patients..." className="pl-9 w-64" />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {patientQueue.map((patient) => (
                      <motion.div
                        key={patient.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex items-center justify-between p-4 rounded-xl border ${
                          patient.status === 'in-progress' ? 'border-primary bg-primary/5' : 'border-border'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={patient.avatar} />
                            <AvatarFallback>{patient.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{patient.name}</p>
                              {patient.priority === 'urgent' && (
                                <Badge variant="destructive" className="text-xs">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Urgent
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {patient.age} years • {patient.reason}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{patient.time}</span>
                              <Badge 
                                variant="outline" 
                                className={
                                  patient.status === 'in-progress' ? 'border-primary text-primary' :
                                  patient.status === 'waiting' ? 'border-warning text-warning' :
                                  'border-muted-foreground text-muted-foreground'
                                }
                              >
                                {patient.status === 'in-progress' ? 'In Progress' : 
                                 patient.status === 'waiting' ? 'Waiting' : 'Scheduled'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handlePatientAction(patient.id, "called")}
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handlePatientAction(patient.id, "video started")}
                          >
                            <Video className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handlePatientAction(patient.id, "messaged")}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => {
                              setSelectedPatient(patient);
                              setIsPrescriptionOpen(true);
                            }}
                          >
                            <Stethoscope className="h-4 w-4 mr-2" />
                            Consult
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handlePatientAction(patient.id, "checked in")}>
                                <UserCheck className="h-4 w-4 mr-2" />
                                Mark as Checked In
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePatientAction(patient.id, "completed")}>
                                <ChevronRight className="h-4 w-4 mr-2" />
                                Complete Visit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePatientAction(patient.id, "cancelled")} className="text-destructive">
                                <UserX className="h-4 w-4 mr-2" />
                                Cancel Appointment
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedule Management Tab */}
          <TabsContent value="schedule" className="space-y-4">
            <Card className="premium-card">
              <CardHeader>
                <CardTitle>Weekly Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {weekDays.map((day) => {
                    const daySchedule = schedule[day as keyof typeof schedule];
                    return (
                      <div key={day} className="flex items-start justify-between p-4 border rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="w-24">
                            <p className="font-medium capitalize">{day}</p>
                          </div>
                          <Switch
                            checked={daySchedule.available}
                            onCheckedChange={() => handleToggleDay(day)}
                          />
                          <span className="text-sm text-muted-foreground">
                            {daySchedule.available ? 'Available' : 'Not Available'}
                          </span>
                        </div>
                        {daySchedule.available && (
                          <div className="flex flex-wrap gap-2 max-w-md">
                            {daySchedule.slots.map((slot) => (
                              <Badge
                                key={slot}
                                variant="secondary"
                                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                                onClick={() => handleRemoveSlot(day, slot)}
                              >
                                {slot}
                                <span className="ml-1">×</span>
                              </Badge>
                            ))}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Badge variant="outline" className="cursor-pointer">
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add Slot
                                </Badge>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-sm">
                                <DialogHeader>
                                  <DialogTitle>Add Time Slot</DialogTitle>
                                  <DialogDescription>Add a new available time slot for {day}.</DialogDescription>
                                </DialogHeader>
                                <div className="py-4">
                                  <Select onValueChange={(val) => handleAddSlot(day, val)}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select time" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {["8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM"]
                                        .filter(slot => !daySchedule.slots.includes(slot))
                                        .map(slot => (
                                          <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                                        ))
                                      }
                                    </SelectContent>
                                  </Select>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
