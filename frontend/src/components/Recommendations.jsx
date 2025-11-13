import { useState, useEffect } from "react";
import { Sparkles, Clock, Brain, Target, CheckCircle2, Lightbulb, TrendingUp, BookOpen, Zap, AlertCircle } from 'lucide-react';
import { getRecommendations } from "../api/recommendations";

function Recommendations({ sessions, showToast }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [studySummary, setStudySummary] = useState(null);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const data = await getRecommendations();
      setRecommendations(data.recommendations || []);
      setHasData(data.dataAvailable || false);
      setStudySummary(data.studySummary || null);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      showToast?.(err.message || "Failed to generate recommendations", "error");
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (category) => {
    switch (category) {
      case 'weak_subjects': return Target;
      case 'time_management': return Clock;
      case 'consistency': return CheckCircle2;
      case 'goal_setting': return TrendingUp;
      case 'learning_technique': return Brain;
      case 'motivation': return Zap;
      case 'getting_started': return BookOpen;
      default: return Lightbulb;
    }
  };

  const getColorScheme = (priority) => {
    switch (priority) {
      case 'high':
        return {
          color: 'from-red-50 to-orange-50',
          iconBg: 'bg-gradient-to-br from-red-500 to-orange-500',
          badge: 'bg-red-500',
        };
      case 'medium':
        return {
          color: 'from-blue-50 to-cyan-50',
          iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
          badge: 'bg-blue-500',
        };
      case 'low':
        return {
          color: 'from-purple-50 to-pink-50',
          iconBg: 'bg-gradient-to-br from-purple-500 to-pink-500',
          badge: 'bg-purple-500',
        };
      default:
        return {
          color: 'from-green-50 to-emerald-50',
          iconBg: 'bg-gradient-to-br from-green-500 to-emerald-500',
          badge: 'bg-green-500',
        };
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 rounded-xl p-6 border border-gray-200 transition-all">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#111827]">AI Study Recommendations</h2>
              <p className="text-sm text-[#4b5563]">Personalized insights powered by AI</p>
            </div>
          </div>
          <button
            onClick={fetchRecommendations}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full text-sm font-semibold flex items-center gap-2 transition disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {loading ? "Generating..." : "Generate AI Insights"}
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-medium">Analyzing your study patterns...</p>
            <p className="text-gray-500 text-sm mt-2">This may take a few seconds</p>
          </div>
        )}

        {/* Study Summary */}
        {!loading && studySummary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">{studySummary.totalSessions}</div>
              <div className="text-sm text-blue-600">Total Sessions</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <div className="text-2xl font-bold text-green-700">{studySummary.totalHours}h</div>
              <div className="text-sm text-green-600">Hours Studied</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
              <div className="text-2xl font-bold text-purple-700">{studySummary.totalQuizzes}</div>
              <div className="text-sm text-purple-600">Quizzes Taken</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
              <div className="text-2xl font-bold text-orange-700">{studySummary.subjects}</div>
              <div className="text-sm text-orange-600">Subjects</div>
            </div>
          </div>
        )}

        {/* Recommendations List */}
        {!loading && recommendations.length > 0 && (
          <div className="space-y-4">
            {recommendations.map((rec, index) => {
              const Icon = getIcon(rec.category);
              const colors = getColorScheme(rec.priority);
              return (
                <div
                  key={index}
                  className={`bg-gradient-to-br ${colors.color} border-2 border-white rounded-xl p-5 transition-all hover:shadow-md`}
                >
                  <div className="flex items-start justify-between mb-3 flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${colors.iconBg} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-[#111827]">{rec.title}</h3>
                    </div>
                    <span className={`px-3 py-1 ${colors.badge} text-white rounded-full text-xs font-bold`}>
                      {rec.priority?.toUpperCase() || 'INFO'}
                    </span>
                  </div>
                  <p className="text-[#374151] ml-13">{rec.description}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* No Data State */}
        {!loading && !hasData && recommendations.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-semibold mb-2">Not enough data yet</p>
            <p className="text-gray-500 text-sm mb-4">
              Start logging study sessions and taking quizzes to get personalized AI recommendations!
            </p>
            <button
              onClick={fetchRecommendations}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold hover:from-purple-600 hover:to-pink-600 transition"
            >
              Try Generating Insights
            </button>
          </div>
        )}

        {/* Empty Recommendations (with data) */}
        {!loading && hasData && recommendations.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="w-16 h-16 text-purple-300 mx-auto mb-4" />
            <p className="text-gray-600 font-semibold mb-2">You're doing great!</p>
            <p className="text-gray-500 text-sm">
              Keep up the good work. Check back later for new recommendations.
            </p>
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <Lightbulb className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900">Quick Tips</h3>
        </div>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Log study sessions regularly for more accurate recommendations</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Take quizzes to identify weak areas and track improvement</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Set realistic study goals to stay motivated</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Review recommendations weekly to adjust your study strategy</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Recommendations;