-- Update the knowledge-documents bucket to allow larger files (100MB)
UPDATE storage.buckets 
SET file_size_limit = 104857600 
WHERE id = 'knowledge-documents';