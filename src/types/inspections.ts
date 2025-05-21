
// Define types for invoice status and fee types to fix type errors
export type InvoiceStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';
export type FeeType = 'fixed' | 'percentage';
export type InspectionStatus = 'draft' | 'submitted' | 'validated' | 'rejected' | 'completed' | 'awaiting_validation';

import { ValidationStatus } from './validation';

export interface FranchiseInvoice {
  id: string;
  franchise_id: string;
  invoice_number: string;
  amount: number;
  fee_type: FeeType;
  fee_value: number;
  status: InvoiceStatus;
  period_start: string;
  period_end: string;
  invoice_date: string;
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  franchise_name?: string;
  tax_amount: number;
  tax_rate: number | null;
  total_amount: number;
}

export interface ClientInvoice {
  id: string;
  client_id: string;
  franchise_id: string;
  inspection_id: string | null;
  invoice_number: string;
  amount: number;
  status: InvoiceStatus;
  invoice_date: string;
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  client_name?: string;
  vehicle_plate?: string;
  franchise_name?: string;
  tax_amount: number;
  tax_rate: number | null;
  total_amount: number;
  payment_term?: string;
}

export interface NewFranchiseInvoice {
  franchise_id: string;
  fee_type: FeeType;
  fee_value: number;
  amount: number;
  tax_rate: number;
  invoice_date: string;
  due_date: string;
  period_start: string;
  period_end: string;
}

export interface NewClientInvoice {
  client_id: string;
  franchise_id: string;
  inspection_id: string;
  amount: number;
  tax_rate: number;
  invoice_date: string;
  due_date: string;
}

export interface Inspector {
  name: string;
  id: string;
}

export interface InspectionData {
  id: string;
  franchise_id: string;
  client_id?: string;
  inspector_id: string;
  vehicle_id: string;
  status: InspectionStatus;
  notes?: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  submitted_at?: string | null;
  inspector: Inspector;
  supervisor?: { name: string | null; id?: string | null } | null;
  supervisor_id?: string | null;
  franchise?: { name: string; };
  franchise_name?: string;
  vehicle: {
    id: string;
    brand: string;
    model: string;
    year?: number;
    license_plate: string | null;
    client?: {
      name: string;
    } | null;
  };
  client_name?: string;
  report_url: string | null;
  validation_status?: ValidationStatus;
}

export interface InspectionDetail {
  id: string;
  section: string;
  subsection?: string | null;
  item: string;
  status: string;
  comment: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface InspectionStatusHistory {
  id: string;
  inspection_id: string;
  old_status: string | null;
  new_status: string;
  changed_by: string;
  comment: string | null;
  location: { latitude: number; longitude: number } | null;
  created_at: string;
  user_name?: string;
}
