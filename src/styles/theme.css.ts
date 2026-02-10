
import { createGlobalTheme, globalStyle } from '@vanilla-extract/css';

export const vars = createGlobalTheme(':root', {
  colors: {
    bgDark: '#020617',
    glass: 'rgba(15, 23, 42, 0.6)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',
    primary: '#3b82f6',
    accent: '#10b981',
    danger: '#ef4444',
    textMain: '#f8fafc',
    textMuted: '#94a3b8'
  },
  fonts: {
    main: "'Outfit', sans-serif",
    mono: "'JetBrains Mono', monospace"
  },
  zIndices: {
    canvas: '0',
    header: '100',
    sidebar: '200',
    panels: '2000'
  }
});

globalStyle('body', {
  margin: 0,
  fontFamily: vars.fonts.main,
  backgroundColor: vars.colors.bgDark,
  color: vars.colors.textMain,
  overflow: 'hidden'
});

globalStyle('*, *::before, *::after', {
  boxSizing: 'border-box'
});

globalStyle('::-webkit-scrollbar', {
    width: '6px',
    height: '6px'
});
globalStyle('::-webkit-scrollbar-track', {
    background: 'transparent'
});
globalStyle('::-webkit-scrollbar-thumb', {
    background: 'rgba(59, 130, 246, 0.3)',
    borderRadius: '3px'
});
globalStyle('::-webkit-scrollbar-thumb:hover', {
    background: 'rgba(59, 130, 246, 0.6)'
});

export const neuralEngine = 'neural-engine'; // Helper class if needed, or define as style
