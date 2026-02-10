
import { style } from '@vanilla-extract/css';
import { vars } from './theme.css.js';

export const glassCard = style({
    background: vars.colors.glass,
    backdropFilter: 'blur(20px)',
    border: `1px solid ${vars.colors.glassBorder}`,
    boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
});

export const sidebar = style([glassCard, {
    position: 'absolute',
    bottom: '24px',
    right: '24px',
    width: '360px',
    borderRadius: '20px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: vars.zIndices.sidebar,
    pointerEvents: 'auto'
}]);

export const sidebarHeader = style({
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 25px',
    borderBottom: 'none'
});

export const systemConsole = style({
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '14px',
    padding: '16px',
    margin: '0 24px 20px 24px',
    border: `1px solid ${vars.colors.glassBorder}`
});

export const statusGrid = style({
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '12px'
});

export const statusTile = style({
    display: 'flex',
    flexDirection: 'column'
});

export const logArea = style({
    fontFamily: vars.fonts.mono,
    fontSize: '11px',
    color: vars.colors.textMuted,
    overflowY: 'auto',
    flex: 1,
    padding: '0 25px 25px'
});

export const panel = style([glassCard, {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    width: '900px',
    maxWidth: '95vw',
    zIndex: vars.zIndices.panels,
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    pointerEvents: 'auto'
}]);

export const panelHeader = style({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: `1px solid ${vars.colors.glassBorder}`,
    paddingBottom: '15px'
});

export const codeBox = style({
    background: '#0b101e',
    border: `1px solid ${vars.colors.glassBorder}`,
    borderRadius: '12px',
    padding: '20px',
    fontFamily: vars.fonts.mono,
    fontSize: '13px',
    lineHeight: 1.5,
    color: '#e2e8f0',
    overflow: 'auto',
    flex: 1,
    whiteSpace: 'pre'
});

export const btnDanger = style({
    background: 'rgba(239, 68, 68, 0.1)',
    border: `1px solid ${vars.colors.danger}`,
    color: vars.colors.danger,
    padding: '8px 16px',
    borderRadius: '12px',
    fontWeight: 800,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '11px'
});

export const btnMini = style({
    background: 'transparent',
    border: `1px solid rgba(59, 130, 246, 0.3)`,
    color: vars.colors.primary,
    borderRadius: '6px',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: '0.2s',
    ':hover': {
        background: 'rgba(59, 130, 246, 0.1)'
    }
});

export const controlBtn = style({
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'white',
    padding: '6px',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: '0.2s',
    ':hover': {
        background: 'rgba(59, 130, 246, 0.2)',
        borderColor: vars.colors.primary
    }
});

export const settingRow = style({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    color: vars.colors.textMuted,
    fontSize: '12px',
    fontWeight: 700
});
