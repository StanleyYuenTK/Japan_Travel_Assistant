"use server"

import { generateObject, generateText } from "ai"
import { z } from "zod"
import { getWeather, getExchangeRate } from "@/lib/api-client"
import type { Language } from "@/lib/i18n"

const itinerarySchema = z.object({
  title: z.string().describe("行程標題"),
  destination: z.string().describe("目的地"),
  duration: z.number().describe("天數"),
  days: z.array(
    z.object({
      day: z.number(),
      title: z.string().describe("當天主題"),
      activities: z.array(
        z.object({
          time: z.string().describe("時間，例如：09:00"),
          name: z.string().describe("活動名稱"),
          description: z.string().describe("活動描述"),
          location: z.string().describe("地點"),
          duration: z.string().describe("預計時長"),
          cost: z.number().optional().describe("預計費用（港幣）"),
          tips: z.array(z.string()).optional().describe("小貼士"),
        }),
      ),
      meals: z
        .object({
          breakfast: z.string().optional(),
          lunch: z.string().optional(),
          dinner: z.string().optional(),
        })
        .optional(),
      accommodation: z.string().optional().describe("住宿"),
      transportation: z.string().optional().describe("交通方式"),
      estimatedCost: z.number().optional().describe("當天預計總費用（港幣）"),
    }),
  ),
  totalEstimatedCost: z.number().optional().describe("總預計費用（港幣）"),
  overview: z.string().describe("行程概覽"),
  tips: z.array(z.string()).describe("整體旅行貼士"),
})

export async function generateItinerary(prompt: string, language: Language = "en") {
  try {
    const systemPrompt =
      language === "zh"
        ? `你是一個專業的日本旅遊規劃師，專門為香港旅客設計行程。請根據以下需求生成詳細的日本旅行行程：

${prompt}

請確保：
1. 行程安排合理，考慮交通時間和景點開放時間
2. 推薦適合香港人的餐廳和美食
3. 提供實用的旅行貼士
4. 費用以港幣計算
5. 使用繁體中文`
        : `You are a professional Japan travel planner specializing in creating itineraries for Hong Kong travelers. Generate a detailed Japan travel itinerary based on the following request:

${prompt}

Please ensure:
1. The itinerary is well-organized, considering travel time and attraction opening hours
2. Recommend restaurants and food suitable for Hong Kong travelers
3. Provide practical travel tips
4. Calculate costs in HKD
5. Respond in English`

    const { object } = await generateObject({
      model: "openai/gpt-5",
      schema: itinerarySchema,
      prompt: systemPrompt,
      maxOutputTokens: 4000,
    })

    return {
      success: true,
      itinerary: {
        ...object,
        id: crypto.randomUUID(),
        createdAt: new Date(),
      },
    }
  } catch (error) {
    console.error("Error generating itinerary:", error)
    return {
      success: false,
      error: language === "zh" ? "生成行程時出錯，請稍後再試" : "Error generating itinerary, please try again later",
    }
  }
}

export async function chatWithTools(prompt: string, language: Language = "en") {
  try {
    const systemPrompt =
      language === "zh"
        ? `你是一個友善的日本旅遊 AI 助手。分析用戶的問題並決定是否需要查詢實時數據或生成圖片。

用戶問題: ${prompt}

如果用戶詢問天氣，設置 needsWeather 為 true 並提取城市名稱。
如果用戶詢問匯率或貨幣轉換，設置 needsExchangeRate 為 true。
如果用戶想看景點圖片或要求生成圖片，設置 needsImage 為 true 並創建一個詳細的英文圖片生成提示詞（描述日本景點、建築、文化場景等）。
否則直接回答問題。

使用繁體中文回答。`
        : `You are a friendly Japan Travel AI assistant. Analyze the user's question and decide if you need to query real-time data or generate images.

User question: ${prompt}

If the user asks about weather, set needsWeather to true and extract the city name.
If the user asks about exchange rates or currency conversion, set needsExchangeRate to true.
If the user wants to see attraction images or requests image generation, set needsImage to true and create a detailed English image generation prompt (describing Japanese attractions, architecture, cultural scenes, etc.).
Otherwise, answer the question directly.

Respond in English.`

    const result = await generateObject({
      model: "openai/gpt-5",
      schema: z.object({
        response: z.string(),
        needsWeather: z.boolean().optional(),
        needsExchangeRate: z.boolean().optional(),
        needsImage: z.boolean().optional(),
        city: z.string().optional(),
        imagePrompt: z.string().optional(),
      }),
      prompt: systemPrompt,
    })

    let weatherData = null
    let exchangeData = null
    let imageData = null

    if (result.object.needsWeather && result.object.city) {
      weatherData = await getWeather(result.object.city)
    }

    if (result.object.needsExchangeRate) {
      exchangeData = await getExchangeRate(1000)
    }

    if (result.object.needsImage && result.object.imagePrompt) {
      imageData = await generateImage(result.object.imagePrompt)
    }

    let finalResponse = result.object.response

    if (weatherData) {
      finalResponse =
        language === "zh"
          ? `${result.object.city}的天氣資訊：

🌡️ 溫度：${weatherData.temperature}°C
☁️ 天氣：${weatherData.weatherDescription}
💧 濕度：${weatherData.humidity}%
💨 風速：${weatherData.windSpeed} km/h

${finalResponse}`
          : `Weather information for ${result.object.city}:

🌡️ Temperature: ${weatherData.temperature}°C
☁️ Weather: ${weatherData.weatherDescription}
💧 Humidity: ${weatherData.humidity}%
💨 Wind Speed: ${weatherData.windSpeed} km/h

${finalResponse}`
    }

    if (exchangeData) {
      finalResponse =
        language === "zh"
          ? `港幣兌日元匯率資訊：

💱 匯率：1 HKD = ${exchangeData.rate} JPY
💰 HK$1,000 = ¥${exchangeData.converted}

${finalResponse}`
          : `HKD to JPY Exchange Rate Information:

💱 Rate: 1 HKD = ${exchangeData.rate} JPY
💰 HK$1,000 = ¥${exchangeData.converted}

${finalResponse}`
    }

    return {
      success: true,
      response: finalResponse,
      weatherData,
      exchangeData,
      imageData,
    }
  } catch (error) {
    console.error("Error in chat:", error)
    return {
      success: false,
      error:
        language === "zh" ? "處理你的問題時出錯，請稍後再試" : "Error processing your request, please try again later",
    }
  }
}

export async function generateImage(prompt: string) {
  try {
    const result = await generateText({
      model: "google/gemini-2.5-flash-image",
      prompt: `Generate a high-quality, photorealistic image of: ${prompt}. 
      
The image should be:
- Beautiful and visually appealing
- Capture the essence of Japanese culture and aesthetics
- High resolution and detailed
- Suitable for travel inspiration`,
    })

    const images = []
    for (const file of result.files) {
      if (file.mediaType.startsWith("image/")) {
        images.push({
          base64: file.base64,
          mediaType: file.mediaType,
        })
      }
    }

    if (images.length === 0) {
      return null
    }

    return {
      images,
      prompt,
    }
  } catch (error) {
    console.error("Error generating image:", error)
    return null
  }
}
