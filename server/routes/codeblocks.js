const express = require("express");
const router = express.Router();
const CodeBlock = require("../models/CodeBlock"); // Import the model

// GET /api/codeblocks - get all code blocks
router.get("/", async (req, res) => {
  try {
    const blocks = await CodeBlock.find();
    res.json(blocks);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch code blocks" });
  }
});

// GET /api/codeblocks/:id - get one code block by ID
router.get("/:id", async (req, res) => {
  try {
    const block = await CodeBlock.findById(req.params.id);
    if (!block) return res.status(404).json({ error: "Not found" });
    res.json(block);
  } catch (err) {
    res.status(500).json({ error: "Failed to load code block" });
  }
});

module.exports = router; 
