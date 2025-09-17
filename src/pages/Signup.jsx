import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Mail, Lock, User, Phone, MapPin, Stethoscope, Building2, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { ROLES, APP_CONFIG } from '../config/supabase'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    city: '',
    role: ROLES.PATIENT,
    specialization: '',
    license_number: '',
    hospital_name: '',
    hospital_city: '',
    hospital_contact: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signUp } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await signUp(formData.email, formData.password, formData)
      
      if (error) {
        setError(error.message)
        return
      }

      // Show success message or redirect
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center p-4 relative z-20"
    >
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <motion.h1 
              className="text-5xl font-black bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent mb-3 relative"
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                filter: 'drop-shadow(0 0 30px rgba(20, 184, 166, 0.4))'
              }}
            >
              MediVerse AI
            </motion.h1>
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg blur opacity-20 animate-pulse"></div>
          </motion.div>
          <motion.p 
            className="text-slate-300 text-lg font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Join the future of healthcare
          </motion.p>
        </motion.div>

        <motion.div
          className="relative backdrop-blur-xl bg-gradient-to-br from-slate-900/80 via-emerald-900/20 to-slate-900/80 border border-emerald-500/30 rounded-3xl p-8 shadow-2xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
          style={{
            boxShadow: '0 0 60px rgba(20, 184, 166, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-full blur-xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-teal-500/20 to-transparent rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="relative z-10"
          >
            <div className="text-center mb-8">
              <motion.h2 
                className="text-3xl font-bold text-white mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Create Account
              </motion.h2>
              <motion.div 
                className="w-16 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto rounded-full"
                initial={{ width: 0 }}
                animate={{ width: 64 }}
                transition={{ delay: 0.8, duration: 0.8 }}
              ></motion.div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/80">
                  Account Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(ROLES).map(([key, value]) => (
                    <motion.button
                      key={value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, role: value }))}
                      className={`p-3 rounded-xl glass border transition-all duration-300 ${
                        formData.role === value
                          ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                          : 'border-white/20 text-white/70 hover:border-white/40'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {key.charAt(0) + key.slice(1).toLowerCase()}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  name="name"
                  label="Full Name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  icon={User}
                  required
                />

                <Input
                  name="email"
                  type="email"
                  label="Email Address"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  icon={Mail}
                  required
                />

                <div className="relative">
                  <Input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    label="Password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    icon={Lock}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-white/60 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    icon={Lock}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-9 text-white/60 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <Input
                  name="phone"
                  label="Phone Number"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  icon={Phone}
                />

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/80">
                    City
                  </label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl glass border border-white/20 text-white bg-transparent backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="" className="bg-gray-800">Select your city</option>
                    {APP_CONFIG.CITIES.map(city => (
                      <option key={city} value={city} className="bg-gray-800">{city}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Role-specific fields */}
              {formData.role === ROLES.DOCTOR && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/80">
                      Specialization
                    </label>
                    <select
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl glass border border-white/20 text-white bg-transparent backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="" className="bg-gray-800">Select specialization</option>
                      {APP_CONFIG.SPECIALIZATIONS.map(spec => (
                        <option key={spec} value={spec} className="bg-gray-800">{spec}</option>
                      ))}
                    </select>
                  </div>

                  <Input
                    name="license_number"
                    label="License Number"
                    placeholder="Enter your license number"
                    value={formData.license_number}
                    onChange={handleChange}
                    icon={Stethoscope}
                  />
                </div>
              )}

              {formData.role === ROLES.HOSPITAL && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    name="hospital_name"
                    label="Hospital Name"
                    placeholder="Enter hospital name"
                    value={formData.hospital_name}
                    onChange={handleChange}
                    icon={Building2}
                  />

                  <Input
                    name="hospital_contact"
                    label="Hospital Contact"
                    placeholder="Enter hospital contact"
                    value={formData.hospital_contact}
                    onChange={handleChange}
                    icon={Phone}
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                loading={loading}
                rocket
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-8 text-center"
            >
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-slate-900/50 text-slate-400">or</span>
                </div>
              </div>
              <p className="text-slate-300 mt-6">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-emerald-400 hover:text-teal-300 font-semibold transition-colors hover:underline"
                >
                  Sign in here
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Signup
