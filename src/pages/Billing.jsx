// src/pages/Billing.jsx
import { useEffect, useState } from 'react';
import { RefreshCw, Filter } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function Billing() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/billing/transactions?limit=100${filter ? `&type=${filter}` : ''}`);
      setTransactions(res.data);
    } catch { toast.error('فشل التحميل'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter]);

  const total = {
    credit: transactions.filter(t => t.type === 'credit').reduce((a, t) => a + t.amount, 0),
    debit: transactions.filter(t => t.type === 'debit').reduce((a, t) => a + t.amount, 0),
    deposit: transactions.filter(t => t.type === 'deposit').reduce((a, t) => a + t.amount, 0),
  };

  const isPositive = (type) => ['credit', 'deposit', 'settlement'].includes(type);
  const iconFor = (type) => type === 'deposit' ? '🛡' : type === 'settlement' ? '✓' : isPositive(type) ? '↑' : '↓';
  const colorFor = (type) => isPositive(type) ? 'bg-green-500' : 'bg-red-500';
  const textColorFor = (type) => isPositive(type) ? 'text-green-600' : 'text-red-500';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">سجل المحاسبة</h1>
        <button onClick={load} className="btn-secondary text-sm">
          <RefreshCw className="w-4 h-4" />تحديث
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card bg-red-50 border-red-200">
          <p className="text-xs font-semibold text-red-600">إجمالي العمولات</p>
          <p className="text-xl font-black text-red-600">{total.debit.toFixed(2)} <span className="text-xs">د.أ</span></p>
        </div>
        <div className="card bg-green-50 border-green-200">
          <p className="text-xs font-semibold text-green-600">إجمالي الشحن</p>
          <p className="text-xl font-black text-green-700">{total.credit.toFixed(2)} <span className="text-xs">د.أ</span></p>
        </div>
        <div className="card bg-blue-50 border-blue-200">
          <p className="text-xs font-semibold text-blue-600">دفعات رصيد الأمان</p>
          <p className="text-xl font-black text-blue-700">{total.deposit.toFixed(2)} <span className="text-xs">د.أ</span></p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-400" />
        <div className="flex gap-2">
          {[['', 'الكل'], ['debit', 'عمولات'], ['credit', 'شحن'], ['deposit', 'رصيد أمان'], ['settlement', 'تصفية'], ['manual', 'يدوي']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-colors ${filter === val ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-500 border-t-transparent" />
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          {transactions.length === 0 ? (
            <p className="text-center text-gray-400 py-16 text-sm">لا توجد عمليات</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {transactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${colorFor(tx.type)}`}>
                      {iconFor(tx.type)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">
                        {tx.member_name || tx.phone}
                        {tx.order_type && (
                          <span className={`mr-2 text-xs ${tx.order_type === 'external' ? 'text-blue-500' : 'text-green-500'}`}>
                            {tx.order_type === 'external' ? '🔵' : '🟢'}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400">{tx.description}</p>
                      {tx.trigger_message && (
                        <p className="text-xs text-gray-300 font-mono">← "{tx.trigger_message}"</p>
                      )}
                    </div>
                  </div>
                  <div className="text-left flex-shrink-0">
                    <p className={`font-bold ${textColorFor(tx.type)}`}>
                      {isPositive(tx.type) ? '+' : '-'}{tx.amount.toFixed(2)} د.أ
                    </p>
                    <p className="text-xs text-gray-300">{new Date(tx.created_at).toLocaleString('ar-JO')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
