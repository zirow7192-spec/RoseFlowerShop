/*
  # Rose Flower Shop - Gallery Management System
  
  1. New Tables
    - `gallery_images`
      - `id` (uuid, primary key)
      - `filename` (text) - Original filename
      - `storage_path` (text) - Path in Supabase Storage
      - `caption_en` (text) - English caption
      - `caption_el` (text) - Greek caption
      - `category` (text) - weddings, baptisms, events, bouquets, all
      - `display_order` (integer) - For manual ordering
      - `is_active` (boolean) - Show/hide without deleting
      - `uploaded_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Storage
    - Create storage bucket for gallery images
  
  3. Security
    - Enable RLS on gallery_images
    - Allow public read access (for website visitors)
    - NO authentication required for reads (public gallery)
    - Client-side PIN protection for admin writes
*/

-- Create gallery images table
CREATE TABLE IF NOT EXISTS gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  storage_path text NOT NULL UNIQUE,
  public_url text,
  caption_en text DEFAULT '',
  caption_el text DEFAULT '',
  category text NOT NULL DEFAULT 'all',
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  uploaded_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read active images (public gallery)
CREATE POLICY "Anyone can view active gallery images"
  ON gallery_images
  FOR SELECT
  USING (is_active = true);

-- Allow unrestricted inserts (PIN protection is client-side)
CREATE POLICY "Allow image uploads"
  ON gallery_images
  FOR INSERT
  WITH CHECK (true);

-- Allow unrestricted updates
CREATE POLICY "Allow image updates"
  ON gallery_images
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow unrestricted deletes
CREATE POLICY "Allow image deletes"
  ON gallery_images
  FOR DELETE
  USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery_images(category);
CREATE INDEX IF NOT EXISTS idx_gallery_active ON gallery_images(is_active);
CREATE INDEX IF NOT EXISTS idx_gallery_order ON gallery_images(display_order);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_gallery_images_updated_at
  BEFORE UPDATE ON gallery_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
