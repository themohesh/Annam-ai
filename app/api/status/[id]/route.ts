import { type NextRequest, NextResponse } from "next/server"

declare global {
  // eslint-disable-next-line no-var
  var processingJobs: Map<string, any> | undefined;
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Get job status from global state (in real app, use database)
    global.processingJobs = global.processingJobs || new Map()
    const job = global.processingJobs.get(id)

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: job.id,
      filename: job.filename,
      status: job.status,
      progress: job.progress,
      transcript: job.transcript,
      questions: job.questions,
      error: job.error,
    })
  } catch (error) {
    console.error("Status check error:", error)
    return NextResponse.json({ error: "Failed to get status" }, { status: 500 })
  }
}
