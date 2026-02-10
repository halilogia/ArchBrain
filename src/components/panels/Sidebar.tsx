
import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, ChevronUp, ChevronDown, Power, Zap, RotateCcw, RefreshCw } from 'lucide-react';
import { sidebar, sidebarHeader, systemConsole, statusGrid, statusTile, logArea, btnMini, controlBtn } from '../../styles/Panels.css';

interface SidebarProps {
  isMinimized: boolean;
  onToggle: () => void;
  logs: string[];
  serverStatus: { uptime: number; watcher: string; mcp: string };
  onToggleWatcher: () => void;
  onToggleMCP: () => void;
  onManualScan: () => void;
  onResetView: () => void;
  onRestartServer: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isMinimized, 
  onToggle, 
  logs, 
  serverStatus,
  onToggleWatcher,
  onToggleMCP,
  onManualScan,
  onResetView,
  onRestartServer
}) => {
  return (
    <motion.div 
        animate={{ height: isMinimized ? 60 : 540 }}
        style={{ zIndex: 9999 }}
        className={sidebar}
      >
        <div className={sidebarHeader}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
            <Terminal size={12} /> SENTINEL LOGS
          </h3>
          <button onClick={() => onToggle()} className={btnMini} style={{ padding: '8px' }}>
            {isMinimized ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
        
        {!isMinimized && (
          <>
            <div className={systemConsole}>
               <div className={statusGrid}>
                 <div className={statusTile}>
                    <label>UPTIME</label>
                    <span>{serverStatus.uptime.toFixed(1)}s</span>
                 </div>
                 <div className={statusTile}>
                    <label>WATCHER</label>
                    <span style={{color: serverStatus.watcher === 'ACTIVE' ? '#10b981' : '#f59e0b'}}>{serverStatus.watcher}</span>
                 </div>
                 <div className={statusTile}>
                    <label>MCP</label>
                    <span style={{color: serverStatus.mcp === 'ONLINE' ? '#3b82f6' : '#ef4444'}}>{serverStatus.mcp}</span>
                 </div>
               </div>
               <div className="console-actions" style={{ display: 'flex', gap: '8px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <button 
                    className={controlBtn} 
                    title="Toggle Watcher" 
                    onClick={() => onToggleWatcher()}
                    style={{ color: serverStatus.watcher === 'ACTIVE' ? '#10b981' : '#f59e0b' }}
                  >
                    <Power size={14}/>
                  </button>

                  <button 
                    className={controlBtn} 
                    title="Toggle MCP Status" 
                    onClick={() => onToggleMCP()}
                    style={{ color: serverStatus.mcp === 'ONLINE' ? '#3b82f6' : '#ef4444' }}
                  >
                    <Zap size={14}/>
                  </button>

                  <button className={controlBtn} title="Force Sync" onClick={() => onManualScan()}><RefreshCw size={14}/></button>

                  <button 
                     className={controlBtn} 
                     title="Tactical Restart" 
                     onClick={() => onRestartServer()} 
                     style={{ marginLeft: 'auto', color: '#f59e0b' }}
                  >
                    <RotateCcw size={14}/>
                  </button>
               </div>
            </div>

            <div className={logArea}>
              {logs.map((log, i) => (
                <div key={i} style={{ color: log.includes('⚠️') ? '#ef4444' : 'inherit', fontWeight: log.includes('⚠️') ? '900' : 'normal', marginBottom: '4px' }}>
                    {log}
                </div>
              ))}
            </div>
          </>
        )}
      </motion.div>
  );
};
