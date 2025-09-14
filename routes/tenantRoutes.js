// //path: backend/routes/tenantRoutes.js
// const express = require('express');
// const router = express.Router();
// const authMiddleware = require('../middleware/authMiddleware');
// const Tenant = require('../models/Tenant');

// router.post('/tenants/:slug/upgrade', authMiddleware, async (req, res) => {
//   try {
//     const user = req.user;
//      // 🔍 Debug: Print decoded user info
//     console.log('Decoded user:', user)

//     const slug = req.params.slug;
//     // Only ADMIN can upgrade
//     if (user.role !== 'ADMIN') {
//       return res.status(403).json({ message: 'Only admins can upgrade plans' });
//     }


//     // Only ADMIN can upgrade
//     if (user.role !== 'ADMIN') {
//       return res.status(403).json({ message: 'Only admins can upgrade plans' });
//     }

//     // Find tenant by slug
//     const tenant = await Tenant.findOne({ slug });
//     if (!tenant) {
//       return res.status(404).json({ message: 'Tenant not found' });
//     }

//     // Check ownership
//     if (tenant._id.toString() !== user.tenantId) {
//       return res.status(403).json({ message: 'You can only upgrade your own tenant' });
//     }

//     // Upgrade plan
//     tenant.plan = 'pro';
//     await tenant.save();

//     res.status(200).json({ message: 'Tenant upgraded to Pro', tenant });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// module.exports = router;




// path: backend/routes/noteRoutes.js

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Note = require("../models/Note");
const Tenant = require("../models/Tenant");

// ✅ Create a note
router.post("/notes", authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    const user = req.user;

    const tenant = await Tenant.findById(user.tenantId);
    if (!tenant) return res.status(400).json({ message: "Tenant not found" });

    const noteCount = await Note.countDocuments({ tenantId: tenant._id });

    if (tenant.plan === "free" && noteCount >= 3) {
      return res
        .status(403)
        .json({ message: "Note limit reached. Upgrade to Pro." });
    }

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

// ✅ Get all notes for tenant
router.get("/notes", authMiddleware, async (req, res) => {
  try {
    const user = req.user;

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

// ✅ Update a note
router.put("/notes/:id", authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const { title, content } = req.body;
    const noteId = req.params.id;

    const note = await Note.findOne({ _id: noteId, tenantId: user.tenantId });
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (note.createdBy.toString() !== user.userId) {
      return res.status(403).json({ message: "Forbidden: You can only edit your own notes" });
    }

    note.title = title || note.title;
    note.content = content || note.content;
    await note.save();

    res.status(200).json({ message: "Note updated", note });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Delete a note
router.delete("/notes/:id", authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const noteId = req.params.id;

    const note = await Note.findOne({ _id: noteId, tenantId: user.tenantId });
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (note.createdBy.toString() !== user.userId) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own notes" });
    }

    await Note.deleteOne({ _id: noteId });

    res.status(200).json({ message: "Note deleted" });
  } catch (error) {
    console.error("❌ Notes delete error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
