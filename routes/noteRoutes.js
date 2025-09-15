//path: backend/routes/noteRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Note = require("../models/Note");
const Tenant = require("../models/Tenant");

router.post("/notes", authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    const user = req.user;

    // Get tenant info
    const tenant = await Tenant.findById(user.tenantId);
    if (!tenant) return res.status(400).json({ message: "Tenant not found" });

    // Count existing notes for this tenant
    const noteCount = await Note.countDocuments({ tenantId: tenant._id });

    // Check subscription limit
    if (tenant.plan === "free" && noteCount >= 3) {
      return res
        .status(403)
        .json({ message: "Note limit reached. Ask Admin to upgrade." });
    }

    // Create note
    const newNote = await Note.create({
      title,
      content,
      tenantId: tenant._id,
      createdBy: user.userId,
    });

    res.status(201).json({ message: "Note created", note: newNote });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/notes", authMiddleware, async (req, res) => {
  try {
    const user = req.user;

    // Fetch notes for user's tenant
    const notes = await Note.find({ tenantId: user.tenantId });

    const tenant = await Tenant.findById(user.tenantId);

    res.status(200).json({
      notes,
      tenant: {
        plan: tenant?.plan || "free",
        name: tenant?.name || "unknown",
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.put("/notes/:id", authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const { title, content } = req.body;
    const noteId = req.params.id;

    // Find the note
    const note = await Note.findOne({ _id: noteId, tenantId: user.tenantId });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Check ownership
    if (note.createdBy.toString() !== user.userId) {
      return res
        .status(403)
        .json({ message: "Forbidden: You can only edit your own notes" });
    }

    // Update fields
    note.title = title || note.title;
    note.content = content || note.content;
    await note.save();

    res.status(200).json({ message: "Note updated", note });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.put("/notes/:id", authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const { title, content } = req.body;
    const noteId = req.params.id;

    // Find the note
    const note = await Note.findOne({ _id: noteId, tenantId: user.tenantId });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Check ownership
    if (note.createdBy.toString() !== user.userId) {
      return res
        .status(403)
        .json({ message: "Forbidden: You can only edit your own notes" });
    }

    // Update fields
    note.title = title || note.title;
    note.content = content || note.content;
    await note.save();

    res.status(200).json({ message: "Note updated", note });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.delete("/notes/:id", authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const noteId = req.params.id;

    // Find the note
    const note = await Note.findOne({ _id: noteId, tenantId: user.tenantId });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Check ownership
    if (note.createdBy.toString() !== user.userId) {
      return res
        .status(403)
        .json({ message: "Forbidden: You can only delete your own notes" });
    }

    await Note.deleteOne({ _id: noteId });

    res.status(200).json({ message: "Note deleted" });
  } catch (error) {
    console.error("❌ Notes fetch error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
