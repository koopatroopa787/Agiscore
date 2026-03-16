import React, { useState, useEffect, useCallback } from 'react';
import DotMatrixIcon from './components/DotMatrixIcon';
import CircularGauge from './components/CircularGauge';
import ChatInterface from './components/ChatInterface';
import StorageView from './components/StorageView';

const App: React.FC = () => {
    const [supervisorState, setSupervisorState] = useState<'idle' | 'connecting' | 'active'>('idle');
    const [logs, setLogs] = useState<string[]>([]);
    const [supervisorLogs, setSupervisorLogs] = useState<any[]>([]);
    const [metrics, setMetrics] = useState({ 
        cpu: 24, 
        memory: 42, 
        network: 12, 
        storage: 15,
        temp: 38 
    });
    const [isTaskCompleted, setIsTaskCompleted] = useState(false);

    const addLog = useCallback((msg: string) => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    }, []);

    const addSupervisorLog = useCallback((msg: string) => {
        setSupervisorLogs(prev => [...prev, msg]);
    }, []);

    const handleTranscript = useCallback((text: string, reasoning?: any) => {
        let parsedReasoning = reasoning;
        if (typeof reasoning === 'string') {
            try {
                parsedReasoning = JSON.parse(reasoning);
            } catch (e) {
                console.error("Failed to parse reasoning string:", reasoning);
            }
        }
        
        setSupervisorLogs([]); 
        addSupervisorLog(`COMMAND: "${text}"`);
        
        if (parsedReasoning && parsedReasoning.steps) {
            addSupervisorLog(`ORCHESTRATOR: Intent identified -> ${parsedReasoning.assigned_agent}`);
            
            if (parsedReasoning.findings) {
                addSupervisorLog(`GROUNDING: ${parsedReasoning.findings}`);
            }

            parsedReasoning.steps.forEach((step: string) => {
                addSupervisorLog(`PLANNING: ${step}`);
            });
            addSupervisorLog("EXECUTION: Action chain verified.");
        } else {
            addSupervisorLog("ORCHESTRATOR: Awaiting structured reasoning...");
            addSupervisorLog(`FEEDBACK: ${JSON.stringify(reasoning || "No context returned")}`);
        }
    }, [addSupervisorLog]);

    const handleApprove = () => {
        addLog("User Approval Received.");
        setMetrics(prev => ({ ...prev, cpu: 85 }));
        
        setTimeout(() => {
            addLog("Executing authorized legacy data synchronisation...");
            setMetrics(prev => ({ ...prev, cpu: 98 }));
        }, 800);

        setTimeout(() => {
            addLog("Core: Task successfully committed.");
            setMetrics(prev => ({ ...prev, cpu: 22 }));
            setIsTaskCompleted(true);
        }, 2000);
    };

    // Update metrics periodically
    useEffect(() => {
        const interval = setInterval(() => {
            setMetrics(prev => ({
                ...prev,
                cpu: Math.floor(20 + Math.random() * 15),
                memory: Math.floor(40 + Math.random() * 5),
                network: Math.floor(10 + Math.random() * 10),
            }));
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', background: '#000', color: '#FFF', minHeight: '100vh' }}>
            {/* Header Area */}
            <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: '32px', marginBottom: '8px', letterSpacing: '0.05em' }}>AEGIS-CORE :: DASHBOARD</h1>
                    <div className="label" style={{ color: '#666', fontSize: '10px' }}>SYS_VER_3.2 // MANCHESTER_HACKATHON_BRIDGE</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div className="label" style={{ fontSize: '10px', color: '#444' }}>ENCRYPTION_STATUS</div>
                    <div style={{ color: '#00FF00', fontSize: '10px' }}>AES-256 SECURED</div>
                </div>
            </div>

            <main style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '24px' }}>
                {/* Left Column - System Status */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="nothing-card" style={{ display: 'flex', alignItems: 'center', gap: '32px', padding: '24px' }}>
                        <DotMatrixIcon 
                            type={supervisorState === 'active' ? 'active' : supervisorState === 'connecting' ? 'loading' : 'clear'} 
                            size={80} 
                        />
                        <div>
                            <h2 style={{ marginBottom: '12px', fontSize: '18px', fontWeight: 'normal' }}>NEURAL ENGINE</h2>
                            <div className="label" style={{ 
                                fontSize: '12px',
                                color: supervisorState === 'active' ? '#00FF00' : 
                                       supervisorState === 'connecting' ? '#FFFF00' : '#444',
                                letterSpacing: '0.1em'
                            }}>
                                {supervisorState === 'active' ? 'BRIDGE: ONLINE' : 
                                 supervisorState === 'connecting' ? 'BRIDGE: CONNECTING' : 
                                 'BRIDGE: OFFLINE'}
                            </div>
                            <div style={{ fontSize: '10px', color: '#666', marginTop: '12px' }}>
                                MODEL: us.amazon.nova-2-lite-v1:0
                            </div>
                        </div>
                    </div>

                    <div className="nothing-card" style={{ flexGrow: 1, minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
                        <h3 className="label" style={{ fontSize: '12px', marginBottom: '16px', color: '#666' }}>SYSTEM TELEMETRY LOGS</h3>
                        <div style={{ 
                            fontFamily: 'Roboto Mono, monospace', 
                            fontSize: '11px', 
                            color: '#888',
                            flexGrow: 1,
                            overflowY: 'auto'
                        }}>
                            {logs.length === 0 && <div style={{ color: '#333' }}>No active background processes.</div>}
                            {logs.map((log, i) => (
                                <div key={i} style={{ marginBottom: '6px', borderLeft: '2px solid #222', paddingLeft: '8px' }}>
                                    {log}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column - User Interface and Reasoning */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                        <CircularGauge value={metrics.cpu} max={100} label="CPU" unit="%" />
                        <CircularGauge value={metrics.memory} max={100} label="RAM" unit="%" />
                        <CircularGauge value={metrics.network} max={100} label="NET" unit="kBps" />
                        <CircularGauge value={metrics.temp} max={100} label="TEMP" unit="°C" />
                    </div>

                    <ChatInterface onTranscript={handleTranscript} onStatusChange={setSupervisorState} />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        {/* System Reasoning */}
                        <div className="nothing-card" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
                            <div className="label" style={{ fontSize: '10px', color: '#666', marginBottom: '16px' }}>ORCHESTRATOR REASONING</div>
                            <div style={{ 
                                flexGrow: 1, 
                                overflowY: 'auto', 
                                background: '#050505', 
                                padding: '16px', 
                                borderRadius: '8px', 
                                border: '1px solid #111',
                                fontFamily: 'JetBrains Mono, monospace',
                                fontSize: '12px'
                            }}>
                                {supervisorLogs.map((log, i) => (
                                    <div key={i} style={{ marginBottom: '12px', borderLeft: '2px solid #00FF00', paddingLeft: '12px' }}>
                                        <div style={{ color: '#AAA' }}>{log}</div>
                                    </div>
                                ))}
                                {supervisorLogs.length === 0 && (
                                    <div style={{ color: '#222', fontStyle: 'italic' }}>Awaiting command...</div>
                                )}
                            </div>
                        </div>

                        {/* Inventory & Status Breakdown */}
                        <div className="nothing-card" style={{ display: 'flex', flexDirection: 'column' }}>
                            <h3 className="label" style={{ fontSize: '12px', marginBottom: '16px', color: '#666' }}>ACTIVE TASK BREAKDOWN</h3>
                            <div style={{ padding: '20px', border: '1px dashed #222', borderRadius: '12px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                {supervisorState === 'active' && supervisorLogs.length > 0 ? (
                                    <div style={{ textAlign: 'left', color: '#DDD', fontSize: '13px' }}>
                                        <div style={{ marginBottom: '12px' }}>• [IOT_CHIPS] Scanning Industrial Sensor A...</div>
                                        <div style={{ marginBottom: '24px' }}>• [SQL_GROUNDING] Checking Inventory...</div>
                                        
                                        {!isTaskCompleted ? (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #111', paddingTop: '20px' }}>
                                                <div style={{ color: '#FF3B30', fontSize: '11px', letterSpacing: '0.05em' }}>HITL_REQUIRED: PENDING_APPROVAL</div>
                                                <button 
                                                    className="nothing-button" 
                                                    style={{ padding: '8px 20px', fontSize: '11px' }}
                                                    onClick={handleApprove}
                                                >
                                                    APPROVE_ACTION
                                                </button>
                                            </div>
                                        ) : (
                                            <div style={{ color: '#00FF00', textAlign: 'center', fontWeight: 'bold', paddingTop: '20px', borderTop: '1px solid #111', letterSpacing: '0.1em' }}>
                                                ✓ TASK_COMMIT_SUCCESSFUL
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', color: '#333', fontSize: '12px' }}>
                                        SYSTEM IDLE // AWAITING NEURAL INPUT
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <StorageView />
                </div>
            </main>

            <footer style={{ marginTop: '40px', borderTop: '1px solid #111', paddingTop: '20px', textAlign: 'center' }}>
                <div className="label" style={{ fontSize: '9px', color: '#333', letterSpacing: '0.2em' }}>
                    AEGIS-CORE // NOVA-LITE-V1 // MANCHESTER_2026
                </div>
            </footer>
        </div>
    );
};

export default App;
