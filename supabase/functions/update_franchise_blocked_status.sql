
CREATE OR REPLACE FUNCTION update_franchise_blocked_status() RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  franchise_rec record;
BEGIN
  -- Mark a random ~20% of franchises as blocked
  UPDATE public.franchises
  SET is_blocked = true
  WHERE id IN (
    SELECT id FROM public.franchises
    WHERE coalesce(is_blocked, false) = false
    ORDER BY random()
    LIMIT 2
  );
  
  -- Mark a random franchise as temporarily unblocked 
  UPDATE public.franchises
  SET is_blocked = true,
      temporary_unblock_at = now() + interval '7 days',
      temporary_unblock_by = 'Sample Admin User',
      temporary_unblock_reason = 'Temporary unblock for testing'
  WHERE id IN (
    SELECT id FROM public.franchises
    WHERE coalesce(is_blocked, false) = false
    ORDER BY random()
    LIMIT 1
  );
END;
$$;
