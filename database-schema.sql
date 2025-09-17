-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('patient', 'doctor', 'hospital')),
  phone TEXT,
  address TEXT,
  city TEXT,
  dob DATE,
  hospital_id UUID,
  doctor_id UUID,
  specialization TEXT,
  license_number TEXT,
  hospital_name TEXT,
  hospital_city TEXT,
  hospital_contact TEXT,
  profile_image_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Hospitals table
CREATE TABLE IF NOT EXISTS hospitals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  contact TEXT,
  status TEXT CHECK (status IN ('available', 'full')) DEFAULT 'available',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  hospital_id UUID REFERENCES hospitals(id),
  name TEXT NOT NULL,
  specialization TEXT,
  available BOOLEAN DEFAULT true,
  license_number TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Diagnostic Reports table for AI analysis (updated schema)
CREATE TABLE IF NOT EXISTS diagnostic_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  file_url TEXT,
  file_type TEXT,
  mime TEXT,
  processing_status TEXT CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  summary TEXT,
  key_findings TEXT,
  followups TEXT,
  patient_friendly_explainer TEXT,
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Beds table
CREATE TABLE IF NOT EXISTS beds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID REFERENCES hospitals(id),
  type TEXT CHECK (type IN ('ICU', 'General', 'Emergency')),
  total_count INTEGER DEFAULT 0,
  available_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(hospital_id, type)
);

-- Equipment table
CREATE TABLE IF NOT EXISTS equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID REFERENCES hospitals(id),
  type TEXT,
  total_count INTEGER DEFAULT 0,
  available_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(hospital_id, type)
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES users(id),
  doctor_id UUID REFERENCES doctors(id),
  hospital_id UUID REFERENCES hospitals(id),
  appointment_date DATE,
  appointment_time TEXT,
  reason TEXT,
  status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled')) DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Availability slots table
CREATE TABLE IF NOT EXISTS availability_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID REFERENCES doctors(id),
  day TEXT,
  start_time TIME,
  end_time TIME,
  available BOOLEAN DEFAULT true
);

-- Remove duplicate diagnostic_reports table - using the one above

-- Hospital Departments table
CREATE TABLE IF NOT EXISTS hospital_departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID REFERENCES hospitals(id),
  name TEXT NOT NULL,
  head_doctor_id UUID REFERENCES doctors(id),
  description TEXT,
  contact_extension TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Doctor Schedule table
CREATE TABLE IF NOT EXISTS doctor_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID REFERENCES doctors(id),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT CHECK (status IN ('available', 'busy', 'off')) DEFAULT 'available',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_schedules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access (for testing)
DROP POLICY IF EXISTS "Public read access" ON hospitals;
CREATE POLICY "Public read access" ON hospitals FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public read access" ON doctors;
CREATE POLICY "Public read access" ON doctors FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public read access" ON beds;
CREATE POLICY "Public read access" ON beds FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public read access" ON equipment;
CREATE POLICY "Public read access" ON equipment FOR SELECT USING (true);

-- Users policies
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON users;
CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Appointments policies
DROP POLICY IF EXISTS "Users can view their appointments" ON appointments;
CREATE POLICY "Users can view their appointments" ON appointments
  FOR SELECT USING (auth.uid() = patient_id OR auth.uid() IN (
    SELECT user_id FROM doctors WHERE id = appointments.doctor_id
  ));

DROP POLICY IF EXISTS "Patients can create appointments" ON appointments;
CREATE POLICY "Patients can create appointments" ON appointments
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

-- Diagnostic Reports policies
DROP POLICY IF EXISTS "Patients can view their own reports" ON diagnostic_reports;
CREATE POLICY "Patients can view their own reports" ON diagnostic_reports
  FOR SELECT USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Patients can create their own reports" ON diagnostic_reports;
CREATE POLICY "Patients can create their own reports" ON diagnostic_reports
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Patients can update their own reports" ON diagnostic_reports;
CREATE POLICY "Patients can update their own reports" ON diagnostic_reports
  FOR UPDATE USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Patients can delete their own reports" ON diagnostic_reports;
CREATE POLICY "Patients can delete their own reports" ON diagnostic_reports
  FOR DELETE USING (auth.uid() = owner_id);

-- Hospital Departments policies
DROP POLICY IF EXISTS "Public read access for departments" ON hospital_departments;
CREATE POLICY "Public read access for departments" ON hospital_departments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Hospital users can manage departments" ON hospital_departments;
CREATE POLICY "Hospital users can manage departments" ON hospital_departments
  FOR ALL USING (auth.uid() IN (
    SELECT id FROM users WHERE role = 'hospital' AND hospital_id = hospital_departments.hospital_id
  ));

-- Doctor Schedules policies
DROP POLICY IF EXISTS "Doctors can manage their own schedules" ON doctor_schedules;
CREATE POLICY "Doctors can manage their own schedules" ON doctor_schedules
  FOR ALL USING (auth.uid() IN (
    SELECT user_id FROM doctors WHERE id = doctor_schedules.doctor_id
  ));

DROP POLICY IF EXISTS "Public read access for schedules" ON doctor_schedules;
CREATE POLICY "Public read access for schedules" ON doctor_schedules
  FOR SELECT USING (true);

-- Enable Realtime (with error handling)
DO $$
BEGIN
  -- Add tables to realtime publication if not already added
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE hospitals;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE beds;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE equipment;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE doctors;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE diagnostic_reports;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE users;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE hospital_departments;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE doctor_schedules;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE availability_slots;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
END $$;