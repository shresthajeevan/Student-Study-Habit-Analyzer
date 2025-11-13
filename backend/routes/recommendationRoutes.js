import express from "express";
import Session from "../models/Session.js";
import QuizResult from "../models/QuizResult.js";
import Quiz from "../models/Quiz.js";
import Goal from "../models/Goal.js";
import { generateRecommendations } from "../services/geminiService.js";

const router = express.Router();

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Please login to continue" });
  }
  next();
};

// GET - Generate AI recommendations
router.get("/generate", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;

    // Fetch study sessions
    const sessions = await Session.find({ userId })
      .sort({ startTime: -1 })
      .limit(50); // Last 50 sessions

    // Calculate study statistics
    const subjectStats = {};
    let totalMinutes = 0;

    sessions.forEach(session => {
      const duration = Math.round((new Date(session.endTime) - new Date(session.startTime)) / 60000);
      totalMinutes += duration;

      if (!subjectStats[session.subject]) {
        subjectStats[session.subject] = {
          subject: session.subject,
          totalMinutes: 0,
          sessionCount: 0
        };
      }
      subjectStats[session.subject].totalMinutes += duration;
      subjectStats[session.subject].sessionCount += 1;
    });

    const subjects = Object.values(subjectStats).map(s => ({
      ...s,
      totalHours: (s.totalMinutes / 60).toFixed(1)
    }));

    // Fetch quiz results
    const quizResults = await QuizResult.find({ userId })
      .populate('quizId', 'subject title')
      .sort({ completedAt: -1 })
      .limit(20);

    const quizStats = {};
    quizResults.forEach(result => {
      const subject = result.quizId?.subject || 'Unknown';
      if (!quizStats[subject]) {
        quizStats[subject] = {
          subject,
          totalQuizzes: 0,
          averageScore: 0,
          scores: []
        };
      }
      quizStats[subject].totalQuizzes += 1;
      quizStats[subject].scores.push(result.percentage);
    });

    Object.keys(quizStats).forEach(subject => {
      const scores = quizStats[subject].scores;
      quizStats[subject].averageScore = Math.round(
        scores.reduce((sum, s) => sum + s, 0) / scores.length
      );
      delete quizStats[subject].scores; // Remove raw scores from summary
    });

    // Fetch goals
    const goals = await Goal.find({ userId });

    // Prepare data for AI
    const studyData = {
      sessions: {
        total: sessions.length,
        totalHours: (totalMinutes / 60).toFixed(1),
        subjects: subjects,
        recentActivity: sessions.slice(0, 10).map(s => ({
          subject: s.subject,
          date: s.startTime,
          duration: Math.round((new Date(s.endTime) - new Date(s.startTime)) / 60000)
        }))
      },
      quizResults: {
        total: quizResults.length,
        bySubject: Object.values(quizStats),
        recentScores: quizResults.slice(0, 5).map(r => ({
          subject: r.quizId?.subject || 'Unknown',
          score: r.score,
          total: r.totalQuestions,
          percentage: r.percentage,
          date: r.completedAt
        }))
      },
      goals: goals.map(g => ({
        subject: g.subject,
        targetHours: g.target_hours,
        period: g.period
      }))
    };

    // Check if user has enough data
    if (sessions.length === 0 && quizResults.length === 0) {
      return res.json({
        recommendations: [
          {
            category: "getting_started",
            title: "Start Your Learning Journey",
            description: "Begin by logging your first study session or taking a quiz to get personalized recommendations.",
            priority: "high"
          },
          {
            category: "goal_setting",
            title: "Set Your First Goal",
            description: "Define clear study goals to help track your progress and stay motivated.",
            priority: "high"
          }
        ],
        dataAvailable: false
      });
    }

    // Generate recommendations using AI
    const recommendations = await generateRecommendations(studyData);

    res.json({
      recommendations,
      dataAvailable: true,
      studySummary: {
        totalSessions: sessions.length,
        totalHours: (totalMinutes / 60).toFixed(1),
        totalQuizzes: quizResults.length,
        subjects: subjects.length
      }
    });
  } catch (err) {
    console.error("Error generating recommendations:", err);
    res.status(500).json({ message: err.message });
  }
});

// GET - Get available subjects from study sessions
router.get("/subjects", requireAuth, async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.session.userId })
      .distinct('subject');

    res.json({ subjects: sessions.sort() });
  } catch (err) {
    console.error("Error fetching subjects:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;