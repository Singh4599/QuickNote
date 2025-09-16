// js/hospital-dashboard.js
// Hospital dashboard with Patient-like UI shell & green theme
// Requires: js/config.js and js/auth.js

/* ---------------- Init ---------------- */
(async function initHospitalDashboard() {
    try {
      if (!window.supabaseClient) {
        console.error('Supabase not initialized - ensure js/config.js is loaded');
        document.getElementById('contentArea').innerHTML = '<p style="color:red">Auth not initialized.</p>';
        return;
      }
  
      // Check session
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) {
        window.location.href = 'login.html';
        return;
      }
  
      // Auth helper
      if (window.Auth && typeof Auth.init === 'function') {
        await Auth.init();
      }
  
      // Role guard
      const user = Auth.getCurrentUser();
      const role = user?.user_metadata?.role || user?.role;
      if (role && role !== CONFIG.ROLES.HOSPITAL) {
        if (role === CONFIG.ROLES.DOCTOR) return window.location.href = 'doctor-dashboard.html';
        return window.location.href = 'patient-dashboard.html';
      }
  
      // Load topbar user
      const userMeta = (session.user?.user_metadata) || {};
      const email = session.user.email || userMeta.email || 'admin@hospital.com';
      const orgName = userMeta.hospital_name || 'Your Hospital';
      const fullName = userMeta.full_name || orgName || email.split('@')[0];
      const initials = fullName.split(' ').map(s => s.charAt(0)).slice(0,2).join('').toUpperCase();
  
      document.getElementById('userAvatar').textContent = initials || 'H';
      document.getElementById('userName').textContent = fullName || 'Hospital Admin';
      document.getElementById('userEmail').textContent = email;
  
      // Expose globals for handlers
      window.applyFilter = applyFilter;
      window.showOverview = showOverview;
      window.showBeds = showBeds;
      window.showDepartments = showDepartments;
      window.showDoctors = showDoctors;
      window.showProfile = showProfile;
      window.showSettings = showSettings;
      window.toggleUserMenu = toggleUserMenu;
      window.logout = logout;
      window.showNotifications = showNotifications;
  
      // Default view
      showOverview();
  
    } catch (err) {
      console.error('Init error:', err);
      document.getElementById('contentArea').innerHTML = '<p style="color:red">Initialization failed. Open console.</p>';
    }
  })();
  
  /* ---------------- Demo / State ---------------- */
  const BED_TYPES = ['ICU','General','Emergency'];
  const EQUIP_TYPES = ['Ventilator','MRI Machine','X-Ray Machine','CT Scanner','Ultrasound','ECG Machine'];
  
  const state = {
    status:'available',
    beds: [
      { type:'ICU', total:10, available:3 },
      { type:'General', total:60, available:40 },
      { type:'Emergency', total:8, available:2 }
    ],
    doctors: { total: 25, available: 18 },
    equipment: [
      { type:'Ventilator', total:10, available:8 },
      { type:'MRI Machine', total:2, available:1 },
      { type:'X-Ray Machine', total:3, available:2 },
      { type:'CT Scanner', total:1, available:1 },
      { type:'Ultrasound', total:4, available:3 },
      { type:'ECG Machine', total:6, available:5 }
    ],
    departments: [
      { name: 'Cardiology', head: 'Dr. Sarah Johnson', doctors: 5, patients: 23, status: 'active' },
      { name: 'Neurology', head: 'Dr. Michael Chen', doctors: 4, patients: 18, status: 'active' },
      { name: 'Orthopedics', head: 'Dr. Emily Davis', doctors: 6, patients: 31, status: 'active' },
      { name: 'Pediatrics', head: 'Dr. James Wilson', doctors: 4, patients: 15, status: 'active' },
      { name: 'Emergency', head: 'Dr. Lisa Brown', doctors: 6, patients: 42, status: 'active' }
    ],
    doctorRoster: [
      { id: 1, name: 'Dr. Sarah Johnson', department: 'Cardiology', specialization: 'Cardiologist', status: 'on-duty', shift: '8:00 AM - 6:00 PM', contact: '+91 98765 43210' },
      { id: 2, name: 'Dr. Michael Chen', department: 'Neurology', specialization: 'Neurologist', status: 'on-duty', shift: '9:00 AM - 7:00 PM', contact: '+91 98765 43211' },
      { id: 3, name: 'Dr. Emily Davis', department: 'Orthopedics', specialization: 'Orthopedic Surgeon', status: 'off-duty', shift: '2:00 PM - 10:00 PM', contact: '+91 98765 43212' },
      { id: 4, name: 'Dr. James Wilson', department: 'Pediatrics', specialization: 'Pediatrician', status: 'on-duty', shift: '6:00 AM - 2:00 PM', contact: '+91 98765 43213' },
      { id: 5, name: 'Dr. Lisa Brown', department: 'Emergency', specialization: 'Emergency Medicine', status: 'on-duty', shift: '24/7 Rotation', contact: '+91 98765 43214' }
    ]
  };
  
  /* ---------------- UI Helpers ---------------- */
  function setActiveNav(key) {
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    const map = { overview:'Overview', beds:'Beds', departments:'Departments', doctors:'Doctor', profile:'Profile', settings:'Settings' };
    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.textContent.trim().startsWith(map[key] || '')) link.classList.add('active');
    });
  }
  
  function toggleUserMenu() {
    const el = document.getElementById('userDropdown');
    el.style.display = (el.style.display === 'block') ? 'none' : 'block';
  }
  
  function showNotifications() {
    alert('No new notifications (demo).');
  }
  
  async function logout() {
    try { await supabaseClient.auth.signOut(); } catch (e) {}
    window.location.href = 'login.html';
  }
  
  /* ---------------- Sections ---------------- */
  function showOverview() {
    setActiveNav('overview');
    const container = document.getElementById('contentArea');
  
    const totalBeds = state.beds.reduce((s,b)=>s+b.total,0);
    const availBeds = state.beds.reduce((s,b)=>s+b.available,0);
    const bedPct = totalBeds ? Math.round((availBeds/totalBeds)*100) : 0;
  
    container.innerHTML = `
      <div class="dashboard-header">
        <h2 class="dashboard-title">Overview</h2>
        <p class="dashboard-subtitle">Real-time hospital status & summaries</p>
      </div>
  
      <div class="stats-grid">
        <div class="stat-card">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div>
              <div style="font-weight:700">Hospital Status</div>
              <div style="color:var(--muted);font-size:.9rem">Current load indicator</div>
            </div>
            <span class="status-badge ${state.status==='available'?'status-available':'status-full'}">${state.status==='available'?'Available':'Full'}</span>
          </div>
          <div style="margin-top:.75rem;display:flex;gap:.5rem">
            <button class="btn" onclick="toggleStatus()">${state.status==='available'?'Mark as Full':'Mark as Available'}</button>
          </div>
        </div>
  
        <div class="stat-card">
          <div style="font-weight:700">Bed Occupancy</div>
          <div style="color:var(--muted);font-size:.9rem">Available / Total</div>
          <div style="margin-top:.5rem;font-size:1.4rem;font-weight:800">${availBeds} / ${totalBeds}</div>
          <div style="background:#e5e7eb;height:10px;border-radius:8px;margin-top:.6rem">
            <div style="height:10px;border-radius:8px;width:${bedPct}%;background:#10b981"></div>
          </div>
        </div>
  
        <div class="stat-card">
          <div style="font-weight:700">Doctor Availability</div>
          <div style="color:var(--muted);font-size:.9rem">On duty now</div>
          <div style="margin-top:.5rem;font-size:1.4rem;font-weight:800">${state.doctors.available} / ${state.doctors.total}</div>
          <div style="margin-top:.6rem;display:flex;gap:.5rem">
            <button class="btn-outline" onclick="showDoctors()">Manage Doctors</button>
          </div>
        </div>
      </div>
  
      <div class="data-grid">
        ${state.beds.map(b => `
          <div class="data-card">
            <div class="data-card-header">
              <div>
                <h3 class="data-card-title">${escapeHtml(b.type)} Beds</h3>
                <div style="font-size:.9rem;color:var(--muted)">Available: ${b.available} / ${b.total}</div>
              </div>
              <div><span class="status-badge ${b.available>0?'status-available':'status-full'}">${b.available>0?'Available':'Full'}</span></div>
            </div>
            <div class="data-card-body">
              <div style="display:flex;justify-content:space-between;margin-top:.25rem">
                <div><strong>Occupied:</strong> ${Math.max(b.total - b.available,0)}</div>
                <button class="btn-outline" onclick="showBeds()">Update</button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  
    // expose toggle
    window.toggleStatus = () => {
      state.status = state.status==='available' ? 'full' : 'available';
      showOverview();
    };
  }
  
  function showBeds() {
    setActiveNav('beds');
    const container = document.getElementById('contentArea');
  
    let rows = BED_TYPES.map(t=>{
      const rec = state.beds.find(b=>b.type===t) || { total:0, available:0 };
      return `
        <tr>
          <td style="padding:.6rem 0">${t}</td>
          <td><input data-bed="${t}-total" type="number" min="0" value="${rec.total}" class="search-input" style="height:38px"></td>
          <td><input data-bed="${t}-avail" type="number" min="0" value="${rec.available}" class="search-input" style="height:38px"></td>
          <td style="text-align:center">${Math.max(rec.total - rec.available,0)}</td>
        </tr>
      `;
    }).join('');
  
    container.innerHTML = `
      <div class="dashboard-header">
        <h2 class="dashboard-title">Manage Beds</h2>
        <p class="dashboard-subtitle">Update per-bed-type capacity & availability</p>
      </div>
  
      <div class="data-card">
        <div class="data-card-body">
          <div style="overflow:auto">
            <table style="width:100%;border-collapse:collapse">
              <thead>
                <tr>
                  <th style="text-align:left;padding:.5rem 0">Type</th>
                  <th style="text-align:left">Total</th>
                  <th style="text-align:left">Available</th>
                  <th style="text-align:center">Occupied</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
          <div style="margin-top:1rem;display:flex;gap:.5rem">
            <button class="btn" onclick="saveBeds()">Save Beds</button>
            <button class="btn-outline" onclick="showOverview()">Back to Overview</button>
          </div>
        </div>
      </div>
    `;
  
    window.saveBeds = async () => {
      BED_TYPES.forEach(t=>{
        const total = Number(document.querySelector(`[data-bed="${t}-total"]`).value||0);
        const available = Number(document.querySelector(`[data-bed="${t}-avail"]`).value||0);
        const idx = state.beds.findIndex(b=>b.type===t);
        if (idx>=0) state.beds[idx] = { type:t, total, available };
        else state.beds.push({ type:t, total, available });
      });
  
      // (Optional) Save to Supabase: beds table (if you have one)
      // try {
      //   const uid = (await supabaseClient.auth.getUser()).data.user?.id;
      //   await supabaseClient.from('hospital_beds').upsert(state.beds.map(b=>({ owner_id: uid, ...b })));
      // } catch(e){ console.log('beds upsert skipped', e); }
  
      alert('Bed counts updated!');
      showOverview();
    };
  }
  
  function showEquipment() {
    setActiveNav('equipment');
    const container = document.getElementById('contentArea');
  
    let rows = EQUIP_TYPES.map(t=>{
      const rec = state.equipment.find(e=>e.type===t) || { total:0, available:0 };
      return `
        <tr>
          <td style="padding:.6rem 0">${t}</td>
          <td><input data-eq="${t}-total" type="number" min="0" value="${rec.total}" class="search-input" style="height:38px"></td>
          <td><input data-eq="${t}-avail" type="number" min="0" value="${rec.available}" class="search-input" style="height:38px"></td>
          <td style="text-align:center">${Math.max(rec.total - rec.available,0)}</td>
        </tr>
      `;
    }).join('');
  
    container.innerHTML = `
      <div class="dashboard-header">
        <h2 class="dashboard-title">Manage Equipment</h2>
        <p class="dashboard-subtitle">Track critical equipment availability</p>
      </div>
  
      <div class="data-card">
        <div class="data-card-body">
          <div style="overflow:auto">
            <table style="width:100%;border-collapse:collapse">
              <thead>
                <tr>
                  <th style="text-align:left;padding:.5rem 0">Equipment</th>
                  <th style="text-align:left">Total</th>
                  <th style="text-align:left">Available</th>
                  <th style="text-align:center">In Use</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
          <div style="margin-top:1rem;display:flex;gap:.5rem">
            <button class="btn" onclick="saveEquip()">Save Equipment</button>
            <button class="btn-outline" onclick="showOverview()">Back to Overview</button>
          </div>
        </div>
      </div>
    `;
  
    window.saveEquip = async () => {
      EQUIP_TYPES.forEach(t=>{
        const total = Number(document.querySelector(`[data-eq="${t}-total"]`).value||0);
        const available = Number(document.querySelector(`[data-eq="${t}-avail"]`).value||0);
        const idx = state.equipment.findIndex(e=>e.type===t);
        if (idx>=0) state.equipment[idx] = { type:t, total, available };
        else state.equipment.push({ type:t, total, available });
      });
  
      // (Optional) Save to Supabase: equipment table (if you have one)
      // try {
      //   const uid = (await supabaseClient.auth.getUser()).data.user?.id;
      //   await supabaseClient.from('hospital_equipment').upsert(state.equipment.map(e=>({ owner_id: uid, ...e })));
      // } catch(e){ console.log('equip upsert skipped', e); }
  
      alert('Equipment updated!');
      showOverview();
    };
  }
  
  function showDepartments() {
    setActiveNav('departments');
    const container = document.getElementById('contentArea');
  
    const departmentCards = state.departments.map(dept => `
      <div class="data-card">
        <div class="data-card-header">
          <div>
            <h3 style="font-weight:700;margin:0">${dept.name}</h3>
            <div style="color:var(--muted);font-size:.9rem">Head: ${dept.head}</div>
          </div>
          <span class="status-badge status-available">${dept.status}</span>
        </div>
        <div class="data-card-body">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem">
            <div><strong>Doctors:</strong> ${dept.doctors}</div>
            <div><strong>Patients:</strong> ${dept.patients}</div>
          </div>
          <div style="display:flex;gap:.5rem">
            <button class="btn-outline" onclick="alert('Edit ${dept.name} department')">Edit</button>
            <button class="btn-outline" onclick="alert('View ${dept.name} details')">Details</button>
          </div>
        </div>
      </div>
    `).join('');
  
    container.innerHTML = `
      <div class="dashboard-header">
        <h2 class="dashboard-title">Departments</h2>
        <p class="dashboard-subtitle">Manage hospital departments and their operations</p>
      </div>
  
      <div style="margin-bottom:1rem">
        <button class="btn" onclick="alert('Add new department')">+ Add Department</button>
      </div>
  
      <div class="data-grid">
        ${departmentCards}
      </div>
    `;
  }
  
  function showDoctors() {
    setActiveNav('doctors');
    const container = document.getElementById('contentArea');
  
    const statusBadge = (status) => {
      const classes = {
        'on-duty': 'status-available',
        'off-duty': 'status-full'
      };
      return `<span class="status-badge ${classes[status] || 'status-available'}">${status}</span>`;
    };
  
    const doctorRows = state.doctorRoster.map(doctor => `
      <tr>
        <td style="padding:.75rem 0">
          <div style="font-weight:600">${doctor.name}</div>
          <div style="font-size:.85rem;color:var(--muted)">${doctor.specialization}</div>
        </td>
        <td>${doctor.department}</td>
        <td>${doctor.shift}</td>
        <td>${statusBadge(doctor.status)}</td>
        <td>${doctor.contact}</td>
        <td style="text-align:right">
          <button class="btn-outline" onclick="toggleDoctorStatus(${doctor.id})" style="margin-right:.5rem">
            ${doctor.status === 'on-duty' ? 'Mark Off' : 'Mark On'}
          </button>
          <button class="btn-outline" onclick="alert('Edit ${doctor.name}')">Edit</button>
        </td>
      </tr>
    `).join('');
  
    container.innerHTML = `
      <div class="dashboard-header">
        <h2 class="dashboard-title">Doctor Roster</h2>
        <p class="dashboard-subtitle">Manage doctor schedules and availability</p>
      </div>
  
      <div style="margin-bottom:1rem">
        <button class="btn" onclick="alert('Add new doctor')">+ Add Doctor</button>
      </div>
  
      <div class="data-card">
        <div class="data-card-body">
          <div style="overflow:auto">
            <table style="width:100%;border-collapse:collapse;min-width:800px">
              <thead>
                <tr style="border-bottom:2px solid #e5e7eb">
                  <th style="text-align:left;padding:.75rem 0;font-weight:700">Doctor</th>
                  <th style="text-align:left;font-weight:700">Department</th>
                  <th style="text-align:left;font-weight:700">Shift</th>
                  <th style="text-align:left;font-weight:700">Status</th>
                  <th style="text-align:left;font-weight:700">Contact</th>
                  <th style="text-align:right;font-weight:700">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${doctorRows}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  
    window.toggleDoctorStatus = (doctorId) => {
      const doctor = state.doctorRoster.find(d => d.id === doctorId);
      if (doctor) {
        doctor.status = doctor.status === 'on-duty' ? 'off-duty' : 'on-duty';
        // Update available count
        const onDutyCount = state.doctorRoster.filter(d => d.status === 'on-duty').length;
        state.doctors.available = onDutyCount;
        showDoctors();
      }
    };
  }
  
  function showProfile() {
    setActiveNav('profile');
    const container = document.getElementById('contentArea');
  
    container.innerHTML = `
      <div class="dashboard-header">
        <h2 class="dashboard-title">Hospital Profile</h2>
        <p class="dashboard-subtitle">Manage hospital information and settings</p>
      </div>
  
      <div class="data-grid">
        <div class="data-card">
          <div class="data-card-header">
            <h3 style="font-weight:700;margin:0">Basic Information</h3>
          </div>
          <div class="data-card-body">
            <div style="display:grid;gap:1rem">
              <div>
                <label style="display:block;font-weight:600;margin-bottom:.5rem">Hospital Name</label>
                <input type="text" class="search-input" value="MediVerse General Hospital" style="width:100%">
              </div>
              <div>
                <label style="display:block;font-weight:600;margin-bottom:.5rem">Address</label>
                <textarea class="search-input" style="width:100%;min-height:80px;resize:vertical">123 Healthcare Ave, Medical District, City 12345</textarea>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
                <div>
                  <label style="display:block;font-weight:600;margin-bottom:.5rem">Phone</label>
                  <input type="tel" class="search-input" value="+91 11 2345 6789" style="width:100%">
                </div>
                <div>
                  <label style="display:block;font-weight:600;margin-bottom:.5rem">Email</label>
                  <input type="email" class="search-input" value="info@mediversehospital.com" style="width:100%">
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <div class="data-card">
          <div class="data-card-header">
            <h3 style="font-weight:700;margin:0">Hospital Statistics</h3>
          </div>
          <div class="data-card-body">
            <div style="display:grid;gap:1rem">
              <div style="display:flex;justify-content:space-between">
                <span>Total Beds:</span>
                <strong>${state.beds.reduce((s,b)=>s+b.total,0)}</strong>
              </div>
              <div style="display:flex;justify-content:space-between">
                <span>Total Doctors:</span>
                <strong>${state.doctors.total}</strong>
              </div>
              <div style="display:flex;justify-content:space-between">
                <span>Departments:</span>
                <strong>${state.departments.length}</strong>
              </div>
              <div style="display:flex;justify-content:space-between">
                <span>Equipment Items:</span>
                <strong>${state.equipment.reduce((s,e)=>s+e.total,0)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <div style="margin-top:1rem">
        <button class="btn" onclick="alert('Profile updated successfully!')">Save Changes</button>
        <button class="btn-outline" onclick="showOverview()" style="margin-left:.5rem">Back to Overview</button>
      </div>
    `;
  }
  
  function showSettings() {
    setActiveNav('settings');
    const container = document.getElementById('contentArea');
  
    container.innerHTML = `
      <div class="dashboard-header"><h2 class="dashboard-title">Settings</h2></div>
      <div class="data-card">
        <div class="data-card-body">
          <div style="display:grid;gap:.75rem">
            <label><input type="checkbox" checked> Email notifications</label>
            <label><input type="checkbox"> SMS alerts</label>
            <label>Theme: 
              <select id="themeSelect">
                <option value="hospital">Hospital (Green)</option>
                <option value="patient">Patient (Blue)</option>
                <option value="doctor">Doctor (Indigo)</option>
              </select>
            </label>
            <button class="btn" onclick="saveSettings()">Save Settings</button>
          </div>
        </div>
      </div>
    `;
  
    window.saveSettings = () => {
      alert('Settings saved (demo).');
    };
  }
  
  /* ---------------- Search Filter ---------------- */
  function applyFilter() {
    const q = (document.getElementById('globalSearch').value || '').toLowerCase();
  
    // Find active tab
    const activeText = Array.from(document.querySelectorAll('.nav-link')).find(n => n.classList.contains('active'))?.textContent || '';
  
    if (activeText.includes('Overview')) {
      // Simple filter: if query contains bed or equipment types, jump to sections
      if (BED_TYPES.some(b => b.toLowerCase().includes(q)) && q) return showBeds();
      if (EQUIP_TYPES.some(e => e.toLowerCase().includes(q)) && q) return showDepartments();
    } else if (activeText.includes('Beds')) {
      // Filter rows by type text
      document.querySelectorAll('[data-bed]').forEach(inp=>{
        const row = inp.closest('tr');
        const type = row?.children?.[0]?.textContent?.toLowerCase() || '';
        row.style.display = type.includes(q) ? '' : 'none';
      });
    } else if (activeText.includes('Departments')) {
      // Filter department cards
      document.querySelectorAll('.data-card').forEach(card=>{
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(q) ? '' : 'none';
      });
    } else if (activeText.includes('Doctor')) {
      // Filter doctor rows
      document.querySelectorAll('tbody tr').forEach(row=>{
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(q) ? '' : 'none';
      });
    } else {
      showOverview();
    }
  }
  
  /* ---------------- Utils ---------------- */
  function escapeHtml(str) {
    if (!str && str !== 0) return '';
    return String(str).replace(/[&<>"'`=\/]/g, function (s) {
      return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','/':'&#x2F;','`':'&#96;','=':'&#61;' })[s];
    });
  }
      