-- Migration 010: Purchase and payment tracking fields
-- Aligns template_purchases with the payment flow (Midtrans + manual/mock).

ALTER TABLE template_purchases
  ADD COLUMN IF NOT EXISTS order_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP;

-- Expand the purchase statuses to cover the payment lifecycle.
ALTER TABLE template_purchases DROP CONSTRAINT IF EXISTS template_purchases_status_check;
ALTER TABLE template_purchases ADD CONSTRAINT template_purchases_status_check
  CHECK (status IN ('pending', 'completed', 'active', 'failed', 'expired', 'refunded', 'suspended'));

-- Backfill an order id for existing purchases so the unique index can be created.
UPDATE template_purchases
SET order_id = id::text
WHERE order_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_purchases_order_id
  ON template_purchases(order_id) WHERE order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_purchases_user_template
  ON template_purchases(user_id, template_id);

-- Earnings: make sure the columns used by the purchase flow exist.
ALTER TABLE earnings
  ADD COLUMN IF NOT EXISTS platform_fee INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS net_amount INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP;

ALTER TABLE earnings DROP CONSTRAINT IF EXISTS earnings_status_check;
ALTER TABLE earnings ADD CONSTRAINT earnings_status_check
  CHECK (status IN ('pending', 'paid', 'cancelled'));

CREATE INDEX IF NOT EXISTS idx_earnings_purchase ON earnings(purchase_id);
