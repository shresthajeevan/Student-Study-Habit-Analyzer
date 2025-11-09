import { useState } from 'react';
import { FileQuestion, Sparkles, BookOpen, CheckCircle2, XCircle, Send, RotateCcw, Trophy, Lightbulb } from 'lucide-react';

function Quiz({ sessions }) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const questions = [
    {
      id: 1,
      subject: 'Mathematics',
      question: 'What is the derivative of f(x) = x²?',
      options: ['2x', 'x', '2x²', 'x²'],
      correctAnswer: 0,
      explanation: 'The derivative of x² is 2x using the power rule.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 2,
      subject: 'Physics',
      question: 'What is the formula for kinetic energy?',
      options: ['mv', '½mv²', 'mgh', 'F=ma'],
      correctAnswer: 1,
      explanation: 'Kinetic energy is calculated as ½mv², where m is mass and v is velocity.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 3,
      subject: 'History',
      question: 'In which year did World War II end?',
      options: ['1943', '1944', '1945', '1946'],
      correctAnswer: 2,
      explanation: 'World War II ended in 1945 with the surrender of Japan.',
      color: 'from-orange-500 to-red-500',
    },
    {
      id: 4,
      subject: 'General',
      question: 'What is the recommended study technique using spaced repetition?',
      options: [
        'Study everything in one day',
        'Review material at increasing intervals',
        'Only study when you feel like it',
        'Study for 12 hours straight',
      ],
      correctAnswer: 1,
      explanation: 'Spaced repetition involves reviewing material at increasing intervals to improve long-term retention.',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  const calculateScore = () => {
    const correct = questions.filter(q => selectedAnswers[q.id] === q.correctAnswer).length;
    return {
      correct,
      total: questions.length,
      percentage: Math.round((correct / questions.length) * 100),
    };
  };

  const score = showResults ? calculateScore() : null;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 rounded-xl p-6 border border-gray-200 transition-all">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <FileQuestion className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#111827]">AI-Generated Quiz</h2>
              <p className="text-sm text-[#4b5563]">Test your knowledge and improve</p>
            </div>
          </div>
          <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI Powered
          </span>
        </div>

        <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 p-4 rounded-lg border-2 border-purple-200 mb-6">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[#374151] font-medium">
                Test your knowledge with AI-generated quizzes based on your study sessions.
              </p>
              <p className="text-sm text-[#4b5563] mt-2">
                * AI integration coming soon - currently showing placeholder questions
              </p>
            </div>
          </div>
        </div>

        {!showResults ? (
          <div className="space-y-5">
            {questions.map((q) => (
              <div key={q.id} className="bg-white rounded-xl p-5 border-2 border-gray-100 transition-all">
                <div className="flex items-center gap-2 mb-4">
                  <div className={`px-3 py-1 bg-gradient-to-r ${q.color} text-white rounded-lg text-xs font-bold flex items-center gap-1`}>
                    <BookOpen className="w-3 h-3" />
                    {q.subject}
                  </div>
                  <span className="text-sm text-[#4b5563] font-medium">Question {q.id}</span>
                </div>
                <h3 className="text-lg font-bold text-[#111827] mb-4 flex items-start gap-2">
                  <span className="text-blue-500">Q{q.id}:</span>
                  <span>{q.question}</span>
                </h3>
                <div className="space-y-2">
                  {q.options.map((option, index) => (
                    <label
                      key={index}
                      className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedAnswers[q.id] === index
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        checked={selectedAnswers[q.id] === index}
                        onChange={() => setSelectedAnswers({ ...selectedAnswers, [q.id]: index })}
                        className="mr-3 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-[#111827] font-medium">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowResults(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
                Submit Quiz
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Score Display */}
            <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl p-8 text-white text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-3">Quiz Results</h3>
              <p className="text-6xl font-bold mb-2">{score.percentage}%</p>
              <p className="text-lg text-white/90">
                You got <span className="font-bold">{score.correct}</span> out of <span className="font-bold">{score.total}</span> correct
              </p>
            </div>

            {/* Results */}
            {questions.map((q) => {
              const userAnswer = selectedAnswers[q.id];
              const isCorrect = userAnswer === q.correctAnswer;

              return (
                <div
                  key={q.id}
                  className={`border-2 rounded-xl p-5 ${
                    isCorrect ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300' : 'bg-gradient-to-br from-red-50 to-orange-50 border-red-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <div className={`px-3 py-1 bg-gradient-to-r ${q.color} text-white rounded-lg text-xs font-bold`}>
                      {q.subject}
                    </div>
                    {isCorrect ? (
                      <span className="px-3 py-1 bg-green-500 text-white rounded-lg text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Correct
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-bold flex items-center gap-1">
                        <XCircle className="w-4 h-4" />
                        Incorrect
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-[#111827] mb-3">{q.question}</h3>
                  <div className="space-y-2 mb-4">
                    {q.options.map((option, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border-2 font-medium ${
                          index === q.correctAnswer
                            ? 'bg-green-100 border-green-400 text-green-900'
                            : index === userAnswer && !isCorrect
                            ? 'bg-red-100 border-red-400 text-red-900'
                            : 'bg-white border-gray-200 text-gray-600'
                        }`}
                      >
                        {index === q.correctAnswer && '✓ '}
                        {option}
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-white/80 backdrop-blur rounded-lg border-2 border-blue-200 flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-blue-700 mb-1">Explanation:</p>
                      <p className="text-sm text-[#374151]">{q.explanation}</p>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="flex justify-end">
              <button
                onClick={() => { setSelectedAnswers({}); setShowResults(false); }}
                className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Take Another Quiz
              </button>
            </div>
          </div>
        )}

        {/* Future Integration Note */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-dashed border-purple-300">
          <p className="text-sm text-[#374151] text-center">
            <strong className="text-purple-600">Future Enhancement:</strong> This section will be connected to an AI service
            that generates personalized quiz questions based on your study sessions, subjects, and
            learning progress.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Quiz;
