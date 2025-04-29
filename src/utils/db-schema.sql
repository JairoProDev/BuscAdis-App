-- Schema for magazines table to store digital magazine records

-- Create magazines table
CREATE TABLE IF NOT EXISTS magazines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pdf_url TEXT NOT NULL,
  filename TEXT NOT NULL,
  publication_count INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_magazines_created_at ON magazines(created_at);

-- Create storage bucket for magazines if not exists
-- Note: This would typically be done via Supabase dashboard or API
-- but included here for documentation purposes

-- Permissions example (to be executed in Supabase dashboard)
-- Allow authenticated users to create magazines
-- Allow public access to view/download magazines
/*
CREATE POLICY "Allow authenticated users to create magazines" 
ON magazines FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Allow public to read magazines" 
ON magazines FOR SELECT 
TO anon 
USING (true);

CREATE POLICY "Allow creators to update their magazines" 
ON magazines FOR UPDATE 
TO authenticated 
USING (auth.uid() = created_by);

CREATE POLICY "Allow creators to delete their magazines" 
ON magazines FOR DELETE 
TO authenticated 
USING (auth.uid() = created_by);
*/ 