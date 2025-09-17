import React, { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

const InteractiveBackground = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationFrameId
    let mouseX = 0
    let mouseY = 0

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const particles = []
    const particleCount = 100

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 3 + 1
        this.speedX = Math.random() * 3 - 1.5
        this.speedY = Math.random() * 3 - 1.5
        this.color = this.getRandomColor()
        this.opacity = Math.random() * 0.8 + 0.2
        this.pulseSpeed = Math.random() * 0.02 + 0.01
        this.pulse = 0
      }

      getRandomColor() {
        const colors = [
          '#ff6b6b', '#ffd93d', '#6bcf7f', '#4ecdc4', 
          '#45b7d1', '#96ceb4', '#ffeaa7', '#fd79a8',
          '#fdcb6e', '#6c5ce7', '#a29bfe', '#fd79a8'
        ]
        return colors[Math.floor(Math.random() * colors.length)]
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY
        this.pulse += this.pulseSpeed

        // Mouse interaction
        const dx = mouseX - this.x
        const dy = mouseY - this.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance < 100) {
          const force = (100 - distance) / 100
          this.x -= dx * force * 0.03
          this.y -= dy * force * 0.03
        }

        // Bounce off edges
        if (this.x > canvas.width) this.x = 0
        if (this.x < 0) this.x = canvas.width
        if (this.y > canvas.height) this.y = 0
        if (this.y < 0) this.y = canvas.height
      }

      draw() {
        const pulseFactor = Math.sin(this.pulse) * 0.5 + 1
        const currentSize = this.size * pulseFactor

        ctx.save()
        ctx.globalAlpha = this.opacity
        ctx.shadowBlur = 20
        ctx.shadowColor = this.color
        
        // Create gradient
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, currentSize * 3
        )
        gradient.addColorStop(0, this.color)
        gradient.addColorStop(1, 'transparent')
        
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(this.x, this.y, currentSize * 3, 0, Math.PI * 2)
        ctx.fill()
        
        // Inner bright core
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, currentSize, 0, Math.PI * 2)
        ctx.fill()
        
        ctx.restore()
      }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw connections
      particles.forEach((particle, i) => {
        particles.slice(i + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x
          const dy = particle.y - otherParticle.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < 150) {
            ctx.save()
            ctx.globalAlpha = (150 - distance) / 150 * 0.3
            ctx.strokeStyle = particle.color
            ctx.lineWidth = 1
            ctx.shadowBlur = 5
            ctx.shadowColor = particle.color
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            ctx.stroke()
            ctx.restore()
          }
        })
      })

      // Update and draw particles
      particles.forEach(particle => {
        particle.update()
        particle.draw()
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    const handleMouseMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    const handleResize = () => {
      resizeCanvas()
    }

    resizeCanvas()
    animate()

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  )
}

export default InteractiveBackground
