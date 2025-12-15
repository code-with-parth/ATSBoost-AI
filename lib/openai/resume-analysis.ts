import OpenAI from 'openai'
import { z } from 'zod'

const resumeAnalysisSchema = z.object({
  ats_score: z.coerce.number().int().min(0).max(100),
  summary: z.string(),
  missing_keywords: z.array(z.string()).default([]),
  recommendations: z.array(z.string()).default([]),
  optimized_resume_text: z.string(),
  cover_letter: z.string(),
})

export type ResumeAnalysis = z.infer<typeof resumeAnalysisSchema>

function extractJson(content: string) {
  try {
    return JSON.parse(content)
  } catch {
    const start = content.indexOf('{')
    const end = content.lastIndexOf('}')
    if (start === -1 || end === -1 || end <= start) throw new Error('Invalid JSON response')
    return JSON.parse(content.slice(start, end + 1))
  }
}

export async function analyzeResumeWithOpenAI(params: {
  resumeText: string
  jobDescription: string
}) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY environment variable')
  }

  const client = new OpenAI({ apiKey })

  const system =
    'You are an expert ATS resume reviewer. You must only use facts present in the provided resume. Do not invent employers, schools, dates, certifications, or metrics. If information is missing, use placeholders like "[Add metric]". Output strictly valid JSON only.'

  const user = `RESUME (plain text):\n${params.resumeText}\n\nJOB DESCRIPTION:\n${params.jobDescription}\n\nReturn JSON with keys:\n- ats_score: integer 0-100\n- summary: string (1-3 sentences)\n- missing_keywords: string[] (important missing keywords)\n- recommendations: string[] (actionable bullets)\n- optimized_resume_text: string (full ATS-optimized resume in plain text with clear section headings and bullets)\n- cover_letter: string (tailored cover letter, <= 350 words)`

  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.2,
    max_tokens: 2200,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  })

  const content = completion.choices[0]?.message?.content
  if (!content) throw new Error('OpenAI returned an empty response')

  const parsed = resumeAnalysisSchema.parse(extractJson(content))

  return {
    analysis: parsed,
    model: completion.model,
    usage: completion.usage,
    raw: content,
  }
}
