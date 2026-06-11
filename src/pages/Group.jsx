// src/pages/Group.jsx
import { useEffect, useState } from 'react';
import { RefreshCw, Edit2, Check, X, Shield, ShieldOff, UserX, MessageSquare, Wifi } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function Group() {
  const [groupInfo, setGroupInfo] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [sendMsg, setSendMsg] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  const setAction = (key, val) => setActionLoading(p => ({ ...p, [key]: val }));

  const load = async () => {
    setLoading(true);
    try {
      const [infoRes, statusRes] = await Promise.all([
        api.get('/group/info'),
        api.get('/group/status'),
      ]);
      setGroupInfo(infoRes.data);
      setStatus(statusRes.data);
      setNewName(infoRes.data.groupName || '');
    } catch (err) {
      toast.error('فشل تحميل بيانات المجموعة');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const changeName = async () => {
    if (!newName.trim()) return;
    setAction('name', true);
    try {
      await api.patch('/group/name', { name: newName.trim() });
      toast.success('تم تغيير اسم المجموعة');
      setEditingName(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'فشل تغيير الاسم');
    } finally {
      setAction('name', false);
    }
  };

  const toggleAdmin = async (participant) => {
    const key = `admin_${participant.id}`;
    setAction(key, true);
    try {
      if (participant.isAdmin) {
        await api.delete('/group/admin', { data: { waId: participant.id } });
        toast.success('تم سحب الصلاحية');
      } else {
        await api.post('/group/admin', { waId: participant.id });
        toast.success('تم منح صلاحية المدير');
      }
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'فشلت العملية');
    } finally {
      setAction(key, false);
    }
  };

  const removeMember = async (participant) => {
    if (!confirm(`هل تريد إزالة ${participant.name || participant.id} من المجموعة؟`)) return;
    const key = `remove_${participant.id}`;
    setAction(key, true);
    try {
      await api.delete('/group/member', { data: { waId: participant.id } });
      toast.success('تم إزالة العضو');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'فشل الحذف');
    } finally {
      setAction(key, false);
    }
  };

  const sendGroupMessage = async () => {
    if (!sendMsg.trim()) return;
    setAction('msg', true);
    try {
      await api.post('/group/message', { text: sendMsg.trim() });
      toast.success('تم إرسال الرسالة');
      setSendMsg('');
    } catch (err) {
      toast.error('فشل الإرسال');
    } finally {
      setAction('msg', false);
    }
  };

  const isConnected = status?.stateInstance === 'authorized';

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-500 border-t-transparent" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">المجموعة</h1>
        <button onClick={load} className="btn-secondary text-sm">
          <RefreshCw className="w-4 h-4" />تحديث
        </button>
      </div>

      {/* Status + Group Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`} />
            <span className="text-sm font-semibold text-gray-700">
              {isConnected ? 'متصل بواتساب ✅' : 'غير متصل ❌'}
            </span>
          </div>
          <p className="text-xs text-gray-400">حالة الاتصال: {status?.stateInstance || 'غير معروف'}</p>
        </div>

        <div className="card">
          <p className="text-xs text-gray-400 mb-1">اسم المجموعة</p>
          {editingName ? (
            <div className="flex gap-2">
              <input value={newName} onChange={e => setNewName(e.target.value)}
                className="input flex-1 text-sm" />
              <button onClick={changeName} disabled={actionLoading.name}
                className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={() => setEditingName(false)} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="font-bold text-gray-800 flex-1">{groupInfo?.groupName || 'غير محدد'}</p>
              <button onClick={() => setEditingName(true)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-1">{groupInfo?.participants?.length || 0} عضو</p>
        </div>
      </div>

      {/* Send message */}
      <div className="card">
        <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-green-500" />
          إرسال رسالة للمجموعة
        </h2>
        <div className="flex gap-3">
          <input
            value={sendMsg}
            onChange={e => setSendMsg(e.target.value)}
            placeholder="اكتب رسالتك..."
            className="input flex-1"
            onKeyDown={e => e.key === 'Enter' && sendGroupMessage()}
          />
          <button onClick={sendGroupMessage} disabled={actionLoading.msg || !sendMsg.trim()}
            className="btn-primary">
            {actionLoading.msg
              ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              : 'إرسال'}
          </button>
        </div>
      </div>

      {/* Participants */}
      <div className="card">
        <h2 className="font-bold text-gray-800 mb-4">
          أعضاء المجموعة ({groupInfo?.participants?.length || 0})
        </h2>
        <div className="space-y-2">
          {(groupInfo?.participants || []).map(p => (
            <div key={p.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                  {(p.name || p.id)?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">{p.name || p.id.replace('@c.us', '')}</p>
                  <p className="text-xs text-gray-400">{p.id.replace('@c.us', '')}</p>
                </div>
                {p.isAdmin && <span className="badge-admin">مدير</span>}
                {p.isSuperAdmin && <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-0.5 rounded-full">مالك</span>}
              </div>

              <div className="flex items-center gap-1">
                {!p.isSuperAdmin && (
                  <>
                    <button
                      onClick={() => toggleAdmin(p)}
                      disabled={actionLoading[`admin_${p.id}`]}
                      title={p.isAdmin ? 'سحب الصلاحية' : 'منح الصلاحية'}
                      className={`p-2 rounded-lg transition-colors ${p.isAdmin
                        ? 'hover:bg-red-50 text-purple-500 hover:text-red-500'
                        : 'hover:bg-purple-50 text-gray-400 hover:text-purple-500'}`}
                    >
                      {p.isAdmin ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => removeMember(p)}
                      disabled={actionLoading[`remove_${p.id}`]}
                      title="إزالة من المجموعة"
                      className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
