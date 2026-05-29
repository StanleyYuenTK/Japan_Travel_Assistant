"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, FileText, LinkIcon, Check, ChevronLeft, ChevronRight, X, Loader2 } from "lucide-react"
import { getTranslation, type Language } from "@/lib/i18n"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import type { FileSource } from "@/types/rag"
import { uploadFile, getSources, updateSourceSelection, removeSource } from "@/actions/rag"

interface RAGSidebarProps {
  language: Language
}

export function RAGSidebar({ language }: RAGSidebarProps) {
  const t = (key: string) => getTranslation(language, key)
  const [sources, setSources] = useState<FileSource[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectAll, setSelectAll] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const urlInputRef = useRef<HTMLInputElement>(null)

  // 加载来源
  useEffect(() => {
    loadSources()
  }, [])

  const loadSources = async () => {
    const loadedSources = await getSources()
    setSources(loadedSources)
    setSelectAll(loadedSources.every((s) => s.selected))
  }

  const handleToggleSource = async (id: string) => {
    const source = sources.find((s) => s.id === id)
    if (source) {
      const newSelected = !source.selected
      await updateSourceSelection(id, newSelected)
      setSources((prev) => prev.map((source) => (source.id === id ? { ...source, selected: newSelected } : source)))
    }
  }

  const handleSelectAll = async () => {
    const newSelectAll = !selectAll
    setSelectAll(newSelectAll)
    await Promise.all(sources.map((s) => updateSourceSelection(s.id, newSelectAll)))
    setSources((prev) => prev.map((source) => ({ ...source, selected: newSelectAll })))
  }

  const handleRemoveSource = async (id: string) => {
    await removeSource(id)
    setSources((prev) => prev.filter((source) => source.id !== id))
    toast.success(language === "zh" ? "已移除來源" : "Source removed")
  }

  const handleAddSource = async () => {
    const file = fileInputRef.current?.files?.[0]
    const url = urlInputRef.current?.value?.trim()

    if (!file && !url) {
      toast.error(language === "zh" ? "請選擇檔案或輸入URL" : "Please select a file or enter a URL")
      return
    }

    // 客户端文件大小检查（5MB限制）
    const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
    if (file && file.size > MAX_FILE_SIZE) {
      toast.error(language === "zh" ? "檔案大小超過5MB限制" : "File size exceeds 5MB limit")
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      if (file) {
        formData.append("file", file)
      }
      if (url) {
        formData.append("url", url)
      }

      const result = await uploadFile(formData, language)

      if (result.success && result.source) {
        setSources((prev) => [...prev, result.source!])
        toast.success(language === "zh" ? "檔案已上傳並處理" : "File uploaded and processed")
        setIsAddDialogOpen(false)
        // 重置表单
        if (fileInputRef.current) fileInputRef.current.value = ""
        if (urlInputRef.current) urlInputRef.current.value = ""
      } else {
        toast.error(result.error || (language === "zh" ? "上傳失敗" : "Upload failed"))
      }
    } catch (error: any) {
      console.error("Error uploading:", error)
      toast.error(error.message || (language === "zh" ? "上傳失敗" : "Upload failed"))
    } finally {
      setIsUploading(false)
    }
  }

  const truncateFileName = (name: string, maxLength = 13) => {
    return name.length > maxLength ? name.substring(0, maxLength) + "..." : name
  }

  const SimpleCheckbox = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className="flex h-4 w-4 items-center justify-center rounded border border-primary bg-transparent hover:bg-primary/10 shrink-0"
    >
      {checked && <Check className="h-3 w-3 text-primary" />}
    </button>
  )

  return (
    <div
      className={`flex flex-col border-r border-border bg-card transition-all ${isCollapsed ? "w-12" : "w-64"} h-screen`}
    >
      {/* Header with collapse button */}
      <div className="flex items-center justify-between border-b border-border p-4">
        {!isCollapsed && (
          <h2 className="text-sm font-semibold text-foreground">{language === "zh" ? "來源" : "Sources"}</h2>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex h-6 w-6 items-center justify-center rounded hover:bg-muted ml-auto"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {!isCollapsed && (
        <>
          <div className="flex gap-2 p-4">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Plus className="mr-2 h-4 w-4" />
                  {language === "zh" ? "新增" : "Add"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{language === "zh" ? "新增檔案來源" : "Add File Source"}</DialogTitle>
                  <DialogDescription>
                    {language === "zh" ? "上傳 TXT 檔案或添加超連結" : "Upload TXT files or add a URL"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">{language === "zh" ? "PDF / TXT 檔案" : "PDF / TXT File"}</label>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt,.pdf"
                      className="mt-2"
                      disabled={isUploading}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">{language === "zh" ? "超連結 (URL)" : "Link (URL)"}</label>
                    <Input
                      ref={urlInputRef}
                      type="url"
                      placeholder="https://example.com"
                      className="mt-2"
                      disabled={isUploading}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleAddSource()
                        }
                      }}
                    />
                  </div>
                  <Button onClick={handleAddSource} className="w-full" disabled={isUploading}>
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {language === "zh" ? "處理中..." : "Processing..."}
                      </>
                    ) : (
                      language === "zh" ? "上傳" : "Upload"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {sources.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2">
              <SimpleCheckbox checked={selectAll} onChange={handleSelectAll} />
              <label className="cursor-pointer text-sm text-muted-foreground">
                {language === "zh" ? "選取所有來源" : "Select all sources"}
              </label>
            </div>
          )}

          {/* Sources List */}
          <ScrollArea className="flex-1">
            <div className="space-y-2 px-4 py-2">
              {sources.map((source) => (
                <Card key={source.id} className="flex items-center gap-3 p-3 hover:bg-muted">
                  <SimpleCheckbox checked={source.selected} onChange={() => handleToggleSource(source.id)} />
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {source.type === "txt" && <FileText className="h-4 w-4 shrink-0 text-green-500" />}
                    {source.type === "url" && <LinkIcon className="h-4 w-4 shrink-0 text-blue-500" />}
                    {source.type === "pdf" && <FileText className="h-4 w-4 shrink-0 text-red-500" />} {/* 或用自訂 PDF icon */}
                    <span className="truncate text-xs font-medium" title={source.name}>
                      {truncateFileName(source.name, 13)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveSource(source.id)}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  )
}
