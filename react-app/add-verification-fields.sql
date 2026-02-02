-- ============================================
-- Add Verification Fields to Listings Table
-- ============================================
-- Adds fields for accredited member number and verification document
-- ============================================

-- Add accredited_member_number column
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS accredited_member_number TEXT;

-- Add verification_document_url column
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS verification_document_url TEXT;

-- Add comment to columns
COMMENT ON COLUMN listings.accredited_member_number IS 'Accredited member number for self-regulating bodies (e.g., social work, counselling associations)';
COMMENT ON COLUMN listings.verification_document_url IS 'URL to uploaded verification document (registration certificate, membership card, etc.)';
