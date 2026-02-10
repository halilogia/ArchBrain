
import { style } from '@vanilla-extract/css';
import { vars } from './theme.css.js';

export const neuralEngine = style({
    position: 'relative',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden'
});

export const header = style({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    padding: '24px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: vars.zIndices.header,
    pointerEvents: 'none'
});

export const headerContent = style({
    pointerEvents: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
});

export const logoText = style({
    fontSize: '28px',
    fontWeight: 950,
    color: 'white',
    letterSpacing: '-1px'
});

export const searchContainer = style({
    position: 'relative'
});

export const searchBox = style({
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
});

export const searchInput = style({
    background: 'rgba(2, 6, 23, 0.6)',
    backdropFilter: 'blur(10px)',
    border: `1px solid rgba(59, 130, 246, 0.3)`,
    borderRadius: '12px',
    padding: '12px 16px 12px 38px',
    color: 'white',
    width: '200px',
    fontFamily: vars.fonts.mono,
    fontSize: '12px',
    outline: 'none',
    transition: '0.3s',
    ':focus': {
        borderColor: vars.colors.primary,
        width: '280px',
        background: 'rgba(2, 6, 23, 0.9)',
        boxShadow: '0 0 15px rgba(59, 130, 246, 0.2)'
    }
});

export const searchResults = style({
    position: 'absolute',
    top: 'calc(100% + 10px)',
    left: 0,
    width: '100%',
    background: 'rgba(15, 23, 42, 0.95)',
    border: `1px solid ${vars.colors.glassBorder}`,
    borderRadius: '12px',
    padding: '8px',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
    zIndex: 100
});

export const searchItem = style({
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    transition: '0.2s',
    fontFamily: vars.fonts.mono,
    ':hover': {
        background: 'rgba(255,255,255,0.05)'
    }
});

// Buttons
export const btnPrimary = style({
    background: vars.colors.primary,
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '99px',
    fontWeight: 800,
    fontSize: '12px',
    cursor: 'pointer',
    boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
    transition: 'all 0.2s',
    ':hover': {
        transform: 'scale(1.05)',
        boxShadow: '0 0 30px rgba(59, 130, 246, 0.6)'
    }
});

export const btnSecondary = style({
    background: 'rgba(16, 185, 129, 0.1)',
    border: `1px solid ${vars.colors.accent}`,
    color: vars.colors.accent,
    padding: '8px 16px',
    borderRadius: '99px',
    fontWeight: 700,
    fontSize: '11px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: '0.2s',
    ':hover': {
        background: 'rgba(16, 185, 129, 0.2)'
    }
});

export const btnIcon = style({
    background: 'rgba(255,255,255,0.05)',
    border: `1px solid ${vars.colors.glassBorder}`,
    color: 'white',
    padding: '10px',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: '0.2s',
    ':hover': {
        background: 'rgba(255,255,255,0.1)',
        borderColor: 'rgba(255,255,255,0.2)'
    }
});
