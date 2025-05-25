"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, Video, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { VideoProcessingData } from "@/app/page"

interface VideoUploadProps {
  onUploadStart: (data: VideoProcessingData) => void
}

export function VideoUpload({ onUploadStart }: VideoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      // Validate file
      if (!file.type.includes("video/mp4")) {
        setError("Please upload an MP4 video file")
        return
      }

      if (file.size > 2 * 1024 * 1024 * 1024) {
        // 2GB limit
        setError("File size must be less than 2GB")
        return
      }

      setError(null)
      setUploading(true)
      setUploadProgress(0)

      try {
        const formData = new FormData()
        formData.append("video", file)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Upload failed")
        }

        const result = await response.json()

        onUploadStart({
          id: result.id,
          filename: file.name,
          status: "transcribing",
          progress: 0,
        })
      } catch (err) {
        setError("Upload failed. Please try again.")
        console.error("Upload error:", err)
      } finally {
        setUploading(false)
        setUploadProgress(0)
      }
    },
    [onUploadStart],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/mp4": [".mp4"],
    },
    maxFiles: 1,
    disabled: uploading,
  })

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card
        {...getRootProps()}
        className={`border-2 border-dashed cursor-pointer transition-colors ${
          isDragActive ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:border-slate-400"
        } ${uploading ? "pointer-events-none opacity-50" : ""}`}
      >
        <CardContent className="flex flex-col items-center justify-center py-12">
          <input {...getInputProps()} />

          {uploading ? (
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-lg font-medium">Uploading video...</p>
              <Progress value={uploadProgress} className="w-64" />
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="mx-auto h-12 w-12 text-slate-400">
                {isDragActive ? <Upload className="h-full w-full" /> : <Video className="h-full w-full" />}
              </div>
              <div>
                <p className="text-lg font-medium text-slate-900">
                  {isDragActive ? "Drop your video here" : "Upload lecture video"}
                </p>
                <p className="text-sm text-slate-500">Drag and drop an MP4 file here, or click to select</p>
                <p className="text-xs text-slate-400 mt-2">Maximum file size: 2GB</p>
              </div>
              <Button variant="outline" className="mt-4">
                Select Video File
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
