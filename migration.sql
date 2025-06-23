-- Migration: Add new fields to services table

-- Add new columns to services table
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS musical_genre VARCHAR(100),
ADD COLUMN IF NOT EXISTS has_equipment VARCHAR(50),
ADD COLUMN IF NOT EXISTS equipment TEXT[],
ADD COLUMN IF NOT EXISTS media_files TEXT[];

-- Update existing records to have empty arrays for new array fields
UPDATE services 
SET equipment = '{}', media_files = '{}' 
WHERE equipment IS NULL OR media_files IS NULL; 