import mongoose from "mongoose";

const quizResultSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  quizId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Quiz", 
    required: true 
  },
  score: { 
    type: Number, 
    required: true,
    min: 0
  },
  totalQuestions: { 
    type: Number, 
    required: true 
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  answers: [{
    questionIndex: { 
      type: Number, 
      required: true 
    },
    selectedAnswer: { 
      type: Number, 
      required: true 
    },
    isCorrect: { 
      type: Boolean, 
      required: true 
    },
    timeTaken: { 
      type: Number,
      default: 0
    }
  }],
  totalTimeTaken: {
    type: Number,
    default: 0
  },
  completedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  timestamps: true 
});

// Index for faster queries
quizResultSchema.index({ userId: 1, completedAt: -1 });
quizResultSchema.index({ quizId: 1 });

export default mongoose.model("QuizResult", quizResultSchema);