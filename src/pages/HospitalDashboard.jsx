import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Building2, 
  Bed, 
  Users, 
  Activity, 
  Settings, 
  LogOut,
  Calendar,
  FileText,
  User,
  Bell,
  Plus,
  TrendingUp,
  Shield
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'

const HospitalDashboard = () => {
  const { user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'beds', label: 'Bed Management', icon: Bed },
    { id: 'staff', label: 'Staff Management', icon: Users },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'equipment', label: 'Equipment', icon: Shield },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  const stats = [
    { label: 'Total Beds', value: '450', icon: Bed, color: 'blue', subtext: '85% Occupied' },
    { label: 'Active Staff', value: '248', icon: Users, color: 'green', subtext: '12 On Duty' },
    { label: 'Departments', value: '15', icon: Building2, color: 'purple', subtext: 'All Active' },
    { label: 'Equipment', value: '1,240', icon: Shield, color: 'cyan', subtext: '98% Functional' },
  ]

  const bedStatus = [
    { department: 'ICU', total: 50, occupied: 45, available: 5 },
    { department: 'General Ward', total: 200, occupied: 165, available: 35 },
    { department: 'Emergency', total: 30, occupied: 28, available: 2 },
    { department: 'Pediatrics', total: 80, occupied: 62, available: 18 },
    { department: 'Maternity', total: 40, occupied: 35, available: 5 },
    { department: 'Cardiology', total: 25, occupied: 20, available: 5 },
    { department: 'Orthopedics', total: 35, occupied: 28, available: 7 },
  ]

  const hospitalStats = [
    { label: 'Total Patients', value: '1,247', change: '+12%', trend: 'up' },
    { label: 'Staff on Duty', value: '348', change: '+5%', trend: 'up' },
    { label: 'Bed Occupancy', value: '87%', change: '+3%', trend: 'up' },
    { label: 'Revenue Today', value: '$45,230', change: '+18%', trend: 'up' },
  ]

  const recentPatients = [
    { id: 1, name: 'John Smith', age: 45, condition: 'Cardiac Surgery', department: 'Cardiology', status: 'Critical', time: '2 hours ago' },
    { id: 2, name: 'Sarah Johnson', age: 32, condition: 'Pneumonia', department: 'General Ward', status: 'Stable', time: '4 hours ago' },
    { id: 3, name: 'Mike Davis', age: 28, condition: 'Fracture', department: 'Orthopedics', status: 'Recovering', time: '6 hours ago' },
    { id: 4, name: 'Lisa Wilson', age: 55, condition: 'Diabetes', department: 'Endocrinology', status: 'Stable', time: '8 hours ago' },
  ]

  const staffSchedule = [
    { name: 'Dr. Emily Chen', department: 'ICU', shift: '6AM - 6PM', status: 'On Duty' },
    { name: 'Dr. Michael Brown', department: 'Emergency', shift: '6PM - 6AM', status: 'On Duty' },
    { name: 'Nurse Jane Wilson', department: 'Pediatrics', shift: '8AM - 8PM', status: 'On Duty' },
    { name: 'Dr. Robert Taylor', department: 'Cardiology', shift: '9AM - 5PM', status: 'Off Duty' },
  ]

  const recentActivities = [
    { action: 'New patient admitted to ICU', time: '15 minutes ago', type: 'admission' },
    { action: 'Equipment maintenance completed', time: '1 hour ago', type: 'maintenance' },
    { action: 'Staff shift change completed', time: '2 hours ago', type: 'staff' },
    { action: 'Emergency department capacity updated', time: '3 hours ago', type: 'capacity' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex relative z-20"
    >
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-72 glass-dark backdrop-blur-xl border-r border-white/10 p-6"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center font-bold text-white">
            MV
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">MediVerse AI</h1>
            <p className="text-white/60 text-sm">Hospital Portal</p>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 p-3 rounded-xl glass border border-white/10">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 flex items-center justify-center text-white font-semibold">
              <Building2 size={20} />
            </div>
            <div>
              <p className="text-white font-medium">{user?.user_metadata?.hospital_name || 'Hospital Admin'}</p>
              <p className="text-white/60 text-sm">{user?.user_metadata?.hospital_city || 'Healthcare System'}</p>
            </div>
          </div>
        </div>

        <nav className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            return (
              <motion.button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                  activeTab === item.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </motion.button>
            )
          })}
        </nav>

        <div className="mt-auto pt-6">
          <Button
            onClick={signOut}
            variant="ghost"
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <LogOut size={20} className="mr-3" />
            Sign Out
          </Button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Header */}
        <motion.div 
          className="flex justify-between items-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div>
            <h1 
              className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2"
              style={{
                filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))'
              }}
            >
              Hospital Dashboard
            </h1>
            <p className="text-white/60">Manage your hospital operations</p>
          </div>
          <Button variant="primary" size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Add Patient
          </Button>
        </motion.div>

        {/* Hospital Stats */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {hospitalStats.map((stat, index) => (
            <GlassCard key={index} className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white/60 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <div className={`text-sm px-2 py-1 rounded-full ${
                  stat.trend === 'up' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {stat.change}
                </div>
              </div>
            </GlassCard>
          ))}
        </motion.div>

        {/* Bed Status Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {bedStatus.map((bed, index) => (
            <GlassCard key={index} className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">{bed.department}</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/60">Total Beds:</span>
                  <span className="text-white font-medium">{bed.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Occupied:</span>
                  <span className="text-red-400 font-medium">{bed.occupied}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Available:</span>
                  <span className="text-green-400 font-medium">{bed.available}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${(bed.occupied / bed.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </GlassCard>
          ))}
        </motion.div>

        {/* Recent Patients */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">Recent Patients</h2>
          <GlassCard className="p-6">
            <div className="space-y-4">
              {recentPatients.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <span className="text-blue-400 font-semibold">{patient.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{patient.name}</h4>
                      <p className="text-white/60 text-sm">{patient.condition} • {patient.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`px-3 py-1 rounded-full text-sm ${
                      patient.status === 'Critical' ? 'bg-red-500/20 text-red-400' :
                      patient.status === 'Stable' ? 'bg-green-500/20 text-green-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {patient.status}
                    </div>
                    <p className="text-white/60 text-sm mt-1">{patient.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Staff Schedule */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">Staff Schedule</h2>
          <GlassCard className="p-6">
            <div className="space-y-4">
              {staffSchedule.map((staff, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <h4 className="text-white font-medium">{staff.name}</h4>
                    <p className="text-white/60 text-sm">{staff.department} • {staff.shift}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm ${
                    staff.status === 'On Duty' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {staff.status}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </main>
    </motion.div>
  )
}

