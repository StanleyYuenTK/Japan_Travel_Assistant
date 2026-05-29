"use client"
// https://portal.azure.com/#home

// 語音識別類型定義
interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition
  new (): SpeechRecognition
}

declare var webkitSpeechRecognition: {
  prototype: SpeechRecognition
  new (): SpeechRecognition
}

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Sparkles, Loader2, Menu, Mic, Bot, Copy, Check } from "lucide-react"
import { generateItinerary, chatWithTools } from "@/actions/chat"
import type { Itinerary, ImageData } from "@/types/itinerary"
import type { WeatherData, ExchangeRateData } from "@/lib/api-client"
import { ItineraryCard } from "@/components/itinerary-card"
import { WeatherCard } from "@/components/weather-card"
import { ExchangeRateCard } from "@/components/exchange-rate-card"
import { ImageGallery } from "@/components/image-gallery"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeToggle } from "@/components/theme-toggle"
import { TTSButton } from "@/components/tts-button"
import { getTranslation, type Language } from "@/lib/i18n"
import { toast } from "sonner"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useRouter } from "next/navigation"
import { PersonalityModal } from "@/components/personality-modal"
import { RAGSidebar } from "@/components/rag-sidebar"
import { NavSidebar } from "@/components/nav-sidebar"
import { retrieveDocuments } from "@/actions/rag"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  itinerary?: Itinerary
  weatherData?: WeatherData
  exchangeData?: ExchangeRateData
  imageData?: ImageData
}

export function ChatInterface() {
  const router = useRouter()
  const [language, setLanguage] = useState<Language>("en")
  const t = (key: string) => getTranslation(language, key)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isPersonalityModalOpen, setIsPersonalityModalOpen] = useState(false)

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: t("welcomeMessage"),
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null)
  const isManualStopRef = useRef(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages, isLoading])

  // 清理語音識別資源
  useEffect(() => {
    return () => {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop()
        speechRecognitionRef.current = null
      }
    }
  }, [])

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang)
    setMessages((prev) =>
      prev.map((msg, idx) =>
        idx === 0 && msg.role === "assistant" ? { ...msg, content: getTranslation(newLang, "welcomeMessage") } : msg,
      ),
    )
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    const userInput = input
    setInput("")
    setIsLoading(true)

    try {
      const thinkingMsg: Message = { id: "thinking", role: "assistant", content: language === "zh" ? "思考緊..." : "thinking...", timestamp: new Date() }
      setMessages(prev => [...prev, thinkingMsg])

      // 检索相关文档（RAG）
      let ragContext = ""
      try {
        const retrieved = await retrieveDocuments(userInput, 5)
        console.log("RAG retrieval result:", {
          query: userInput,
          chunksFound: retrieved.chunks.length,
          chunks: retrieved.chunks.map(c => ({
            contentLength: c.content.length,
            sourceId: c.sourceId
          }))
        })
        if (retrieved.chunks.length > 0) {
          ragContext = "\n\n相關參考資料：\n" + retrieved.chunks.map((chunk, idx) => `[${idx + 1}] ${chunk.content}`).join("\n\n")
          console.log("RAG context added, length:", ragContext.length)
        } else {
          console.log("No RAG chunks found for query:", userInput)
        }
      } catch (ragError) {
        console.error("RAG retrieval error:", ragError)
        // 如果RAG检索失败，继续使用原始提示
      }

      // 喺 handleSend 入面，payload 之前加呢段
      const savedPersonality = typeof window !== "undefined"
        ? localStorage.getItem("travel_ai_personality")
        : null

      const personality = savedPersonality ? JSON.parse(savedPersonality) : null
      let systemPrompt = personality?.prompt || "你係旅行助手"

      // 如果有RAG上下文，添加到系统提示中
      if (ragContext) {
        systemPrompt += `\n\n**重要：你必須使用以下提供的資料來回答用戶的問題。這些資料是從用戶上傳的文檔中檢索到的，請直接基於這些資料回答，不要說你無法讀取文件。**\n\n相關參考資料：${ragContext}\n\n請基於以上資料回答用戶的問題。如果資料中有相關信息，請直接使用。如果資料中沒有相關信息，可以結合你的知識回答，但優先使用提供的資料。`
      }

      const payload = {
        model: "gemma3:1b",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userInput }
        ],
        stream: false
      }

      // const payload = {
      //   model: "gemma3:1b",
      //   messages: [{ role: "user", content: userInput }],
      //   stream: false
      // }

      const res = await fetch("http://localhost:11434/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": new Blob([JSON.stringify(payload)]).size.toString()
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error(`Ollama 錯誤: ${res.status}`)

      const data = await res.json()
      const aiReply = data.message?.content || "AI 無回應"

      setMessages(prev =>
        prev.filter(m => m.id !== "thinking")
          .concat({ id: Date.now().toString(), role: "assistant", content: aiReply, timestamp: new Date() })
      )

      // speakText(aiReply)
      toast.success("AI 已回覆！")
    } catch (err: any) {
      setMessages(prev =>
        prev.filter(m => m.id !== "thinking")
          .concat({ id: Date.now().toString(), role: "assistant", content: `出錯啦: ${err.message}`, timestamp: new Date() })
      )
      toast.error("連線失敗")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVoiceClick = () => {
    // 檢查瀏覽器是否支援語音識別
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast.error(language === "zh" ? "您的瀏覽器不支援語音識別" : "Your browser does not support speech recognition")
      return
    }

    if (!isRecording) {
      try {
        // 建立語音識別實例
        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true

        // 根據語言設定識別語言
        const recognitionLang = language === "zh" ? "zh-HK" : "en-US"
        recognition.lang = recognitionLang

        // 識別結果處理
        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let interimTranscript = ""
          let finalTranscript = ""

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript + " "
            } else {
              interimTranscript += transcript
            }
          }

          // 將識別的文字填入 input box
          if (finalTranscript) {
            setInput((prev) => prev + finalTranscript)
          } else if (interimTranscript) {
            // 可以選擇是否顯示臨時結果
            // setInput((prev) => prev.replace(/\s*$/, "") + interimTranscript)
          }
        }

        // 錯誤處理
        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error("Speech recognition error:", event.error)
          if (event.error === "no-speech") {
            toast.info(language === "zh" ? "未偵測到語音，請再試一次" : "No speech detected, please try again")
          } else if (event.error === "not-allowed") {
            toast.error(language === "zh" ? "麥克風權限被拒絕" : "Microphone permission denied")
          } else {
            toast.error(language === "zh" ? "語音識別錯誤" : "Speech recognition error")
          }
          setIsRecording(false)
        }

        // 結束處理
        recognition.onend = () => {
          setIsRecording(false)
          if (!isManualStopRef.current) {
            toast.success(language === "zh" ? "語音識別已停止" : "Speech recognition stopped")
          }
          isManualStopRef.current = false
        }

        // 開始識別
        recognition.start()
        speechRecognitionRef.current = recognition
        setIsRecording(true)
        toast.info(language === "zh" ? "正在聆聽..." : "Listening...")
      } catch (error) {
        console.error("Error starting speech recognition:", error)
        toast.error(language === "zh" ? "無法啟動語音識別" : "Cannot start speech recognition")
        setIsRecording(false)
      }
    } else {
      // 停止識別
      isManualStopRef.current = true
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop()
        speechRecognitionRef.current = null
      }
      setIsRecording(false)
    }
  }

  const normalizeMarkdown = (text: string): string => {
    return (
      text
        // 統一換行
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        // 把 * 項目符號轉成 Markdown（-）
        .replace(/^\*\s+/gm, "- ")
        // 防止多餘空行
        .replace(/\n{3,}/g, "\n\n")
    )
  }

  const handleCopyMessage = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMessageId(messageId)
      toast.success(language === "zh" ? "已複製到剪貼簿" : "Copied to clipboard")
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (error) {
      console.error("Error copying to clipboard:", error)
      toast.error(language === "zh" ? "複製失敗" : "Failed to copy")
    }
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <header className="shrink-0 border-b border-border bg-card">
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
          <div className="hidden items-center gap-2 md:flex">
            <Button variant="ghost" size="icon" onClick={() => setIsPersonalityModalOpen(true)}>
              <Bot className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <LanguageSwitcher currentLanguage={language} onLanguageChange={handleLanguageChange} />
              <ThemeToggle />
            </div>
          </div>
          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher currentLanguage={language} onLanguageChange={handleLanguageChange} />
            <ThemeToggle />
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <SheetHeader>
                  <SheetTitle>{language === "zh" ? "TravelSafe" : "TravelSafe"}</SheetTitle>
                  <SheetDescription>{t("appSubtitle")}</SheetDescription>
                </SheetHeader>
                <div className="mt-6 flex flex-col gap-2">
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => {
                      setIsPersonalityModalOpen(true)
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    <Bot className="mr-2 h-4 w-4" />
                    {language === "zh" ? "AI 設定" : "AI Settings"}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <PersonalityModal open={isPersonalityModalOpen} onOpenChange={setIsPersonalityModalOpen} language={language} />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <NavSidebar />

        <div className="flex min-h-0 flex-1 flex-col">
          {/* Updated auto-scroll to work with the messages container */}
          <div ref={scrollAreaRef} className="min-h-0 flex-1 overflow-auto">
            <div className="mx-auto max-w-4xl px-3 py-4 sm:px-4 sm:py-6">
              <div className="space-y-4 sm:space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-2 sm:gap-4 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <Avatar className="h-8 w-8 shrink-0 sm:h-10 sm:w-10">
                      <AvatarFallback
                        className={
                          message.role === "assistant"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        }
                      >
                        {message.role === "assistant" ? "AI" : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex max-w-[85%] flex-col gap-2 sm:max-w-[80%] sm:gap-3">
                      <Card
                        className={`p-3 sm:p-4 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-card"}`}
                      >
                        {/* ── 這裡改成 Markdown ── */}
                        {message.role === "assistant" ? (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            // className="prose prose-sm max-w-none dark:prose-invert"
                            components={{
                              // 讓列表項目左側有點內縮
                              ul: ({ children }) => <ul className="list-disc pl-5 space-y-1">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1">{children}</ol>,
                              li: ({ children }) => <li className="marker:text-primary">{children}</li>,
                            }}
                          >
                            {normalizeMarkdown(message.content)}
                          </ReactMarkdown>
                        ) : (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        )}
                        {/* ── 時間保持不變 ── */}
                        <p
                          className={`mt-2 text-xs ${message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                            }`}
                        >
                          {message.timestamp.toLocaleTimeString(language === "zh" ? "zh-HK" : "en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>

                      </Card>
                      {message.role === "assistant" && (
                        <div className="flex items-center gap-2">
                          <TTSButton text={message.content} language={language} />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={() => handleCopyMessage(message.id, message.content)}
                            title={language === "zh" ? "複製" : "Copy"}
                          >
                            {copiedMessageId === message.id ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      )}
                      
                      {message.imageData && <ImageGallery imageData={message.imageData} />}
                      {message.weatherData && <WeatherCard weather={message.weatherData} />}
                      {message.exchangeData && <ExchangeRateCard exchangeRate={message.exchangeData} />}
                      {message.itinerary && <ItineraryCard itinerary={message.itinerary} />}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-2 sm:gap-4">
                    <Avatar className="h-8 w-8 shrink-0 sm:h-10 sm:w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
                    </Avatar>
                    <Card className="max-w-[85%] bg-card p-3 sm:max-w-[80%] sm:p-4">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">{t("processing")}</span>
                      </div>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="shrink-0 border-t border-border bg-card">
            <div className="mx-auto max-w-4xl p-3 sm:p-4">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  placeholder={t("inputPlaceholder")}
                  className="flex-1 text-base sm:text-sm"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleVoiceClick}
                  disabled={isLoading}
                  size="icon"
                  variant={isRecording ? "default" : "outline"}
                  className="h-10 w-10 shrink-0 sm:h-9 sm:w-9"
                  title={
                    language === "zh"
                      ? isRecording
                        ? "停止錄音"
                        : "開始錄音"
                      : isRecording
                        ? "Stop recording"
                        : "Start recording"
                  }
                >
                  <Mic className={`h-4 w-4 ${isRecording ? "animate-pulse" : ""}`} />
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  size="icon"
                  className="h-10 w-10 shrink-0 sm:h-9 sm:w-9"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <RAGSidebar language={language} />
      </div>
    </div>
  )
}
