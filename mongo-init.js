// MongoDB initialization script
const { ObjectId } = require("mongodb")
const db = db.getSiblingDB("video_transcription")

// Create collections
db.createCollection("videos")
db.createCollection("transcripts")
db.createCollection("questions")

// Create indexes for better performance
db.videos.createIndex({ createdAt: 1 })
db.transcripts.createIndex({ videoId: 1 })
db.questions.createIndex({ videoId: 1, segmentId: 1 })

// Insert sample data (optional)
db.videos.insertOne({
  _id: new ObjectId(),
  filename: "sample_lecture.mp4",
  status: "completed",
  createdAt: new Date(),
  updatedAt: new Date(),
})

print("Database initialized successfully!")
