import { useEffect, useRef } from "react";

export const FlameParticles = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles: Array<{
            x: number;
            y: number;
            size: number;
            speedY: number;
            opacity: number;
            color: string;
        }> = [];

        const colors = ["#dc2626", "#ef4444", "#f97316", "#fbbf24"];

        // Adjust particle count based on screen size (less for mobile)
        const isMobile = window.innerWidth < 768;
        const particleCount = isMobile ? 60 : 150;

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                // Spread particles across the full height so they appear immediately
                y: Math.random() * canvas.height,
                // Increased size range from 2-6 to 3-8 for better visibility
                size: Math.random() * 5 + 3,
                // Increased speed from 1.5-3.5
                speedY: Math.random() * 2 + 1.5,
                opacity: Math.random() * 0.5 + 0.5,
                color: colors[Math.floor(Math.random() * colors.length)],
            });
        }

        let animationId: number;

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((particle) => {
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = particle.color;
                ctx.globalAlpha = particle.opacity;
                ctx.fill();

                // Add glow effect
                ctx.shadowBlur = 15;
                ctx.shadowColor = particle.color;

                particle.y -= particle.speedY;
                particle.x += Math.sin(particle.y * 0.01) * 0.5;
                particle.opacity -= 0.003;

                if (particle.y < -10 || particle.opacity <= 0) {
                    particle.y = canvas.height + 10;
                    particle.x = Math.random() * canvas.width;
                    particle.opacity = Math.random() * 0.5 + 0.5;
                }
            });

            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
            animationId = requestAnimationFrame(animate);
        };

        animate();

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none z-10"
        />
    );
};
