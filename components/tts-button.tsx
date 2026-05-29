"use client"  // ← 這行一定要有！！！

import { Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"

interface TTSButtonProps {
  text: string
  language: "en" | "zh" | "jp"
}

export function TTSButton({ text, language }: TTSButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // 只在 client 端建立 Audio 物件
  useEffect(() => {
    audioRef.current = new Audio()
    // 清理
    return () => {
      audioRef.current?.pause()
      audioRef.current = null
    }
  }, [])

  const handleSpeak = async () => {
    if (!audioRef.current) return

    // 停止播放
    if (isPlaying) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
      return
    }

    setIsPlaying(true)

    try {
      const res = await fetch("http://localhost:8000/api/tts", {  // 如果你 backend 係獨立 8000 port，改成 http://localhost:8000/api/tts
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, lang: language }),
      })

      if (!res.ok) throw new Error("TTS failed")

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)

      if (!audioRef.current) return
      audioRef.current.src = url
      audioRef.current.play()

      audioRef.current.onended = () => {
        URL.revokeObjectURL(url)
        setIsPlaying(false)
      }

      audioRef.current.onerror = () => {
        URL.revokeObjectURL(url)
        setIsPlaying(false)
        alert("播音出錯")
      }
    } catch (err) {
      console.error(err)
      setIsPlaying(false)
      alert("播音失敗，backend 有無開？")
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleSpeak}
      className="h-8 w-8 shrink-0"
    >
      {isPlaying ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
    </Button>
  )
}