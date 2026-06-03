import { useMemo } from 'react';

const PARTICLE_COUNT = 24;

export default function ParticleField() {
  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: 1 + Math.random() * 2,
      opacity: 0.03 + Math.random() * 0.06,
      duration: 12 + Math.random() * 20,
      delay: Math.random() * -25,
      drift: (Math.random() - 0.5) * 60
    }));
  }, []);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1,
      pointerEvents: 'none',
      overflow: 'hidden'
    }}>
      <style>{`
        @keyframes dustFloat {
          0% { transform: translateY(100vh) translateX(0px) scale(0.8); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.8; }
          100% { transform: translateY(-10vh) translateX(var(--drift)) scale(1.2); opacity: 0; }
        }
      `}</style>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            bottom: 0,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: '50%',
            background: 'var(--gold)',
            opacity: p.opacity,
            '--drift': `${p.drift}px`,
            animation: `dustFloat ${p.duration}s ${p.delay}s infinite linear`
          }}
        />
      ))}
    </div>
  );
}