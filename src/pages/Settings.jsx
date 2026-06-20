// src/pages/Settings.jsx
import { useState, useEffect } from 'react';
import { Link2, Key, Info, DollarSign, Send, Eye, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import toast from 'react-hot-toast';

const FIELD_GROUPS = [
  {
    title: '💰 المبالغ والعمولات',
    fields: [
      { key: 'security_deposit_amount', label: 'رصيد الأمان (د.أ)', type: 'number' },
      { key: 'commission_internal', label: 'العمولة الداخلية (د.أ)', type: 'number' },
      { key: 'commission_external', label: 'العمولة الخارجية (د.أ)', type: 'number' },
      { key: 'fixed_subscription_amount', label: 'الاشتراك الثابت (د.أ)', type: 'number' },
      { key: 'cancellation_compensation', label: 'تعويض إلغاء الطلب (د.أ)', type: 'number' },
    ],
  },
  {
    title: '📅 نصوص التصفية',
    fields: [
      { key: 'fixed_subscription_period', label: 'دورية الاشتراك', type: 'select', options: [['weekly','أسبوعي'],['monthly','شهري']] },
      { key: 'settlement_schedule', label: 'موعد التصفية', type: 'text' },
      { key: 'click_transfer_number', label: 'رقم التحويل (Click)', type: 'text' },
      { key: 'late_settlement_hours', label: 'مهلة التأخير (ساعات)', type: 'number' },
    ],
  },
  {
    title: '🔤 كلمات وإيموجي التأكيد',
    fields: [
      { key: 'confirmation_keyword', label: 'كلمة التأكيد', type: 'text' },
      { key: 'confirmation_emoji', label: 'إيموجي التأكيد', type: 'text', center: true },
      { key: 'internal_keyword', label: 'كلمة الطلب الداخلي', type: 'text' },
      { key: 'external_keyword', label: 'كلمة الطلب الخارجي', type: 'text' },
    ],
  },
];

export default function Settings() {
  const { isSuperAdmin } = useAuth();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [actionLoading, setActionLoading] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [promptText, setPromptText] = useState('');

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/settings');
      setSettings(res.data);
    } catch {
      toast.error('فشل تحميل الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSettings(); }, []);

  const updateField = (key, value) => setSettings(p => ({ ...p, [key]: value }));

  const saveSettings = async () => {
    setSaving(true);
    try {
      await api.patch('/settings', settings);
      toast.success('تم حفظ الإعدادات');
    } catch (err) {
      toast.error(err.response?.data?.error || 'فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const previewPrompt = async () => {
    try {
      const res = await api.get('/settings/rules-prompt');
      setPromptText(res.data.text);
      setShowPreview(true);
    } catch {
      toast.error('فشل تحميل المعاينة');
    }
  };

  const sendPrompt = async () => {
    if (!confirm('إرسال نص القوانين الحالي للمجموعة الآن؟')) return;
    setActionLoading('send');
    try {
      const res = await api.post('/settings/rules-prompt/send');
      setPromptText(res.data.text);
      toast.success('تم إرسال القوانين للمجموعة');
    } catch (err) {
      toast.error(err.response?.data?.error || 'فشل الإرسال');
    } finally {
      setActionLoading('');
    }
  };

  const setWebhook = async () => {
    if (!webhookUrl) return toast.error('أدخل الرابط');
    setActionLoading('webhook');
    try {
      await api.post('/group/webhook', { webhookUrl });
      toast.success('تم ضبط Webhook بنجاح');
    } catch (err) {
      toast.error(err.response?.data?.error || 'فشل');
    } finally {
      setActionLoading('');
    }
  };

  const changePassword = async () => {
    if (!passwords.current || !passwords.new) return toast.error('أدخل كلمات المرور');
    if (passwords.new !== passwords.confirm) return toast.error('كلمتا المرور غير متطابقتين');
    setActionLoading('password');
    try {
      await api.post('/auth/change-password', { currentPassword: passwords.current, newPassword: passwords.new });
      toast.success('تم تغيير كلمة المرور');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'فشل');
    } finally {
      setActionLoading('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">الإعدادات</h1>
        <button onClick={loadSettings} className="btn-secondary text-sm"><RefreshCw className="w-4 h-4" /></button>
      </div>

      {/* Dynamic fields — super admin only */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-500 border-t-transparent" />
        </div>
      ) : (
        <>
          {FIELD_GROUPS.map(group => (
            <div key={group.title} className="card">
              <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" />{group.title}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {group.fields.map(f => (
                  <div key={f.key}>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">{f.label}</label>
                    {f.type === 'select' ? (
                      <select
                        className="input" disabled={!isSuperAdmin}
                        value={settings[f.key] || ''}
                        onChange={e => updateField(f.key, e.target.value)}
                      >
                        {f.options.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                      </select>
                    ) : (
                      <input
                        type={f.type}
                        disabled={!isSuperAdmin}
                        className={`input ${f.center ? 'text-center text-xl' : ''} ${!isSuperAdmin ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                        value={settings[f.key] || ''}
                        onChange={e => updateField(f.key, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {isSuperAdmin ? (
            <button onClick={saveSettings} disabled={saving} className="btn-primary w-full justify-center py-3">
              {saving
                ? <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                : '💾 حفظ جميع الإعدادات'}
            </button>
          ) : (
            <p className="text-xs text-center text-gray-400">عرض فقط — تعديل الإعدادات للمدير الرئيسي فقط</p>
          )}
        </>
      )}

      {/* Rules prompt preview / send */}
      <div className="card bg-purple-50 border-purple-200">
        <h2 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
          📜 برومبت القوانين الديناميكي
        </h2>
        <p className="text-xs text-gray-500 mb-4">يُبنى تلقائياً من الإعدادات أعلاه ويُرسل كرسالة كاملة للمجموعة</p>
        <div className="flex gap-3">
          <button onClick={previewPrompt} className="btn-secondary flex-1 justify-center">
            <Eye className="w-4 h-4" />معاينة
          </button>
          <button onClick={sendPrompt} disabled={actionLoading === 'send'} className="btn-primary flex-1 justify-center">
            {actionLoading === 'send'
              ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              : <><Send className="w-4 h-4" />إرسال للمجموعة</>}
          </button>
        </div>

        {showPreview && (
          <div className="mt-4 bg-white rounded-xl p-4 border border-purple-100 max-h-80 overflow-y-auto">
            <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans">{promptText}</pre>
          </div>
        )}
      </div>

      {/* Webhook setup */}
      <div className="card">
        <h2 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
          <Link2 className="w-5 h-5 text-green-500" />
          ضبط Webhook (Green API)
        </h2>
        <p className="text-xs text-gray-400 mb-4">
          هذا الرابط يجب إدخاله في Green API لاستقبال الرسائل القادمة من المجموعة
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
          <p className="text-xs text-blue-700 font-semibold mb-1">📌 الرابط الصحيح يكون بالشكل:</p>
          <p className="font-mono text-xs text-blue-800 break-all">https://your-backend.railway.app/webhook</p>
        </div>
        <div className="flex gap-3">
          <input
            value={webhookUrl}
            onChange={e => setWebhookUrl(e.target.value)}
            placeholder="https://your-backend.railway.app/webhook"
            className="input flex-1 font-mono text-sm"
          />
          <button onClick={setWebhook} disabled={actionLoading === 'webhook'} className="btn-primary">
            {actionLoading === 'webhook'
              ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              : 'حفظ'}
          </button>
        </div>
      </div>

      {/* Change password */}
      <div className="card">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-purple-500" />
          تغيير كلمة المرور
        </h2>
        <div className="space-y-3">
          {[
            { key: 'current', label: 'كلمة المرور الحالية' },
            { key: 'new', label: 'كلمة المرور الجديدة' },
            { key: 'confirm', label: 'تأكيد كلمة المرور' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">{label}</label>
              <input
                type="password"
                className="input"
                value={passwords[key]}
                onChange={e => setPasswords(p => ({ ...p, [key]: e.target.value }))}
              />
            </div>
          ))}
          <button onClick={changePassword} disabled={actionLoading === 'password'} className="btn-primary w-full justify-center">
            {actionLoading === 'password'
              ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              : '🔐 تغيير'}
          </button>
        </div>
      </div>

      {/* Setup guide */}
      <div className="card bg-gray-50">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-gray-500" />
          دليل الإعداد السريع
        </h2>
        <ol className="space-y-3 text-sm text-gray-700">
          {[
            { n: 1, t: 'سجل في Green API', d: 'greenapi.com وأنشئ instance جديدة' },
            { n: 2, t: 'امسح QR Code', d: 'افتح تطبيق واتساب → الأجهزة المرتبطة → ربط جهاز' },
            { n: 3, t: 'احصل على Group ID', d: 'من خلال قائمة المجموعات في Green API Dashboard' },
            { n: 4, t: 'أضف متغيرات البيئة في Railway', d: 'GREEN_API_INSTANCE_ID, GREEN_API_TOKEN, GROUP_ID' },
            { n: 5, t: 'اضبط Webhook URL', d: 'أدخل رابط السيرفر في الحقل أعلاه' },
            { n: 6, t: 'حدد المبالغ والقوانين', d: 'من الحقول الديناميكية أعلاه' },
            { n: 7, t: 'أضف الأعضاء وحدد أرصدتهم', d: 'من صفحة الأعضاء' },
          ].map(({ n, t, d }) => (
            <li key={n} className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                {n}
              </span>
              <div>
                <p className="font-semibold">{t}</p>
                <p className="text-xs text-gray-400">{d}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
