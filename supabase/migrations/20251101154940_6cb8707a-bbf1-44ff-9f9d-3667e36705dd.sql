-- Add importance_level to messages for memory dissolution
CREATE TYPE importance_level AS ENUM ('quick', 'medium', 'long');

ALTER TABLE public.messages
ADD COLUMN importance_level importance_level DEFAULT 'medium';

-- Add index for efficient filtering
CREATE INDEX idx_messages_dissolution ON public.messages(conversation_id, created_at, importance_level);