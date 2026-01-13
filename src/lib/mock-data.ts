// MedTech AI Mock Data
// Realistic healthcare data for the entire application

// Users & Authentication
export const mockUsers = {
  patient: {
    id: "pat-001",
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    role: "patient",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    phone: "+1 (555) 123-4567",
    dateOfBirth: "1990-05-15",
    bloodType: "O+",
    allergies: ["Penicillin", "Peanuts"],
    emergencyContact: {
      name: "Michael Johnson",
      phone: "+1 (555) 987-6543",
      relationship: "Spouse",
    },
  },
  doctor: {
    id: "doc-001",
    name: "Dr. James Wilson",
    email: "dr.wilson@medtech.ai",
    role: "doctor",
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150",
    specialty: "Cardiology",
    experience: 15,
    rating: 4.9,
    patients: 2450,
    qualifications: ["MD", "FACC", "Board Certified"],
  },
  admin: {
    id: "adm-001",
    name: "Emily Chen",
    email: "emily.chen@medtech.ai",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150",
  },
};

// Doctors Database
export const doctors = [
  {
    id: "doc-001",
    name: "Dr. James Wilson",
    specialty: "Cardiology",
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150",
    rating: 4.9,
    reviews: 324,
    experience: 15,
    patients: 2450,
    nextAvailable: "Today, 2:00 PM",
    fee: 150,
    hospital: "MedTech Central Hospital",
    languages: ["English", "Spanish"],
    education: "Harvard Medical School",
    about: "Dr. Wilson is a board-certified cardiologist with over 15 years of experience in treating heart conditions.",
  },
  {
    id: "doc-002",
    name: "Dr. Sarah Miller",
    specialty: "Dermatology",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150",
    rating: 4.8,
    reviews: 256,
    experience: 12,
    patients: 1890,
    nextAvailable: "Tomorrow, 10:00 AM",
    fee: 120,
    hospital: "MedTech Skin Center",
    languages: ["English"],
    education: "Stanford University",
    about: "Dr. Miller specializes in medical and cosmetic dermatology with expertise in skin cancer detection.",
  },
  {
    id: "doc-003",
    name: "Dr. Michael Chen",
    specialty: "Neurology",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150",
    rating: 4.9,
    reviews: 412,
    experience: 20,
    patients: 3200,
    nextAvailable: "Today, 4:30 PM",
    fee: 200,
    hospital: "MedTech Neuro Institute",
    languages: ["English", "Mandarin"],
    education: "Johns Hopkins University",
    about: "Dr. Chen is a renowned neurologist specializing in movement disorders and neurological rehabilitation.",
  },
  {
    id: "doc-004",
    name: "Dr. Emily Rodriguez",
    specialty: "Pediatrics",
    avatar: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=150",
    rating: 4.95,
    reviews: 567,
    experience: 10,
    patients: 4500,
    nextAvailable: "Today, 11:00 AM",
    fee: 100,
    hospital: "MedTech Children's Center",
    languages: ["English", "Spanish", "Portuguese"],
    education: "Columbia University",
    about: "Dr. Rodriguez is a compassionate pediatrician dedicated to providing comprehensive care for children.",
  },
  {
    id: "doc-005",
    name: "Dr. David Kim",
    specialty: "Orthopedics",
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150",
    rating: 4.7,
    reviews: 289,
    experience: 18,
    patients: 2100,
    nextAvailable: "Tomorrow, 9:00 AM",
    fee: 175,
    hospital: "MedTech Bone & Joint Center",
    languages: ["English", "Korean"],
    education: "UCLA Medical School",
    about: "Dr. Kim is an orthopedic surgeon specializing in sports medicine and joint replacement surgery.",
  },
  {
    id: "doc-006",
    name: "Dr. Lisa Thompson",
    specialty: "Psychiatry",
    avatar: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150",
    rating: 4.85,
    reviews: 198,
    experience: 14,
    patients: 1650,
    nextAvailable: "Today, 3:00 PM",
    fee: 180,
    hospital: "MedTech Mental Health Center",
    languages: ["English", "French"],
    education: "Yale School of Medicine",
    about: "Dr. Thompson provides compassionate mental health care with expertise in anxiety and mood disorders.",
  },
];

// Departments
export const departments = [
  { id: "dept-1", name: "Cardiology", icon: "Heart", color: "text-red-500", count: 12 },
  { id: "dept-2", name: "Dermatology", icon: "Sparkles", color: "text-pink-500", count: 8 },
  { id: "dept-3", name: "Neurology", icon: "Brain", color: "text-purple-500", count: 6 },
  { id: "dept-4", name: "Pediatrics", icon: "Baby", color: "text-blue-500", count: 15 },
  { id: "dept-5", name: "Orthopedics", icon: "Bone", color: "text-orange-500", count: 10 },
  { id: "dept-6", name: "Psychiatry", icon: "Brain", color: "text-teal-500", count: 7 },
  { id: "dept-7", name: "General Medicine", icon: "Stethoscope", color: "text-green-500", count: 20 },
  { id: "dept-8", name: "Ophthalmology", icon: "Eye", color: "text-cyan-500", count: 5 },
  { id: "dept-9", name: "ENT", icon: "Ear", color: "text-amber-500", count: 6 },
  { id: "dept-10", name: "Gynecology", icon: "Heart", color: "text-rose-500", count: 9 },
];

// Appointments
export const appointments = [
  {
    id: "apt-001",
    patientId: "pat-001",
    doctorId: "doc-001",
    doctorName: "Dr. James Wilson",
    doctorSpecialty: "Cardiology",
    doctorAvatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150",
    date: "2024-01-15",
    time: "10:00 AM",
    type: "In-Person",
    status: "upcoming",
    reason: "Annual heart checkup",
  },
  {
    id: "apt-002",
    patientId: "pat-001",
    doctorId: "doc-004",
    doctorName: "Dr. Emily Rodriguez",
    doctorSpecialty: "Pediatrics",
    doctorAvatar: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=150",
    date: "2024-01-18",
    time: "2:30 PM",
    type: "Video Call",
    status: "upcoming",
    reason: "Follow-up consultation",
  },
  {
    id: "apt-003",
    patientId: "pat-001",
    doctorId: "doc-002",
    doctorName: "Dr. Sarah Miller",
    doctorSpecialty: "Dermatology",
    doctorAvatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150",
    date: "2024-01-10",
    time: "11:00 AM",
    type: "In-Person",
    status: "completed",
    reason: "Skin examination",
  },
];

// Prescriptions
export const prescriptions = [
  {
    id: "rx-001",
    doctorName: "Dr. James Wilson",
    doctorSpecialty: "Cardiology",
    date: "2024-01-10",
    medications: [
      { name: "Lisinopril", dosage: "10mg", frequency: "Once daily", duration: "30 days" },
      { name: "Aspirin", dosage: "81mg", frequency: "Once daily", duration: "30 days" },
    ],
    diagnosis: "Hypertension Stage 1",
    notes: "Continue with low-sodium diet and regular exercise",
  },
  {
    id: "rx-002",
    doctorName: "Dr. Sarah Miller",
    doctorSpecialty: "Dermatology",
    date: "2024-01-08",
    medications: [
      { name: "Tretinoin Cream", dosage: "0.025%", frequency: "Once at night", duration: "60 days" },
    ],
    diagnosis: "Acne vulgaris",
    notes: "Apply to affected areas. Use sunscreen during the day.",
  },
];

// Lab Reports
export const labReports = [
  {
    id: "lab-001",
    name: "Complete Blood Count (CBC)",
    date: "2024-01-12",
    status: "completed",
    orderedBy: "Dr. James Wilson",
    results: [
      { parameter: "Hemoglobin", value: "14.2", unit: "g/dL", normalRange: "12.0-16.0", status: "normal" },
      { parameter: "WBC Count", value: "7500", unit: "/μL", normalRange: "4000-11000", status: "normal" },
      { parameter: "Platelet Count", value: "250000", unit: "/μL", normalRange: "150000-400000", status: "normal" },
      { parameter: "RBC Count", value: "4.8", unit: "M/μL", normalRange: "4.5-5.5", status: "normal" },
    ],
  },
  {
    id: "lab-002",
    name: "Lipid Panel",
    date: "2024-01-12",
    status: "completed",
    orderedBy: "Dr. James Wilson",
    results: [
      { parameter: "Total Cholesterol", value: "195", unit: "mg/dL", normalRange: "<200", status: "normal" },
      { parameter: "LDL", value: "115", unit: "mg/dL", normalRange: "<100", status: "high" },
      { parameter: "HDL", value: "55", unit: "mg/dL", normalRange: ">40", status: "normal" },
      { parameter: "Triglycerides", value: "140", unit: "mg/dL", normalRange: "<150", status: "normal" },
    ],
  },
  {
    id: "lab-003",
    name: "Thyroid Panel",
    date: "2024-01-15",
    status: "pending",
    orderedBy: "Dr. Michael Chen",
    results: [],
  },
];

// Lab Tests Catalog
export const labTests = [
  { id: "test-1", name: "Complete Blood Count (CBC)", price: 45, duration: "4-6 hours", category: "Blood Tests" },
  { id: "test-2", name: "Lipid Panel", price: 65, duration: "4-6 hours", category: "Blood Tests" },
  { id: "test-3", name: "Thyroid Panel (TSH, T3, T4)", price: 85, duration: "24 hours", category: "Hormone Tests" },
  { id: "test-4", name: "HbA1c (Diabetes Test)", price: 55, duration: "4-6 hours", category: "Blood Tests" },
  { id: "test-5", name: "Liver Function Test", price: 75, duration: "24 hours", category: "Blood Tests" },
  { id: "test-6", name: "Kidney Function Test", price: 70, duration: "24 hours", category: "Blood Tests" },
  { id: "test-7", name: "Vitamin D Test", price: 60, duration: "24 hours", category: "Vitamin Tests" },
  { id: "test-8", name: "Vitamin B12 Test", price: 55, duration: "24 hours", category: "Vitamin Tests" },
  { id: "test-9", name: "Iron Studies", price: 80, duration: "24 hours", category: "Blood Tests" },
  { id: "test-10", name: "COVID-19 RT-PCR", price: 120, duration: "24-48 hours", category: "Infectious Disease" },
  { id: "test-11", name: "Urine Analysis", price: 30, duration: "2-4 hours", category: "Urine Tests" },
  { id: "test-12", name: "Allergy Panel", price: 150, duration: "3-5 days", category: "Allergy Tests" },
];

// Medicines/Pharmacy
export const medicines = [
  {
    id: "med-001",
    name: "Lisinopril 10mg",
    category: "Cardiovascular",
    manufacturer: "PharmaCorp",
    price: 15.99,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=150",
    inStock: true,
    requiresPrescription: true,
    description: "ACE inhibitor used to treat high blood pressure",
    dosageForm: "Tablet",
    quantity: "30 tablets",
  },
  {
    id: "med-002",
    name: "Metformin 500mg",
    category: "Diabetes",
    manufacturer: "HealthMeds",
    price: 12.99,
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=150",
    inStock: true,
    requiresPrescription: true,
    description: "Oral diabetes medicine that helps control blood sugar levels",
    dosageForm: "Tablet",
    quantity: "60 tablets",
  },
  {
    id: "med-003",
    name: "Vitamin D3 1000IU",
    category: "Vitamins",
    manufacturer: "NutriLife",
    price: 9.99,
    image: "https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=150",
    inStock: true,
    requiresPrescription: false,
    description: "Vitamin D supplement for bone health",
    dosageForm: "Softgel",
    quantity: "90 softgels",
  },
  {
    id: "med-004",
    name: "Omeprazole 20mg",
    category: "Gastrointestinal",
    manufacturer: "GastroHealth",
    price: 18.99,
    image: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=150",
    inStock: true,
    requiresPrescription: true,
    description: "Proton pump inhibitor for acid reflux and GERD",
    dosageForm: "Capsule",
    quantity: "30 capsules",
  },
  {
    id: "med-005",
    name: "Ibuprofen 400mg",
    category: "Pain Relief",
    manufacturer: "PainAway",
    price: 7.99,
    image: "https://images.unsplash.com/photo-1550572017-4fcdbb59cc32?w=150",
    inStock: true,
    requiresPrescription: false,
    description: "NSAID for pain relief and inflammation",
    dosageForm: "Tablet",
    quantity: "50 tablets",
  },
  {
    id: "med-006",
    name: "Cetirizine 10mg",
    category: "Allergy",
    manufacturer: "AllergyFree",
    price: 11.99,
    image: "https://images.unsplash.com/photo-1585435557343-3b348031d2e7?w=150",
    inStock: true,
    requiresPrescription: false,
    description: "Antihistamine for allergy relief",
    dosageForm: "Tablet",
    quantity: "30 tablets",
  },
];

// Vitals History
export const vitalsHistory = [
  { date: "2024-01-15", bloodPressure: { systolic: 122, diastolic: 78 }, heartRate: 72, spo2: 98, glucose: 95 },
  { date: "2024-01-14", bloodPressure: { systolic: 118, diastolic: 76 }, heartRate: 68, spo2: 99, glucose: 92 },
  { date: "2024-01-13", bloodPressure: { systolic: 125, diastolic: 82 }, heartRate: 75, spo2: 97, glucose: 98 },
  { date: "2024-01-12", bloodPressure: { systolic: 120, diastolic: 80 }, heartRate: 70, spo2: 98, glucose: 94 },
  { date: "2024-01-11", bloodPressure: { systolic: 128, diastolic: 84 }, heartRate: 78, spo2: 96, glucose: 102 },
  { date: "2024-01-10", bloodPressure: { systolic: 115, diastolic: 75 }, heartRate: 65, spo2: 99, glucose: 88 },
  { date: "2024-01-09", bloodPressure: { systolic: 130, diastolic: 85 }, heartRate: 80, spo2: 97, glucose: 105 },
];

// Chat Messages (AI Chatbot)
export const sampleChatMessages = [
  {
    id: "msg-1",
    role: "assistant",
    content: "Hello! I'm your MedTech AI assistant. How can I help you today? I can assist with booking appointments, ordering medicines, scheduling lab tests, or answering health-related questions.",
    timestamp: new Date().toISOString(),
  },
];

// Symptom Categories
export const symptomCategories = [
  { id: "head", name: "Head & Face", icon: "Brain" },
  { id: "chest", name: "Chest & Heart", icon: "Heart" },
  { id: "abdomen", name: "Abdomen & Digestive", icon: "Pill" },
  { id: "limbs", name: "Arms & Legs", icon: "Hand" },
  { id: "skin", name: "Skin", icon: "Sparkles" },
  { id: "general", name: "General/Whole Body", icon: "Activity" },
];

// Common Symptoms
export const symptoms = [
  { id: "headache", name: "Headache", category: "head", severity: ["mild", "moderate", "severe"] },
  { id: "dizziness", name: "Dizziness", category: "head", severity: ["mild", "moderate", "severe"] },
  { id: "chest-pain", name: "Chest Pain", category: "chest", severity: ["mild", "moderate", "severe"] },
  { id: "shortness-of-breath", name: "Shortness of Breath", category: "chest", severity: ["mild", "moderate", "severe"] },
  { id: "abdominal-pain", name: "Abdominal Pain", category: "abdomen", severity: ["mild", "moderate", "severe"] },
  { id: "nausea", name: "Nausea", category: "abdomen", severity: ["mild", "moderate", "severe"] },
  { id: "joint-pain", name: "Joint Pain", category: "limbs", severity: ["mild", "moderate", "severe"] },
  { id: "rash", name: "Skin Rash", category: "skin", severity: ["mild", "moderate", "severe"] },
  { id: "fever", name: "Fever", category: "general", severity: ["mild", "moderate", "severe"] },
  { id: "fatigue", name: "Fatigue", category: "general", severity: ["mild", "moderate", "severe"] },
];

// Dashboard Stats
export const dashboardStats = {
  patient: {
    upcomingAppointments: 2,
    activePrescriptions: 3,
    pendingLabResults: 1,
    walletBalance: 250.00,
  },
  doctor: {
    todayAppointments: 8,
    totalPatients: 2450,
    pendingReviews: 5,
    monthlyEarnings: 12500,
  },
  admin: {
    totalPatients: 15420,
    totalDoctors: 86,
    appointmentsToday: 342,
    monthlyRevenue: 485000,
    newPatientsThisMonth: 523,
    pendingApprovals: 12,
  },
};

// Chart Data
export const appointmentChartData = [
  { month: "Jan", appointments: 45 },
  { month: "Feb", appointments: 52 },
  { month: "Mar", appointments: 48 },
  { month: "Apr", appointments: 61 },
  { month: "May", appointments: 55 },
  { month: "Jun", appointments: 67 },
];

export const revenueChartData = [
  { month: "Jan", revenue: 42000 },
  { month: "Feb", revenue: 48000 },
  { month: "Mar", revenue: 45000 },
  { month: "Apr", revenue: 55000 },
  { month: "May", revenue: 52000 },
  { month: "Jun", revenue: 61000 },
];

export const patientGrowthData = [
  { month: "Jan", patients: 12500 },
  { month: "Feb", patients: 13200 },
  { month: "Mar", patients: 13800 },
  { month: "Apr", patients: 14200 },
  { month: "May", patients: 14800 },
  { month: "Jun", patients: 15420 },
];

// Time Slots
export const timeSlots = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM",
];

// Testimonials
export const testimonials = [
  {
    id: 1,
    name: "Jennifer Martinez",
    role: "Patient",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    content: "MedTech AI has completely transformed how I manage my healthcare. The AI assistant helped me understand my symptoms and book the right specialist within minutes!",
    rating: 5,
  },
  {
    id: 2,
    name: "Dr. Robert Anderson",
    role: "Cardiologist",
    avatar: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150",
    content: "As a doctor, this platform has streamlined my practice significantly. The scheduling system and digital prescriptions save me hours every week.",
    rating: 5,
  },
  {
    id: 3,
    name: "Maria Thompson",
    role: "Hospital Administrator",
    avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150",
    content: "The analytics dashboard gives us incredible insights into hospital operations. We've improved patient satisfaction by 40% since implementing MedTech AI.",
    rating: 5,
  },
];

// Features for Landing Page
export const features = [
  {
    icon: "Bot",
    title: "AI-Powered Assistant",
    description: "Get instant guidance for symptoms, appointments, and medications through our intelligent chatbot.",
  },
  {
    icon: "Calendar",
    title: "Smart Scheduling",
    description: "Book appointments with the right specialists based on your symptoms and preferences.",
  },
  {
    icon: "Pill",
    title: "Digital Pharmacy",
    description: "Order medicines online with prescription verification and doorstep delivery.",
  },
  {
    icon: "TestTube",
    title: "Lab Test Booking",
    description: "Schedule lab tests, track results, and get home sample collection services.",
  },
  {
    icon: "FileText",
    title: "Health Records",
    description: "Access your complete medical history, prescriptions, and reports in one secure place.",
  },
  {
    icon: "Video",
    title: "Video Consultations",
    description: "Connect with doctors remotely through secure, high-quality video calls.",
  },
];

// How It Works Steps
export const howItWorksSteps = [
  {
    step: 1,
    title: "Describe Your Symptoms",
    description: "Use our AI assistant to describe how you're feeling or what health concern you have.",
  },
  {
    step: 2,
    title: "Get Smart Recommendations",
    description: "Our AI analyzes your input and suggests the best course of action - see a specialist, order tests, or get general guidance.",
  },
  {
    step: 3,
    title: "Book & Manage Care",
    description: "Seamlessly book appointments, order medications, or schedule lab tests all in one place.",
  },
  {
    step: 4,
    title: "Track Your Health",
    description: "Monitor your vitals, view results, and maintain your complete health record digitally.",
  },
];

// Audit Log (Admin)
export const auditLog = [
  { id: 1, action: "New patient registered", user: "System", timestamp: "2024-01-15 14:32:00", type: "info" },
  { id: 2, action: "Appointment cancelled", user: "Dr. Wilson", timestamp: "2024-01-15 13:15:00", type: "warning" },
  { id: 3, action: "Lab report uploaded", user: "Lab Tech", timestamp: "2024-01-15 12:45:00", type: "success" },
  { id: 4, action: "New doctor onboarded", user: "Admin", timestamp: "2024-01-15 11:20:00", type: "info" },
  { id: 5, action: "Payment received", user: "System", timestamp: "2024-01-15 10:55:00", type: "success" },
  { id: 6, action: "Failed login attempt", user: "Unknown", timestamp: "2024-01-15 10:30:00", type: "error" },
];

// Doctor Schedule Template
export const doctorSchedule = {
  monday: { available: true, slots: ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"] },
  tuesday: { available: true, slots: ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"] },
  wednesday: { available: true, slots: ["9:00 AM", "10:00 AM", "11:00 AM"] },
  thursday: { available: true, slots: ["2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"] },
  friday: { available: true, slots: ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM"] },
  saturday: { available: false, slots: [] },
  sunday: { available: false, slots: [] },
};
