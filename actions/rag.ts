"use server"

import { embed } from "ai"
import ragStore from "@/lib/rag-store"
import type { FileSource } from "@/types/rag"
import type { Language } from "@/lib/i18n"

async function getOllamaEmbedding(text: string): Promise<number[]> {
  try {
    const response = await fetch("http://localhost:11434/api/embeddings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "nomic-embed-text:latest", // 推薦：輕量、支援中英
        prompt: text,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Ollama error ${response.status}: ${err}`)
    }

    const data = await response.json()
    return data.embedding || []
  } catch (error) {
    console.warn("Ollama embedding failed:", error)
    return [] // 失敗時返回空向量，後面會用文字搜尋
  }
}

// 将文本分块
function chunkText(text: string, chunkSize: number = 500, overlap: number = 50): string[] {
  const chunks: string[] = []
  const maxChunks = 5000 // 最大块数限制，防止数组过大
  const safeOverlap = Math.min(Math.max(0, overlap), chunkSize - 1) // 确保 overlap 在合理范围内

  // 如果文本太大，先截断（防止内存问题）
  const maxTextLength = maxChunks * chunkSize
  const textToProcess = text.length > maxTextLength ? text.substring(0, maxTextLength) : text

  let start = 0
  const textLength = textToProcess.length

  while (start < textLength && chunks.length < maxChunks) {
    const end = Math.min(start + chunkSize, textLength)
    const chunk = textToProcess.slice(start, end)

    if (chunk.length > 0) {
      chunks.push(chunk)
    }

    // 移动到下一个块的起始位置（考虑 overlap）
    if (end >= textLength) {
      break // 已经到达文本末尾
    }

    start = Math.max(start + 1, end - safeOverlap) // 确保 start 总是前进
  }

  if (chunks.length >= maxChunks) {
    console.warn(`Text chunking reached maximum limit of ${maxChunks} chunks. Some text may be truncated.`)
  }

  return chunks
}

// 处理TXT文件
async function extractTextFromTXT(buffer: Buffer): Promise<string> {
  return buffer.toString("utf-8")
}

// 处理PDF文件（新增）
// 設定 worker（僅在 server）
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const { parsePDF } = await import('./pdf-parser');
  return await parsePDF(buffer);
}

// 从URL提取文本
async function extractTextFromURL(url: string): Promise<string> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`)
    }
    const html = await response.text()

    // 简单的HTML文本提取（移除标签）
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()

    return text
  } catch (error) {
    throw new Error(`Failed to extract text from URL: ${error}`)
  }
}

// 上传并处理文件（主要修改處）
export async function uploadFile(
  formData: FormData,
  language: Language = "en"
): Promise<{ success: boolean; source?: FileSource; error?: string }> {
  try {
    const file = formData.get("file") as File | null
    const url = formData.get("url") as string | null

    if (!file && !url) {
      return {
        success: false,
        error: language === "zh" ? "請提供檔案或URL" : "Please provide a file or URL",
      }
    }

    // 文件大小限制 5MB
    const MAX_FILE_SIZE = 5 * 1024 * 1024
    if (file && file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: language === "zh" ? "檔案大小超過5MB限制" : "File size exceeds 5MB limit",
      }
    }

    let text: string
    let sourceName: string
    let sourceType: "txt" | "url" | "pdf" = "url"  // 新增 pdf

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const fileName = file.name.toLowerCase()
      sourceName = file.name

      if (fileName.endsWith(".txt")) {
        sourceType = "txt"
        text = await extractTextFromTXT(buffer)
      } else if (fileName.endsWith(".pdf")) {
        sourceType = "pdf"
        text = await extractTextFromPDF(buffer)
      } else {
        return {
          success: false,
          error: language === "zh"
            ? "僅支援 .txt 和 .pdf 檔案格式"
            : "Only .txt and .pdf file formats are supported",
        }
      }
    } else if (url) {
      sourceType = "url"
      sourceName = url
      text = await extractTextFromURL(url)
    } else {
      return { success: false, error: "Invalid input" }
    }

    // 创建来源
    const source: FileSource = {
      id: crypto.randomUUID(),
      name: sourceName,
      type: sourceType,
      url: url || undefined,
      uploadedAt: new Date(),
      selected: true,
    }

    // 文本長度限制
    const MAX_TEXT_LENGTH = 5000 * 500
    if (text.length > MAX_TEXT_LENGTH) {
      return {
        success: false,
        error: language === "zh"
          ? `文本太長（${Math.round(text.length / 1024 / 100) / 10}MB）。最大支援 2.5MB 文本。`
          : `Text too long (${Math.round(text.length / 1024 / 100) / 10}MB). Max 2.5MB supported.`,
      }
    }

    // 分块
    const chunks = chunkText(text)

    if (chunks.length === 0) {
      return {
        success: false,
        error: language === "zh" ? "無法從檔案中提取文本" : "Unable to extract text from file",
      }
    }

    // 生成嵌入向量（批次處理，保留你原本的錯誤處理）
    // === 改用 Ollama 批次產生 embedding ===
    console.log(`Generating embeddings for ${chunks.length} chunks...`)
    const embeddings = await Promise.all(
      chunks.map(async (chunk) => {
        const embedding = await getOllamaEmbedding(chunk)
        return { embedding }
      })
    )

    // 创建文档块
    const documentChunks = chunks.map((chunk, index) => ({
      id: crypto.randomUUID(),
      sourceId: source.id,
      content: chunk,
      embedding: embeddings[index]?.embedding || [],
      metadata: {
        chunkIndex: index,
      },
    }))

    // 存入 store
    ragStore.addSource(source)
    await ragStore.addChunks(documentChunks)

    return { success: true, source }
  } catch (error: any) {
    console.error("Error uploading file:", error)
    return {
      success: false,
      error: error.message || (language === "zh" ? "上傳失敗" : "Upload failed"),
    }
  }
}

// 检索相关文档
export async function retrieveDocuments(
  query: string,
  topK: number = 5
): Promise<{ chunks: Array<{ content: string; sourceId: string }> }> {
  const allSources = ragStore.getSources()
  const selectedSources = ragStore.getSelectedSources()
  const sourceIds = selectedSources.length > 0 ? selectedSources.map((s) => s.id) : undefined

  console.log("RAG retrieve - All sources:", allSources.length, "Selected:", selectedSources.length)

  const chunks = await ragStore.retrieve(query, topK, sourceIds)

  console.log("RAG retrieve - Found chunks:", chunks.length, "for query:", query.substring(0, 50))

  return {
    chunks: chunks.map((chunk) => ({
      content: chunk.content,
      sourceId: chunk.sourceId,
    })),
  }
}

// 获取所有来源
export async function getSources(): Promise<FileSource[]> {
  return ragStore.getSources()
}

// 更新来源选择状态
export async function updateSourceSelection(sourceId: string, selected: boolean): Promise<void> {
  ragStore.updateSourceSelection(sourceId, selected)
}

// 删除来源
export async function removeSource(sourceId: string): Promise<void> {
  ragStore.removeSource(sourceId)
}

