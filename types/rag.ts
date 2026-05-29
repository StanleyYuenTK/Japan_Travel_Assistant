export type FileSource = {
  id: string
  name: string
  type: "pdf" | "txt" | "url"
  url?: string
  uploadedAt: Date
  selected: boolean
}

export type RAGState = {
  sources: FileSource[]
  selectedSources: FileSource[]
}
