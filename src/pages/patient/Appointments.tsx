import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Star, Clock, MapPin, Video, Calendar,
  ChevronLeft, ChevronRight, Check, X
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/ui/page-transition';
import { doctors, departments, timeSlots } from '@/lib/mock-data';

export default function Appointments() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<typeof doctors[0] | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookingComplete, setBookingComplete] = useState(false);

  const currentDate = new Date();
  const [viewMonth, setViewMonth] = useState(currentDate.getMonth());
  const [viewYear, setViewYear] = useState(currentDate.getFullYear());

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = !selectedDepartment || doctor.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(viewMonth, viewYear);
    const firstDay = getFirstDayOfMonth(viewMonth, viewYear);
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const isDateSelectable = (day: number) => {
    const date = new Date(viewYear, viewMonth, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today && date.getDay() !== 0; // Not past and not Sunday
  };

  const handleBookAppointment = () => {
    setBookingComplete(true);
    setTimeout(() => {
      setBookingComplete(false);
      setSelectedDoctor(null);
      setSelectedDate(null);
      setSelectedSlot(null);
    }, 3000);
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold">Book an Appointment</h1>
            <p className="text-muted-foreground">Find and book appointments with our specialists</p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search doctors or specialties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Department Filter */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={!selectedDepartment ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedDepartment(null)}
            >
              All Departments
            </Badge>
            {departments.map((dept) => (
              <Badge
                key={dept.id}
                variant={selectedDepartment === dept.id ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedDepartment(dept.id)}
              >
                {dept.name}
              </Badge>
            ))}
          </div>

          {/* Doctor List */}
          <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDoctors.map((doctor) => (
              <StaggerItem key={doctor.id}>
                <GlassCard hover className="p-4">
                  <div className="flex gap-4">
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="h-20 w-20 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{doctor.name}</h3>
                      <p className="text-sm text-primary">{doctor.specialty}</p>
                      <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span>{doctor.rating}</span>
                        <span>•</span>
                        <span>{doctor.experience}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{doctor.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex gap-2">
                      {doctor.availableSlots.includes('video') && (
                        <Badge variant="secondary" className="gap-1">
                          <Video className="h-3 w-3" />
                          Video
                        </Badge>
                      )}
                      {doctor.availableSlots.includes('clinic') && (
                        <Badge variant="secondary">In-Clinic</Badge>
                      )}
                    </div>
                    <Button size="sm" onClick={() => setSelectedDoctor(doctor)}>
                      Book
                    </Button>
                  </div>
                </GlassCard>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Booking Modal */}
          <Dialog open={!!selectedDoctor && !bookingComplete} onOpenChange={() => setSelectedDoctor(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Book Appointment</DialogTitle>
                <DialogDescription>
                  Select a date and time slot for your appointment
                </DialogDescription>
              </DialogHeader>

              {selectedDoctor && (
                <div className="space-y-6">
                  {/* Doctor Info */}
                  <div className="flex items-center gap-4 rounded-lg bg-muted p-4">
                    <img
                      src={selectedDoctor.image}
                      alt={selectedDoctor.name}
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                    <div>
                      <h3 className="font-semibold">{selectedDoctor.name}</h3>
                      <p className="text-sm text-primary">{selectedDoctor.specialty}</p>
                      <p className="text-sm text-muted-foreground">{selectedDoctor.location}</p>
                    </div>
                  </div>

                  {/* Calendar */}
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="font-medium">Select Date</h4>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (viewMonth === 0) {
                              setViewMonth(11);
                              setViewYear(viewYear - 1);
                            } else {
                              setViewMonth(viewMonth - 1);
                            }
                          }}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="min-w-[120px] text-center font-medium">
                          {monthNames[viewMonth]} {viewYear}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (viewMonth === 11) {
                              setViewMonth(0);
                              setViewYear(viewYear + 1);
                            } else {
                              setViewMonth(viewMonth + 1);
                            }
                          }}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className="py-2 text-xs font-medium text-muted-foreground">
                          {day}
                        </div>
                      ))}
                      {generateCalendarDays().map((day, index) => (
                        <div key={index} className="aspect-square p-0.5">
                          {day && (
                            <button
                              disabled={!isDateSelectable(day)}
                              onClick={() => setSelectedDate(new Date(viewYear, viewMonth, day))}
                              className={`flex h-full w-full items-center justify-center rounded-lg text-sm transition-colors ${
                                selectedDate?.getDate() === day &&
                                selectedDate?.getMonth() === viewMonth &&
                                selectedDate?.getFullYear() === viewYear
                                  ? 'bg-primary text-primary-foreground'
                                  : isDateSelectable(day)
                                  ? 'hover:bg-muted'
                                  : 'cursor-not-allowed text-muted-foreground/50'
                              }`}
                            >
                              {day}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Time Slots */}
                  {selectedDate && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <h4 className="mb-3 font-medium">Select Time</h4>
                      <div className="grid grid-cols-4 gap-2 md:grid-cols-6">
                        {timeSlots.map((slot) => (
                          <button
                            key={slot.time}
                            disabled={!slot.available}
                            onClick={() => setSelectedSlot(slot.time)}
                            className={`rounded-lg border p-2 text-sm transition-colors ${
                              selectedSlot === slot.time
                                ? 'border-primary bg-primary text-primary-foreground'
                                : slot.available
                                ? 'border-border hover:border-primary'
                                : 'cursor-not-allowed border-border bg-muted text-muted-foreground'
                            }`}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Book Button */}
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setSelectedDoctor(null)}>
                      Cancel
                    </Button>
                    <Button
                      disabled={!selectedDate || !selectedSlot}
                      onClick={handleBookAppointment}
                    >
                      Confirm Booking
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Success Modal */}
          <Dialog open={bookingComplete} onOpenChange={() => setBookingComplete(false)}>
            <DialogContent className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30"
              >
                <Check className="h-10 w-10 text-emerald-600" />
              </motion.div>
              <DialogTitle className="text-xl">Appointment Booked!</DialogTitle>
              <DialogDescription>
                Your appointment has been successfully scheduled. You will receive a confirmation email shortly.
              </DialogDescription>
              <div className="rounded-lg bg-muted p-4 text-left">
                <p className="text-sm"><strong>Doctor:</strong> {selectedDoctor?.name}</p>
                <p className="text-sm"><strong>Date:</strong> {selectedDate?.toLocaleDateString()}</p>
                <p className="text-sm"><strong>Time:</strong> {selectedSlot}</p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
