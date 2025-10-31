-- Create storage bucket for knowledge documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('knowledge-documents', 'knowledge-documents', false);

-- Create storage policies for knowledge documents
CREATE POLICY "Users can upload their own documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'knowledge-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'knowledge-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'knowledge-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add storage_path column to knowledge_documents table
ALTER TABLE public.knowledge_documents 
ADD COLUMN storage_path TEXT;