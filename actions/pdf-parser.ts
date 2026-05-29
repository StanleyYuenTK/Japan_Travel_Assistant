// actions/pdf-parser.ts
'use server'

import PDFParser from 'pdf2json'

export async function parsePDF(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser()

    pdfParser.on('pdfParser_dataError', (errData) => {
      console.error('PDF parse error:', errData)
      reject(new Error(`PDF 解析失敗: ${errData}`))
    })

    pdfParser.on('pdfParser_dataReady', (pdfData) => {
      const text = pdfData.Pages.map((page: any) =>
        page.Texts.map((text: any) =>
          decodeURIComponent(text.R[0].T)
        ).join(' ')
      ).join('\n')

      resolve(text)
    })

    // 直接傳入 Buffer
    pdfParser.parseBuffer(buffer)
  })
}