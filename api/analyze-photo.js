// Vercel serverless function — Gemini (Google) version.
// Same endpoint path as the Claude version (/api/analyze-photo), so no frontend
// changes are needed. To use this instead of Anthropic's API, replace the
// contents of api/analyze-photo.js with this file's contents, and set
// GEMINI_API_KEY (instead of ANTHROPIC_API_KEY) in Vercel's environment variables.
//
// Get a free key at https://aistudio.google.com — no credit card required.
// Check current free-tier rate limits there before relying on this for a live
// demo, since Google's published limits change over time.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { image, mediaType } = req.body || {};
  if (!image || !mediaType) {
    return res.status(400).json({ error: "Missing image or mediaType" });
  }

  const prompt = `Look at this photo of a used household or personal item that someone wants to sell or donate on a second-hand marketplace.

Return ONLY a JSON object (no other text, no markdown fences) with exactly this shape:
{
  "item_name": "short name of the item",
  "material": "primary material, e.g. stainless steel, cotton, wood",
  "condition": "one of: Like new, Good, Fair",
  "defect_flags": ["short phrase for each visible cosmetic or functional defect, empty array if none"],
  "hazard_flags": ["short phrase for each visible safety concern such as frayed cords, cracks, corrosion, or anything that looks recalled or expired, empty array if none"]
}`;

  try {
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                { inline_data: { mime_type: mediaType, data: image } }
              ]
            }
          ]
        })
      }
    );

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error("Gemini API error:", errText);
      return res.status(502).json({ error: "Vision API call failed" });
    }

    const data = await geminiResponse.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return res.status(200).json(parsed);
  } catch (err) {
    console.error("analyze-photo (gemini) error:", err);
    return res.status(500).json({ error: "Analysis failed" });
  }
}
