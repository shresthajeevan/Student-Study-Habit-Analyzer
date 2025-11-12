import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Upload from "../models/Upload.js";

const router = express.Router();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename: timestamp-randomstring-originalname
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`);
  }
});

// File filter - accept only specific file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg", 
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "text/plain",
    "text/markdown"
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed. Allowed types: images, PDF, TXT, MD`), false);
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit per file
  }
});

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Please login to upload files" });
  }
  next();
};

// Helper to determine file type
const getFileType = (mimetype) => {
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype === "application/pdf") return "pdf";
  if (mimetype.startsWith("text/")) return "document";
  return "other";
};

// POST upload files
router.post("/", requireAuth, upload.array("files", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    // Save file metadata to database
    const uploadedFiles = await Promise.all(
      req.files.map(async (file) => {
        const uploadDoc = await Upload.create({
          userId: req.session.userId,
          originalName: file.originalname,
          filename: file.filename,
          path: `/uploads/${file.filename}`,
          mimetype: file.mimetype,
          size: file.size,
          fileType: getFileType(file.mimetype)
        });

        return {
          id: uploadDoc._id.toString(),
          originalName: uploadDoc.originalName,
          filename: uploadDoc.filename,
          url: uploadDoc.path,
          mimetype: uploadDoc.mimetype,
          size: uploadDoc.size,
          fileType: uploadDoc.fileType,
          uploadedAt: uploadDoc.createdAt
        };
      })
    );

    res.status(201).json({
      message: "Files uploaded successfully",
      files: uploadedFiles
    });
  } catch (err) {
    console.error("Upload error:", err);
    
    // Clean up uploaded files if database save fails
    if (req.files) {
      req.files.forEach(file => {
        fs.unlink(file.path, (unlinkErr) => {
          if (unlinkErr) console.error("Error deleting file:", unlinkErr);
        });
      });
    }
    
    res.status(500).json({ message: err.message });
  }
});

// GET all uploaded files for user
router.get("/", requireAuth, async (req, res) => {
  try {
    const uploads = await Upload.find({ userId: req.session.userId })
      .sort({ createdAt: -1 });

    const files = uploads.map(upload => ({
      id: upload._id.toString(),
      originalName: upload.originalName,
      filename: upload.filename,
      url: upload.path,
      mimetype: upload.mimetype,
      size: upload.size,
      fileType: upload.fileType,
      uploadedAt: upload.createdAt
    }));

    res.json(files);
  } catch (err) {
    console.error("Error fetching uploads:", err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE uploaded file
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Find upload and verify ownership
    const upload = await Upload.findById(id);
    if (!upload) {
      return res.status(404).json({ message: "File not found" });
    }

    if (upload.userId.toString() !== req.session.userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Delete physical file
    const filePath = path.join(__dirname, "..", upload.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await Upload.findByIdAndDelete(id);

    res.json({ message: "File deleted successfully", id });
  } catch (err) {
    console.error("Error deleting file:", err);
    res.status(500).json({ message: err.message });
  }
});

// Error handling middleware for multer
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File size too large. Maximum 10MB per file" });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({ message: "Too many files. Maximum 10 files at once" });
    }
    return res.status(400).json({ message: err.message });
  }
  
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  
  next();
});

export default router;