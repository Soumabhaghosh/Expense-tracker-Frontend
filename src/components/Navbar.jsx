import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/',          label: 'Dashboard', icon: '◈' },
  { to: '/expenses',  label: 'Expenses',  icon: '≡' },
  { to: '/analytics', label: 'Analytics', icon: '◎' },
  { to: '/budgets',   label: 'Budgets',   icon: '⊡' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <nav style={{ background:'var(--bg2)', borderBottom:'1px solid var(--border)', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ maxWidth:900, margin:'0 auto', padding:'0 20px', display:'flex', alignItems:'center', height:60 }}>
          <div style={{ fontFamily:'DM Serif Display', fontSize:20, color:'var(--gold)', marginRight:32, flexShrink:0 }}>
            💰 Expense
          </div>
          <div style={{ display:'flex', gap:2, flex:1, overflowX:'auto' }}>
            {NAV.map(n => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === '/'}
                style={({ isActive }) => ({
                  display:'flex', alignItems:'center', gap:7,
                  padding:'8px 14px', borderRadius:8, fontSize:14,
                  color: isActive ? 'var(--gold)' : 'var(--text2)',
                  border: `1px solid ${isActive ? 'var(--gold)' : 'transparent'}`,
                  fontWeight: 500, whiteSpace:'nowrap', transition:'all .2s',
                  textDecoration:'none',
                })}
              >
                <span style={{ fontSize:16 }}>{n.icon}</span>
                <span className="nav-label">{n.label}</span>
              </NavLink>
            ))}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0, marginLeft:16 }}>
            <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--gold-dim)', border:'1px solid var(--gold)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:600, color:'var(--gold)' }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              style={{ fontSize:12, color:'var(--text3)', padding:'5px 12px', border:'1px solid var(--border)', borderRadius:6, background:'var(--bg3)' }}
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>
      <style>{`@media(max-width:400px){ .nav-label{ display:none } }`}</style>
    </>
  );
}
