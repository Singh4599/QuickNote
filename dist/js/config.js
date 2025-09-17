// js/config.js
// =============== App Config + Supabase Init ===============
const CONFIG = {
    SUPABASE_URL: 'https://xeqkqacvirdzmlevnxyp.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlcWtxYWN2aXJkem1sZXZueHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNDgxMTAsImV4cCI6MjA3MzYyNDExMH0.kNxxWqT_pGsL4PWaH6HBdQndlC1-gZR-OHglSYu98co',
  
    APP_NAME: 'MediVerse AI',
    ROLES: { PATIENT: 'patient', DOCTOR: 'doctor', HOSPITAL: 'hospital' },
  
    // Just for UI helpers
    SPECIALIZATIONS: [
      'General Medicine','Cardiology','Neurology','Orthopedics','Pediatrics',
      'Gynecology','Emergency Medicine','Surgery','Radiology','Anesthesiology'
    ],
    CITIES: ['New Delhi','Mumbai','Bangalore','Chennai','Hyderabad','Kolkata','Pune','Ahmedabad','Jaipur','Chandigarh'],
    TIME_SLOTS: ['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','02:00 PM','02:30 PM','03:00 PM','03:30 PM','04:00 PM','04:30 PM','05:00 PM','05:30 PM','06:00 PM']
  };
  
  window.CONFIG = CONFIG;
  
  function initSupabase() {
    try {
      if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_ANON_KEY) throw new Error('Missing Supabase configuration');
      window.supabaseClient = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, {
        auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true }
      });
      console.log(`✅ Supabase initialized: ${CONFIG.APP_NAME}`);
      return true;
    } catch (e) {
      console.error('❌ Supabase init failed:', e);
      return false;
    }
  }
  initSupabase();
  