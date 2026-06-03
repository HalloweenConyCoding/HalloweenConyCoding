import { useRef, useState, useCallback } from 'react';
import { NODE_MAP, PIPELINE_COLORS, PIPELINE_LABELS, SIGILS, PORTRAIT_PATHS } from './nodeData';

const PHASE_DURATION = 250; // ms per phase of flip

export default function AgentCard({ node, index, totalCount }) {
  const cardRef = useRef(null);
  const [flipped, setFlipped] = useState(false);
  const [flipping, setFlipping] = useState(false);
  const frontRef = useRef(null);
  const backRef = useRef(null);

  const pipelineColor = PIPELINE_COLORS[node.pipeline] || PIPELINE_COLORS.core;
  const pipelineLabel = PIPELINE_LABELS[node.pipeline] || node.pipeline;
  const reportsToLabel = node.reports_to === 'none'
    ? 'none'
    : NODE_MAP.get(node.reports_to)?.display_name ?? node.reports_to;
  const num = String(index + 1).padStart(2, '0');
  const sigil = SIGILS[node.id] || SIGILS['me'];

  const spawnParticles = (card) => {
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    for (let i = 0; i < 12; i++) {
      const p = document.createElement('div');
      const angle = (i / 12) * Math.PI * 2;
      const dist = 30 + Math.random() * 50;
      const size = 2 + Math.random() * 3;
      p.style.cssText = `
        position:fixed;left:${cx}px;top:${cy}px;width:${size}px;height:${size}px;
        border-radius:50%;background:var(--gold);pointer-events:none;z-index:9999;
        transition:transform 0.6s cubic-bezier(0.2,0,0.8,1),opacity 0.6s ease;
      `;
      document.body.appendChild(p);
      requestAnimationFrame(() => {
        p.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px)`;
        p.style.opacity = '0';
      });
      setTimeout(() => p.remove(), 650);
    }
  };

  const handleFlip = useCallback(() => {
    if (flipping) return;
    setFlipping(true);
    spawnParticles(cardRef.current);

    // Phase 1: rotate front to -90
    const front = frontRef.current;
    const back = backRef.current;
    if (!front || !back) { setFlipping(false); return; }

    front.style.transition = `transform ${PHASE_DURATION}ms ease-in`;
    front.style.transform = 'rotateY(-90deg)';

    setTimeout(() => {
      // Phase 2: swap faces
      front.style.display = flipped ? 'flex' : 'none';
      back.style.display = flipped ? 'none' : 'flex';
      // Snap back to start angle
      back.style.transition = 'none';
      back.style.transform = 'rotateY(-90deg)';

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Phase 3: rotate back to 0
          back.style.transition = `transform ${PHASE_DURATION}ms ease-out`;
          back.style.transform = 'rotateY(0deg)';
          setTimeout(() => {
            setFlipped(f => !f);
            setFlipping(false);
          }, PHASE_DURATION);
        });
      });
    }, PHASE_DURATION);
  }, [flipped, flipping]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleFlip(); }
  };

  // Magnetic hover
  const handleMouseMove = (e) => {
    const rect = cardRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / rect.width;
    const dy = (e.clientY - cy) / rect.height;
    cardRef.current.style.transform = `translate(${dx * 6}px, ${dy * 6}px)`;
  };
  const handleMouseLeave = () => {
    cardRef.current.style.transform = 'translate(0,0)';
  };

  return (
    <article
      ref={cardRef}
      className="codex-card"
      tabIndex={0}
      role="button"
      aria-pressed={flipped}
      aria-label={`${node.display_name}, ${node.role_id}. Click to flip.`}
      data-node={node.id}
      data-pipeline={node.pipeline}
      onClick={handleFlip}
      onKeyDown={handleKeyDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        perspective: '1200px',
        cursor: 'pointer',
        transition: 'transform 0.4s cubic-bezier(0.7,0,0.3,1)',
        outline: 'none',
        userSelect: 'none',
        minHeight: '260px',
        '--pipeline-color': pipelineColor,
      }}
    >
      {/* Pipeline tab */}
      <div className="font-mono" style={{
        position: 'absolute',
        top: '-1px', left: '12px',
        fontSize: '0.55rem',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        background: pipelineColor,
        color: '#0d0805',
        padding: '2px 8px',
        fontWeight: 700,
        zIndex: 2
      }}>
        {pipelineLabel}
      </div>

      {/* FRONT FACE */}
      <div
        ref={frontRef}
        style={{
          position: 'absolute', inset: 0,
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(160deg, #0b1022 0%, #080c1a 100%)',
          border: `1px solid rgba(200,146,58,0.25)`,
          clipPath: 'polygon(10px 0%, calc(100% - 10px) 0%, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0% calc(100% - 10px), 0% 10px)',
          overflow: 'hidden',
          padding: '2rem 1.25rem 1.25rem',
          boxShadow: `0 0 20px rgba(0,0,0,0.5), inset 0 0 15px rgba(200,146,58,0.02)`,
        }}
      >
        {/* Sequence number */}
        <span className="font-mono" style={{
          position: 'absolute', top: '1rem', right: '1rem',
          fontSize: '0.6rem', color: 'rgba(200,146,58,0.4)',
          letterSpacing: '0.1em'
        }}>{num} / {totalCount}</span>

        {/* Sigil */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: pipelineColor, marginBottom: '0.5rem', opacity: 0.85
        }}>
          <div style={{ width: '72px', height: '72px' }} dangerouslySetInnerHTML={{ __html: sigil }} />
        </div>

        {/* Name + role */}
        <div>
          <h2 className="font-cinzel" style={{
            fontSize: '1.05rem', fontWeight: 700, letterSpacing: '0.15em',
            color: 'var(--parchment)', marginBottom: '0.3rem'
          }}>{node.display_name}</h2>
          <div className="font-mono" style={{
            fontSize: '0.6rem', letterSpacing: '0.2em',
            color: pipelineColor, textTransform: 'uppercase', opacity: 0.8
          }}>{node.role_id}</div>
        </div>

        {/* Flip hint */}
        <span className="font-mono" style={{
          position: 'absolute', bottom: '0.75rem', right: '1rem',
          fontSize: '0.55rem', letterSpacing: '0.1em',
          color: 'rgba(200,146,58,0.35)'
        }}>flip →</span>

        {/* Inner glow edge */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `linear-gradient(135deg, rgba(200,146,58,0.04) 0%, transparent 50%)`,
        }} />
      </div>

      {/* BACK FACE — parchment manuscript */}
      <div
        ref={backRef}
        onClick={e => e.stopPropagation()}
        style={{
          position: 'absolute', inset: 0,
          display: 'none',
          flexDirection: 'column',
          background: `
            radial-gradient(ellipse 80% 60% at 20% 20%, rgba(232,220,200,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 60% 80% at 80% 80%, rgba(180,150,100,0.06) 0%, transparent 60%),
            linear-gradient(160deg, #1a1408 0%, #0e0c08 50%, #1a1408 100%)
          `,
          border: `1px solid rgba(200,146,58,0.4)`,
          clipPath: 'polygon(10px 0%, calc(100% - 10px) 0%, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0% calc(100% - 10px), 0% 10px)',
          overflow: 'hidden',
        }}
      >
        {/* Ornate border lines */}
        <div style={{ position: 'absolute', inset: '6px', border: '1px solid rgba(200,146,58,0.15)', pointerEvents: 'none', clipPath: 'polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0% calc(100% - 8px), 0% 8px)' }} />

        {/* Scrollable back content */}
        <div
          style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 1.25rem', position: 'relative', zIndex: 1 }}
          onWheel={e => { e.stopPropagation(); }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '6px', height: '6px', background: pipelineColor, clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
              <span className="font-mono" style={{ fontSize: '0.55rem', letterSpacing: '0.18em', color: pipelineColor, textTransform: 'uppercase' }}>{pipelineLabel}</span>
            </div>
            <button
              className="font-mono"
              onClick={e => { e.stopPropagation(); handleFlip(); }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '0.55rem', letterSpacing: '0.1em',
                color: 'rgba(200,146,58,0.5)', padding: '2px 4px'
              }}
            >← back</button>
          </div>

          {/* Title */}
          <div style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(200,146,58,0.15)' }}>
            <h3 className="font-cinzel" style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.12em', color: '#e8dcc8', marginBottom: '0.2rem' }}>{node.display_name}</h3>
            <span className="font-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: pipelineColor, textTransform: 'uppercase' }}>{node.role_id}</span>
          </div>

          {/* Scope */}
          <p className="font-cormorant" style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'rgba(232,220,200,0.8)', fontStyle: 'italic', marginBottom: '1rem' }}>
            "{node.scope}"
          </p>

          {/* Fields */}
          {[
            ['Non-scope', node.non_scope],
            ['Reports to', reportsToLabel],
            ['Group', node.group],
            ['Level', node.level],
            ['Independence', node.independence_flag ? 'true' : 'false']
          ].map(([label, value]) => (
            <div key={label} style={{ marginBottom: '0.5rem' }}>
              <dt className="font-mono" style={{ fontSize: '0.55rem', letterSpacing: '0.15em', color: pipelineColor, textTransform: 'uppercase', marginBottom: '0.1rem' }}>{label}</dt>
              <dd className="font-mono" style={{ fontSize: '0.75rem', color: 'rgba(232,220,200,0.65)', lineHeight: 1.5, listStyle: 'none' }}>{value}</dd>
            </div>
          ))}

          {/* Operating rule box */}
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            border: '1px solid rgba(200,146,58,0.25)',
            background: 'rgba(200,146,58,0.04)',
            clipPath: 'polygon(6px 0%, 100% 0%, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0% 100%, 0% 6px)'
          }}>
            <span className="font-mono" style={{ display: 'block', fontSize: '0.5rem', letterSpacing: '0.2em', color: 'rgba(200,146,58,0.6)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Operating rule</span>
            <span className="font-cormorant" style={{ fontSize: '0.9rem', lineHeight: 1.5, color: 'rgba(232,220,200,0.75)', fontStyle: 'italic' }}>{node.operating_rule}</span>
          </div>
        </div>
      </div>
    </article>
  );
}