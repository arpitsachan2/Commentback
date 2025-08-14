import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://hkmmishra18:vZPoKrXJRSbp2DeH@cluster0.psj2onl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"; // Replace with your actual connection string

async function connectToMongoDB() {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB Atlas using Mongoose!");
    // You can now define schemas and models and interact with your database
  } catch (error) {
    console.error("Error connecting to MongoDB Atlas:", error);
  }
}

connectToMongoDB();
// Comment Schema
const commentSchema = new mongoose.Schema({
  username: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  replies: [
    {
      username: { type: String, required: true },
      content: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    }
  ]
});
const Comment = mongoose.model("Comment", commentSchema);
// Routes
// Get all comments
app.get('/comments', async (req, res) => {
  try {
    const comments = await Comment.find().sort({ createdAt: -1 }); // latest first
    res.status(200).json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post('/comments', async (req, res) => {
  try {
    const { username, content, parentId } = req.body;

    if (!username || !content) {
      return res.status(400).json({ message: "Username and content are required" });
    }

    if (parentId) {
      // If parentId is provided, it's a reply
      const parentComment = await Comment.findById(parentId);
      if (!parentComment) return res.status(404).json({ message: "Parent comment not found" });

      parentComment.replies.push({ username, content });
      await parentComment.save();
      return res.status(201).json(parentComment);
    } else {
      // New top-level comment
      const newComment = new Comment({ username, content });
      await newComment.save();
      return res.status(201).json(newComment);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
// Like a comment
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

// Start server
app.listen(4600, () => console.log("🚀 Server running on port 4600"));