import { useState } from 'react';
import { ClipboardList, Edit2, Trash2, Save, X, BookOpen } from 'lucide-react';

function StudySessionList({ sessions, onEditSession, onDeleteSession }) {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const startEdit = (s) => {
    setEditingId(s.id);

    // Format dates for datetime-local input
    const startFormatted = new Date(s.startTime).toISOString().slice(0, 16);
    const endFormatted = new Date(s.endTime).toISOString().slice(0, 16);

    setEditForm({
      subject: s.subject,
      startTime: startFormatted,
      endTime: endFormatted
    });
  };

  const saveEdit = async (id) => {
    if (!editForm.subject?.trim() || !editForm.startTime || !editForm.endTime) {
      return alert('Please fill all fields');
    }

    const start = new Date(editForm.startTime);
    const end = new Date(editForm.endTime);
    if (end <= start || isNaN(start) || isNaN(end)) {
      return alert('Invalid time range');
    }

    try {
      const res = await fetch(`/api/sessions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          subject: editForm.subject.trim(),
          startTime: editForm.startTime,
          endTime: editForm.endTime,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update session');

      onEditSession(data);
      setEditingId(null);
      setEditForm({});
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this session?')) return;

    try {
      const res = await fetch(`/api/sessions/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete session');

      onDeleteSession(id);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const formatDateTime = (dt) => {
    const date = new Date(dt);
    return isNaN(date) ? 'Invalid' : date.toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const formatDuration = (m) => m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`;

  if (!sessions.length) return (
    <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-xl p-12 border border-[#d1d5db] text-center">
      <div className="w-20 h-20 bg-gradient-to-br from-[#3b82f6] to-[#2563eb] rounded-full flex items-center justify-center mx-auto mb-4">
        <BookOpen className="w-10 h-10 text-white" />
      </div>
      <p className="text-[#111827] text-lg font-bold mb-2">No study sessions yet</p>
      <p className="text-[#4b5563] text-sm">Start tracking to see your progress!</p>
    </div>
  );

  const Row = ({ s, mobile }) => editingId === s.id ? (
    <div className={mobile ? "space-y-4" : "contents"}>
      {['subject', 'startTime', 'endTime'].map((key, i) => (
        <td key={i} className={mobile ? "" : "px-6 py-4"}>
          {mobile && <label className="block text-xs font-semibold text-[#374151] mb-1">{key === 'subject' ? 'Subject' : key === 'startTime' ? 'Start Time' : 'End Time'}</label>}
          <input
            type={key === 'subject' ? 'text' : 'datetime-local'}
            value={editForm[key] || ''}
            onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
            className="w-full px-3 py-2 border-[#d1d5db] rounded-lg focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6] outline-none"
            placeholder={key === 'subject' ? 'Subject' : ''}
          />
        </td>
      ))}
      {!mobile && <td className="px-6 py-4 text-sm text-[#2563eb] font-semibold">{formatDuration(s.duration)}</td>}
      <td className={mobile ? "pt-2" : "px-6 py-4"}>
        <div className="flex gap-2">
          <button onClick={() => saveEdit(s.id)} className="flex-1 md:flex-none px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-1 border border-green-600">
            <Save className="w-4 h-4" />Save
          </button>
          <button onClick={() => { setEditingId(null); setEditForm({}); }} className="flex-1 md:flex-none px-4 py-2 bg-gray-200 hover:bg-gray-300 text-[#111827] rounded-lg text-sm font-semibold flex items-center justify-center gap-1 border border-gray-300">
            <X className="w-4 h-4" />Cancel
          </button>
        </div>
      </td>
    </div>
  ) : (
    <div className={mobile ? "space-y-3" : "contents"}>
      {mobile ? (
        <>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-2 h-2 bg-[#3b82f6] rounded-full flex-shrink-0 mt-1.5"></div>
              <span className="text-base font-bold text-[#111827] truncate">{s.subject}</span>
            </div>
            <div className="px-2.5 py-1 bg-[#3b82f6] text-white rounded-full text-xs font-semibold ml-2 flex-shrink-0">{formatDuration(s.duration)}</div>
          </div>
          <div className="space-y-1.5 text-sm text-[#374151] font-medium">
            <div className="flex items-center gap-2"><span className="font-semibold">Start:</span> {formatDateTime(s.startTime)}</div>
            <div className="flex items-center gap-2"><span className="font-semibold">End:</span> {formatDateTime(s.endTime)}</div>
          </div>
        </>
      ) : (
        <>
          <td className="px-6 py-4"><div className="flex items-center gap-2"><div className="w-2 h-2 bg-[#3b82f6] rounded-full"></div><span className="text-sm font-semibold text-[#111827]">{s.subject}</span></div></td>
          <td className="px-6 py-4 text-sm text-[#374151] font-medium">{formatDateTime(s.startTime)}</td>
          <td className="px-6 py-4 text-sm text-[#374151] font-medium">{formatDateTime(s.endTime)}</td>
          <td className="px-6 py-4"><div className="inline-flex px-3 py-1 bg-[#2563eb] text-white rounded-full text-sm font-semibold">{formatDuration(s.duration)}</div></td>
        </>
      )}
      <td className={mobile ? "pt-2" : "px-6 py-4"}>
        <div className="flex gap-2">
          <button onClick={() => startEdit(s)} className="flex-1 md:flex-none px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-sm font-semibold flex items-center justify-center gap-1 border border-green-400">
            <Edit2 className="w-4 h-4" />Edit
          </button>
          <button onClick={() => handleDelete(s.id)} className="flex-1 md:flex-none px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-semibold flex items-center justify-center gap-1 border border-red-400">
            <Trash2 className="w-4 h-4" />Delete
          </button>
        </div>
      </td>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-xl border border-[#d1d5db] overflow-hidden">
      <div className="px-6 py-5 border-b border-[#d1d5db] bg-gradient-to-r from-blue-50 to-purple-50 flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-[#3b82f6] to-[#2563eb] rounded-lg flex items-center justify-center">
          <ClipboardList className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-[#111827]">Study Sessions</h2>
          <p className="text-sm text-[#4b5563]">Manage your learning history</p>
        </div>
        <span className="px-4 py-2 bg-gradient-to-r from-[#3b82f6] to-[#2563eb] text-white rounded-full text-sm font-semibold">{sessions.length}</span>
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gradient-to-r from-[#3b82f6] to-[#2563eb] text-white">
            <tr>
              {['Subject', 'Start Time', 'End Time', 'Duration', 'Actions'].map(h => <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase">{h}</th>)}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#d1d5db]">
            {sessions.map(s => <tr key={s.id} className="hover:bg-gray-50 transition-colors"><Row s={s} mobile={false} /></tr>)}
          </tbody>
        </table>
      </div>

      <div className="md:hidden divide-y divide-[#d1d5db]">
        {sessions.map(s => <div key={s.id} className="p-4 hover:bg-gray-50 transition-colors"><Row s={s} mobile={true} /></div>)}
      </div>
    </div>
  );
}

export default StudySessionList;