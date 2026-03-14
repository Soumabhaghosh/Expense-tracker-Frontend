import React, { useState } from 'react';
import { Routes, Route, Navigate, NavLink, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, LineElement, PointElement, Filler,
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import toast from 'react-hot-toast';

import { AuthProvider, useAuth } from './context/AuthContext';
import { expenseApi, budgetApi } from './services/api';
import { fmt, thisMonth, monthLabel, CATEGORIES, CAT_MAP } from './utils/constants';
import { Spinner, Btn, Card, StatCard, Modal, ExpenseRow, Empty, Alert } from './components/UI';
import ExpenseForm from './components/ExpenseForm';
import Navbar from './components/Navbar';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Filler);

// ─────────────────────────────────────────────────────────────────────────────
// Route Guards
// ─────────────────────────────────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'80vh' }}>
      <Spinner size={32} />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/" replace /> : children;
}

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main style={{ maxWidth:900, margin:'0 auto', padding:'24px 20px 80px' }}>
        {children}
      </main>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Login
// ─────────────────────────────────────────────────────────────────────────────
function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await login(form.email, form.password); toast.success('Welcome back!'); navigate('/'); }
    catch (err) { setError(err.response?.data?.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ width:'100%', maxWidth:400 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:44, marginBottom:12 }}>💰</div>
          <h1 style={{ fontFamily:'DM Serif Display', fontSize:28, marginBottom:6 }}>Welcome back</h1>
          <p style={{ color:'var(--text3)', fontSize:14 }}>Sign in to your expense tracker</p>
        </div>
        <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:28 }}>
          <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div>
              <label style={{ fontSize:12, color:'var(--text3)', display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:.8 }}>Email</label>
              <input type="email" placeholder="you@example.com" value={form.email} onChange={e=>set('email',e.target.value)} required autoFocus />
            </div>
            <div>
              <label style={{ fontSize:12, color:'var(--text3)', display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:.8 }}>Password</label>
              <input type="password" placeholder="••••••••" value={form.password} onChange={e=>set('password',e.target.value)} required />
            </div>
            <Alert type="error" message={error} />
            <Btn type="submit" variant="primary" loading={loading} style={{ width:'100%', padding:12, marginTop:4 }}>Sign In</Btn>
          </form>
        </div>
        <p style={{ textAlign:'center', marginTop:20, fontSize:14, color:'var(--text3)' }}>
          No account? <Link to="/register" style={{ color:'var(--gold)', fontWeight:500 }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Register
// ─────────────────────────────────────────────────────────────────────────────
function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault(); setError('');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try { await register(form.name, form.email, form.password); toast.success('Account created!'); navigate('/'); }
    catch (err) { setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ width:'100%', maxWidth:400 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:44, marginBottom:12 }}>💰</div>
          <h1 style={{ fontFamily:'DM Serif Display', fontSize:28, marginBottom:6 }}>Create account</h1>
          <p style={{ color:'var(--text3)', fontSize:14 }}>Start tracking your expenses</p>
        </div>
        <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:28 }}>
          <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div>
              <label style={{ fontSize:12, color:'var(--text3)', display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:.8 }}>Full Name</label>
              <input placeholder="Your name" value={form.name} onChange={e=>set('name',e.target.value)} required autoFocus />
            </div>
            <div>
              <label style={{ fontSize:12, color:'var(--text3)', display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:.8 }}>Email</label>
              <input type="email" placeholder="you@example.com" value={form.email} onChange={e=>set('email',e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize:12, color:'var(--text3)', display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:.8 }}>Password</label>
              <input type="password" placeholder="Min 6 characters" value={form.password} onChange={e=>set('password',e.target.value)} required />
            </div>
            <Alert type="error" message={error} />
            <Btn type="submit" variant="primary" loading={loading} style={{ width:'100%', padding:12, marginTop:4 }}>Create Account</Btn>
          </form>
        </div>
        <p style={{ textAlign:'center', marginTop:20, fontSize:14, color:'var(--text3)' }}>
          Have an account? <Link to="/login" style={{ color:'var(--gold)', fontWeight:500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────────────────────────────────────
function Dashboard() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const month = thisMonth();
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const { data: sumData, isLoading: sumLoading } = useQuery({
    queryKey: ['summary', month],
    queryFn: () => expenseApi.getSummary({ month }),
  });
  const { data: recentData, isLoading: recentLoading } = useQuery({
    queryKey: ['expenses', { limit:6 }],
    queryFn: () => expenseApi.getAll({ limit:6, sort:'date', order:'desc' }),
  });

  const inv = () => { qc.invalidateQueries({queryKey:['expenses']}); qc.invalidateQueries({queryKey:['summary']}); };
  const createMut = useMutation({ mutationFn:expenseApi.create,             onSuccess:()=>{ inv(); toast.success('Expense added!'); setShowAdd(false); },    onError:()=>toast.error('Failed to add') });
  const updateMut = useMutation({ mutationFn:({id,...d})=>expenseApi.update(id,d), onSuccess:()=>{ inv(); toast.success('Updated!');       setEditItem(null); }, onError:()=>toast.error('Failed to update') });
  const deleteMut = useMutation({ mutationFn:expenseApi.remove,             onSuccess:()=>{ inv(); toast.success('Deleted'); },                               onError:()=>toast.error('Failed to delete') });

  const summary   = sumData?.data?.data;
  const recent    = recentData?.data?.data || [];
  const catTotals = (summary?.byCategory||[]).map(c => ({ ...CAT_MAP[c.category], ...c }));

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontFamily:'DM Serif Display', fontSize:26, marginBottom:4 }}>{greeting()}, {user?.name?.split(' ')[0]} 👋</h1>
          <p style={{ color:'var(--text3)', fontSize:14 }}>Your spending overview for this month</p>
        </div>
        <Btn variant="primary" onClick={()=>setShowAdd(true)}>+ Add Expense</Btn>
      </div>

      {/* Stat cards */}
      <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:20 }}>
        <StatCard label="This Month"      value={sumLoading?'…':fmt(summary?.totalSpend||0)}             sub={`${summary?.totalCount||0} transactions`} color="var(--gold)" icon="💸" />
        <StatCard label="Avg Transaction" value={sumLoading?'…':fmt(Math.round(summary?.avgPerTransaction||0))} icon="📊" />
        <StatCard label="Avg Per Day"     value={sumLoading?'…':fmt(Math.round(summary?.avgPerDay||0))}        icon="📅" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:16, marginBottom:20 }}>
        {/* Category breakdown */}
        <Card style={{ padding:20 }}>
          <div style={{ fontSize:12, color:'var(--text3)', marginBottom:16, textTransform:'uppercase', letterSpacing:1 }}>This Month by Category</div>
          {sumLoading
            ? <div style={{ display:'flex', justifyContent:'center', padding:30 }}><Spinner /></div>
            : catTotals.length === 0
              ? <Empty icon="📊" message="No expenses this month" />
              : catTotals.map(c => {
                  const pct = summary.totalSpend > 0 ? Math.round((c.total/summary.totalSpend)*100) : 0;
                  return (
                    <div key={c.category} style={{ marginBottom:12 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5, fontSize:13 }}>
                        <span>{c.icon} {c.label}</span>
                        <span style={{ fontWeight:600 }}>{fmt(c.total)} <span style={{ color:'var(--text3)', fontWeight:400 }}>{pct}%</span></span>
                      </div>
                      <div style={{ height:5, background:'var(--bg4)', borderRadius:10, overflow:'hidden' }}>
                        <div style={{ height:'100%', width:pct+'%', background:c.color, borderRadius:10, transition:'width .5s' }} />
                      </div>
                    </div>
                  );
                })
          }
        </Card>

        {/* Top expenses */}
        <Card style={{ padding:20 }}>
          <div style={{ fontSize:12, color:'var(--text3)', marginBottom:16, textTransform:'uppercase', letterSpacing:1 }}>Top Expenses</div>
          {!(summary?.topExpenses?.length)
            ? <Empty icon="🏆" message="No data yet" />
            : summary.topExpenses.map((e, i) => (
              <div key={e.id} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                <span style={{ fontSize:11, color:'var(--text3)', width:16, flexShrink:0 }}>#{i+1}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{e.title}</div>
                  <div style={{ fontSize:11, color:'var(--text3)' }}>{CAT_MAP[e.category]?.icon} {CAT_MAP[e.category]?.label}</div>
                </div>
                <span style={{ fontWeight:600, fontSize:14, color:'var(--gold)', flexShrink:0 }}>{fmt(e.amount)}</span>
              </div>
            ))
          }
        </Card>
      </div>

      {/* Recent transactions */}
      <Card>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px', borderBottom:'1px solid var(--border)' }}>
          <span style={{ fontSize:12, color:'var(--text3)', textTransform:'uppercase', letterSpacing:1 }}>Recent Transactions</span>
          <NavLink to="/expenses" style={{ fontSize:13, color:'var(--gold)' }}>View all →</NavLink>
        </div>
        {recentLoading
          ? <div style={{ display:'flex', justifyContent:'center', padding:40 }}><Spinner /></div>
          : recent.length === 0
            ? <Empty icon="💸" message="No expenses yet. Add your first one!" />
            : recent.map((e,i) => <ExpenseRow key={e.id} expense={e} showBorder={i<recent.length-1} onEdit={setEditItem} onDelete={id=>deleteMut.mutate(id)} />)
        }
      </Card>

      <Modal open={showAdd} onClose={()=>setShowAdd(false)}>
        <ExpenseForm onSave={d=>createMut.mutate(d)} onCancel={()=>setShowAdd(false)} loading={createMut.isPending} />
      </Modal>
      <Modal open={!!editItem} onClose={()=>setEditItem(null)}>
        {editItem && <ExpenseForm initial={editItem} onSave={d=>updateMut.mutate({...d,id:editItem.id})} onCancel={()=>setEditItem(null)} loading={updateMut.isPending} />}
      </Modal>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Expenses
// ─────────────────────────────────────────────────────────────────────────────
function Expenses() {
  const qc = useQueryClient();
  const [filters, setFilters] = useState({ category:'all', month:'', search:'', sort:'date', order:'desc' });
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const setF = (k, v) => setFilters(f => ({ ...f, [k]: v }));

  const params = {
    sort:filters.sort, order:filters.order, limit:200,
    ...(filters.category !== 'all' && { category:filters.category }),
    ...(filters.month                && { month:filters.month }),
    ...(filters.search               && { search:filters.search }),
  };

  const { data, isLoading } = useQuery({ queryKey:['expenses',params], queryFn:()=>expenseApi.getAll(params) });

  const inv = () => { qc.invalidateQueries({queryKey:['expenses']}); qc.invalidateQueries({queryKey:['summary']}); };
  const createMut = useMutation({ mutationFn:expenseApi.create,             onSuccess:()=>{ inv(); toast.success('Added!');   setShowAdd(false); } });
  const updateMut = useMutation({ mutationFn:({id,...d})=>expenseApi.update(id,d), onSuccess:()=>{ inv(); toast.success('Updated!'); setEditItem(null); } });
  const deleteMut = useMutation({ mutationFn:expenseApi.remove,             onSuccess:()=>{ inv(); toast.success('Deleted'); } });

  const expenses = data?.data?.data || [];
  const meta     = data?.data?.meta || {};

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontFamily:'DM Serif Display', fontSize:26, marginBottom:4 }}>Expenses</h1>
          <p style={{ color:'var(--text3)', fontSize:14 }}>{meta.total||0} expenses · {fmt(meta.sum||0)} total</p>
        </div>
        <Btn variant="primary" onClick={()=>setShowAdd(true)}>+ Add Expense</Btn>
      </div>

      <Card style={{ padding:16, marginBottom:16 }}>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          <input placeholder="Search…" value={filters.search} onChange={e=>setF('search',e.target.value)} style={{ flex:'1 1 180px', minWidth:0 }} />
          <select value={filters.category} onChange={e=>setF('category',e.target.value)} style={{ width:'auto', minWidth:140 }}>
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
          </select>
          <input type="month" value={filters.month} onChange={e=>setF('month',e.target.value)} style={{ width:'auto', minWidth:150 }} />
          <select value={filters.sort} onChange={e=>setF('sort',e.target.value)} style={{ width:'auto', minWidth:100 }}>
            <option value="date">Date</option>
            <option value="amount">Amount</option>
            <option value="title">Title</option>
          </select>
          <button
            onClick={()=>setF('order', filters.order==='desc'?'asc':'desc')}
            style={{ padding:'10px 14px', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text2)', fontSize:16 }}
          >
            {filters.order==='desc' ? '↓' : '↑'}
          </button>
          {(filters.category!=='all' || filters.month || filters.search) &&
            <Btn variant="ghost" size="sm" onClick={()=>setFilters(f=>({...f,category:'all',month:'',search:''}))}>Clear</Btn>
          }
        </div>
      </Card>

      <Card>
        {isLoading
          ? <div style={{ display:'flex', justifyContent:'center', padding:50 }}><Spinner /></div>
          : expenses.length === 0
            ? <Empty icon="🔍" message="No expenses match your filters" />
            : expenses.map((e,i) => <ExpenseRow key={e.id} expense={e} showBorder={i<expenses.length-1} onEdit={setEditItem} onDelete={id=>deleteMut.mutate(id)} />)
        }
      </Card>

      <Modal open={showAdd} onClose={()=>setShowAdd(false)}>
        <ExpenseForm onSave={d=>createMut.mutate(d)} onCancel={()=>setShowAdd(false)} loading={createMut.isPending} />
      </Modal>
      <Modal open={!!editItem} onClose={()=>setEditItem(null)}>
        {editItem && <ExpenseForm initial={editItem} onSave={d=>updateMut.mutate({...d,id:editItem.id})} onCancel={()=>setEditItem(null)} loading={updateMut.isPending} />}
      </Modal>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Analytics
// ─────────────────────────────────────────────────────────────────────────────
const CHART_OPTS = {
  responsive: true,
  plugins: { legend: { labels: { color:'#a09e9a', font:{ family:'DM Sans', size:12 } } } },
};

function Analytics() {
  const [month, setMonth] = useState(thisMonth());

  const { data }     = useQuery({ queryKey:['summary-analytics',month], queryFn:()=>expenseApi.getSummary({month}) });
  const { data: yd } = useQuery({ queryKey:['summary-year'],            queryFn:()=>expenseApi.getSummary({}) });

  const s  = data?.data?.data;
  const ys = yd?.data?.data;

  const doughnutData = s?.byCategory?.length ? {
    labels: s.byCategory.map(c => `${CAT_MAP[c.category]?.icon} ${CAT_MAP[c.category]?.label||c.category}`),
    datasets: [{
      data: s.byCategory.map(c => c.total),
      backgroundColor: s.byCategory.map(c => (CAT_MAP[c.category]?.color||'#888')+'cc'),
      borderColor:     s.byCategory.map(c =>  CAT_MAP[c.category]?.color||'#888'),
      borderWidth: 1,
    }],
  } : null;

  const monthlyData = ys?.byMonth?.length ? {
    labels: [...ys.byMonth].reverse().map(m => monthLabel(m.month).replace(/\s\d{4}/,'')),
    datasets: [{
      label: 'Monthly Spend',
      data: [...ys.byMonth].reverse().map(m => m.total),
      borderColor: '#c9a84c', backgroundColor: 'rgba(201,168,76,0.1)',
      fill: true, tension: 0.4, pointBackgroundColor: '#c9a84c',
    }],
  } : null;

  const methodData = s?.byMethod?.length ? {
    labels: s.byMethod.map(m => m.method),
    datasets: [{
      label: 'Amount',
      data: s.byMethod.map(m => m.total),
      backgroundColor: ['#c9a84c99','#5c90e099','#9b7fe899','#5cb87e99','#e05c5c99'],
      borderRadius: 6,
    }],
  } : null;

  const scaleOpts = {
    x: { ticks:{ color:'#6b6968' } },
    y: { ticks:{ color:'#6b6968', callback: v=>'₹'+v.toLocaleString('en-IN') }, grid:{ color:'#2a2a3a' } },
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontFamily:'DM Serif Display', fontSize:26, marginBottom:4 }}>Analytics</h1>
          <p style={{ color:'var(--text3)', fontSize:14 }}>Understand your spending patterns</p>
        </div>
        <input type="month" value={month} onChange={e=>setMonth(e.target.value)} style={{ width:'auto' }} />
      </div>

      {!s
        ? <div style={{ display:'flex', justifyContent:'center', padding:80 }}><Spinner size={32} /></div>
        : (
          <>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:20 }}>
              <StatCard label="Total Spend"     value={fmt(s.totalSpend)}                       sub={`${s.totalCount} transactions`} color="var(--gold)" icon="💸" />
              <StatCard label="Avg Transaction" value={fmt(Math.round(s.avgPerTransaction))}    icon="📊" />
              <StatCard label="Avg Per Day"     value={fmt(Math.round(s.avgPerDay))}            icon="📅" />
              <StatCard label="Top Category"    value={s.byCategory[0] ? `${CAT_MAP[s.byCategory[0].category]?.icon} ${CAT_MAP[s.byCategory[0].category]?.label}` : '—'} sub={s.byCategory[0]?fmt(s.byCategory[0].total):''} icon="🏆" />
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:16, marginBottom:16 }}>
              {doughnutData && (
                <Card style={{ padding:20 }}>
                  <div style={{ fontSize:12, color:'var(--text3)', marginBottom:16, textTransform:'uppercase', letterSpacing:1 }}>By Category</div>
                  <Doughnut data={doughnutData} options={{ ...CHART_OPTS, cutout:'65%' }} />
                </Card>
              )}
              {methodData && (
                <Card style={{ padding:20 }}>
                  <div style={{ fontSize:12, color:'var(--text3)', marginBottom:16, textTransform:'uppercase', letterSpacing:1 }}>Payment Methods</div>
                  <Bar data={methodData} options={{ ...CHART_OPTS, scales:scaleOpts }} />
                </Card>
              )}
            </div>

            {monthlyData && (
              <Card style={{ padding:20, marginBottom:16 }}>
                <div style={{ fontSize:12, color:'var(--text3)', marginBottom:16, textTransform:'uppercase', letterSpacing:1 }}>Monthly Trend (Last 12 months)</div>
                <Line data={monthlyData} options={{ ...CHART_OPTS, scales:scaleOpts }} />
              </Card>
            )}

            <Card style={{ padding:20 }}>
              <div style={{ fontSize:12, color:'var(--text3)', marginBottom:16, textTransform:'uppercase', letterSpacing:1 }}>Category Breakdown</div>
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                  <thead>
                    <tr style={{ borderBottom:'1px solid var(--border)' }}>
                      {['Category','Transactions','Total','Share'].map(h => (
                        <th key={h} style={{ textAlign:h==='Category'?'left':'right', padding:'8px 12px', color:'var(--text3)', fontWeight:500 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {s.byCategory.map(c => {
                      const cat = CAT_MAP[c.category];
                      const pct = s.totalSpend > 0 ? ((c.total/s.totalSpend)*100).toFixed(1) : 0;
                      return (
                        <tr key={c.category} style={{ borderBottom:'1px solid var(--border)' }}>
                          <td style={{ padding:'10px 12px' }}><span style={{ color:cat?.color }}>{cat?.icon}</span> {cat?.label||c.category}</td>
                          <td style={{ padding:'10px 12px', textAlign:'right', color:'var(--text2)' }}>{c.count}</td>
                          <td style={{ padding:'10px 12px', textAlign:'right', fontWeight:600 }}>{fmt(c.total)}</td>
                          <td style={{ padding:'10px 12px', textAlign:'right', color:'var(--text2)' }}>{pct}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )
      }
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Budgets
// ─────────────────────────────────────────────────────────────────────────────
function BudgetCard({ cat, budget, spent, onEdit, onDelete }) {
  const pct      = budget > 0 ? Math.min(Math.round((spent/budget)*100), 100) : 0;
  const over     = spent > budget;
  const barColor = pct >= 90 ? 'var(--red)' : pct >= 70 ? '#e07c3a' : 'var(--green)';
  return (
    <div style={{ background:'var(--bg2)', border:`1px solid ${over?'rgba(224,92,92,.3)':'var(--border)'}`, borderRadius:'var(--radius)', padding:18 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:22 }}>{cat.icon}</span>
          <span style={{ fontWeight:500 }}>{cat.label}</span>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          <button onClick={onEdit}   style={{ fontSize:11, color:'var(--text3)', padding:'3px 8px', border:'1px solid var(--border)', borderRadius:6, background:'var(--bg3)' }}>Edit</button>
          <button onClick={onDelete} style={{ fontSize:11, color:'var(--red)',   padding:'3px 8px', border:'1px solid rgba(224,92,92,.25)', borderRadius:6, background:'var(--red-dim)' }}>Remove</button>
        </div>
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:8 }}>
        <span style={{ color:'var(--text2)' }}>Spent: <strong style={{ color:over?'var(--red)':'var(--text)' }}>{fmt(spent)}</strong></span>
        <span style={{ color:'var(--text2)' }}>Budget: <strong>{fmt(budget)}</strong></span>
      </div>
      <div style={{ height:7, background:'var(--bg4)', borderRadius:10, overflow:'hidden', marginBottom:8 }}>
        <div style={{ height:'100%', width:pct+'%', background:barColor, borderRadius:10, transition:'width .5s' }} />
      </div>
      <div style={{ fontSize:12, color:over?'var(--red)':'var(--text3)' }}>
        {over ? `⚠ Over by ${fmt(spent-budget)}` : `${fmt(budget-spent)} remaining (${100-pct}%)`}
      </div>
    </div>
  );
}

function BudgetForm({ initial, month, onSave, onCancel, loading }) {
  const [form, setForm] = useState(initial || { category:'food', amount:'', month });
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const submit = () => {
    if (!form.amount || +form.amount <= 0) return setError('Enter a valid amount');
    setError(''); onSave(form);
  };
  return (
    <div>
      <div style={{ padding:'20px 24px 16px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between' }}>
        <span style={{ fontFamily:'DM Serif Display', fontSize:20 }}>{initial?'Edit Budget':'Set Budget'}</span>
        <button onClick={onCancel} style={{ color:'var(--text3)', fontSize:22 }}>×</button>
      </div>
      <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:14 }}>
        <div>
          <label style={{ fontSize:12, color:'var(--text3)', display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:.8 }}>Category</label>
          <select value={form.category} onChange={e=>set('category',e.target.value)} disabled={!!initial}>
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize:12, color:'var(--text3)', display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:.8 }}>Monthly Budget (₹)</label>
          <input type="number" min="0" placeholder="e.g. 5000" value={form.amount} onChange={e=>set('amount',e.target.value)} autoFocus />
        </div>
        <Alert type="error" message={error} />
        <div style={{ display:'flex', gap:10 }}>
          <Btn variant="ghost"   onClick={onCancel}               style={{ flex:1 }}>Cancel</Btn>
          <Btn variant="primary" onClick={submit}  loading={loading} style={{ flex:2 }}>Save Budget</Btn>
        </div>
      </div>
    </div>
  );
}

function Budgets() {
  const qc = useQueryClient();
  const [month, setMonth]   = useState(thisMonth());
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const { data: budgetData, isLoading } = useQuery({
    queryKey: ['budgets', month],
    queryFn:  () => budgetApi.getAll(month),
  });

  const inv = () => qc.invalidateQueries({ queryKey:['budgets'] });
  const setMut = useMutation({ mutationFn:budgetApi.set,    onSuccess:()=>{ inv(); toast.success('Budget saved!'); setShowForm(false); setEditItem(null); }, onError:()=>toast.error('Failed') });
  const delMut = useMutation({ mutationFn:budgetApi.remove, onSuccess:()=>{ inv(); toast.success('Removed');      },                                         onError:()=>toast.error('Failed') });

  const budgets      = budgetData?.data?.data || [];
  const totalBudget  = budgets.reduce((s,b) => s+b.amount, 0);
  const totalSpent   = budgets.reduce((s,b) => s+(b.spent||0), 0);
  const existingCats = new Set(budgets.map(b => b.category));
  const availableCats = CATEGORIES.filter(c => !existingCats.has(c.id));

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontFamily:'DM Serif Display', fontSize:26, marginBottom:4 }}>Budgets</h1>
          <p style={{ color:'var(--text3)', fontSize:14 }}>Set monthly spending limits per category</p>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <input type="month" value={month} onChange={e=>setMonth(e.target.value)} style={{ width:'auto' }} />
          {availableCats.length > 0 && <Btn variant="primary" onClick={()=>setShowForm(true)}>+ Set Budget</Btn>}
        </div>
      </div>

      {budgets.length > 0 && (
        <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:20 }}>
          <StatCard label="Total Budget" value={fmt(totalBudget)} icon="⊡" />
          <StatCard label="Total Spent"  value={fmt(totalSpent)}  color={totalSpent>totalBudget?'var(--red)':'var(--text)'} icon="💸" />
          <StatCard label="Remaining"    value={fmt(totalBudget-totalSpent)} color={totalBudget-totalSpent<0?'var(--red)':'var(--green)'} icon="💰" />
        </div>
      )}

      {isLoading
        ? <div style={{ display:'flex', justifyContent:'center', padding:80 }}><Spinner size={32} /></div>
        : budgets.length === 0
          ? <Card style={{ padding:20 }}><Empty icon="⊡" message="No budgets set. Click '+ Set Budget' to get started." /></Card>
          : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:14 }}>
              {budgets.map(b => {
                const cat = CATEGORIES.find(c=>c.id===b.category) || { icon:'📦', label:b.category, color:'#888' };
                return <BudgetCard key={b.id} cat={cat} budget={b.amount} spent={b.spent||0} onEdit={()=>setEditItem(b)} onDelete={()=>delMut.mutate(b.id)} />;
              })}
            </div>
          )
      }

      <Modal open={showForm} onClose={()=>setShowForm(false)}>
        <BudgetForm month={month} onSave={d=>setMut.mutate(d)} onCancel={()=>setShowForm(false)} loading={setMut.isPending} />
      </Modal>
      <Modal open={!!editItem} onClose={()=>setEditItem(null)}>
        {editItem && <BudgetForm initial={editItem} month={month} onSave={d=>setMut.mutate(d)} onCancel={()=>setEditItem(null)} loading={setMut.isPending} />}
      </Modal>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root App
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login"     element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register"  element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/"          element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/expenses"  element={<ProtectedRoute><Layout><Expenses /></Layout></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Layout><Analytics /></Layout></ProtectedRoute>} />
        <Route path="/budgets"   element={<ProtectedRoute><Layout><Budgets /></Layout></ProtectedRoute>} />
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
