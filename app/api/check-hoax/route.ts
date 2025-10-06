import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { url, content } = await request.json();

    if (!url && !content) {
      return NextResponse.json(
        { error: "URL atau konten harus diisi" },
        { status: 400 }
      );
    }

    let textToAnalyze = content;

    // If URL is provided, try to scrape content
    if (url && !content) {
      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        });

        if (response.ok) {
          const html = await response.text();
          // Simple text extraction (you might want to use a proper HTML parser)
          textToAnalyze = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
            .replace(/<[^>]*>/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .substring(0, 5000); // Limit to 5000 chars
        }
      } catch (error) {
        console.error("Error scraping URL:", error);
        return NextResponse.json(
          { error: "Gagal mengakses URL yang diberikan" },
          { status: 400 }
        );
      }
    }

    if (!textToAnalyze || textToAnalyze.length < 50) {
      return NextResponse.json(
        { error: "Konten terlalu pendek untuk dianalisis" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
Analisis konten berikut untuk mendeteksi potensi hoax atau misinformasi:

KONTEN:
${textToAnalyze}

Berikan analisis dalam format JSON dengan struktur berikut:
{
  "hoax_probability": [0-100],
  "credibility_score": [0-100],
  "analysis": {
    "red_flags": ["daftar indikator hoax yang ditemukan"],
    "positive_indicators": ["daftar indikator kredibilitas"],
    "fact_check_suggestions": ["saran untuk verifikasi fakta"],
    "source_reliability": "penilaian keandalan sumber"
  },
  "verdict": "HOAX|MISLEADING|QUESTIONABLE|CREDIBLE",
  "confidence": [0-100],
  "recommendations": ["saran untuk pembaca"],
  "summary": "ringkasan singkat hasil analisis"
}

Fokus pada:
1. Klaim yang tidak didukung bukti
2. Sumber yang tidak jelas atau tidak kredibel
3. Bahasa yang emosional atau provokatif
4. Informasi yang bertentangan dengan fakta yang diketahui
5. Tanda-tanda manipulasi atau bias

Berikan respons dalam bahasa Indonesia.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text();

    try {
      // Try to parse JSON from the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysisData = JSON.parse(jsonMatch[0]);

        return NextResponse.json({
          success: true,
          url: url || null,
          analysis: analysisData,
          analyzed_at: new Date().toISOString(),
        });
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      // If JSON parsing fails, return a structured response based on text analysis
      const hoaxProbability = analysisText.toLowerCase().includes("hoax")
        ? 80
        : analysisText.toLowerCase().includes("misleading")
        ? 60
        : analysisText.toLowerCase().includes("questionable")
        ? 40
        : 20;

      return NextResponse.json({
        success: true,
        url: url || null,
        analysis: {
          hoax_probability: hoaxProbability,
          credibility_score: 100 - hoaxProbability,
          analysis: {
            red_flags: [],
            positive_indicators: [],
            fact_check_suggestions: ["Verifikasi dengan sumber terpercaya"],
            source_reliability: "Perlu verifikasi lebih lanjut",
          },
          verdict: hoaxProbability > 70 ? "QUESTIONABLE" : "CREDIBLE",
          confidence: 70,
          recommendations: ["Selalu verifikasi informasi dari multiple sumber"],
          summary: analysisText.substring(0, 200) + "...",
        },
        analyzed_at: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Error in hoax check:", error);
    return NextResponse.json(
      { error: "Gagal menganalisis konten" },
      { status: 500 }
    );
  }
}
