import { embed } from "ai"
import type { FileSource } from "@/types/rag"

// 文档块类型
export type DocumentChunk = {
  id: string
  sourceId: string
  content: string
  embedding: number[]
  metadata: {
    page?: number
    chunkIndex: number
  }
}

// 简单的内存向量存储
class RAGStore {
  private chunks: DocumentChunk[] = []
  private sources: FileSource[] = []

  // 添加文档块
  async addChunks(chunks: DocumentChunk[]) {
    this.chunks.push(...chunks)
  }

  // 添加来源
  addSource(source: FileSource) {
    this.sources.push(source)
  }

  // 移除来源及其所有块
  removeSource(sourceId: string) {
    this.sources = this.sources.filter((s) => s.id !== sourceId)
    this.chunks = this.chunks.filter((c) => c.sourceId !== sourceId)
  }

  // 获取所有来源
  getSources(): FileSource[] {
    return this.sources
  }

  // 获取选中的来源
  getSelectedSources(): FileSource[] {
    return this.sources.filter((s) => s.selected)
  }

  // 更新来源选择状态
  updateSourceSelection(sourceId: string, selected: boolean) {
    const source = this.sources.find((s) => s.id === sourceId)
    if (source) {
      source.selected = selected
    }
  }

  // 计算余弦相似度
  private cosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) return 0
    let dotProduct = 0
    let norm1 = 0
    let norm2 = 0
    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i]
      norm1 += vec1[i] * vec1[i]
      norm2 += vec2[i] * vec2[i]
    }
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2))
  }

  // 检索相关文档块
  async retrieve(query: string, topK: number = 5, sourceIds?: string[]): Promise<DocumentChunk[]> {
    // 过滤块（如果指定了来源）
    const filteredChunks = sourceIds
      ? this.chunks.filter((c) => sourceIds.includes(c.sourceId))
      : this.chunks

    // 尝试使用向量相似度搜索
    try {
      const { embedding: queryEmbedding } = await embed({
        model: "openai/text-embedding-3-small",
        value: query,
      })

      // 只对有效向量进行相似度计算
      const chunksWithEmbeddings = filteredChunks.filter((c) => c.embedding.length > 0)
      
      if (chunksWithEmbeddings.length > 0) {
        // 计算相似度并排序
        const scoredChunks = chunksWithEmbeddings.map((chunk) => ({
          chunk,
          score: this.cosineSimilarity(queryEmbedding, chunk.embedding),
        }))

        scoredChunks.sort((a, b) => b.score - a.score)

        // 返回top K结果
        return scoredChunks.slice(0, topK).map((item) => item.chunk)
      }
    } catch (embedError) {
      // 只在开发模式下显示详细错误信息
      if (process.env.NODE_ENV === 'development') {
        console.warn("Embedding retrieval failed, using text-based search:", embedError)
      }
    }

    // 回退到简单的文本匹配搜索
    const queryLower = query.toLowerCase()
    const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 2) // 过滤短词

    if (queryWords.length === 0) {
      // 如果没有有效的查询词，返回前几个块
      return filteredChunks.slice(0, topK)
    }

    // 计算文本匹配分数
    const scoredChunks = filteredChunks.map((chunk) => {
      const contentLower = chunk.content.toLowerCase()
      let score = 0

      // 计算关键词匹配
      for (const word of queryWords) {
        const matches = (contentLower.match(new RegExp(word, 'g')) || []).length
        score += matches
      }

      // 如果包含完整查询，给予额外分数
      if (contentLower.includes(queryLower)) {
        score += 10
      }

      return { chunk, score }
    })

    scoredChunks.sort((a, b) => b.score - a.score)

    // 返回top K结果（至少返回一些结果，即使分数为0）
    const results = scoredChunks.slice(0, topK).map((item) => item.chunk)
    return results.length > 0 ? results : filteredChunks.slice(0, topK)
  }

  // 获取来源的所有块
  getChunksBySource(sourceId: string): DocumentChunk[] {
    return this.chunks.filter((c) => c.sourceId === sourceId)
  }

  // 清空所有数据
  clear() {
    this.chunks = []
    this.sources = []
  }
}

// 单例实例
const ragStore = new RAGStore()

export default ragStore

