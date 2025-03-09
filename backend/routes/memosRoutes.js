const express = require("express");
const router = express.Router();
const Memo = require("../models/memosModel.js");
const authorise = require("../middleware/authorisationMiddleware.js");

// Creating a route for new memo
router.post("/memo", authorise, async (req, res) => {
  try {
    const { title, content } = req.body;
    const newMemo = new Memo({
      title,
      content,
      houseID: req.user.houseID,
      userID: req.user.userID,
    });
    await newMemo.save();
    res.status(201).json(newMemo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// New route to retrieve all memos for a given house key
router.get("/house/memos", authorise, async (req, res) => {
  try {
    const memos = await Memo.find({ houseID: req.user.houseID });
    res.json(memos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to retrieve all memos
router.get("/memo", authorise, async (req, res) => {
  try {
    const memos = await Memo.find({ houseID: req.user.houseID });
    res.json(memos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to retrieve a specific memo
router.get("/memo/:memoID", authorise, async (req, res) => {
  try {
    const memo = await Memo.findOne({
      memoID: req.params.memoID,
      houseID: req.user.houseID,
    });
    if (!memo) {
      return res.status(404).json({ message: "Memo not found" });
    }
    res.json(memo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Updating a memo
router.put("/memo/:memoID", authorise, async (req, res) => {
  try {
    const { memoID, title, content } = req.body;
    const updatedMemo = { memoID, title, content };
    const memo = await Memo.findOneAndUpdate(
      { memoID: req.params.memoID, houseID: req.user.houseID },
      updatedMemo,
      { new: true }
    );
    res.json(memo);
    console.log("Updated memo: " + memo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deleting a memo
router.delete("/memo/:memoID", authorise, async (req, res) => {
  try {
    const memo = await Memo.findOneAndDelete({
      memoID: req.params.memoID,
      houseID: req.user.houseID,
    });
    if (!memo) {
      return res.status(404).json({ message: "Memo not found" });
    }
    res.json(memo);
    console.log("Deleted memo: " + memo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;