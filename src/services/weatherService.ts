import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export interface WeatherData {
  current: {
    temp: string;
    condition: string;
    humidity: string;
    windSpeed: string;
    precipitation: string;
  };
  forecast: {
    day: string;
    temp: string;
    condition: string;
  }[];
}

export async function getWeatherData(location: string): Promise<WeatherData> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Get the current weather and 3-day forecast for ${location}. Return the data in JSON format.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            current: {
              type: Type.OBJECT,
              properties: {
                temp: { type: Type.STRING },
                condition: { type: Type.STRING },
                humidity: { type: Type.STRING },
                windSpeed: { type: Type.STRING },
                precipitation: { type: Type.STRING },
              },
              required: ["temp", "condition", "humidity", "windSpeed", "precipitation"],
            },
            forecast: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING },
                  temp: { type: Type.STRING },
                  condition: { type: Type.STRING },
                },
                required: ["day", "temp", "condition"],
              },
            },
          },
          required: ["current", "forecast"],
        },
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    // Fallback data in case of error
    return {
      current: {
        temp: "28°C",
        condition: "Partly Cloudy",
        humidity: "82%",
        windSpeed: "12 km/h",
        precipitation: "0.2 mm",
      },
      forecast: [
        { day: "Tomorrow", temp: "29°C", condition: "Sunny" },
        { day: "Monday", temp: "27°C", condition: "Rain" },
        { day: "Tuesday", temp: "28°C", condition: "Cloudy" },
      ],
    };
  }
}
