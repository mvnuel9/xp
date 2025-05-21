
export type ValidationStatus = 'pending' | 'approved' | 'rejected' | 'requires_review';

export interface SupervisorValidation {
  id: string;
  inspection_id: string;
  supervisor_id: string;
  status: ValidationStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  franchise_name?: string;
  inspection?: {
    vehicle?: {
      brand: string;
      model: string;
      license_plate: string | null;
    };
    franchise_name?: string;
    created_at: string;
    inspector_id?: string; // Added missing property
    franchise_id?: string; // Added missing property
  }
}

export interface ValidationItem {
  id: string;
  validation_id: string;
  inspection_detail_id: string;
  status: ValidationStatus;
  comment: string | null;
  created_at: string;
  updated_at: string;
  inspection_detail?: {
    section: string;
    item: string;
    status: string;
    comment: string | null;
    photo_url: string | null;
  }
}
