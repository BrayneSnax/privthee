-- Add UPDATE policy for knowledge_documents
CREATE POLICY "Users can update their own knowledge documents" 
ON public.knowledge_documents 
FOR UPDATE 
USING (auth.uid() = user_id);