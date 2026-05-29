export interface ItineraryDay {
  day: number
  title: string
  activities: Activity[]
  meals?: {
    breakfast?: string
    lunch?: string
    dinner?: string
  }
  accommodation?: string
  transportation?: string
  estimatedCost?: number
}

export interface Activity {
  time: string
  name: string
  description: string
  location: string
  duration: string
  cost?: number
  tips?: string[]
}

export interface Itinerary {
  id: string
  title: string
  destination: string
  duration: number
  startDate?: string
  days: ItineraryDay[]
  totalEstimatedCost?: number
  overview: string
  tips: string[]
  createdAt: Date
}

export interface GeneratedImage {
  base64: string
  mediaType: string
}

export interface ImageData {
  images: GeneratedImage[]
  prompt: string
}
