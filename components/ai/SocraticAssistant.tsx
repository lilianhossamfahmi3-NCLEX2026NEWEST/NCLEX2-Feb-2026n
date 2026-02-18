import { useState, useEffect, useMemo } from 'react';
import { StressState, MasterItem, AuditEntry } from '../../types/master';

interface SocraticAssistantProps {
    stressState: StressState;
    currentItem: MasterItem;
    auditEntries: AuditEntry[];
    administeredMeds: Record<string, any>;
}

interface Nudge {
    message: string;
    type: 'clinical' | 'strategy' | 'wellness';
}

export function SocraticAssistant({ stressState, currentItem, auditEntries, administeredMeds }: SocraticAssistantProps) {
    const [activeNudge, setActiveNudge] = useState<Nudge | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [cooldown, setCooldown] = useState(false);

    // Analyze behavior patterns
    const behavioralPattern = useMemo(() => {
        const last60s = auditEntries.filter(e => Date.now() - new Date(e.timestamp).getTime() < 60000);
        const tabFrequency = last60s.filter(e => e.action === 'tabChange').reduce((acc, e) => {
            const tab = (e.metadata?.tab as string) || e.target;
            acc[tab] = (acc[tab] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            obsessedWithLabs: (tabFrequency['labs'] || 0) > 4,
            obsessedWithVitals: (tabFrequency['vitals'] || 0) > 4,
            fastSATA: currentItem.type === 'selectAll' && last60s.filter(e => e.action === 'submit').length === 0 && last60s.length > 5,
        };
    }, [auditEntries, currentItem]);

    useEffect(() => {
        if (cooldown || stressState === 'focused') {
            setIsVisible(false);
            return;
        }

        let nudge: Nudge | null = null;

        // 1. Stress-specific nudges
        if (stressState === 'panic') {
            nudge = {
                message: "Deep breath. You're clicking rapidly—focus on the ABCs (Airway, Breathing, Circulation). What is the patient telling you right now?",
                type: 'wellness'
            };
        } else if (stressState === 'paralysis') {
            nudge = {
                message: "Feeling stuck? Try reviewing the Physical Exam one more time, specifically the cardiovascular findings.",
                type: 'strategy'
            };
        } else if (stressState === 'hesitant') {
            nudge = {
                message: "You've changed your mind a few times. Trust your clinical judgment—think about which finding is most acute.",
                type: 'strategy'
            };
        }

        // 2. Clinical Context Nudges
        if (!nudge) {
            if (behavioralPattern.obsessedWithLabs) {
                nudge = {
                    message: "The lab values are important, but have you checked the most recent SpO2 and lung sounds?",
                    type: 'clinical'
                };
            } else if (behavioralPattern.obsessedWithVitals) {
                nudge = {
                    message: "The vitals show the response, but the MAR might have the intervention you need. Is the Furosmeide due?",
                    type: 'clinical'
                };
            }
        }

        // 3. Med Admin Nudge
        if (!nudge && currentItem.pedagogy?.cjmmStep === 'takeAction' && !administeredMeds['med-001']) {
            nudge = {
                message: "The patient is symptomatic with pulmonary edema—is there a 'stat' intervention in the EHR you haven't performed yet?",
                type: 'clinical'
            };
        }

        if (nudge) {
            setActiveNudge(nudge);
            setIsVisible(true);
            setCooldown(true);
            // Auto-hide after 10 seconds
            setTimeout(() => setIsVisible(false), 10000);
            // Cooldown for 30 seconds
            setTimeout(() => setCooldown(false), 30000);
        }
    }, [stressState, behavioralPattern, currentItem, administeredMeds, cooldown]);

    if (!isVisible || !activeNudge) return null;

    return (
        <div className={`socratic-nudge nudge--${activeNudge.type}`}>
            <div className="neural-core-container">
                <svg viewBox="0 0 100 100" className="neural-core">
                    <circle cx="50" cy="50" r="40" className="core-outer" />
                    <circle cx="50" cy="50" r="25" className="core-inner" />
                    <circle cx="50" cy="50" r="10" className="core-pulse" />
                </svg>
            </div>

            <div className="nudge-content">
                <header className="nudge-header">
                    <span className="ai-tag">AI ADVISOR</span>
                    <span className="telemetry-id">ID-{Math.random().toString(16).slice(2, 6).toUpperCase()}</span>
                </header>
                <div className="nudge-message">{activeNudge.message}</div>
                <div className="thought-trace">Analyzing clinical trajectory...</div>
            </div>

            <button className="nudge-close" onClick={() => setIsVisible(false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M18 6L6 18M6 6l12 12" />
                </svg>
            </button>

            <style>{`
                .socratic-nudge {
                    position: fixed;
                    top: 100px;
                    right: 48px;
                    width: 360px;
                    background: rgba(15, 23, 42, 0.85);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 20px;
                    padding: 24px;
                    display: flex;
                    gap: 20px;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.5), inset 0 0 20px rgba(255,255,255,0.02);
                    animation: springIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    z-index: 10000;
                    color: white;
                }
                @keyframes springIn {
                    from { opacity: 0; transform: translateX(50px) scale(0.9); }
                    to { opacity: 1; transform: translateX(0) scale(1); }
                }

                .neural-core-container { width: 44px; flex-shrink: 0; }
                .neural-core { width: 100%; height: auto; }
                .core-outer { fill: none; stroke: var(--primary); stroke-width: 2; opacity: 0.3; }
                .core-inner { fill: none; stroke: var(--primary); stroke-width: 4; stroke-dasharray: 5 10; animation: rotate 4s linear infinite; }
                .core-pulse { fill: var(--primary); filter: blur(4px); animation: pulse 2s ease-in-out infinite; }
                
                .nudge--clinical .core-inner, .nudge--clinical .core-pulse { stroke: #3b82f6; fill: #3b82f6; }
                .nudge--strategy .core-inner, .nudge--strategy .core-pulse { stroke: #f59e0b; fill: #f59e0b; }
                .nudge--wellness .core-inner, .nudge--wellness .core-pulse { stroke: #10b981; fill: #10b981; }

                @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes pulse { 0% { opacity: 0.5; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.1); } 100% { opacity: 0.5; transform: scale(0.8); } }

                .nudge-content { flex: 1; }
                .nudge-header { display: flex; justify-content: space-between; margin-bottom: 12px; }
                .ai-tag { font-size: 0.65rem; font-weight: 900; color: var(--primary); letter-spacing: 0.15em; }
                .telemetry-id { font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; color: rgba(255,255,255,0.3); }
                .nudge-message { font-size: 0.95rem; line-height: 1.6; color: #e2e8f0; font-weight: 500; margin-bottom: 12px; }
                .thought-trace { font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; color: #64748b; text-transform: uppercase; }

                .nudge-close { 
                    background: rgba(255,255,255,0.05); 
                    border: none; 
                    color: #94a3b8; 
                    width: 28px; height: 28px; 
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: all 0.2s;
                }
                .nudge-close:hover { background: rgba(255,0,0,0.1); color: #f87171; }
            `}</style>
        </div>
    );
}
