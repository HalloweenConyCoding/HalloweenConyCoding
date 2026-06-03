import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
import AgentCard from './AgentCard';

const GROUPS = [
  {
    label: 'Executive Council',
    note: 'apex authority',
    names: ['me', 'cony'],
    large: true,
    accentColor: '#d4af37'
  },
  {
    label: 'Core Leads',
    note: 'memory · build · review · fact · critique',
    names: ['wise', 'orin', 'argus', 'thales', 'vera', 'nyx'],
    accentColor: '#1a9b7a'
  },
  {
    label: 'Domain Leads',
    note: 'WIN · NEXUS · MUSE',
    names: ['win', 'nexus', 'muse'],
    accentColor: '#c8923a',
    mixed: true
  },
  {
    label: 'NEXUS Subagents',
    note: 'telecom specialists',
    names: ['marconi', 'regis', 'terra', 'prism', 'delta', 'talos'],
    accentColor: '#c8923a',
    indent: true
  },
  {
    label: 'MUSE Subagents',
    note: 'design specialists',
    names: ['vivid', 'nova', 'axiom', 'rhythm'],
    accentColor: '#c8923a',
    indent: true
  }
];

export default function HierarchySection({ nodes }) {
  const sectionRef = useRef(null);
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  useEffect(() => {
    const init = () => {
      const groups = sectionRef.current?.querySelectorAll('.hierarchy-group');
      groups?.forEach(group => {
        const heading = group.querySelector('.group-heading');
        const cards = group.querySelectorAll('.codex-card');

        if (heading) {
          gsap.from(heading, {
            opacity: 0, x: -30, duration: 0.8,
            scrollTrigger: { trigger: group, start: 'top 80%', toggleActions: 'play none none none' }
          });
        }

        gsap.from(cards, {
          opacity: 0, y: 60, scale: 0.97,
          duration: 0.85,
          stagger: 0.07,
          ease: 'cubic-bezier(0.7,0,0.3,1)',
          scrollTrigger: { trigger: group, start: 'top 75%', toggleActions: 'play none none none' }
        });
      });
    };
    init();
  }, []);

  return (
    <section
      id="hierarchy"
      ref={sectionRef}
      data-section="hierarchy"
      aria-labelledby="hierarchy-title"
      style={{
        position: 'relative',
        zIndex: 10,
        padding: '8rem 2rem 10rem',
        maxWidth: '1400px',
        margin: '0 auto',
      }}
    >
      {/* Section heading */}
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <p className="font-mono" style={{
          fontSize: '0.65rem', letterSpacing: '0.3em',
          color: 'var(--gold)', textTransform: 'uppercase',
          marginBottom: '1rem', opacity: 0.7
        }}>◈ Codex Structure</p>
        <h2 id="hierarchy-title" className="font-cinzel" style={{
          fontSize: 'clamp(1.8rem, 4vw, 3rem)',
          fontWeight: 700, letterSpacing: '0.12em',
          color: 'var(--parchment)', marginBottom: '1rem'
        }}>Team structure</h2>
        <div className="gold-rule" style={{ width: '160px', margin: '0 auto 1.5rem' }} />
        <p className="font-cormorant" style={{
          fontSize: '1.15rem', lineHeight: 1.7,
          color: 'rgba(232,220,200,0.6)',
          maxWidth: '580px', margin: '0 auto'
        }}>
          The visible structure keeps one clean chain: ME above CONY, then the core, execution, and review leads, followed by the domain leads and their subagents. Each card flips to show the full role details.
        </p>
      </div>

      {/* Groups */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', marginTop: '5rem' }}>
        {GROUPS.map((group) => {
          const groupNodes = group.names.map(name => nodeMap.get(name)).filter(Boolean);

          return (
            <div
              key={group.label}
              className="hierarchy-group"
              style={{
                paddingLeft: group.indent ? 'clamp(0px, 4vw, 3rem)' : '0',
              }}
            >
              {/* Group heading */}
              <div className="group-heading" style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '1rem',
                marginBottom: '1.5rem',
                paddingBottom: '0.75rem',
                borderBottom: `1px solid ${group.accentColor}22`,
                position: 'relative'
              }}>
                {/* Left accent line */}
                <div style={{
                  position: 'absolute', left: '-1.5rem', top: '50%',
                  width: '1rem', height: '1px',
                  background: group.accentColor,
                  opacity: 0.5,
                  display: group.indent ? 'block' : 'none'
                }} />

                <strong className="font-cinzel" style={{
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  letterSpacing: '0.15em',
                  color: group.accentColor,
                  textTransform: 'uppercase'
                }}>{group.label}</strong>

                <span className="font-mono" style={{
                  fontSize: '0.6rem',
                  letterSpacing: '0.12em',
                  color: 'rgba(232,220,200,0.3)',
                  textTransform: 'uppercase'
                }}>{group.note}</span>

                {/* Decorative rule extending right */}
                <div style={{
                  flex: 1,
                  height: '1px',
                  background: `linear-gradient(90deg, ${group.accentColor}33, transparent)`,
                  alignSelf: 'center'
                }} />
              </div>

              {/* Card grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: group.large
                  ? 'repeat(auto-fit, minmax(220px, 1fr))'
                  : 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '1rem',
                maxWidth: group.large ? '560px' : '100%',
              }}>
                {groupNodes.map((node, i) => (
                  <AgentCard
                    key={node.id}
                    node={node}
                    index={i}
                    totalCount={groupNodes.length}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}