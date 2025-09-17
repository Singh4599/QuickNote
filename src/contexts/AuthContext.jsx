import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabaseClient, ROLES } from '../config/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session } } = await supabaseClient.auth.getSession()
        if (session?.user) {
          setUser(session.user)
          setUserRole(session.user.user_metadata?.role || ROLES.PATIENT)
        }
      } catch (error) {
        console.error('Error getting session:', error)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          setUserRole(session.user.user_metadata?.role || ROLES.PATIENT)
        } else {
          setUser(null)
          setUserRole(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password, userData) => {
    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })

      if (error) throw error

      // Insert user profile
      if (data.user) {
        const { error: profileError } = await supabaseClient
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email,
            name: userData.name,
            role: userData.role,
            phone: userData.phone,
            city: userData.city,
            specialization: userData.specialization,
            license_number: userData.license_number,
            hospital_name: userData.hospital_name,
            hospital_city: userData.hospital_city,
            hospital_contact: userData.hospital_contact
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
        }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      return { data: null, error }
    }
  }

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabaseClient.auth.signOut()
      if (error) throw error
      setUser(null)
      setUserRole(null)
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const getCurrentUser = () => user

  const value = {
    user,
    userRole,
    loading,
    signUp,
    signIn,
    signOut,
    getCurrentUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
