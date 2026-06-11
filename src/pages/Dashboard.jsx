// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { Users, Wallet, TrendingDown, TrendingUp, Activity, RefreshCw } from 'lucide-react';
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
        <StatCard icon={Wallet} label="إجمالي الأرصدة" value={`${(stats?.totalBalance || 0).toFixed(2)} د.أ`} color="bg-wa-green" />
        <StatCard icon={TrendingUp} label="إجمالي الشحن" value={`${(stats?.total_credited || 0).toFixed(2)} د.أ`} color="bg-purple-500" />
        <StatCard icon={TrendingDown} label="إجمالي الخصم" value={`${(stats?.total_debited || 0).toFixed(2)} د.أ`} color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top members chart */}
        <div className="card">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-500" />
            أكثر الأعضاء استخداماً
          </h2>
          {topMembers.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topMembers} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
                <Tooltip formatter={(v) => [`${v.toFixed(2)} د.أ`, 'المبلغ المخصوم']} />
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
                <span className={`text-sm font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                  {tx.type === 'credit' ? '+' : '-'}{tx.amount.toFixed(2)} د.أ
                </span>
              </div>
            )) : (
              <p className="text-center text-gray-400 py-8 text-sm">لا توجد عمليات بعد</p>
            )}
          </div>
        </div>
      </div>

      {/* Low balance warning */}
      {members.filter(m => m.balance < 5 && m.balance >= 0).length > 0 && (
        <div className="card border-orange-200 bg-orange-50">
          <h3 className="font-bold text-orange-700 mb-3">⚠️ أعضاء برصيد منخفض (أقل من 5 د.أ)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {members.filter(m => m.balance < 5 && m.balance >= 0).map(m => (
              <div key={m.id} className="bg-white rounded-xl px-3 py-2 text-center">
                <p className="text-sm font-semibold text-gray-700 truncate">{m.name || m.phone}</p>
                <p className={`text-sm font-bold ${balanceColor(m.balance)}`}>{m.balance.toFixed(2)} د.أ</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
