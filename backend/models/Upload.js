import mongoose from "mongoose";

const uploadSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  originalName: { 
    type: String, 
    required: true 
  },
  filename: { 
    type: String, 
    required: true,
    unique: true
  },
  path: { 
    type: String, 
    required: true 
  },
  mimetype: { 
    type: String, 
    required: true 
  },
  size: { 
    type: Number, 
    required: true 
  },
  fileType: {
    type: String,
    enum: ["image", "pdf", "document", "other"],
    required: true
  }
}, { 
  timestamps: true 
});

// Index for faster queries
uploadSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Upload", uploadSchema);