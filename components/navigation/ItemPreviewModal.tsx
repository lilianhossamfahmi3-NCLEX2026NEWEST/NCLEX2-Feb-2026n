import { MasterItem } from '../../types/master';

interface ItemPreviewModalProps {
    items: MasterItem[];
    onClose: () => void;
    theme: 'light' | 'dark';
}

export function ItemPreviewModal({ items, onClose, theme }: ItemPreviewModalProps) {
    return (
        <div className={`preview-overlay ${theme === 'dark' ? 'dark' : ''}`}>
            <div className="preview-container">
                <header className="preview-header">
                    <div className="header-logic">
                        <span className="live-indicator"></span>
                        <h2>Neural Item Repository — Diagnostic Preview</h2>
                    </div>
                    <button className="close-btn" onClick={onClose}>×</button>
                </header>
                <div className="preview-scroll">
                    {items.map((item, idx) => (
                        <div key={item.id} className="preview-card">
                            <div className="p-card-header">
                                <span className="p-idx">NODE_{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}</span>
                                <span className="p-type">{item.type.replace(/([A-Z])/g, ' $1').trim()}</span>
                                <span className="p-step">{item.pedagogy?.cjmmStep || 'General'}</span>
                            </div>
                            <div className="p-stem">{item.stem}</div>

                            {item.type === 'multipleChoice' && (
                                <div className="p-options">
                                    {item.options?.map(o => (
                                        <div key={o.id} className={`p-opt ${o.id === item.correctOptionId ? 'correct' : ''}`}>
                                            <span className="p-opt-marker">{o.id === item.correctOptionId ? '✓' : '○'}</span>
                                            {o.text}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="p-rationale">
                                <span className="p-rat-label">Clinical Rationale</span>
                                <p>{item.rationale?.correct || item.rationale?.incorrect || 'Rationale pending.'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <style>{`
                .preview-overlay {
                    position: fixed; inset: 0; background: rgba(0,0,0,0.85);
                    display: flex; align-items: center; justify-content: center; z-index: 10000;
                    backdrop-filter: blur(16px);
                    animation: modalOverlayIn 0.3s ease-out;
                }
                @keyframes modalOverlayIn { from { opacity: 0; } to { opacity: 1; } }

                .preview-container {
                    width: 95%; max-width: 900px; height: 85vh;
                    background: var(--bg-card); border-radius: 32px;
                    display: flex; flex-direction: column; overflow: hidden;
                    border: 1px solid var(--border);
                    box-shadow: 0 40px 100px rgba(0,0,0,0.5);
                    animation: modalContentIn 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
                }
                @keyframes modalContentIn { from { transform: translateY(40px) scale(0.95); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }

                .preview-header {
                    padding: 32px 40px; border-bottom: 1px solid var(--border);
                    display: flex; justify-content: space-between; align-items: center;
                    background: linear-gradient(to right, rgba(var(--primary-rgb), 0.05), transparent);
                }
                .header-logic { display: flex; align-items: center; gap: 16px; }
                .preview-header h2 { font-size: 1.1rem; font-weight: 950; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text); }
                .live-indicator { width: 10px; height: 10px; border-radius: 50%; background: var(--success); box-shadow: 0 0 10px var(--success); animation: pulse 2s infinite; }
                
                .close-btn { font-size: 2.4rem; background: none; border: none; color: var(--muted-text); cursor: pointer; line-height: 1; transition: color 0.2s; }
                .close-btn:hover { color: var(--error); }

                .preview-scroll { flex: 1; overflow-y: auto; padding: 40px; display: flex; flex-direction: column; gap: 32px; }
                .preview-scroll::-webkit-scrollbar { width: 6px; }
                .preview-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }

                .preview-card {
                    background: var(--panel-bg); border: 1.5px solid var(--border); border-radius: 24px; padding: 32px;
                    transition: transform 0.3s, border-color 0.3s;
                }
                .preview-card:hover { border-color: var(--primary); transform: translateX(8px); }

                .p-card-header { display: flex; gap: 16px; margin-bottom: 20px; font-family: 'JetBrains Mono', monospace; }
                .p-card-header span { font-size: 0.7rem; font-weight: 950; text-transform: uppercase; letter-spacing: 0.05em; padding: 4px 12px; border-radius: 8px; border: 1px solid var(--border); }
                .p-idx { color: var(--primary); background: rgba(var(--primary-rgb), 0.1); border-color: rgba(var(--primary-rgb), 0.2) !important; }
                .p-type { color: var(--text); background: var(--bg-card); }
                .p-step { color: var(--success); background: rgba(var(--success-rgb), 0.05); }

                .p-stem { font-size: 1.15rem; font-weight: 850; margin-bottom: 24px; line-height: 1.6; color: var(--text); letter-spacing: -0.01em; }
                
                .p-options { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
                .p-opt { padding: 14px 20px; background: var(--bg-card); border-radius: 12px; font-size: 0.95rem; display: flex; align-items: center; gap: 12px; font-weight: 700; border: 1px solid transparent; }
                .p-opt-marker { font-family: 'JetBrains Mono', monospace; opacity: 0.4; }
                .p-opt.correct { border-color: var(--success); background: rgba(var(--success-rgb), 0.05); color: var(--success); }
                .p-opt.correct .p-opt-marker { opacity: 1; font-weight: 950; }

                .p-rationale { padding-top: 24px; border-top: 1.5px dashed var(--border); }
                .p-rat-label { font-size: 0.65rem; font-weight: 950; text-transform: uppercase; color: var(--primary); letter-spacing: 0.1em; margin-bottom: 10px; display: block; }
                .p-rationale p { font-size: 0.95rem; color: var(--muted-text); line-height: 1.7; font-weight: 500; }
            `}</style>
        </div>
    );
}
