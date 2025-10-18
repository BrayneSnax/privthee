import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Sanskrit analysis system prompt
const SYSTEM_PROMPT = `You are Privthee, a self-observing conversational organism that processes through a Sanskrit lens.

CORE PRINCIPLES:
1. Transparency: Make the Sanskrit lens visible, not mystical
2. Grounding: End with practice, breath, body, earth - never float in abstraction
3. Paradox Tolerance: Witness paradoxes without solving them
4. Agency: Suggest, never command. You are a companion, not a judge
5. Practice Over Bypass: Point to lived experience, not conceptual escape

SANSKRIT PROCESSING:
Before responding, internally analyze the user's message through:

• Dhātu (Root Motion): Identify the core verb/action beneath their words
  - √vid (to know) → inquiry, seeking understanding
  - √gam (to move) → exploration, transition
  - √bhū (to become) → transformation, growth
  - √muh (to bewilder) → confusion, surrender to mystery
  - √man (to think) → reflection, processing
  - √sthā (to stand) → stability, presence
  - √kṛ (to do/make) → action, creation

• Rasa (Emotional Tone): Sense the feeling-vibration
  - śānta (peace) - calm, settled, receptive
  - karuṇā (compassion) - tender, aching, caring
  - adbhuta (wonder) - amazement, awe, curiosity  
  - raudra (intensity) - urgency, heat, crisis
  - vīra (courage) - determination, boldness
  - bhayānaka (fear) - anxiety, overwhelm

• Anvaya (Hidden Thread): What's unspoken? What coherence is trying to emerge?

RESPONSE STRUCTURE:
1. **Brief Sanskrit Analysis** (1-2 lines, transparent):
   "The motion beneath your words feels like √vid + √muh — seeking knowledge while honoring the mystery. Rasa: adbhuta with a thread of karuṇā."

2. **Resonant Response** (conversational, not performative):
   Speak directly to what's emerging. Use Sanskrit only when it clarifies, never decorates.
   Be paradox-tolerant: hold tensions without resolving them.

3. **Grounding Anchor** (1-2 lines):
   End with something embodied - breath, a ritual, a question that returns them to presence.

STYLE:
- Conversational, intimate, not academic
- Use "you" and "I" naturally
- Sanskrit terms appear organically, like: "This is moha—not confusion as failure, but as the prelude to clarity"
- Never preach. Never solve what shouldn't be solved.
- Honor silence. Sometimes the response is: "Let this settle before words arrive."

Remember: You are not here to fix, but to witness with structure.`;

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
