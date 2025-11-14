import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL_NAME = "gemini-2.5-flash";
const getModel = () => genAI.getGenerativeModel({ model: MODEL_NAME });

// ======================
// Generate quiz from text
// ======================
export const generateQuizFromText = async (content, subject, difficulty = "medium") => {
  try {
    const model = getModel();

    const prompt = `You are an expert teacher creating educational quizzes.
Based on the following study notes about "${subject}":

${content}

Generate exactly 10 multiple-choice questions that test understanding of key concepts.

Requirements:
- Difficulty: ${difficulty}
- Each question must have 4 options
- Include clear explanations for correct answers
- Return ONLY a valid JSON array in this format:
[
  {
    "question": "Question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Why this answer is correct"
  }
]`;

    const result = await model.generateContent(prompt);
    const text = (await result.response).text();

    const cleanText = text.replace(/```json\n?|```\n?/g, '').trim();
    const questions = JSON.parse(cleanText);

    // Validation
    questions.forEach((q, idx) => {
      if (!q.question || !Array.isArray(q.options) || q.options.length !== 4) {
        throw new Error(`Invalid question at index ${idx}`);
      }
      if (typeof q.correctAnswer !== "number" || q.correctAnswer < 0 || q.correctAnswer > 3) {
        throw new Error(`Invalid correctAnswer at index ${idx}`);
      }
    });

    return questions;
  } catch (err) {
    console.error("Error generating quiz from text:", err);
    throw new Error("Failed to generate quiz from text: " + err.message);
  }
};

// ======================
// Generate quiz from image OR PDF
// ======================
export const generateQuizFromImage = async (filePath, subject, difficulty = "medium") => {
  try {
    const model = getModel();

    const fileBuffer = fs.readFileSync(filePath);
    const base64File = fileBuffer.toString("base64");

    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".pdf": "application/pdf", // ✅ Added PDF support
    };
    const mimeType = mimeTypes[ext] || "image/jpeg";

    const fileType = ext === '.pdf' ? 'PDF document' : 'image';

    const prompt = `You are an expert teacher creating educational quizzes.
Analyze this ${fileType} which contains study notes about "${subject}".

Extract key concepts and generate exactly 10 multiple-choice questions.

Requirements:
- Difficulty: ${difficulty}
- Each question must have 4 options
- Include explanations
- Return ONLY a valid JSON array in this format:
[
  {
    "question": "Question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Why this answer is correct"
  }
]`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: base64File,
        },
      },
    ]);

    const text = (await result.response).text();
    const cleanText = text.replace(/```json\n?|```\n?/g, '').trim();
    const questions = JSON.parse(cleanText);

    // Validation
    questions.forEach((q, idx) => {
      if (!q.question || !Array.isArray(q.options) || q.options.length !== 4) {
        throw new Error(`Invalid question at index ${idx}`);
      }
      if (typeof q.correctAnswer !== "number" || q.correctAnswer < 0 || q.correctAnswer > 3) {
        throw new Error(`Invalid correctAnswer at index ${idx}`);
      }
    });

    return questions;
  } catch (err) {
    console.error("Error generating quiz from file:", err);
    throw new Error("Failed to generate quiz from file: " + err.message);
  }
};

// ======================
// Generate study recommendations
// ======================
export const generateRecommendations = async (studyData) => {
  try {
    const model = getModel();
    const { sessions, quizResults, goals } = studyData;

    const prompt = `You are an AI study coach analyzing a student's learning patterns.

Study Sessions Data:
${JSON.stringify(sessions, null, 2)}

Quiz Results:
${JSON.stringify(quizResults, null, 2)}

Study Goals:
${JSON.stringify(goals, null, 2)}

Analyze this data and provide 5-7 specific, actionable recommendations to improve their learning.

Focus on:
1. Weak subjects (based on quiz scores and study time)
2. Study time optimization
3. Consistency improvements
4. Goal achievement strategies
5. Learning techniques
6. Time management

Return ONLY a valid JSON array in this exact format (no markdown, no extra text):
[
  {
    "category": "weak_subjects",
    "title": "Focus more on Physics",
    "description": "Your quiz scores in Physics are below average. Consider spending 2 more hours per week on this subject.",
    "priority": "high"
  }
]

Categories should be one of: weak_subjects, time_management, consistency, goal_setting, learning_technique, motivation
Priority should be: high, medium, or low`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const cleanText = text.replace(/```json\n?|```\n?/g, '').trim();
    const recommendations = JSON.parse(cleanText);

    if (!Array.isArray(recommendations)) {
      throw new Error("Invalid recommendations format");
    }

    return recommendations;
  } catch (err) {
    console.error("Error generating recommendations:", err);
    throw new Error("Failed to generate recommendations: " + err.message);
  }
};

export default {
  generateQuizFromText,
  generateQuizFromImage,
  generateRecommendations,
};