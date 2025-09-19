// Patient Dashboard Logic (JS)

// --------- Dummy Data (replace with Supabase if needed) ----------
// Check if already declared to prevent duplicate declaration errors
if (typeof window.dummyHospitals === 'undefined') {
  window.dummyHospitals = [
  { id: 1, name: "City General Hospital", location: "Mumbai, Maharashtra", beds: 45, available: 12, status: "available", contact: "+91 98765 43210" },
  { id: 2, name: "Metro Health Center", location: "Delhi", beds: 30, available: 0, status: "full", contact: "+91 98765 12345" },
  { id: 3, name: "Sunshine Medical", location: "Bangalore, Karnataka", beds: 25, available: 5, status: "available", contact: "+91 98765 67890" },
  { id: 4, name: "Green Valley Hospital", location: "Hyderabad", beds: 50, available: 3, status: "available", contact: "+91 98765 09876" }
  ];
}

const dummyDoctors = window.dummyDoctors || [
  { id: 1, name: "Dr. Ramesh Kumar", specialization: "Cardiologist", hospital: "City General Hospital", availability: "Mon-Fri 9AM-1PM" },
  { id: 2, name: "Dr. Priya Singh", specialization: "Neurologist", hospital: "Metro Health Center", availability: "Tue-Thu 2PM-6PM" },
  { id: 3, name: "Dr. Amit Patel", specialization: "Orthopedic", hospital: "Sunshine Medical", availability: "Mon, Wed 10AM-3PM" },
  { id: 4, name: "Dr. Anjali Desai", specialization: "Pediatrician", hospital: "Green Valley Hospital", availability: "Mon-Fri 9AM-5PM" },
];

let dummyAppointments = [
  { id: 101, doctor: "Dr. Ramesh Kumar", date: "2025-09-10", time: "10:00 AM", status: "Confirmed" },
  { id: 102, doctor: "Dr. Anjali Desai", date: "2025-09-12", time: "02:30 PM", status: "Pending" }
];

// --------- Nav Active ---------
function setActiveNav(name) {
  document.querySelectorAll(".nav-link").forEach(el => el.classList.remove("active"));
  const activeLink = [...document.querySelectorAll(".nav-link")].find(l => 
    l.textContent.trim().includes(name) || 
    (name === 'Dashboard' && l.querySelector('i.fa-house'))
  );
  if (activeLink) activeLink.classList.add("active");
}

// --------- Hospitals ---------
function showHospitals(){
  setActiveNav("Hospitals");
  const container = document.getElementById("contentArea");
  let html = `<h2 style="font-weight:700;margin:18px 0">Available Hospitals</h2>`;
  html += `<div class="data-grid">`;
  window.dummyHospitals.forEach(h=>{
    const occ = h.beds ? Math.round(((h.beds - h.available) / h.beds) * 100) : 0;
    html += `
      <div class="data-card">
        <div class="data-card-header">
          <h3 class="data-card-title">${h.name}</h3>
          <span class="status-badge ${h.status==='available'?'status-available':'status-full'}">
            ${h.status==='available'?'AVAILABLE':'FULLY OCCUPIED'}
          </span>
        </div>
        <div class="data-card-body">
          <p><strong>Location:</strong> ${h.location}</p>
          <p><strong>Total Beds:</strong> ${h.beds}</p>
          <p><strong>Available:</strong> ${h.available} beds</p>
          <p><strong>Occupancy:</strong> ${occ}%</p>
          <p><strong>Contact:</strong> ${h.contact}</p>
        </div>
      </div>
    `;
  });
  html += `</div>`;
  container.innerHTML = html;
}

// --------- Doctors ---------
function showDoctors(){
  setActiveNav("Doctors");
  const container = document.getElementById("contentArea");
  let html = `<h2 style="font-weight:700;margin:18px 0">Doctors</h2><div class="data-grid">`;
  dummyDoctors.forEach(d=>{
    html += `
      <div class="data-card">
        <div class="data-card-header">
          <h3 class="data-card-title">${d.name}</h3>
          <span class="status-badge status-available">Available</span>
        </div>
        <div class="data-card-body">
          <p><strong>Specialization:</strong> ${d.specialization}</p>
          <p><strong>Hospital:</strong> ${d.hospital}</p>
          <p><strong>Timing:</strong> ${d.availability}</p>
          <button class="btn" onclick="bookAppointment(${d.id})">Book Appointment</button>
        </div>
      </div>
    `;
  });
  html += `</div>`;
  container.innerHTML = html;
}

// --------- Appointments ---------
function showAppointments(){
  setActiveNav("Appointments");
  const container = document.getElementById("contentArea");
  let html = `<h2 style="font-weight:700;margin:18px 0">My Appointments</h2>`;
  if(!dummyAppointments.length){
    container.innerHTML = html + `<p>No Appointments Found.</p>`;
    return;
  }
  html += `<div class="data-grid">`;
  dummyAppointments.forEach(a=>{
    html += `
      <div class="data-card">
        <div class="data-card-header">
          <h3 class="data-card-title">${a.doctor}</h3>
          <span class="status-badge ${a.status==='Confirmed'?'status-available':'status-full'}">${a.status}</span>
        </div>
        <div class="data-card-body">
          <p><strong>Date:</strong> ${a.date}</p>
          <p><strong>Time:</strong> ${a.time}</p>
          ${a.status==='Pending'
            ? `<button class="btn" onclick="confirmAppointment(${a.id})">Confirm</button>`
            : `<button class="btn-outline" onclick="cancelAppointment(${a.id})">Cancel</button>`}
        </div>
      </div>
    `;
  });
  html += `</div>`;
  container.innerHTML = html;
}

// --------- Emergency ---------
function showEmergency(){
  setActiveNav("Emergency");
  const container = document.getElementById("contentArea");
  container.innerHTML = `
    <h2 style="font-weight:700;margin:18px 0;color:#ef4444">Emergency</h2>
    <div class="data-card"><div class="data-card-body" style="text-align:center">
      <h3>If this is an emergency call <strong>108</strong></h3>
      <button class="btn" onclick="alert('Calling 108...')">Call 108</button>
      <button class="btn-outline" onclick="alert('Ambulance requested...')">Request Ambulance</button>
    </div></div>
  `;
}

// --------- Profile ---------
function showProfile(){
  setActiveNav("Profile");
  const container = document.getElementById("contentArea");
  container.innerHTML = `
    <h2 style="font-weight:700;margin:18px 0">Profile</h2>
    <div class="data-card"><div class="data-card-body">
      <div style="display:flex;align-items:center;gap:1rem">
        <div class="avatar">P</div>
        <div>
          <div style="font-weight:700">Patient User</div>
          <div style="color:var(--muted)">you@example.com</div>
        </div>
      </div>
    </div></div>
  `;
}

// --------- Settings ---------
function showSettings(){
  setActiveNav("Settings");
  const container = document.getElementById("contentArea");
  container.innerHTML = `
    <h2 style="font-weight:700;margin:18px 0">Settings</h2>
    <div class="data-card"><div class="data-card-body">
      <label><input type="checkbox" checked/> Email Notifications</label><br>
      <label><input type="checkbox"/> SMS Alerts</label><br>
      <button class="btn" style="margin-top:10px" onclick="alert('Saved!')">Save Settings</button>
    </div></div>
  `;
}

// --------- Appointment Actions ---------
function bookAppointment(id){
  const doc = dummyDoctors.find(d=>d.id===id);
  const apt = {id: Date.now(), doctor: doc.name, date:"2025-09-15", time:"11:00 AM", status:"Pending"};
  dummyAppointments.push(apt);
  alert("Appointment booked with " + doc.name);
  showAppointments();
}
function confirmAppointment(id){
  dummyAppointments = dummyAppointments.map(a=>a.id===id?{...a,status:"Confirmed"}:a);
  showAppointments();
}
function cancelAppointment(id){
  dummyAppointments = dummyAppointments.map(a=>a.id===id?{...a,status:"Cancelled"}:a);
  showAppointments();
}

// --------- Utilities ---------
function applyFilter(){
  const q = (document.getElementById("globalSearch").value||"").toLowerCase();
  if(document.querySelector(".nav-link.active").textContent.includes("Hospital")){
    const filtered = window.dummyHospitals.filter(h=>(h.name+h.location).toLowerCase().includes(q));
    if(filtered.length){ window.dummyHospitals.splice(0,window.dummyHospitals.length,...filtered); showHospitals(); }
  } else if(document.querySelector(".nav-link.active").textContent.includes("Doctor")){
    const filtered = dummyDoctors.filter(d=>(d.name+d.specialization).toLowerCase().includes(q));
    if(filtered.length){ dummyDoctors.splice(0,dummyDoctors.length,...filtered); showDoctors(); }
  }
}
function toggleUserMenu(){
  const dd = document.getElementById("userDropdown");
  dd.style.display = dd.style.display==="block"?"none":"block";
}
function showNotifications(){ alert("No new notifications"); }
function logout(){ alert("Logged out!"); }

// --------- Navigation Functions ---------
function showDashboard() {
  setActiveNav("Dashboard");
  hideAllContent();
  document.getElementById("dashboardContent").style.display = "block";
}

function showAIDiagnostics() {
  setActiveNav("AI Diagnostics");
  hideAllContent();
  document.getElementById("aiDiagnosticsContent").style.display = "block";
  if (window.aiDiagnostics) {
    window.aiDiagnostics.loadReports();
  }
}

function showAppointments() {
  setActiveNav("My Appointments");
  hideAllContent();
  document.getElementById("appointmentsContent").style.display = "block";
}

function showReports() {
  setActiveNav("Medical Reports");
  hideAllContent();
  document.getElementById("reportsContent").style.display = "block";
  if (window.aiDiagnostics) {
    window.aiDiagnostics.loadReports();
  }
}

function showDoctors() {
  setActiveNav("Find Doctors");
  hideAllContent();
  document.getElementById("doctorsContent").style.display = "block";
}

function showHospitals() {
  setActiveNav("Find Hospitals");
  hideAllContent();
  document.getElementById("hospitalsContent").style.display = "block";
}

function showProfile() {
  setActiveNav("Profile");
  hideAllContent();
  // Create profile content dynamically
  const container = document.createElement('div');
  container.id = 'profileContent';
  container.innerHTML = `
    <h1 class="page-title">My Profile</h1>
    <p class="page-sub">Manage your personal information and preferences</p>
    <div class="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
      <div class="text-center text-gray-500 py-8">
        <i class="fas fa-user text-6xl mb-4 opacity-50"></i>
        <h3 class="text-xl font-semibold mb-2">Profile Management</h3>
        <p>Update your personal information and medical history</p>
      </div>
    </div>
  `;
  document.querySelector('.wrap').appendChild(container);
}

function showSettings() {
  setActiveNav("Settings");
  hideAllContent();
  // Create settings content dynamically
  const container = document.createElement('div');
  container.id = 'settingsContent';
  container.innerHTML = `
    <h1 class="page-title">Settings</h1>
    <p class="page-sub">Customize your MediVerse AI experience</p>
    <div class="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
      <div class="text-center text-gray-500 py-8">
        <i class="fas fa-cog text-6xl mb-4 opacity-50"></i>
        <h3 class="text-xl font-semibold mb-2">Application Settings</h3>
        <p>Notifications, privacy, and account preferences</p>
      </div>
    </div>
  `;
  document.querySelector('.wrap').appendChild(container);
}

function hideAllContent() {
  // Hide all main content sections
  const contentSections = [
    'dashboardContent',
    'aiDiagnosticsContent', 
    'appointmentsContent',
    'reportsContent',
    'doctorsContent',
    'hospitalsContent'
  ];
  
  contentSections.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.style.display = 'none';
    }
  });
  
  // Remove dynamically created content
  const dynamicContent = document.querySelectorAll('#profileContent, #settingsContent');
  dynamicContent.forEach(el => el.remove());
}

// --------- Mobile Navigation ---------
function toggleMobileMenu() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.querySelector('.mobile-overlay');
  
  sidebar.classList.toggle('mobile-open');
  overlay.classList.toggle('active');
}

function closeMobileMenu() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.querySelector('.mobile-overlay');
  
  sidebar.classList.remove('mobile-open');
  overlay.classList.remove('active');
}

// --------- Responsive Utilities ---------
function isMobile() {
  return window.innerWidth <= 768;
}

function updateLayoutForScreenSize() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.querySelector('.mobile-overlay');
  
  if (!isMobile()) {
    sidebar.classList.remove('mobile-open');
    overlay.classList.remove('active');
  }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
  const dropdown = document.getElementById('userDropdown');
  const userMenu = document.querySelector('.user');
  if (!userMenu.contains(event.target) && !dropdown.contains(event.target)) {
    dropdown.style.display = 'none';
  }
});

// Handle window resize
window.addEventListener('resize', updateLayoutForScreenSize);

// Initialize the dashboard
document.addEventListener("DOMContentLoaded", () => {
  // Set initial active state for the dashboard link
  showDashboard();
  
  // Load user data if available
  const user = Auth.getCurrentUser();
  if (user) {
    document.getElementById('userName').textContent = user.full_name || user.name || 'Patient';
    document.getElementById('userEmail').textContent = user.email || 'you@example.com';
    document.getElementById('userAvatar').textContent = ((user.full_name || user.name || 'P').charAt(0).toUpperCase());
  }
  
  // Add event listener for search with debouncing
  let searchTimeout;
  document.getElementById('globalSearch').addEventListener('input', function() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(applyFilter, 300);
  });
  
  // Initialize responsive behavior
  updateLayoutForScreenSize();
  
  // Add touch support for mobile devices
  if ('ontouchstart' in window) {
    document.body.classList.add('touch-device');
  }
});
