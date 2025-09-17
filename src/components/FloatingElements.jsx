import React from 'react'
import { motion } from 'framer-motion'

const FloatingElements = () => {
  const elements = [
    { size: 'w-32 h-32', gradient: 'from-blue-400 to-cyan-400', delay: 0, position: 'top-20 left-20' },
    { size: 'w-24 h-24', gradient: 'from-emerald-400 to-teal-500', delay: 2, position: 'bottom-20 right-20' },
    { size: 'w-16 h-16', gradient: 'from-sky-400 to-blue-500', delay: 1, position: 'top-1/2 right-10' },
    { size: 'w-20 h-20', gradient: 'from-purple-400 to-pink-400', delay: 3, position: 'bottom-1/3 left-10' },
  ]

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {elements.map((element, index) => (
        <motion.div
          key={index}
          className="absolute w-64 h-64 rounded-full opacity-30 blur-3xl animate-float"
          style={{
            background: `linear-gradient(45deg, ${colors[index % colors.length]})`,
          }}
          animate={{
            y: [-10, 10, -10],
            x: [-5, 5, -5],
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 6,
            delay: element.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  )
}

export default FloatingElements
