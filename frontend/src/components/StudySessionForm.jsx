import { useState, useCallback } from 'react';
import { Plus, BookOpen, Clock, Calendar, LogIn } from 'lucide-react';

const InputField = ({
  label,
  icon: Icon,
  iconBg,
  iconColor,
  type,
  name,
  value,
  onChange,
  onFocus,
  onBlur,
  isLoggedIn,
  activeTooltip,
}) => (
  <div className="relative">
    <label className="flex items-center gap-2 text-sm font-semibold text-[#374151] mb-2">
      <div className={`w-5 h-5 ${iconBg} rounded flex items-center justify-center`}>
        <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
      </div>
      {label} <span className="text-[#ef4444]">*</span>
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={name === 'subject' ? 'e.g., Mathematics, Physics, History' : ''}
      className={`w-full px-4 py-3 border-2 rounded-lg outline-none bg-white transition-all duration-200 ${
        activeTooltip === name && !isLoggedIn
          ? 'border-orange-400 ring-2 ring-orange-100'
          : 'border-[#d1d5db] focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]'
      }`}
    />
    {activeTooltip === name && !isLoggedIn && (
      <div className="absolute -top-2 left-0 transform -translate-y-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm py-2 px-4 rounded-lg z-10 whitespace-nowrap flex items-center gap-2 animate-in fade-in-0 zoom-in-95">
        <LogIn className="w-4 h-4" />
        Sign in to start tracking sessions
        <div className="absolute bottom-0 left-6 transform -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-orange-500 rotate-45"></div>
      </div>
    )}
  </div>
);

function StudySessionForm({ onAddSession, isLoggedIn, showToast }) {
  const [formData, setFormData] = useState({ subject: '', startTime: '', endTime: '' });
  const [activeTooltip, setActiveTooltip] = useState('');

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    const newValue = name === 'subject' ? value.charAt(0).toUpperCase() + value.slice(1) : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  }, []);

  const handleInputFocus = useCallback((name) => {
    if (!isLoggedIn) setActiveTooltip(name);
  }, [isLoggedIn]);

  const handleInputBlur = useCallback(() => setActiveTooltip(''), []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      showToast('Please login to add study sessions', 'error');
      return;
    }

    if (!formData.subject.trim() || !formData.startTime || !formData.endTime) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);
    if (end <= start) {
      showToast('End time must be after start time', 'error');
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: Send session cookie
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add session');

      onAddSession(data); // Update UI with new session
      setFormData({ subject: '', startTime: '', endTime: '' });
      showToast('Session added successfully!');
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-xl p-6 border border-[#e5e7eb] mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-[#3b82f6] to-[#2563eb] rounded-lg flex items-center justify-center text-white">
          <Plus className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#111827]">Log Study Session</h2>
          <p className="text-sm text-[#4b5563]">Track your learning progress</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <InputField
          label="Subject"
          icon={BookOpen}
          iconBg="bg-green-100"
          iconColor="text-green-600"
          type="text"
          name="subject"
          value={formData.subject}
          onChange={handleInputChange}
          onFocus={() => handleInputFocus('subject')}
          onBlur={handleInputBlur}
          isLoggedIn={isLoggedIn}
          activeTooltip={activeTooltip}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputField
            label="Start Time"
            icon={Clock}
            iconBg="bg-orange-100"
            iconColor="text-orange-600"
            type="datetime-local"
            name="startTime"
            value={formData.startTime}
            onChange={handleInputChange}
            onFocus={() => handleInputFocus('startTime')}
            onBlur={handleInputBlur}
            isLoggedIn={isLoggedIn}
            activeTooltip={activeTooltip}
          />

          <InputField
            label="End Time"
            icon={Calendar}
            iconBg="bg-purple-100"
            iconColor="text-purple-600"
            type="datetime-local"
            name="endTime"
            value={formData.endTime}
            onChange={handleInputChange}
            onFocus={() => handleInputFocus('endTime')}
            onBlur={handleInputBlur}
            isLoggedIn={isLoggedIn}
            activeTooltip={activeTooltip}
          />
        </div>

        <button
          type="submit"
          className="bg-gradient-to-r from-[#3b82f6] to-[#2563eb] hover:from-[#2563eb] hover:to-[#1d4ed8] text-white px-6 py-3 rounded-lg font-semibold transition-all w-full md:w-auto flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Session
        </button>
      </form>
    </div>
  );
}

export default StudySessionForm;