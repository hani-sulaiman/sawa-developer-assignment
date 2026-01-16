import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', '..', 'medbook.db');

let db: SqlJsDatabase | null = null;

export async function getDatabase(): Promise<SqlJsDatabase> {
  if (db) return db;

  const SQL = await initSqlJs();
  
  try {
    // Try to load existing database
    if (fs.existsSync(dbPath)) {
      const buffer = fs.readFileSync(dbPath);
      db = new SQL.Database(buffer);
    } else {
      db = new SQL.Database();
    }
  } catch {
    db = new SQL.Database();
  }

  return db;
}

export function saveDatabase(): void {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

export async function initializeDatabase(): Promise<void> {
  const database = await getDatabase();

  // Enable foreign keys
  database.run('PRAGMA foreign_keys = ON');

  // Users table
  database.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('patient', 'doctor')),
      doctor_id TEXT,
      avatar_url TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Doctors table
  database.run(`
    CREATE TABLE IF NOT EXISTS doctors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      specialty TEXT NOT NULL CHECK (specialty IN ('general', 'cardiology', 'dermatology', 'pediatrics', 'orthopedics')),
      hospital TEXT NOT NULL,
      location TEXT NOT NULL,
      rating REAL NOT NULL DEFAULT 0,
      review_count INTEGER NOT NULL DEFAULT 0,
      experience INTEGER NOT NULL,
      fee REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      available_days TEXT NOT NULL,
      bio TEXT NOT NULL,
      image TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      is_active INTEGER DEFAULT 1
    )
  `);

  const doctorsTableInfo = database.exec('PRAGMA table_info(doctors)');
  if (doctorsTableInfo.length > 0) {
    const columns = doctorsTableInfo[0].values.map((row) => row[1] as string);
    if (!columns.includes('phone')) {
      database.run('ALTER TABLE doctors ADD COLUMN phone TEXT');
    }
  }

  // Appointments table
  database.run(`
    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      doctor_id TEXT NOT NULL,
      doctor_name TEXT NOT NULL,
      patient_id TEXT,
      patient_name TEXT NOT NULL,
      patient_email TEXT NOT NULL,
      patient_phone TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      reason TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'completed', 'cancelled')),
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Reviews table
  database.run(`
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      doctor_id TEXT NOT NULL,
      patient_id TEXT NOT NULL,
      patient_name TEXT NOT NULL,
      appointment_id TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(appointment_id)
    )
  `);

  // Favorites table
  database.run(`
    CREATE TABLE IF NOT EXISTS favorites (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      doctor_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(patient_id, doctor_id)
    )
  `);

  // Patient profiles table
  database.run(`
    CREATE TABLE IF NOT EXISTS patient_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      date_of_birth TEXT,
      gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
      blood_type TEXT CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
      allergies TEXT,
      medical_history TEXT,
      emergency_contact TEXT,
      emergency_phone TEXT,
      insurance_provider TEXT,
      insurance_number TEXT,
      address TEXT,
      phone TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Prescriptions table
  database.run(`
    CREATE TABLE IF NOT EXISTS prescriptions (
      id TEXT PRIMARY KEY,
      doctor_id TEXT NOT NULL,
      doctor_name TEXT NOT NULL,
      patient_id TEXT NOT NULL,
      patient_name TEXT NOT NULL,
      appointment_id TEXT,
      medications TEXT NOT NULL,
      diagnosis TEXT,
      instructions TEXT,
      valid_until TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Doctor schedules table
  database.run(`
    CREATE TABLE IF NOT EXISTS schedules (
      id TEXT PRIMARY KEY,
      doctor_id TEXT NOT NULL,
      day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      slot_duration INTEGER DEFAULT 30,
      is_active INTEGER DEFAULT 1,
      UNIQUE(doctor_id, day_of_week)
    )
  `);

  // Blocked slots (vacation, breaks)
  database.run(`
    CREATE TABLE IF NOT EXISTS blocked_slots (
      id TEXT PRIMARY KEY,
      doctor_id TEXT NOT NULL,
      date TEXT NOT NULL,
      start_time TEXT,
      end_time TEXT,
      reason TEXT,
      is_full_day INTEGER DEFAULT 0
    )
  `);

  // Patient notes (doctor's private notes)
  database.run(`
    CREATE TABLE IF NOT EXISTS patient_notes (
      id TEXT PRIMARY KEY,
      doctor_id TEXT NOT NULL,
      patient_id TEXT NOT NULL,
      patient_name TEXT NOT NULL,
      appointment_id TEXT,
      note TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Notifications table
  database.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      data TEXT,
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Conversations table
  database.run(`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      patient_name TEXT NOT NULL,
      doctor_id TEXT NOT NULL,
      doctor_name TEXT NOT NULL,
      last_message TEXT,
      last_message_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(patient_id, doctor_id)
    )
  `);

  // Chat messages table
  database.run(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      sender_role TEXT NOT NULL CHECK (sender_role IN ('patient', 'doctor')),
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Medical records/documents
  database.run(`
    CREATE TABLE IF NOT EXISTS medical_records (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      title TEXT NOT NULL,
      file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'image', 'document', 'lab_result', 'scan', 'other')),
      file_name TEXT NOT NULL,
      file_url TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      notes TEXT,
      uploaded_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Create indexes for better performance
  database.run('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
  database.run('CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON doctors(specialty)');
  database.run('CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id)');
  database.run('CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id)');
  database.run('CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status)');
  database.run('CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date)');
  database.run('CREATE INDEX IF NOT EXISTS idx_reviews_doctor_id ON reviews(doctor_id)');
  database.run('CREATE INDEX IF NOT EXISTS idx_favorites_patient_id ON favorites(patient_id)');
  database.run('CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON prescriptions(patient_id)');
  database.run('CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor_id ON prescriptions(doctor_id)');
  database.run('CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)');
  database.run('CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id)');
  database.run('CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON medical_records(patient_id)');
  database.run('CREATE INDEX IF NOT EXISTS idx_patient_notes_doctor_id ON patient_notes(doctor_id)');
  database.run('CREATE INDEX IF NOT EXISTS idx_patient_notes_patient_id ON patient_notes(patient_id)');

  saveDatabase();
  console.log('✓ Database initialized successfully');
}

// Export for backward compatibility
export { db };
export default { getDatabase, saveDatabase, initializeDatabase };
