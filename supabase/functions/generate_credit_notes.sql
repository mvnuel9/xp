
CREATE OR REPLACE FUNCTION generate_sample_credit_notes() RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  sample_invoice record;
  admin_id uuid;
  amount numeric;
  tax_amount numeric;
  total_amount numeric; 
BEGIN
  -- Get admin user ID
  SELECT id INTO admin_id FROM public.profiles WHERE role = 'admin' LIMIT 1;
  
  -- For client invoices (generate credit notes for ~10% of invoices)
  FOR sample_invoice IN 
    SELECT * FROM public.invoices 
    WHERE random() < 0.1 AND status = 'paid' AND NOT coalesce(is_credit_note, false)
    ORDER BY random()
    LIMIT 5
  LOOP
    -- Calculate amounts (typically 10-25% of original invoice)
    amount := sample_invoice.amount * (0.1 + random() * 0.15);
    tax_amount := sample_invoice.tax_rate * amount / 100;
    total_amount := amount + tax_amount;
    
    -- Create credit note
    INSERT INTO public.invoices (
      client_id,
      franchise_id,
      invoice_number,
      amount,
      tax_amount,
      total_amount,
      tax_rate,
      status,
      invoice_date,
      due_date,
      is_credit_note,
      parent_invoice_id,
      credit_note_reason
    ) VALUES (
      sample_invoice.client_id,
      sample_invoice.franchise_id,
      'CN-' || substring(gen_random_uuid()::text, 1, 8),
      amount,
      tax_amount,
      total_amount,
      sample_invoice.tax_rate,
      'processed',
      CURRENT_DATE,
      CURRENT_DATE + INTERVAL '30 days',
      true,
      sample_invoice.id,
      (ARRAY['Product return', 'Service issue', 'Billing error', 'Goodwill gesture'])[floor(random() * 4 + 1)]
    );
  END LOOP;
  
  -- For franchise invoices (generate credit notes for ~10% of invoices)
  FOR sample_invoice IN 
    SELECT * FROM public.franchise_invoices 
    WHERE random() < 0.1 AND status = 'paid' AND NOT coalesce(is_credit_note, false)
    ORDER BY random()
    LIMIT 3
  LOOP
    -- Calculate amounts (typically 10-25% of original invoice)
    amount := sample_invoice.amount * (0.1 + random() * 0.15);
    tax_amount := sample_invoice.tax_rate * amount / 100;
    total_amount := amount + tax_amount;
    
    -- Create credit note
    INSERT INTO public.franchise_invoices (
      franchise_id,
      invoice_number,
      amount,
      tax_amount,
      total_amount,
      tax_rate,
      status,
      invoice_date,
      due_date,
      fee_type,
      fee_value,
      is_credit_note,
      parent_invoice_id,
      credit_note_reason
    ) VALUES (
      sample_invoice.franchise_id,
      'FCN-' || substring(gen_random_uuid()::text, 1, 8),
      amount,
      tax_amount,
      total_amount,
      sample_invoice.tax_rate,
      'processed',
      CURRENT_DATE,
      CURRENT_DATE + INTERVAL '30 days',
      sample_invoice.fee_type,
      sample_invoice.fee_value,
      true,
      sample_invoice.id,
      (ARRAY['Franchise fee adjustment', 'Service issue', 'Billing error', 'Contract renegotiation'])[floor(random() * 4 + 1)]
    );
  END LOOP;
  
  -- Create some pending credit note requests
  FOR sample_invoice IN 
    SELECT * FROM public.invoices 
    WHERE random() < 0.1 AND status = 'pending' AND NOT coalesce(is_credit_note, false)
    ORDER BY random()
    LIMIT 5
  LOOP
    -- Insert credit note request
    INSERT INTO public.client_credit_note_requests (
      invoice_id,
      requested_by,
      reason,
      status
    ) VALUES (
      sample_invoice.id,
      admin_id,
      (ARRAY['Disputed charge', 'Service not received', 'Incorrect billing', 'Other reason'])[floor(random() * 4 + 1)],
      (ARRAY['pending', 'approved', 'rejected'])[floor(random() * 3 + 1)]
    );
  END LOOP;
END;
$$;
