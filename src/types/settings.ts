
export interface SystemSettings {
  default_currency: string;
  default_country: string;
  postal_code_required: boolean;
}

export interface BillingSettings {
  id: string;
  inspection_base_price: number;
  franchise_fee_type: 'fixed' | 'percentage';
  franchise_fee_value: number;
  tax_rate: number;
  created_at: string;
  updated_at: string;
}
