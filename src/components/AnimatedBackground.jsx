import React, { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

const AnimatedBackground = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationFrameId
    let time = 0

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const drawWave = (offset, amplitude, frequency, color, opacity) => {
      ctx.save()
      ctx.globalAlpha = opacity
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.shadowBlur = 20
      ctx.shadowColor = color
      
      ctx.beginPath()
      for (let x = 0; x <= canvas.width; x += 5) {
        const y = canvas.height / 2 + Math.sin((x * frequency) + offset) * amplitude
        if (x === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.stroke()
      ctx.restore()
    }

    const drawGeometricShapes = () => {
      const shapes = [
        { x: 100, y: 100, size: 50, rotation: time * 0.01, color: '#ff6b6b' },
        { x: canvas.width - 150, y: 150, size: 30, rotation: -time * 0.015, color: '#ffd93d' },
        { x: 200, y: canvas.height - 200, size: 40, rotation: time * 0.02, color: '#6bcf7f' },
        { x: canvas.width - 100, y: canvas.height - 100, size: 35, rotation: -time * 0.012, color: '#4ecdc4' }
      ]

      shapes.forEach(shape => {
        ctx.save()
        ctx.translate(shape.x, shape.y)
        ctx.rotate(shape.rotation)
        ctx.globalAlpha = 0.3
        ctx.shadowBlur = 15
        ctx.shadowColor = shape.color
        
        // Draw hexagon
        ctx.beginPath()
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3
          const x = Math.cos(angle) * shape.size
          const y = Math.sin(angle) * shape.size
          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.closePath()
        ctx.strokeStyle = shape.color
        ctx.lineWidth = 2
        ctx.stroke()
        
        ctx.restore()
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw animated waves
      drawWave(time * 0.02, 50, 0.01, '#ff6b6b', 0.4)
      drawWave(time * 0.025 + Math.PI, 30, 0.015, '#ffd93d', 0.3)
      drawWave(time * 0.03 + Math.PI * 0.5, 40, 0.012, '#6bcf7f', 0.35)
      drawWave(time * 0.018 + Math.PI * 1.5, 25, 0.018, '#4ecdc4', 0.25)
      
      // Draw geometric shapes
      drawGeometricShapes()
      
      time += 1
      animationFrameId = requestAnimationFrame(animate)
    }

    resizeCanvas()
    animate()

    const handleResize = () => {
      resizeCanvas()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-1"
      style={{ background: 'transparent' }}
    />
  )
}

export default AnimatedBackground
