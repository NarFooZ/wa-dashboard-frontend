// src/components/MemberDetail.jsx
import { useEffect, useState } from 'react';
import { ArrowRight, TrendingUp, TrendingDown, History, Edit2, Check, X, ShieldCheck, CheckCircle2, Archive } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function MemberDetail({ memberId, onBack }) {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creditForm, setCreditForm] = useState({ amount: '', description: '' });
  const [debitForm, setDebitForm] = useState({ amount: '', description: '' });
  const [depositAmount, setDepositAmount] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [editName, setEditName] = useState(false);
  const [newName, setNewName] = useState('');

  const load = async () => {
    try {
      const res = await api.get(`/members/${memberId}`);
      setMember(res.data);
      setNewName(res.data.name || '');
    } catch {
      toast.error('فشل تحميل بيانات العضو');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [memberId]);

  const handleCredit = async () => {
    if (!creditForm.amount) return;
    setActionLoading('credit');
    try {
      await api.post(`/members/${memberId}/credit`, creditForm);
      toast.success(`تم شحن ${creditForm.amount} د.أ`);
      setCreditForm({ amount: '', description: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'فشل الشحن');
    } finally {
      setActionLoading('');
    }
  };

  const handleDebit = async () => {
    if (!debitForm.amount) return;
    setActionLoading('debit');
    try {
      await api.post(`/members/${memberId}/debit`, debitForm);
      toast.success(`تم خصم ${debitForm.amount} د.أ`);
      setDebitForm({ amount: '', description: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'فشل الخصم');
    } finally {
      setActionLoading('');
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount) return;
    setActionLoading('deposit');
    try {
      await api.post(`/members/${memberId}/deposit`, { amount: parseFloat(depositAmount) });
      toast.success(`تم تسجيل دفعة أمان ${depositAmount} د.أ`);
      setDepositAmount('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'فشلت العملية');
    } finally {
      setActionLoading('');
    }
  };

  const handleSettle = async () => {
    if (!confirm('تأكيد التصفية المالية؟ سيتم تصفير الذمة المتبقية وتسجيل تاريخ التصفية.')) return;
    setActionLoading('settle');
    try {
      await api.post(`/members/${memberId}/settle`);
      toast.success('تمت التصفية المالية بنجاح');
      load();
    } catch {
      toast.error('فشلت التصفية');
    } finally {
      setActionLoading('');
    }
  };

  const handleArchive = async () => {
    if (!confirm(`أرشفة "${member.name || member.phone}"؟`)) return;
    try {
      await api.post(`/members/${memberId}/archive`);
      toast.success('تم أرشفة العضو');
      onBack();
    } catch {
      toast.error('فشلت العملية');
    }
  };

  const saveName = async () => {
    try {
      await api.patch(`/members/${memberId}`, { name: newName });
      toast.success('تم تحديث الاسم');
      setEditName(false);
      load();
    } catch {
      toast.error('فشل التحديث');
    }
  };

  const balanceColor = (b) => b > 0 ? 'text-green-600' : b < 0 ? 'text-red-500' : 'text-gray-500';

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-500 border-t-transparent" />
    </div>
  );

  if (!member) return null;

  const depositPaid = member.security_deposit_paid >= member.security_deposit_required && member.security_deposit_required > 0;

  return (
    <div className="space-y-5">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowRight className="w-4 h-4" />
          <span className="text-sm font-medium">العودة</span>
        </button>
        <button onClick={handleArchive} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-orange-500 transition-colors">
          <Archive className="w-3.5 h-3.5" />أرشفة العضو
        </button>
      </div>

      {/* Header card */}
      <div className="card">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white font-bold text-2xl">
            {(member.name || member.phone)?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            {editName ? (
              <div className="flex items-center gap-2">
                <input value={newName} onChange={e => setNewName(e.target.value)}
                  className="input text-sm flex-1" />
                <button onClick={saveName} className="p-1.5 bg-green-500 text-white rounded-lg">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => setEditName(false)} className="p-1.5 bg-gray-100 rounded-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-800">{member.name || '—'}</h2>
                <button onClick={() => setEditName(true)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <p className="text-sm text-gray-400 font-mono">{member.phone}</p>
            <div className="flex gap-2 mt-1">
              {member.is_admin ? <span className="badge-admin">مدير</span> : null}
              {member.is_blocked ? <span className="badge-blocked">موقوف مالياً</span> : <span className="badge-active">نشط</span>}
            </div>
            {member.last_settlement_at && (
              <p className="text-xs text-gray-400 mt-1">آخر تصفية: {new Date(member.last_settlement_at).toLocaleString('ar-JO')}</p>
            )}
          </div>
          <div className="text-left">
            <p className="text-xs text-gray-400">الذمة الحالية</p>
            <p className={`text-3xl font-black ${balanceColor(member.balance)}`}>
              {member.balance?.toFixed(2)}
            </p>
            <p className="text-xs text-gray-400">دينار أردني</p>
            {member.balance < 0 && (
              <button onClick={handleSettle} disabled={actionLoading === 'settle'}
                className="mt-2 text-xs flex items-center gap-1 text-green-600 hover:text-green-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />تصفية الذمة
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Security Deposit */}
      <div className={`card ${depositPaid ? 'border-green-200 bg-green-50/50' : 'border-orange-200 bg-orange-50/50'}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <ShieldCheck className={`w-5 h-5 ${depositPaid ? 'text-green-500' : 'text-orange-500'}`} />
            رصيد الأمان
          </h3>
          <span className={`text-sm font-bold ${depositPaid ? 'text-green-600' : 'text-orange-500'}`}>
            {member.security_deposit_paid?.toFixed(2)} / {member.security_deposit_required?.toFixed(2)} د.أ
          </span>
        </div>
        <div className="flex gap-2">
          <input
            type="number" min="0" step="0.01"
            placeholder="مبلغ دفعة جديدة"
            value={depositAmount}
            onChange={e => setDepositAmount(e.target.value)}
            className="input flex-1"
          />
          <button onClick={handleDeposit} disabled={!depositAmount || actionLoading === 'deposit'} className="btn-secondary">
            {actionLoading === 'deposit'
              ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent" />
              : 'تسجيل دفعة'}
          </button>
        </div>
        {!depositPaid && member.security_deposit_required > 0 && (
          <p className="text-xs text-orange-600 mt-2">⚠️ متبقٍ {(member.security_deposit_required - member.security_deposit_paid).toFixed(2)} د.أ من رصيد الأمان</p>
        )}
      </div>

      {/* Credit / Debit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Credit */}
        <div className="card border-green-100">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />شحن رصيد تشغيلي
          </h3>
          <div className="space-y-2">
            <input
              type="number"
              placeholder="المبلغ (د.أ)"
              min="0"
              step="0.01"
              value={creditForm.amount}
              onChange={e => setCreditForm(p => ({ ...p, amount: e.target.value }))}
              className="input"
            />
            <input
              placeholder="الوصف (اختياري)"
              value={creditForm.description}
              onChange={e => setCreditForm(p => ({ ...p, description: e.target.value }))}
              className="input"
            />
            <button
              onClick={handleCredit}
              disabled={!creditForm.amount || actionLoading === 'credit'}
              className="btn-primary w-full justify-center"
            >
              {actionLoading === 'credit'
                ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                : '✅ شحن'}
            </button>
          </div>
        </div>

        {/* Debit */}
        <div className="card border-red-100">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-500" />خصم يدوي
          </h3>
          <div className="space-y-2">
            <input
              type="number"
              placeholder="المبلغ (د.أ)"
              min="0"
              step="0.01"
              value={debitForm.amount}
              onChange={e => setDebitForm(p => ({ ...p, amount: e.target.value }))}
              className="input"
            />
            <input
              placeholder="الوصف (اختياري)"
              value={debitForm.description}
              onChange={e => setDebitForm(p => ({ ...p, description: e.target.value }))}
              className="input"
            />
            <button
              onClick={handleDebit}
              disabled={!debitForm.amount || actionLoading === 'debit'}
              className="btn-danger w-full justify-center"
            >
              {actionLoading === 'debit'
                ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                : '💳 خصم'}
            </button>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="card">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-gray-500" />
          سجل العمليات ({member.transactions?.length || 0})
        </h3>
        {member.transactions?.length > 0 ? (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {member.transactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs ${
                    tx.type === 'credit' ? 'bg-green-500' :
                    tx.type === 'deposit' ? 'bg-blue-500' :
                    tx.type === 'settlement' ? 'bg-purple-500' : 'bg-red-500'
                  }`}>
                    {tx.type === 'credit' ? '+' : tx.type === 'deposit' ? '🛡' : tx.type === 'settlement' ? '✓' : '-'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {tx.description || 'عملية'}
                      {tx.order_type && (
                        <span className={`mr-2 text-xs ${tx.order_type === 'external' ? 'text-blue-500' : 'text-green-500'}`}>
                          {tx.order_type === 'external' ? '🔵 خارجي' : '🟢 داخلي'}
                        </span>
                      )}
                    </p>
                    {tx.trigger_message && (
                      <p className="text-xs text-gray-400 mt-0.5 font-mono bg-gray-50 px-2 py-0.5 rounded max-w-xs truncate">
                        "{tx.trigger_message}"
                      </p>
                    )}
                    <p className="text-xs text-gray-300">{new Date(tx.created_at).toLocaleString('ar')}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className={`font-bold text-sm ${tx.type === 'credit' || tx.type === 'deposit' ? 'text-green-600' : tx.type === 'settlement' ? 'text-purple-500' : 'text-red-500'}`}>
                    {tx.type === 'credit' || tx.type === 'deposit' ? '+' : '-'}{tx.amount.toFixed(2)} د.أ
                  </p>
                  <p className="text-xs text-gray-400">رصيد: {tx.balance_after.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-8 text-sm">لا توجد عمليات بعد</p>
        )}
      </div>
    </div>
  );
}
