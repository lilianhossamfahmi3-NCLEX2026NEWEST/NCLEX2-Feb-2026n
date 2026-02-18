interface ModeSelectorProps {
    onSelect: (mode: 'tutor' | 'exam') => void;
    onCancel: () => void;
}

export default function ModeSelector({ onSelect, onCancel }: ModeSelectorProps) {
    return (
        <div className="mode-selector-overlay">
            <div className="mode-selector-container">
                <div className="ms-header">
                    <div className="ms-logo">🧠</div>
                    <h1>Adaptive NCLEX Simulation</h1>
                    <p>Select your exam mode. The Computer Adaptive Testing (CAT) algorithm works identically in both modes, adjusting difficulty to your ability level.</p>
                </div>

                <div className="ms-cards">
                    <div className="ms-card tutor-card" onClick={() => onSelect('tutor')}>
                        <div className="card-icon">🎓</div>
                        <h3>Tutor Mode</h3>
                        <ul className="feature-list">
                            <li><span className="check">✓</span> Immediate Rationales</li>
                            <li><span className="check">✓</span> "Why Correct/Incorrect" Feedback</li>
                            <li><span className="check">✓</span> Low Stress Learning</li>
                        </ul>
                        <button className="start-btn tutor">Start Tutor Mode</button>
                    </div>

                    <div className="ms-card exam-card" onClick={() => onSelect('exam')}>
                        <div className="card-icon">⏱️</div>
                        <h3>Real Exam Mode</h3>
                        <ul className="feature-list">
                            <li><span className="cross">✗</span> No Rationales During Exam</li>
                            <li><span className="check">✓</span> Simulated Test Day Pressure</li>
                            <li><span className="check">✓</span> Full Report at End</li>
                        </ul>
                        <button className="start-btn exam">Start Real Exam</button>
                    </div>
                </div>

                <button className="cancel-link" onClick={onCancel}>Return to Library</button>
            </div>

            <style>{`
                .mode-selector-overlay {
                    position: fixed;
                    inset: 0;
                    background: #F8FAFC;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    font-family: 'Inter', system-ui, sans-serif;
                }
                .dark .mode-selector-overlay { background: #030712; color: white; }

                .mode-selector-container {
                    max-width: 900px;
                    width: 95%;
                    text-align: center;
                    animation: fadeIn 0.4s ease-out;
                }

                @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

                .ms-header { margin-bottom: 48px; }
                .ms-logo { 
                    font-size: 3rem; 
                    margin-bottom: 16px;
                    display: inline-block;
                    background: rgba(37, 99, 235, 0.1);
                    width: 80px; height: 80px;
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    margin: 0 auto 24px;
                }
                .ms-header h1 { font-size: 2.2rem; font-weight: 800; margin-bottom: 12px; color: #1E293B; }
                .dark .ms-header h1 { color: #F8FAFC; }
                .ms-header p { color: #64748B; max-width: 600px; margin: 0 auto; line-height: 1.6; }

                .ms-cards {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 32px;
                    margin-bottom: 32px;
                }

                .ms-card {
                    background: white;
                    border: 1px solid #E2E8F0;
                    border-radius: 24px;
                    padding: 40px;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                    text-align: left;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    overflow: hidden;
                }
                .dark .ms-card { background: #111827; border-color: #1F2937; }

                .ms-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.05);
                    border-color: var(--primary);
                }

                .card-icon { font-size: 2.5rem; margin-bottom: 24px; }
                .ms-card h3 { font-size: 1.5rem; font-weight: 800; margin-bottom: 24px; color: #1E293B; }
                .dark .ms-card h3 { color: white; }

                .feature-list { list-style: none; padding: 0; margin: 0 0 32px 0; flex: 1; }
                .feature-list li { 
                    display: flex; 
                    align-items: center; 
                    gap: 12px; 
                    margin-bottom: 16px; 
                    font-size: 0.95rem;
                    color: #475569;
                    font-weight: 500;
                }
                .dark .feature-list li { color: #94A3B8; }
                .check { color: #10B981; font-weight: 900; }
                .cross { color: #EF4444; font-weight: 900; }

                .start-btn {
                    width: 100%;
                    padding: 16px;
                    border-radius: 12px;
                    border: none;
                    font-weight: 800;
                    font-size: 0.95rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .start-btn.tutor { background: #2563EB; color: white; }
                .start-btn.exam { background: transparent; border: 1px solid #E2E8F0; color: #64748B; }
                .dark .start-btn.exam { border-color: #334155; color: #94A3B8; }

                .ms-card:hover .start-btn.exam { background: #F1F5F9; border-color: #CBD5E1; color: #1E293B; }
                .dark .ms-card:hover .start-btn.exam { background: #1F2937; border-color: #334155; color: white; }

                .cancel-link {
                    background: none;
                    border: none;
                    color: #64748B;
                    font-weight: 600;
                    font-size: 0.9rem;
                    cursor: pointer;
                    text-decoration: underline;
                }
                .cancel-link:hover { color: #1E293B; }
                .dark .cancel-link:hover { color: white; }

                @media (max-width: 768px) {
                    .ms-cards { grid-template-columns: 1fr; }
                    .ms-header h1 { font-size: 1.8rem; }
                }
            `}</style>
        </div>
    );
}
