export interface WeatherData {
  location: string
  temperature: number
  weatherCode: number
  weatherDescription: string
  humidity: number
  windSpeed: number
  timestamp: Date
}

export interface ExchangeRateData {
  from: string
  to: string
  rate: number
  amount: number
  converted: number
  timestamp: Date
}

const JAPAN_CITIES = {
  tokyo: { lat: 35.6762, lon: 139.6503, name: "東京" },
  osaka: { lat: 34.6937, lon: 135.5023, name: "大阪" },
  kyoto: { lat: 35.0116, lon: 135.7681, name: "京都" },
  hokkaido: { lat: 43.0642, lon: 141.3469, name: "北海道" },
  fukuoka: { lat: 33.5904, lon: 130.4017, name: "福岡" },
  nagoya: { lat: 35.1815, lon: 136.9066, name: "名古屋" },
  sapporo: { lat: 43.0642, lon: 141.3469, name: "札幌" },
  yokohama: { lat: 35.4437, lon: 139.638, name: "橫濱" },
  nara: { lat: 34.6851, lon: 135.8048, name: "奈良" },
  hiroshima: { lat: 34.3853, lon: 132.4553, name: "廣島" },
}

const WEATHER_CODES: Record<number, string> = {
  0: "晴天",
  1: "大致晴朗",
  2: "局部多雲",
  3: "多雲",
  45: "有霧",
  48: "霧凇",
  51: "小毛毛雨",
  53: "中度毛毛雨",
  55: "大毛毛雨",
  61: "小雨",
  63: "中雨",
  65: "大雨",
  71: "小雪",
  73: "中雪",
  75: "大雪",
  77: "雪粒",
  80: "小陣雨",
  81: "中陣雨",
  82: "大陣雨",
  85: "小陣雪",
  86: "大陣雪",
  95: "雷暴",
  96: "雷暴伴小冰雹",
  99: "雷暴伴大冰雹",
}

export async function getWeather(cityName: string): Promise<WeatherData | null> {
  try {
    const cityKey = cityName.toLowerCase().replace(/\s+/g, "")
    const city = JAPAN_CITIES[cityKey as keyof typeof JAPAN_CITIES]

    if (!city) {
      const matchedCity = Object.values(JAPAN_CITIES).find((c) => c.name === cityName)
      if (!matchedCity) {
        throw new Error(`找不到城市: ${cityName}`)
      }
      const url = `https://api.open-meteo.com/v1/jma?latitude=${matchedCity.lat}&longitude=${matchedCity.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Asia/Tokyo`

      const response = await fetch(url, { next: { revalidate: 900 } })
      if (!response.ok) throw new Error("無法獲取天氣數據")

      const data = await response.json()

      return {
        location: matchedCity.name,
        temperature: Math.round(data.current.temperature_2m),
        weatherCode: data.current.weather_code,
        weatherDescription: WEATHER_CODES[data.current.weather_code] || "未知",
        humidity: data.current.relative_humidity_2m,
        windSpeed: data.current.wind_speed_10m,
        timestamp: new Date(data.current.time),
      }
    }

    const url = `https://api.open-meteo.com/v1/jma?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Asia/Tokyo`

    const response = await fetch(url, { next: { revalidate: 900 } })
    if (!response.ok) throw new Error("無法獲取天氣數據")

    const data = await response.json()

    return {
      location: city.name,
      temperature: Math.round(data.current.temperature_2m),
      weatherCode: data.current.weather_code,
      weatherDescription: WEATHER_CODES[data.current.weather_code] || "未知",
      humidity: data.current.relative_humidity_2m,
      windSpeed: data.current.wind_speed_10m,
      timestamp: new Date(data.current.time),
    }
  } catch (error) {
    console.error("Weather API error:", error)
    return null
  }
}

export async function getExchangeRate(amount = 1000): Promise<ExchangeRateData | null> {
  try {
    const response = await fetch("https://api.exchangerate-api.com/v4/latest/HKD", {
      next: { revalidate: 3600 },
    })

    if (!response.ok) throw new Error("無法獲取匯率數據")

    const data = await response.json()
    const rate = data.rates.JPY

    return {
      from: "HKD",
      to: "JPY",
      rate: Math.round(rate * 100) / 100,
      amount,
      converted: Math.round(amount * rate),
      timestamp: new Date(),
    }
  } catch (error) {
    console.error("Exchange rate API error:", error)
    return null
  }
}
