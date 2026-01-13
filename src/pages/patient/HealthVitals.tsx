import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Heart, 
  Activity, 
  Droplets, 
  Gauge,
  Plus,
  Watch,
  TrendingUp,
  TrendingDown,
  Calendar,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { vitalsHistory } from "@/lib/mock-data";
import { toast } from "@/hooks/use-toast";

const vitalCards = [
  {
    id: "bp",
    title: "Blood Pressure",
    icon: Gauge,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    unit: "mmHg",
    getValue: (data: typeof vitalsHistory[0]) => `${data.bloodPressure.systolic}/${data.bloodPressure.diastolic}`,
    normal: "120/80",
    trend: -2,
  },
  {
    id: "hr",
    title: "Heart Rate",
    icon: Heart,
    color: "text-primary",
    bgColor: "bg-primary/10",
    unit: "bpm",
    getValue: (data: typeof vitalsHistory[0]) => data.heartRate.toString(),
    normal: "60-100",
    trend: 3,
  },
  {
    id: "spo2",
    title: "SpO₂",
    icon: Droplets,
    color: "text-info",
    bgColor: "bg-info/10",
    unit: "%",
    getValue: (data: typeof vitalsHistory[0]) => data.spo2.toString(),
    normal: "95-100",
    trend: 0,
  },
  {
    id: "glucose",
    title: "Blood Glucose",
    icon: Activity,
    color: "text-warning",
    bgColor: "bg-warning/10",
    unit: "mg/dL",
    getValue: (data: typeof vitalsHistory[0]) => data.glucose.toString(),
    normal: "70-100",
    trend: -5,
  },
];

export default function HealthVitals() {
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState("7days");
  const [manualEntry, setManualEntry] = useState({
    systolic: "",
    diastolic: "",
    heartRate: "",
    spo2: "",
    glucose: "",
  });

  const latestVitals = vitalsHistory[0];

  const chartData = vitalsHistory.map(v => ({
    date: new Date(v.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    bp: v.bloodPressure.systolic,
    heartRate: v.heartRate,
    spo2: v.spo2,
    glucose: v.glucose,
  })).reverse();

  const handleManualSubmit = () => {
    toast({
      title: "Vitals Recorded",
      description: "Your health vitals have been successfully recorded.",
    });
    setIsManualEntryOpen(false);
    setManualEntry({ systolic: "", diastolic: "", heartRate: "", spo2: "", glucose: "" });
  };

  const handleWearableSync = () => {
    toast({
      title: "Syncing Wearable...",
      description: "Connecting to your wearable device.",
    });
    setTimeout(() => {
      toast({
        title: "Sync Complete",
        description: "Latest data has been synced from your wearable device.",
      });
      setIsSyncDialogOpen(false);
    }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Health Vitals</h1>
            <p className="text-muted-foreground">Track and monitor your health metrics</p>
          </div>
          <div className="flex gap-3">
            <Dialog open={isSyncDialogOpen} onOpenChange={setIsSyncDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Watch className="h-4 w-4" />
                  Sync Wearable
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Sync Wearable Device</DialogTitle>
                  <DialogDescription>
                    Connect your wearable device to automatically sync health data.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex items-center gap-4 p-4 border rounded-xl">
                    <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Watch className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Apple Watch</p>
                      <p className="text-sm text-muted-foreground">Last synced: 2 hours ago</p>
                    </div>
                    <Badge variant="outline" className="text-success border-success">Connected</Badge>
                  </div>
                  <div className="flex items-center gap-4 p-4 border rounded-xl">
                    <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center">
                      <Watch className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Fitbit</p>
                      <p className="text-sm text-muted-foreground">Not connected</p>
                    </div>
                    <Button variant="outline" size="sm">Connect</Button>
                  </div>
                  <div className="flex items-center gap-4 p-4 border rounded-xl">
                    <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center">
                      <Watch className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Samsung Health</p>
                      <p className="text-sm text-muted-foreground">Not connected</p>
                    </div>
                    <Button variant="outline" size="sm">Connect</Button>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleWearableSync} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Sync Now
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isManualEntryOpen} onOpenChange={setIsManualEntryOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Manual Vitals Entry</DialogTitle>
                  <DialogDescription>
                    Record your health vitals manually.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="systolic">Systolic BP (mmHg)</Label>
                      <Input
                        id="systolic"
                        type="number"
                        placeholder="120"
                        value={manualEntry.systolic}
                        onChange={(e) => setManualEntry({ ...manualEntry, systolic: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="diastolic">Diastolic BP (mmHg)</Label>
                      <Input
                        id="diastolic"
                        type="number"
                        placeholder="80"
                        value={manualEntry.diastolic}
                        onChange={(e) => setManualEntry({ ...manualEntry, diastolic: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
                    <Input
                      id="heartRate"
                      type="number"
                      placeholder="72"
                      value={manualEntry.heartRate}
                      onChange={(e) => setManualEntry({ ...manualEntry, heartRate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spo2">SpO₂ (%)</Label>
                    <Input
                      id="spo2"
                      type="number"
                      placeholder="98"
                      value={manualEntry.spo2}
                      onChange={(e) => setManualEntry({ ...manualEntry, spo2: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="glucose">Blood Glucose (mg/dL)</Label>
                    <Input
                      id="glucose"
                      type="number"
                      placeholder="95"
                      value={manualEntry.glucose}
                      onChange={(e) => setManualEntry({ ...manualEntry, glucose: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsManualEntryOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleManualSubmit}>Save Entry</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Vitals Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {vitalCards.map((vital, index) => {
            const Icon = vital.icon;
            const value = vital.getValue(latestVitals);
            const TrendIcon = vital.trend > 0 ? TrendingUp : vital.trend < 0 ? TrendingDown : null;
            
            return (
              <motion.div
                key={vital.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="premium-card">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-xl ${vital.bgColor}`}>
                        <Icon className={`h-6 w-6 ${vital.color}`} />
                      </div>
                      {TrendIcon && (
                        <div className={`flex items-center gap-1 text-sm ${vital.trend > 0 ? 'text-destructive' : 'text-success'}`}>
                          <TrendIcon className="h-4 w-4" />
                          <span>{Math.abs(vital.trend)}%</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">{vital.title}</p>
                      <p className="text-3xl font-bold mt-1">{value}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {vital.unit} • Normal: {vital.normal}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Blood Pressure Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="premium-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-destructive" />
                  Blood Pressure Trend
                </CardTitle>
                <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">7 Days</SelectItem>
                    <SelectItem value="30days">30 Days</SelectItem>
                    <SelectItem value="90days">90 Days</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="bpGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis domain={[100, 140]} className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="bp" 
                      stroke="hsl(var(--destructive))" 
                      fill="url(#bpGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Heart Rate Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Heart Rate Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="hrGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis domain={[50, 100]} className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="heartRate" 
                      stroke="hsl(var(--primary))" 
                      fill="url(#hrGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* SpO2 Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-info" />
                  SpO₂ Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis domain={[90, 100]} className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="spo2" 
                      stroke="hsl(var(--info))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--info))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Glucose Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-warning" />
                  Blood Glucose Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="glucoseGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--warning))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--warning))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis domain={[70, 120]} className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="glucose" 
                      stroke="hsl(var(--warning))" 
                      fill="url(#glucoseGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Vitals History Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Readings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Blood Pressure</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Heart Rate</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">SpO₂</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Glucose</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vitalsHistory.map((record, index) => (
                      <tr key={index} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-3 px-4">
                          {new Date(record.date).toLocaleDateString("en-US", { 
                            month: "short", 
                            day: "numeric",
                            year: "numeric"
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="text-destructive border-destructive/30">
                            {record.bloodPressure.systolic}/{record.bloodPressure.diastolic} mmHg
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="text-primary border-primary/30">
                            {record.heartRate} bpm
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="text-info border-info/30">
                            {record.spo2}%
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="text-warning border-warning/30">
                            {record.glucose} mg/dL
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
