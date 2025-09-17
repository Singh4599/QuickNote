import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const AdvancedCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [cursorVariant, setCursorVariant] = useState('default')
  const [isClicking, setIsClicking] = useState(false)
  const [trails, setTrails] = useState([])

  useEffect(() => {
    const mouseMove = (e) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY
      })

      // Add trail point
      setTrails(prev => [
        ...prev.slice(-20), // Keep last 20 points
        {
          x: e.clientX,
          y: e.clientY,
          id: Date.now()
        }
      ])
    }

    const mouseDown = () => setIsClicking(true)
    const mouseUp = () => setIsClicking(false)

    window.addEventListener('mousemove', mouseMove)
    window.addEventListener('mousedown', mouseDown)
    window.addEventListener('mouseup', mouseUp)

    return () => {
      window.removeEventListener('mousemove', mouseMove)
      window.removeEventListener('mousedown', mouseDown)
      window.removeEventListener('mouseup', mouseUp)
    }
  }, [])

  const variants = {
    default: {
      x: mousePosition.x - 16,
      y: mousePosition.y - 16,
      scale: 1,
    },
    text: {
      height: 150,
      width: 150,
      x: mousePosition.x - 75,
      y: mousePosition.y - 75,
      backgroundColor: "rgba(255, 107, 107, 0.3)",
      mixBlendMode: "difference"
    },
    click: {
      x: mousePosition.x - 16,
      y: mousePosition.y - 16,
      scale: 0.8,
    }
  }

  return (
    <>
      {/* Trail particles */}
      {trails.map((trail, index) => (
        <motion.div
          key={trail.id}
          className="fixed pointer-events-none z-50"
          style={{
            left: trail.x - 4,
            top: trail.y - 4,
          }}
          initial={{ scale: 1, opacity: 0.8 }}
          animate={{ scale: 0, opacity: 0 }}
          transition={{ duration: 1, delay: index * 0.02 }}
        >
          <div 
            className="w-2 h-2 rounded-full"
            style={{
              background: `linear-gradient(45deg, 
                hsl(${(index * 20) % 360}, 70%, 60%), 
                hsl(${(index * 20 + 60) % 360}, 70%, 60%))`
            }}
          />
        </motion.div>
      ))}

      {/* Main cursor */}
      <motion.div
        className="cursor fixed top-0 left-0 pointer-events-none z-50 mix-blend-mode-difference"
        variants={variants}
        animate={isClicking ? 'click' : cursorVariant}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28
        }}
      >
        <div className="w-8 h-8 rounded-full border-2 border-white relative">
          {/* Rotating rings */}
          <motion.div
            className="absolute inset-0 rounded-full border border-pink-400"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-1 rounded-full border border-yellow-400"
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-2 rounded-full border border-green-400"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Center dot */}
          <div className="absolute inset-3 rounded-full bg-white animate-pulse" />
        </div>
      </motion.div>

      {/* Magnetic effect */}
      <motion.div
        className="fixed pointer-events-none z-40"
        style={{
          left: mousePosition.x - 50,
          top: mousePosition.y - 50,
        }}
        animate={{
          scale: isClicking ? [1, 1.5, 1] : 1,
          rotate: [0, 360],
        }}
        transition={{
          scale: { duration: 0.3 },
          rotate: { duration: 8, repeat: Infinity, ease: "linear" }
        }}
      >
        <div className="w-24 h-24 rounded-full border border-purple-400 opacity-20" />
      </motion.div>
    </>
  )
}

export default AdvancedCursor
