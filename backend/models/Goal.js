import mongoose from "mongoose";

const goalSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  subject: { 
    type: String, 
    required: true,
    trim: true
  },
  target_hours: { 
    type: Number, 
    required: true,
    min: 0.5
  },
  period: { 
    type: String, 
    enum: ["weekly", "monthly"], 
    required: true,
    default: "weekly"
  }
}, { 
  timestamps: true 
});

// Index for faster queries
goalSchema.index({ userId: 1, subject: 1 });

export default mongoose.model("Goal", goalSchema);