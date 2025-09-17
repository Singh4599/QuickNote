import React from 'react'
import { motion } from 'framer-motion'

const FloatingShapes = () => {
  const shapes = [
    { 
      type: 'circle', 
      size: 'w-32 h-32', 
      position: 'top-20 left-20',
      color: 'from-pink-500 to-rose-500',
      duration: 8
    },
    { 
      type: 'square', 
      size: 'w-24 h-24', 
      position: 'top-40 right-32',
      color: 'from-purple-500 to-indigo-500',
      duration: 12
    },
    { 
      type: 'triangle', 
      size: 'w-20 h-20', 
      position: 'bottom-32 left-40',
      color: 'from-yellow-400 to-orange-500',
      duration: 10
    },
    { 
      type: 'hexagon', 
      size: 'w-28 h-28', 
      position: 'bottom-20 right-20',
      color: 'from-green-400 to-emerald-500',
      duration: 15
    },
    { 
      type: 'diamond', 
      size: 'w-16 h-16', 
      position: 'top-1/2 left-10',
      color: 'from-cyan-400 to-blue-500',
      duration: 7
    },
    { 
      type: 'star', 
      size: 'w-20 h-20', 
      position: 'top-1/3 right-10',
      color: 'from-red-400 to-pink-500',
      duration: 9
    }
  ]

  const getShapeElement = (shape, index) => {
    const baseClasses = `absolute ${shape.size} ${shape.position} bg-gradient-to-br ${shape.color} opacity-20 blur-sm`
    
    switch (shape.type) {
      case 'circle':
        return <div className={`${baseClasses} rounded-full`} />
      case 'square':
        return <div className={`${baseClasses} rounded-lg rotate-45`} />
      case 'triangle':
        return (
          <div 
            className={`${baseClasses} rotate-12`}
            style={{
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
            }}
          />
        )
      case 'hexagon':
        return (
          <div 
            className={`${baseClasses} rotate-30`}
            style={{
              clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
            }}
          />
        )
      case 'diamond':
        return (
          <div 
            className={`${baseClasses} rotate-45`}
            style={{
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
            }}
          />
        )
      case 'star':
        return (
          <div 
            className={`${baseClasses}`}
            style={{
              clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
            }}
          />
        )
      default:
        return <div className={`${baseClasses} rounded-full`} />
    }
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-5">
      {shapes.map((shape, index) => (
        <motion.div
          key={index}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            rotate: [0, 360, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.5
          }}
        >
          {getShapeElement(shape, index)}
        </motion.div>
      ))}
    </div>
  )
}

export default FloatingShapes
