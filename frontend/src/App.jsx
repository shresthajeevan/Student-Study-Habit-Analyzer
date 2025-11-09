import { useState, useEffect } from "react";
import {
  BookOpen,
  BarChart3,
  Lightbulb,
  FileQuestion,
  User,
} from "lucide-react";
import StudySessionForm from "./components/StudySessionForm";
import StudySessionList from "./components/StudySessionList";
import Dashboard from "./components/Dashboard";
import Recommendations from "./components/Recommendations";
import Quiz from "./components/Quiz";
import Toast from "./components/Toast";
import AuthPage from "./components/AuthPage";

function App() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sessions, setSessions] = useState([]);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  useEffect(() => {
    const saved = localStorage.getItem("currentUser");
    if (saved) {
      const parsedUser = JSON.parse(saved);
      setUser(parsedUser);

      const savedSessions = localStorage.getItem(`studySessions_${parsedUser.id}`);
      setSessions(savedSessions ? JSON.parse(savedSessions) : []);
    }
    setLoadingUser(false);
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`studySessions_${user.id}`, JSON.stringify(sessions));
    }
  }, [sessions, user]);

  const showToast = (message, type = "success") =>
    setToast({ show: true, message, type });

  const handleLogin = (userData) => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const existingUser = users.find(
      (u) => u.username === userData.username && u.password === userData.password
    );

    if (existingUser) {
      setUser(existingUser);
      localStorage.setItem("currentUser", JSON.stringify(existingUser));

      const savedSessions = localStorage.getItem(`studySessions_${existingUser.id}`);
      setSessions(savedSessions ? JSON.parse(savedSessions) : []);

      showToast(`Welcome back, ${existingUser.username}!`);
    } else {
      showToast("Invalid username or password", "error");
    }
  };

  const handleSignup = (userData) => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    if (users.find((u) => u.username === userData.username)) {
      showToast("Username already exists", "error");
      return;
    }

    const newUser = { ...userData, id: Date.now() };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", JSON.stringify(newUser));
    setUser(newUser);
    setSessions([]);
    showToast(`Welcome, ${newUser.username}!`);
  };

  const handleLogout = () => {
    if (window.confirm("Log out?")) {
      localStorage.removeItem("currentUser");
      setUser(null);
      setSessions([]);
      showToast("Logged out");
    }
  };

  const handleFeatureAccess = () => {
    if (!user) {
      showToast("Login to use this feature", "error");
      return false;
    }
    return true;
  };

  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "tracker", label: "Sessions", icon: BookOpen },
    { id: "recommendations", label: "Insights", icon: Lightbulb },
    { id: "quiz", label: "Practice", icon: FileQuestion },
  ];

  if (loadingUser) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <AuthPage onLogin={handleLogin} onSignup={handleSignup} />;

  return (
    <div className="min-h-screen flex bg-gray-50">
  {/* Sidebar */}
  <aside className="w-64 h-screen fixed flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
    <div className="p-6 flex items-center gap-3">
      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
        <BookOpen className="w-6 h-6 text-white" />
      </div>
      <div>
        <h1 className="text-lg font-bold text-gray-900">AI Study Tracker</h1>
        <p className="text-sm text-gray-500">AI-Powered Learning</p>
      </div>
    </div>

    <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-gray-700 hover:bg-gray-100 transition-all ${
              activeTab === tab.id ? "bg-blue-600 text-white" : ""
            }`}
          >
            <Icon className="w-5 h-5" />
            {tab.label}
          </button>
        );
      })}
    </nav>

    <div className="p-6 border-t border-gray-200">
      <div className="text-sm text-gray-600">Total Sessions: {sessions.length}</div>
      <div className="text-sm text-gray-600">Time Studied: {totalHours}h</div>
      <button
        onClick={handleLogout}
        className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all"
      >
        Logout
      </button>
    </div>
  </aside>

  {/* Main content */}
  <main className="flex-1 p-8 overflow-auto ml-64">
    {activeTab === "dashboard" && <Dashboard sessions={sessions} />}
    {activeTab === "tracker" && (
      <div className="space-y-6">
        <StudySessionForm
          onAddSession={(s) => {
            if (!handleFeatureAccess()) return;
            setSessions([...sessions, s]);
            showToast("Session added!");
          }}
          isLoggedIn={!!user}  // Pass login state
          showToast={showToast}
        />
        <StudySessionList
          sessions={sessions}
          onEditSession={(u) => {
            if (!handleFeatureAccess()) return;
            setSessions(sessions.map((s) => (s.id === u.id ? u : s)));
            showToast("Updated!");
          }}
          onDeleteSession={(id) => {
            if (!handleFeatureAccess()) return;
            if (window.confirm("Delete?")) {
              setSessions(sessions.filter((s) => s.id !== id));
              showToast("Deleted!");
            }
          }}
        />
      </div>
    )}
    {activeTab === "recommendations" && <Recommendations sessions={sessions} />}
    {activeTab === "quiz" && <Quiz sessions={sessions} />}
  </main>

  {/* Toast */}
  <Toast
    message={toast.message}
    type={toast.type}
    show={toast.show}
    onClose={() => setToast({ ...toast, show: false })}
  />
</div>

  );
}

export default App;
