import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Upload, 
  FileText, 
  Calendar, 
  User, 
  Settings, 
  LogOut,
  Activity,
  Heart,
  Brain,
  Shield,
  Search,
  Bell
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabaseClient } from '../config/supabase'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import AIDiagnostics from '../components/AIDiagnostics'

const PatientDashboard = () => {
  const { user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      const { data, error } = await supabaseClient
        .from('diagnostic_reports')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setReports(data || [])
    } catch (error) {
      console.error('Failed to load reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'ai-diagnostics', label: 'AI Diagnostics', icon: Brain },
    { id: 'appointments', label: 'My Appointments', icon: Calendar },
    { id: 'reports', label: 'Medical Reports', icon: FileText },
    { id: 'doctors', label: 'Find Doctors', icon: Search },
    { id: 'hospitals', label: 'Find Hospitals', icon: Shield },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  const stats = [
    { label: 'Total Reports', value: reports.length, icon: FileText, color: 'blue' },
    { label: 'Pending Analysis', value: reports.filter(r => r.processing_status === 'pending').length, icon: Brain, color: 'yellow' },
    { label: 'Completed', value: reports.filter(r => r.processing_status === 'completed').length, icon: Shield, color: 'green' },
    { label: 'Health Score', value: '92%', icon: Heart, color: 'red' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex relative z-20"
    >
      {/* Enhanced Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-72 float-3d relative"
      >
        {/* Background gradient and effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 to-purple-900/30 z-0"></div>
        
        {/* Electric border effect wrapper */}
        <div className="electric-border h-full w-full">
          <div className="electric-border-content h-full w-full p-6">
            
            {/* Logo section with glow */}
            <div className="flex items-center gap-3 mb-8 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center font-bold text-white neon-glow-cyan">
                MV
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">MediVerse AI</h1>
                <p className="text-white/60 text-sm">Patient Portal</p>
              </div>
            </div>

            {/* User profile with glow */}
            <div className="mb-8 relative z-10">
              <div className="flex items-center gap-3 p-3 rounded-xl glass border border-white/10 neon-glow">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center justify-center text-white font-semibold">
                  {user?.user_metadata?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="text-white font-medium">{user?.user_metadata?.name || 'User'}</p>
                  <p className="text-white/60 text-sm">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Navigation items with enhanced active state */}
            <nav className="space-y-2 relative z-10">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 relative z-10 ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-blue-500/30 to-cyan-500/20 text-blue-300 border border-blue-500/30 neon-glow-cyan'
                        : 'text-white/70 hover:text-white hover:bg-white/5 hover:border border-white/10'
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

            {/* Sign out button */}
            <div className="mt-auto pt-6 relative z-10">
              <Button
                onClick={signOut}
                variant="ghost"
                className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border border-red-500/30"
              >
                <LogOut size={20} className="mr-3" />
                Sign Out
              </Button>
            </div>
          </div>
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
              <motion.h1 
                className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2"
                style={{
                  filter: 'drop-shadow(0 0 10px rgba(0, 255, 255, 0.5))'
                }}
              >
                Welcome back, {user?.user_metadata?.name || 'Patient'}!
              </motion.h1>
              <p className="text-white/70">
                Monitor your health with AI-powered insights
              </p>
            </div>
            <Button className="flex items-center gap-2">
              <Bell size={20} />
              Notifications
            </Button>
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

              {/* Quick Actions */}
              <GlassCard className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={() => setActiveTab('ai-diagnostics')}
                    className="flex items-center gap-3 justify-start p-4 h-auto"
                    rocket
                  >
                    <Upload size={24} />
                    <div className="text-left">
                      <p className="font-semibold">Upload Medical Files</p>
                      <p className="text-sm opacity-80">Get AI analysis instantly</p>
                    </div>
                  </Button>
                  
                  <Button
                    onClick={() => setActiveTab('appointments')}
                    variant="secondary"
                    className="flex items-center gap-3 justify-start p-4 h-auto"
                  >
                    <Calendar size={24} />
                    <div className="text-left">
                      <p className="font-semibold">Book Appointment</p>
                      <p className="text-sm opacity-80">Find available doctors</p>
                    </div>
                  </Button>
                  
                  <Button
                    onClick={() => setActiveTab('reports')}
                    variant="outline"
                    className="flex items-center gap-3 justify-start p-4 h-auto"
                  >
                    <FileText size={24} />
                    <div className="text-left">
                      <p className="font-semibold">View Reports</p>
                      <p className="text-sm opacity-80">Access your history</p>
                    </div>
                  </Button>
                </div>
              </GlassCard>

              {/* Recent Reports */}
              <GlassCard className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Recent Reports</h2>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="spinner"></div>
                  </div>
                ) : reports.length > 0 ? (
                  <div className="space-y-3">
                    {reports.slice(0, 3).map((report) => (
                      <motion.div
                        key={report.id}
                        className="flex items-center justify-between p-4 rounded-xl glass border border-white/10"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <FileText size={20} className="text-blue-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{report.title || 'Medical Report'}</p>
                            <p className="text-white/60 text-sm">
                              {new Date(report.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          report.processing_status === 'completed' 
                            ? 'bg-green-500/20 text-green-400'
                            : report.processing_status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {report.processing_status}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-white/60">
                    <FileText size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No reports yet. Upload your first medical file to get started!</p>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          )}

          {/* AI Diagnostics Tab */}
          {activeTab === 'ai-diagnostics' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AIDiagnostics onReportsUpdate={loadReports} />
            </motion.div>
          )}

          {/* Other tabs placeholder */}
          {activeTab !== 'dashboard' && activeTab !== 'ai-diagnostics' && (
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

export default PatientDashboard
