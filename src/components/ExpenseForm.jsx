import React, { useState } from 'react';
import { CATEGORIES, PAYMENT_METHODS, RECUR_FREQUENCIES } from '../utils/constants';
import { Btn, Alert, Field } from './UI';

const today = () => new Date().toLocaleDateString('en-CA');

export default function ExpenseForm({ initial, onSave, onCancel, loading }) {
  const [form, setForm] = useState(
    initial
      ? { ...initial, is_recurring: !!initial.is_recurring }
      : { title:'', amount:'', category:'food', date:today(), method:'UPI', notes:'', is_recurring:false, recur_freq:'monthly' }
  );
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.title.trim())                         return setError('Title is required');
    if (!form.amount || isNaN(form.amount) || +form.amount <= 0) return setError('Enter a valid amount');
    if (!form.date)                                 return setError('Select a date');
    setError('');
    onSave({ ...form, amount: parseFloat(form.amount) });
  };

  return (
    <div>
      <div style={{ padding:'20px 24px 16px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontFamily:'DM Serif Display', fontSize:20 }}>{initial ? 'Edit Expense' : 'Add Expense'}</span>
        <button onClick={onCancel} style={{ color:'var(--text3)', fontSize:22, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:6, border:'1px solid var(--border)', background:'var(--bg3)' }}>×</button>
      </div>

      <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>
        <Field label="Title *">
          <input placeholder="e.g. Zomato order, Metro recharge…" value={form.title} onChange={e=>set('title',e.target.value)} autoFocus />
        </Field>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Field label="Amount (₹) *">
            <input type="number" min="0" step="0.01" placeholder="0" value={form.amount} onChange={e=>set('amount',e.target.value)} />
          </Field>
          <Field label="Date *">
            <input type="date" value={form.date} onChange={e=>set('date',e.target.value)} />
          </Field>
        </div>

        <Field label="Category">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
            {CATEGORIES.map(c => (
              <button
                key={c.id}
                onClick={() => set('category', c.id)}
                style={{
                  padding:'8px 4px', borderRadius:8,
                  border:`1px solid ${form.category===c.id ? c.color : 'var(--border)'}`,
                  background: form.category===c.id ? c.color+'20' : 'var(--bg3)',
                  color: form.category===c.id ? c.color : 'var(--text2)',
                  fontSize:11, fontWeight: form.category===c.id ? 600 : 400,
                  display:'flex', flexDirection:'column', alignItems:'center', gap:3, transition:'all .15s',
                }}
              >
                <span style={{ fontSize:18 }}>{c.icon}</span>
                <span style={{ lineHeight:1.2, textAlign:'center' }}>{c.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </Field>

        <Field label="Payment Method">
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {PAYMENT_METHODS.map(m => (
              <button
                key={m}
                onClick={() => set('method', m)}
                style={{
                  padding:'7px 14px', borderRadius:20, fontSize:12, transition:'all .15s',
                  border:`1px solid ${form.method===m ? 'var(--gold)' : 'var(--border)'}`,
                  background: form.method===m ? 'var(--gold-dim)' : 'var(--bg3)',
                  color: form.method===m ? 'var(--gold)' : 'var(--text2)',
                  fontWeight: form.method===m ? 600 : 400,
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </Field>

        <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', userSelect:'none' }}>
          <input
            type="checkbox"
            checked={form.is_recurring}
            onChange={e => set('is_recurring', e.target.checked)}
            style={{ width:'auto', accentColor:'var(--gold)' }}
          />
          <span style={{ fontSize:13, color:'var(--text2)' }}>Recurring expense</span>
          {form.is_recurring && (
            <select value={form.recur_freq} onChange={e=>set('recur_freq',e.target.value)} style={{ width:'auto', marginLeft:4 }}>
              {RECUR_FREQUENCIES.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
            </select>
          )}
        </label>

        <Field label="Notes (optional)">
          <textarea placeholder="Any additional details…" value={form.notes} onChange={e=>set('notes',e.target.value)} />
        </Field>

        <Alert type="error" message={error} />

        <div style={{ display:'flex', gap:10, paddingTop:4 }}>
          <Btn variant="ghost"   onClick={onCancel}                    style={{ flex:1 }}>Cancel</Btn>
          <Btn variant="primary" onClick={submit}   loading={loading}  style={{ flex:2 }}>
            {initial ? 'Save Changes' : 'Add Expense'}
          </Btn>
        </div>
      </div>
    </div>
  );
}
