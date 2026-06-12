ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tx_ref text;
CREATE INDEX IF NOT EXISTS orders_tx_ref_idx ON public.orders (tx_ref);