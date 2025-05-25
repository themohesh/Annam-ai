import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("video") as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "uploads")
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique ID and save file
    const id = uuidv4()
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const filePath = path.join(uploadsDir, `${id}.mp4`)
    await writeFile(filePath, buffer)

    // Store processing job in database (mock implementation)
    const processingJob = {
      id,
      filename: file.name,
      filePath,
      status: "transcribing",
      progress: 0,
      createdAt: new Date(),
    }

    // Start background processing
    processVideo(processingJob)

    return NextResponse.json({
      id,
      message: "File uploaded successfully",
      status: "transcribing",
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}

// Mock processing function - in real implementation, this would call your Python services
async function processVideo(job: any) {
  try {
    // Simulate transcription process
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Mock transcript data
    const mockTranscript = [
      {
        id: "1",
        startTime: 0,
        endTime: 300,
        text: "Welcome to today's lecture on machine learning fundamentals. We'll start by discussing the basic concepts and principles that form the foundation of artificial intelligence and machine learning systems.",
        duration: 300,
      },
      {
        id: "2",
        startTime: 300,
        endTime: 600,
        text: "Machine learning is a subset of artificial intelligence that enables computers to learn and improve from experience without being explicitly programmed. There are three main types of machine learning: supervised, unsupervised, and reinforcement learning.",
        duration: 300,
      },
      {
        id: "3",
        startTime: 600,
        endTime: 900,
        text: "Supervised learning involves training algorithms on labeled data, where the correct answers are provided during training. Common examples include classification and regression problems.",
        duration: 300,
      },
    ]

    // Update status to generating questions
    job.status = "generating-questions"
    job.progress = 50
    job.transcript = mockTranscript

    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock questions data
    const mockQuestions = [
      {
        segmentId: "1",
        startTime: 0,
        endTime: 300,
        questions: [
          {
            id: "q1",
            question: "What is the main topic of this lecture segment?",
            options: ["Database management", "Machine learning fundamentals", "Web development", "Network security"],
            correctAnswer: 1,
            explanation: "The speaker explicitly mentions that this is a lecture on machine learning fundamentals.",
          },
          {
            id: "q2",
            question: "According to the lecture, machine learning is a subset of what?",
            options: ["Computer science", "Data science", "Artificial intelligence", "Software engineering"],
            correctAnswer: 2,
            explanation: "The lecture states that machine learning is a subset of artificial intelligence.",
          },
        ],
      },
      {
        segmentId: "2",
        startTime: 300,
        endTime: 600,
        questions: [
          {
            id: "q3",
            question: "How many main types of machine learning are mentioned?",
            options: ["Two", "Three", "Four", "Five"],
            correctAnswer: 1,
            explanation: "The lecture mentions three main types: supervised, unsupervised, and reinforcement learning.",
          },
          {
            id: "q4",
            question: "Which of the following is NOT mentioned as a type of machine learning?",
            options: ["Supervised learning", "Unsupervised learning", "Reinforcement learning", "Deep learning"],
            correctAnswer: 3,
            explanation: "Deep learning is not mentioned in this segment as one of the three main types.",
          },
        ],
      },
      {
        segmentId: "3",
        startTime: 600,
        endTime: 900,
        questions: [
          {
            id: "q5",
            question: "What characterizes supervised learning?",
            options: [
              "Training on unlabeled data",
              "Training algorithms on labeled data",
              "Learning through trial and error",
              "Clustering similar data points",
            ],
            correctAnswer: 1,
            explanation:
              "Supervised learning involves training algorithms on labeled data where correct answers are provided.",
          },
        ],
      },
    ]

    // Complete processing
    job.status = "completed"
    job.progress = 100
    job.questions = mockQuestions

    // Store in global state (in real app, use database)
    global.processingJobs = global.processingJobs || new Map()
    global.processingJobs.set(job.id, job)
  } catch (error) {
    console.error("Processing error:", error)
    job.status = "error"
    job.error = "Processing failed"
    global.processingJobs = global.processingJobs || new Map()
    global.processingJobs.set(job.id, job)
  }
}
