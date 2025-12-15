import PDFDocument from 'pdfkit'

export async function generateOptimizedResumePdf(params: {
  title?: string
  content: string
}) {
  const title = params.title ?? 'Optimized Resume'
  const content = params.content

  return await new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'LETTER',
      margin: 54,
      compress: true,
    })

    const chunks: Buffer[] = []

    doc.on('data', (chunk) => chunks.push(chunk as Buffer))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', (err) => reject(err))

    doc.fontSize(18).text(title, { align: 'center' })
    doc.moveDown()

    doc.fontSize(10)
    doc.text(content, {
      align: 'left',
      lineGap: 2,
    })

    doc.end()
  })
}
