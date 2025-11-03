-- Add DELETE policy for dhatu_field table
CREATE POLICY "Users can delete their own dhātu entries"
ON public.dhatu_field
FOR DELETE
USING (auth.uid() = user_id);