import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

const ElectricCard = ({ 
  children, 
  className, 
  hover3d = false, 
  electric = true,
  ...props 
}) => {
  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-xl",
        electric && "electric-border",
        className
      )}
      whileHover={hover3d ? { 
        rotateX: 5, 
        rotateY: 5, 
        scale: 1.02,
        transition: { duration: 0.2 }
      } : { scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{ 
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
      {...props}
    >
      {electric && (
        <div className="electric-border-content">
          {children}
        </div>
      )}
      {!electric && children}
    </motion.div>
  )
}

export default ElectricCard
