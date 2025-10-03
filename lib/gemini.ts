import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function analyzeContent(content: string, source: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
Analisis konten berikut yang berasal dari ${source} dan berikan respons dalam format JSON:

Konten: "${content}"

Berikan analisis dalam format JSON dengan struktur berikut:
{
  "category": "berita|laporan|aspirasi|lainnya",
  "sentiment": "positif|negatif|netral",
  "urgency_level": 1-10,
  "hoax_probability": 0-100,
  "keywords": ["kata1", "kata2"],
  "summary": "ringkasan singkat",
  "reasoning": "alasan klasifikasi"
}

Kriteria:
- category: "berita" untuk informasi faktual, "laporan" untuk keluhan/masalah, "aspirasi" untuk saran/harapan, "lainnya" untuk konten tidak relevan
- sentiment: analisis emosi keseluruhan konten
- urgency_level: tingkat urgensi 1-10 (10 = sangat mendesak)
- hoax_probability: persentase kemungkinan hoaks berdasarkan bahasa, sumber, dan kredibilitas
- keywords: kata kunci penting yang berkaitan dengan Trenggalek
- summary: ringkasan maksimal 100 kata
- reasoning: penjelasan singkat mengapa dikategorikan demikian
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error("Invalid JSON response from AI");
  } catch (error) {
    console.error("Error analyzing content:", error);
    // Fallback analysis
    return {
      category: "lainnya",
      sentiment: "netral",
      urgency_level: 1,
      hoax_probability: 0,
      keywords: [],
      summary: content.substring(0, 100),
      reasoning: "Analisis otomatis gagal",
    };
  }
}
