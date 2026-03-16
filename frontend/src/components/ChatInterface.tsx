import React, { useState, useEffect, useRef } from 'react';
import DotMatrixIcon from './DotMatrixIcon';

interface ChatInterfaceProps {
    onTranscript: (text: string, reasoning?: any) => void;
    onStatusChange?: (status: 'idle' | 'connecting' | 'active') => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onTranscript, onStatusChange }) => {
    const [status, setStatus] = useState<'idle' | 'connecting' | 'active'>('idle');
    const [messages, setMessages] = useState<{ role: 'user' | 'system', text: string }[]>([]);
    const [commandText, setCommandText] = useState("");
    const socketRef = useRef<WebSocket | null>(null);

    // Sync status with parent
    useEffect(() => {
        if (onStatusChange) {
            onStatusChange(status);
        }
    }, [status, onStatusChange]);

    // Auto-connect to the stable text bridge
    useEffect(() => {
        let isMounted = true;
        let reconnectTimeout: number | undefined;

        const connect = () => {
            if (!isMounted) return;
            console.log("[Chat] Connecting to Agent Bridge...");
            setStatus('connecting');
            
            const socket = new WebSocket('ws://localhost:8765');
            socketRef.current = socket;

            socket.onopen = () => {
                if (!isMounted) return;
                console.log("[Chat] Bridge established.");
                setStatus('active');
            };

            socket.onmessage = (event) => {
                if (!isMounted) return;
                const data = JSON.parse(event.data);
                if (data.type === 'transcript') {
                    if (data.final) {
                        onTranscript(data.text, data.reasoning);
                        setMessages(prev => [...prev, { role: 'system', text: `Supervisor processing complete.` }]);
                    }
                } else if (data.type === 'error') {
                    setMessages(prev => [...prev, { role: 'system', text: `ERROR: ${data.message}` }]);
                }
            };

            socket.onclose = () => {
                if (!isMounted) return;
                console.log("[Chat] Bridge closed. Reconnecting in 3s...");
                setStatus('idle');
                reconnectTimeout = window.setTimeout(connect, 3000);
            };
        };

        connect();
        return () => {
            isMounted = false;
            socketRef.current?.close();
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
        };
    }, [onTranscript]);

    const handleSend = () => {
        if (!commandText.trim() || status !== 'active') return;
        
        socketRef.current?.send(JSON.stringify({ type: 'text', text: commandText }));
        setMessages(prev => [...prev, { role: 'user', text: commandText }]);
        setCommandText("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div className="nothing-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="label" style={{ fontSize: '14px' }}>Nexus AI Chat</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ 
                        width: '6px', 
                        height: '6px', 
                        borderRadius: '50%', 
                        backgroundColor: status === 'active' ? '#00FF00' : '#444' 
                    }} />
                    <span className="label" style={{ fontSize: '10px', color: '#666' }}>
                        {status === 'active' ? 'BRIDGE: ONLINE' : 'BRIDGE: CONNECTING'}
                    </span>
                </div>
            </div>

            <div style={{ 
                height: '120px', 
                overflowY: 'auto', 
                background: '#0A0A0A', 
                borderRadius: '12px', 
                border: '1px solid #1A1A1A',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
            }}>
                {messages.length === 0 && (
                    <div style={{ color: '#333', fontSize: '12px', fontStyle: 'italic' }}>
                        Type a command to interact with the Supervisor...
                    </div>
                )}
                {messages.map((m, i) => (
                    <div key={i} style={{ 
                        fontSize: '12px', 
                        color: m.role === 'user' ? '#FFF' : '#888',
                        fontFamily: 'var(--font-mono)',
                        borderLeft: `2px solid ${m.role === 'user' ? '#444' : '#222'}`,
                        paddingLeft: '8px'
                    }}>
                        <span style={{ color: '#555', marginRight: '8px' }}>[{m.role.toUpperCase()}]</span>
                        {m.text}
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
                <input 
                    type="text"
                    placeholder="Enter system command..."
                    value={commandText}
                    onChange={(e) => setCommandText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    style={{
                        flexGrow: 1,
                        background: '#000',
                        border: '1px solid #2A2A2A',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        color: '#FFF',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '13px',
                        outline: 'none'
                    }}
                />
                <button 
                    className="nothing-button" 
                    onClick={handleSend}
                    disabled={status !== 'active'}
                    style={{ padding: '0 24px', fontSize: '12px', opacity: status === 'active' ? 1 : 0.5 }}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default React.memo(ChatInterface);
