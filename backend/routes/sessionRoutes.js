import express from "express";
import mongoose from "mongoose";
import Session from "../models/Session.js";

const router = express.Router();

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Please login to continue" });
  }
  next();
};

// GET all sessions for logged-in user
router.get("/", requireAuth, async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.session.userId })
      .sort({ startTime: -1 }); // Sort by most recent first

    // Transform sessions to include calculated fields
    const transformedSessions = sessions.map(session => {
      const start = new Date(session.startTime);
      const end = new Date(session.endTime);
      const duration = Math.round((end - start) / 60000); // Duration in minutes
      const date = start.toISOString().split('T')[0];

      return {
        id: session._id.toString(),
        _id: session._id,
        subject: session.subject,
        startTime: session.startTime,
        endTime: session.endTime,
        duration,
        date,
        userId: session.userId
      };
    });

    res.json(transformedSessions);
  } catch (err) {
    console.error("Error fetching sessions:", err);
    res.status(500).json({ message: err.message });
  }
});

// POST create new session
router.post("/", requireAuth, async (req, res) => {
  try {
    const { subject, startTime, endTime } = req.body;

    // Validate input
    if (!subject || !startTime || !endTime) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    // Validate time range
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    if (end <= start) {
      return res.status(400).json({ message: "End time must be after start time" });
    }

    // Create session
    const session = await Session.create({
      userId: req.session.userId,
      subject: subject.trim(),
      startTime,
      endTime,
    });

    // Calculate duration and date
    const duration = Math.round((end - start) / 60000);
    const date = start.toISOString().split('T')[0];

    res.status(201).json({
      id: session._id.toString(),
      _id: session._id,
      subject: session.subject,
      startTime: session.startTime,
      endTime: session.endTime,
      duration,
      date,
      userId: session.userId
    });
  } catch (err) {
    console.error("Error creating session:", err);
    res.status(500).json({ message: err.message });
  }
});

// PUT update session
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, startTime, endTime } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid session ID" });
    }

    // Find session and verify ownership
    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.userId.toString() !== req.session.userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Validate time range
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (end <= start) {
      return res.status(400).json({ message: "End time must be after start time" });
    }

    // Update session
    session.subject = subject.trim();
    session.startTime = startTime;
    session.endTime = endTime;
    await session.save();

    // Calculate duration and date
    const duration = Math.round((end - start) / 60000);
    const date = start.toISOString().split('T')[0];

    res.json({
      id: session._id.toString(),
      _id: session._id,
      subject: session.subject,
      startTime: session.startTime,
      endTime: session.endTime,
      duration,
      date,
      userId: session.userId
    });
  } catch (err) {
    console.error("Error updating session:", err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE session
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid session ID" });
    }

    // Find session and verify ownership
    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.userId.toString() !== req.session.userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Session.findByIdAndDelete(id);
    res.json({ message: "Session deleted successfully", id });
  } catch (err) {
    console.error("Error deleting session:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;