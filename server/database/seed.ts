import { getDatabase, initializeDatabase, saveDatabase } from './index';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const doctors = [
  {
    id: "d1",
    name: "Dr. Sarah Ahmed",
    specialty: "general",
    hospital: "City Medical Center",
    location: "Downtown, Building A",
    rating: 4.8,
    reviewCount: 124,
    experience: 12,
    fee: 50,
    currency: "USD",
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday"],
    bio: "Dr. Sarah Ahmed is a board-certified general practitioner with over 12 years of experience. She specializes in preventive care and chronic disease management.",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop"
  },
  {
    id: "d2",
    name: "Dr. Michael Chen",
    specialty: "cardiology",
    hospital: "Heart & Vascular Institute",
    location: "Medical District, Tower B",
    rating: 4.9,
    reviewCount: 89,
    experience: 18,
    fee: 120,
    currency: "USD",
    availableDays: ["Monday", "Wednesday", "Friday"],
    bio: "Dr. Michael Chen is a leading cardiologist specializing in interventional cardiology and heart failure management. He has performed over 2000 cardiac procedures.",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop"
  },
  {
    id: "d3",
    name: "Dr. Emily Watson",
    specialty: "dermatology",
    hospital: "Skin Care Clinic",
    location: "Westside Medical Plaza",
    rating: 4.7,
    reviewCount: 156,
    experience: 8,
    fee: 80,
    currency: "USD",
    availableDays: ["Tuesday", "Thursday", "Saturday"],
    bio: "Dr. Emily Watson is a dermatologist specializing in medical and cosmetic dermatology. She treats conditions ranging from acne to skin cancer.",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop"
  },
  {
    id: "d4",
    name: "Dr. James Wilson",
    specialty: "pediatrics",
    hospital: "Children's Health Center",
    location: "Family Medical Complex",
    rating: 4.9,
    reviewCount: 203,
    experience: 15,
    fee: 60,
    currency: "USD",
    availableDays: ["Monday", "Tuesday", "Thursday", "Friday"],
    bio: "Dr. James Wilson is a compassionate pediatrician dedicated to providing comprehensive care for children from birth through adolescence.",
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop"
  },
  {
    id: "d5",
    name: "Dr. Lisa Park",
    specialty: "orthopedics",
    hospital: "Sports Medicine Center",
    location: "Athletic Medical Building",
    rating: 4.6,
    reviewCount: 78,
    experience: 10,
    fee: 100,
    currency: "USD",
    availableDays: ["Monday", "Wednesday", "Thursday"],
    bio: "Dr. Lisa Park specializes in sports medicine and orthopedic surgery. She works with athletes and active individuals to treat and prevent injuries.",
    image: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=400&h=400&fit=crop"
  },
  {
    id: "d6",
    name: "Dr. Robert Martinez",
    specialty: "general",
    hospital: "Community Health Clinic",
    location: "Eastside Medical Center",
    rating: 4.5,
    reviewCount: 167,
    experience: 20,
    fee: 45,
    currency: "USD",
    availableDays: ["Monday", "Tuesday", "Wednesday", "Friday"],
    bio: "Dr. Robert Martinez has been serving the community for over 20 years. He focuses on family medicine and preventive healthcare.",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop"
  },
  {
    id: "d7",
    name: "Dr. Anna Kowalski",
    specialty: "cardiology",
    hospital: "Heart & Vascular Institute",
    location: "Medical District, Tower B",
    rating: 4.8,
    reviewCount: 92,
    experience: 14,
    fee: 110,
    currency: "USD",
    availableDays: ["Tuesday", "Thursday", "Friday"],
    bio: "Dr. Anna Kowalski specializes in preventive cardiology and cardiac imaging. She is passionate about heart disease prevention in women.",
    image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop"
  },
  {
    id: "d8",
    name: "Dr. David Thompson",
    specialty: "dermatology",
    hospital: "Advanced Dermatology Center",
    location: "Downtown Medical Tower",
    rating: 4.7,
    reviewCount: 134,
    experience: 11,
    fee: 90,
    currency: "USD",
    availableDays: ["Monday", "Wednesday", "Friday"],
    bio: "Dr. David Thompson is an expert in treating complex skin conditions and performing advanced cosmetic procedures.",
    image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop"
  },
  {
    id: "d9",
    name: "Dr. Maria Garcia",
    specialty: "pediatrics",
    hospital: "Children's Health Center",
    location: "Family Medical Complex",
    rating: 4.8,
    reviewCount: 178,
    experience: 9,
    fee: 55,
    currency: "USD",
    availableDays: ["Monday", "Tuesday", "Thursday", "Saturday"],
    bio: "Dr. Maria Garcia is a pediatrician with special interest in childhood development and behavioral health.",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=faces"
  },
  {
    id: "d10",
    name: "Dr. John Miller",
    specialty: "orthopedics",
    hospital: "Joint & Spine Center",
    location: "Surgical Specialists Building",
    rating: 4.9,
    reviewCount: 145,
    experience: 22,
    fee: 130,
    currency: "USD",
    availableDays: ["Tuesday", "Wednesday", "Friday"],
    bio: "Dr. John Miller is a highly experienced orthopedic surgeon specializing in joint replacement and spine surgery.",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=faces"
  }
];

const appointments = [
  {
    id: "a1",
    doctorId: "d1",
    doctorName: "Dr. Sarah Ahmed",
    patientName: "John Smith",
    patientEmail: "john.smith@email.com",
    patientPhone: "+1 555-0101",
    date: "2026-01-20",
    time: "09:00",
    reason: "Annual checkup and blood pressure monitoring",
    status: "pending",
  },
  {
    id: "a2",
    doctorId: "d2",
    doctorName: "Dr. Michael Chen",
    patientName: "Emma Johnson",
    patientEmail: "emma.j@email.com",
    patientPhone: "+1 555-0102",
    date: "2026-01-22",
    time: "14:00",
    reason: "Follow-up after ECG results",
    status: "confirmed",
  },
  {
    id: "a3",
    doctorId: "d1",
    doctorName: "Dr. Sarah Ahmed",
    patientName: "Michael Brown",
    patientEmail: "m.brown@email.com",
    patientPhone: "+1 555-0103",
    date: "2026-01-21",
    time: "11:00",
    reason: "Persistent cough for 2 weeks",
    status: "pending",
  },
  {
    id: "a4",
    doctorId: "d4",
    doctorName: "Dr. James Wilson",
    patientName: "Sarah Davis",
    patientEmail: "sarah.d@email.com",
    patientPhone: "+1 555-0104",
    date: "2026-01-23",
    time: "10:00",
    reason: "Child vaccination appointment",
    status: "pending",
  }
];

export async function seedDatabase(): Promise<void> {
  console.log('🌱 Starting database seed...');
  
  // Initialize database schema
  await initializeDatabase();
  
  const db = await getDatabase();
  
  const scalarCount = (sql: string): number => {
    const res = db.exec(sql);
    return res.length > 0 && res[0].values.length > 0 ? (res[0].values[0][0] as number) : 0;
  };

  const escapeSqlString = (value: string) => value.replace(/'/g, "''");
  const userExistsByEmail = (email: string): boolean => {
    const safe = escapeSqlString(email);
    const res = db.exec(`SELECT 1 FROM users WHERE email='${safe}' LIMIT 1`);
    return res.length > 0 && res[0].values.length > 0;
  };

  const doctorsCount = scalarCount('SELECT COUNT(*) as count FROM doctors');
  const usersCount = scalarCount('SELECT COUNT(*) as count FROM users');
  const appointmentsCount = scalarCount('SELECT COUNT(*) as count FROM appointments');
  const schedulesCount = scalarCount('SELECT COUNT(*) as count FROM schedules');
  
  // Insert doctors
  if (doctorsCount === 0) {
    for (const doctor of doctors) {
      db.run(
        `INSERT INTO doctors (id, name, specialty, hospital, location, rating, review_count, experience, fee, currency, available_days, bio, image)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          doctor.id,
          doctor.name,
          doctor.specialty,
          doctor.hospital,
          doctor.location,
          doctor.rating,
          doctor.reviewCount,
          doctor.experience,
          doctor.fee,
          doctor.currency,
          JSON.stringify(doctor.availableDays),
          doctor.bio,
          doctor.image
        ]
      );
    }
    console.log(`✓ Inserted ${doctors.length} doctors`);
  } else {
    console.log('✓ Doctors already exist, skipping doctor seed...');
  }
  
  // Insert test users
  const ensureUser = async (params: {
    name: string;
    email: string;
    passwordPlain: string;
    role: 'patient' | 'doctor';
    doctorId: string | null;
  }) => {
    if (userExistsByEmail(params.email)) return;
    const hashedPassword = await bcrypt.hash(params.passwordPlain, 10);
    db.run(
      `INSERT INTO users (id, name, email, password, role, doctor_id) VALUES (?, ?, ?, ?, ?, ?)`,
      [uuidv4(), params.name, params.email, hashedPassword, params.role, params.doctorId]
    );
  };

  // Keep existing test users AND add the UI demo credentials
  await ensureUser({
    name: 'Test Patient',
    email: 'patient@test.com',
    passwordPlain: 'Test1234',
    role: 'patient',
    doctorId: null,
  });

  await ensureUser({
    name: 'Dr. Sarah Ahmed',
    email: 'doctor@test.com',
    passwordPlain: 'Test1234',
    role: 'doctor',
    doctorId: 'd1',
  });

  await ensureUser({
    name: 'John Doe',
    email: 'john@example.com',
    passwordPlain: 'password123',
    role: 'patient',
    doctorId: null,
  });

  await ensureUser({
    name: 'Dr. Sarah Ahmed',
    email: 'dr.ahmed@medbook.com',
    passwordPlain: 'doctor123',
    role: 'doctor',
    doctorId: 'd1',
  });

  console.log('✓ Ensured demo users exist');
  
  // Insert appointments
  if (appointmentsCount === 0) {
    for (const appointment of appointments) {
      db.run(
        `INSERT INTO appointments (id, doctor_id, doctor_name, patient_name, patient_email, patient_phone, date, time, reason, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          appointment.id,
          appointment.doctorId,
          appointment.doctorName,
          appointment.patientName,
          appointment.patientEmail,
          appointment.patientPhone,
          appointment.date,
          appointment.time,
          appointment.reason,
          appointment.status
        ]
      );
    }
    console.log(`✓ Inserted ${appointments.length} appointments`);
  } else {
    console.log('✓ Appointments already exist, skipping appointment seed...');
  }

  // Insert schedules based on doctor availability
  if (schedulesCount === 0) {
    const dayIndexMap: Record<string, number> = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };

    for (const doctor of doctors) {
      for (const dayName of doctor.availableDays) {
        const dayIndex = dayIndexMap[dayName];
        if (dayIndex === undefined) continue;

        db.run(
          `INSERT INTO schedules (id, doctor_id, day_of_week, start_time, end_time, slot_duration, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [uuidv4(), doctor.id, dayIndex, '09:00', '17:00', 30, 1]
        );
      }
    }
    console.log('✓ Seeded doctor schedules');
  } else {
    console.log('✓ Schedules already exist, skipping schedule seed...');
  }
  
  saveDatabase();
  console.log('✓ Database seeded successfully!');
}

// Run seed if this file is executed directly
seedDatabase().catch(console.error);
