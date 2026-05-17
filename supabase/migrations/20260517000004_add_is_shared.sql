-- Add is_shared flag to transactions
-- true  = visible to all household members (default, existing behaviour)
-- false = personal/private, only visible to the user who created it

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS is_shared boolean NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS transactions_is_shared_idx
  ON public.transactions(is_shared);
