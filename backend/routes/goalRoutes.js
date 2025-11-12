import express from "express";
import Goal from "../models/Goal.js";
import Session from "../models/Session.js";

const router = express.Router();

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Please login to continue" });
  }
  next();
};

// Helper function to calculate progress
const calculateProgress = async (goal, userId) => {
  const now = new Date();
  const startDate = new Date(now);
  
  if (goal.period === "weekly") {
    startDate.setDate(now.getDate() - 7);
  } else {
    startDate.setMonth(now.getMonth() - 1);
  }

  // Get sessions for this subject within the period
  const sessions = await Session.find({
    userId,
    subject: goal.subject,
    startTime: { $gte: startDate }
  });

  // Calculate total hours
  const totalMinutes = sessions.reduce((sum, session) => {
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);
    const duration = Math.round((end - start) / 60000);
    return sum + duration;
  }, 0);

  const currentHours = totalMinutes / 60;
  const progress = Math.min((currentHours / goal.target_hours) * 100, 100);
  const remaining = Math.max(goal.target_hours - currentHours, 0);

  return {
    currentHours: parseFloat(currentHours.toFixed(2)),
    progress: parseFloat(progress.toFixed(1)),
    remaining: parseFloat(remaining.toFixed(2))
  };
};

// GET all goals for logged-in user
router.get("/", requireAuth, async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.session.userId }).sort({ createdAt: -1 });

    // Calculate progress for each goal
    const goalsWithProgress = await Promise.all(
      goals.map(async (goal) => {
        const progress = await calculateProgress(goal, req.session.userId);
        return {
          id: goal._id.toString(),
          _id: goal._id,
          subject: goal.subject,
          target_hours: goal.target_hours,
          period: goal.period,
          createdAt: goal.createdAt,
          updatedAt: goal.updatedAt,
          progress
        };
      })
    );

    res.json(goalsWithProgress);
  } catch (err) {
    console.error("Error fetching goals:", err);
    res.status(500).json({ message: err.message });
  }
});

// POST create new goal
router.post("/", requireAuth, async (req, res) => {
  try {
    const { subject, target_hours, period } = req.body;

    // Validate input
    if (!subject || !target_hours || !period) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    if (target_hours <= 0) {
      return res.status(400).json({ message: "Target hours must be greater than 0" });
    }

    if (!["weekly", "monthly"].includes(period)) {
      return res.status(400).json({ message: "Period must be 'weekly' or 'monthly'" });
    }

    // Create goal
    const goal = await Goal.create({
      userId: req.session.userId,
      subject: subject.trim(),
      target_hours: parseFloat(target_hours),
      period
    });

    // Calculate initial progress
    const progress = await calculateProgress(goal, req.session.userId);

    res.status(201).json({
      id: goal._id.toString(),
      _id: goal._id,
      subject: goal.subject,
      target_hours: goal.target_hours,
      period: goal.period,
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt,
      progress
    });
  } catch (err) {
    console.error("Error creating goal:", err);
    res.status(500).json({ message: err.message });
  }
});

// PUT update goal
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, target_hours, period } = req.body;

    // Find goal and verify ownership
    const goal = await Goal.findById(id);
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    if (goal.userId.toString() !== req.session.userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Validate input
    if (target_hours && target_hours <= 0) {
      return res.status(400).json({ message: "Target hours must be greater than 0" });
    }

    if (period && !["weekly", "monthly"].includes(period)) {
      return res.status(400).json({ message: "Period must be 'weekly' or 'monthly'" });
    }

    // Update goal
    if (subject) goal.subject = subject.trim();
    if (target_hours) goal.target_hours = parseFloat(target_hours);
    if (period) goal.period = period;
    
    await goal.save();

    // Calculate updated progress
    const progress = await calculateProgress(goal, req.session.userId);

    res.json({
      id: goal._id.toString(),
      _id: goal._id,
      subject: goal.subject,
      target_hours: goal.target_hours,
      period: goal.period,
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt,
      progress
    });
  } catch (err) {
    console.error("Error updating goal:", err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE goal
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Find goal and verify ownership
    const goal = await Goal.findById(id);
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    if (goal.userId.toString() !== req.session.userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Goal.findByIdAndDelete(id);
    res.json({ message: "Goal deleted successfully", id });
  } catch (err) {
    console.error("Error deleting goal:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;