import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  uploadId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Upload",
    required: true
  },
  subject: { 
    type: String, 
    required: true,
    trim: true
  },
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  questions: [{
    question: { 
      type: String, 
      required: true 
    },
    options: [{ 
      type: String, 
      required: true 
    }],
    correctAnswer: { 
      type: Number, 
      required: true,
      min: 0,
      max: 3
    },
    explanation: { 
      type: String 
    }
  }],
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium"
  },
  totalQuestions: {
    type: Number,
    required: true
  }
}, { 
  timestamps: true 
});

// Index for faster queries
quizSchema.index({ userId: 1, subject: 1 });
quizSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Quiz", quizSchema);