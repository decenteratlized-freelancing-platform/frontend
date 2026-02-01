"use client";
import React, { useRef, useEffect } from 'react';

interface Particle {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
}

const ParticleCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const mouse = useRef<{ x: number | null; y: number | null; radius: number }>({
    x: null,
    y: null,
    radius: 150,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const parent = canvas.parentElement;

    const resizeCanvas = () => {
      if(parent){
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
        initParticles();
      }
    };

    const initParticles = () => {
      particles.current = [];
      const numberOfParticles = (canvas.width * canvas.height) / 9000;
      for (let i = 0; i < numberOfParticles; i++) {
        const size = Math.random() * 2 + 1;
        const x = Math.random() * (canvas.width - size * 2) + size;
        const y = Math.random() * (canvas.height - size * 2) + size;
        const vx = Math.random() * 0.4 - 0.2;
        const vy = Math.random() * 0.4 - 0.2;
        particles.current.push({ x, y, radius: size, vx, vy });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.current.forEach(particle => {
        updateParticle(particle);
      });
      connectParticles();
      animationFrameId = requestAnimationFrame(animate);
    };

    const updateParticle = (particle: Particle) => {
        if (particle.x > canvas.width || particle.x < 0) {
            particle.vx = -particle.vx;
        }
        if (particle.y > canvas.height || particle.y < 0) {
            particle.vy = -particle.vy;
        }
        particle.x += particle.vx;
        particle.y += particle.vy;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fill();
    };

    const connectParticles = () => {
      let opacityValue = 1;
      for (let a = 0; a < particles.current.length; a++) {
        // Connect to other particles
        for (let b = a; b < particles.current.length; b++) {
          const distance = Math.sqrt(
            (particles.current[a].x - particles.current[b].x) ** 2 +
            (particles.current[a].y - particles.current[b].y) ** 2
          );

          if (distance < 100) {
            opacityValue = 1 - distance / 100;
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacityValue})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles.current[a].x, particles.current[a].y);
            ctx.lineTo(particles.current[b].x, particles.current[b].y);
            ctx.stroke();
          }
        }

        // Connect to mouse
        if(mouse.current.x && mouse.current.y){
            const distanceToMouse = Math.sqrt(
                (particles.current[a].x - mouse.current.x) ** 2 +
                (particles.current[a].y - mouse.current.y) ** 2
            );
            if(distanceToMouse < mouse.current.radius){
                opacityValue = 1 - distanceToMouse / mouse.current.radius;
                ctx.strokeStyle = `rgba(255, 255, 255, ${opacityValue})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particles.current[a].x, particles.current[a].y);
                ctx.lineTo(mouse.current.x, mouse.current.y);
                ctx.stroke();
            }
        }
      }
    };
    
    const handleMouseMove = (event: MouseEvent) => {
        if(parent){
            const rect = parent.getBoundingClientRect();
            mouse.current.x = event.clientX - rect.left;
            mouse.current.y = event.clientY - rect.top;
        }
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', resizeCanvas);
    
    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />;
};

export default ParticleCanvas;