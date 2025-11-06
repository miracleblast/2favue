<template>
  <canvas ref="canvasRef" class="particles-background"></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref<HTMLCanvasElement>()

class ParticleEngine {
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private particles: any[] = []
  private mouse = { x: 0, y: 0 }
  private animationId: number | null = null

  init(canvasElement: HTMLCanvasElement) {
    console.log('🚀 ParticleEngine initializing...')
    this.canvas = canvasElement
    this.ctx = this.canvas.getContext('2d')
    
    if (!this.ctx) {
      console.error('❌ Could not get canvas context')
      return
    }
    
    this.resize()
    this.createParticles()
    this.animate()
    
    window.addEventListener('resize', () => this.resize())
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX
      this.mouse.y = e.clientY
    })
    
    console.log('✅ ParticleEngine initialized with', this.particles.length, 'particles')
  }

  resize() {
    if (!this.canvas) return
    
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
    this.createParticles()
  }

  createParticles() {
    this.particles = []
    const particleCount = 40
    
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 2 + 1,
        speedX: Math.random() * 0.5 - 0.25,
        speedY: Math.random() * 0.5 - 0.25,
        color: `rgba(59, 130, 246, ${Math.random() * 0.5 + 0.2})`
      })
    }
  }

  animate() {
    if (!this.ctx || !this.canvas) return
    
    // Clear with trail effect
    this.ctx.fillStyle = 'rgba(10, 15, 26, 0.05)'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    
    // Update and draw particles
    this.particles.forEach(particle => {
      particle.x += particle.speedX
      particle.y += particle.speedY
      
      // Bounce off edges
      if (particle.x > this.canvas!.width || particle.x < 0) particle.speedX *= -1
      if (particle.y > this.canvas!.height || particle.y < 0) particle.speedY *= -1
      
      // Mouse interaction
      const dx = particle.x - this.mouse.x
      const dy = particle.y - this.mouse.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance < 100) {
        const force = 2 * (1 - distance / 100)
        particle.x += (dx / distance) * force
        particle.y += (dy / distance) * force
      }
      
      // Draw particle
      this.ctx!.beginPath()
      this.ctx!.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      this.ctx!.fillStyle = particle.color
      this.ctx!.fill()
    })
    
    // Draw connections
    this.particles.forEach((particle, i) => {
      for (let j = i + 1; j < this.particles.length; j++) {
        const otherParticle = this.particles[j]
        const dx = particle.x - otherParticle.x
        const dy = particle.y - otherParticle.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance < 100) {
          this.ctx!.beginPath()
          this.ctx!.strokeStyle = `rgba(99, 102, 241, ${0.2 * (1 - distance / 100)})`
          this.ctx!.lineWidth = 0.5
          this.ctx!.moveTo(particle.x, particle.y)
          this.ctx!.lineTo(otherParticle.x, otherParticle.y)
          this.ctx!.stroke()
        }
      }
    })
    
    this.animationId = requestAnimationFrame(() => this.animate())
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
  }
}

const particleEngine = new ParticleEngine()

onMounted(() => {
  console.log('🎯 ParticlesBackground mounted')
  if (canvasRef.value) {
    particleEngine.init(canvasRef.value)
  } else {
    console.error('❌ canvasRef is null')
  }
})

onUnmounted(() => {
  console.log('🧹 ParticlesBackground unmounted')
  particleEngine.destroy()
})
</script>

<style scoped>
.particles-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  background: linear-gradient(135deg, #0a0f1a 0%, #1e293b 100%);
  pointer-events: none;
}
</style>
