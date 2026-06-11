// src/pages/Members.jsx
import { useEffect, useState } from 'react';
import { Plus, Search, RefreshCw, ChevronLeft, Wallet, TrendingUp, TrendingDown, Ban, Ban as Unban } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import MemberDetail from '../components/MemberDetail';
import AddMemberModal from '../components/AddMemberModal';

export default function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/members');
      setMembers(res.data);
    } catch {
      toast.error('فشل تحميل الأعضاء');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = members.filter(m =>
    (m.name || '').includes(search) || (m.phone || '').includes(search)
  );

  const balanceColor = (b) => b > 0 ? 'text-green-600' : b < 0 ? 'text-red-500' : 'text-gray-400';

  const toggleBlock = async (m) => {
    try {
      await api.patch(`/members/${m.id}`, { is_blocked: m.is_blocked ? 0 : 1 });
      toast.success(m.is_blocked ? 'تم رفع الحظر' : 'تم حظر العضو');
      load();
    } catch {
      toast.error('فشلت العملية');
    }
  };

  if (selected) return (
    <MemberDetail
      memberId={selected}
      onBack={() => { setSelected(null); load(); }}
    />
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">الأعضاء ({members.length})</h1>
        <div className="flex gap-2">
          <button onClick={load} className="btn-secondary text-sm">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => setShowAdd(true)} className="btn-primary text-sm">
            <Plus className="w-4 h-4" />إضافة
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="بحث بالاسم أو الرقم..."
          className="input pr-10"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-500 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">👥</p>
          <p>لا يوجد أعضاء{search ? ' بهذا البحث' : ''}</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">العضو</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">الرصيد</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">شحن/خصم</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">الحالة</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m.id} className="table-row">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                          {(m.name || m.phone)?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{m.name || '—'}</p>
                          <p className="text-xs text-gray-400 font-mono">{m.phone}</p>
                        </div>
                        {m.is_admin ? <span className="badge-admin">مدير</span> : null}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-bold text-base ${balanceColor(m.balance)}`}>
                        {m.balance?.toFixed(2)} <span className="text-xs">د.أ</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1 text-green-600">
                          <TrendingUp className="w-3 h-3" />
                          {(m.total_credited || 0).toFixed(2)}
                        </span>
                        <span className="flex items-center gap-1 text-red-500">
                          <TrendingDown className="w-3 h-3" />
                          {(m.total_debited || 0).toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {m.is_blocked
                        ? <span className="badge-blocked">محظور</span>
                        : <span className="badge-active">نشط</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => toggleBlock(m)}
                          title={m.is_blocked ? 'رفع الحظر' : 'حظر'}
                          className={`p-1.5 rounded-lg transition-colors ${m.is_blocked ? 'text-green-500 hover:bg-green-50' : 'text-gray-400 hover:bg-red-50 hover:text-red-500'}`}
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelected(m.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAdd && <AddMemberModal onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); load(); }} />}
    </div>
  );
}
