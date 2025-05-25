"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertCircle, FileText, HelpCircle } from "lucide-react"
import type { VideoProcessingData } from "@/app/page"

interface ProcessingStatusProps {
  data: VideoProcessingData
  onComplete: (data: VideoProcessingData) => void
  onNewUpload: () => void
}

export function ProcessingStatus({ data, onComplete, onNewUpload }: ProcessingStatusProps) {
  const [currentData, setCurrentData] = useState(data)

  useEffect(() => {
    if (currentData.status === "completed" || currentData.status === "error") {
      return
    }

    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/status/${currentData.id}`)
        if (response.ok) {
          const updatedData = await response.json()
          setCurrentData(updatedData)

          if (updatedData.status === "completed") {
            onComplete(updatedData)
          }
        }
      } catch (error) {
        console.error("Error polling status:", error)
      }
    }

    const interval = setInterval(pollStatus, 2000)
    return () => clearInterval(interval)
  }, [currentData.id, currentData.status, onComplete])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-blue-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "error":
        return "bg-red-100 text-red-800"
      case "transcribing":
        return "bg-blue-100 text-blue-800"
      case "generating-questions":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "transcribing":
        return "Transcribing Audio"
      case "generating-questions":
        return "Generating Questions"
      case "completed":
        return "Processing Complete"
      case "error":
        return "Processing Failed"
      default:
        return "Processing"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(currentData.status)}
            Processing Video: {currentData.filename}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge className={getStatusColor(currentData.status)}>{getStatusText(currentData.status)}</Badge>
            <span className="text-sm text-slate-600">{currentData.progress}% complete</span>
          </div>

          <Progress value={currentData.progress} className="w-full" />

          {currentData.error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{currentData.error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={currentData.status === "transcribing" ? "ring-2 ring-blue-500" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-medium">Transcription</h3>
                <p className="text-sm text-slate-600">Converting speech to text</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={currentData.status === "generating-questions" ? "ring-2 ring-purple-500" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <HelpCircle className="h-8 w-8 text-purple-600" />
              <div>
                <h3 className="font-medium">Question Generation</h3>
                <p className="text-sm text-slate-600">Creating MCQs from segments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={currentData.status === "completed" ? "ring-2 ring-green-500" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-medium">Complete</h3>
                <p className="text-sm text-slate-600">Ready for review</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {currentData.status === "error" && (
        <div className="flex justify-center">
          <Button onClick={onNewUpload} variant="outline">
            Try Again
          </Button>
        </div>
      )}
    </div>
  )
}
