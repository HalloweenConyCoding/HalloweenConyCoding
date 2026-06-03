import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const BLUEPRINT_CARDS = [
  {
    title: 'Depth',
    copy: 'Contrast, atmosphere, and glassy surfaces build a premium backdrop without constant heavy effects.',
    icon: (
      <svg viewBox="0 0 60 60" fill="none" style={{ width: '48px', height: '48px', color: 'var(--gold)' }}>
        <circle cx="30" cy="30" r="26" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
        <circle cx="30" cy="30" r="18" stroke="currentColor" strokeWidth="0.8" />
        <circle cx="30" cy="30" r="10" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />
        <circle cx="30" cy="30" r="3" fill="currentColor" opacity="0.8" />
        <line x1="30" y1="4" x2="30" y2="12" stroke="currentColor" strokeWidth="0.8" />
        <line x1="30" y1="48" x2="30" y2="56" stroke="currentColor" strokeWidth="0.8" />
        <line x1="4" y1="30" x2="12" y2="30" stroke="currentColor" strokeWidth="0.8" />
        <line x1="48" y1="30" x2="56" y2="30" stroke="currentColor" strokeWidth="0.8" />
      </svg>
    )
  },
  {
    title: 'Motion',
    copy: 'Scroll responds in real time so the composition feels aligned with the reader instead of looping on its own.',
    icon: (
      <svg viewBox="0 0 60 60" fill="none" style={{ width: '48px', height: '48px', color: 'var(--gold)' }}>
        <path d="M10 45 Q20 15 30 30 Q40 45 50 15" stroke="currentColor" strokeWidth="1.2" fill="none" />
        <circle cx="10" cy="45" r="2.5" fill="currentColor" opacity="0.7" />
        <circle cx="30" cy="30" r="2.5" fill="currentColor" opacity="0.9" />
        <circle cx="50" cy="15" r="2.5" fill="currentColor" opacity="0.7" />
        <line x1="30" y1="8" x2="30" y2="52" stroke="currentColor" strokeWidth="0.4" opacity="0.3" strokeDasharray="2 3" />
      </svg>
    )
  },
  {
    title: 'Clarity',
    copy: 'Readable cards and clean spacing stay first so the spectacle enhances the content instead of hiding it.',
    icon: (
      <svg viewBox="0 0 60 60" fill="none" style={{ width: '48px', height: '48px', color: 'var(--gold)' }}>
        <rect x="10" y="18" width="40" height="5" rx="1" stroke="currentColor" strokeWidth="0.8" />
        <rect x="10" y="28" width="28" height="4" rx="1" stroke="currentColor" strokeWidth="0.8" opacity="0.7" />
        <rect x="10" y="37" width="20" height="4" rx="1" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
        <circle cx="47" cy="39" r="8" stroke="currentColor" strokeWidth="0.8" />
        <line x1="52" y1="44" x2="56" y2="48" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }
];

export default function BlueprintSection() {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const init = () => {
      gsap.from(sectionRef.current?.querySelector('.section-heading'), {
        opacity: 0, y: 50, duration: 1,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', toggleActions: 'play none none none' }
      });

      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.from(card, {
          opacity: 0, y: 60, scale: 0.97,
          duration: 0.9,
          delay: i * 0.12,
          ease: 'cubic-bezier(0.7,0,0.3,1)',
          scrollTrigger: { trigger: card, start: 'top 80%', toggleActions: 'play none none none' }
        });
      });
    };
    init();
  }, []);

  return (
    <section
      id="motion-blueprint"
      ref={sectionRef}
      data-section="blueprint"
      style={{
        position: 'relative',
        zIndex: 10,
        padding: '8rem 2rem 6rem',
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      <div className="section-heading" style={{ marginBottom: '1rem', textAlign: 'center' }}>
        <p className="font-mono" style={{
          fontSize: '0.65rem',
          letterSpacing: '0.3em',
          color: 'var(--gold)',
          textTransform: 'uppercase',
          marginBottom: '1rem',
          opacity: 0.7
        }}>✦ Motion Protocol</p>
        <h2 className="font-cinzel" style={{
          fontSize: 'clamp(1.8rem, 4vw, 3rem)',
          fontWeight: 700,
          letterSpacing: '0.12em',
          color: 'var(--parchment)',
          marginBottom: '1rem'
        }}>Motion blueprint</h2>
        <div className="gold-rule" style={{ width: '160px', margin: '0 auto 1.5rem' }} />
        <p className="font-cormorant" style={{
          fontSize: '1.15rem',
          lineHeight: 1.7,
          color: 'rgba(232,220,200,0.65)',
          maxWidth: '560px',
          margin: '0 auto'
        }}>
          The page behaves like a stage: layered depth, soft lighting, and scroll-linked movement stay visible without turning the layout into a noise field.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginTop: '4rem'
      }}>
        {BLUEPRINT_CARDS.map((card, i) => (
          <article
            key={card.title}
            ref={el => cardsRef.current[i] = el}
            style={{
              background: 'rgba(8,12,26,0.7)',
              border: '1px solid rgba(200,146,58,0.18)',
              padding: '2.5rem 2rem',
              clipPath: 'polygon(10px 0%, calc(100% - 10px) 0%, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0% calc(100% - 10px), 0% 10px)',
              backdropFilter: 'blur(12px)',
              transition: 'border-color 0.4s, box-shadow 0.4s',
              cursor: 'default',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(200,146,58,0.45)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(200,146,58,0.08), inset 0 0 20px rgba(200,146,58,0.03)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(200,146,58,0.18)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ marginBottom: '1.5rem' }}>{card.icon}</div>
            <h3 className="font-cinzel" style={{
              fontSize: '1.1rem',
              fontWeight: 600,
              letterSpacing: '0.15em',
              color: 'var(--gold)',
              marginBottom: '1rem'
            }}>{card.title}</h3>
            <p className="font-cormorant" style={{
              fontSize: '1.05rem',
              lineHeight: 1.65,
              color: 'rgba(232,220,200,0.65)'
            }}>{card.copy}</p>

            {/* Bottom corner accent */}
            <div style={{
              position: 'absolute', bottom: 0, right: 0,
              width: '40px', height: '40px',
              borderTop: '1px solid rgba(200,146,58,0.2)',
              borderLeft: '1px solid rgba(200,146,58,0.2)',
              clipPath: 'polygon(100% 0%, 0% 100%, 100% 100%)',
              background: 'rgba(200,146,58,0.04)'
            }} />
          </article>
        ))}
      </div>
    </section>
  );
}