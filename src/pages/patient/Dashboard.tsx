import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Calendar, FileText, Pill, FlaskConical, MessageSquare, 
  CreditCard, TrendingUp, Clock, ChevronRight, Activity,
  Heart, Droplets, Thermometer
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { StatCounter } from '@/components/ui/animated-counter';
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/ui/page-transition';
import { useAuth } from '@/contexts/AuthContext';
import { 
  upcomingAppointments, 
  prescriptions, 
  labReports, 
  vitalsHistory,
  dashboardStats 
} from '@/lib/mock-data';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const chartData = [
  { name: 'Mon', appointments: 2, consultations: 1 },
  { name: 'Tue', appointments: 3, consultations: 2 },
  { name: 'Wed', appointments: 1, consultations: 1 },
  { name: 'Thu', appointments: 4, consultations: 3 },
  { name: 'Fri', appointments: 2, consultations: 2 },
  { name: 'Sat', appointments: 1, consultations: 0 },
  { name: 'Sun', appointments: 0, consultations: 0 },
];

const quickActions = [
  { icon: MessageSquare, label: 'AI Assistant', href: '/patient/chatbot', color: 'bg-primary' },
  { icon: Calendar, label: 'Book Appointment', href: '/patient/appointments', color: 'bg-secondary' },
  { icon: Pill, label: 'Order Medicine', href: '/patient/pharmacy', color: 'bg-emerald-500' },
  { icon: FlaskConical, label: 'Book Lab Test', href: '/patient/lab-tests', color: 'bg-amber-500' },
];

export default function PatientDashboard() {
  const { user } = useAuth();
  const latestVitals = vitalsHistory[0];

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="space-y-6">
          {/* Welcome Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-secondary p-6 text-white"
          >
            <div className="relative z-10">
              <h1 className="text-2xl font-bold">Welcome back, {user?.name || 'Patient'}! 👋</h1>
              <p className="mt-1 text-white/80">Here's your health summary for today</p>
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">2 Upcoming Appointments</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2">
                  <Pill className="h-4 w-4" />
                  <span className="text-sm">3 Active Prescriptions</span>
                </div>
              </div>
            </div>
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-10 -right-5 h-32 w-32 rounded-full bg-white/10" />
          </motion.div>

          {/* Quick Actions */}
          <StaggerContainer className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {quickActions.map((action, index) => (
              <StaggerItem key={action.label}>
                <Link to={action.href}>
                  <GlassCard hover className="flex flex-col items-center gap-3 p-4 text-center">
                    <div className={`rounded-xl ${action.color} p-3 text-white`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-medium">{action.label}</span>
                  </GlassCard>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Stats Row */}
          <div className="grid gap-4 md:grid-cols-4">
            {dashboardStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <StatCounter 
                        value={stat.value} 
                        className="text-2xl font-bold"
                      />
                    </div>
                    <div className={`rounded-lg p-2 ${
                      stat.trend === 'up' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' :
                      stat.trend === 'down' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      <TrendingUp className={`h-4 w-4 ${stat.trend === 'down' ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                  <p className={`mt-2 text-xs ${
                    stat.trend === 'up' ? 'text-emerald-600' :
                    stat.trend === 'down' ? 'text-red-600' :
                    'text-muted-foreground'
                  }`}>
                    {stat.change} from last month
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Vitals Summary */}
            <GlassCard className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">Today's Vitals</h3>
                <Link to="/patient/vitals" className="text-sm text-primary hover:underline">
                  View All
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                  <div className="flex items-center gap-2 text-red-600">
                    <Heart className="h-4 w-4" />
                    <span className="text-xs">Heart Rate</span>
                  </div>
                  <p className="mt-1 text-xl font-bold">{latestVitals.heartRate} <span className="text-sm font-normal">bpm</span></p>
                </div>
                <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                  <div className="flex items-center gap-2 text-blue-600">
                    <Activity className="h-4 w-4" />
                    <span className="text-xs">Blood Pressure</span>
                  </div>
                  <p className="mt-1 text-xl font-bold">{latestVitals.bloodPressure}</p>
                </div>
                <div className="rounded-lg bg-cyan-50 p-3 dark:bg-cyan-900/20">
                  <div className="flex items-center gap-2 text-cyan-600">
                    <Droplets className="h-4 w-4" />
                    <span className="text-xs">SpO₂</span>
                  </div>
                  <p className="mt-1 text-xl font-bold">{latestVitals.spO2}<span className="text-sm font-normal">%</span></p>
                </div>
                <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
                  <div className="flex items-center gap-2 text-amber-600">
                    <Thermometer className="h-4 w-4" />
                    <span className="text-xs">Glucose</span>
                  </div>
                  <p className="mt-1 text-xl font-bold">{latestVitals.glucose} <span className="text-sm font-normal">mg/dL</span></p>
                </div>
              </div>
            </GlassCard>

            {/* Upcoming Appointments */}
            <GlassCard className="p-6 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">Upcoming Appointments</h3>
                <Link to="/patient/appointments" className="text-sm text-primary hover:underline">
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {upcomingAppointments.slice(0, 3).map((apt) => (
                  <motion.div
                    key={apt.id}
                    whileHover={{ x: 4 }}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={apt.doctorImage}
                        alt={apt.doctorName}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium">{apt.doctorName}</p>
                        <p className="text-sm text-muted-foreground">{apt.specialty}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{apt.date}</p>
                      <p className="text-xs text-muted-foreground">{apt.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Activity Chart */}
            <GlassCard className="p-6">
              <h3 className="mb-4 font-semibold">Weekly Activity</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorAppointments" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="appointments"
                      stroke="hsl(var(--primary))"
                      fillOpacity={1}
                      fill="url(#colorAppointments)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            {/* Recent Prescriptions */}
            <GlassCard className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">Recent Prescriptions</h3>
                <Link to="/patient/records" className="text-sm text-primary hover:underline">
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {prescriptions.slice(0, 3).map((rx) => (
                  <div
                    key={rx.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <Pill className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{rx.medication}</p>
                        <p className="text-sm text-muted-foreground">{rx.dosage}</p>
                      </div>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs ${
                      rx.status === 'active' 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {rx.status}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
