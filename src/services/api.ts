import { LeadPayload, AreaZone, MeasurementsResponse, TermsPayload, TermsResponse } from '../types/opschimp';

const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const demoKey = sessionStorage.getItem('opschimp_demo_key');
  const demoUrl = sessionStorage.getItem('opschimp_demo_url');

  if (demoKey && demoKey.trim()) {
    headers['X-Demo-Api-Key'] = demoKey.trim();
  }
  if (demoUrl && demoUrl.trim()) {
    headers['X-Demo-Base-Url'] = demoUrl.trim();
  }

  return headers;
};

export const api = {
  async createLead(payload: LeadPayload): Promise<{ status: string; lead_id: number; correlation_id?: string }> {
    const formattedPayload = {
      first_name: payload.first_name,
      last_name: payload.last_name,
      email: payload.email,
      phone: payload.phone,
      service_type: 'lawn_care',
      address: {
        line1: payload.address_line_1,
        town: payload.city || '',
        postcode: payload.postcode,
        country: 'GB',
      },
      source: {
        utm_source: payload.source || 'website_calculator',
      },
    };

    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(formattedPayload),
    });

    const data = await res.json();
    if (!res.ok) {
      const errDetail = data.errors ? Object.values(data.errors).flat().join(', ') : (data.message || 'Failed to submit contact details.');
      throw new Error(errDetail);
    }
    return data;
  },

  async submitMeasurements(
    leadId: number,
    areas: AreaZone[],
    source = 'maps_helper'
  ): Promise<MeasurementsResponse> {
    const res = await fetch(`/api/leads/${leadId}/measurements`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        areas,
        source,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to calculate dynamic pricing.');
    }
    return data;
  },

  async acceptTerms(leadId: number, payload: TermsPayload): Promise<TermsResponse> {
    const res = await fetch(`/api/leads/${leadId}/terms`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to accept terms and generate card setup link.');
    }
    return data;
  },
};
