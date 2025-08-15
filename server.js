import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config(); // Load .env variables

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB URI from environment variable
const uri = process.env.MONGODB_URI;

async function connectToMongoDB() {
  try {
    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB Atlas using Mongoose!");
  } catch (error) {
    console.error("❌ Error connecting to MongoDB Atlas:", error);
    process.exit(1); // Exit if DB connection fails
  }
}

connectToMongoDB();

// Schema
const commentSchema = new mongoose.Schema({
  username: String,
  content: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  replies: [
    {
      username: String,
      content: String,
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    },
  ],
});

const Comment = mongoose.model("Comment", commentSchema);

// Routes
app.get("/comments", async (req, res) => {
  const comments = await Comment.find().sort({ createdAt: -1 });
  res.json(comments);
});

app.post("/comments", async (req, res) => {
  const { username, content, parentId } = req.body;
  if (parentId) {
    const parent = await Comment.findById(parentId);
    if (!parent) return res.status(404).json({ message: "Parent not found" });
    parent.replies.push({ username, content });
    await parent.save();
    res.status(201).json(parent);
  } else {
    const comment = new Comment({ username, content });
    await comment.save();
    res.status(201).json(comment);
  }
});

app.put("/comments/:id/like", async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  comment.likes += 1;
  await comment.save();
  res.json(comment);
});

app.put("/comments/:id/dislike", async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  comment.dislikes += 1;
  await comment.save();
  res.json(comment);
});

// Use process.env.PORT for deployment
const PORT = process.env.PORT || 4600;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
