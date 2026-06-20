// src/pages/Archived.jsx
import { useEffect, useState } from 'react';
import { RotateCcw, Trash2, Archive as ArchiveIcon } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function Archived() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/members/archived');
      setMembers(res.data);
    } catch {
      toast.error('فشل التحميل');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const restore = async (m) => {
    try {
      await api.post(`/members/${m.id}/restore`);
      toast.success('تم استرجاع العضو');
      load();
    } catch { toast.error('فشلت العملية'); }
  };

  const deleteForever = async (m) => {
    if (!confirm(`حذف "${m.name || m.phone}" نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.`)) return;
    try {
      await api.delete(`/members/${m.id}`);
      toast.success('تم الحذف النهائي');
      load();
    } catch { toast.error('فشل الحذف'); }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-800">الأعضاء المؤرشفون</h1>
        <p className="text-sm text-gray-400 mt-0.5">الأعضاء المحذوفون مع الاحتفاظ بسجلهم المالي</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-500 border-t-transparent" />
        </div>
      ) : members.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <ArchiveIcon className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>لا يوجد أعضاء مؤرشفون</p>
        </div>
      ) : (
        <div className="space-y-3">
          {members.map(m => (
            <div key={m.id} className="card opacity-80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                    {(m.name || m.phone)?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">{m.name || '—'}</p>
                    <p className="text-xs text-gray-400 font-mono">{m.phone}</p>
                    <p className="text-xs text-gray-400">أُرشف في: {new Date(m.archived_at).toLocaleDateString('ar-JO')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-500">{m.balance?.toFixed(2)} د.أ</span>
                  <button onClick={() => restore(m)} className="btn-secondary text-xs">
                    <RotateCcw className="w-3.5 h-3.5" />استرجاع
                  </button>
                  <button onClick={() => deleteForever(m)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
