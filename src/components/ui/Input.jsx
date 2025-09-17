import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

const Input = ({ 
  className = '', 
  type = 'text',
  label,
  error,
  icon: Icon,
  ...props 
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-white/80">
          {label}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60">
            <Icon size={20} />
          </div>
        )}
        
        <motion.input
          type={type}
          className={cn(
            'w-full px-4 py-3 rounded-xl glass border border-white/20',
            'text-white placeholder-white/50 backdrop-blur-xl',
            'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50',
            'transition-all duration-300',
            Icon && 'pl-11',
            error && 'border-red-500/50 focus:ring-red-500/50',
            className
          )}
          whileFocus={{ scale: 1.02 }}
          {...props}
        />
      </div>
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-sm"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}

export default Input
