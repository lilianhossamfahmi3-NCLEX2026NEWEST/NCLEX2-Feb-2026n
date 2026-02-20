import { useMemo } from 'react';
import { CaseStudy } from '../../types/master';

interface StudentPortalProps {
    library: CaseStudy[];
    history: any[];
    onStartMode: (mode: string, config?: any) => void;
    onViewAnalytics: () => void;
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
}

export default function StudentPortal({ library, history, onStartMode, onViewAnalytics, theme, onToggleTheme }: StudentPortalProps) {
    const stats = useMemo(() => {
        if (history.length === 0) return { passProbability: 0, accuracy: 0, efficiency: 0 };
        const avgPass = history.reduce((a, b) => a + b.score, 0) / history.length;
        return {
            passProbability: avgPass,
            accuracy: 0.78, // Mocked for now
            efficiency: 0.92 // Mocked for now
        };
    }, [history]);

    const mastery = useMemo(() => {
        try {
            const saved = localStorage.getItem('nclex_mastery');
            if (!saved) return { mastered: 0, total: 0 };
            const data = JSON.parse(saved);
            if (!data || typeof data !== 'object') return { mastered: 0, total: 0 };
            const vals = Object.values(data) as any[];
            return {
                mastered: vals.filter(v => v.correct >= 2).length,
                total: vals.length
            };
        } catch (e) {
            console.error("Failed to parse mastery data:", e);
            return { mastered: 0, total: 0 };
        }
    }, []);

    return (
        <div className={`student-portal ${theme === 'dark' ? 'dark' : ''}`}>
            <header className="portal-header">
                <div className="portal-brand">
                    <div className="portal-logo">NGN</div>
                    <div className="portal-welcome">
                        <h1>Good Afternoon, Nurse <span className="highlight">Candidate</span></h1>
                        <p>Your Clinical Readiness Score is <span className="score-badge">High ({(stats.passProbability * 100).toFixed(0)}%)</span></p>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="theme-toggle-btn" onClick={onToggleTheme}>
                        {theme === 'dark' ? '🌙 Wellness Mode' : '☀️ Clinical Mode'}
                    </button>
                    <div className="user-profile">
                        <div className="avatar">JD</div>
                    </div>
                </div>
            </header>

            <main className="portal-content">
                <section className="portal-hero-stats">
                    <div className="p-stat-card" onClick={onViewAnalytics}>
                        <div className="p-stat-label">Pass Probability</div>
                        <div className="p-stat-value">{(stats.passProbability * 100).toFixed(0)}%</div>
                        <div className="p-stat-trend">↑ 4% from last week</div>
                    </div>
                    <div className="p-stat-card">
                        <div className="p-stat-label">Items Mastered</div>
                        <div className="p-stat-value">{mastery.mastered}</div>
                        <div className="p-stat-trend">{mastery.total} total encountered</div>
                    </div>
                    <div className="p-stat-card">
                        <div className="p-stat-label">Avg. Response Time</div>
                        <div className="p-stat-value">42s</div>
                        <div className="p-stat-trend">↓ 5s (Better)</div>
                    </div>
                </section>

                <section className="learning-grid">
                    <div className="grid-header">
                        <h2>Learning Operations</h2>
                        <p>Select a neural training mode to enhance your clinical judgment.</p>
                    </div>

                    <div className="mode-cards">
                        <div className="mode-card featured" onClick={() => onStartMode('cat')}>
                            <div className="mode-badge">Recommended</div>
                            <div className="mode-icon">🧬</div>
                            <h3>Adaptive CAT Exam</h3>
                            <p>Full 85-question simulation using the Bayesian CAT engine.</p>
                            <button className="mode-btn">Encounter Simulation</button>
                        </div>

                        <div className="mode-card" onClick={() => onStartMode('case-library')}>
                            <div className="mode-icon">📑</div>
                            <h3>Case Study Library</h3>
                            <p>Explore {library.length} unfolding clinical scenarios.</p>
                            <button className="mode-btn secondary">View Library</button>
                        </div>

                        <div className="mode-card" onClick={() => onStartMode('weakness')}>
                            <div className="mode-icon">🎯</div>
                            <h3>Weakness Attack</h3>
                            <p>Drill your lowest performing CJMM domains.</p>
                            <button className="mode-btn secondary">Begin Drill</button>
                        </div>

                        <div className="mode-card" onClick={() => onStartMode('survival')}>
                            <div className="mode-icon">⚡</div>
                            <h3>Survival Mode</h3>
                            <p>Answer correctly to stay alive. High stakes.</p>
                            <button className="mode-btn secondary">Launch Mission</button>
                        </div>

                        <div className="mode-card" onClick={() => onStartMode('wellness')}>
                            <div className="mode-icon">🌿</div>
                            <h3>Wellness Prep</h3>
                            <p>Low-stress learning with unlimited rationales.</p>
                            <button className="mode-btn secondary">Enter Space</button>
                        </div>

                        <div className="mode-card" onClick={() => onStartMode('planner')}>
                            <div className="mode-icon">🗓️</div>
                            <h3>Study Planner</h3>
                            <p>Custom roadmap based on your exam date.</p>
                            <button className="mode-btn secondary">Open Schedule</button>
                        </div>

                        <div className="mode-card" onClick={() => onStartMode('sentinel-qa')}>
                            <div className="mode-icon">🛡️</div>
                            <h3>SentinelQA</h3>
                            <p>Scan item bank for integrity, scoring accuracy & quality assurance.</p>
                            <button className="mode-btn secondary">Run QA Scan</button>
                        </div>
                    </div>
                </section>

                <section className="portal-recent-activity">
                    <div className="activity-header">
                        <h2>Operational Log</h2>
                        <span>Recent Simulations</span>
                    </div>
                    <div className="activity-list">
                        {history.length === 0 ? (
                            <div className="empty-activity">No recent clinical sessions recorded.</div>
                        ) : (
                            history.map((h, i) => (
                                <div key={i} className="activity-row">
                                    <div className="a-type-icon">✓</div>
                                    <div className="a-details">
                                        <div className="a-title">{h.title}</div>
                                        <div className="a-timestamp">{new Date(h.date).toLocaleDateString()} • {Math.round(h.duration / 60)}m duration</div>
                                    </div>
                                    <div className="a-result">
                                        <span className="a-score">{(h.score * 100).toFixed(0)}%</span>
                                        <span className="a-status">SUCCESS</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </main>

            <style>{portalStyles}</style>
        </div>
    );
}

const portalStyles = `
    .student-portal {
        min-height: 100vh;
        background: var(--bg);
        color: var(--text);
        font-family: 'Inter', system-ui, sans-serif;
        padding-bottom: 80px;
    }

    .portal-header {
        height: 100px;
        padding: 0 60px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid var(--border);
        background: var(--bg-card);
        backdrop-filter: blur(20px);
        position: sticky;
        top: 0;
        z-index: 100;
    }

    .portal-brand { display: flex; align-items: center; gap: 24px; }
    .portal-logo {
        width: 50px; height: 50px;
        background: var(--primary);
        color: white;
        border-radius: 14px;
        display: flex; align-items: center; justify-content: center;
        font-weight: 900;
        font-size: 1.2rem;
        box-shadow: 0 10px 20px var(--primary-glow);
    }

    .portal-welcome h1 { font-size: 1.2rem; font-weight: 800; margin-bottom: 4px; }
    .portal-welcome p { font-size: 0.85rem; color: var(--muted-text); font-weight: 500; }
    .highlight { color: var(--primary); }
    .score-badge { 
        padding: 2px 8px; 
        background: rgba(16, 185, 129, 0.1); 
        color: var(--success); 
        border-radius: 6px; 
        font-weight: 800; 
        font-size: 0.75rem;
    }

    .header-actions { display: flex; align-items: center; gap: 24px; }
    .theme-toggle-btn {
        padding: 8px 16px;
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: 100px;
        font-size: 0.75rem;
        font-weight: 700;
        cursor: pointer;
        color: var(--text);
        transition: all 0.2s;
    }
    .theme-toggle-btn:hover { background: var(--border); }

    .user-profile {
        width: 40px; height: 40px;
        border-radius: 50%;
        background: var(--border);
        display: flex; align-items: center; justify-content: center;
        font-size: 0.8rem; font-weight: 800;
        color: var(--muted-text);
    }

    .portal-content {
        max-width: 1400px;
        margin: 0 auto;
        padding: 40px 60px;
    }

    .portal-hero-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 24px;
        margin-bottom: 60px;
    }

    .p-stat-card {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: 20px;
        padding: 30px;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .p-stat-card:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,0.05); border-color: var(--primary); }
    .p-stat-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted-text); font-weight: 800; margin-bottom: 12px; }
    .p-stat-value { font-size: 2.5rem; font-weight: 900; color: var(--text); margin-bottom: 8px; }
    .p-stat-trend { font-size: 0.75rem; color: var(--success); font-weight: 600; }

    .learning-grid { margin-bottom: 80px; }
    .grid-header { margin-bottom: 32px; }
    .grid-header h2 { font-size: 1.8rem; font-weight: 900; margin-bottom: 8px; }
    .grid-header p { color: var(--muted-text); font-weight: 500; }

    .mode-cards {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
        gap: 24px;
    }

    .mode-card {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: 24px;
        padding: 40px;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
    }
    .mode-card:hover { transform: translateY(-8px); border-color: var(--primary); box-shadow: 0 30px 60px rgba(0,0,0,0.1); }
    .mode-card.featured {
        background: linear-gradient(135deg, rgba(37, 99, 235, 0.05), rgba(139, 92, 246, 0.05));
        border: 2px solid var(--primary);
    }

    .mode-badge {
        position: absolute;
        top: 20px; right: 20px;
        padding: 4px 12px;
        background: var(--primary);
        color: white;
        font-size: 0.65rem;
        font-weight: 900;
        text-transform: uppercase;
        border-radius: 100px;
    }

    .mode-icon { font-size: 2.5rem; margin-bottom: 24px; }
    .mode-card h3 { font-size: 1.4rem; font-weight: 800; margin-bottom: 12px; }
    .mode-card p { color: var(--muted-text); font-size: 0.95rem; line-height: 1.6; margin-bottom: 32px; }

    .mode-btn {
        padding: 12px 24px;
        background: var(--primary);
        color: white;
        border: none;
        border-radius: 12px;
        font-weight: 800;
        font-size: 0.85rem;
        cursor: pointer;
        transition: all 0.2s;
    }
    .mode-btn.secondary { background: var(--bg); color: var(--text); border: 1px solid var(--border); }
    .mode-btn:hover { transform: translateY(-2px); opacity: 0.9; }

    .portal-recent-activity {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: 24px;
        padding: 40px;
    }
    .activity-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
    .activity-header h2 { font-size: 1.2rem; font-weight: 800; }
    .activity-header span { font-size: 0.8rem; color: var(--muted-text); font-weight: 600; }

    .activity-list { display: flex; flex-direction: column; gap: 16px; }
    .activity-row {
        display: flex;
        align-items: center;
        gap: 20px;
        padding: 20px;
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: 16px;
    }
    .a-type-icon { 
        width: 40px; height: 40px; 
        background: rgba(16, 185, 129, 0.1); 
        color: var(--success); 
        border-radius: 50%; 
        display: flex; align-items: center; justify-content: center; 
        font-weight: 900;
    }
    .a-details { flex: 1; }
    .a-title { font-weight: 800; font-size: 0.95rem; margin-bottom: 4px; }
    .a-timestamp { font-size: 0.75rem; color: var(--muted-text); font-weight: 500; }
    .a-result { text-align: right; }
    .a-score { display: block; font-weight: 900; font-size: 1.1rem; color: var(--primary); }
    .a-status { font-size: 0.65rem; color: var(--success); font-weight: 900; }

    @media (max-width: 1000px) {
        .portal-hero-stats { grid-template-columns: 1fr; }
        .mode-cards { grid-template-columns: 1fr; }
        .portal-header { padding: 0 30px; }
        .portal-content { padding: 40px 30px; }
    }
`;
