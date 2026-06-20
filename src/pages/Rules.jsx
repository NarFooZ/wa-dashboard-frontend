// src/pages/Rules.jsx
import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, Zap, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

const ORDER_TYPES = [
  { value: 'internal', label: '🟢 طلب داخلي', color: 'text-green-600' },
  { value: 'external', label: '🔵 طلب خارجي', color: 'text-blue-600' },
  { value: 'subscription', label: '💳 اشتراك ثابت', color: 'text-purple-600' },
];

export default function Rules() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ keyword: '', emoji: '', amount: '', description: '', order_type: 'internal' });

  const load = async () => {
    try {
      const res = await api.get('/billing/rules');
      setRules(res.data);
    } catch { toast.error('فشل التحميل'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.keyword || !form.amount) return toast.error('الكلمة والمبلغ مطلوبان');
    try {
      if (editId) {
        await api.patch(`/billing/rules/${editId}`, form);
        toast.success('تم التحديث');
      } else {
        await api.post('/billing/rules', form);
        toast.success('تم إضافة القاعدة');
      }
      setForm({ keyword: '', emoji: '', amount: '', description: '', order_type: 'internal' });
      setShowAdd(false);
      setEditId(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'فشل الحفظ');
    }
  };

  const deleteRule = async (id) => {
    if (!confirm('حذف هذه القاعدة؟')) return;
    try {
      await api.delete(`/billing/rules/${id}`);
      toast.success('تم الحذف');
      load();
    } catch { toast.error('فشل الحذف'); }
  };

  const toggleActive = async (rule) => {
    try {
      await api.patch(`/billing/rules/${rule.id}`, { is_active: rule.is_active ? 0 : 1 });
      load();
    } catch { toast.error('فشلت العملية'); }
  };

  const startEdit = (rule) => {
    setEditId(rule.id);
    setForm({
      keyword: rule.keyword, emoji: rule.emoji || '', amount: String(rule.amount),
      description: rule.description || '', order_type: rule.order_type || 'internal',
    });
    setShowAdd(true);
  };

  const typeLabel = (val) => ORDER_TYPES.find(t => t.value === val) || ORDER_TYPES[0];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">قواعد الخصم التلقائي</h1>
          <p className="text-sm text-gray-400 mt-0.5">عند كتابة الكلمة + الرمز في المجموعة يتم الخصم تلقائياً</p>
        </div>
        <button onClick={() => { setShowAdd(true); setEditId(null); setForm({ keyword: '', emoji: '', amount: '', description: '', order_type: 'internal' }); }}
          className="btn-primary text-sm">
          <Plus className="w-4 h-4" />قاعدة جديدة
        </button>
      </div>

      {/* How it works */}
      <div className="card bg-green-50 border-green-200">
        <h3 className="font-bold text-green-800 mb-2 flex items-center gap-2">
          <Zap className="w-5 h-5" />كيف يعمل النظام
        </h3>
        <p className="text-sm text-green-700">
          عندما يكتب عضو رسالة تحتوي على <strong>كلمة الخصم + الرمز</strong> في المجموعة،
          يتعرف النظام عليه برقم هاتفه ويخصم المبلغ تلقائياً ويرسل إشعاراً للمجموعة.
        </p>
        <p className="text-sm text-green-700 mt-2">
          لتمييز نوع الطلب أضف كلمة <strong>"داخلي"</strong> أو <strong>"خارجي"</strong> ضمن رسالة التأكيد
          (يمكن تخصيص الكلمتين من صفحة الإعدادات) — سيُخصم المبلغ المناسب تلقائياً.
        </p>
        <div className="mt-3 bg-white rounded-xl p-3 border border-green-100 flex gap-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">طلب داخلي:</p>
            <p className="font-mono text-sm bg-wa-light px-3 py-2 rounded-lg inline-block">داخلي تم 👍</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">طلب خارجي:</p>
            <p className="font-mono text-sm bg-blue-50 px-3 py-2 rounded-lg inline-block">خارجي تم 👍</p>
          </div>
        </div>
      </div>

      {/* Add/Edit form */}
      {showAdd && (
        <div className="card border-green-200">
          <h3 className="font-bold text-gray-800 mb-4">{editId ? 'تعديل القاعدة' : 'قاعدة جديدة'}</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">كلمة التفعيل *</label>
              <input className="input" placeholder="مثال: تم" value={form.keyword} onChange={e => setForm(p => ({ ...p, keyword: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">الرمز (إيموجي)</label>
              <input className="input text-xl text-center" placeholder="👍" value={form.emoji} onChange={e => setForm(p => ({ ...p, emoji: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">مبلغ الخصم الافتراضي (د.أ) *</label>
              <input type="number" min="0" step="0.01" className="input" placeholder="1.00" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">نوع الطلب الافتراضي</label>
              <select className="input" value={form.order_type} onChange={e => setForm(p => ({ ...p, order_type: e.target.value }))}>
                {ORDER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-600 mb-1 block">الوصف</label>
              <input className="input" placeholder="وصف العملية" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-3">
            💡 إذا كتب العضو "داخلي" أو "خارجي" ضمن الرسالة سيُستخدم المبلغ المحدد لذلك النوع من صفحة الإعدادات تلقائياً، وإلا يُستخدم المبلغ والنوع الافتراضيان أعلاه.
          </p>
          <div className="flex gap-3">
            <button onClick={() => { setShowAdd(false); setEditId(null); }} className="btn-secondary flex-1 justify-center">إلغاء</button>
            <button onClick={save} className="btn-primary flex-1 justify-center">
              {editId ? '💾 تحديث' : '✅ إضافة'}
            </button>
          </div>
        </div>
      )}

      {/* Rules list */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-500 border-t-transparent" />
        </div>
      ) : rules.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">⚡</p>
          <p>لا توجد قواعد خصم بعد</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map(rule => (
            <div key={rule.id} className={`card ${!rule.is_active ? 'opacity-60' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{rule.emoji || '💬'}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800 text-base font-mono bg-gray-100 px-2 py-0.5 rounded">{rule.keyword}</span>
                      {rule.emoji && <span className="text-lg">{rule.emoji}</span>}
                      <span className={`text-xs font-semibold ${typeLabel(rule.order_type).color}`}>{typeLabel(rule.order_type).label}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{rule.description || 'بدون وصف'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-left">
                    <p className="font-black text-lg text-red-500">{rule.amount.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">د.أ</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => toggleActive(rule)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400" title="تفعيل/إيقاف">
                      {rule.is_active ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                    <button onClick={() => startEdit(rule)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteRule(rule.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
