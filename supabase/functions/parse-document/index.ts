import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;

    if (!file || !userId) {
      throw new Error("File and userId are required");
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Upload file to storage
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${userId}/${timestamp}_${sanitizedFileName}`;
    
    const fileBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from('knowledge-documents')
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      throw uploadError;
    }

    // Extract content for text files only
    let content = '';
    const isTextFile = file.name.endsWith('.txt') || file.name.endsWith('.md');
    
    if (isTextFile) {
      try {
        content = new TextDecoder('utf-8').decode(fileBuffer);
      } catch (decodeError) {
        console.warn("Could not decode text content:", decodeError);
      }
    }

    // Store metadata in knowledge_documents table
    const { data, error } = await supabase
      .from('knowledge_documents')
      .insert({
        user_id: userId,
        title: file.name,
        content: content,
        storage_path: storagePath,
        metadata: {
          file_type: file.type,
          file_size: file.size,
          is_binary: !isTextFile,
        }
      })
      .select()
      .single();

    if (error) {
      console.error("Database insert error:", error);
      throw error;
    }

    return new Response(
      JSON.stringify({ documentId: data.id, storagePath }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error parsing document:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
