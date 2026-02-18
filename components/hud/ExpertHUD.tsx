/**
 * NCLEX-RN NGN Clinical Simulator — Expert HUD (Intelligence Console)
 * Instructor-facing performance dashboard with CJMM radar, stress, and Bayesian pass probability.
 */

import { useMemo } from 'react';
import { SessionState, CJMMStep, StressState } from '../../types/master';

interface ExpertHUDProps {
  session: SessionState;
  passProbability: number;
  progress: number;
}

const CJMM_LABELS: Record<CJMMStep, string> = {
  recognizeCues: 'Recognize Cues',
  analyzeCues: 'Analyze Cues',
  prioritizeHypotheses: 'Prioritize Hypotheses',
  generateSolutions: 'Generate Solutions',
  takeAction: 'Take Action',
  evaluateOutcomes: 'Evaluate Outcomes',
};

const STRESS_META: Record<StressState, { label: string; color: string; icon: string }> = {
  focused: { label: 'Focused', color: '#4ade80', icon: '🎯' },
  hesitant: { label: 'Hesitant', color: '#fbbf24', icon: '🤔' },
  panic: { label: 'Panic', color: '#f97316', icon: '😰' },
  paralysis: { label: 'Paralysis', color: '#ef4444', icon: '⚠️' },
};

export default function ExpertHUD({ session, passProbability, progress }: ExpertHUDProps) {
  const stressMeta = STRESS_META[session.stressState];

  const totalEarned = useMemo(() =>
    Object.values(session.scores).reduce((a, b) => a + b, 0),
    [session.scores]
  );

  const totalPossible = useMemo(() =>
    session.caseStudy.items
      .filter(i => session.scores[i.id] !== undefined)
      .reduce((a, i) => a + i.scoring.maxPoints, 0),
    [session.caseStudy.items, session.scores]
  );

  const answeredCount = Object.keys(session.scores).length;
  const totalItems = session.caseStudy.items.length;

  return (
    <div className="expert-hud-tactical">
      <header className="hud-tactical-header">
        <div className="header-icon">📊</div>
        <div className="header-meta">
          <h2 className="hud-tactical-title">Expert HUD</h2>
          <span className={`status-tag status--${session.status}`}>
            {session.status}
          </span>
        </div>
        <div className="live-indicator">LIVE</div>
      </header>

      <div className="hud-tactical-body">
        {/* Pass Probability Intelligence */}
        <section className="hud-tactical-section">
          <label className="section-label">Bayesian Pass Probability</label>
          <div className="intelligence-display">
            <div className="prob-value">{(passProbability * 100).toFixed(1)}%</div>
            <div className="prob-meter">
              <div
                className="prob-meter-fill"
                style={{
                  width: `${passProbability * 100}%`,
                  background: passProbability >= 0.7 ? 'var(--success)' : passProbability >= 0.4 ? 'var(--warning)' : 'var(--error)'
                }}
              />
            </div>
          </div>
        </section>

        {/* Tactical Metrics Grid */}
        <div className="tactical-grid">
          <div className="tactical-tile">
            <div className="tile-val">{answeredCount} / {totalItems}</div>
            <div className="tile-label">Items Completed</div>
          </div>
          <div className="tactical-tile">
            <div className="tile-val">{totalEarned} / {totalPossible || '—'}</div>
            <div className="tile-label">Points Secured</div>
          </div>
          <div className="tactical-tile highlight" style={{ borderColor: stressMeta.color + '44' }}>
            <div className="tile-val" style={{ color: stressMeta.color }}>
              {stressMeta.icon} {stressMeta.label}
            </div>
            <div className="tile-label">Stress Analysis</div>
          </div>
        </div>

        {/* Progress Optimization */}
        <section className="hud-tactical-section">
          <label className="section-label">Session Progress</label>
          <div className="progress-tactical">
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="progress-readout">{progress.toFixed(0)}%</div>
          </div>
        </section>

        {/* CJMM Domain Analytics */}
        <section className="hud-tactical-section">
          <label className="section-label">CJMM Domain Mastery</label>
          <div className="analytics-list">
            {(Object.keys(CJMM_LABELS) as CJMMStep[]).map(step => {
              const score = session.cjmmProfile[step];
              const pct = Math.round(score * 100);
              const color = pct >= 70 ? 'var(--success)' : pct >= 40 ? 'var(--warning)' : 'var(--error)';
              return (
                <div key={step} className="analytics-row">
                  <div className="analytics-info">
                    <span className="domain-label">{CJMM_LABELS[step]}</span>
                    <span className="domain-pct" style={{ color }}>{pct}%</span>
                  </div>
                  <div className="domain-meter">
                    <div className="domain-meter-fill" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <style>{`
        .expert-hud-tactical {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 20px;
          overflow: hidden;
          font-family: 'JetBrains Mono', monospace;
          color: var(--text);
          box-shadow: 0 20px 50px rgba(0,0,0,0.3);
          backdrop-filter: blur(12px);
          animation: slideInRight 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        @keyframes slideInRight { from { transform: translateX(30px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

        .hud-tactical-header {
          padding: 20px 24px;
          background: var(--panel-bg);
          display: flex;
          align-items: center;
          gap: 16px;
          border-bottom: 1px solid var(--border);
        }
        .header-icon { font-size: 1.5rem; }
        .hud-tactical-title { font-size: 1.1rem; font-weight: 850; margin: 0; letter-spacing: -0.02em; text-transform: uppercase; }
        .status-tag { 
            font-size: 0.6rem; font-weight: 900; padding: 2px 8px; border-radius: 4px; 
            text-transform: uppercase; letter-spacing: 0.05em;
        }
        .status--active { background: rgba(var(--success-rgb), 0.1); color: var(--success); border: 1px solid rgba(var(--success-rgb), 0.3); }

        .live-indicator {
            margin-left: auto; font-size: 0.65rem; font-weight: 950; color: #ef4444;
            display: flex; align-items: center; gap: 6px;
        }
        .live-indicator::before { content: ""; width: 8px; height: 8px; background: #ef4444; border-radius: 50%; animation: pulseRed 1.5s infinite; }
        @keyframes pulseRed { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }

        .hud-tactical-body { padding: 24px; display: flex; flex-direction: column; gap: 24px; }
        
        .hud-tactical-section { display: flex; flex-direction: column; gap: 12px; }
        .section-label { font-size: 0.65rem; font-weight: 950; color: var(--muted-text); text-transform: uppercase; letter-spacing: 0.12em; }
        
        /* Bayesian Prob */
        .intelligence-display {
            background: rgba(255,255,255,0.03);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 16px;
            text-align: center;
        }
        .prob-value { font-size: 2.2rem; font-weight: 900; letter-spacing: -0.05em; margin-bottom: 8px; }
        .prob-meter { height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden; }
        .prob-meter-fill { height: 100%; transition: width 1s cubic-bezier(0.4, 0, 0.2, 1); }

        /* Tactical Tiles */
        .tactical-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        .tactical-tile {
            background: var(--bg);
            border: 1px solid var(--border);
            border-radius: 14px;
            padding: 16px;
            display: flex; flex-direction: column; gap: 4px;
            transition: all 0.3s;
        }
        .tactical-tile:hover { transform: translateY(-2px); border-color: var(--primary); }
        .tactical-tile.highlight { grid-column: span 2; display: flex; flex-direction: row; justify-content: space-between; align-items: center; }
        .tile-val { font-size: 1.1rem; font-weight: 850; }
        .tile-label { font-size: 0.6rem; font-weight: 700; color: var(--muted-text); text-transform: uppercase; letter-spacing: 0.05em; }

        /* Progress Tactical */
        .progress-tactical { display: flex; align-items: center; gap: 16px; }
        .progress-track { flex: 1; height: 8px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden; }
        .progress-fill { height: 100%; background: var(--primary); border-radius: 4px; transition: width 0.8s; }
        .progress-readout { font-size: 1rem; font-weight: 900; min-width: 45px; text-align: right; }

        /* Analytics Rows */
        .analytics-list { display: flex; flex-direction: column; gap: 14px; }
        .analytics-row { display: flex; flex-direction: column; gap: 6px; }
        .analytics-info { display: flex; justify-content: space-between; align-items: center; }
        .domain-label { font-size: 0.8rem; font-weight: 600; color: var(--text); }
        .domain-pct { font-size: 0.8rem; font-weight: 900; }
        .domain-meter { height: 4px; background: rgba(255,255,255,0.05); border-radius: 2px; overflow: hidden; }
        .domain-meter-fill { height: 100%; transition: width 0.5s; }
      `}</style>
    </div>
  );
}
