// src/pages/Admins.jsx
import { useEffect, useState } from 'react';
import { Plus, Trash2, Key, UserPlus, ShieldCheck, X, Check } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function Admins() {
  const [admins, setAdmins] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showPromote, setShowPromote] = useState(false);
  const [resetId, setResetId] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  const [createForm, setCreateForm] = useState({ username: '', password: '' });
  const [promoteForm, setPromoteForm] = useState({ memberId: '', username: '', password: '' });

  const load = async () => {
    setLoading(true);
    try {
      const [adminsRes, membersRes] = await Promise.all([
        api.get('/admins'),
        api.get('/members'),
      ]);
      setAdmins(adminsRes.data);
      setMembers(membersRes.data);
    } catch {
      toast.error('فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const createAdmin = async () => {
    if (!createForm.username || !createForm.password) return toast.error('البيانات ناقصة');
    try {
      await api.post('/admins', { ...createForm, role: 'sub_admin' });
      toast.success('تم إضافة المشرف');
      setCreateForm({ username: '', password: '' });
      setShowCreate(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'فشلت العملية');
    }
  };

  const promoteMember = async () => {
    if (!promoteForm.memberId || !promoteForm.username || !promoteForm.password) {
      return toast.error('البيانات ناقصة');
    }
    try {
      await api.post('/admins/promote', promoteForm);
      toast.success('تم ترقية العضو إلى مشرف');
      setPromoteForm({ memberId: '', username: '', password: '' });
      setShowPromote(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'فشلت الترقية');
    }
  };

  const resetPassword = async () => {
    if (!newPassword || newPassword.length < 4) return toast.error('كلمة المرور قصيرة جداً');
    try {
      await api.patch(`/admins/${resetId}/password`, { newPassword });
      toast.success('تم تغيير كلمة المرور');
      setResetId(null);
      setNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'فشلت العملية');
    }
  };

  const deleteAdmin = async (admin) => {
    if (!confirm(`حذف صلاحيات المشرف "${admin.username}"؟`)) return;
    try {
      await api.delete(`/admins/${admin.id}`);
      toast.success('تم الحذف');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'فشل الحذف');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">إدارة المشرفين</h1>
          <p className="text-sm text-gray-400 mt-0.5">المدير الرئيسي يمكنه إضافة مشرفين مساعدين</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowPromote(true)} className="btn-secondary text-sm">
            <UserPlus className="w-4 h-4" />ترقية عضو
          </button>
          <button onClick={() => setShowCreate(true)} className="btn-primary text-sm">
            <Plus className="w-4 h-4" />مشرف جديد
          </button>
        </div>
      </div>

      {/* Create admin form */}
      {showCreate && (
        <div className="card border-green-200">
          <div className="flex justify-between mb-3">
            <h3 className="font-bold text-gray-800">إضافة مشرف جديد</h3>
            <button onClick={() => setShowCreate(false)}><X className="w-4 h-4 text-gray-400" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input className="input" placeholder="اسم المستخدم" value={createForm.username}
              onChange={e => setCreateForm(p => ({ ...p, username: e.target.value }))} />
            <input className="input" placeholder="كلمة المرور" type="password" value={createForm.password}
              onChange={e => setCreateForm(p => ({ ...p, password: e.target.value }))} />
          </div>
          <button onClick={createAdmin} className="btn-primary w-full justify-center">✅ إضافة</button>
        </div>
      )}

      {/* Promote member form */}
      {showPromote && (
        <div className="card border-purple-200">
          <div className="flex justify-between mb-3">
            <h3 className="font-bold text-gray-800">ترقية عضو من المجموعة إلى مشرف</h3>
            <button onClick={() => setShowPromote(false)}><X className="w-4 h-4 text-gray-400" /></button>
          </div>
          <div className="space-y-3">
            <select className="input" value={promoteForm.memberId}
              onChange={e => setPromoteForm(p => ({ ...p, memberId: e.target.value }))}>
              <option value="">اختر العضو...</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name || m.phone} — {m.phone}</option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <input className="input" placeholder="اسم المستخدم الجديد" value={promoteForm.username}
                onChange={e => setPromoteForm(p => ({ ...p, username: e.target.value }))} />
              <input className="input" placeholder="كلمة المرور" type="password" value={promoteForm.password}
                onChange={e => setPromoteForm(p => ({ ...p, password: e.target.value }))} />
            </div>
            <button onClick={promoteMember} className="btn-primary w-full justify-center">🛡️ ترقية</button>
          </div>
        </div>
      )}

      {/* Admins list */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-500 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-3">
          {admins.map(admin => (
            <div key={admin.id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${admin.role === 'super_admin' ? 'bg-yellow-100' : 'bg-purple-100'}`}>
                    <ShieldCheck className={`w-5 h-5 ${admin.role === 'super_admin' ? 'text-yellow-600' : 'text-purple-600'}`} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{admin.username}</p>
                    <p className="text-xs text-gray-400">
                      {admin.role === 'super_admin' ? 'مدير رئيسي' : 'مشرف مساعد'}
                      {admin.member_name && ` · ${admin.member_name}`}
                    </p>
                  </div>
                </div>

                {resetId === admin.id ? (
                  <div className="flex items-center gap-2">
                    <input type="password" className="input text-sm w-32" placeholder="كلمة مرور جديدة"
                      value={newPassword} onChange={e => setNewPassword(e.target.value)} autoFocus />
                    <button onClick={resetPassword} className="p-2 bg-green-500 text-white rounded-lg"><Check className="w-4 h-4" /></button>
                    <button onClick={() => { setResetId(null); setNewPassword(''); }} className="p-2 bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <div className="flex gap-1">
                    <button onClick={() => setResetId(admin.id)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400" title="تغيير كلمة المرور">
                      <Key className="w-4 h-4" />
                    </button>
                    {admin.role !== 'super_admin' && (
                      <button onClick={() => deleteAdmin(admin)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500" title="حذف">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
