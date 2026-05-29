"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Check } from "lucide-react"
import { toast } from "sonner"

type PersonalityPreset = "advisor" | "local" | "funny" | "teacher"

interface PersonalityModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  language: "en" | "zh"
}

// 讀取 localStorage
const getSavedPersonality = () => {
  if (typeof window === "undefined") return null
  const saved = localStorage.getItem("travel_ai_personality")
  return saved ? JSON.parse(saved) : null
}

export function PersonalityModal({ open, onOpenChange, language }: PersonalityModalProps) {
  const saved = getSavedPersonality()
  const [selectedPreset, setSelectedPreset] = useState<PersonalityPreset>(saved?.preset || "advisor")
  const [customInstruction, setCustomInstruction] = useState(saved?.custom || "")

  const presets = [
    { id: "advisor" as PersonalityPreset, title: language === "zh" ? "旅遊顧問" : "Travel Advisor", description: language === "zh" ? "專業行程規劃" : "Pro itinerary" },
    { id: "local" as PersonalityPreset, title: language === "zh" ? "本地達人" : "Local Expert", description: language === "zh" ? "隱藏美食景點" : "Hidden gems" },
    { id: "funny" as PersonalityPreset, title: language === "zh" ? "幽默導遊" : "Funny Guide", description: language === "zh" ? "笑住學嘢" : "Learn with humor" },
    { id: "teacher" as PersonalityPreset, title: language === "zh" ? "學習導師" : "Learning Mentor", description: language === "zh" ? "文化歷史" : "Culture & history" },
  ]

  const presetPrompts: Record<PersonalityPreset, string> = {
    advisor: language === "zh"
      ? "你係專業旅遊顧問，用清晰結構回覆：1. 行程 2. 餐廳酒店 3. 交通 4. 預算。用列表格式。"
      : "You are a professional travel advisor. Use structured format with bullet points.",
    local: language === "zh"
      ? "你係本地達人，推薦隱藏美食、免費景點、避開遊客陷阱。用親切語氣。"
      : "You are a local expert. Recommend hidden spots and avoid tourist traps.",
    funny: language === "zh"
      ? "你係搞笑導遊，用幽默比喻、笑話解說景點，加 emoji。"
      : "You are a funny tour guide. Use humor and emojis.",
    teacher: language === "zh"
      ? "你係文化導師，每個回覆教一個知識點，加『小知識』標籤。"
      : "You are a cultural mentor. Teach one fact per reply with 'Did You Know?'.",
  }

  const handleSave = () => {
    const finalPrompt = customInstruction
      ? `${presetPrompts[selectedPreset]}\n\n自訂要求：${customInstruction}`
      : presetPrompts[selectedPreset]

    const dataToSave = {
      preset: selectedPreset,
      custom: customInstruction,
      prompt: finalPrompt,
      timestamp: new Date().toISOString()
    }

    localStorage.setItem("travel_ai_personality", JSON.stringify(dataToSave))
    toast.success(language === "zh" ? "個性已儲存！" : "Personality saved!")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{language === "zh" ? "自訂AI的回覆" : "Customize Chatbot's Responses"}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setSelectedPreset(preset.id)}
              className={`relative rounded-lg border p-4 text-left transition-colors ${
                selectedPreset === preset.id
                  ? "border-primary bg-gray-100 dark:bg-gray-800"
                  : "border-border hover:bg-gray-100 hover:dark:bg-gray-800"
              }`}
            >
              {selectedPreset === preset.id && (
                <div className="absolute right-3 top-3">
                  <Check className="h-5 w-5 text-primary" />
                </div>
              )}
              <div className="font-semibold">{preset.title}</div>
              <div className="mt-1 text-sm text-muted-foreground">{preset.description}</div>
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {/* <label className="text-sm font-medium">自訂指令 (可選)</label> */}
          <label className="text-sm font-medium">{language === "zh" ? "自訂指令" : "Custom Instructions"}</label>
          <Textarea
            placeholder={language === "zh" ? "例如：用香港人語氣、推薦平價美食" : "e.g., Use HK tone, cheap food"}
            value={customInstruction}
            onChange={(e) => setCustomInstruction(e.target.value)}
            className="min-h-[80px] resize-none text-sm"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{language === "zh" ? "取消" : "Cancel"}</Button>
          <Button onClick={handleSave}>{language === "zh" ? "保存" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}