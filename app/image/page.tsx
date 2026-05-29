"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Upload, Sparkles, UserX, RefreshCw, X } from "lucide-react"
import { NavSidebar } from "@/components/nav-sidebar"
import { RAGSidebar } from "@/components/rag-sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSwitcher } from "@/components/language-switcher"
import { toast } from "sonner"
import axios from "axios";

const PY_BACKEND_URL = process.env.NEXT_PUBLIC_PY_BACKEND_URL ?? "http://localhost:8000";

export default function ImagePage() {
  const [language, setLanguage] = useState<"en" | "zh">("en")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }, [])

  const handleFile = (file: File) => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
        toast.success(language === "zh" ? "圖片已上傳" : "Image uploaded successfully")
      }
      reader.readAsDataURL(file)
    } else {
      toast.error(language === "zh" ? "請上傳圖片檔案" : "Please upload an image file")
    }
  }

  const handleBeautify = async () => {
    if (!uploadedImage) {
      toast.error(
        language === "zh" ? "請先上傳圖片" : "Please upload an image first"
      );
      return;
    }

    setIsProcessing(true);
    try {
      const blob = await (await fetch(uploadedImage)).blob();
      const formData = new FormData();
      formData.append("file", blob, "upload.jpg");

      const resp = await axios.post<{ image: string }>(
        "/api/upscale",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 60_000,
        }
      );

      setProcessedImage(`data:image/png;base64,${resp.data.image}`);
      toast.success(
        language === "zh" ? "圖片美化成功" : "Image beautified successfully"
      );
    } catch (err: any) {
      console.error(err);
      toast.error(
        language === "zh"
          ? "美化失敗，請稍後再試"
          : "Beautify failed, please try again later"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // const handleRemovePeople = async () => {
  //   if (!uploadedImage) {
  //     toast.error(language === "zh" ? "請先上傳圖片" : "Please upload an image first")
  //     return
  //   }
  //   setIsProcessing(true)
  //   // Simulate image processing
  //   setTimeout(() => {
  //     setProcessedImage(uploadedImage)
  //     setIsProcessing(false)
  //     toast.success(language === "zh" ? "已移除途人" : "People removed from image")
  //   }, 2000)
  // }
  const handleRemovePeople = async () => {
    if (!uploadedImage) {
      toast.error(language === "zh" ? "請先上傳圖片" : "Please upload an image first");
      return;
    }

    setIsProcessing(true);
    try {
      const blob = await (await fetch(uploadedImage)).blob();
      const formData = new FormData();
      formData.append("file", blob, "upload.jpg");

      const resp = await axios.post<{ image: string }>(
        `${PY_BACKEND_URL}/api/remove-people`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 300_000,
        }
      );

      setProcessedImage(`data:image/png;base64,${resp.data.image}`);
      toast.success(language === "zh" ? "已移除途人" : "People removed");
    } catch (err: any) {
      toast.error(language === "zh" ? "移除失敗" : "Remove failed");
    } finally {
      setIsProcessing(false);
    }
  }

  const handleChangeImage = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        handleFile(file)
        setProcessedImage(null)
      }
    }
    input.click()
  }

  const handleRemoveImage = () => {
    setUploadedImage(null)
    setProcessedImage(null)
    toast.success(language === "zh" ? "圖片已移除" : "Image removed")
  }

  const handleDownload = () => {
    if (!processedImage) {
      toast.error(language === "zh" ? "沒有已處理的圖片可下載" : "No processed image to download")
      return
    }

    const link = document.createElement("a")
    link.href = processedImage
    link.download = "processed-image.png"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success(language === "zh" ? "圖片已下載" : "Image downloaded")
  }

  return (
    <main className="flex h-screen flex-col">
      <header className="border-b border-border bg-card">
        <div className="flex h-14 items-center justify-between px-3 sm:h-16 sm:px-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary sm:h-10 sm:w-10">
              <Sparkles className="h-4 w-4 text-primary-foreground sm:h-5 sm:w-5" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground sm:text-lg">
                {language === "zh" ? "TravelSafe" : "TravelSafe"}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher currentLanguage={language} onLanguageChange={setLanguage} />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <NavSidebar />

        <div className="flex-1 flex items-center justify-center p-8 bg-background overflow-auto">
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Section */}
            <div className="flex flex-col gap-4">
              <Card
                className={`relative flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed transition-colors ${dragActive ? "border-primary bg-primary/5" : "border-border"
                  }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {uploadedImage && (
                  <div className="absolute top-3 right-3 flex gap-2 z-10">
                    <Button size="icon" variant="secondary" onClick={handleChangeImage} className="h-8 w-8">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="secondary" onClick={handleRemoveImage} className="h-8 w-8">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {uploadedImage ? (
                  <img
                    src={uploadedImage || "/placeholder.svg"}
                    alt="Uploaded"
                    className="max-h-[380px] max-w-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-4 p-8 text-center">
                    <Upload className="h-16 w-16 text-muted-foreground" />
                    <div>
                      <p className="text-lg font-semibold text-foreground">
                        {language === "zh" ? "拖放圖片到此處" : "Drag and drop your image here"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {language === "zh" ? "或點擊瀏覽" : "or click to browse"}
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                )}
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleBeautify}
                  disabled={!uploadedImage || isProcessing}
                  className="flex-1"
                  variant="default"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {language === "zh" ? "美化圖片" : "Beautify Image"}
                </Button>
                <Button
                  onClick={handleRemovePeople}
                  disabled={!uploadedImage || isProcessing}
                  className="flex-1"
                  variant="default"
                >
                  <UserX className="mr-2 h-4 w-4" />
                  {language === "zh" ? "移除途人" : "Remove People"}
                </Button>
              </div>
            </div>

            {/* Processed Image Section */}
            <div className="flex flex-col gap-4">
              <Card className="relative flex flex-col items-center justify-center min-h-[400px] border-2">
                {processedImage && (
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={handleDownload}
                    className="absolute top-3 right-3 z-10 h-8 w-8"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
                {processedImage ? (
                  <img
                    src={processedImage || "/placeholder.svg"}
                    alt="Processed"
                    className="max-h-[380px] max-w-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-4 p-8 text-center">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                      <Sparkles className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-foreground">
                        {language === "zh" ? "處理後的圖片將顯示在此" : "Processed image will appear here"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {isProcessing
                          ? language === "zh"
                            ? "處理中..."
                            : "Processing..."
                          : language === "zh"
                            ? "上傳並處理圖片以查看結果"
                            : "Upload and process an image to see results"}
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>

        <RAGSidebar language={language} />
      </div>
    </main>
  )
}
