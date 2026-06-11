// src/pages/Settings.jsx
import { useState } from 'react';
import { Link2, Key, Info } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function Settings() {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [loading, setLoading] = useState('');

  const setWebhook = async () => {
    if (!webhookUrl) return toast.error('أدخل الرابط');
    setLoading('webhook');
    try {
      await api.post('/group/webhook', { webhookUrl });
      toast.success('تم ضبط Webhook بنجاح');
    } catch (err) {
      toast.error(err.response?.data?.error || 'فشل');
    } finally {
      setLoading('');
    }
  };

  const changePassword = async () => {
    if (!passwords.current || !passwords.new) return toast.error('أدخل كلمات المرور');
    if (passwords.new !== passwords.confirm) return toast.error('كلمتا المرور غير متطابقتين');
    setLoading('password');
    try {
      await api.post('/auth/change-password', { currentPassword: passwords.current, newPassword: passwords.new });
      toast.success('تم تغيير كلمة المرور');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'فشل');
    } finally {
      setLoading('');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">الإعدادات</h1>

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
          <button onClick={setWebhook} disabled={loading === 'webhook'} className="btn-primary">
            {loading === 'webhook'
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
          <button onClick={changePassword} disabled={loading === 'password'} className="btn-primary w-full justify-center">
            {loading === 'password'
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
            { n: 6, t: 'أضف الأعضاء وحدد أرصدتهم', d: 'من صفحة الأعضاء' },
            { n: 7, t: 'اضبط قواعد الخصم', d: 'من صفحة قواعد الخصم' },
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
