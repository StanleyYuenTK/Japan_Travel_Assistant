"use client"

import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { ImageIcon, Maximize2 } from "lucide-react"
import type { ImageData } from "@/types/itinerary"
import { useState } from "react"

interface ImageGalleryProps {
  imageData: ImageData
}

export function ImageGallery({ imageData }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<number>(0)

  return (
    <Card className="overflow-hidden p-4">
      <div className="mb-3 flex items-center gap-2">
        <ImageIcon className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">AI 生成圖片</h3>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {imageData.images.map((image, idx) => (
          <Dialog key={idx}>
            <DialogTrigger asChild>
              <div
                className="group relative cursor-pointer overflow-hidden rounded-lg"
                onClick={() => setSelectedImage(idx)}
              >
                <img
                  src={`data:${image.mediaType};base64,${image.base64}`}
                  alt={`Generated image ${idx + 1}`}
                  className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/40 group-hover:opacity-100">
                  <Maximize2 className="h-8 w-8 text-white" />
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <img
                src={`data:${image.mediaType};base64,${image.base64}`}
                alt={`Generated image ${idx + 1}`}
                className="h-auto w-full rounded-lg"
              />
            </DialogContent>
          </Dialog>
        ))}
      </div>

      <p className="mt-3 text-xs text-muted-foreground">提示詞：{imageData.prompt}</p>
    </Card>
  )
}
