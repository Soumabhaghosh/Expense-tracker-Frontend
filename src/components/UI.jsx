import React from 'react';
import { CAT_MAP, fmt } from '../utils/constants';

export function Spinner({ size = 20, color = 'var(--gold)' }) {
  return (
    <>
      <style>{`@keyframes _spin { to { transform: rotate(360deg) } }`}</style>
      <span style={{
        display: 'inline-block', width: size, height: size,
        border: '2px solid var(--border)', borderTopColor: color,
        borderRadius: '50%', animation: '_spin .8s linear infinite',
        flexShrink: 0,
      }} />
    </>
  );
}

export function Btn({ children, variant = 'primary', size = 'md', loading, style, ...props }) {
  const sizes = { sm: '6px 12px', md: '10px 20px', lg: '13px 28px' };
  const variants = {
    primary: { background: 'var(--gold)', color: '#0f0f14', borderColor: 'var(--gold)' },
    ghost:   { background: 'transparent', color: 'var(--text2)', borderColor: 'var(--border)' },
    danger:  { background: 'var(--red-dim)', color: 'var(--red)', borderColor: 'rgba(224,92,92,.25)' },
    outline: { background: 'var(--bg3)', color: 'var(--text)', borderColor: 'var(--border)' },
  };
  return (
    <button
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        borderRadius: 8, fontWeight: 500, border: '1px solid', transition: 'all .15s',
        padding: sizes[size], opacity: loading ? 0.65 : 1,
        cursor: loading ? 'not-allowed' : 'pointer',
        ...variants[variant], ...style,
      }}
      disabled={loading}
      {...props}
    >
      {loading ? <Spinner size={14} /> : children}
    </button>
  );
}

export function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <>
      <style>{`@keyframes _min { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:none } }`}</style>
      <div
        onClick={onClose}
        style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:16 }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--radius)', width:'100%', maxWidth:480, maxHeight:'90vh', overflowY:'auto', boxShadow:'var(--shadow)', animation:'_min .2s ease' }}
        >
          {children}
        </div>
      </div>
    </>
  );
}

export function Card({ children, style, ...props }) {
  return (
    <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--radius)', ...style }} {...props}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, sub, color, icon }) {
  return (
    <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'18px 20px', flex:1, minWidth:0 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div style={{ fontSize:12, color:'var(--text3)', marginBottom:8, textTransform:'uppercase', letterSpacing:1 }}>{label}</div>
        {icon && <span style={{ fontSize:18 }}>{icon}</span>}
      </div>
      <div style={{ fontSize:22, fontWeight:600, color:color||'var(--text)', fontFamily:'DM Serif Display' }}>{value}</div>
      {sub && <div style={{ fontSize:12, color:'var(--text2)', marginTop:4 }}>{sub}</div>}
    </div>
  );
}

export function CatIcon({ catId, size = 38 }) {
  const c = CAT_MAP[catId] || { icon:'📦', color:'#a09e9a' };
  return (
    <div style={{ width:size, height:size, borderRadius:10, background:c.color+'20', display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*0.47, flexShrink:0 }}>
      {c.icon}
    </div>
  );
}

export function ExpenseRow({ expense, onEdit, onDelete, showBorder = true }) {
  const c = CAT_MAP[expense.category] || { icon:'📦', color:'#a09e9a', label:'Other' };
  const [confirm, setConfirm] = React.useState(false);
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 20px', borderBottom:showBorder?'1px solid var(--border)':'none' }}>
      <CatIcon catId={expense.category} />
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontWeight:500, fontSize:14, marginBottom:3, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
          {expense.title}
          {expense.is_recurring ? <span style={{ marginLeft:6, fontSize:10, color:'var(--purple)', background:'rgba(155,127,232,.15)', padding:'2px 6px', borderRadius:20 }}>↻ {expense.recur_freq}</span> : null}
        </div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
          <span style={{ fontSize:12, color:'var(--text3)' }}>{new Date(expense.date).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</span>
          <span style={{ fontSize:11, color:c.color, background:c.color+'18', padding:'1px 7px', borderRadius:20 }}>{c.icon} {c.label}</span>
          {expense.method && <span style={{ fontSize:11, color:'var(--text3)', background:'var(--bg4)', padding:'1px 7px', borderRadius:20 }}>{expense.method}</span>}
        </div>
      </div>
      <div style={{ textAlign:'right', flexShrink:0 }}>
        <div style={{ fontWeight:600, fontSize:15, fontFamily:'DM Serif Display' }}>{fmt(expense.amount)}</div>
        <div style={{ display:'flex', gap:4, marginTop:5, justifyContent:'flex-end' }}>
          <button onClick={()=>onEdit(expense)} style={{ fontSize:11, color:'var(--text3)', padding:'2px 8px', borderRadius:6, border:'1px solid var(--border)', background:'var(--bg3)' }}>Edit</button>
          {confirm
            ? <>
                <button onClick={()=>onDelete(expense.id)} style={{ fontSize:11, color:'var(--red)', padding:'2px 8px', borderRadius:6, border:'1px solid rgba(224,92,92,.3)', background:'var(--red-dim)' }}>Confirm</button>
                <button onClick={()=>setConfirm(false)} style={{ fontSize:11, color:'var(--text3)', padding:'2px 8px', borderRadius:6, border:'1px solid var(--border)', background:'var(--bg3)' }}>Cancel</button>
              </>
            : <button onClick={()=>setConfirm(true)} style={{ fontSize:11, color:'var(--red)', padding:'2px 8px', borderRadius:6, border:'1px solid rgba(224,92,92,.25)', background:'var(--red-dim)' }}>Del</button>
          }
        </div>
      </div>
    </div>
  );
}

export function Empty({ icon = '💸', message = 'No data yet' }) {
  return (
    <div style={{ textAlign:'center', padding:'50px 0', color:'var(--text3)' }}>
      <div style={{ fontSize:40, marginBottom:12 }}>{icon}</div>
      <div>{message}</div>
    </div>
  );
}

export function Alert({ type = 'error', message }) {
  if (!message) return null;
  const colors = { error:'var(--red)', success:'var(--green)', info:'var(--blue)' };
  const bgs    = { error:'var(--red-dim)', success:'var(--green-dim)', info:'rgba(92,144,224,.12)' };
  return (
    <div style={{ fontSize:13, color:colors[type], background:bgs[type], padding:'10px 14px', borderRadius:8, border:`1px solid ${colors[type]}33` }}>
      {message}
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <div>
      {label && <label style={{ fontSize:12, color:'var(--text3)', display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:.8 }}>{label}</label>}
      {children}
    </div>
  );
}
