export interface LeadPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  postcode: string;
  address_line_1: string;
  city?: string;
  source?: string;
}

export interface AreaZone {
  name: string;
  size: number;
  is_hard_surface: boolean;
  active: boolean;
}

export interface TreatmentItem {
  id: number;
  name: string;
  price: number;
  multiplier: number;
  annual_visit_count: number;
  is_included_in_subscription: boolean;
}

export interface BundleTreatment {
  id: number;
  name: string;
  unit_price: number;
  visits_per_year: number;
  billing_mode: string;
  is_recurring: boolean;
  annual_price: number;
  description?: string | null;
}

export interface AddonBundle {
  bundle_name: string;
  availability: string;
  discount_percent: number;
  standard_annual_price: number;
  bundle_annual_price: number;
  bundle_savings: number;
  monthly_subscription_addition: number;
  payg_annual_price?: number;
  callout?: string;
  treatment_ids?: number[];
  treatments?: BundleTreatment[];
}

export interface PackageCampaign {
  id: string;
  name: string;
  is_active: boolean;
  badge?: string | null;
  tagline?: string | null;
  selling_points?: string[];
  start_date?: string | null;
  end_date?: string | null;
  bundles?: AddonBundle[];
}

export interface PackageItem {
  package_id: number;
  package_name: string;
  description?: string | null;
  display_color?: string;
  status: string;
  annual_visit_count: number;
  monthly_direct_debit_value: number;
  direct_debit_annual: number;
  pay_as_you_go_annual: number;
  savings: number;
  pricing_range?: {
    sqm_from: number;
    sqm_to?: number;
    price: number;
  };
  treatments: TreatmentItem[];
  available_addons: AddonBundle[];
  campaigns: PackageCampaign[];
}

export interface MeasurementsResponse {
  status: string;
  lead_id: number;
  quote_id: string;
  quote_number: string;
  lawn_size_sqm: number;
  total_lawn_size_sqm: number;
  total_hard_surface_sqm: number;
  areas: AreaZone[];
  measurement_source: string;
  service_area_available: boolean;
  pricing_range?: {
    sqm_from: number;
    sqm_to?: number;
    base_price: number;
  };
  packages: PackageItem[];
  available_addons: AddonBundle[];
}

export interface TermsPayload {
  package_id: number;
  plan_name: string;
  price: number;
  selected_bundles: string[];
  selected_addons: number[];
  billing_frequency: 'monthly' | 'annual';
  terms_accepted: boolean;
  terms_version: string;
  terms_timestamp: string;
}

export interface TermsResponse {
  status: string;
  lead_id: number;
  quote_id: string;
  card_setup_url: string;
  expires_at: string;
}
