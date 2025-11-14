import { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';
import { Clock, Flame, BookOpen, TrendingUp, BarChart3, PieChart as PieChartIcon, Target, Trophy } from 'lucide-react';

function Dashboard({ sessions }) {
  const [quizResults, setQuizResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch quiz results for performance analysis
  useEffect(() => {
    const fetchQuizResults = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/quizzes', {
          method: 'GET',
          credentials: 'include',
        });
        if (res.ok) {
          const quizzes = await res.json();
          setQuizResults(quizzes.filter(q => q.lastResult)); // Only quizzes with results
        }
      } catch (err) {
        console.error('Error fetching quiz results:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizResults();
  }, []);

  // Calculate time per subject
  const subjectTimeMap = {};
  sessions.forEach(s => {
    subjectTimeMap[s.subject] = (subjectTimeMap[s.subject] || 0) + s.duration;
  });

  const subjectTimeData = Object.entries(subjectTimeMap)
    .map(([subject, minutes]) => ({ subject, hours: (minutes / 60).toFixed(1), minutes }))
    .sort((a, b) => b.minutes - a.minutes);

  // Calculate subject performance (combining time + quiz scores)
  const calculateSubjectPerformance = () => {
    const performanceMap = {};

    // Add study time data
    Object.entries(subjectTimeMap).forEach(([subject, minutes]) => {
      performanceMap[subject] = {
        subject,
        studyTime: minutes,
        studyHours: (minutes / 60).toFixed(1),
        quizCount: 0,
        averageScore: 0,
        totalScore: 0,
        performance: 0
      };
    });

    // Add quiz performance data
    quizResults.forEach(quiz => {
      const subject = quiz.subject;
      if (!performanceMap[subject]) {
        performanceMap[subject] = {
          subject,
          studyTime: 0,
          studyHours: '0.0',
          quizCount: 0,
          averageScore: 0,
          totalScore: 0,
          performance: 0
        };
      }

      performanceMap[subject].quizCount += 1;
      performanceMap[subject].totalScore += quiz.lastResult.percentage;
    });

    // Calculate average scores and overall performance
    Object.values(performanceMap).forEach(data => {
      if (data.quizCount > 0) {
        data.averageScore = Math.round(data.totalScore / data.quizCount);
      }

      // Performance score (weighted: 60% quiz score + 40% study time presence)
      const quizWeight = data.quizCount > 0 ? data.averageScore * 0.6 : 0;
      const timeWeight = data.studyTime > 0 ? 40 : 0; // Has study time = +40 points
      data.performance = quizWeight + timeWeight;
    });

    return Object.values(performanceMap);
  };

  const subjectPerformance = calculateSubjectPerformance();

  // Strong subjects: High quiz scores (>70%) OR high study time with decent scores
  const strongSubjects = subjectPerformance
    .filter(s => (s.averageScore >= 70 || (s.studyTime > 0 && s.averageScore >= 60)))
    .sort((a, b) => b.performance - a.performance)
    .slice(0, 3)
    .map(s => ({
      subject: s.subject,
      hours: s.studyHours,
      score: s.averageScore || 'N/A',
      quizzes: s.quizCount
    }));

  // Weak subjects: Low quiz scores (<60%) OR subjects with study time but no quizzes
  const weakSubjects = subjectPerformance
    .filter(s => {
      // Has quiz and low score
      if (s.quizCount > 0 && s.averageScore < 60) return true;
      // Has study time but never took quiz
      if (s.studyTime > 0 && s.quizCount === 0) return true;
      // Low study time (bottom performers)
      return s.studyTime > 0 && s.studyTime < 1800; // Less than 30 hours
    })
    .sort((a, b) => a.performance - b.performance)
    .slice(0, 3)
    .map(s => ({
      subject: s.subject,
      hours: s.studyHours,
      score: s.averageScore || 'N/A',
      quizzes: s.quizCount,
      reason: s.quizCount === 0 ? 'No quiz taken' : s.averageScore < 60 ? 'Low score' : 'Needs more practice'
    }));

  // Calculate streak
  const calculateStreak = () => {
    if (sessions.length === 0) return 0;
    const dates = [...new Set(sessions.map(s => s.date))].sort().reverse();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (dates[0] !== today && dates[0] !== yesterday) return 0;

    let streak = 1;
    for (let i = 1; i < dates.length; i++) {
      const diff = Math.floor((new Date(dates[i - 1]) - new Date(dates[i])) / 86400000);
      if (diff === 1) streak++;
      else break;
    }
    return streak;
  };

  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const streak = calculateStreak();

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#f43f5e'];

  // Weekly data
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    const minutes = sessions.filter(s => s.date === dateStr).reduce((sum, s) => sum + s.duration, 0);
    return { date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), minutes };
  });

  const StatCard = ({ title, value, subtitle, icon: Icon, color, gradient }) => (
    <div className={`bg-gradient-to-br ${gradient} rounded-xl p-6 border border-gray-200`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-600 uppercase">{title}</h3>
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-white`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <p className={`text-4xl font-bold mb-1 ${color.replace('bg-', 'text-')}`}>{value}</p>
      <p className="text-sm font-medium text-gray-600">{subtitle}</p>
    </div>
  );

  const ChartCard = ({ title, subtitle, icon: Icon, children }) => (
    <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-xl p-6 border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-[#3b82f6] to-[#2563eb] rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#111827]">{title}</h3>
          <p className="text-xs text-[#4b5563]">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );

  const SubjectList = ({ subjects, color, icon: Icon, title, subtitle, showScore }) => (
    <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-xl p-6 border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center text-white`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#111827]">{title}</h3>
          <p className="text-xs text-[#4b5563]">{subtitle}</p>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : subjects.length > 0 ? (
        <ul className="space-y-2">
          {subjects.map((subject, i) => (
            <li key={subject.subject} className="flex items-center justify-between p-3 bg-white/80 rounded-lg border border-gray-100">
              <div className="flex items-center gap-3 flex-1">
                <span className={`w-7 h-7 ${color} text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-[#111827] block truncate">{subject.subject}</span>
                  {showScore && (
                    <div className="flex gap-2 text-xs text-gray-600 mt-0.5">
                      {subject.score !== 'N/A' && <span>Score: {subject.score}%</span>}
                      {subject.quizzes > 0 && <span>• {subject.quizzes} quiz{subject.quizzes > 1 ? 'zes' : ''}</span>}
                      {subject.reason && <span className="text-orange-600">• {subject.reason}</span>}
                    </div>
                  )}
                </div>
              </div>
              <span className={`px-2.5 py-1 ${color.replace('bg-', 'bg-').replace('-500', '-100')} ${color.replace('bg-', 'text-').replace('-500', '-700')} rounded-full text-sm font-semibold flex-shrink-0 ml-2`}>
                {subject.hours}h
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[#4b5563] text-center py-4 text-sm">No data yet. {showScore ? 'Take some quizzes!' : 'Start studying!'}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Study Time"
          value={totalHours}
          subtitle={`hours (${totalMinutes} min)`}
          icon={Clock}
          color="bg-[#3b82f6]"
          gradient="from-white to-blue-50/30"
        />
        <StatCard
          title="Current Streak"
          value={streak}
          subtitle="consecutive days"
          icon={Flame}
          color="bg-orange-500"
          gradient="from-white to-orange-50/30"
        />
        <StatCard
          title="Total Sessions"
          value={sessions.length}
          subtitle="study sessions logged"
          icon={BookOpen}
          color="bg-purple-500"
          gradient="from-white to-purple-50/30"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Time per Subject" subtitle="Visual breakdown" icon={BarChart3}>
          {subjectTimeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="subject" stroke="#525252" />
                <YAxis stroke="#525252" />
                <Tooltip />
                <Bar dataKey="hours" name="Hours">
                  {subjectTimeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-[#4b5563] text-center py-12 text-sm">No data available</p>
          )}
        </ChartCard>

        <ChartCard title="Subject Distribution" subtitle="Percentage breakdown" icon={PieChartIcon}>
          {subjectTimeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={subjectTimeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="minutes"
                  nameKey="subject"
                  labelLine={false}
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    return (
                      <text
                        x={x}
                        y={y}
                        fill="#374151"
                        textAnchor={x > cx ? 'start' : 'end'}
                        dominantBaseline="central"
                        fontSize={12}
                        fontWeight="600"
                      >
                        {`${subjectTimeData[index].subject} ${(percent * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                >
                  {subjectTimeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#fff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${(value / 60).toFixed(1)}h`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-[#4b5563] text-center py-12 text-sm">No data available</p>
          )}
        </ChartCard>
      </div>

      {/* Weekly Chart */}
      <ChartCard title="Last 7 Days" subtitle="Weekly study pattern" icon={TrendingUp}>
        {weeklyData.some(d => d.minutes > 0) ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="date" stroke="#525252" />
              <YAxis stroke="#525252" />
              <Tooltip />
              <Line type="monotone" dataKey="minutes" stroke="url(#lineGradient)" strokeWidth={3} dot={{ stroke: '#fff', strokeWidth: 2, r: 5 }} name="Minutes" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-[#4b5563] text-center py-12 text-sm">No data for last 7 days</p>
        )}
      </ChartCard>

      {/* Strong & Weak Subjects - IMPROVED */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SubjectList
          subjects={strongSubjects}
          color="bg-green-500"
          icon={Trophy}
          title="Strong Subjects"
          subtitle="High performers (score ≥70% or consistent study)"
          showScore={true}
        />
        <SubjectList
          subjects={weakSubjects}
          color="bg-red-500"
          icon={Target}
          title="Areas for Improvement"
          subtitle="Low scores (<60%) or untested subjects"
          showScore={true}
        />
      </div>
    </div>
  );
}

export default Dashboard;