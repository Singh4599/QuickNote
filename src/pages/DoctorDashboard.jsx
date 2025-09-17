import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  Activity,
  Clock,
  User,
  Stethoscope,
  Bell,
  Search,
  Plus
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'

const DoctorDashboard = () => {
  const { user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'patients', label: 'My Patients', icon: Users },
    { id: 'reports', label: 'Patient Reports', icon: FileText },
    { id: 'schedule', label: 'My Schedule', icon: Clock },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  const stats = [
    { label: 'Today\'s Appointments', value: '12', icon: Calendar, color: 'blue' },
    { label: 'Total Patients', value: '248', icon: Users, color: 'green' },
    { label: 'Pending Reports', value: '5', icon: FileText, color: 'yellow' },
    { label: 'This Month', value: '156', icon: Activity, color: 'purple' },
  ]

  const upcomingAppointments = [
    { id: 1, patient: 'John Smith', time: '09:00 AM', type: 'Consultation', status: 'confirmed' },
    { id: 2, patient: 'Sarah Johnson', time: '10:30 AM', type: 'Follow-up', status: 'pending' },
    { id: 3, patient: 'Mike Davis', time: '02:00 PM', type: 'Check-up', status: 'confirmed' },
    { id: 4, patient: 'Lisa Wilson', time: '03:30 PM', type: 'Consultation', status: 'confirmed' },
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center font-bold text-white">
            MV
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">MediVerse AI</h1>
            <p className="text-white/60 text-sm">Doctor Portal</p>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 p-3 rounded-xl glass border border-white/10">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center text-white font-semibold">
              <Stethoscope size={20} />
            </div>
            <div>
              <p className="text-white font-medium">Dr. {user?.user_metadata?.name || 'Doctor'}</p>
              <p className="text-white/60 text-sm">{user?.user_metadata?.specialization || 'General Medicine'}</p>
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
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
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
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2" style={{filter: 'drop-shadow(0 0 10px rgba(0, 255, 255, 0.5))'}}>
                Good morning, Dr. {user?.user_metadata?.name || 'Doctor'}!
              </h1>
              <p className="text-white/70">
                You have 12 appointments scheduled for today
              </p>
            </div>
            <div className="flex gap-3">
              <Button className="flex items-center gap-2">
                <Bell size={20} />
                Notifications
              </Button>
              <Button variant="secondary" className="flex items-center gap-2">
                <Plus size={20} />
                New Appointment
              </Button>
            </div>
          </motion.div>

          {/* Dashboard Content */}
          {activeTab === 'dashboard' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                  const Icon = stat.icon
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <GlassCard className="p-6" hover3d>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white/70 text-sm">{stat.label}</p>
                            <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                          </div>
                          <div className={`p-3 rounded-xl bg-${stat.color}-500/20`}>
                            <Icon size={24} className={`text-${stat.color}-400`} />
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  )
                })}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Today's Appointments */}
                <GlassCard className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">Today's Appointments</h2>
                    <Button variant="outline" size="sm">
                      <Search size={16} className="mr-2" />
                      View All
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {upcomingAppointments.map((appointment) => (
                      <motion.div
                        key={appointment.id}
                        className="flex items-center justify-between p-4 rounded-xl glass border border-white/10"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center text-white font-semibold text-sm">
                            {appointment.patient.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-white font-medium">{appointment.patient}</p>
                            <p className="text-white/60 text-sm">{appointment.type} • {appointment.time}</p>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          appointment.status === 'confirmed' 
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {appointment.status}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </GlassCard>

                {/* Quick Actions */}
                <GlassCard className="p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
                  <div className="space-y-3">
                    <Button
                      className="w-full flex items-center gap-3 justify-start p-4 h-auto"
                      rocket
                    >
                      <Calendar size={24} />
                      <div className="text-left">
                        <p className="font-semibold">Schedule Appointment</p>
                        <p className="text-sm opacity-80">Book new patient visit</p>
                      </div>
                    </Button>
                    
                    <Button
                      variant="secondary"
                      className="w-full flex items-center gap-3 justify-start p-4 h-auto"
                    >
                      <FileText size={24} />
                      <div className="text-left">
                        <p className="font-semibold">Review Reports</p>
                        <p className="text-sm opacity-80">Check patient diagnostics</p>
                      </div>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full flex items-center gap-3 justify-start p-4 h-auto"
                    >
                      <Users size={24} />
                      <div className="text-left">
                        <p className="font-semibold">Patient Records</p>
                        <p className="text-sm opacity-80">Access medical history</p>
                      </div>
                    </Button>
                  </div>
                </GlassCard>
              </div>

              {/* Recent Activity */}
              <GlassCard className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  {[
                    { action: 'Completed consultation with John Smith', time: '2 hours ago', type: 'consultation' },
                    { action: 'Reviewed AI diagnostic report for Sarah Johnson', time: '4 hours ago', type: 'report' },
                    { action: 'Updated treatment plan for Mike Davis', time: '1 day ago', type: 'treatment' },
                    { action: 'Scheduled follow-up for Lisa Wilson', time: '2 days ago', type: 'schedule' },
                  ].map((activity, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center gap-4 p-3 rounded-xl glass-dark border border-white/5"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.type === 'consultation' ? 'bg-blue-500/20 text-blue-400' :
                        activity.type === 'report' ? 'bg-green-500/20 text-green-400' :
                        activity.type === 'treatment' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        <Activity size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm">{activity.action}</p>
                        <p className="text-white/50 text-xs">{activity.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Other tabs placeholder */}
          {activeTab !== 'dashboard' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <GlassCard className="p-8">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  {sidebarItems.find(item => item.id === activeTab)?.label}
                </h2>
                <p className="text-white/70">This feature is coming soon!</p>
              </GlassCard>
            </motion.div>
          )}
        </div>
      </main>
    </motion.div>
  )
}

export default DoctorDashboard
