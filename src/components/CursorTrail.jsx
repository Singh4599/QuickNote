import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const CursorTrail = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [trails, setTrails] = useState([])

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
      
      // Add new trail point
      const newTrail = {
        x: e.clientX,
        y: e.clientY,
        id: Date.now() + Math.random()
      }
      
      setTrails(prev => [...prev.slice(-8), newTrail])
    }

    window.addEventListener('mousemove', updateMousePosition)
    return () => window.removeEventListener('mousemove', updateMousePosition)
  }, [])

  return (
    <>
      {trails.map((trail, index) => (
        <motion.div
          key={trail.id}
          className="fixed pointer-events-none z-50"
          style={{
            left: trail.x - 10,
            top: trail.y - 10,
          }}
          initial={{ scale: 1, opacity: 0.8 }}
          animate={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.6, delay: index * 0.05 }}
        >
          <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 blur-sm opacity-60" />
        </motion.div>
      ))}
      
      <motion.div
        className="cursor-trail"
        style={{
          left: mousePosition.x - 10,
          top: mousePosition.y - 10,
          background: 'radial-gradient(circle, rgba(0, 255, 255, 0.8) 0%, transparent 70%)',
          boxShadow: '0 0 20px rgba(0, 255, 255, 0.6)',
        }}
        animate={{
          scale: [0, 1, 0],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 0.6,
          ease: "easeOut",
        }}
      />
    </>
  )
}

export default CursorTrail
