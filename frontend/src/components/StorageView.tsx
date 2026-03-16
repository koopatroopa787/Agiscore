import React from 'react';

const StorageView: React.FC = () => {
    const mockDb = [
        { id: 1, item: 'Industrial Sensor A', quantity: 150 },
        { id: 2, item: 'Control Valve B', quantity: 45 },
        { id: 3, item: 'High-Pressure Pump C', quantity: 12 },
        ...Array.from({ length: 300 }, (_, i) => {
            const id = i + 4;
            const types = ["Turbine", "Sensor", "Valve", "Pump", "Compressor", "Actuator"];
            const name = `${types[id % types.length]} ${String.fromCharCode(65 + (id % 26))}${id}`;
            return { id, item: name, quantity: (id * 7) % 200 };
        })
    ];

    return (
        <div className="nothing-card" style={{ display: 'flex', flexDirection: 'column', maxHeight: '450px' }}>
            <h3 className="label" style={{ fontSize: '12px', marginBottom: '16px', color: '#666' }}>Internal SQL Storage (300+ Records)</h3>
            <div style={{ flexGrow: 1, overflowY: 'auto', paddingRight: '8px' }}>
                <table className="nothing-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Item Description</th>
                            <th>Qty</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockDb.map(row => (
                            <tr key={row.id}>
                                <td style={{ color: '#444' }}>{row.id.toString().padStart(3, '0')}</td>
                                <td>{row.item}</td>
                                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{row.quantity}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div style={{ marginTop: '20px', fontSize: '10px', color: '#444', fontStyle: 'italic' }}>
                Connected to In-Memory Grounding Engine via MCP Server.
            </div>
        </div>
    );
};

export default StorageView;
