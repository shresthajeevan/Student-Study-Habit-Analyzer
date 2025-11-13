import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Quiz from "../models/Quiz.js";
import QuizResult from "../models/QuizResult.js";
import Upload from "../models/Upload.js";
import { generateQuizFromText, generateQuizFromImage } from "../services/geminiService.js";

// Fix PDF-parse import for ESM
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Please login to continue" });
  }
  next();
};

// PDF parsing helper
const parsePDF = async (pdfBuffer) => {
  try {
    const data = await pdfParse(pdfBuffer);
    if (!data?.text || data.text.trim().length === 0) {
      throw new Error("PDF appears empty or has no extractable text");
    }
    return data.text;
  } catch (err) {
    console.error("Error parsing PDF:", err);
    throw new Error("Failed to parse PDF: " + err.message);
  }
};

// ================================
// POST - Generate quiz from uploaded file
// ================================
router.post("/generate", requireAuth, async (req, res) => {
  try {
    const { uploadId, subject, difficulty } = req.body;

    if (!uploadId || !subject) {
      return res.status(400).json({ message: "Upload ID and subject are required" });
    }

    const upload = await Upload.findById(uploadId);
    if (!upload) {
      return res.status(404).json({ message: "Upload not found" });
    }

    if (upload.userId.toString() !== req.session.userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const existingQuiz = await Quiz.findOne({ uploadId, userId: req.session.userId });
    if (existingQuiz) {
      return res.status(400).json({ 
        message: "Quiz already exists for this upload",
        quizId: existingQuiz._id
      });
    }

    const filePath = path.join(__dirname, "..", upload.path);
    let questions;

    if (upload.fileType === "image") {
      questions = await generateQuizFromImage(filePath, subject, difficulty || "medium");
    } else if (upload.fileType === "pdf") {
      const pdfBuffer = fs.readFileSync(filePath);
      const content = await parsePDF(pdfBuffer);
      questions = await generateQuizFromText(content, subject, difficulty || "medium");
    } else if (upload.fileType === "document") {
      if (upload.mimetype === "text/plain" || upload.mimetype === "text/markdown") {
        const content = fs.readFileSync(filePath, "utf-8");
        questions = await generateQuizFromText(content, subject, difficulty || "medium");
      } else {
        return res.status(400).json({ message: "Unsupported document type" });
      }
    } else {
      return res.status(400).json({ message: "Unsupported file type for quiz generation" });
    }

    const quiz = await Quiz.create({
      userId: req.session.userId,
      uploadId,
      subject: subject.trim(),
      title: `${subject} Quiz - ${new Date().toLocaleDateString()}`,
      questions,
      difficulty: difficulty || "medium",
      totalQuestions: questions.length
    });

    res.status(201).json({
      message: "Quiz generated successfully",
      quiz: {
        id: quiz._id.toString(),
        _id: quiz._id,
        subject: quiz.subject,
        title: quiz.title,
        totalQuestions: quiz.totalQuestions,
        difficulty: quiz.difficulty,
        createdAt: quiz.createdAt
      }
    });
  } catch (err) {
    console.error("Error generating quiz:", err);
    res.status(500).json({ message: err.message });
  }
});

// ================================
// GET - Get all quizzes for user
// ================================
router.get("/", requireAuth, async (req, res) => {
  try {
    const { subject } = req.query;

    const filter = { userId: req.session.userId };
    if (subject) filter.subject = subject;

    const quizzes = await Quiz.find(filter).sort({ createdAt: -1 }).select("-questions");

    const quizzesWithResults = await Promise.all(
      quizzes.map(async (quiz) => {
        const result = await QuizResult.findOne({ quizId: quiz._id, userId: req.session.userId })
          .sort({ completedAt: -1 });

        return {
          id: quiz._id.toString(),
          _id: quiz._id,
          subject: quiz.subject,
          title: quiz.title,
          totalQuestions: quiz.totalQuestions,
          difficulty: quiz.difficulty,
          createdAt: quiz.createdAt,
          lastResult: result ? {
            score: result.score,
            percentage: result.percentage,
            completedAt: result.completedAt
          } : null
        };
      })
    );

    res.json(quizzesWithResults);
  } catch (err) {
    console.error("Error fetching quizzes:", err);
    res.status(500).json({ message: err.message });
  }
});

// ================================
// GET - Get quiz by ID (with questions)
// ================================
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    if (quiz.userId.toString() !== req.session.userId.toString()) return res.status(403).json({ message: "Not authorized" });

    res.json({
      id: quiz._id.toString(),
      _id: quiz._id,
      subject: quiz.subject,
      title: quiz.title,
      totalQuestions: quiz.totalQuestions,
      difficulty: quiz.difficulty,
      questions: quiz.questions,
      createdAt: quiz.createdAt
    });
  } catch (err) {
    console.error("Error fetching quiz:", err);
    res.status(500).json({ message: err.message });
  }
});

// ================================
// POST - Submit quiz answers
// ================================
router.post("/:id/submit", requireAuth, async (req, res) => {
  try {
    const { answers, totalTimeTaken } = req.body;
    if (!answers || !Array.isArray(answers)) return res.status(400).json({ message: "Answers are required" });

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    if (quiz.userId.toString() !== req.session.userId.toString()) return res.status(403).json({ message: "Not authorized" });

    let score = 0;
    const processedAnswers = answers.map((answer, index) => {
      const isCorrect = answer.selectedAnswer === quiz.questions[index].correctAnswer;
      if (isCorrect) score++;
      return {
        questionIndex: index,
        selectedAnswer: answer.selectedAnswer,
        isCorrect,
        timeTaken: answer.timeTaken || 0
      };
    });

    const percentage = Math.round((score / quiz.totalQuestions) * 100);

    const result = await QuizResult.create({
      userId: req.session.userId,
      quizId: quiz._id,
      score,
      totalQuestions: quiz.totalQuestions,
      percentage,
      answers: processedAnswers,
      totalTimeTaken: totalTimeTaken || 0
    });

    res.status(201).json({
      message: "Quiz submitted successfully",
      result: {
        id: result._id.toString(),
        score,
        totalQuestions: quiz.totalQuestions,
        percentage,
        answers: processedAnswers,
        totalTimeTaken: result.totalTimeTaken,
        completedAt: result.completedAt
      }
    });
  } catch (err) {
    console.error("Error submitting quiz:", err);
    res.status(500).json({ message: err.message });
  }
});

// ================================
// GET - Quiz results history
// ================================
router.get("/:id/results", requireAuth, async (req, res) => {
  try {
    const results = await QuizResult.find({ quizId: req.params.id, userId: req.session.userId })
      .sort({ completedAt: -1 });

    res.json(results.map(r => ({
      id: r._id.toString(),
      score: r.score,
      totalQuestions: r.totalQuestions,
      percentage: r.percentage,
      totalTimeTaken: r.totalTimeTaken,
      completedAt: r.completedAt
    })));
  } catch (err) {
    console.error("Error fetching quiz results:", err);
    res.status(500).json({ message: err.message });
  }
});

// ================================
// DELETE - Delete quiz
// ================================
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    if (quiz.userId.toString() !== req.session.userId.toString()) return res.status(403).json({ message: "Not authorized" });

    await QuizResult.deleteMany({ quizId: quiz._id });
    await Quiz.findByIdAndDelete(req.params.id);

    res.json({ message: "Quiz deleted successfully" });
  } catch (err) {
    console.error("Error deleting quiz:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
