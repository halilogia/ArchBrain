
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, Settings } from 'lucide-react';
import { NeuralNode, colorMap } from '../../types';
import { header, headerContent, logoText, searchContainer, searchBox, searchInput, searchResults as searchResultsStyle, searchItem, btnSecondary, btnIcon, btnPrimary } from '../../styles/App.css';

interface HeaderProps {
    onOpenDocs: () => void;
    onOpenSettings: () => void;
    onScan: () => void;
    searchQuery: string;
    onSearch: (q: string) => void;
    searchResults: NeuralNode[];
    onResultClick: (node: NeuralNode) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenDocs, 
  onOpenSettings, 
  onScan, 
  searchQuery, 
  onSearch,
  searchResults,
  onResultClick
}) => {
  return (
    <header className={header}>
        <div className={headerContent}>
          <div className={logoText}>
            ARCHBRAIN<span style={{ color: '#3b82f6' }}>.SENTINEL</span>
          </div>
        </div>
        
        <div className={headerContent}>
          <div className={searchContainer}>
            <div className={searchBox}>
                <Search size={14} style={{ position: 'absolute', left: 14, color: '#3b82f6', opacity: 0.8, zIndex: 2 }} />
                <input 
                    type="text" 
                    placeholder="FIND DNA..." 
                    value={searchQuery}
                    onChange={(e) => onSearch(e.target.value)}
                    className={searchInput}
                />
            </div>
            <AnimatePresence>
                {searchResults.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -10 }}
                        className={searchResultsStyle}
                    >
                        {searchResults.map(node => (
                            <div key={node.id} className={searchItem} onClick={() => onResultClick(node)}>
                                <span style={{ color: colorMap[node.category] }}>■</span>
                                <b>{node.label}</b>
                                <span className="cat">{node.category}</span>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
          </div>
          <button onClick={onOpenSettings} className={btnIcon}>
            <Settings size={20} />
          </button>
          <button onClick={onScan} className={btnPrimary}>SCAN ENGINE</button>
        </div>
      </header>
  );
};
