// src/components/AddMemberModal.jsx
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function AddMemberModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    phone: '', name: '', balance: '0',
    security_deposit_required: '', security_deposit_paid: '0',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Pull default deposit amount from dynamic settings
    api.get('/settings').then(res => {
      setForm(p => ({ ...p, security_deposit_required: res.data.security_deposit_amount || '0' }));
    }).catch(() => {});
  }, []);

  const handle = async () => {
    if (!form.phone) return toast.error('رقم الهاتف مطلوب');
    // Normalize Jordan numbers
    let phone = form.phone.replace(/\D/g, '');
    if (phone.startsWith('07')) phone = '962' + phone.slice(1);
    if (phone.startsWith('7') && phone.length === 9) phone = '962' + phone;

    setLoading(true);
    try {
      await api.post('/members', {
        ...form,
        phone,
        balance: parseFloat(form.balance || 0),
        security_deposit_required: parseFloat(form.security_deposit_required || 0),
        security_deposit_paid: parseFloat(form.security_deposit_paid || 0),
      });
      toast.success('تم إضافة العضو');
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.error || 'فشلت الإضافة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">إضافة عضو جديد</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">رقم الهاتف *</label>
            <input
              className="input"
              placeholder="0790000000 أو 962790000000"
              value={form.phone}
              onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">الاسم</label>
            <input
              className="input"
              placeholder="اسم العضو"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">رصيد تشغيلي أولي (د.أ)</label>
            <input
              type="number" min="0" step="0.01" className="input" placeholder="0"
              value={form.balance}
              onChange={e => setForm(p => ({ ...p, balance: e.target.value }))}
            />
          </div>

          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs font-semibold text-gray-500 mb-2">🛡️ رصيد الأمان (منفصل عن الرصيد التشغيلي)</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">المطلوب</label>
                <input
                  type="number" min="0" step="0.01" className="input"
                  value={form.security_deposit_required}
                  onChange={e => setForm(p => ({ ...p, security_deposit_required: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">المدفوع</label>
                <input
                  type="number" min="0" step="0.01" className="input"
                  value={form.security_deposit_paid}
                  onChange={e => setForm(p => ({ ...p, security_deposit_paid: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="btn-secondary flex-1 justify-center">إلغاء</button>
            <button onClick={handle} disabled={loading} className="btn-primary flex-1 justify-center">
              {loading
                ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                : 'إضافة'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
