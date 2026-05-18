ALTER TABLE public.sales
ADD COLUMN payout_status text NOT NULL DEFAULT 'pending';

-- Optional: Add a check constraint to ensure only valid statuses are used
ALTER TABLE public.sales
ADD CONSTRAINT valid_payout_status CHECK (payout_status IN ('pending', 'processing', 'paid', 'failed'));