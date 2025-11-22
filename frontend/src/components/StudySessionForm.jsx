import { useState, useCallback, useEffect, useRef } from 'react';
import { Plus, BookOpen, Play, Square, Timer, Calendar } from 'lucide-react';

const BORDER = "#d8d8d8";
const BORDER_LIGHT = "#f4f4f4";
const TEXT_PRIMARY = "#222";
const PRIMARY = "#2e71f0";
const PRIMARY_LIGHT = "#f5f9ff";

function StudySessionForm({ onAddSession, isLoggedIn, showToast }) {
  const [formData, setFormData] = useState({ subject: '', startTime: '', endTime: '' });
  const [mode, setMode] = useState('manual');
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerStartTime, setTimerStartTime] = useState(null);
  const timerIntervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    const newValue = name === 'subject'
      ? value.charAt(0).toUpperCase() + value.slice(1)
      : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  }, []);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    if (!isLoggedIn) return showToast('Please login to start timer', 'error');
    if (!formData.subject.trim()) return showToast('Please enter a subject first', 'error');

    const now = new Date();
    setTimerStartTime(now);
    setTimerRunning(true);
    setElapsedSeconds(0);

    timerIntervalRef.current = setInterval(() => setElapsedSeconds(prev => prev + 1), 1000);
    showToast('Timer started!');
  };

  const stopTimer = () => {
    clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = null;

    const end = new Date();

    setFormData(prev => ({
      ...prev,
      startTime: timerStartTime.toISOString().slice(0, 16),
      endTime: end.toISOString().slice(0, 16),
    }));

    setTimerRunning(false);
    showToast(`Session recorded (${formatTime(elapsedSeconds)})`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoggedIn) return showToast('Please login first', 'error');
    if (!formData.subject || !formData.startTime || !formData.endTime)
      return showToast('Fill in all fields', 'error');

    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);
    if (end <= start) return showToast('End time must be later', 'error');

    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      onAddSession(data);
      setFormData({ subject: '', startTime: '', endTime: '' });
      setElapsedSeconds(0);
      setTimerStartTime(null);
      showToast('Session added!');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="rounded-2xl overflow-hidden mb-6 w-full" style={{ border: `1px solid ${BORDER}`, background: "white" }}>

      {/* HEADER */}
      <div className="px-6 py-4" style={{ background: PRIMARY }}>
        <div className="flex flex-wrap items-center justify-between gap-4">

          {/* LEFT TITLE */}
          <div className="flex items-center gap-3 flex-1 min-w-[200px]">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.2)" }}>
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Study Session</h2>
              <p className="text-white/90 text-sm">Track your learning time</p>
            </div>
          </div>

          {/* MODE TOGGLE */}
          <div className="flex gap-2 p-1 rounded-lg flex-wrap justify-center sm:justify-end" style={{ background: "rgba(255,255,255,0.15)" }}>
            <button
              type="button"
              onClick={() => setMode('timer')}
              className={`flex-1 min-w-[100px] text-center py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2
                ${mode === 'timer' ? 'bg-white text-black' : 'text-white/80'}`}
            >
              <Timer className="w-4 h-4" /> Timer
            </button>

            <button
              type="button"
              onClick={() => setMode('manual')}
              className={`flex-1 min-w-[100px] text-center py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2
                ${mode === 'manual' ? 'bg-white text-black' : 'text-white/80'}`}
            >
              <Calendar className="w-4 h-4" /> Manual
            </button>
          </div>

        </div>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">

        {/* SUBJECT */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            placeholder="e.g., Mathematics, Physics"
            className="w-full px-4 py-3 rounded-xl outline-none"
            style={{ border: `1px solid ${BORDER}`, background: "white", color: TEXT_PRIMARY }}
          />
        </div>

        {/* TIMER MODE */}
        {mode === 'timer' ? (
          <div className="space-y-4">

            {/* TIMER DISPLAY */}
            <div className="rounded-xl p-6" style={{ background: "white", border: `1px solid ${BORDER}` }}>
              <div className="text-center">
                <div className="font-mono font-bold mb-2" style={{ fontSize: "clamp(2rem, 6vw, 4rem)", color: PRIMARY }}>
                  {formatTime(elapsedSeconds)}
                </div>
                {timerStartTime && timerRunning && (
                  <p className="text-sm font-medium" style={{ color: TEXT_PRIMARY }}>
                    Started at {timerStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
            </div>

            {/* SIDE-BY-SIDE BUTTONS */}
            <div className="flex gap-3 flex-wrap">
              {!timerRunning ? (
                <button
                  type="button"
                  onClick={startTimer}
                  className="flex-1 min-w-[120px] text-white px-4 py-3 rounded-lg text-sm font-semibold"
                  style={{ background: PRIMARY }}
                >
                  <div className="flex justify-center items-center gap-2"><Play className="w-4 h-4" /> Start</div>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopTimer}
                  className="flex-1 min-w-[120px] text-white px-4 py-3 rounded-lg text-sm font-semibold"
                  style={{ background: "#d9534f" }}
                >
                  <div className="flex justify-center items-center gap-2"><Square className="w-4 h-4" /> Stop</div>
                </button>
              )}

              <button
                type="submit"
                disabled={timerRunning}
                className="flex-1 min-w-[120px] text-white px-4 py-3 rounded-lg text-sm font-semibold"
                style={{ background: PRIMARY, opacity: timerRunning ? 0.6 : 1, cursor: timerRunning ? "not-allowed" : "pointer" }}
              >
                <div className="flex justify-center items-center gap-2"><Plus className="w-4 h-4" /> Add</div>
              </button>
            </div>
          </div>
        ) : (
          /* MANUAL MODE */
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time</label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={{ border: `1px solid ${BORDER}`, background: "white", color: TEXT_PRIMARY }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">End Time</label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={{ border: `1px solid ${BORDER}`, background: "white", color: TEXT_PRIMARY }}
                />
              </div>
            </div>

            {/* ADD BUTTON */}
            <div className="flex gap-3 mt-4 flex-wrap">
              <button
                type="submit"
                className="flex-1 min-w-[120px] text-white px-4 py-3 rounded-lg text-sm font-semibold"
                style={{ background: PRIMARY }}
              >
                <div className="flex justify-center items-center gap-2"><Plus className="w-4 h-4" /> Add</div>
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default StudySessionForm;
