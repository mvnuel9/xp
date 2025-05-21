
CREATE OR REPLACE FUNCTION update_invoice_status_for_testing() RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Mark some client invoices as overdue
  UPDATE public.invoices
  SET status = 'overdue',
      due_date = CURRENT_DATE - interval '45 days'
  WHERE id IN (
    SELECT id FROM public.invoices
    WHERE status = 'pending'
    AND NOT coalesce(is_credit_note, false)
    ORDER BY random()
    LIMIT 5
  );
  
  -- Mark some client invoices as paid 
  UPDATE public.invoices
  SET status = 'paid',
      paid_at = now() - interval '5 days'
  WHERE id IN (
    SELECT id FROM public.invoices
    WHERE status = 'pending'
    AND NOT coalesce(is_credit_note, false)
    ORDER BY random()
    LIMIT 10
  );
  
  -- Mark some franchise invoices as overdue
  UPDATE public.franchise_invoices
  SET status = 'overdue',
      due_date = CURRENT_DATE - interval '45 days'
  WHERE id IN (
    SELECT id FROM public.franchise_invoices
    WHERE status = 'pending'
    AND NOT coalesce(is_credit_note, false)
    ORDER BY random()
    LIMIT 3
  );
  
  -- Mark some franchise invoices as paid
  UPDATE public.franchise_invoices
  SET status = 'paid',
      paid_at = now() - interval '10 days'
  WHERE id IN (
    SELECT id FROM public.franchise_invoices
    WHERE status = 'pending'
    AND NOT coalesce(is_credit_note, false)
    ORDER BY random()
    LIMIT 5
  );
END;
$$;
