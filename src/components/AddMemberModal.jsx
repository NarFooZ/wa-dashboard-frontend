// src/components/AddMemberModal.jsx
import { useState } from 'react';
import { X } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function AddMemberModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ phone: '', name: '', balance: '0' });
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (!form.phone) return toast.error('رقم الهاتف مطلوب');
    // Normalize Jordan numbers
    let phone = form.phone.replace(/\D/g, '');
    if (phone.startsWith('07')) phone = '962' + phone.slice(1);
    if (phone.startsWith('7') && phone.length === 9) phone = '962' + phone;

    setLoading(true);
    try {
      await api.post('/members', { ...form, phone, balance: parseFloat(form.balance || 0) });
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
        <div className="p-5 space-y-4">
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
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">رصيد أولي (د.أ)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="input"
              placeholder="0"
              value={form.balance}
              onChange={e => setForm(p => ({ ...p, balance: e.target.value }))}
            />
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
