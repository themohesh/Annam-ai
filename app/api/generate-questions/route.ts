import { type NextRequest, NextResponse } from "next/server"

// This would integrate with your Python LLM service
export async function POST(request: NextRequest) {
  try {
    const { segments, jobId } = await request.json()

    // In real implementation, call your Python LLM service
    // Example: POST to http://localhost:5001/generate-questions
    const questionsResponse = await fetch("http://localhost:5001/generate-questions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        segments,
        job_id: jobId,
        num_questions_per_segment: 2,
      }),
    })

    if (!questionsResponse.ok) {
      throw new Error("Question generation service failed")
    }

    const result = await questionsResponse.json()

    return NextResponse.json(result)
  } catch (error) {
    console.error("Question generation error:", error)
    return NextResponse.json({ error: "Question generation failed" }, { status: 500 })
  }
}
