-- Add verification_token and updated_at columns to domains table

-- Add verification_token column
ALTER TABLE domains 
ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255);

-- Add updated_at column for tracking changes
ALTER TABLE domains 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create index on verification_token for faster lookups
CREATE INDEX IF NOT EXISTS idx_domains_verification_token 
ON domains(verification_token);

-- Add trigger to update updated_at automatically
CREATE OR REPLACE FUNCTION update_domains_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_domains_updated_at ON domains;

CREATE TRIGGER trigger_domains_updated_at
  BEFORE UPDATE ON domains
  FOR EACH ROW
  EXECUTE FUNCTION update_domains_updated_at();
