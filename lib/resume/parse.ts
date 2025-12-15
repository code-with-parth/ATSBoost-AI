import type { Buffer } from 'node:buffer'

export async function extractTextFromResume(params: {
  buffer: Buffer
  mimeType: string
  filename?: string
}) {
  const { buffer, mimeType, filename } = params
  const lowerName = filename?.toLowerCase() || ''

  const isPdf = mimeType === 'application/pdf' || lowerName.endsWith('.pdf')
  const isDocx =
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    lowerName.endsWith('.docx')

  if (isPdf) {
    const pdfParseModule = await import('pdf-parse')
    const pdfParse = (pdfParseModule as unknown as { default: (b: Buffer) => Promise<{ text: string }> })
      .default
    const data = await pdfParse(buffer)
    return data.text || ''
  }

  if (isDocx) {
    const mammothModule = await import('mammoth')
    const mammoth = mammothModule as unknown as {
      extractRawText: (opts: { buffer: Buffer }) => Promise<{ value: string }>
    }

    const { value } = await mammoth.extractRawText({ buffer })
    return value || ''
  }

  throw new Error('Unsupported file type. Please upload a PDF or DOCX.')
}
