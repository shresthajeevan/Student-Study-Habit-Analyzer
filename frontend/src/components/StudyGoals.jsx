import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Check, X, Target, TrendingUp } from "lucide-react";
import { getAllGoals, createGoal, updateGoal, deleteGoal } from "../api/goals";

export const StudyGoals = ({ sessions, showToast }) => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [subject, setSubject] = useState("");
  const [targetHours, setTargetHours] = useState("");
  const [period, setPeriod] = useState("weekly");

  const quotes = [
    "A goal without a plan is just a wish.",
    "Discipline is the bridge between goals and accomplishment.",
    "Small daily improvements lead to stunning results.",
    "Set goals, smash them, repeat."
  ];

  // Fetch goals on mount
  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const data = await getAllGoals();
      setGoals(data);
    } catch (err) {
      console.error("Error fetching goals:", err);
      showToast?.(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !targetHours || parseFloat(targetHours) <= 0) {
      return showToast?.("Please enter valid values", "error");
    }

    try {
      const goalData = {
        subject: subject.trim(),
        target_hours: parseFloat(targetHours),
        period
      };

      if (editingId) {
        const updated = await updateGoal(editingId, goalData);
        setGoals(prev => prev.map(g => g.id === editingId ? updated : g));
        showToast?.("Goal updated!");
      } else {
        const newGoal = await createGoal(goalData);
        setGoals(prev => [newGoal, ...prev]);
        showToast?.("Goal added!");
      }

      setSubject("");
      setTargetHours("");
      setPeriod("weekly");
      setShowForm(false);
      setEditingId(null);
    } catch (err) {
      console.error("Error saving goal:", err);
      showToast?.(err.message, "error");
    }
  };

  const handleEdit = (g) => {
    setSubject(g.subject);
    setTargetHours(g.target_hours.toString());
    setPeriod(g.period);
    setEditingId(g.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;
    
    try {
      await deleteGoal(id);
      setGoals(prev => prev.filter(g => g.id !== id));
      showToast?.("Goal deleted!");
    } catch (err) {
      console.error("Error deleting goal:", err);
      showToast?.(err.message, "error");
    }
  };

  const progressColor = (p) => p >= 100 ? "bg-green-500" : p >= 75 ? "bg-blue-500" : p >= 50 ? "bg-yellow-400" : "bg-red-500";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center p-6 bg-white rounded-2xl border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 rounded-xl"><Target className="w-6 h-6 text-blue-600" /></div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Study Goals</h2>
            <p className="text-gray-500 text-sm">Set targets and track your progress</p>
          </div>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition">
            <Plus className="w-4 h-4" /> Add Goal
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <form className="bg-white p-6 rounded-2xl border border-gray-200 space-y-5" onSubmit={handleSubmit}>
          <p className="text-gray-600 italic text-center">"{quotes[Math.floor(Math.random() * quotes.length)]}"</p>
          <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject e.g., Math" className="w-full px-4 py-2 rounded-lg bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-blue-200 outline-none" />
          <div className="flex gap-4 flex-wrap">
            <input type="number" min="0.5" step="0.5" value={targetHours} onChange={e => setTargetHours(e.target.value)} placeholder="Target Hours e.g., 10" className="flex-1 px-4 py-2 rounded-lg bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-green-200 outline-none" />
            <select value={period} onChange={e => setPeriod(e.target.value)} className="w-48 px-4 py-2 rounded-lg bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-blue-200 outline-none">
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button type="submit" className="flex-1 px-4 py-2 bg-blue-500 text-white font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-blue-600 transition">
              <Check className="w-4 h-4" /> {editingId ? "Update Goal" : "Create Goal"}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setSubject(""); setTargetHours(""); setPeriod("weekly"); }} className="px-4 py-2 bg-gray-200 rounded-xl font-medium flex items-center gap-2 hover:bg-gray-300 transition">
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </form>
      )}

      {/* Goals List */}
      {goals.length === 0 ? (
        <p className="text-center text-gray-400 py-10 text-lg">No goals yet. Start by adding one!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map(g => {
            const stats = g.progress || { currentHours: 0, progress: 0, remaining: g.target_hours };
            return (
              <div key={g.id} className="bg-white p-5 rounded-2xl border border-gray-200 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">{g.subject}</h3>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded capitalize">{g.period}</span>
                    </div>
                    <p className="text-sm text-gray-500">Target: {g.target_hours} hours / {g.period}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(g)} className="p-2 text-blue-500 hover:text-blue-700 rounded-lg transition"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(g.id)} className="p-2 text-red-500 hover:text-red-700 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-1">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Progress</span>
                    <span className="font-medium">{stats.progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-3 rounded-full ${progressColor(stats.progress)}`} style={{ width: `${stats.progress}%` }} />
                  </div>
                </div>

                <div className="flex justify-between text-sm font-medium text-gray-600 mt-2">
                  <div className="flex items-center gap-1"><TrendingUp className="w-4 h-4 text-blue-500" /><span>{stats.currentHours.toFixed(1)}h done</span></div>
                  <div className="flex items-center gap-1"><Target className="w-4 h-4 text-green-500" /><span>{stats.remaining.toFixed(1)}h remaining</span></div>
                </div>

                {stats.progress >= 100 && <p className="text-green-600 font-semibold text-center mt-2">🎉 Goal Achieved!</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};