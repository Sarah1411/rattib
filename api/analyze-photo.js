// Vercel serverless function.
// Runs server-side only — this is where the Anthropic API key actually lives,
// as an environment variable, never in any file the browser can see.

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
    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data: image } },
              { type: "text", text: prompt }
            ]
          }
        ]
      })
    });

    if (!anthropicResponse.ok) {
      const errText = await anthropicResponse.text();
      console.error("Anthropic API error:", errText);
      return res.status(502).json({ error: "Vision API call failed" });
    }

    const data = await anthropicResponse.json();
    const textBlock = data.content?.find((b) => b.type === "text");
    const cleaned = (textBlock?.text || "{}").replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return res.status(200).json(parsed);
  } catch (err) {
    console.error("analyze-photo error:", err);
    return res.status(500).json({ error: "Analysis failed" });
  }
}
