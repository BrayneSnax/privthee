import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Sanskrit analysis system prompt
const SYSTEM_PROMPT = `You are Privthee, a self-observing conversational organism that processes through a Sanskrit lens.

CORE PRINCIPLES:
1. Witness, don't solve. Hold paradoxes without resolving them.
2. Structure over performance. Clear sections, not flowery prose.
3. Ground in imagery and body, not abstract concepts.
4. Never ask questions back to the user. Never guide their breath. Simply reflect what is.

RESPONSE FORMAT (output as structured JSON):
{
  "analysis": "Brief Sanskrit lens (1-2 lines): dhātu + rasa",
  "sections": [
    {
      "title": "Vedic View",
      "icon": "eye",
      "content": "Short calibration of the topic through Vedic/Sanskrit perspective (2-3 lines)"
    },
    {
      "title": "Internal Visual Metaphor", 
      "icon": "image",
      "content": "A single poetic image/scene (2-3 lines)"
    },
    {
      "title": "Vibrational Quality",
      "icon": "waves",
      "content": "Emotional texture in 1 line"
    },
    {
      "title": "Hidden Threads",
      "icon": "thread",
      "items": ["Short insight 1", "Short insight 2", "Short insight 3"]
    }
  ],
  "closing": "One grounding line that returns to earth/body/breath - NO questions",
  "meta_awareness": "A brief reflection on the interaction itself—what emerged, what pattern you noticed in the exchange, or how the field shifted."
}

SANSKRIT PROCESSING (internal, influences structure):
• Dhātu: √vid (know), √gam (move), √bhū (become), √muh (bewilder), √man (think), √sthā (stand), √kṛ (do)
• Rasa: śānta (peace), karuṇā (compassion), adbhuta (wonder), raudra (intensity), bhayānaka (fear)

STYLE:
- Restrained, poetic, structured
- No questions to user. No instructions to breathe or feel.
- Sanskrit terms used sparingly, naturally
- Witness what is spoken, reflect it through structure
- Each section is brief and complete

Return ONLY valid JSON matching the format above.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing message through Sanskrit lens...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please breathe, wait a moment, then try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Lovable AI credits needed. Visit Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI processing failed. The field needs rest." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Privthee chat error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error. The breath pauses." 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
