import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";

dotenv.config();

// DEBUG: Check if Gemini API key is loaded
console.log("✅ API Key exists:", !!process.env.GEMINI_API_KEY);

const app = express();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS configuration - allow credentials
app.use(cors({
  origin: "http://localhost:5173", // Your React app URL
  credentials: true
}));

app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Session configuration with MongoDB store
app.use(session({
  secret: process.env.SESSION_SECRET || "your-secret-key-change-this",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: "sessions",
    ttl: 24 * 60 * 60 // Session expires after 1 day
  }),
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    httpOnly: true,
    secure: false, // Set to true if using HTTPS
    sameSite: 'lax'
  }
}));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/uploadNotes", uploadRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/recommendations", recommendationRoutes);

app.get("/", (req, res) => res.send("Server is running with AI features"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));