import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xeqkqacvirdzmlevnxyp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlcWtxYWN2aXJkem1sZXZueHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNDgxMTAsImV4cCI6MjA3MzYyNDExMH0.kNxxWqT_pGsL4PWaH6HBdQndlC1-gZR-OHglSYu98co'

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export const ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  HOSPITAL: 'hospital'
}

export const APP_CONFIG = {
  APP_NAME: 'MediVerse AI',
  SPECIALIZATIONS: [
    'General Medicine', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics',
    'Gynecology', 'Emergency Medicine', 'Surgery', 'Radiology', 'Anesthesiology'
  ],
  CITIES: [
    'New Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 
    'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Chandigarh'
  ],
  TIME_SLOTS: [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM',
    '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM'
  ]
}
