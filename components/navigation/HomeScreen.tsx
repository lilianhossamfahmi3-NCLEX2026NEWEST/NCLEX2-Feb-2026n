import { useState } from 'react';
import { CaseStudy, MasterItem } from '../../types/master';
import { ItemPreviewModal } from './ItemPreviewModal';

interface HomeScreenProps {
    library: CaseStudy[];
    standaloneItems: MasterItem[];
    onSelectCase: (caseId: string) => void;
    onViewAnalytics: () => void;
    history: any[];
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
}

function Sparkline({ color }: { color: string }) {
    return (
        <svg width="100%" height="40" viewBox="0 0 100 40" preserveAspectRatio="none" style={{ marginTop: '10px' }}>
            <defs>
                <linearGradient id={`grad-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.3 }} />
                    <stop offset="100%" style={{ stopColor: color, stopOpacity: 0 }} />
                </linearGradient>
            </defs>
            <path
                d="M0 35 Q 10 30, 20 32 T 40 25 T 60 28 T 80 15 T 100 20 L 100 40 L 0 40 Z"
                fill={`url(#grad-${color})`}
            />
            <path
                d="M0 35 Q 10 30, 20 32 T 40 25 T 60 28 T 80 15 T 100 20"
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export default function HomeScreen({ library, standaloneItems, onSelectCase, onViewAnalytics, theme, onToggleTheme }: HomeScreenProps) {
    const [previewCaseId, setPreviewCaseId] = useState<string | null>(null);

    const previewCase = library.find(c => c.id === previewCaseId);

    const launchStandalone = (item: MasterItem) => {
        // We use a internal protocol for direct case injection if possible
        onSelectCase(`standalone:${item.id}`);
    };

    return (
        <div className="home-engine">
            {previewCase && (
                <ItemPreviewModal
                    items={previewCase.items}
                    onClose={() => setPreviewCaseId(null)}
                    theme={theme}
                />
            )}

            {/* Neural Dashboard Header */}
            <header className="neural-header">
                <div className="greet-hub">
                    <h1 className="welcome-text">Good Afternoon, <span className="user-name">Nurse Candidate</span></h1>
                    <div className="readiness-meter">
                        <span className="readiness-label">Your Clinical Readiness Score is</span>
                        <div className="readiness-pill">
                            <span className="readiness-status">High</span>
                            <span className="readiness-val">84%</span>
                        </div>
                    </div>
                </div>
                <div className="hub-ops">
                    <button className="action-btn theme-toggle-btn" onClick={onToggleTheme} title="Toggle Clinical/Wellness Mode">
                        {theme === 'dark' ? '🌙 Wellness Mode' : '☀️ Clinical Mode'}
                    </button>
                    <div className="user-avatar-shell">JD</div>
                </div>
            </header>

            {/* Core Metrics Panorama */}
            <section className="metrics-panorama">
                <div className="metric-panel">
                    <label>PASS PROBABILITY</label>
                    <div className="metric-hero">82%</div>
                    <div className="metric-trend pos">↑ 4% from last week</div>
                    <Sparkline color="var(--success)" />
                </div>
                <div className="metric-panel">
                    <label>ITEMS MASTERED</label>
                    <div className="metric-hero">142</div>
                    <div className="metric-trend">9 new this session</div>
                    <Sparkline color="var(--primary)" />
                </div>
                <div className="metric-panel">
                    <label>AVG. RESPONSE TIME</label>
                    <div className="metric-hero">42s</div>
                    <div className="metric-trend pos">↓ 5s (Better)</div>
                    <Sparkline color="var(--primary)" />
                </div>
            </section>

            {/* Learning Operations Grid */}
            <main className="ops-center">
                <section className="ops-deck">
                    <div className="deck-header">
                        <h2>Learning Operations</h2>
                        <p>Select a neural training mode to enhance your clinical judgment.</p>
                    </div>

                    <div className="ops-grid">
                        {/* Adaptive CAT - Featured */}
                        <div className="ops-card adaptive-cat featured">
                            <div className="featured-tag">RECOMMENDED</div>
                            <div className="ops-icon-shell">🧬</div>
                            <h3>Adaptive CAT Exam</h3>
                            <p>Full 85-question simulation using the Bayesian CAT engine.</p>
                            <button className="ops-launch-btn disabled">Encounter Simulation</button>
                        </div>

                        {/* Library (Active) */}
                        <div className="ops-card library">
                            <div className="ops-icon-shell">📄</div>
                            <h3>Case Study Library</h3>
                            <p>Explore {library.length} unfolding clinical scenarios.</p>
                            <div className="library-preview-list">
                                {library.slice(0, 6).map(c => (
                                    <div key={c.id} className="lp-item" onClick={() => onSelectCase(c.id)}>
                                        <div className="lp-info">
                                            <span className="lp-diag">{c.patient.diagnosis || 'Clinical Scenario'}</span>
                                            <span className="lp-title">{c.title.split('—')[0]}</span>
                                        </div>
                                        <label>Launch →</label>
                                    </div>
                                ))}
                            </div>
                            <button className="ops-launch-btn ghost" onClick={onViewAnalytics}>View All Scenarios</button>
                        </div>

                        {/* AI Laboratory - New Standalone Track */}
                        <div className="ops-card ai-lab featured">
                            <div className="featured-tag">2026 NGN READY</div>
                            <div className="ops-icon-shell" style={{ borderColor: 'var(--secondary)' }}>🧠</div>
                            <div className="deck-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3>AI Laboratory</h3>
                                <button
                                    className="bank-link-btn"
                                    onClick={() => onSelectCase('ai-bank-view')}
                                    style={{
                                        fontSize: '0.7rem',
                                        fontWeight: 900,
                                        color: 'var(--primary)',
                                        background: 'transparent',
                                        border: '1px solid var(--primary)',
                                        padding: '4px 10px',
                                        borderRadius: '8px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    OPEN ITEM BANK ↗
                                </button>
                            </div>
                            <p>Direct exposure to standalone NGN items (Highlight, Trend, Bowtie). These are NOT 6-question cases.</p>
                            <div className="standalone-grid">
                                {standaloneItems.slice(0, 4).map(item => (
                                    <button
                                        key={item.id}
                                        className="standalone-launch-strip"
                                        onClick={() => launchStandalone(item)}
                                    >
                                        <label>{item.id.replace('sa-h-', '').toUpperCase()}</label>
                                        <span>Practice Standalone →</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Weakness Attack */}
                        <div className="ops-card weakness">
                            <div className="ops-icon-shell">🎯</div>
                            <h3>Weakness Attack</h3>
                            <p>Drill your lowest performing CJMM domains.</p>
                            <button className="ops-launch-btn ghost">Begin Drill</button>
                        </div>
                    </div>
                </section>

                <aside className="intel-panel">
                    <div className="intel-card">
                        <h3>Clinical Feed</h3>
                        <div className="intel-list">
                            <div className="intel-item">
                                <div className="intel-dot success" />
                                <div className="intel-txt">Mastered <b>Prioritize Hypotheses</b> in Preeclampsia Case.</div>
                            </div>
                            <div className="intel-item">
                                <div className="intel-dot warning" />
                                <div className="intel-txt">Accuracy dropped in <b>Analyze Cues</b> (Pharmacology).</div>
                            </div>
                        </div>
                    </div>

                    <div className="intel-card analytics-action" onClick={onViewAnalytics}>
                        <div className="aa-icon">📈</div>
                        <div className="aa-txt">
                            <h3>Full System Analytics</h3>
                            <p>Dive deep into your domain mastery scores.</p>
                        </div>
                    </div>
                </aside>
            </main>

            <style>{`
                .home-engine {
                    min-height: 100vh;
                    background: var(--bg);
                    color: var(--text);
                    padding: 40px 60px;
                    font-family: 'Inter', system-ui, sans-serif;
                    overflow-y: auto;
                }

                /* Header: Neural Greet */
                .neural-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 40px;
                }
                .welcome-text { font-size: 1.8rem; font-weight: 850; letter-spacing: -0.04em; margin-bottom: 8px; }
                .user-name { color: var(--primary); }
                .readiness-meter { display: flex; align-items: center; gap: 12px; }
                .readiness-label { font-size: 0.9rem; font-weight: 750; color: var(--text); }
                .readiness-pill { 
                    display: flex; align-items: center; gap: 8px; 
                    background: rgba(var(--success-rgb), 0.15); padding: 6px 16px; 
                    border-radius: 10px; border: 1.5px solid var(--success);
                }
                .readiness-status { font-weight: 900; text-transform: uppercase; font-size: 0.75rem; color: var(--success); }
                .readiness-val { font-weight: 950; font-size: 0.9rem; color: var(--success); }

                .hub-ops { display: flex; align-items: center; gap: 24px; }
                .theme-trigger { 
                    display: flex; align-items: center; gap: 10px; 
                    background: transparent; border: none; cursor: pointer; color: var(--text);
                }
                .theme-label { font-size: 0.75rem; font-weight: 850; text-transform: uppercase; letter-spacing: 0.05em; }
                .user-avatar-shell { 
                    width: 44px; height: 44px; background: var(--panel-bg); 
                    border-radius: 12px; border: 1px solid var(--border);
                    display: flex; align-items: center; justify-content: center;
                    font-weight: 900; font-size: 0.9rem;
                }

                /* Metrics Panorama */
                .metrics-panorama {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 24px;
                    margin-bottom: 60px;
                }
                .metric-panel {
                    background: var(--bg-card);
                    padding: 32px;
                    border-radius: 28px;
                    border: 1.5px solid var(--border);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .metric-panel:hover {
                    transform: translateY(-5px);
                    border-color: var(--primary);
                    box-shadow: 0 20px 40px rgba(var(--primary-rgb), 0.1);
                }
                .metric-panel label { font-size: 0.7rem; font-weight: 950; color: var(--primary); letter-spacing: 0.12em; display: block; margin-bottom: 8px; }
                .metric-hero { font-size: 2.8rem; font-weight: 950; letter-spacing: -0.06em; margin-bottom: 8px; color: var(--text); }
                .metric-trend { font-size: 0.85rem; font-weight: 800; color: var(--muted-text); }
                .metric-trend.pos { color: var(--success); }
                .metric-panel label { opacity: 1; }

                /* Ops Center */
                .ops-center {
                    display: grid;
                    grid-template-columns: 1fr 340px;
                    gap: 40px;
                }
                .deck-header { margin-bottom: 40px; }
                .deck-header h2 { font-size: 2rem; font-weight: 850; letter-spacing: -0.03em; margin-bottom: 12px; }
                .deck-header p { font-size: 1.1rem; opacity: 0.7; }

                .ops-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
                    gap: 32px;
                }

                .ops-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: 32px;
                    padding: 40px;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    position: relative;
                }
                .ops-card:hover { 
                    transform: translateY(-8px) scale(1.02); 
                    border-color: var(--primary); 
                    box-shadow: 0 30px 60px rgba(0,0,0,0.1); 
                }
                .ops-card.featured {
                    grid-column: span 1;
                    background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.05), transparent);
                }
                .featured-tag { 
                    position: absolute; top: 20px; right: 20px; 
                    font-size: 0.6rem; font-weight: 950; background: var(--primary); color: white;
                    padding: 4px 10px; border-radius: 100px;
                }

                .ops-icon-shell { 
                    width: 60px; height: 60px; background: var(--panel-bg); 
                    border-radius: 18px; display: flex; align-items: center; justify-content: center;
                    font-size: 2rem; border: 1.5px solid var(--border);
                }

                .ops-card h3 { font-size: 1.4rem; font-weight: 900; letter-spacing: -0.02em; color: var(--text); }
                .ops-card p { font-size: 1rem; color: var(--text); opacity: 0.85; line-height: 1.6; }

                .ops-launch-btn {
                    margin-top: auto; padding: 14px; border-radius: 16px; 
                    font-weight: 850; font-size: 0.85rem; border: none; cursor: pointer;
                    transition: all 0.3s;
                }
                .ops-launch-btn:not(.ghost) { background: var(--primary); color: white; box-shadow: 0 10px 20px rgba(var(--primary-rgb), 0.3); }
                .ops-launch-btn.ghost { background: transparent; border: 1.5px solid var(--border); color: var(--text); }
                .ops-launch-btn.ghost:hover { background: var(--panel-bg); border-color: var(--primary); color: var(--primary); }
                .ops-launch-btn.disabled { opacity: 0.3; cursor: not-allowed; transform: none !important; }

                /* Library Preview List */
                .library-preview-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
                .lp-item { 
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 16px; background: rgba(var(--primary-rgb), 0.03); border-radius: 16px;
                    font-size: 0.85rem; font-weight: 700; cursor: pointer; border: 1.5px solid var(--border);
                    transition: all 0.2s;
                }
                .lp-item:hover { border-color: var(--primary); transform: translateX(8px); background: rgba(var(--primary-rgb), 0.08); }
                .lp-info { display: flex; flex-direction: column; gap: 4px; }
                .lp-diag { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--primary); font-weight: 900; }
                .lp-title { font-size: 0.95rem; color: var(--text); }
                .lp-item label { cursor: pointer; font-size: 0.7rem; font-weight: 900; opacity: 0.6; color: var(--primary); }

                /* Standalone Track */
                .standalone-grid { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; }
                .standalone-launch-strip {
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 12px 16px; background: rgba(var(--secondary-rgb), 0.05);
                    border: 1px solid var(--border); border-radius: 12px;
                    cursor: pointer; transition: all 0.2s;
                    text-align: left; width: 100%; color: inherit;
                }
                .standalone-launch-strip:hover { border-color: var(--secondary); background: rgba(var(--secondary-rgb), 0.1); transform: translateX(5px); }
                .standalone-launch-strip label { font-size: 0.65rem; font-weight: 950; color: var(--secondary); cursor: pointer; }
                .standalone-launch-strip span { font-size: 0.8rem; font-weight: 800; cursor: pointer; }

                /* Intel Side */
                .intel-panel { display: flex; flex-direction: column; gap: 32px; }
                .intel-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: 24px;
                    padding: 24px;
                }
                .intel-card h3 { font-size: 1rem; font-weight: 850; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.6; }
                .intel-list { display: flex; flex-direction: column; gap: 16px; }
                .intel-item { display: flex; gap: 12px; align-items: flex-start; }
                .intel-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 6px; }
                .intel-dot.success { background: var(--success); box-shadow: 0 0 8px var(--success); }
                .intel-dot.warning { background: var(--warning); box-shadow: 0 0 8px var(--warning); }
                .intel-txt { font-size: 0.9rem; line-height: 1.5; opacity: 0.9; }

                .analytics-action { 
                    display: flex; gap: 16px; align-items: center; cursor: pointer; 
                    transition: all 0.3s;
                }
                .analytics-action:hover { border-color: var(--primary); transform: translateX(5px); }
                .aa-icon { font-size: 2rem; opacity: 0.8; }
                .aa-txt h3 { margin: 0 0 4px 0; font-size: 0.9rem; opacity: 1; }
                .aa-txt p { font-size: 0.75rem; opacity: 0.6; margin: 0; }
            `}</style>
        </div>
    );
}
