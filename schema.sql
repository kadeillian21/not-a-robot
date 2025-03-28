-- Create puzzles table
CREATE TABLE puzzles (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  weekday INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  target_description TEXT NOT NULL,
  correct_tiles INTEGER[] NOT NULL
);

-- Create storage for puzzle images
INSERT INTO storage.buckets (id, name, public) VALUES ('puzzles', 'puzzles', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Set up storage policies for authenticated users to upload
CREATE POLICY "Allow authenticated users to upload" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'puzzles');

-- Set up storage policies for authenticated users to update their uploads
CREATE POLICY "Allow authenticated users to update" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'puzzles');

-- Set up public access for puzzle images
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'puzzles');

-- Set storage policy for authenticated users to delete their uploads
CREATE POLICY "Allow authenticated users to delete" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'puzzles');

-- Enable row-level security but allow all operations for authenticated users
ALTER TABLE puzzles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all operations for authenticated users" ON puzzles
  FOR ALL
  TO authenticated
  USING (true);

-- Allow public read access for puzzles
CREATE POLICY "Allow public read access" ON puzzles
  FOR SELECT
  TO anon
  USING (true);