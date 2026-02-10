
import React from 'react';
import { motion } from 'framer-motion';
import { X, ShieldAlert, Ghost, Cpu, Code2, Zap, ShieldCheck } from 'lucide-react';
import { panel, panelHeader, btnDanger, settingRow } from '../../styles/Panels.css';

interface PanelProps {
  onClose: () => void;
}

export const DocsPanel: React.FC<PanelProps> = ({ onClose }) => (
  <motion.div 
    initial={{ x: -800, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: -800, opacity: 0 }}
    transition={{ type: 'spring', damping: 20, stiffness: 100 }}
    className={panel}
  >
    <div className={panelHeader}>
      <h2>SENTINEL CORE DOCUMENTATION</h2>
      <button onClick={onClose} className={btnDanger}><X size={16} /> CLOSE</button>
    </div>
    <div className="doc-content" style={{ overflow: 'auto', flex: 1 }}>
      <section className="doc-section">
        <h3><ShieldAlert size={18} color="#ef4444" /> Architectural Policing</h3>
        <p>Sentinel monitors dependency flow in real-time. Dependencies must only flow towards the Domain Layer. <b>Red glowing links</b> represent a breach of Clean Architecture rules.</p>
        <div className="rule-list">
            <div className="rule-item"><b>❌ Presentation -{'>'} Infrastructure:</b> Forbidden Link</div>
            <div className="rule-item"><b>❌ Domain -{'>'} Application:</b> Forbidden Link</div>
            <div className="rule-item"><b>✅ Application -{'>'} Domain:</b> Pure Flow</div>
        </div>
      </section>

      <section className="doc-section" style={{ marginTop: '30px' }}>
        <h3><Ghost size={18} color="#94a3b8" /> Dead Code (Orphans)</h3>
        <p>Nodes rendered in <b>Ghost Gray</b> with a 💀 icon are orphans. No other part of the project references them, or they reference nothing. They are candidates for deletion.</p>
      </section>

      <section className="doc-section" style={{ marginTop: '30px' }}>
        <h3><Cpu size={18} color="#3b82f6" /> Agentic Tools (MCP)</h3>
        <div className="tool-grid">
            <div className="tool-card"><Code2 size={16}/> <b>analyze_project:</b> Deep JSON DNA scan.</div>
            <div className="tool-card"><Zap size={16}/> <b>trigger_ui_action:</b> AI-to-Browser remote control.</div>
            <div className="tool-card"><ShieldCheck size={16}/> <b>sentinel_audit:</b> Compliance verification.</div>
        </div>
      </section>

      <section className="doc-section" style={{ marginTop: '30px' }}>
        <h3>🛰️ Navigation HUD</h3>
        <ul className="shortcuts">
            <li><b>DNA SEARCH:</b> Type to find, click result to <b>Camera Zoom</b>.</li>
            <li><b>LEFT CLICK:</b> Examine Node DNA (Source Code).</li>
            <li><b>RIGHT CLICK:</b> Panic Pan (Manual Navigation).</li>
            <li><b>ESC:</b> Immediate Tactical Retreat (Close all UI).</li>
            <li><b>WHEEL:</b> Depth shift / Neural Zoom.</li>
        </ul>
      </section>
    </div>
  </motion.div>
);

interface SettingsProps {
    onClose: () => void;
    nodeSize: number;
    setNodeSize: (val: number) => void;
    linkDist: number;
    setLinkDist: (val: number) => void;
    linkThickness: number;
    setLinkThickness: (val: number) => void;
    colorMap: Record<string, string>;
    setColorMap: (map: Record<string, string>) => void;
    inboundColor: string;
    setInboundColor: (val: string) => void;
    outboundColor: string;
    setOutboundColor: (val: string) => void;
}

export const SettingsPanel: React.FC<SettingsProps> = ({ 
    onClose, nodeSize, setNodeSize, linkDist, setLinkDist, linkThickness, setLinkThickness, colorMap, setColorMap,
    inboundColor, setInboundColor, outboundColor, setOutboundColor
}) => (
  <motion.div 
    initial={{ x: 800, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: 800, opacity: 0 }}
    transition={{ type: 'spring', damping: 20, stiffness: 100 }}
    style={{ left: 'auto', right: 0 }}
    className={panel}
  >
    <div className={panelHeader}>
      <h2>SYSTEM PREFS</h2>
      <button onClick={onClose} className={btnDanger}><X size={16} /> CLOSE</button>
    </div>
    <div className="settings-body">
      <div className={settingRow}>
        <label>NEURAL GLYPH SCALE</label>
        <input type="range" min="1" max="25" value={nodeSize} onChange={(e) => setNodeSize(Number(e.target.value))} />
        <span>{nodeSize}</span>
      </div>
      <div className={settingRow}>
        <label>NEURAL LINK DISTANCE</label>
        <input type="range" min="50" max="600" value={linkDist} onChange={(e) => setLinkDist(Number(e.target.value))} />
        <span>{linkDist}</span>
      </div>
      <div className={settingRow}>
        <label>NEURAL LINK THICKNESS</label>
        <input type="range" min="0.1" max="10" step="0.1" value={linkThickness} onChange={(e) => setLinkThickness(Number(e.target.value))} />
        <span>{linkThickness}</span>
      </div>

      <div style={{ margin: '30px 0', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
         <h3 style={{ fontSize: '11px', color: '#3b82f6', marginBottom: '15px' }}>FLOW ANALYSIS COLORS</h3>
         
         <div className={settingRow} style={{ justifyContent: 'space-between' }}>
            <label>OUTBOUND (DEPENDENCY)</label>
            <input 
                type="color" 
                value={outboundColor} 
                onChange={(e) => setOutboundColor(e.target.value)}
                style={{ border: 'none', width: '30px', height: '30px', cursor: 'pointer', background: 'transparent' }}
            />
         </div>
         
         <div className={settingRow} style={{ justifyContent: 'space-between' }}>
            <label>INBOUND (CONSUMER)</label>
            <input 
                type="color" 
                value={inboundColor} 
                onChange={(e) => setInboundColor(e.target.value)}
                style={{ border: 'none', width: '30px', height: '30px', cursor: 'pointer', background: 'transparent' }}
            />
         </div>
      </div>

      <div style={{ margin: '30px 0', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
         <h3 style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '15px' }}>NEURAL COLOR MAPPING</h3>
         {Object.entries(colorMap).map(([cat, color]) => (
            <div key={cat} className={settingRow} style={{ justifyContent: 'space-between' }}>
                <label style={{ textTransform: 'uppercase' }}>{cat}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input 
                        type="color" 
                        value={color} 
                        onChange={(e) => setColorMap({ ...colorMap, [cat]: e.target.value })}
                        style={{ border: 'none', width: '30px', height: '30px', cursor: 'pointer', background: 'transparent' }}
                    />
                    <span style={{ fontFamily: 'monospace', fontSize: '10px' }}>{color}</span>
                </div>
            </div>
         ))}
      </div>

      <div className="storage-info">Settings successfully persistent in NeuralStorage.</div>
    </div>
  </motion.div>
);
