import { useEffect, useRef } from "react";

const AbstractNetworkBackground = ({ width = window.innerWidth, height = 64 }) => {
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;

    // Titik-titik dalam area navbar
    const pointsCount = 70;
    const points = [];

    // Buat titik dengan posisi dan kecepatan random (halus)
    for (let i = 0; i < pointsCount; i++) {
      points.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3, // kecepatan horisontal kecil
        vy: (Math.random() - 0.5) * 0.3, // kecepatan vertikal kecil
      });
    }

    // Fungsi update posisi titik
    const updatePoints = () => {
      points.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Pantulkan ke tepi canvas
        if (p.x < 0 || p.x > width) p.vx = -p.vx;
        if (p.y < 0 || p.y > height) p.vy = -p.vy;
      });
    };

    // Fungsi menggambar jaringan titik dan garis
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Background gradient gelap biru ke biru tua
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#0d47a1");
      gradient.addColorStop(1, "#0d47a1");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Gambar garis antar titik yang berdekatan
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1;
      for (let i = 0; i < pointsCount; i++) {
        for (let j = i + 1; j < pointsCount; j++) {
          const dx = points[i].x - points[j].x;
          const dy = points[i].y - points[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[j].x, points[j].y);
            ctx.stroke();
          }
        }
      }

      // Gambar titik
      points.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.fill();
      });

      updatePoints();

      animationFrameId.current = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationFrameId.current);
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height,
        pointerEvents: "none",
        zIndex: -1,
      }}
    />
  );
};

export default AbstractNetworkBackground;
