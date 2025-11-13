import { useState, useEffect, useRef } from "react";
import { getAllQuizzes, getQuizById, submitQuiz, deleteQuiz } from "../api/quiz";
import { getAvailableSubjects } from "../api/recommendations";
import { CheckCircle2, XCircle, Trophy, Clock, Target, Trash2, PlayCircle, RefreshCw, Filter } from "lucide-react";

function Quiz({ showToast }) {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [currentAnswers, setCurrentAnswers] = useState([]);
  const [quizResults, setQuizResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [filterSubject, setFilterSubject] = useState("");
  const [takingQuiz, setTakingQuiz] = useState(false);
  const [timeTaken, setTimeTaken] = useState(0);
  const timerRef = useRef(null);

  // Fetch all quizzes (optionally filtered by subject)
  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const data = await getAllQuizzes(filterSubject || null);
      setQuizzes(data);
    } catch (err) {
      console.error(err);
      showToast?.(err.message || "Failed to fetch quizzes", "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch available subjects
  const fetchSubjects = async () => {
    try {
      const data = await getAvailableSubjects();
      setSubjects(data.subjects || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchQuizzes();
    fetchSubjects();
  }, [filterSubject]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Start quiz timer
  const startTimer = () => {
    setTimeTaken(0);
    timerRef.current = setInterval(() => {
      setTimeTaken((prev) => prev + 1);
    }, 1000);
  };

  // Stop quiz timer
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleStartQuiz = async (quizId) => {
    try {
      setLoading(true);
      const data = await getQuizById(quizId);
      setSelectedQuiz(data);
      // Initialize answers array with null values
      setCurrentAnswers(new Array(data.questions.length).fill(null));
      setQuizResults(null);
      setTakingQuiz(true);
      startTimer();
    } catch (err) {
      console.error(err);
      showToast?.(err.message || "Failed to load quiz", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex, answerIndex) => {
    setCurrentAnswers((prev) => {
      const newAnswers = [...prev];
      newAnswers[questionIndex] = answerIndex;
      return newAnswers;
    });
  };

  const handleSubmitQuiz = async () => {
    // Check if all questions are answered
    const unansweredCount = currentAnswers.filter(a => a === null).length;
    if (unansweredCount > 0) {
      if (!window.confirm(`You have ${unansweredCount} unanswered question(s). Submit anyway?`)) {
        return;
      }
    }

    stopTimer();
    try {
      setLoading(true);
      
      // Format answers for backend
      const formattedAnswers = currentAnswers.map((answer, index) => ({
        questionIndex: index,
        selectedAnswer: answer !== null ? answer : -1, // -1 for unanswered
        timeTaken: 0
      }));

      const result = await submitQuiz(selectedQuiz.id, formattedAnswers, timeTaken);
      setQuizResults(result.result);
      setTakingQuiz(false);
      showToast?.(`Quiz completed! Score: ${result.result.score}/${result.result.totalQuestions}`);
      fetchQuizzes(); // refresh available quizzes
    } catch (err) {
      console.error(err);
      showToast?.(err.message || "Failed to submit quiz", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;
    try {
      await deleteQuiz(quizId);
      showToast?.("Quiz deleted successfully");
      fetchQuizzes();
    } catch (err) {
      console.error(err);
      showToast?.(err.message || "Failed to delete quiz", "error");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-xl p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI-Generated Quizzes</h2>
            <p className="text-sm text-gray-600">Test your knowledge with custom quizzes</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="border-2 border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            >
              <option value="">All Subjects</option>
              {subjects.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <button
            onClick={fetchQuizzes}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Quiz List */}
      {!takingQuiz && !quizResults && (
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : quizzes.length === 0 ? (
            <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-semibold mb-2">No quizzes available</p>
              <p className="text-gray-400 text-sm">Upload study notes and generate your first quiz!</p>
            </div>
          ) : (
            quizzes.map((quiz) => (
              <div key={quiz.id} className="bg-white rounded-xl p-5 border border-gray-200 hover:border-blue-300 transition">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-gray-900 text-lg">{quiz.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(quiz.difficulty)}`}>
                        {quiz.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        {quiz.subject}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {quiz.totalQuestions} questions
                      </span>
                    </div>
                    {quiz.lastResult && (
                      <div className="mt-2 text-sm">
                        <span className="text-gray-600">Last score: </span>
                        <span className="font-semibold text-blue-600">{quiz.lastResult.percentage}%</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStartQuiz(quiz.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                    >
                      <PlayCircle className="w-4 h-4" />
                      Take Quiz
                    </button>
                    <button
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete quiz"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Quiz Taking */}
      {takingQuiz && selectedQuiz && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">{selectedQuiz.title}</h2>
            <div className="flex items-center gap-6 text-sm">
              <span className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Subject: {selectedQuiz.subject}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Time: {formatTime(timeTaken)}
              </span>
              <span className="flex items-center gap-2">
                Progress: {currentAnswers.filter(a => a !== null).length}/{selectedQuiz.questions.length}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {selectedQuiz.questions.map((q, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 border-2 border-gray-200">
                <p className="font-semibold text-gray-900 mb-4 text-lg">
                  {idx + 1}. {q.question}
                </p>
                <div className="space-y-2">
                  {q.options.map((opt, optIdx) => (
                    <label
                      key={optIdx}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition ${
                        currentAnswers[idx] === optIdx
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${idx}`}
                        checked={currentAnswers[idx] === optIdx}
                        onChange={() => handleAnswerChange(idx, optIdx)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-gray-800">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSubmitQuiz}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition font-bold disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Quiz"}
            </button>
            <button
              onClick={() => {
                if (window.confirm("Are you sure? Your progress will be lost.")) {
                  stopTimer();
                  setTakingQuiz(false);
                  setSelectedQuiz(null);
                }
              }}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Quiz Results */}
      {quizResults && selectedQuiz && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Quiz Completed!</h2>
            </div>
            <div className="flex items-center gap-6 text-lg">
              <span>Score: <span className="font-bold">{quizResults.score}/{quizResults.totalQuestions}</span></span>
              <span>Percentage: <span className="font-bold">{quizResults.percentage}%</span></span>
              <span>Time: <span className="font-bold">{formatTime(quizResults.totalTimeTaken)}</span></span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xl font-bold text-gray-900">Review Your Answers</h3>
            {selectedQuiz.questions.map((q, idx) => {
              const userAnswer = quizResults.answers[idx];
              const isCorrect = userAnswer?.isCorrect;

              return (
                <div key={idx} className={`p-5 rounded-xl border-2 ${isCorrect ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                  <div className="flex items-start gap-3 mb-3">
                    {isCorrect ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-2">{idx + 1}. {q.question}</p>
                      <p className={`text-sm mb-1 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                        <span className="font-semibold">Your Answer:</span> {userAnswer?.selectedAnswer !== -1 ? q.options[userAnswer?.selectedAnswer] : "Not answered"}
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-gray-700 mb-2">
                          <span className="font-semibold">Correct Answer:</span> {q.options[q.correctAnswer]}
                        </p>
                      )}
                      {q.explanation && (
                        <p className="text-sm text-gray-600 mt-2 italic">
                          <span className="font-semibold">Explanation:</span> {q.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => {
              setQuizResults(null);
              setSelectedQuiz(null);
            }}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-bold"
          >
            Back to Quizzes
          </button>
        </div>
      )}
    </div>
  );
}

export default Quiz;