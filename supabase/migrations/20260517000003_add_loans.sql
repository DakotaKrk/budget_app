-- ============================================================
-- Loans & loan payments
-- ============================================================

CREATE TABLE IF NOT EXISTS public.loans (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  name         text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  total_amount numeric(12, 2) NOT NULL CHECK (total_amount > 0),
  note         text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.loan_payments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id    uuid NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
  amount     numeric(12, 2) NOT NULL CHECK (amount > 0),
  note       text,
  paid_at    date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS loans_household_id_idx ON public.loans(household_id);
CREATE INDEX IF NOT EXISTS loan_payments_loan_id_idx ON public.loan_payments(loan_id);

ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_payments ENABLE ROW LEVEL SECURITY;

-- Loans: household members can read/insert/delete
CREATE POLICY "Household members can manage loans"
ON public.loans FOR ALL
TO authenticated
USING (public.is_household_member(household_id))
WITH CHECK (public.is_household_member(household_id));

-- Loan payments: accessible if user is member of the loan's household
CREATE POLICY "Household members can manage loan payments"
ON public.loan_payments FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.loans l
    WHERE l.id = loan_id
      AND public.is_household_member(l.household_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.loans l
    WHERE l.id = loan_id
      AND public.is_household_member(l.household_id)
  )
);
