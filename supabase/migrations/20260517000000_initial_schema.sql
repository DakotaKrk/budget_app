-- ============================================================
-- Budget App — Initial Schema
-- ============================================================

-- ----------------------------------------------------------------
-- 1. HOUSEHOLDS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.households (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text        NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  invite_code  text        NOT NULL UNIQUE DEFAULT upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------
-- 2. HOUSEHOLD MEMBERS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.household_members (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id  uuid        NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role          text        NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (household_id, user_id)
);

CREATE INDEX IF NOT EXISTS household_members_user_id_idx    ON public.household_members(user_id);
CREATE INDEX IF NOT EXISTS household_members_household_idx  ON public.household_members(household_id);

-- ----------------------------------------------------------------
-- 3. TRANSACTIONS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transactions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id     uuid        NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  user_id          uuid        NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  title            text        NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  amount           numeric(12, 2) NOT NULL CHECK (amount > 0),
  type             text        NOT NULL CHECK (type IN ('income', 'expense')),
  category         text        NOT NULL DEFAULT 'Övrigt',
  transaction_date date        NOT NULL DEFAULT current_date,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS transactions_household_id_idx ON public.transactions(household_id);
CREATE INDEX IF NOT EXISTS transactions_user_id_idx      ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS transactions_date_idx         ON public.transactions(transaction_date DESC);

-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================

ALTER TABLE public.households        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions      ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------
-- Helper: is the current user a member of a household?
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_household_member(p_household_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.household_members
    WHERE household_id = p_household_id
      AND user_id      = auth.uid()
  );
$$;

-- Helper: is the current user an owner of a household?
CREATE OR REPLACE FUNCTION public.is_household_owner(p_household_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.household_members
    WHERE household_id = p_household_id
      AND user_id      = auth.uid()
      AND role         = 'owner'
  );
$$;

-- Helper: join a household by invite code (bypasses SELECT RLS on households)
CREATE OR REPLACE FUNCTION public.join_household_by_invite(p_invite_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_household_id uuid;
BEGIN
  SELECT id INTO v_household_id
  FROM public.households
  WHERE invite_code = upper(trim(p_invite_code));

  IF v_household_id IS NULL THEN
    RAISE EXCEPTION 'Invite code not found';
  END IF;

  INSERT INTO public.household_members (household_id, user_id, role)
  VALUES (v_household_id, auth.uid(), 'member')
  ON CONFLICT (household_id, user_id) DO NOTHING;

  RETURN v_household_id;
END;
$$;

-- ----------------------------------------------------------------
-- HOUSEHOLDS policies
-- ----------------------------------------------------------------

-- Members can read their households
CREATE POLICY "households: members can read"
  ON public.households FOR SELECT
  USING (public.is_household_member(id));

-- Any authenticated user can create a household
CREATE POLICY "households: authenticated can create"
  ON public.households FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Only owners can update
CREATE POLICY "households: owners can update"
  ON public.households FOR UPDATE
  USING (public.is_household_owner(id));

-- Only owners can delete
CREATE POLICY "households: owners can delete"
  ON public.households FOR DELETE
  USING (public.is_household_owner(id));

-- ----------------------------------------------------------------
-- HOUSEHOLD_MEMBERS policies
-- ----------------------------------------------------------------

-- Members can see other members of the same household
CREATE POLICY "household_members: members can read"
  ON public.household_members FOR SELECT
  USING (public.is_household_member(household_id));

-- A user can insert themselves (used during create/join)
CREATE POLICY "household_members: self insert"
  ON public.household_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Owners can also insert other members
CREATE POLICY "household_members: owners can insert others"
  ON public.household_members FOR INSERT
  WITH CHECK (public.is_household_owner(household_id));

-- Members can remove themselves; owners can remove anyone
CREATE POLICY "household_members: self or owner can delete"
  ON public.household_members FOR DELETE
  USING (
    user_id = auth.uid()
    OR public.is_household_owner(household_id)
  );

-- Owners can update roles
CREATE POLICY "household_members: owners can update"
  ON public.household_members FOR UPDATE
  USING (public.is_household_owner(household_id));

-- ----------------------------------------------------------------
-- TRANSACTIONS policies
-- ----------------------------------------------------------------

-- Household members can read all transactions in their household
CREATE POLICY "transactions: members can read"
  ON public.transactions FOR SELECT
  USING (public.is_household_member(household_id));

-- Household members can insert transactions
CREATE POLICY "transactions: members can insert"
  ON public.transactions FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND public.is_household_member(household_id)
  );

-- Transaction creator or household owner can update
CREATE POLICY "transactions: creator or owner can update"
  ON public.transactions FOR UPDATE
  USING (
    user_id = auth.uid()
    OR public.is_household_owner(household_id)
  );

-- Transaction creator or household owner can delete
CREATE POLICY "transactions: creator or owner can delete"
  ON public.transactions FOR DELETE
  USING (
    user_id = auth.uid()
    OR public.is_household_owner(household_id)
  );
