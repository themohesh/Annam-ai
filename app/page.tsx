"use client"

import { useState } from "react"
import { VideoUpload } from "@/components/video-upload"
import { TranscriptionResults } from "@/components/transcription-results"
import { ProcessingStatus } from "@/components/processing-status"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export interface VideoProcessingData {
  id: string
  filename: string
  status: "uploading" | "transcribing" | "generating-questions" | "completed" | "error"
  progress: number
  transcript?: TranscriptSegment[]
  questions?: QuestionSet[]
  error?: string
}

export interface TranscriptSegment {
  id: string
  startTime: number
  endTime: number
  text: string
  duration: number
}

export interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
}

export interface QuestionSet {
  segmentId: string
  startTime: number
  endTime: number
  questions: Question[]
}

export default function HomePage() {
  const [processingData, setProcessingData] = useState<VideoProcessingData | null>(null)
  const [activeTab, setActiveTab] = useState("upload")

  const handleUploadStart = (data: VideoProcessingData) => {
    setProcessingData(data)
    setActiveTab("processing")
  }

  const handleProcessingComplete = (data: VideoProcessingData) => {
    setProcessingData(data)
    setActiveTab("results")
  }

  const handleNewUpload = () => {
    setProcessingData(null)
    setActiveTab("upload")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">AI Video Transcription & MCQ Generator</h1>
          <p className="text-lg text-slate-600">
            Upload lecture videos to automatically generate transcripts and multiple-choice questions
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload Video</TabsTrigger>
            <TabsTrigger value="processing" disabled={!processingData}>
              Processing
            </TabsTrigger>
            <TabsTrigger value="results" disabled={!processingData?.transcript}>
              Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Lecture Video</CardTitle>
                <CardDescription>Upload an MP4 video file (up to 2GB) to generate transcripts and MCQs</CardDescription>
              </CardHeader>
              <CardContent>
                <VideoUpload onUploadStart={handleUploadStart} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="processing" className="mt-6">
            {processingData && (
              <ProcessingStatus
                data={processingData}
                onComplete={handleProcessingComplete}
                onNewUpload={handleNewUpload}
              />
            )}
          </TabsContent>

          <TabsContent value="results" className="mt-6">
            {processingData?.transcript && <TranscriptionResults data={processingData} onNewUpload={handleNewUpload} />}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
