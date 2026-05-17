-- ============================================================
-- Add is_recurring column to transactions
-- ============================================================
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS is_recurring boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS transactions_is_recurring_idx
  ON public.transactions(is_recurring);
