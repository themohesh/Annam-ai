"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Download, FileText, HelpCircle, Clock, CheckCircle2 } from "lucide-react"
import type { VideoProcessingData } from "@/app/page"

interface TranscriptionResultsProps {
  data: VideoProcessingData
  onNewUpload: () => void
}

export function TranscriptionResults({ data, onNewUpload }: TranscriptionResultsProps) {
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const exportTranscript = () => {
    if (!data.transcript) return

    const content = data.transcript
      .map((segment) => `[${formatTime(segment.startTime)} - ${formatTime(segment.endTime)}]\n${segment.text}`)
      .join("\n\n")

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${data.filename}_transcript.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportQuestions = () => {
    if (!data.questions) return

    const content = data.questions
      .map((questionSet, index) => {
        const header = `Segment ${index + 1} (${formatTime(questionSet.startTime)} - ${formatTime(questionSet.endTime)})\n${"=".repeat(50)}`
        const questions = questionSet.questions
          .map((q, qIndex) => {
            const options = q.options.map((opt, optIndex) => `${String.fromCharCode(65 + optIndex)}. ${opt}`).join("\n")
            const correct = `Correct Answer: ${String.fromCharCode(65 + q.correctAnswer)}`
            return `${qIndex + 1}. ${q.question}\n${options}\n${correct}\n`
          })
          .join("\n")
        return `${header}\n\n${questions}`
      })
      .join("\n\n")

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${data.filename}_questions.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Processing Complete: {data.filename}
              </CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                Generated {data.transcript?.length || 0} segments and{" "}
                {data.questions?.reduce((acc, qs) => acc + qs.questions.length, 0) || 0} questions
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={exportTranscript} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Transcript
              </Button>
              <Button onClick={exportQuestions} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Questions
              </Button>
              <Button onClick={onNewUpload} size="sm">
                New Upload
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="transcript" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transcript" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Transcript
          </TabsTrigger>
          <TabsTrigger value="questions" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            Questions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transcript" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Video Transcript</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] w-full">
                <div className="space-y-4">
                  {data.transcript?.map((segment, index) => (
                    <div key={segment.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
                        </Badge>
                        <span className="text-sm text-slate-500">Segment {index + 1}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{segment.text}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Segments</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {data.questions?.map((questionSet, index) => (
                      <Button
                        key={questionSet.segmentId}
                        variant={selectedSegment === questionSet.segmentId ? "default" : "outline"}
                        className="w-full justify-start"
                        onClick={() => setSelectedSegment(questionSet.segmentId)}
                      >
                        <div className="text-left">
                          <div className="font-medium">Segment {index + 1}</div>
                          <div className="text-xs opacity-70">
                            {formatTime(questionSet.startTime)} - {formatTime(questionSet.endTime)}
                          </div>
                          <div className="text-xs opacity-70">{questionSet.questions.length} questions</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>
                  {selectedSegment
                    ? `Questions for ${
                        data.questions?.find((qs) => qs.segmentId === selectedSegment)
                          ? `Segment ${data.questions.findIndex((qs) => qs.segmentId === selectedSegment) + 1}`
                          : "Selected Segment"
                      }`
                    : "Select a segment to view questions"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  {selectedSegment ? (
                    <div className="space-y-6">
                      {data.questions
                        ?.find((qs) => qs.segmentId === selectedSegment)
                        ?.questions.map((question, qIndex) => (
                          <div key={question.id} className="border rounded-lg p-4">
                            <h4 className="font-medium mb-3">
                              {qIndex + 1}. {question.question}
                            </h4>
                            <div className="space-y-2">
                              {question.options.map((option, optIndex) => (
                                <div
                                  key={optIndex}
                                  className={`p-2 rounded border ${
                                    optIndex === question.correctAnswer
                                      ? "bg-green-50 border-green-200 text-green-800"
                                      : "bg-slate-50 border-slate-200"
                                  }`}
                                >
                                  <span className="font-medium mr-2">{String.fromCharCode(65 + optIndex)}.</span>
                                  {option}
                                  {optIndex === question.correctAnswer && (
                                    <CheckCircle2 className="h-4 w-4 text-green-600 inline ml-2" />
                                  )}
                                </div>
                              ))}
                            </div>
                            {question.explanation && (
                              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                                <p className="text-sm text-blue-800">
                                  <strong>Explanation:</strong> {question.explanation}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-500">
                      <div className="text-center">
                        <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Select a segment from the left to view its questions</p>
                      </div>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
