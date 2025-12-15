'use client'

import { useCallback, useMemo, useRef, useState, type DragEvent } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { FileText, Loader2, UploadCloud, Download } from 'lucide-react'
import { QuotaDisplay } from '@/components/quota-display'

type AnalyzeResponse = {
  analysisId: string
  resumeId: string
  atsScore: number
  summary: string
  missingKeywords: string[]
  recommendations: string[]
  optimizedResumeText: string
  coverLetter: string
  optimizedPdfUrl: string
}

export default function AnalyzePage() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<AnalyzeResponse | null>(null)

  const onPickFile = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const validateFile = useCallback((f: File) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]

    if (!allowed.includes(f.type)) {
      toast.error('Unsupported file type. Please upload a PDF or DOCX.')
      return false
    }

    if (f.size > 10 * 1024 * 1024) {
      toast.error('File too large. Max size is 10MB.')
      return false
    }

    return true
  }, [])

  const setFileSafe = useCallback(
    (f: File) => {
      if (!validateFile(f)) return
      setResult(null)
      setFile(f)
    },
    [validateFile]
  )

  const onDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const dropped = e.dataTransfer.files?.[0]
      if (!dropped) return
      setFileSafe(dropped)
    },
    [setFileSafe]
  )

  const onSubmit = useCallback(async () => {
    if (!file) {
      toast.error('Please upload your resume (PDF or DOCX).')
      return
    }

    if (jobDescription.trim().length < 30) {
      toast.error('Please paste a job description (min 30 characters).')
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('jobDescription', jobDescription)

      const res = await fetch('/api/resume/analyze', {
        method: 'POST',
        body: formData,
      })

      const data = (await res.json()) as Partial<AnalyzeResponse> & { error?: string }

      if (!res.ok) {
        throw new Error(data.error || 'Analysis failed')
      }

      setResult(data as AnalyzeResponse)
      toast.success('Analysis complete!')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [file, jobDescription])

  const scoreValue = useMemo(() => {
    if (!result) return 0
    return Math.max(0, Math.min(100, result.atsScore))
  }, [result])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Resume Analysis</h1>
        <p className="mt-2 text-gray-600">
          Upload your resume and paste a job description to get an ATS score, tailored recommendations,
          an optimized resume, and a cover letter.
        </p>
      </div>

      <QuotaDisplay />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>1) Upload Resume</CardTitle>
            <CardDescription>PDF or DOCX, up to 10MB</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pdf,.docx"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) setFileSafe(f)
              }}
            />

            <div
              className={`rounded-lg border-2 border-dashed p-6 transition-colors ${
                isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
              }`}
              onDragEnter={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsDragging(true)
              }}
              onDragOver={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsDragging(true)
              }}
              onDragLeave={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsDragging(false)
              }}
              onDrop={onDrop}
            >
              <div className="flex flex-col items-center justify-center text-center gap-2">
                <UploadCloud className="h-8 w-8 text-gray-500" />
                <p className="text-sm text-gray-700">
                  Drag and drop your resume here, or{' '}
                  <button
                    type="button"
                    onClick={onPickFile}
                    className="text-blue-600 hover:text-blue-500 font-medium"
                  >
                    browse
                  </button>
                </p>
                <p className="text-xs text-gray-500">Only PDF/DOCX are supported</p>
              </div>
            </div>

            {file && (
              <div className="flex items-start justify-between gap-3 rounded-md border border-gray-200 p-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{Math.round(file.size / 1024)} KB</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFile(null)}
                  disabled={isLoading}
                >
                  Remove
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2) Job Description</CardTitle>
            <CardDescription>Paste the job posting or requirements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="jobDescription">Job description</Label>
              <Textarea
                id="jobDescription"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                className="min-h-[220px]"
                disabled={isLoading}
              />
            </div>

            <Button type="button" className="w-full" onClick={onSubmit} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Analyze Resume
            </Button>
          </CardContent>
        </Card>
      </div>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ATS Score</CardTitle>
              <CardDescription>{result.summary}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">{result.atsScore}/100</span>
                <span className="text-sm text-gray-500">Analysis ID: {result.analysisId}</span>
              </div>
              <Progress value={scoreValue} className="h-3" />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Missing Keywords</CardTitle>
                <CardDescription>High-impact keywords to consider</CardDescription>
              </CardHeader>
              <CardContent>
                {result.missingKeywords.length === 0 ? (
                  <p className="text-sm text-gray-600">No major missing keywords detected.</p>
                ) : (
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-800">
                    {result.missingKeywords.map((k) => (
                      <li key={k}>{k}</li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>What to change to improve shortlist odds</CardDescription>
              </CardHeader>
              <CardContent>
                {result.recommendations.length === 0 ? (
                  <p className="text-sm text-gray-600">No recommendations returned.</p>
                ) : (
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-800">
                    {result.recommendations.map((r, idx) => (
                      <li key={`${idx}-${r.slice(0, 20)}`}>{r}</li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Optimized Resume</CardTitle>
              <CardDescription>Download the PDF or copy/paste the text</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild>
                  <a href={result.optimizedPdfUrl} target="_blank" rel="noreferrer">
                    <Download className="mr-2 h-4 w-4" />
                    Download Optimized PDF
                  </a>
                </Button>
              </div>

              <pre className="whitespace-pre-wrap rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-900 max-h-[520px] overflow-auto">
                {result.optimizedResumeText}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cover Letter</CardTitle>
              <CardDescription>Tailored to the job description</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-900 max-h-[520px] overflow-auto">
                {result.coverLetter}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
