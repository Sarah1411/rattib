
const HAZARD_LEXICON = {
  Electronics: ["frayed cord", "exposed wire", "cracked casing", "burn mark", "swollen battery", "damaged plug", "sparking"],
  Kids: ["expired", "recalled", "cracked", "broken buckle", "missing strap", "choking", "loose part"],
  Furniture: ["structural crack", "unstable", "broken leg", "sharp edge", "wobbly frame"],
  Clothing: ["mold", "chemical smell"],
  Other: []
};

function verifySafety(parsed, category){
  const lexicon = HAZARD_LEXICON[category] || [];
  const remainingDefects = [];
  const escalations = [];

  (parsed.defect_flags || []).forEach((flag) => {
    const flagLower = flag.toLowerCase();
    const matchedTerm = lexicon.find((term) => flagLower.includes(term));
    if (matchedTerm) {
      escalations.push({ original: flag, matchedTerm, category });
    } else {
      remainingDefects.push(flag);
    }
  });

  return {
    ...parsed,
    defect_flags: remainingDefects,
    hazard_flags: [...(parsed.hazard_flags || []), ...escalations.map((e) => e.original)],
    escalations,
    safety_check: escalations.length > 0 ? "escalated" : "passed"
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { image, mediaType } = req.body || {};
  if (!image || !mediaType) {
    return res.status(400).json({ error: "Missing image or mediaType" });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not set on the server" });
  }

  const prompt = `Look at this photo of a used household or personal item that someone wants to sell or donate on a second-hand marketplace.

Return ONLY a JSON object (no other text, no markdown fences) with exactly this shape:
{
  "item_name": "short name of the item",
  "material": "primary material, e.g. stainless steel, cotton, wood",
  "category": "one of: Electronics, Furniture, Clothing, Kids, Other",
  "condition": "one of: Like new, Good, Fair",
  "defect_flags": ["short phrase for each visible cosmetic or functional defect, empty array if none"],
  "hazard_flags": ["short phrase for each visible safety concern such as frayed cords, cracks, corrosion, or anything that looks recalled or expired, empty array if none"]
}`;

  let geminiResponse;
  try {
    geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
  } catch (fetchErr) {
    return res.status(502).json({ error: "Could not reach Gemini API", detail: fetchErr.message });
  }

  const rawBody = await geminiResponse.text();

  if (!geminiResponse.ok) {
    return res.status(502).json({
      error: "Gemini API returned an error",
      status: geminiResponse.status,
      detail: rawBody.slice(0, 500)
    });
  }

  let data;
  try {
    data = JSON.parse(rawBody);
  } catch (e) {
    return res.status(500).json({ error: "Could not parse Gemini's response as JSON", detail: rawBody.slice(0, 500) });
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const cleaned = text.replace(/```json|```/g, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    return res.status(500).json({ error: "Model reply wasn't valid JSON", raw: cleaned.slice(0, 500) });
  }

  const verified = verifySafety(parsed, parsed.category || "Other");

  return res.status(200).json(verified);
}
