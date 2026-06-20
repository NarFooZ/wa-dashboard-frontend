// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { Users, Wallet, TrendingDown, TrendingUp, Activity, RefreshCw, ShieldAlert, Ban } from 'lucide-react';
import api from '../lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-800 leading-tight">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [statsRes, membersRes] = await Promise.all([
        api.get('/billing/stats'),
        api.get('/members'),
      ]);
      setStats(statsRes.data);
      setMembers(membersRes.data);
    } catch (err) {
      toast.error('فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const topMembers = [...members]
    .sort((a, b) => (b.total_debited || 0) - (a.total_debited || 0))
    .slice(0, 6)
    .map(m => ({ name: m.name || m.phone, amount: m.total_debited || 0 }));

  const inDebt = members.filter(m => m.balance < 0).sort((a, b) => a.balance - b.balance);
  const depositGap = members.filter(m => m.security_deposit_required > 0 && m.security_deposit_paid < m.security_deposit_required);
  const suspended = members.filter(m => m.is_blocked);
  const totalDebt = inDebt.reduce((sum, m) => sum + Math.abs(m.balance), 0);

  const balanceColor = (b) => b > 0 ? 'balance-positive' : b < 0 ? 'balance-negative' : 'balance-zero';

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-500 border-t-transparent" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">لوحة التحكم</h1>
          <p className="text-sm text-gray-400">نظرة عامة على المجموعة والمحاسبة</p>
        </div>
        <button onClick={load} className="btn-secondary text-sm">
          <RefreshCw className="w-4 h-4" />
          تحديث
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="إجمالي الأعضاء" value={members.length} color="bg-blue-500" />
        <StatCard icon={TrendingDown} label="إجمالي الذمم المستحقة" value={`${totalDebt.toFixed(2)} د.أ`} color="bg-red-500" sub={`${inDebt.length} عضو عليهم ذمة`} />
        <StatCard icon={TrendingUp} label="إجمالي العمولات" value={`${(stats?.total_debited || 0).toFixed(2)} د.أ`} color="bg-orange-500" />
        <StatCard icon={Ban} label="حسابات موقوفة" value={suspended.length} color="bg-gray-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top members chart */}
        <div className="card">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-500" />
            أكثر الكباتن طلبات
          </h2>
          {topMembers.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topMembers} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
                <Tooltip formatter={(v) => [`${v.toFixed(2)} د.أ`, 'إجمالي العمولات']} />
                <Bar dataKey="amount" fill="#25D366" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-400 py-10 text-sm">لا توجد بيانات بعد</p>
          )}
        </div>

        {/* Recent transactions */}
        <div className="card">
          <h2 className="font-bold text-gray-800 mb-4">آخر العمليات</h2>
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {stats?.recentTransactions?.length > 0 ? stats.recentTransactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-gray-700">{tx.member_name || tx.phone}</p>
                  <p className="text-xs text-gray-400">{tx.description}</p>
                  <p className="text-xs text-gray-300">{new Date(tx.created_at).toLocaleString('ar')}</p>
                </div>
                <span className={`text-sm font-bold ${tx.type === 'credit' || tx.type === 'deposit' ? 'text-green-600' : 'text-red-500'}`}>
                  {tx.type === 'credit' || tx.type === 'deposit' ? '+' : '-'}{tx.amount.toFixed(2)} د.أ
                </span>
              </div>
            )) : (
              <p className="text-center text-gray-400 py-8 text-sm">لا توجد عمليات بعد</p>
            )}
          </div>
        </div>
      </div>

      {/* Outstanding debts (ذمم قيد الانتظار) */}
      {inDebt.length > 0 && (
        <div className="card border-red-200 bg-red-50">
          <h3 className="font-bold text-red-700 mb-3 flex items-center gap-2">
            <TrendingDown className="w-5 h-5" />الكباتن الذين عليهم ذمة مالية ({inDebt.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {inDebt.slice(0, 8).map(m => (
              <div key={m.id} className="bg-white rounded-xl px-3 py-2 text-center">
                <p className="text-sm font-semibold text-gray-700 truncate">{m.name || m.phone}</p>
                <p className={`text-sm font-bold ${balanceColor(m.balance)}`}>{m.balance.toFixed(2)} د.أ</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security deposit gaps */}
      {depositGap.length > 0 && (
        <div className="card border-orange-200 bg-orange-50">
          <h3 className="font-bold text-orange-700 mb-3 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" />رصيد الأمان غير مكتمل ({depositGap.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {depositGap.map(m => (
              <div key={m.id} className="bg-white rounded-xl px-3 py-2 text-center">
                <p className="text-sm font-semibold text-gray-700 truncate">{m.name || m.phone}</p>
                <p className="text-xs text-orange-600 font-bold">
                  {m.security_deposit_paid?.toFixed(0)}/{m.security_deposit_required?.toFixed(0)} د.أ
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
