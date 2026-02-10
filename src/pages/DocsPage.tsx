
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Search, Code, Bookmark, Share2 } from 'lucide-react';
import { DocsPanel } from '../components/panels/OverlayPanels';

// Reusing style constants for consistency
const glassCard = {
    background: 'rgba(30, 41, 59, 0.7)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(148, 163, 184, 0.1)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '20px'
};

const DocsPage = () => {
    return (
        <div style={{ 
            width: '100vw', 
            height: '100vh', 
            background: '#0f172a', 
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <div style={{ 
                height: '60px', 
                borderBottom: '1px solid #334155', 
                display: 'flex', 
                alignItems: 'center', 
                padding: '0 30px',
                background: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(10px)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <BookOpen size={20} color="#38bdf8" />
                    <span style={{ fontWeight: 800, color: 'white', letterSpacing: '1px' }}>ARCHBRAIN KNOWLEDGE BASE</span>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '15px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 10, top: 10 }} />
                        <input 
                            placeholder="Search documentation..." 
                            style={{ 
                                background: '#1e293b', 
                                border: '1px solid #334155', 
                                padding: '8px 10px 8px 36px', 
                                borderRadius: '8px',
                                color: 'white',
                                width: '250px'
                            }} 
                        />
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Sidebar Navigation */}
                <div style={{ width: '280px', borderRight: '1px solid #334155', padding: '20px', overflowY: 'auto' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <h4 style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '1px' }}>Core Concepts</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <div style={{ padding: '8px 12px', background: '#38bdf820', borderRadius: '8px', color: '#38bdf8', fontWeight: 600, cursor: 'pointer' }}>Introduction</div>
                            <div style={{ padding: '8px 12px', color: '#cbd5e1', cursor: 'pointer', opacity: 0.7 }}>The Neural Graph</div>
                            <div style={{ padding: '8px 12px', color: '#cbd5e1', cursor: 'pointer', opacity: 0.7 }}>Watcher Service</div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ maxWidth: '800px', margin: '0 auto' }}
                    >
                        <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '20px', color: 'white' }}>Introduction to ArchBrain</h1>
                        <p style={{ fontSize: '1.2rem', lineHeight: 1.8, color: '#ecf2f8', marginBottom: '40px' }}>
                            ArchBrain is not just a visualization tool; it is a live neural interface for your software architecture. 
                            It bridges the gap between static code and dynamic mental models.
                        </p>

                        <div style={glassCard}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', color: '#38bdf8' }}>
                                <Code size={20} /> How it Works
                            </h3>
                            <p style={{ color: '#cbd5e1', lineHeight: 1.6 }}>
                                The system runs a background Sentinel service (port 5050) that scans your codebase in real-time. 
                                It parses ASTs (Abstract Syntax Trees) to understand dependencies, not just file structures.
                            </p>
                        </div>
                        
                        <div style={glassCard}>
                            <h3 style={{  marginBottom: '15px', color: '#f472b6' }}>
                                ⚠️ Dead Code Detection
                            </h3>
                            <p style={{ color: '#cbd5e1', lineHeight: 1.6 }}>
                                ArchBrain automatically identifies "Orphan Nodes" - files that are never imported or used. 
                                These nodes appear as gray, disconnected entities in the Nebula Map.
                            </p>
                        </div>

                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default DocsPage;
