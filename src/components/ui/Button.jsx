import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

const Button = ({ 
  children, 
  className = '', 
  variant = 'primary',
  size = 'md',
  rocket = false,
  loading = false,
  disabled = false,
  onClick,
  ...props 
}) => {
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }

  const variants = {
    primary: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg hover:shadow-xl focus:ring-blue-500 border border-blue-400 hover:shadow-blue-500/25',
    secondary: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:shadow-xl focus:ring-emerald-500 border border-emerald-400 hover:shadow-emerald-500/25',
    outline: 'border-2 border-blue-400 text-blue-400 hover:bg-blue-500 hover:text-white focus:ring-blue-500 hover:shadow-lg hover:shadow-blue-500/25',
    ghost: 'text-blue-300 hover:text-white hover:bg-blue-500/20 border border-transparent hover:border-blue-400'
  }

  return (
    <motion.button
      className={cn(
        'relative overflow-hidden rounded-xl font-semibold transition-all duration-300',
        'backdrop-blur-sm',
        rocket && 'btn-rocket',
        variants[variant],
        sizes[size],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={disabled ? undefined : onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
          Loading...
        </div>
      ) : (
        children
      )}
      
      {rocket && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6 }}
        />
      )}
    </motion.button>
  )
}

export default Button
