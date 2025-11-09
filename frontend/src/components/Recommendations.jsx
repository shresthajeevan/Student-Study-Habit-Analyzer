import { Sparkles, Clock, Brain, Target, CheckCircle2, Lightbulb } from 'lucide-react';

function Recommendations({ sessions }) {
  const recommendations = [
    {
      id: 1,
      type: 'schedule',
      title: 'Optimize Your Study Schedule',
      description: 'Based on your study patterns, consider studying Mathematics in the morning when your focus is highest.',
      priority: 'high',
      color: 'from-red-50 to-orange-50',
      iconBg: 'bg-gradient-to-br from-red-500 to-orange-500',
      badge: 'bg-red-500',
    },
    {
      id: 2,
      type: 'break',
      title: 'Take Regular Breaks',
      description: 'Your study sessions are getting longer. Remember to take 5-10 minute breaks every hour to maintain productivity.',
      priority: 'medium',
      color: 'from-blue-50 to-cyan-50',
      iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      badge: 'bg-blue-500',
    },
    {
      id: 3,
      type: 'subject',
      title: 'Balance Your Subjects',
      description: 'You\'ve been focusing heavily on one subject. Try to distribute your study time more evenly across all subjects.',
      priority: 'medium',
      color: 'from-purple-50 to-pink-50',
      iconBg: 'bg-gradient-to-br from-purple-500 to-pink-500',
      badge: 'bg-purple-500',
    },
    {
      id: 4,
      type: 'consistency',
      title: 'Maintain Consistency',
      description: 'Consistent daily study sessions are more effective than cramming. Aim for at least 30 minutes every day.',
      priority: 'high',
      color: 'from-green-50 to-emerald-50',
      iconBg: 'bg-gradient-to-br from-green-500 to-emerald-500',
      badge: 'bg-green-500',
    },
  ];

  const getIcon = (type) => {
    switch (type) {
      case 'schedule': return Clock;
      case 'break': return Brain;
      case 'subject': return Target;
      case 'consistency': return CheckCircle2;
      default: return Lightbulb;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 rounded-xl p-6 border border-gray-200 transition-all">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#111827]">AI Study Recommendations</h2>
              <p className="text-sm text-[#4b5563]">Personalized insights for better learning</p>
            </div>
          </div>
          <span className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI Powered
          </span>
        </div>

        <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 p-4 rounded-lg border-2 border-purple-200 mb-6">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[#374151] font-medium">
                Personalized study recommendations based on your learning patterns and performance.
              </p>
              <p className="text-sm text-[#4b5563] mt-2">
                * AI integration coming soon - currently showing placeholder recommendations
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {recommendations.map((rec) => {
            const Icon = getIcon(rec.type);
            return (
              <div
                key={rec.id}
                className={`bg-gradient-to-br ${rec.color} border-2 border-white rounded-xl p-5 transition-all`}
              >
                <div className="flex items-start justify-between mb-3 flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${rec.iconBg} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-[#111827]">{rec.title}</h3>
                  </div>
                  <span className={`px-3 py-1 ${rec.badge} text-white rounded-full text-xs font-bold`}>
                    {rec.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-[#374151] mb-3 ml-13">{rec.description}</p>
                <div className="flex items-center text-sm text-[#4b5563] bg-white/80 backdrop-blur px-3 py-1.5 rounded-lg w-fit border border-gray-200 ml-13">
                  <Sparkles className="w-4 h-4 mr-2 text-purple-500" />
                  <span className="font-medium">AI Generated Recommendation</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-dashed border-purple-300">
          <p className="text-sm text-[#374151] text-center">
            <strong className="text-purple-600">Future Enhancement:</strong> This section will be connected to an AI service
            that analyzes your study patterns, identifies learning gaps, and provides personalized
            recommendations for optimal study schedules, subject prioritization, and learning strategies.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Recommendations;
