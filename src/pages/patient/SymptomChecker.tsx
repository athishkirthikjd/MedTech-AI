import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, ArrowRight, Check, AlertTriangle, Calendar,
  MessageSquare, User, Clock, ThermometerSun, Activity
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { PageTransition } from '@/components/ui/page-transition';
import { symptomCategories } from '@/lib/mock-data';

interface SymptomData {
  bodyArea: string;
  symptoms: string[];
  severity: number;
  duration: string;
  frequency: string;
  additionalInfo: string[];
}

const steps = [
  { id: 1, title: 'Body Area', description: 'Where do you feel discomfort?' },
  { id: 2, title: 'Symptoms', description: 'Select your symptoms' },
  { id: 3, title: 'Severity', description: 'How severe are your symptoms?' },
  { id: 4, title: 'Duration', description: 'How long have you had these symptoms?' },
  { id: 5, title: 'Summary', description: 'Review and get recommendations' },
];

const bodyAreas = [
  { id: 'head', label: 'Head & Neck', icon: '🧠' },
  { id: 'chest', label: 'Chest & Heart', icon: '❤️' },
  { id: 'abdomen', label: 'Abdomen & Digestive', icon: '🫁' },
  { id: 'limbs', label: 'Arms & Legs', icon: '💪' },
  { id: 'skin', label: 'Skin & Hair', icon: '🖐️' },
  { id: 'general', label: 'General / Whole Body', icon: '🧍' },
];

const symptomsByArea: Record<string, string[]> = {
  head: ['Headache', 'Dizziness', 'Blurred vision', 'Ear pain', 'Sore throat', 'Nasal congestion', 'Neck stiffness'],
  chest: ['Chest pain', 'Shortness of breath', 'Heart palpitations', 'Cough', 'Wheezing'],
  abdomen: ['Stomach pain', 'Nausea', 'Vomiting', 'Diarrhea', 'Constipation', 'Bloating', 'Loss of appetite'],
  limbs: ['Joint pain', 'Muscle ache', 'Numbness', 'Swelling', 'Weakness', 'Cramps'],
  skin: ['Rash', 'Itching', 'Dryness', 'Discoloration', 'Swelling', 'Bruising'],
  general: ['Fever', 'Fatigue', 'Chills', 'Night sweats', 'Weight loss', 'Insomnia'],
};

const durationOptions = [
  { value: 'today', label: 'Started today' },
  { value: '2-3days', label: '2-3 days' },
  { value: 'week', label: 'About a week' },
  { value: '2weeks', label: '2 weeks or more' },
  { value: 'month', label: 'Over a month' },
];

const frequencyOptions = [
  { value: 'constant', label: 'Constant' },
  { value: 'frequent', label: 'Frequently (several times a day)' },
  { value: 'occasional', label: 'Occasionally (once a day or less)' },
  { value: 'rare', label: 'Rarely (a few times a week)' },
];

export default function SymptomChecker() {
  const [currentStep, setCurrentStep] = useState(1);
  const [symptomData, setSymptomData] = useState<SymptomData>({
    bodyArea: '',
    symptoms: [],
    severity: 5,
    duration: '',
    frequency: '',
    additionalInfo: [],
  });

  const progress = (currentStep / steps.length) * 100;

  const canProceed = () => {
    switch (currentStep) {
      case 1: return symptomData.bodyArea !== '';
      case 2: return symptomData.symptoms.length > 0;
      case 3: return true;
      case 4: return symptomData.duration !== '' && symptomData.frequency !== '';
      default: return true;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length && canProceed()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getSeverityLabel = (value: number) => {
    if (value <= 3) return { label: 'Mild', color: 'text-emerald-600' };
    if (value <= 6) return { label: 'Moderate', color: 'text-amber-600' };
    return { label: 'Severe', color: 'text-red-600' };
  };

  const getRecommendation = () => {
    const severity = symptomData.severity;
    if (severity >= 8) {
      return {
        level: 'urgent',
        title: 'Seek Immediate Care',
        description: 'Based on your symptoms, we recommend consulting a doctor as soon as possible.',
        action: 'Book Emergency Appointment',
        href: '/patient/appointments',
      };
    }
    if (severity >= 5) {
      return {
        level: 'moderate',
        title: 'Schedule a Consultation',
        description: 'Your symptoms may require professional evaluation. Consider booking an appointment.',
        action: 'Book Appointment',
        href: '/patient/appointments',
      };
    }
    return {
      level: 'mild',
      title: 'Monitor Your Symptoms',
      description: 'Your symptoms appear mild. Rest and monitor. If symptoms worsen, consult a doctor.',
      action: 'Chat with AI Assistant',
      href: '/patient/chatbot',
    };
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <p className="text-center text-muted-foreground">Select the area where you're experiencing symptoms</p>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {bodyAreas.map((area) => (
                <motion.button
                  key={area.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSymptomData({ ...symptomData, bodyArea: area.id })}
                  className={`flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all ${
                    symptomData.bodyArea === area.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <span className="text-4xl">{area.icon}</span>
                  <span className="text-sm font-medium">{area.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <p className="text-center text-muted-foreground">Select all symptoms you're experiencing</p>
            <div className="grid gap-3 md:grid-cols-2">
              {symptomsByArea[symptomData.bodyArea]?.map((symptom) => (
                <label
                  key={symptom}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-all ${
                    symptomData.symptoms.includes(symptom)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Checkbox
                    checked={symptomData.symptoms.includes(symptom)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSymptomData({
                          ...symptomData,
                          symptoms: [...symptomData.symptoms, symptom],
                        });
                      } else {
                        setSymptomData({
                          ...symptomData,
                          symptoms: symptomData.symptoms.filter((s) => s !== symptom),
                        });
                      }
                    }}
                  />
                  <span className="text-sm">{symptom}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 3:
        const severityInfo = getSeverityLabel(symptomData.severity);
        return (
          <div className="space-y-8">
            <p className="text-center text-muted-foreground">Rate the severity of your symptoms</p>
            <div className="mx-auto max-w-md space-y-6">
              <div className="text-center">
                <span className={`text-5xl font-bold ${severityInfo.color}`}>
                  {symptomData.severity}
                </span>
                <p className={`mt-2 text-lg font-medium ${severityInfo.color}`}>
                  {severityInfo.label}
                </p>
              </div>
              <div className="px-4">
                <Slider
                  value={[symptomData.severity]}
                  onValueChange={([value]) => setSymptomData({ ...symptomData, severity: value })}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>Barely noticeable</span>
                  <span>Unbearable</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="font-medium">How long have you had these symptoms?</p>
              <RadioGroup
                value={symptomData.duration}
                onValueChange={(value) => setSymptomData({ ...symptomData, duration: value })}
                className="grid gap-3 md:grid-cols-2"
              >
                {durationOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-all ${
                      symptomData.duration === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value={option.value} />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <p className="font-medium">How often do you experience these symptoms?</p>
              <RadioGroup
                value={symptomData.frequency}
                onValueChange={(value) => setSymptomData({ ...symptomData, frequency: value })}
                className="grid gap-3 md:grid-cols-2"
              >
                {frequencyOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-all ${
                      symptomData.frequency === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value={option.value} />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>
          </div>
        );

      case 5:
        const recommendation = getRecommendation();
        return (
          <div className="space-y-6">
            {/* Summary Card */}
            <GlassCard className="p-6">
              <h3 className="mb-4 text-lg font-semibold">Your Symptom Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Body Area</p>
                    <p className="font-medium capitalize">{symptomData.bodyArea}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Symptoms</p>
                    <p className="font-medium">{symptomData.symptoms.join(', ')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <ThermometerSun className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Severity</p>
                    <p className={`font-medium ${getSeverityLabel(symptomData.severity).color}`}>
                      {symptomData.severity}/10 - {getSeverityLabel(symptomData.severity).label}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration & Frequency</p>
                    <p className="font-medium">
                      {durationOptions.find((d) => d.value === symptomData.duration)?.label},{' '}
                      {frequencyOptions.find((f) => f.value === symptomData.frequency)?.label}
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Recommendation Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl border-2 p-6 ${
                recommendation.level === 'urgent'
                  ? 'border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20'
                  : recommendation.level === 'moderate'
                  ? 'border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/20'
                  : 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-900/20'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`rounded-full p-2 ${
                  recommendation.level === 'urgent'
                    ? 'bg-red-100 text-red-600 dark:bg-red-900/30'
                    : recommendation.level === 'moderate'
                    ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30'
                    : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30'
                }`}>
                  {recommendation.level === 'urgent' ? (
                    <AlertTriangle className="h-6 w-6" />
                  ) : recommendation.level === 'moderate' ? (
                    <Calendar className="h-6 w-6" />
                  ) : (
                    <MessageSquare className="h-6 w-6" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold">{recommendation.title}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">{recommendation.description}</p>
                  <Link to={recommendation.href}>
                    <Button className="mt-4" variant={recommendation.level === 'urgent' ? 'destructive' : 'default'}>
                      {recommendation.action}
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Disclaimer */}
            <p className="text-center text-xs text-muted-foreground">
              This assessment is for informational purposes only and does not constitute medical advice. 
              Always consult a healthcare professional for proper diagnosis and treatment.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold">Symptom Checker</h1>
            <p className="mt-1 text-muted-foreground">
              Answer a few questions to help us understand your symptoms
            </p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="mb-2 flex justify-between text-sm">
              <span className="font-medium">{steps[currentStep - 1].title}</span>
              <span className="text-muted-foreground">Step {currentStep} of {steps.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Indicators */}
          <div className="mb-8 hidden md:flex md:justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-medium transition-colors ${
                  currentStep > step.id
                    ? 'border-primary bg-primary text-primary-foreground'
                    : currentStep === step.id
                    ? 'border-primary text-primary'
                    : 'border-border text-muted-foreground'
                }`}>
                  {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
                </div>
                {index < steps.length - 1 && (
                  <div className={`mx-2 h-0.5 w-16 ${
                    currentStep > step.id ? 'bg-primary' : 'bg-border'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Content */}
          <GlassCard className="p-6 md:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </GlassCard>

          {/* Navigation */}
          <div className="mt-6 flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            {currentStep < steps.length ? (
              <Button onClick={handleNext} disabled={!canProceed()} className="gap-2">
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Link to="/patient/chatbot">
                <Button className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Discuss with AI
                </Button>
              </Link>
            )}
          </div>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
