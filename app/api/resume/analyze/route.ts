import { NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { createClient } from '@/lib/supabase/server'
import { extractTextFromResume } from '@/lib/resume/parse'
import { analyzeResumeWithOpenAI } from '@/lib/openai/resume-analysis'
import { estimateTokens, normalizeText } from '@/lib/text/normalize'
import { generateOptimizedResumePdf } from '@/lib/resume/pdf'
import { enforceQuota } from '@/lib/quota'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120) || 'resume'
}

function isAllowedMime(mime: string) {
  return (
    mime === 'application/pdf' ||
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  )
}

function inferMimeType(file: File) {
  if (file.type) return file.type
  const lower = file.name.toLowerCase()
  if (lower.endsWith('.pdf')) return 'application/pdf'
  if (lower.endsWith('.docx')) {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  }
  return ''
}

export async function POST(request: Request) {
  const supabase = createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check quota before processing
  try {
    await enforceQuota(user.id)
  } catch (quotaError) {
    const message = quotaError instanceof Error ? quotaError.message : 'Quota check failed'
    return NextResponse.json({ error: message }, { status: 429 })
  }

  let analysisId: string | null = null

  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const jobDescription = formData.get('jobDescription')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Resume file is required' }, { status: 400 })
    }

    if (typeof jobDescription !== 'string' || jobDescription.trim().length < 30) {
      return NextResponse.json(
        { error: 'Job description is required (min 30 characters)' },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'File too large. Max size is 10MB.' },
        { status: 400 }
      )
    }

    const mimeType = inferMimeType(file)
    if (!isAllowedMime(mimeType)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload a PDF or DOCX.' },
        { status: 400 }
      )
    }

    analysisId = randomUUID()
    const resumeId = randomUUID()

    const safeName = sanitizeFileName(file.name)
    const rawPath = `${user.id}/${analysisId}/raw/${safeName}`

    const fileBuffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(rawPath, fileBuffer, {
        contentType: mimeType,
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      )
    }

    const extractedText = await extractTextFromResume({
      buffer: fileBuffer,
      mimeType,
      filename: file.name,
    })

    let normalizedResumeText = normalizeText(extractedText, { maxChars: 24000 })
    let normalizedJobDescription = normalizeText(jobDescription, { maxChars: 12000 })

    const MAX_RESUME_TOKENS_EST = 6000
    const MAX_JD_TOKENS_EST = 3500

    const resumeTokensEstimateInitial = estimateTokens(normalizedResumeText)
    if (resumeTokensEstimateInitial > MAX_RESUME_TOKENS_EST) {
      normalizedResumeText = normalizeText(normalizedResumeText, {
        maxChars: MAX_RESUME_TOKENS_EST * 4,
      })
    }

    const jobTokensEstimateInitial = estimateTokens(normalizedJobDescription)
    if (jobTokensEstimateInitial > MAX_JD_TOKENS_EST) {
      normalizedJobDescription = normalizeText(normalizedJobDescription, {
        maxChars: MAX_JD_TOKENS_EST * 4,
      })
    }

    const resumeTokensEstimate = estimateTokens(normalizedResumeText)
    const jobTokensEstimate = estimateTokens(normalizedJobDescription)

    if (normalizedResumeText.length < 100) {
      await supabase.storage.from('resumes').remove([rawPath])

      return NextResponse.json(
        {
          error:
            'Could not extract enough text from this resume. Please upload a text-based PDF/DOCX (not an image scan).',
        },
        { status: 422 }
      )
    }

    const { error: resumeInsertError } = await supabase.from('resumes').insert({
      id: resumeId,
      user_id: user.id,
      original_filename: file.name,
      mime_type: mimeType,
      storage_bucket: 'resumes',
      storage_path: rawPath,
      extracted_text: extractedText,
      normalized_text: normalizedResumeText,
    })

    if (resumeInsertError) {
      return NextResponse.json(
        { error: `Failed to save resume: ${resumeInsertError.message}` },
        { status: 500 }
      )
    }

    const { error: analysisInsertError } = await supabase.from('analyses').insert({
      id: analysisId,
      user_id: user.id,
      resume_id: resumeId,
      job_description: jobDescription,
      normalized_job_description: normalizedJobDescription,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      result: {
        resume_tokens_estimate: resumeTokensEstimate,
        job_description_tokens_estimate: jobTokensEstimate,
      },
    })

    if (analysisInsertError) {
      return NextResponse.json(
        { error: `Failed to create analysis: ${analysisInsertError.message}` },
        { status: 500 }
      )
    }

    let openAiResult
    try {
      openAiResult = await analyzeResumeWithOpenAI({
        resumeText: normalizedResumeText,
        jobDescription: normalizedJobDescription,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'OpenAI request failed'
      await supabase
        .from('analyses')
        .update({
          status: 'failed',
          error_message: message,
          updated_at: new Date().toISOString(),
        })
        .eq('id', analysisId)

      return NextResponse.json(
        { error: message, analysisId },
        {
          status: 500,
        }
      )
    }

    const optimizedPdfBuffer = await generateOptimizedResumePdf({
      content: openAiResult.analysis.optimized_resume_text,
    })

    const optimizedPdfPath = `${user.id}/${analysisId}/optimized/optimized_resume.pdf`

    const { error: optimizedUploadError } = await supabase.storage
      .from('resumes')
      .upload(optimizedPdfPath, optimizedPdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      })

    if (optimizedUploadError) {
      await supabase
        .from('analyses')
        .update({
          status: 'failed',
          error_message: optimizedUploadError.message,
          updated_at: new Date().toISOString(),
        })
        .eq('id', analysisId)

      return NextResponse.json(
        { error: `Failed to upload optimized PDF: ${optimizedUploadError.message}`, analysisId },
        { status: 500 }
      )
    }

    const { data: signed, error: signedError } = await supabase.storage
      .from('resumes')
      .createSignedUrl(optimizedPdfPath, 60 * 60)

    if (signedError) {
      await supabase
        .from('analyses')
        .update({
          status: 'failed',
          error_message: signedError.message,
          updated_at: new Date().toISOString(),
        })
        .eq('id', analysisId)

      return NextResponse.json(
        { error: `Failed to create download link: ${signedError.message}`, analysisId },
        { status: 500 }
      )
    }

    const { error: analysisUpdateError } = await supabase
      .from('analyses')
      .update({
        status: 'completed',
        ats_score: openAiResult.analysis.ats_score,
        result: {
          resume_tokens_estimate: resumeTokensEstimate,
          job_description_tokens_estimate: jobTokensEstimate,
          summary: openAiResult.analysis.summary,
          missing_keywords: openAiResult.analysis.missing_keywords,
          recommendations: openAiResult.analysis.recommendations,
        },
        optimized_resume_text: openAiResult.analysis.optimized_resume_text,
        cover_letter: openAiResult.analysis.cover_letter,
        optimized_pdf_bucket: 'resumes',
        optimized_pdf_path: optimizedPdfPath,
        openai_model: openAiResult.model,
        prompt_tokens: openAiResult.usage?.prompt_tokens ?? null,
        completion_tokens: openAiResult.usage?.completion_tokens ?? null,
        total_tokens: openAiResult.usage?.total_tokens ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', analysisId)

    if (analysisUpdateError) {
      return NextResponse.json(
        { error: `Failed to save analysis results: ${analysisUpdateError.message}`, analysisId },
        { status: 500 }
      )
    }

    await supabase.from('usage_tracking').insert({
      user_id: user.id,
      action_type: 'resume_boost',
      metadata: { analysis_id: analysisId },
    })

    return NextResponse.json({
      analysisId,
      resumeId,
      atsScore: openAiResult.analysis.ats_score,
      summary: openAiResult.analysis.summary,
      missingKeywords: openAiResult.analysis.missing_keywords,
      recommendations: openAiResult.analysis.recommendations,
      optimizedResumeText: openAiResult.analysis.optimized_resume_text,
      coverLetter: openAiResult.analysis.cover_letter,
      optimizedPdfUrl: signed.signedUrl,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error'

    if (analysisId) {
      await supabase
        .from('analyses')
        .update({
          status: 'failed',
          error_message: message,
          updated_at: new Date().toISOString(),
        })
        .eq('id', analysisId)
    }

    return NextResponse.json({ error: message, analysisId }, { status: 500 })
  }
}
