import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { supabaseClient } from './config/supabase'
import { AuthProvider, useAuth } from './contexts/AuthContext'

// Components
import CursorTrail from './components/CursorTrail'
import ParticleBackground from './components/ParticleBackground'
import FloatingElements from './components/FloatingElements'

// Pages
import Login from './pages/Login'
import Signup from './pages/Signup'
import PatientDashboard from './pages/PatientDashboard'
import DoctorDashboard from './pages/DoctorDashboard'
import HospitalDashboard from './pages/HospitalDashboard'

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, userRole, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  if (requiredRole && userRole !== requiredRole) {
    // Redirect to appropriate dashboard based on role
    switch (userRole) {
      case 'doctor':
        return <Navigate to="/doctor-dashboard" replace />
      case 'hospital':
        return <Navigate to="/hospital-dashboard" replace />
      default:
        return <Navigate to="/patient-dashboard" replace />
    }
  }
  
  return children
}

function AppContent() {
  const { user, userRole, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl p-8 neon-glow">
          <div className="spinner mx-auto"></div>
          <p className="text-center mt-4 text-white/80">Loading MediVerse AI...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <CursorTrail />
      <ParticleBackground />
      <FloatingElements />
      
      <AnimatePresence mode="wait">
        <Routes>
          <Route 
            path="/login" 
            element={user ? <Navigate to={`/${userRole}-dashboard`} replace /> : <Login />} 
          />
          <Route 
            path="/signup" 
            element={user ? <Navigate to={`/${userRole}-dashboard`} replace /> : <Signup />} 
          />
          <Route 
            path="/patient-dashboard" 
            element={
              <ProtectedRoute requiredRole="patient">
                <PatientDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/doctor-dashboard" 
            element={
              <ProtectedRoute requiredRole="doctor">
                <DoctorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/hospital-dashboard" 
            element={
              <ProtectedRoute requiredRole="hospital">
                <HospitalDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/" 
            element={
              user ? (
                <Navigate to={`/${userRole}-dashboard`} replace />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
        </Routes>
      </AnimatePresence>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}

export default App
